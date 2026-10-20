# Sentra AI Gateway & Security Platform

**Tagline:** *Intelligent Routing. Secure AI. Measurable Performance.*

An intelligent middleware platform positioned between client applications and foundation Large Language Models (OpenAI, Gemini, Anthropic Claude, and local Ollama hardware). Sentra provides prompt injection defense, semantic similarity caching, task-specific model routing, resilient fallback cascades, and centralized observability.

---

## Workspace Architecture

```text
Sentra/
|
+-- frontend/                       # Next.js 16 + Tailwind CSS v4 Dashboard
|   +-- app/
|   |   +-- layout.tsx              # Root Layout with Geist Sans/Mono & Sentra Branding
|   |   +-- globals.css             # Tailwind v4 token system from UI/UX design spec
|   |   +-- page.tsx                # System Overview & KPI Dashboard
|   |   +-- requests/               # Inbound Request Logs & Trace Inspector Drawer
|   |   +-- routing/                # Model Routing Policies, Weights & Fallback Chain
|   |   +-- security/               # Prompt Injection Shield (OWASP LLM01, DeBERTa-v3)
|   |   +-- providers/              # Multi-LLM Provider Connectors & Ping Health Checks
|   |   +-- analytics/              # Cost, Token Economics, Latency & Quality Metrics
|   |   +-- playground/             # Interactive Gateway Simulator & Prompt Tester
|   |   +-- api-keys/               # Client Secret API Key Management
|   |   +-- settings/               # System Thresholds, Webhooks & Vector Engines
|   +-- components/
|   |   +-- layout/                 # Sidebar, Header, AppShell
|   |   +-- ui/                     # KPICard, StatusBadge, RequestFlowVisualizer
|   +-- lib/
|       +-- mockData.ts             # Strongly-typed gateway telemetry data
|
+-- backend/                        # FastAPI Middleware Core
|   +-- app/
|   |   +-- api/v1/endpoints/       # REST Endpoints (/api/v1/chat, /api/v1/security/scan)
|   |   +-- core/                   # Configuration, Security Thresholds (.env)
|   |   +-- gateway/                # Inbound Request Analyzer (Complexity, Task classification)
|   |   +-- security/               # Dual-layer Prompt Injection & Jailbreak Detector
|   |   +-- routing/                # Multi-Objective Pareto Model Router & Fallback Chain
|   |   +-- optimization/           # Semantic Vector Cache (0.92 Cosine Threshold)
|   |   +-- providers/              # OpenAI, Gemini, Claude, Ollama Unified Connectors
|   |   +-- database/               # SQLAlchemy Models (RequestLog, SecurityIncident, ApiKey)
|   |   +-- models/                 # Pydantic v2 Contract Schemas
|   |   +-- main.py                 # FastAPI Application Server Entry
|   +-- requirements.txt            # Python dependencies
|   +-- README.md                   # Backend documentation
|
+-- models notebook/                # Machine Learning & Prompt Injection Research
|   +-- requirements.txt            # PyTorch, HuggingFace Transformers, DeBERTa-v3
|   +-- README.md                   # ML experimentation, augmentation & evaluation guides
|
+-- infrastructure/                 # Containerized Deployment Orchestration
|   +-- docker-compose.yml          # PostgreSQL pgvector, Redis, FastAPI, Next.js
|   +-- Dockerfile.backend          # Python 3.11 Slim container image
|   +-- Dockerfile.frontend         # Node 20 Alpine multi-stage production build
|
+-- SentraGate_AI_Full_Project_Report.md           # Master Technical Project Specification
+-- Sentra_Visual_Identity_UI_UX_Design_System.md  # Brand & UI/UX Design System Specification
+-- Sentra AI Gateway Logo.png                     # Official Sentra Brand Logo
```

---

## Getting Started

### 1. Frontend Development Server

```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the Sentra Gateway Dashboard.

### 2. Backend FastAPI Server

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate   # On Windows
pip install -r requirements.txt
uvicorn backend.app.main:app --reload --port 8000
```
Interactive API docs available at [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs).

### 3. Full Stack Docker Compose

```bash
cd infrastructure
docker-compose up --build
```
This boots PostgreSQL with `pgvector`, Redis cache, the FastAPI backend, and Next.js frontend in a unified network.
