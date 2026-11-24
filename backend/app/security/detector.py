import os
import re
import time
import pickle
import logging
import warnings
from typing import Tuple, Optional

try:
    from sklearn.exceptions import InconsistentVersionWarning
    warnings.filterwarnings("ignore", category=InconsistentVersionWarning)
except Exception:
    pass

try:
    from ..core.config import settings
    DEFAULT_BLOCK_THRESHOLD = getattr(settings, "PROMPT_INJECTION_BLOCK_THRESHOLD", 0.85)
    DEFAULT_SANITIZE_THRESHOLD = getattr(settings, "PROMPT_INJECTION_SANITIZE_THRESHOLD", 0.60)
except Exception:
    DEFAULT_BLOCK_THRESHOLD = 0.85
    DEFAULT_SANITIZE_THRESHOLD = 0.60

from ..models.schemas import SecurityCheckResult

logger = logging.getLogger("sentra.security.detector")


class PromptInjectionDetector:
    """
    Intelligent cybersecurity layer analyzing prompts for injections,
    jailbreaks, system prompt leaks, and adversarial perturbations.

    Dual-Layer Defense Architecture:
    1. Fast Regex Pattern Signature Scan: sub-millisecond deterministic blocking of known attack strings.
    2. ML Classification Scoring: TF-IDF + Logistic Regression probabilistic risk estimation for zero-day/novel attacks.
    """

    KNOWN_ATTACK_PATTERNS = [
        (r"(?i)ignore\s+(all\s+)?(previous|prior)\s+(instructions|directives|prompts)", "Direct Instruction Override"),
        (r"(?i)disregard\s+(the\s+)?(previous|rules|guidelines)", "Direct Instruction Override"),
        (r"(?i)you\s+are\s+now\s+(unrestricted|DAN|jailbreak)", "Jailbreak / Roleplay Bypass"),
        (r"(?i)do\s+anything\s+now", "Jailbreak / Roleplay Bypass"),
        (r"(?i)(reveal|dump|print|output|display)\s+(your\s+)?(system\s+prompt|developer\s+mode|internal\s+instructions)", "System Prompt Extraction"),
        (r"(?i)you\s+are\s+no\s+longer\s+(an\s+AI|restricted|bound)", "Role Confusion / Manipulation"),
        (r"(?i)bypass\s+(content\s+filter|safety\s+filter|guardrails)", "Safety Boundary Bypass"),
    ]

    def __init__(self, block_threshold: Optional[float] = None, sanitize_threshold: Optional[float] = None):
        self.block_threshold = block_threshold if block_threshold is not None else DEFAULT_BLOCK_THRESHOLD
        self.sanitize_threshold = sanitize_threshold if sanitize_threshold is not None else DEFAULT_SANITIZE_THRESHOLD
        self.weights_path = os.path.join(os.path.dirname(__file__), "weights", "baseline_model.pkl")
        self.model = self._load_model()

    def _load_model(self):
        """Loads serialized ML pipeline weights if available."""
        if not os.path.exists(self.weights_path):
            logger.warning(f"ML baseline model not found at {self.weights_path}. Operating in fallback mode.")
            return None
        try:
            with open(self.weights_path, "rb") as f:
                model = pickle.load(f)
            logger.info(f"Loaded prompt injection ML baseline model from {self.weights_path}")
            return model
        except Exception as e:
            logger.error(f"Failed to load ML model from {self.weights_path}: {e}")
            return None

    def _classify_attack_type(self, prompt: str) -> str:
        """Categorizes attack type based on prompt semantics."""
        lowered = prompt.lower()
        if any(tok in lowered for tok in ["system prompt", "developer instructions", "api key", "secret token", "dump"]):
            return "System Prompt Extraction"
        elif any(tok in lowered for tok in ["dan", "do anything now", "unrestricted", "developer mode", "evil ai", "jailbreak"]):
            return "Jailbreak / Roleplay Bypass"
        elif any(tok in lowered for tok in ["ignore", "disregard", "override", "forget your"]):
            return "Direct Instruction Override"
        elif any(tok in lowered for tok in ["bypass", "filter", "guardrail", "safety guideline"]):
            return "Safety Boundary Bypass"
        return "Prompt Injection (ML Classifier)"

    async def scan(self, prompt: str) -> SecurityCheckResult:
        """
        Executes dual-layer defense scan on the inbound prompt:
        Layer 1: Fast regex signature matching (< 1ms)
        Layer 2: ML TF-IDF classification scoring
        """
        start_time = time.perf_counter()

        # ── Layer 1: Fast Pattern Signature Scan ──────────────────
        for pattern, attack_name in self.KNOWN_ATTACK_PATTERNS:
            if re.search(pattern, prompt):
                latency_ms = (time.perf_counter() - start_time) * 1000
                return SecurityCheckResult(
                    is_safe=False,
                    risk_score=0.96,
                    confidence=0.98,
                    attack_type=attack_name,
                    action="BLOCK",
                    latency_ms=round(latency_ms, 2),
                )

        # ── Layer 2: ML Classification Scoring ───────────────────
        if self.model is not None:
            try:
                prob = float(self.model.predict_proba([prompt])[0, 1])
                risk_score = round(prob, 3)

                if risk_score >= self.block_threshold:
                    action = "BLOCK"
                    is_safe = False
                    attack_type = self._classify_attack_type(prompt)
                    confidence = round(max(0.90, risk_score), 2)
                elif risk_score >= self.sanitize_threshold:
                    action = "SANITIZE"
                    is_safe = False
                    attack_type = "Potential Adversarial Prompt"
                    confidence = round(risk_score, 2)
                else:
                    action = "ALLOW"
                    is_safe = True
                    attack_type = None
                    confidence = round(max(0.90, 1.0 - risk_score), 2)

                latency_ms = (time.perf_counter() - start_time) * 1000
                return SecurityCheckResult(
                    is_safe=is_safe,
                    risk_score=risk_score,
                    confidence=confidence,
                    attack_type=attack_type,
                    action=action,
                    latency_ms=round(latency_ms, 2),
                )
            except Exception as e:
                logger.error(f"Error during ML model inference: {e}")

        # ── Fallback: Heuristic Semantic Risk Scoring ─────────────
        risk_score = 0.02
        attack_type: Optional[str] = None

        lowered = prompt.lower()
        suspicious_tokens = ["system prompt", "jailbreak", "override", "bypass", "unfiltered", "act as root"]
        matched_tokens = [tok for tok in suspicious_tokens if tok in lowered]

        if matched_tokens:
            risk_score = min(0.40 + len(matched_tokens) * 0.25, 0.95)
            attack_type = "Potential Adversarial Heuristic"

        action = "ALLOW"
        if risk_score >= self.block_threshold:
            action = "BLOCK"
        elif risk_score >= self.sanitize_threshold:
            action = "SANITIZE"

        latency_ms = (time.perf_counter() - start_time) * 1000

        return SecurityCheckResult(
            is_safe=(action == "ALLOW"),
            risk_score=round(risk_score, 3),
            confidence=0.94,
            attack_type=attack_type if action != "ALLOW" else None,
            action=action,
            latency_ms=round(latency_ms, 2),
        )


detector = PromptInjectionDetector()
