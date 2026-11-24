import uuid
import secrets
import hashlib
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from ....database.session import get_db
from ....core.auth import require_user, AuthenticatedUser

router = APIRouter()


class ApiKeyCreateRequest(BaseModel):
    name: str
    scope: str = "read_write"


async def _get_db_role(db: AsyncSession, user_id: str) -> str:
    res = await db.execute(
        text("SELECT role FROM public.user_profiles WHERE id::text = :uid LIMIT 1;"),
        {"uid": str(user_id)},
    )
    row = res.fetchone()
    return (row[0] or "viewer").lower() if row else "viewer"


@router.get("")
async def list_api_keys(
    user: AuthenticatedUser = Depends(require_user),
    db: AsyncSession = Depends(get_db),
):
    """Admins see all API keys; regular users/viewers see only their own API keys."""
    role = await _get_db_role(db, user.id)
    if role == "admin":
        res = await db.execute(text("""
            SELECT id, name, key_prefix, scope, is_active, last_used_at, created_at, user_id
            FROM public.api_keys
            ORDER BY created_at DESC;
        """))
    else:
        res = await db.execute(text("""
            SELECT id, name, key_prefix, scope, is_active, last_used_at, created_at, user_id
            FROM public.api_keys
            WHERE user_id::text = :uid
            ORDER BY created_at DESC;
        """), {"uid": str(user.id)})

    rows = res.fetchall()
    return [
        {
            "id": str(r[0]),
            "name": r[1],
            "key_prefix": r[2],
            "scope": r[3] or "Inference Only",
            "is_active": bool(r[4]),
            "last_used_at": r[5].isoformat() if r[5] else None,
            "created_at": r[6].isoformat() if r[6] else None,
            "user_id": str(r[7]) if r[7] else None,
        }
        for r in rows
    ]


@router.post("")
async def create_api_key(
    req: ApiKeyCreateRequest,
    user: AuthenticatedUser = Depends(require_user),
    db: AsyncSession = Depends(get_db),
):
    """Any authenticated user can create an API key for their own account."""
    role = await _get_db_role(db, user.id)
    allowed_scopes = {"read_only", "read_write", "admin"} if role == "admin" else {"read_only", "read_write"}
    scope = req.scope if req.scope in allowed_scopes else "read_write"

    key_id = str(uuid.uuid4())
    raw_secret = f"sk_live_sentra_{secrets.token_hex(16)}"
    prefix = f"{raw_secret[:19]}****************{raw_secret[-2:]}"
    hashed = hashlib.sha256(raw_secret.encode("utf-8")).hexdigest()

    await db.execute(text("""
        INSERT INTO public.api_keys (id, user_id, name, key_prefix, hashed_key, scope, is_active)
        VALUES (:id, :user_id, :name, :key_prefix, :hashed_key, :scope, true);
    """), {
        "id": key_id,
        "user_id": user.id,
        "name": req.name.strip(),
        "key_prefix": prefix,
        "hashed_key": hashed,
        "scope": scope,
    })
    await db.commit()

    return {
        "status": "created",
        "id": key_id,
        "name": req.name.strip(),
        "key_prefix": prefix,
        "secret_key": raw_secret,
        "scope": scope,
        "is_active": True,
    }


@router.patch("/{key_id}/revoke")
async def revoke_api_key(
    key_id: str,
    user: AuthenticatedUser = Depends(require_user),
    db: AsyncSession = Depends(get_db),
):
    """Users can revoke their own keys; admins can revoke any key."""
    role = await _get_db_role(db, user.id)
    if role == "admin":
        res = await db.execute(
            text("UPDATE public.api_keys SET is_active = false WHERE id::text = :id RETURNING id;"),
            {"id": key_id},
        )
    else:
        res = await db.execute(
            text("UPDATE public.api_keys SET is_active = false WHERE id::text = :id AND user_id::text = :uid RETURNING id;"),
            {"id": key_id, "uid": str(user.id)},
        )
    await db.commit()
    if not res.fetchone():
        raise HTTPException(status_code=404, detail="API key not found or not owned by you")
    return {"status": "revoked", "id": key_id}


@router.delete("/{key_id}")
async def delete_api_key(
    key_id: str,
    user: AuthenticatedUser = Depends(require_user),
    db: AsyncSession = Depends(get_db),
):
    """Users can delete their own keys; admins can delete any key."""
    role = await _get_db_role(db, user.id)
    if role == "admin":
        res = await db.execute(
            text("DELETE FROM public.api_keys WHERE id::text = :id RETURNING id;"),
            {"id": key_id},
        )
    else:
        res = await db.execute(
            text("DELETE FROM public.api_keys WHERE id::text = :id AND user_id::text = :uid RETURNING id;"),
            {"id": key_id, "uid": str(user.id)},
        )
    await db.commit()
    if not res.fetchone():
        raise HTTPException(status_code=404, detail="API key not found or not owned by you")
    return {"status": "deleted", "id": key_id}
