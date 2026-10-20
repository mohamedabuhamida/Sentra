# Sentra AI Gateway — Semester 1: 3-Phase Roadmap & Milestones

**Project:** Sentra — Intelligent GenAI Gateway & Cybersecurity Platform  
**Target Semester:** Semester 1 (Graduation Project Phase 1)  
**Timeline:** 12 Weeks (Divided into 3 Slices of 4 Weeks Each)  
**Deliverable:** Working AI Gateway Prototype with Prompt Injection Defense  

---

## Executive Overview

To ensure steady progress and clear milestone delivery for supervisors and the academic committee, **Semester 1 is divided into three distinct, progressive phases**:

```text
==================================================================================
                           SEMESTER 1: 3-PHASE ROADMAP
==================================================================================
  PHASE 1 (Weeks 1 - 4)        PHASE 2 (Weeks 5 - 8)        PHASE 3 (Weeks 9 - 12)
  ---------------------        ---------------------        ----------------------
  Foundation & Gateway         Cybersecurity & Prompt       Basic Model Routing,
  Prototype Pipeline           Injection Defense            Context & Final Demo
==================================================================================
```

---

## Phase 1: Foundation & Gateway Pipeline (Weeks 1 – 4)

### Objective:
Establish the core infrastructure and achieve an end-to-end "Hello World" request lifecycle from client to LLM provider with operational logging.

### Work Breakdown:
1. **Backend / Gateway**:
   * Scaffolding FastAPI project structure (`api/`, `core/`, `gateway/`, `database/`).
   * Implement base `POST /api/v1/chat` ingress endpoint and `GET /health` check.
   * Integrate initial cloud LLM providers (e.g., Google Gemini 1.5 Flash and OpenAI GPT-4o-mini).
2. **Database & Persistence**:
   * Initialize PostgreSQL schema for `conversations`, `conversation_messages`, and `request_logs`.
   * Record every processed request with timestamp, latency, token count, and selected model.
3. **Frontend Dashboard**:
   * Configure Next.js 16 + Tailwind CSS v4 design system adhering to the Sentra visual identity (`#F8FAFC`, `#0F172A`, `#3382F6`).
   * Build the **Overview Dashboard** (`/`) with KPI cards and connected LLM provider status cards.
4. **AI / ML**:
   * Collect and curate benchmark datasets for prompt injection (Kaggle, HuggingFace Deepset, BIPIA).
   * Perform initial data exploration (class balance, prompt length distributions, vocabulary).

### 🎯 Milestone 1 Deliverable:
> A functioning gateway prototype where a user can enter a prompt on the dashboard, route it through FastAPI to an active LLM provider, log the transaction to PostgreSQL, and observe the live result.

---

## Phase 2: Cybersecurity & Prompt Injection Defense (Weeks 5 – 8)

### Objective:
Implement Sentra’s core research differentiator: an intelligent pre-execution security shield that detects, scores, and blocks OWASP LLM01 prompt injection attacks before they reach foundation models.

### Work Breakdown:
1. **AI / ML Research**:
   * Clean, balance, and label the dataset into attack categories (Direct Injection, Jailbreak / DAN, System Prompt Leaks, Role Confusion).
   * Train baseline ML classifiers (TF-IDF + Logistic Regression / Linear SVM) to establish baseline accuracy, precision, and recall.
   * Conduct transformer fine-tuning experiments (e.g., `microsoft/deberta-v3-small`).
2. **Backend / Security Pipeline**:
   * Embed the `PromptInjectionDetector` into the `/api/v1/chat` execution pipeline.
   * Implement fast regex/heuristic signature matching for high-confidence zero-day attacks.
   * Develop risk scoring logic (0.0 to 1.0) and enforcement actions:
     * **ALLOW**: Benign requests pass through.
     * **BLOCK**: Malicious requests immediately aborted with HTTP 403 Forbidden.
     * **SANITIZE**: Strips override instructions while preserving the underlying inquiry.
   * Store flagged security incidents in the `security_incidents` database table.
