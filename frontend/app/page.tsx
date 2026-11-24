"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ShieldAlert,
  Clock,
  Sparkles,
  ArrowUpRight,
  Server,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { KPICard } from "@/components/ui/KPICard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { RequestFlowVisualizer } from "@/components/ui/RequestFlowVisualizer";
import { AdminGuard } from "@/components/ui/AdminGuard";
import { useAuth } from "@/lib/authContext";
import {
  API_BASE_URL,
  AnalyticsSummary,
  fetchAnalytics,
  fetchGatewayRequests,
  fetchSecurityIncidents,
} from "@/lib/api";
import { GatewayRequest, SecurityEvent } from "@/lib/mockData";

interface LiveProvider {
  id: string;
  name: string;
  display_name: string;
  base_url?: string;
  is_active: boolean;
  priority: number;
  cost_per_1k_tokens: number;
  avg_latency_ms: number;
  success_rate: number;
}

export default function OverviewPage() {
  const { profile, loading: authLoading } = useAuth();
  const isAdmin = profile?.role === "admin";
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [providers, setProviders] = useState<LiveProvider[]>([]);
  const [requests, setRequests] = useState<GatewayRequest[]>([]);
  const [incidents, setIncidents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [ana, provRes, reqs, secs] = await Promise.all([
        fetchAnalytics(),
        fetch(`${API_BASE_URL}/providers`).then((r) => (r.ok ? r.json() : [])).catch(() => []),
        fetchGatewayRequests(),
        fetchSecurityIncidents(),
      ]);
      if (ana) setAnalytics(ana);
      if (Array.isArray(provRes)) setProviders(provRes);
      setRequests(reqs);
      setIncidents(secs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const kpis = analytics?.kpis;

  if (!authLoading && !isAdmin) {
    return (
      <AppShell title="Sentra AI Gateway" subtitle="User Workspace">
        <AdminGuard pageName="the Admin Overview dashboard" />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Live Telemetry Header Strip */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#64748B]">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Supabase PostgreSQL Telemetry</span>
          </div>
          <button
            onClick={loadAll}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E4E7EB] bg-white hover:bg-[#F8FAFC] text-xs font-semibold text-[#0F172A] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-600" : ""}`} />
            Refresh Live Data
          </button>
        </div>

        {/* KPI Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Requests"
            value={kpis ? kpis.total_requests.toLocaleString() : "0"}
            change={`${kpis?.total_tokens.toLocaleString() ?? 0} tokens`}
            isPositiveChange={true}
            timeframe="live request_logs"
            icon={Activity}
            iconColor="blue"
          />
          <KPICard
            title="Threats Blocked"
            value={kpis ? String(kpis.threats_blocked) : "0"}
            change={`${kpis?.threat_rate_pct ?? 0}% threat rate`}
            isPositiveChange={false}
            timeframe={`${kpis?.total_incidents ?? 0} security incidents`}
            icon={ShieldAlert}
            iconColor="rose"
          />
          <KPICard
            title="Avg Latency (P50)"
            value={kpis ? `${kpis.p50_latency_ms}ms` : "0ms"}
            change={`avg ${kpis?.avg_latency_ms ?? 0}ms`}
            isPositiveChange={true}
            timeframe="end-to-end gateway"
            icon={Clock}
            iconColor="emerald"
          />
          <KPICard
            title="Cache Savings"
            value={kpis ? `$${kpis.estimated_savings_usd.toFixed(4)}` : "$0.0000"}
            change={`${kpis?.cache_hit_rate_pct ?? 0}% cache hit`}
            isPositiveChange={true}
            timeframe={`${kpis?.cache_hits ?? 0} cached hits`}
            icon={Sparkles}
            iconColor="violet"
          />
        </div>

        {/* Live Architecture Pipeline Visualizer */}
        <RequestFlowVisualizer />

        {/* Provider Fleet & Security Incident Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active LLM Provider Fleet (2 Columns on large screens) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E4E7EB] p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#E4E7EB]">
              <div>
                <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                  <Server className="w-4 h-4 text-blue-600" />
                  Connected Model Providers
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Live multi-provider fleet from Supabase `llm_providers`.
                </p>
              </div>
              <Link
                href="/providers"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
              >
                Manage Providers
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="mt-4 divide-y divide-[#E4E7EB]">
              {providers.map((provider) => (
                <div
                  key={provider.id}
                  className="py-3 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${provider.is_active ? "bg-emerald-500" : "bg-slate-300"}`} />
                    <div className="min-w-0">
                      <span className="text-sm font-semibold text-[#0F172A] block truncate">
                        {provider.display_name}
                      </span>
                      <span className="text-[11px] text-[#94A3B8]">
                        {provider.name} · P{provider.priority}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 text-xs shrink-0">
                    <div className="text-right">
                      <span className="font-mono font-semibold text-[#0F172A] block">
                        {Math.round(provider.avg_latency_ms || 0)}ms
                      </span>
                      <span className="text-[10px] text-[#94A3B8]">latency</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-semibold text-emerald-600 block">
                        {((provider.success_rate || 1) * 100).toFixed(0)}%
                      </span>
                      <span className="text-[10px] text-[#94A3B8]">success</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-semibold text-[#0F172A] block">
                        ${Number(provider.cost_per_1k_tokens || 0).toFixed(5)}
                      </span>
                      <span className="text-[10px] text-[#94A3B8]">per 1k</span>
                    </div>
                  </div>
                </div>
              ))}
              {providers.length === 0 && !loading && (
                <p className="text-xs text-[#64748B] py-6 text-center">
                  No providers registered in Supabase yet.
                </p>
              )}
            </div>
          </div>

          {/* Security Threat Intercept Feed (1 Column) */}
          <div className="bg-white rounded-2xl border border-[#E4E7EB] p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#E4E7EB]">
                <div>
                  <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    Security Intercepts
                  </h3>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Real-time prompt injection defenses.
                  </p>
                </div>
                <Link
                  href="/security"
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                >
                  View All
                </Link>
              </div>

              <div className="mt-4 space-y-3">
                {incidents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className="p-3 rounded-xl border border-rose-100 bg-rose-50/40"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0F172A]">
                        {event.attackType}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-semibold">
                        Risk {(event.riskScore * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#64748B] font-mono truncate">
                      {event.snippet}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-[#94A3B8]">
                      <span>Rule: {event.matchedRule}</span>
                      <span>{event.timestamp}</span>
                    </div>
                  </div>
                ))}
                {incidents.length === 0 && !loading && (
                  <p className="text-xs text-[#64748B] py-6 text-center">
                    No security incidents recorded yet.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[#E4E7EB]">
              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E4E7EB] flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-[#0F172A] block">
                    Zero-Day Injection Shield
                  </span>
                  <span className="text-[11px] text-[#64748B]">
                    NLP + Heuristic Rules Active
                  </span>
                </div>
                <StatusBadge status="success" label="Active" />
              </div>
            </div>
          </div>
        </div>

        {/* Live Requests Table */}
        <div className="bg-white rounded-2xl border border-[#E4E7EB] p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E4E7EB] gap-2">
            <div>
              <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                Live Request Stream & Telemetry
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Recent audit logs directly from Supabase `request_logs`.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/requests"
                className="px-3 py-1.5 rounded-xl border border-[#E4E7EB] bg-[#F8FAFC] hover:bg-white text-xs font-semibold text-[#0F172A] transition-colors inline-flex items-center gap-1.5"
              >
                <span>Full Logs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E4E7EB] text-[#64748B] font-semibold bg-[#F8FAFC]">
                  <th className="py-3 px-4">Request ID</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Task Domain</th>
                  <th className="py-3 px-4">Selected Provider & Model</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Latency</th>
                  <th className="py-3 px-4">Tokens</th>
                  <th className="py-3 px-4">Cost</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EB]">
                {requests.slice(0, 10).map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-[#F8FAFC] transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-mono font-semibold text-[#0F172A]">
                      {req.id.slice(0, 12)}
                    </td>
                    <td className="py-3.5 px-4 text-[#64748B] whitespace-nowrap">
                      {req.timestamp}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                        {req.taskType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#0F172A]">
                      {req.model}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge
                        status={
                          req.status === "success"
                            ? "success"
                            : req.status === "blocked"
                            ? "danger"
                            : req.status === "cached"
                            ? "info"
                            : "warning"
                        }
                        label={req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      />
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-[#0F172A]">
                      {req.latencyMs}ms
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#64748B]">
                      {req.tokens.total.toLocaleString()} tok
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-[#0F172A]">
                      ${req.costUsd.toFixed(4)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/requests?id=${req.id}`}
                        className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1"
                      >
                        Trace
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
                {requests.length === 0 && !loading && (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-[#64748B]">
                      No requests recorded yet. Send a prompt in the Playground to generate live telemetry!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
