import uuid
import time
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from ....database.session import get_db
from ....providers.base import llm_service
from ....core.config import settings
from ....core.auth import require_admin, AuthenticatedUser
from ....core.crypto import encrypt_secret, decrypt_secret, mask_secret

router = APIRouter()


class ProviderUpdateRequest(BaseModel):
    is_active: Optional[bool] = None
    priority: Optional[int] = None
    cost_per_1k_tokens: Optional[float] = None
    base_url: Optional[str] = None
    display_name: Optional[str] = None
    default_model: Optional[str] = None
    api_key: Optional[str] = None  # Non-empty sets/rotates key; "" clears DB key; None leaves unchanged


class ProviderCreateRequest(BaseModel):
    name: str
    display_name: str
    priority: int = 1
    cost_per_1k_tokens: float = 0.002
    base_url: Optional[str] = None
    default_model: Optional[str] = None
    is_active: bool = True
    api_key: Optional[str] = None


async def _ensure_provider_columns(db: AsyncSession) -> None:
    try:
        await db.execute(text(
            "ALTER TABLE public.llm_providers ADD COLUMN IF NOT EXISTS api_key_encrypted TEXT;"
        ))
        await db.execute(text(
            "ALTER TABLE public.llm_providers ADD COLUMN IF NOT EXISTS default_model VARCHAR(120);"
        ))
        await db.commit()
    except Exception:
        await db.rollback()


def _default_model_for_provider(name: str) -> str:
    n = (name or "").lower()
    if "openai" in n:
        return "gpt-4o"
    if "gemini" in n or "google" in n:
        return "gemini-2.5-flash"
    if "anthropic" in n or "claude" in n:
        return "claude-3-5-sonnet-20241022"
    if "ollama" in n:
        return "llama3"
    return ""


def _env_key_for_provider(name: str) -> str:
    n = (name or "").lower()
    if "openai" in n:
        return settings.OPENAI_API_KEY.strip()
    if "gemini" in n or "google" in n:
        return settings.GEMINI_API_KEY.strip()
    if "anthropic" in n or "claude" in n:
        return settings.ANTHROPIC_API_KEY.strip()
    return ""


@router.get("")
async def list_providers(db: AsyncSession = Depends(get_db)):
    """Fetch registered LLM providers with masked API key status (never exposes raw secrets)."""
    await _ensure_provider_columns(db)
    try:
        res = await db.execute(text("""
            SELECT id, name, display_name, base_url, is_active, priority,
                   cost_per_1k_tokens, avg_latency_ms, success_rate, api_key_encrypted, default_model
            FROM public.llm_providers
            ORDER BY priority ASC, name ASC;
        """))
        rows = res.fetchall()
        if rows:
            out = []
            for r in rows:
                db_plain = decrypt_secret(r[9] or "") if r[9] else ""
                env_plain = _env_key_for_provider(r[1])
                if db_plain:
                    key_source = "database"
                    masked = mask_secret(db_plain)
                elif env_plain:
                    key_source = "env"
                    masked = mask_secret(env_plain)
                else:
                    key_source = "none"
                    masked = ""

                out.append({
                    "id": str(r[0]),
                    "name": r[1],
                    "display_name": r[2],
                    "base_url": r[3],
                    "is_active": bool(r[4]),
                    "priority": int(r[5]),
                    "cost_per_1k_tokens": float(r[6] or 0.0),
                    "avg_latency_ms": float(r[7] or 0.0),
                    "success_rate": float(r[8] or 1.0),
                    "has_api_key": bool(db_plain or env_plain),
                    "api_key_source": key_source,
                    "api_key_masked": masked,
                    "default_model": r[10] or _default_model_for_provider(r[1]),
                })
            return out
    except Exception:
        pass

    return []


