/**
 * Sentra AI Gateway Frontend API Client
 * Connects to NEXT_PUBLIC_API_URL (default: http://localhost:8000/api/v1)
 */

import { GatewayRequest, SecurityEvent, mockRequests, mockSecurityEvents } from "./mockData";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface SecurityCheckResult {
  is_safe: boolean;
  risk_score: number;
  confidence?: number;
  attack_type?: string | null;
  action: string;
  latency_ms?: number;
}

export interface AnalysisResult {
  task_type: string;
  complexity?: string;
  estimated_prompt_tokens?: number;
  language?: string;
  requires_long_context?: boolean;
}

export interface ChatResponse {
  request_id: string;
  response_text: string;
  model_used: string;
  provider: string;
  latency_ms: number;
  tokens: TokenUsage;
  cost_usd: number;
  cached: boolean;
  security: SecurityCheckResult;
  analysis: AnalysisResult;
}

export interface BlockedDetail {
  error: string;
  risk_score?: number;
  attack_type?: string;
  action?: string;
  message?: string;
  latency_ms?: number;
}

export type ChatApiResult =
  | {
      ok: true;
      data: ChatResponse;
    }
  | {
      ok: false;
      status: 403;
      blockedDetail: BlockedDetail;
    }
  | {
      ok: false;
      status: number;
      errorMessage: string;
    };

/**
 * Execute chat through Sentra Gateway
 * Handles 200 OK and 403 Forbidden (Prompt Injection Blocked)
 */
