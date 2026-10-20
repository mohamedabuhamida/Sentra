import re
from ..models.schemas import AnalysisResult

class RequestAnalyzer:
    """
    Extracts structural, semantic, and complexity characteristics from incoming prompts
    to feed into the intelligent model routing engine.
    """

    def analyze(self, prompt: str) -> AnalysisResult:
        token_estimate = max(1, len(prompt.split()) * 4 // 3)
        lowered = prompt.lower()

        # Task type classification
        if any(w in lowered for w in ["def ", "class ", "import ", "python", "javascript", "refactor", "bug", "code", "sql", "api"]):
            task_type = "Code Generation & Technical"
            complexity = "High" if token_estimate > 100 else "Medium"
        elif any(w in lowered for w in ["financial", "balance sheet", "ebitda", "sec filing", "quarterly", "contract", "legal"]):
            task_type = "Financial & Document Analysis"
            complexity = "High"
        elif any(w in lowered for w in ["translate", "spanish", "arabic", "french", "german"]):
            task_type = "Document Translation"
            complexity = "Medium"
        elif any(w in lowered for w in ["summarize", "tldr", "synopsis", "overview"]):
            task_type = "Summarization"
            complexity = "Medium"
        else:
            task_type = "Question Answering / General"
            complexity = "Low" if token_estimate < 80 else "Medium"

        # Check for non-ascii characters (e.g. Arabic, Chinese, Russian)
        has_arabic = bool(re.search(r"[\u0600-\u06FF]", prompt))
        language = "Arabic" if has_arabic else "English"

        requires_long_context = token_estimate > 1500

        return AnalysisResult(
            task_type=task_type,
            complexity=complexity,
            estimated_prompt_tokens=token_estimate,
            language=language,
            requires_long_context=requires_long_context,
        )

analyzer = RequestAnalyzer()
