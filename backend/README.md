# Sentra AI Gateway — Backend Architecture

Sentra is an intelligent middleware gateway between client applications and foundation LLMs (OpenAI, Gemini, Claude, Ollama), providing cybersecurity protection, semantic caching, and dynamic model routing.

## 1. Directory Structure

```text
backend/
+-- app/
|   +-- api/
|   |   +-- v1/
|   |       +-- endpoints/
|   |           +-- gateway.py       # Primary /chat & /security/scan endpoints
|   +-- core/
|   |   +-- config.py                # Environment & security thresholds
|   +-- database/
|   |   +-- models.py                # SQLAlchemy RequestLog, SecurityIncident, ApiKey
|   +-- gateway/
|   |   +-- analyzer.py              # Inbound prompt task & complexity classifier
|   +-- models/
|   |   +-- schemas.py               # Pydantic v2 validation contracts
|   +-- optimization/
|   |   +-- cache.py                 # Semantic vector cache engine
|   +-- providers/
|   |   +-- base.py                  # Multi-LLM provider abstraction
|   +-- routing/
|   |   +-- engine.py                # Multi-objective Pareto model router
|   +-- security/
|   |   +-- detector.py              # OWASP LLM01 prompt injection & jailbreak detector
|   +-- main.py                      # FastAPI application entry point
+-- requirements.txt
+-- README.md
```

## 2. Request Lifecycle

```text
Incoming Prompt 
  -> Ingress Schema Validation 
  -> Request Analyzer (Domain, Tokens, Complexity) 
  -> Prompt Injection Detector (Threat Check: ALLOW / BLOCK / SANITIZE)
  -> Semantic Vector Cache (HIT -> Return cached / MISS -> Proceed)
  -> Intelligent Model Router (Evaluates Quality, Cost, Latency SLA)
  -> Multi-LLM Provider Execution (with automated circuit-breaker fallback)
  -> Response Evaluator & Telemetry Storage (PostgreSQL & Redis)
  -> Client Response
```

## 3. Quickstart

```bash
cd backend
python -m venv venv
# Windows
.\venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
uvicorn backend.app.main:app --reload --port 8000
```
