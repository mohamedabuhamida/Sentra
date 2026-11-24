from typing import Dict, Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from ....database.session import get_db
from ....core.auth import require_user, AuthenticatedUser

router = APIRouter()


class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    provider_priorities: Optional[Dict[str, int]] = None


async def _ensure_profile_column(db: AsyncSession) -> None:
    try:
        await db.execute(text(
            "ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS provider_priorities JSONB DEFAULT '{}'::jsonb;"
        ))
        await db.commit()
    except Exception:
        await db.rollback()


@router.get("")
async def get_my_profile(
    user: AuthenticatedUser = Depends(require_user),
    db: AsyncSession = Depends(get_db),
):
    """Return the authenticated user's real profile, role, and per-profile provider priorities."""
    await _ensure_profile_column(db)
    res = await db.execute(text("""
        SELECT id, email, full_name, role, is_active, COALESCE(provider_priorities, '{}'::jsonb)
        FROM public.user_profiles
        WHERE id::text = :uid
        LIMIT 1;
    """), {"uid": str(user.id)})
    row = res.fetchone()

    if not row:
        # Auto-create viewer profile if missing
        await db.execute(text("""
            INSERT INTO public.user_profiles (id, email, full_name, role, is_active, provider_priorities)
            VALUES (:id, :email, :full_name, 'viewer', true, '{}'::jsonb)
            ON CONFLICT (id) DO NOTHING;
        """), {
            "id": str(user.id),
            "email": user.email,
            "full_name": user.email.split("@")[0] if user.email else "User",
        })
        await db.commit()
        return {
            "id": str(user.id),
            "email": user.email,
            "full_name": user.email.split("@")[0] if user.email else "User",
            "role": "viewer",
            "is_active": True,
            "provider_priorities": {},
        }

    return {
        "id": str(row[0]),
        "email": row[1],
        "full_name": row[2] or "",
        "role": (row[3] or "viewer").lower(),
        "is_active": bool(row[4]),
        "provider_priorities": dict(row[5] or {}),
    }


@router.patch("")
async def update_my_profile(
    req: ProfileUpdateRequest,
    user: AuthenticatedUser = Depends(require_user),
    db: AsyncSession = Depends(get_db),
):
    """Allow any authenticated user to update their own profile name and per-profile provider priorities."""
    import json
    await _ensure_profile_column(db)

    updates = []
    params = {"uid": str(user.id)}

    if req.full_name is not None:
        updates.append("full_name = :full_name")
        params["full_name"] = req.full_name.strip()

    if req.provider_priorities is not None:
        updates.append("provider_priorities = CAST(:priorities AS jsonb)")
        params["priorities"] = json.dumps(req.provider_priorities)

    if not updates:
        return {"status": "no_changes"}

    updates.append("updated_at = NOW()")
    res = await db.execute(text(f"""
        UPDATE public.user_profiles
        SET {', '.join(updates)}
        WHERE id::text = :uid
        RETURNING id, email, full_name, role, provider_priorities;
    """), params)
    await db.commit()
    row = res.fetchone()
    if not row:
        return {"status": "not_found"}

    return {
        "status": "updated",
        "profile": {
            "id": str(row[0]),
            "email": row[1],
            "full_name": row[2] or "",
            "role": (row[3] or "viewer").lower(),
            "provider_priorities": dict(row[4] or {}),
        },
    }