@router.patch("/{provider_id}")
async def update_provider(
    provider_id: str,
    req: ProviderUpdateRequest,
    admin: AuthenticatedUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Update provider active state, priority, cost SLA, default model, or encrypted API key (Admin only)."""
    await _ensure_provider_columns(db)
    updates = []
    params = {"id": provider_id}

    if req.is_active is not None:
        updates.append("is_active = :is_active")
        params["is_active"] = req.is_active
    if req.priority is not None:
        updates.append("priority = :priority")
        params["priority"] = req.priority
    if req.cost_per_1k_tokens is not None:
        updates.append("cost_per_1k_tokens = :cost_per_1k_tokens")
        params["cost_per_1k_tokens"] = req.cost_per_1k_tokens
    if req.base_url is not None:
        updates.append("base_url = :base_url")
        params["base_url"] = req.base_url
    if req.display_name is not None:
        updates.append("display_name = :display_name")
        params["display_name"] = req.display_name
    if req.default_model is not None:
        cleaned_model = req.default_model.strip()
        if cleaned_model:
            updates.append("default_model = :default_model")
            params["default_model"] = cleaned_model
        else:
            updates.append("default_model = NULL")
    if req.api_key is not None:
        cleaned = req.api_key.strip()
        if cleaned:
            updates.append("api_key_encrypted = :api_key_encrypted")
            params["api_key_encrypted"] = encrypt_secret(cleaned)
        else:
            updates.append("api_key_encrypted = NULL")

    if not updates:
        return {"status": "no_changes"}

    updates.append("updated_at = NOW()")
    sql = f"UPDATE public.llm_providers SET {', '.join(updates)} WHERE id::text = :id OR name = :id RETURNING id, name, is_active, priority;"

    try:
        res = await db.execute(text(sql), params)
        await db.commit()
        row = res.fetchone()
        if row:
            return {"status": "updated", "id": str(row[0]), "name": row[1], "is_active": row[2], "priority": row[3]}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=f"Update failed: {e}")

    raise HTTPException(status_code=404, detail="Provider not found")


@router.post("")
async def create_provider(
    req: ProviderCreateRequest,
    admin: AuthenticatedUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Register a new LLM provider with optional encrypted API key (Admin only)."""
    await _ensure_provider_columns(db)
    new_id = str(uuid.uuid4())
    encrypted = encrypt_secret(req.api_key.strip()) if (req.api_key and req.api_key.strip()) else None
    default_model = req.default_model.strip() if (req.default_model and req.default_model.strip()) else None
    try:
        await db.execute(text("""
            INSERT INTO public.llm_providers (id, name, display_name, base_url, is_active, priority, cost_per_1k_tokens, api_key_encrypted, default_model)
            VALUES (:id, :name, :display_name, :base_url, :is_active, :priority, :cost_per_1k_tokens, :api_key_encrypted, :default_model);
        """), {
            "id": new_id,
            "name": req.name.lower().strip(),
            "display_name": req.display_name.strip(),
            "base_url": req.base_url,
            "is_active": req.is_active,
            "priority": req.priority,
            "cost_per_1k_tokens": req.cost_per_1k_tokens,
            "api_key_encrypted": encrypted,
            "default_model": default_model,
        })
        await db.commit()
        return {"status": "created", "id": new_id, "name": req.name}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=f"Could not register provider: {e}")


@router.delete("/{provider_id}")
async def delete_provider(
    provider_id: str,
    admin: AuthenticatedUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Delete an LLM provider by ID or name (Admin only)."""
    await _ensure_provider_columns(db)
    try:
        res = await db.execute(
            text("DELETE FROM public.llm_providers WHERE id::text = :id OR name = :id RETURNING id;"),
            {"id": provider_id},
        )
        await db.commit()
        row = res.fetchone()
        if row:
            return {"status": "deleted", "id": provider_id}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=f"Delete failed: {e}")

    raise HTTPException(status_code=404, detail="Provider not found")


@router.post("/{name}/ping")
async def ping_provider(name: str):
    """Test live connectivity and latency for a given provider."""
    start = time.perf_counter()
    try:
        comp, tokens, lat = await llm_service.execute(
            prompt="Sentra ping probe",
            provider=name,
            model="default",
            max_tokens=10,
        )
        return {
            "provider": name,
            "status": "healthy",
            "latency_ms": round(lat, 2),
            "sample_response": comp[:50],
        }
    except Exception as e:
        return {
            "provider": name,
            "status": "degraded",
            "latency_ms": round((time.perf_counter() - start) * 1000, 2),
            "error": str(e),
        }
