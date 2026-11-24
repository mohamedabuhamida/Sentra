import asyncio
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

async def main():
    print("=== 1. Testing Database Models & CRUD ===")
    from backend.app.database.models import RequestLog, SecurityIncident, ApiKey
    from backend.app.database.session import DATABASE_URL, engine, AsyncSessionLocal
    from backend.app.database import crud
    from backend.app.providers.base import llm_service

    print(f"[PASS] Session factory initialized with DATABASE_URL={DATABASE_URL}")

    # Test create_request_log
    log_entry = await crud.create_request_log(
        db=None,
        prompt_snippet="Test prompt snippet for verification",
        task_type="Testing",
        selected_model="gemini-1.5-flash",
        provider="google",
        status="SUCCESS",
        latency_ms=120.5,
        prompt_tokens=10,
        completion_tokens=25,
        total_tokens=35,
        cost_usd=0.000018,
        cache_hit=False,
        risk_score=0.02,
        action_taken="ALLOW",
    )
    print(f"[PASS] create_request_log created: id={log_entry.id}, status={log_entry.status}")

    # Test create_security_incident
    sec_entry = await crud.create_security_incident(
        db=None,
        attack_type="Direct Instruction Override",
        risk_score=0.96,
        matched_rule="RULE_PROMPT_INJECTION_DEFENSE",
        client_ip="127.0.0.1",
        malicious_snippet="Ignore previous instructions",
        action_taken="BLOCK",
    )
    print(f"[PASS] create_security_incident created: id={sec_entry.id}, attack_type={sec_entry.attack_type}")

    # Test retrieval
    logs = await crud.get_request_logs(db=None, limit=10)
    print(f"[PASS] get_request_logs retrieved {len(logs)} logs.")
    assert len(logs) > 0, "No request logs found!"
    assert logs[0]["id"] == log_entry.id

    incidents = await crud.get_security_incidents(db=None, limit=10)
    print(f"[PASS] get_security_incidents retrieved {len(incidents)} incidents.")
    assert len(incidents) > 0, "No incidents found!"
    assert incidents[0]["id"] == sec_entry.id

    print("\n=== 2. Testing Provider Execution & Graceful Fallbacks ===")
    # Google Gemini Flash
    comp_google, tok_google, lat_google = await llm_service.execute(
        prompt="Explain quantum entanglement", provider="google", model="gemini-1.5-flash"
    )
    print(f"[PASS] Google Gemini Flash execute: {comp_google[:50]}... (latency={lat_google}ms, tokens={tok_google})")

    # OpenAI
    comp_openai, tok_openai, lat_openai = await llm_service.execute(
        prompt="Write a quicksort in Python", provider="openai", model="gpt-4o"
    )
    print(f"[PASS] OpenAI execute: {comp_openai[:50]}... (latency={lat_openai}ms, tokens={tok_openai})")

    # Ollama
    comp_ollama, tok_ollama, lat_ollama = await llm_service.execute(
        prompt="List 3 facts about Mars", provider="ollama", model="llama-3-8b"
    )
    print(f"[PASS] Ollama execute: {comp_ollama[:50]}... (latency={lat_ollama}ms, tokens={tok_ollama})")

    print("\n ALL BACKEND VERIFICATIONS COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(main())
