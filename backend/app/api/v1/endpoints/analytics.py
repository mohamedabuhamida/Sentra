from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from ....database.session import get_db

router = APIRouter()


@router.get("")
async def get_analytics_summary(db: AsyncSession = Depends(get_db)):
    """
    Aggregate real-time gateway KPIs, per-model efficiency metrics,
    and OWASP security threat taxonomy directly from Supabase PostgreSQL.
    """
    summary_res = await db.execute(text("""
        SELECT
            COUNT(*) AS total_requests,
            COUNT(*) FILTER (WHERE LOWER(status) = 'blocked') AS threats_blocked,
            COUNT(*) FILTER (WHERE cache_hit = true OR LOWER(status) = 'cached') AS cache_hits,
            COALESCE(AVG(latency_ms), 0) AS avg_latency_ms,
            COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY latency_ms), 0) AS p50_latency_ms,
            COALESCE(SUM(total_tokens), 0) AS total_tokens,
            COALESCE(SUM(cost_usd), 0) AS total_cost_usd
        FROM public.request_logs;
    """))
    s = summary_res.fetchone()

    total_requests = int(s[0] or 0)
    threats_blocked = int(s[1] or 0)
    cache_hits = int(s[2] or 0)
    avg_latency_ms = round(float(s[3] or 0), 1)
    p50_latency_ms = round(float(s[4] or 0), 1)
    total_tokens = int(s[5] or 0)
    total_cost_usd = round(float(s[6] or 0), 6)

    cache_hit_rate = round((cache_hits / total_requests) * 100, 1) if total_requests > 0 else 0.0
    threat_rate = round((threats_blocked / total_requests) * 100, 2) if total_requests > 0 else 0.0
    # Estimated savings from semantic cache hits avoiding frontier inference
    estimated_savings_usd = round(cache_hits * 0.005, 4)

    # Per-model breakdown from request_logs
    models_res = await db.execute(text("""
        SELECT
            COALESCE(model_used, 'unknown') AS model_used,
            COUNT(*) AS requests_handled,
            COALESCE(SUM(total_tokens), 0) AS tokens_consumed,
            COALESCE(AVG(latency_ms), 0) AS avg_latency_ms,
            COALESCE(SUM(cost_usd), 0) AS total_spend_usd
        FROM public.request_logs
        GROUP BY model_used
        ORDER BY requests_handled DESC;
    """))
    models = []
    for r in models_res.fetchall():
        reqs = int(r[1] or 0)
        toks = int(r[2] or 0)
        spend = float(r[4] or 0)
        cost_per_1k = round((spend / toks) * 1000, 5) if toks > 0 else 0.0
        share_pct = round((reqs / total_requests) * 100, 1) if total_requests > 0 else 0.0
        models.append({
            "model_used": r[0],
            "requests_handled": reqs,
            "share_pct": share_pct,
            "tokens_consumed": toks,
            "avg_latency_ms": round(float(r[3] or 0), 1),
            "cost_per_1k_tokens": cost_per_1k,
            "total_spend_usd": round(spend, 6),
        })

    # Threat breakdown from security_incidents
    incidents_res = await db.execute(text("""
        SELECT
            COALESCE(attack_type, 'Prompt Injection') AS attack_type,
            COUNT(*) AS count
        FROM public.security_incidents
        GROUP BY attack_type
        ORDER BY count DESC;
    """))
    inc_rows = incidents_res.fetchall()
    total_incidents = sum(int(r[1] or 0) for r in inc_rows)
    threat_breakdown = [
        {
            "attack_type": r[0],
            "count": int(r[1] or 0),
            "percentage": round((int(r[1] or 0) / total_incidents) * 100, 1) if total_incidents > 0 else 0.0,
        }
        for r in inc_rows
    ]

    return {
        "kpis": {
            "total_requests": total_requests,
            "threats_blocked": threats_blocked,
            "total_incidents": total_incidents,
            "threat_rate_pct": threat_rate,
            "cache_hits": cache_hits,
            "cache_hit_rate_pct": cache_hit_rate,
            "avg_latency_ms": avg_latency_ms,
            "p50_latency_ms": p50_latency_ms,
            "total_tokens": total_tokens,
            "total_cost_usd": total_cost_usd,
            "estimated_savings_usd": estimated_savings_usd,
        },
        "models": models,
        "threat_breakdown": threat_breakdown,
    }
