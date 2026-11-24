import uuid
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from ....database.session import get_db
from ....core.auth import require_admin, AuthenticatedUser

router = APIRouter()


class RoutingRuleCreate(BaseModel):
    name: str
    description: Optional[str] = None
    priority: int = 10
    match_task_type: List[str] = []
    match_keywords: List[str] = []
    min_complexity: Optional[str] = None
    force_model: Optional[str] = None
    routing_strategy: str = "multi-objective"
    is_active: bool = True


class RoutingRuleUpdate(BaseModel):
    is_active: Optional[bool] = None
    priority: Optional[int] = None
    routing_strategy: Optional[str] = None
    force_model: Optional[str] = None
    description: Optional[str] = None


@router.get("")
async def list_routing_rules(db: AsyncSession = Depends(get_db)):
    """List all routing rules from public.routing_rules."""
    res = await db.execute(text("""
        SELECT id, name, description, is_active, priority, match_task_type,
               match_keywords, min_complexity, force_model, routing_strategy, created_at
        FROM public.routing_rules
        ORDER BY priority ASC, created_at DESC;
    """))
    rows = res.fetchall()
    return [
        {
            "id": str(r[0]),
            "name": r[1],
            "description": r[2],
            "is_active": bool(r[3]),
            "priority": int(r[4] or 10),
            "match_task_type": list(r[5] or []),
            "match_keywords": list(r[6] or []),
            "min_complexity": r[7],
            "force_model": r[8],
            "routing_strategy": r[9] or "multi-objective",
            "created_at": r[10].isoformat() if r[10] else None,
        }
        for r in rows
    ]


@router.post("")
async def create_routing_rule(
    req: RoutingRuleCreate,
    admin: AuthenticatedUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Create a new routing rule in public.routing_rules (Admin only)."""
    rule_id = str(uuid.uuid4())
    await db.execute(text("""
        INSERT INTO public.routing_rules (
            id, name, description, is_active, priority, match_task_type,
            match_keywords, min_complexity, force_model, routing_strategy, created_by
        )
        VALUES (
            :id, :name, :description, :is_active, :priority, :match_task_type,
            :match_keywords, :min_complexity, :force_model, :routing_strategy, :created_by
        );
    """), {
        "id": rule_id,
        "name": req.name.strip(),
        "description": req.description,
        "is_active": req.is_active,
        "priority": req.priority,
        "match_task_type": req.match_task_type,
        "match_keywords": req.match_keywords,
        "min_complexity": req.min_complexity,
        "force_model": req.force_model,
        "routing_strategy": req.routing_strategy,
        "created_by": admin.id,
    })
    await db.commit()
    return {"status": "created", "id": rule_id, "name": req.name}


@router.patch("/{rule_id}")
async def update_routing_rule(
    rule_id: str,
    req: RoutingRuleUpdate,
    admin: AuthenticatedUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Update an existing routing rule (Admin only)."""
    updates = []
    params = {"id": rule_id}
    if req.is_active is not None:
        updates.append("is_active = :is_active")
        params["is_active"] = req.is_active
    if req.priority is not None:
        updates.append("priority = :priority")
        params["priority"] = req.priority
    if req.routing_strategy is not None:
        updates.append("routing_strategy = :routing_strategy")
        params["routing_strategy"] = req.routing_strategy
    if req.force_model is not None:
        updates.append("force_model = :force_model")
        params["force_model"] = req.force_model
    if req.description is not None:
        updates.append("description = :description")
        params["description"] = req.description

    if not updates:
        return {"status": "no_changes"}

    updates.append("updated_at = NOW()")
    res = await db.execute(
        text(f"UPDATE public.routing_rules SET {', '.join(updates)} WHERE id::text = :id RETURNING id, is_active, priority;"),
        params,
    )
    await db.commit()
    row = res.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Routing rule not found")
    return {"status": "updated", "id": str(row[0]), "is_active": row[1], "priority": row[2]}


@router.delete("/{rule_id}")
async def delete_routing_rule(
    rule_id: str,
    admin: AuthenticatedUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Delete a routing rule (Admin only)."""
    res = await db.execute(
        text("DELETE FROM public.routing_rules WHERE id::text = :id RETURNING id;"),
        {"id": rule_id},
    )
    await db.commit()
    if not res.fetchone():
        raise HTTPException(status_code=404, detail="Routing rule not found")
    return {"status": "deleted", "id": rule_id}