3. **Frontend Security Interface**:
   * Build the **Security Shield Dashboard** (`/security`) with OWASP LLM01 threat taxonomy breakdowns and risk threshold sliders.
   * Build the **Interactive Playground** (`/playground`) where evaluators can type sample attacks and view live risk scores and policy actions in real time.

### 🎯 Milestone 2 Deliverable:
> An active security shield that protects LLM endpoints against malicious prompts, backed by a trained ML baseline and a live security inspection dashboard.

---

## Phase 3: Basic Model Routing, Context & Final Defense (Weeks 9 – 12)

### Objective:
Add task-aware model routing with fallback resiliency, multi-turn conversation memory, and complete end-to-end integration for the Semester 1 academic defense.

### Work Breakdown:
1. **Backend / Routing & Context**:
   * Implement `RequestAnalyzer` to automatically classify prompt domain (Code Generation, Financial Analysis, General QA, Translation) and complexity.
   * Implement `ModelRouter`: rule-based engine mapping detected tasks to optimal models (e.g., Code → GPT-4o, Simple QA → Gemini Flash, Offline/Privacy → local Ollama Llama 3).
   * Implement automatic fallback cascade: if the primary cloud model encounters latency spikes or timeouts, automatically failover to secondary providers or local hardware.
   * Implement multi-turn conversation tracking via `conversation_id` in `conversations` and `conversation_messages` tables.
2. **Frontend Telemetry & Polish**:
   * Build the **Model Routing View** (`/routing`) showing task-to-model assignments and fallback sequences.
   * Build the **Request Logs & Trace Explorer** (`/requests`) with search, status filters, and trace inspection drawer.
   * Conduct accessibility, responsiveness, and aesthetic audits across all screens.
3. **Academic Evaluation & Testing**:
   * Run benchmark latency tests ensuring security and routing overhead remains under 10ms.
   * Generate confusion matrices, ROC curves, and false-positive rate documentation for the ML classifier.
   * Prepare final presentation slide deck, architecture diagrams, and live demonstration script.

### 🎯 Milestone 3 Deliverable (Semester 1 Final):
> The complete working **Semester 1 AI Gateway Prototype** featuring **Prompt Injection Defense**, **Task-Based Model Routing with Fallback**, **Request Audit Logging**, and the **Management Dashboard**, ready for academic evaluation.

---

## 3-Student Team Work Distribution

| Phase | Student 1: AI / ML Lead | Student 2: Backend / Gateway Lead | Student 3: Frontend / Security / UI Lead |
| :--- | :--- | :--- | :--- |
| **Phase 1** *(Weeks 1–4)* | Dataset collection, cleaning, and exploratory data analysis | FastAPI core setup, `/health`, `/chat` proxy, and provider APIs | Next.js 16 layout, Sentra UI/UX tokens, and Overview dashboard |
| **Phase 2** *(Weeks 5–8)* | Baseline ML model training (TF-IDF), transformer fine-tuning | `PromptInjectionDetector` engine, signature rules, risk scoring | Security Shield dashboard, threat feed, and interactive Playground |
| **Phase 3** *(Weeks 9–12)* | Model evaluation metrics (Precision, Recall, ROC), ML report | `RequestAnalyzer`, `ModelRouter` fallback, and DB conversation history | Request trace drawer, routing matrix view, and final presentation demo |

---

## What is Deferred to Semester 2?

The following complex optimization modules are explicitly reserved for **Semester 2**:
* Multi-objective Pareto routing optimization (automated trade-off curves for cost vs. latency vs. quality).
* Vector-based semantic caching using PostgreSQL `pgvector` / Redis HNSW index.
* Automated response quality rubric evaluation and hallucination detection.
* Dynamic prompt compression and context window pruning.
* Adversarial red-teaming, multilingual robustness testing, and enterprise RBAC (Admin vs. Analyst).
