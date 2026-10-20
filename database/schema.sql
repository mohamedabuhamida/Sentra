-- ============================================================
--  Sentra AI Gateway — Supabase Database Schema
--  Run this in: Supabase Dashboard → SQL Editor → New Query
--  Order matters — run top to bottom.
-- ============================================================

-- ── Extensions ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";          -- pgvector for semantic cache

-- ============================================================
--  TABLE 1: user_profiles
--  Links Supabase Auth users to app-level profile data.
--  auth.users is managed by Supabase — we only reference it.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email           TEXT NOT NULL,
    full_name       TEXT,
    role            TEXT NOT NULL DEFAULT 'viewer'
                        CHECK (role IN ('admin', 'operator', 'viewer')),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.user_profiles IS
    'Application-level user profiles linked to Supabase Auth UUIDs.';

-- ============================================================
--  TABLE 2: llm_providers
--  Registered LLM providers (OpenAI, Gemini, Anthropic, Ollama).
-- ============================================================
CREATE TABLE IF NOT EXISTS public.llm_providers (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            TEXT NOT NULL UNIQUE,          -- e.g. "openai", "gemini"
    display_name    TEXT NOT NULL,                 -- e.g. "OpenAI GPT-4o"
    base_url        TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    priority        INTEGER NOT NULL DEFAULT 1,    -- routing priority (lower = higher)
    cost_per_1k_tokens NUMERIC(10,6) DEFAULT 0.0,
    avg_latency_ms  NUMERIC(8,2) DEFAULT 0.0,
    success_rate    NUMERIC(5,4) DEFAULT 1.0,      -- 0.0 to 1.0
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.llm_providers IS
    'Registered LLM providers with routing metadata and health stats.';

-- Seed default providers
INSERT INTO public.llm_providers (name, display_name, priority, cost_per_1k_tokens)
VALUES
    ('openai',    'OpenAI GPT-4o',         1, 0.005000),
    ('gemini',    'Google Gemini 1.5 Pro', 2, 0.001250),
    ('anthropic', 'Anthropic Claude 3.5',  3, 0.003000),
    ('ollama',    'Ollama (Local)',         4, 0.000000)
ON CONFLICT (name) DO NOTHING;

-- ============================================================
--  TABLE 3: api_keys
--  Client API keys issued by the gateway (hashed, never stored plain).
-- ============================================================
CREATE TABLE IF NOT EXISTS public.api_keys (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    key_prefix      TEXT NOT NULL,                 -- first 8 chars for display
    hashed_key      TEXT NOT NULL UNIQUE,          -- bcrypt/sha256 hash
    scope           TEXT NOT NULL DEFAULT 'read_write'
                        CHECK (scope IN ('read_only', 'read_write', 'admin')),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    last_used_at    TIMESTAMPTZ,
    expires_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.api_keys IS
    'Client API keys for authenticating requests through the gateway.';

-- ============================================================
--  TABLE 4: request_logs
--  Every request processed by the gateway — core audit log.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.request_logs (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    api_key_id          UUID REFERENCES public.api_keys(id) ON DELETE SET NULL,
    conversation_id     UUID,                      -- groups turns in a session
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Request
    prompt_snippet      TEXT NOT NULL,             -- first 500 chars only
    prompt_hash         TEXT,                      -- sha256 for cache lookup
    routing_strategy    TEXT NOT NULL DEFAULT 'multi-objective'
                            CHECK (routing_strategy IN ('multi-objective','cost','quality','latency')),

    -- Task analysis
    task_type           TEXT,                      -- code, qa, summarization, creative...
    complexity          TEXT CHECK (complexity IN ('low','medium','high')),
    language_detected   TEXT,

    -- Routing decision
    provider_id         UUID REFERENCES public.llm_providers(id) ON DELETE SET NULL,
    model_used          TEXT NOT NULL,
    fallback_used       BOOLEAN NOT NULL DEFAULT FALSE,
    fallback_reason     TEXT,

    -- Performance
    status              TEXT NOT NULL
                            CHECK (status IN ('success','blocked','cached','fallback','error')),
    latency_ms          NUMERIC(10,2),
    prompt_tokens       INTEGER,
    completion_tokens   INTEGER,
    total_tokens        INTEGER,
    cost_usd            NUMERIC(12,8),

    -- Cache
    cache_hit           BOOLEAN NOT NULL DEFAULT FALSE,
    cache_similarity    NUMERIC(5,4),

    -- Security summary (detail in security_incidents)
    risk_score          NUMERIC(5,4),
    action_taken        TEXT CHECK (action_taken IN ('allow','block','sanitize'))
);

COMMENT ON TABLE public.request_logs IS
    'Complete audit log of every request processed by the Sentra gateway.';

CREATE INDEX IF NOT EXISTS idx_request_logs_created_at  ON public.request_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_request_logs_user_id     ON public.request_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_request_logs_status      ON public.request_logs (status);
CREATE INDEX IF NOT EXISTS idx_request_logs_provider_id ON public.request_logs (provider_id);
CREATE INDEX IF NOT EXISTS idx_request_logs_conv_id     ON public.request_logs (conversation_id);

-- ============================================================
--  TABLE 5: security_incidents
--  Detailed record of every detected threat / attack.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.security_incidents (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_log_id      UUID REFERENCES public.request_logs(id) ON DELETE CASCADE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    attack_type         TEXT NOT NULL,             -- prompt_injection, jailbreak, pii_leak...
    severity            TEXT NOT NULL DEFAULT 'medium'
                            CHECK (severity IN ('low','medium','high','critical')),
    risk_score          NUMERIC(5,4) NOT NULL,
    confidence          NUMERIC(5,4) NOT NULL,
    matched_rule        TEXT,
    malicious_snippet   TEXT,

    client_ip           INET,
    user_agent          TEXT,
    action_taken        TEXT NOT NULL
                            CHECK (action_taken IN ('block','sanitize','flag','allow'))
);

COMMENT ON TABLE public.security_incidents IS
    'Detailed threat records for every security event detected by the OWASP shield.';

CREATE INDEX IF NOT EXISTS idx_security_incidents_created_at  ON public.security_incidents (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_incidents_attack_type ON public.security_incidents (attack_type);
CREATE INDEX IF NOT EXISTS idx_security_incidents_severity    ON public.security_incidents (severity);

-- ============================================================
--  TABLE 6: semantic_cache
--  Vector embeddings for similarity-based response caching.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.semantic_cache (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prompt_hash     TEXT NOT NULL UNIQUE,
    prompt_text     TEXT NOT NULL,
    response_text   TEXT NOT NULL,
    embedding       VECTOR(768),                   -- sentence-transformer dim
    model_used      TEXT NOT NULL,
    provider        TEXT NOT NULL,
    token_count     INTEGER,
    hit_count       INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_hit_at     TIMESTAMPTZ,
    expires_at      TIMESTAMPTZ
);

COMMENT ON TABLE public.semantic_cache IS
    'Semantic vector cache — avoids redundant LLM calls for similar prompts.';

CREATE INDEX IF NOT EXISTS idx_semantic_cache_embedding
    ON public.semantic_cache USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- ============================================================
--  TABLE 7: routing_rules
--  Dynamic admin-defined rules that override the default router.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.routing_rules (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            TEXT NOT NULL UNIQUE,
    description     TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    priority        INTEGER NOT NULL DEFAULT 10,   -- lower = evaluated first

    -- Match conditions (combined with AND)
    match_task_type     TEXT[],
    match_keywords      TEXT[],
    min_complexity      TEXT CHECK (min_complexity IN ('low','medium','high')),

    -- Action
    force_provider_id   UUID REFERENCES public.llm_providers(id) ON DELETE SET NULL,
    force_model         TEXT,
    routing_strategy    TEXT CHECK (routing_strategy IN ('cost','quality','latency','multi-objective')),

    created_by      UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.routing_rules IS
    'Admin-defined rules that override the default multi-objective LLM router.';

-- ============================================================
--  TABLE 8: provider_health_snapshots
--  Periodic health snapshots per provider (time-series).
-- ============================================================
CREATE TABLE IF NOT EXISTS public.provider_health_snapshots (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id     UUID NOT NULL REFERENCES public.llm_providers(id) ON DELETE CASCADE,
    captured_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    is_online       BOOLEAN NOT NULL DEFAULT TRUE,
    avg_latency_ms  NUMERIC(8,2),
    p95_latency_ms  NUMERIC(8,2),
    success_rate    NUMERIC(5,4),
    request_count   INTEGER,
    error_count     INTEGER,
    total_tokens    BIGINT,
    total_cost_usd  NUMERIC(14,6)
);

COMMENT ON TABLE public.provider_health_snapshots IS
    'Periodic performance snapshots per LLM provider for the health dashboard.';

CREATE INDEX IF NOT EXISTS idx_provider_health_captured_at
    ON public.provider_health_snapshots (provider_id, captured_at DESC);

-- ============================================================
--  UTILITY: updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER trg_llm_providers_updated_at
    BEFORE UPDATE ON public.llm_providers
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER trg_routing_rules_updated_at
    BEFORE UPDATE ON public.routing_rules
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
--  AUTO-CREATE user_profile WHEN NEW USER SIGNS UP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        'viewer'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
--  ROW LEVEL SECURITY (RLS)
-- ============================================================

-- user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own profile select"
    ON public.user_profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admin select all profiles"
    ON public.user_profiles FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Own profile update"
    ON public.user_profiles FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (role = (SELECT role FROM public.user_profiles WHERE id = auth.uid()));

-- request_logs
ALTER TABLE public.request_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own request logs"
    ON public.request_logs FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Operator/admin all logs"
    ON public.request_logs FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role IN ('admin','operator')
    ));

-- api_keys
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own API keys"
    ON public.api_keys FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admin all API keys"
    ON public.api_keys FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin'
    ));

-- security_incidents
ALTER TABLE public.security_incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Operator/admin view incidents"
    ON public.security_incidents FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role IN ('admin','operator')
    ));

-- llm_providers (public read, admin write)
ALTER TABLE public.llm_providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read providers"  ON public.llm_providers FOR SELECT USING (TRUE);
CREATE POLICY "Admin manage providers" ON public.llm_providers FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin'
    ));

-- routing_rules
ALTER TABLE public.routing_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Operator read routing rules" ON public.routing_rules FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role IN ('admin','operator')
    ));
CREATE POLICY "Admin manage routing rules" ON public.routing_rules FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin'
    ));

-- provider_health_snapshots
ALTER TABLE public.provider_health_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Operator read health" ON public.provider_health_snapshots FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role IN ('admin','operator')
    ));

-- semantic_cache (backend service role bypasses RLS anyway)
ALTER TABLE public.semantic_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role cache access" ON public.semantic_cache FOR ALL USING (TRUE);
