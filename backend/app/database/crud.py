import uuid
import datetime
import logging
from typing import List, Optional, Dict, Any
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from .models import RequestLog, SecurityIncident

logger = logging.getLogger("sentra.crud")

# In-memory stores for fallback resilience if database connection is intermittent
_in_memory_requests: List[Dict[str, Any]] = []
_in_memory_incidents: List[Dict[str, Any]] = []

def _ensure_uuid(val: Optional[Any]) -> uuid.UUID:
    if isinstance(val, uuid.UUID):
        return val
    if isinstance(val, str):
        try:
            return uuid.UUID(val)
        except Exception:
            pass
    return uuid.uuid4()

async def create_request_log(
    db: Optional[AsyncSession],
    prompt_snippet: str,
    task_type: str = "General Inference",
    selected_model: str = "Unknown",
    provider: str = "unknown",
    status: str = "success",
    latency_ms: float = 0.0,
    prompt_tokens: int = 0,
    completion_tokens: int = 0,
    total_tokens: int = 0,
    cost_usd: float = 0.0,
    cache_hit: bool = False,
    risk_score: float = 0.0,
    action_taken: str = "allow",
    log_id: Optional[str] = None,
    user_id: Optional[str] = None,
) -> RequestLog:
    entry_uuid = _ensure_uuid(log_id)
    user_uuid = _ensure_uuid(user_id) if user_id else None
    created_at = datetime.datetime.now(datetime.timezone.utc)

    # Normalize status and action for PostgreSQL check constraints
    norm_status = status.lower() if status else "success"
    if norm_status not in ["success", "blocked", "cached", "fallback", "error"]:
        norm_status = "success"

    norm_action = action_taken.lower() if action_taken else "allow"
    if norm_action not in ["allow", "block", "sanitize"]:
        norm_action = "allow"

    entry = RequestLog(
        id=entry_uuid,
        user_id=user_uuid,
        created_at=created_at,
        prompt_snippet=prompt_snippet[:500] if prompt_snippet else "",
        task_type=task_type,
        model_used=selected_model,
        status=norm_status,
        latency_ms=round(float(latency_ms), 2),
        prompt_tokens=int(prompt_tokens),
        completion_tokens=int(completion_tokens),
        total_tokens=int(total_tokens),
        cost_usd=round(float(cost_usd), 8),
        cache_hit=bool(cache_hit),
        risk_score=round(float(risk_score), 4),
        action_taken=norm_action,
    )

    # Save to in-memory fallback list
    _in_memory_requests.insert(0, entry.to_dict())
    if len(_in_memory_requests) > 1000:
        _in_memory_requests.pop()

    if db is not None:
        try:
            db.add(entry)
            await db.commit()
            await db.refresh(entry)
            logger.info(f"Persisted RequestLog {entry.id} to Supabase PostgreSQL.")
        except Exception as e:
            logger.warning(f"Could not persist RequestLog to Supabase: {e}")
            try:
                await db.rollback()
            except Exception:
                pass

    return entry


async def get_request_logs(
    db: Optional[AsyncSession],
    skip: int = 0,
    limit: int = 50,
    status_filter: Optional[str] = None,
) -> List[Dict[str, Any]]:
    if db is not None:
        try:
            stmt = select(RequestLog).order_by(desc(RequestLog.created_at))
            if status_filter and status_filter.lower() != "all":
                stmt = stmt.where(RequestLog.status.ilike(status_filter.lower()))
            stmt = stmt.offset(skip).limit(limit)
            result = await db.execute(stmt)
            rows = result.scalars().all()
            if rows:
                return [r.to_dict() for r in rows]
        except Exception as e:
            logger.warning(f"Could not query RequestLogs from Supabase: {e}")

    # Fallback to in-memory items
    items = _in_memory_requests
    if status_filter and status_filter.lower() != "all":
        items = [r for r in items if str(r.get("status", "")).lower() == status_filter.lower()]
    return items[skip : skip + limit]


async def create_security_incident(
    db: Optional[AsyncSession],
    attack_type: str,
    risk_score: float,
    matched_rule: str = "RULE_PROMPT_INJECTION_DEFENSE",
    client_ip: str = "127.0.0.1",
    malicious_snippet: str = "",
    action_taken: str = "block",
    incident_id: Optional[str] = None,
    confidence: float = 0.95,
) -> SecurityIncident:
    sec_uuid = _ensure_uuid(incident_id)
    created_at = datetime.datetime.now(datetime.timezone.utc)

    norm_action = action_taken.lower() if action_taken else "block"
    if norm_action not in ["block", "sanitize", "flag", "allow"]:
        norm_action = "block"

    severity = "high" if float(risk_score) >= 0.85 else "medium"

    entry = SecurityIncident(
        id=sec_uuid,
        created_at=created_at,
        attack_type=attack_type,
        severity=severity,
        risk_score=round(float(risk_score), 4),
        confidence=round(float(confidence), 4),
        matched_rule=matched_rule,
        client_ip=client_ip,
        malicious_snippet=malicious_snippet[:500] if malicious_snippet else "",
        action_taken=norm_action,
    )

    # Save to in-memory fallback list
    _in_memory_incidents.insert(0, entry.to_dict())
    if len(_in_memory_incidents) > 1000:
        _in_memory_incidents.pop()

    if db is not None:
        try:
            db.add(entry)
            await db.commit()
            await db.refresh(entry)
            logger.info(f"Persisted SecurityIncident {entry.id} to Supabase PostgreSQL.")
        except Exception as e:
            logger.warning(f"Could not persist SecurityIncident to Supabase: {e}")
            try:
                await db.rollback()
            except Exception:
                pass

    return entry


async def get_security_incidents(
    db: Optional[AsyncSession],
    skip: int = 0,
    limit: int = 50,
) -> List[Dict[str, Any]]:
    if db is not None:
        try:
            stmt = select(SecurityIncident).order_by(desc(SecurityIncident.created_at)).offset(skip).limit(limit)
            result = await db.execute(stmt)
            rows = result.scalars().all()
            if rows:
                return [r.to_dict() for r in rows]
        except Exception as e:
            logger.warning(f"Could not query SecurityIncidents from Supabase: {e}")

    return _in_memory_incidents[skip : skip + limit]
