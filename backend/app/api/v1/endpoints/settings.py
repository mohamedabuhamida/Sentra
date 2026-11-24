from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from typing import Optional
from ....core.config import settings
from ....core.auth import require_admin, AuthenticatedUser

router = APIRouter()

class SettingsUpdateRequest(BaseModel):
    block_threshold: Optional[float] = Field(None, ge=0.0, le=1.0)
    sanitize_threshold: Optional[float] = Field(None, ge=0.0, le=1.0)
    cache_threshold: Optional[float] = Field(None, ge=0.0, le=1.0)
    timeout_sla_ms: Optional[int] = Field(None, ge=100)

@router.get("")
async def get_system_settings():
    """Return active runtime configurations and security thresholds."""
    return {
        "block_threshold": settings.PROMPT_INJECTION_BLOCK_THRESHOLD,
        "sanitize_threshold": settings.PROMPT_INJECTION_SANITIZE_THRESHOLD,
        "cache_threshold": settings.SEMANTIC_CACHE_SIMILARITY_THRESHOLD,
        "environment": settings.ENVIRONMENT,
        "debug": settings.DEBUG,
        "api_v1_str": settings.API_V1_STR,
    }

@router.post("")
async def update_system_settings(
    req: SettingsUpdateRequest,
    admin: AuthenticatedUser = Depends(require_admin),
):
    """Update runtime configurations dynamically without server reboot."""
    if req.block_threshold is not None:
        settings.PROMPT_INJECTION_BLOCK_THRESHOLD = req.block_threshold
    if req.sanitize_threshold is not None:
        settings.PROMPT_INJECTION_SANITIZE_THRESHOLD = req.sanitize_threshold
    if req.cache_threshold is not None:
        settings.SEMANTIC_CACHE_SIMILARITY_THRESHOLD = req.cache_threshold

    return {
        "status": "updated",
        "settings": {
            "block_threshold": settings.PROMPT_INJECTION_BLOCK_THRESHOLD,
            "sanitize_threshold": settings.PROMPT_INJECTION_SANITIZE_THRESHOLD,
            "cache_threshold": settings.SEMANTIC_CACHE_SIMILARITY_THRESHOLD,
        },
    }
