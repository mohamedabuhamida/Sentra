import uuid
import time
from fastapi import APIRouter, HTTPException, status
from ....models.schemas import ChatRequest, ChatResponse, TokenUsage, SecurityCheckResult
from ....security.detector import detector
from ....gateway.analyzer import analyzer
from ....routing.engine import router
from ....optimization.cache import semantic_cache
from ....providers.base import llm_service

api_router = APIRouter()

@api_router.post("/chat", response_model=ChatResponse)
async def gateway_chat(req: ChatRequest):
    """
    Primary Sentra Gateway lifecycle endpoint.
    1. Analyzes prompt characteristics
    2. Runs prompt injection & cybersecurity scan
    3. Blocks malicious queries (HTTP 403)
    4. Performs semantic vector cache lookup
    5. Routes to optimal LLM provider
    6. Returns execution telemetry and completion
    """
    req_id = f"req_{uuid.uuid4().hex[:8]}"

    # Step 1: Request Analyzer
    analysis = analyzer.analyze(req.prompt)

    # Step 2: Prompt Injection Detection
    sec_result = await detector.scan(req.prompt)

    if not sec_result.is_safe:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "PROMPT_INJECTION_DETECTED",
                "risk_score": sec_result.risk_score,
                "attack_type": sec_result.attack_type,
                "action": sec_result.action,
                "message": "Request intercepted and blocked by Sentra AI Security Shield.",
            },
        )

    # Step 3: Semantic Cache Lookup
    cached_entry = await semantic_cache.lookup(req.prompt)
    if cached_entry:
        return ChatResponse(
            request_id=req_id,
            response_text=cached_entry["response"],
            model_used=f"{cached_entry['model']} (Cached)",
            provider="semantic_cache",
            latency_ms=12.5,
            tokens=TokenUsage(**cached_entry["tokens"]),
            cost_usd=0.00001,
            cached=True,
            security=sec_result,
            analysis=analysis,
        )

    # Step 4: Model Router
    provider, model, fallback_chain = router.route(
        analysis=analysis,
        strategy=req.routing_strategy,
        preferred_model=req.preferred_model,
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