export async function sendChatMessage(
  prompt: string,
  options?: {
    preferred_model?: string;
    temperature?: number;
    max_tokens?: number;
    routing_strategy?: string;
    token?: string;
  }
): Promise<ChatApiResult> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (options?.token) {
      headers["Authorization"] = `Bearer ${options.token}`;
    }

    const res = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        prompt,
        preferred_model: options?.preferred_model,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.max_tokens ?? 1000,
        routing_strategy: options?.routing_strategy ?? "multi-objective",
      }),
    });

    if (res.status === 200) {
      const data: ChatResponse = await res.json();
      return { ok: true, data };
    }

    if (res.status === 403) {
      let blockedDetail: BlockedDetail = {
        error: "PROMPT_INJECTION_DETECTED",
        risk_score: 0.95,
        attack_type: "Prompt Injection Detected",
        action: "BLOCK",
        message: "Request intercepted and blocked by Sentra AI Security Shield.",
        latency_ms: 14,
      };

      try {
        const json = await res.json();
        if (json.detail && typeof json.detail === "object") {
          blockedDetail = {
            ...blockedDetail,
            ...json.detail,
          };
        } else if (typeof json.detail === "string") {
          blockedDetail.message = json.detail;
        }
      } catch {
        // use default blocked detail
      }

      return {
        ok: false,
        status: 403,
        blockedDetail,
      };
    }

    let errorMessage = `Gateway returned status ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson.detail) {
        errorMessage = typeof errJson.detail === "string" ? errJson.detail : JSON.stringify(errJson.detail);
      }
    } catch {
      // fallback
    }

    return {
      ok: false,
      status: res.status,
      errorMessage,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error contacting Sentra Gateway";
    return {
      ok: false,
      status: 0,
      errorMessage: message,
    };
  }
}

/**
 * Fetch live request logs from backend with graceful fallback to mock data
 */
export async function fetchGatewayRequests(): Promise<GatewayRequest[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`${API_BASE_URL}/requests`, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    const list: unknown[] = Array.isArray(data)
      ? data
      : Array.isArray((data as { requests?: unknown[] }).requests)
      ? (data as { requests: unknown[] }).requests
      : Array.isArray((data as { data?: unknown[] }).data)
      ? (data as { data: unknown[] }).data
      : [];

    if (list.length === 0) {
      return [];
    }

    return list.map((rawItem: unknown, idx: number): GatewayRequest => {
      const item = (typeof rawItem === "object" && rawItem !== null ? rawItem : {}) as Record<string, unknown>;
      const createdAt = item.created_at || item.createdAt;
      let timestamp = "Just now";
      if (createdAt) {
        try {
          const date = new Date(String(createdAt));
          timestamp = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        } catch {
          timestamp = String(createdAt);
        }
      }

      const statusRaw = String(item.status || "success").toLowerCase();
      const status: GatewayRequest["status"] =
        statusRaw === "blocked"
          ? "blocked"
          : statusRaw === "cached"
          ? "cached"
          : statusRaw === "fallback"
          ? "fallback"
          : "success";

      const tokensObj = (typeof item.tokens === "object" && item.tokens !== null ? item.tokens : {}) as Record<string, unknown>;

      return {
        id: String(item.id || `req_${idx}`),
        timestamp,
        taskType: String(item.task_type || item.taskType || "General Inference"),
        model: String(item.selected_model || item.model || "Unknown"),
        status,
        latencyMs: Math.round(Number(item.latency_ms ?? item.latencyMs ?? 0)),
        tokens: {
          prompt: Number(item.prompt_tokens ?? tokensObj.prompt ?? 0),
          completion: Number(item.completion_tokens ?? tokensObj.completion ?? 0),
          total: Number(item.total_tokens ?? tokensObj.total ?? 0),
        },
        costUsd: Number(item.cost_usd ?? item.costUsd ?? 0),
        cacheHit: Boolean(item.cache_hit ?? item.cacheHit ?? false),
        riskScore: Number(item.risk_score ?? item.riskScore ?? 0.02),
        attackType: typeof item.attack_type === "string" ? item.attack_type : typeof item.attackType === "string" ? item.attackType : null,
        action: String(item.action_taken || item.action || "ALLOW").toUpperCase() as "ALLOW" | "BLOCK" | "SANITIZE",
        qualityScore: Number(item.quality_score ?? item.qualityScore ?? 0.98),
        promptSnippet: String(item.prompt_snippet || item.promptSnippet || "(No prompt snippet)"),
      };
    });
  } catch {
    return [];
  }
}

/**
 * Fetch live security incidents from backend
 */
export async function fetchSecurityIncidents(): Promise<SecurityEvent[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`${API_BASE_URL}/security/incidents`, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    const list: unknown[] = Array.isArray(data)
      ? data
      : Array.isArray((data as { incidents?: unknown[] }).incidents)
      ? (data as { incidents: unknown[] }).incidents
      : Array.isArray((data as { security_incidents?: unknown[] }).security_incidents)
      ? (data as { security_incidents: unknown[] }).security_incidents
      : Array.isArray((data as { data?: unknown[] }).data)
      ? (data as { data: unknown[] }).data
      : [];

    if (list.length === 0) {
      return [];
    }

    return list.map((rawItem: unknown, idx: number): SecurityEvent => {
      const item = (typeof rawItem === "object" && rawItem !== null ? rawItem : {}) as Record<string, unknown>;
      const createdAt = item.created_at || item.createdAt;
      let timestamp = "Just now";
      if (createdAt) {
        try {
          const date = new Date(String(createdAt));
          timestamp = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        } catch {
          timestamp = String(createdAt);
        }
      }

      const actionRaw = String(item.action_taken || item.actionTaken || "BLOCKED").toUpperCase();
      const actionTaken: SecurityEvent["actionTaken"] =
        actionRaw === "SANITIZED" ? "SANITIZED" : actionRaw === "QUARANTINED" ? "QUARANTINED" : "BLOCKED";

      return {
        id: String(item.id || `sec_${idx}`),
        timestamp,
        attackType: String(item.attack_type || item.attackType || "Prompt Injection"),
        riskScore: Number(item.risk_score ?? item.riskScore ?? 0.95),
        actionTaken,
        sourceIp: String(item.client_ip || item.sourceIp || "127.0.0.1"),
        matchedRule: String(item.matched_rule || item.matchedRule || "RULE_INJECTION_DEFENSE"),
        snippet: String(item.malicious_snippet || item.snippet || "(No payload snippet)"),
      };
    });
  } catch {
    return [];
  }
}

export interface AnalyticsSummary {
  kpis: {
    total_requests: number;
    threats_blocked: number;
    total_incidents: number;
    threat_rate_pct: number;
    cache_hits: number;
    cache_hit_rate_pct: number;
    avg_latency_ms: number;
    p50_latency_ms: number;
    total_tokens: number;
    total_cost_usd: number;
    estimated_savings_usd: number;
  };
  models: Array<{
    model_used: string;
    requests_handled: number;
    share_pct: number;
    tokens_consumed: number;
    avg_latency_ms: number;
    cost_per_1k_tokens: number;
    total_spend_usd: number;
  }>;
  threat_breakdown: Array<{
    attack_type: string;
    count: number;
    percentage: number;
  }>;
}

export async function fetchAnalytics(): Promise<AnalyticsSummary | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/analytics`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
