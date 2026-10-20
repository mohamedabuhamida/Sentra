# Sentra AI Gateway — Semester 1 Project Guide & Deliverable

This document defines the exact scope, architecture, and deliverables for **Semester 1** as specified in Section 48 & Section 44 of the master project report.

---

## 1. Semester 1 Objective & Deliverables

> **Goal:** Build and validate a functional, end-to-end **AI Gateway Prototype** before advancing to complex multi-objective optimization.

### 5 Required Core Deliverables (Section 48):

```text
+-------------------------------------------------------------+
| 1. FastAPI Gateway Core                                     |
|    - POST /api/v1/chat endpoint                             |
|    - Request lifecycle pipeline                             |
|    - Ingress schema validation (Pydantic v2)                |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
| 2. Prompt Injection Detector                                |
|    - Dual-layer: Regex heuristic signatures + ML classifier |
|    - Risk scoring (0.0 to 1.0) & Action (ALLOW / BLOCK)     |
|    - Intercepts OWASP LLM01 attacks                         |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
| 3. Basic Model Router                                       |
|    - Task domain classification                             |
|    - Static & Task-based routing rules                      |
|    - Primary -> Fallback assignment                         |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
| 4. Multi-LLM Provider Integration                           |
|    - OpenAI (GPT-4o, GPT-4o-mini)                           |
|    - Google Gemini (Gemini 1.5 Pro, Flash)                  |
|    - Anthropic Claude (Claude 3.5 Sonnet)                   |
|    - Ollama Local (Llama-3-8B fallback)                     |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
| 5. Initial MVP Dashboard                                    |
|    - Telemetry KPIs (Requests, Threats Blocked, Latency)    |
|    - Live Request Logs & Trace Inspector                    |
|    - Security Shield Intercept Feed                         |
|    - Provider Status Monitor                                |
|    - Interactive Gateway Playground                         |
+-------------------------------------------------------------+
```

---

## 2. Team Work Distribution (Semester 1)

According to Section 47 of the report:

### Student 1 — AI / ML Lead
* Dataset collection and preparation (`models notebook/datasets/prompt_injection_sample.csv`).
* Train and evaluate baseline ML models (`models notebook/train_baseline.py` using TF-IDF + Logistic Regression).
* Transformer experiments (DeBERTa-v3 / RoBERTa fine-tuning).
* Measure accuracy, precision, recall, and false positive rate.

### Student 2 — Backend / Gateway Lead
* FastAPI core service architecture (`backend/app/main.py`).
* Request Analyzer and lifecycle pipeline (`backend/app/gateway/analyzer.py`).
* Model router logic and fallback cascades (`backend/app/routing/engine.py`).
* Provider connectors and unified schema (`backend/app/providers/base.py`).
* PostgreSQL database logging (`backend/app/database/models.py`).

### Student 3 — Frontend / Security / Integration Lead
* Next.js 16 + Tailwind CSS v4 dashboard (`frontend/app/`).
* Implementation of Sentra UI/UX Design System tokens (`#F8FAFC`, `#0F172A`, `#3382F6`).
* Security detection rules and OWASP LLM01 threat intercept dashboard (`frontend/app/security/page.tsx`).
* Interactive Gateway Playground (`frontend/app/playground/page.tsx`).
* Docker compose orchestration (`infrastructure/docker-compose.yml`).

---

## 3. What is Reserved for Semester 2?

The following features belong strictly to **Semester 2 (Phases 4–6)**:
* Advanced multi-objective Pareto model routing (Cost vs Latency vs Quality auto-tuning).
* Semantic vector similarity caching with pgvector / Redis HNSW index.
* Automated response quality rubric evaluation and hallucination detection.
* Dynamic context window pruning and prompt auto-optimization.
* Full adversarial red-teaming and multilingual evasion testing.

---

## 4. How to Run & Demo the Semester 1 Prototype

### Terminal 1: Backend Gateway
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate   # On Windows
pip install -r requirements.txt
uvicorn backend.app.main:app --reload --port 8000
```

### Terminal 2: Frontend Dashboard
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view and test the Semester 1 MVP.

### Terminal 3: ML Baseline Script
```bash
cd "models notebook"
python train_baseline.py
```
Outputs classification metrics (Accuracy, Precision, Recall, F1) on prompt injection samples.
