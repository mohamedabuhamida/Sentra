import re
import time
from typing import Tuple, Optional
from ..core.config import settings
from ..models.schemas import SecurityCheckResult

class PromptInjectionDetector:
    """
    Intelligent cybersecurity layer analyzing prompts for injections,
    jailbreaks, system prompt leaks, and adversarial perturbations.
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

    def __init__(self):
        self.block_threshold = settings.PROMPT_INJECTION_BLOCK_THRESHOLD
        self.sanitize_threshold = settings.PROMPT_INJECTION_SANITIZE_THRESHOLD

    async def scan(self, prompt: str) -> SecurityCheckResult:
        start_time = time.perf_counter()

        # 1. Fast Pattern Signature Scan
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

        # 2. Heuristic Semantic Risk Scoring
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
