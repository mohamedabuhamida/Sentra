import uuid
import time
from typing import Optional, List
from fastapi import APIRouter, HTTPException, status, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from ....models.schemas import ChatRequest, ChatResponse, TokenUsage, SecurityCheckResult
from ....security.detector import detector
from ....gateway.analyzer import analyzer
from ....routing.engine import router
from ....optimization.cache import semantic_cache
from ....providers.base import llm_service
from ....database.session import get_db
from ....database import crud
from ....core.auth import get_optional_user, AuthenticatedUser

api_router = APIRouter()

@api_router.post("/chat", response_model=ChatResponse)
async def gateway_chat(
    req: ChatRequest,
    raw_request: Request = None,
    current_user: Optional[AuthenticatedUser] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Primary Sentra Gateway lifecycle endpoint.
    1. Analyzes prompt characteristics
    2. Runs prompt injection & cybersecurity scan
    3. Blocks malicious queries (HTTP 403) and logs security incident
    4. Performs semantic vector cache lookup
    5. Routes to optimal LLM provider
    6. Returns execution telemetry, completion, and persists audit logs
    """
    req_id = f"req_{uuid.uuid4().hex[:8]}"
    start_time = time.perf_counter()
    client_ip = "127.0.0.1"
    if raw_request and raw_request.client:
        client_ip = raw_request.client.host

    # Step 1: Request Analyzer
    analysis = analyzer.analyze(req.prompt)

    # Step 2: Prompt Injection Detection
    sec_result = await detector.scan(req.prompt)

    if not sec_result.is_safe:
        elapsed_ms = round((time.perf_counter() - start_time) * 1000 + sec_result.latency_ms, 2)
        attack_type = sec_result.attack_type or "Prompt Injection Detected"
        action = sec_result.action or "BLOCK"

        # Persist threat incident to security_incidents table
        await crud.create_security_incident(
            db=db,
            attack_type=attack_type,
            risk_score=sec_result.risk_score,
            matched_rule="RULE_PROMPT_INJECTION_DEFENSE",
            client_ip=client_ip,
            malicious_snippet=req.prompt[:250],
            action_taken=action,
            incident_id=f"sec_{uuid.uuid4().hex[:8]}",
        )

        # Persist blocked audit record to request_logs table
        prompt_tokens = max(1, len(req.prompt.split()) * 4 // 3)
        await crud.create_request_log(
            db=db,
            prompt_snippet=req.prompt[:150],
            task_type=analysis.task_type if analysis else "Security Threat",
            selected_model="N/A (Shield Block)",
            provider="security_shield",
            status="BLOCKED",
            latency_ms=elapsed_ms,
            prompt_tokens=prompt_tokens,
            completion_tokens=0,
            total_tokens=prompt_tokens,
            cost_usd=0.0,
            cache_hit=False,
            risk_score=sec_result.risk_score,
            action_taken=action,
            log_id=req_id,
            user_id=current_user.id if current_user else None,
        )

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "PROMPT_INJECTION_DETECTED",
                "risk_score": sec_result.risk_score,
                "attack_type": attack_type,
                "action": action,
                "message": "Request intercepted and blocked by Sentra AI Security Shield.",
                "latency_ms": elapsed_ms,
            },
        )

    # Step 3: Semantic Cache Lookup
    cached_entry = await semantic_cache.lookup(req.prompt)
    if cached_entry:
        elapsed_ms = round((time.perf_counter() - start_time) * 1000 + 8.5, 2)
        tokens_obj = TokenUsage(**cached_entry["tokens"])
        cost_usd = 0.00001

        # Persist cached request to audit logs
        await crud.create_request_log(
            db=db,
            prompt_snippet=req.prompt[:150],
            task_type=analysis.task_type,
            selected_model=f"{cached_entry['model']} (Cached)",
            provider="semantic_cache",
            status="CACHED",
            latency_ms=elapsed_ms,
            prompt_tokens=tokens_obj.prompt_tokens,
            completion_tokens=tokens_obj.completion_tokens,
            total_tokens=tokens_obj.total_tokens,
            cost_usd=cost_usd,
            cache_hit=True,
            risk_score=sec_result.risk_score,
            action_taken=sec_result.action,
            log_id=req_id,
            user_id=current_user.id if current_user else None,
        )

        return ChatResponse(
            request_id=req_id,
            response_text=cached_entry["response"],
            model_used=f"{cached_entry['model']} (Cached)",
            provider="semantic_cache",
            latency_ms=elapsed_ms,
            tokens=tokens_obj,
            cost_usd=cost_usd,
            cached=True,
            security=sec_result,
            analysis=analysis,
        )

    # Step 4: Model Router (honoring user's per-profile provider priority if set)
    preferred_model = req.preferred_model
    if not preferred_model and current_user:
        try:
            from sqlalchemy import text
            pref_res = await db.execute(
                text("SELECT provider_priorities FROM public.user_profiles WHERE id::text = :uid LIMIT 1;"),
                {"uid": str(current_user.id)},
            )
            pref_row = pref_res.fetchone()
            if pref_row and isinstance(pref_row[0], dict) and pref_row[0]:
                top_provider = min(pref_row[0].items(), key=lambda kv: int(kv[1]))[0]
                provider_default_models = {
                    "openai": "gpt-4o-mini",
                    "gemini": "gemini-2.5-flash",
                    "anthropic": "claude-3-5-sonnet",
                    "ollama": "llama3-8b-local",
                }
                db_default_model = None
                try:
                    m_res = await db.execute(
                        text("SELECT default_model FROM public.llm_providers WHERE name = :n LIMIT 1;"),
                        {"n": top_provider.lower()},
                    )
                    m_row = m_res.fetchone()
                    if m_row and m_row[0]:
                        db_default_model = m_row[0]
                except Exception:
                    pass
                preferred_model = db_default_model or provider_default_models.get(top_provider)
        except Exception:
            pass

    provider, model, fallback_chain = router.route(
        analysis=analysis,
        strategy=req.routing_strategy,
        preferred_model=preferred_model,
    )

    # Step 5: Provider Execution
    completion, tokens_dict, latency = await llm_service.execute(
        prompt=req.prompt,
        provider=provider,
        model=model,
        temperature=req.temperature,
        max_tokens=req.max_tokens,
    )

    # Step 6: Store in cache
    await semantic_cache.store(req.prompt, completion, model, tokens_dict)

    # Step 7: Cost Calculation
    cost_per_1k = router.MODEL_COSTS.get(model, 0.002)
    cost_usd = round((tokens_dict["total_tokens"] / 1000.0) * cost_per_1k, 6)

    # Persist successful request to database
    await crud.create_request_log(
        db=db,
        prompt_snippet=req.prompt[:150],
        task_type=analysis.task_type,
        selected_model=model,
        provider=provider,
        status="SUCCESS",
        latency_ms=latency,
        prompt_tokens=tokens_dict["prompt_tokens"],
        completion_tokens=tokens_dict["completion_tokens"],
        total_tokens=tokens_dict["total_tokens"],
        cost_usd=cost_usd,
        cache_hit=False,
        risk_score=sec_result.risk_score,
        action_taken=sec_result.action,
        log_id=req_id,
        user_id=current_user.id if current_user else None,
    )

    return ChatResponse(
        request_id=req_id,
        response_text=completion,
        model_used=model,
        provider=provider,
        latency_ms=latency,
        tokens=TokenUsage(**tokens_dict),
        cost_usd=cost_usd,
        cached=False,
        security=sec_result,
        analysis=analysis,
    )

@api_router.post("/security/scan", response_model=SecurityCheckResult)
async def scan_prompt(prompt: str):
    """
    Dedicated endpoint to evaluate prompt injection risk without calling LLMs.
    """
    return await detector.scan(prompt)

@api_router.get("/requests")
async def get_requests(
    skip: int = 0,
    limit: int = 50,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """
    Retrieve paginated audit logs for gateway requests.
    """
    return await crud.get_request_logs(db=db, skip=skip, limit=limit, status_filter=status)

@api_router.get("/security/incidents")
async def get_security_incidents(
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    """
    Retrieve logged prompt injection threats and cybersecurity incidents.
    """
    return await crud.get_security_incidents(db=db, skip=skip, limit=limit)
