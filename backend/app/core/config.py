from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Centralized configuration loaded from environment variables.
    In Docker: variables come from docker-compose env_file (../.env).
    In local dev: pydantic-settings reads .env automatically.
    """

    # ── General ──────────────────────────────────────────────
    PROJECT_NAME: str = "Sentra AI Gateway"
    API_V1_STR: str = "/api/v1"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # ── Supabase ─────────────────────────────────────────────
    NEXT_PUBLIC_SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_JWT_SECRET: str = ""

    # ── Database (Supabase Postgres) ─────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/postgres"
    REDIS_URL: str = "redis://localhost:6379/0"

    # ── Security Thresholds ──────────────────────────────────
    PROMPT_INJECTION_BLOCK_THRESHOLD: float = 0.85
    PROMPT_INJECTION_SANITIZE_THRESHOLD: float = 0.60
    SEMANTIC_CACHE_SIMILARITY_THRESHOLD: float = 0.92

    # ── LLM Providers ────────────────────────────────────────
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    OLLAMA_BASE_URL: str = "http://localhost:11434"

    # ── CORS ─────────────────────────────────────────────────
    # Stored as a comma-separated string; use the property below in code.
    # e.g. BACKEND_CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
    BACKEND_CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    @property
    def cors_origins(self) -> List[str]:
        """Returns CORS origins as a list, split from comma-separated string."""
        return [o.strip() for o in self.BACKEND_CORS_ORIGINS.split(",") if o.strip()]

    model_config = {
        "case_sensitive": True,
        "env_file": ".env",
        "env_file_encoding": "utf-8",
    }


settings = Settings()
