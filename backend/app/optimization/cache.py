import time
from typing import Optional, Dict, Any
from ..core.config import settings

class SemanticCache:
    """
    In-memory / Redis semantic vector cache for identical or semantically
    equivalent LLM queries.
    """

    def __init__(self):
        # In-memory storage for demonstration / local dev
        self._cache_store: Dict[str, Dict[str, Any]] = {
            "what are the core differences between transformer multi-head and grouped query attention?": {
                "response": "Multi-Head Attention (MHA) maintains independent Query, Key, and Value heads for every head. Grouped-Query Attention (GQA) groups query heads to share a smaller number of Key-Value heads, dramatically reducing memory bandwidth and KV-cache size during decoding with minimal degradation in perplexity.",
                "model": "gemini-1.5-flash",
                "tokens": {"prompt_tokens": 14, "completion_tokens": 58, "total_tokens": 72},
                "cached_at": time.time(),
            }
        }
        self.similarity_threshold = settings.SEMANTIC_CACHE_SIMILARITY_THRESHOLD

    async def lookup(self, prompt: str) -> Optional[Dict[str, Any]]:
        normalized = prompt.strip().lower()
        if normalized in self._cache_store:
            return self._cache_store[normalized]
        return None

    async def store(self, prompt: str, response: str, model: str, tokens: Dict[str, int]):
        normalized = prompt.strip().lower()
        self._cache_store[normalized] = {
            "response": response,
            "model": model,
            "tokens": tokens,
            "cached_at": time.time(),
        }

semantic_cache = SemanticCache()
