from typing import Tuple, List
from ..models.schemas import AnalysisResult

class ModelRouter:
    """
    Intelligent Model Router that selects the best LLM provider and model
    based on task type, complexity, latency SLA, and cost constraints.
    """

    MODEL_COSTS = {
        "gpt-4o": 0.0050,
        "gpt-4o-mini": 0.0006,
        "claude-3-5-sonnet": 0.0030,
        "gemini-1.5-pro": 0.0025,
        "gemini-1.5-flash": 0.0005,
        "llama-3-8b": 0.0000,
    }

    def route(
        self,
        analysis: AnalysisResult,
        strategy: str = "multi-objective",
        preferred_model: str = None
    ) -> Tuple[str, str, List[str]]:
        """
        Returns: (provider_name, model_name, fallback_chain)
        """
        if preferred_model and preferred_model in self.MODEL_COSTS:
            return self._resolve_provider(preferred_model), preferred_model, ["gemini-1.5-flash", "llama-3-8b"]

        # Strategy 1: Aggressive Cost Minimizer
        if strategy == "cost":
            if analysis.complexity == "Low":
                return "google", "gemini-1.5-flash", ["llama-3-8b", "gpt-4o-mini"]
            return "google", "gemini-1.5-flash", ["gpt-4o-mini", "llama-3-8b"]

        # Strategy 2: Maximum Quality Frontier
        if strategy == "quality":
            if "Code" in analysis.task_type:
                return "openai", "gpt-4o", ["claude-3-5-sonnet", "gemini-1.5-pro"]
            return "anthropic", "claude-3-5-sonnet", ["gpt-4o", "gemini-1.5-pro"]

        # Strategy 3: Multi-Objective (Default)
        if "Financial" in analysis.task_type or analysis.requires_long_context:
            return "anthropic", "claude-3-5-sonnet", ["gpt-4o", "gemini-1.5-pro"]
        elif "Code" in analysis.task_type:
            return "openai", "gpt-4o", ["claude-3-5-sonnet", "llama-3-8b"]
        elif analysis.complexity == "Low":
            return "google", "gemini-1.5-flash", ["llama-3-8b", "gpt-4o-mini"]
        else:
            return "google", "gemini-1.5-flash", ["gpt-4o-mini", "claude-3-5-sonnet"]

    def _resolve_provider(self, model: str) -> str:
        if "gpt" in model:
            return "openai"
        elif "claude" in model:
            return "anthropic"
        elif "gemini" in model:
            return "google"
        elif "llama" in model:
            return "ollama"
        return "openai"

router = ModelRouter()
