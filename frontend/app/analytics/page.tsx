"use client";

import React, { useEffect, useState } from "react";
import { DollarSign, Cpu, Database, Award, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { KPICard } from "@/components/ui/KPICard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AnalyticsSummary, fetchAnalytics } from "@/lib/api";
import { AdminGuard } from "@/components/ui/AdminGuard";
import { useAuth } from "@/lib/authContext";

export default function AnalyticsPage() {
  const { profile, loading: authLoading } = useAuth();
  const isAdmin = profile?.role === "admin";
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetchAnalytics();
      if (res) setData(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const kpis = data?.kpis;
  const models = data?.models || [];

  if (!authLoading && !isAdmin) {
    return (
      <AppShell title="Analytics" subtitle="Admin-only telemetry">
        <AdminGuard pageName="Analytics & Cost Metrics" />
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Observability, Cost Analytics & Quality Metrics"
      subtitle="Live performance attribution, token economics, and semantic cache ROI from Supabase."
    >
      <div className="space-y-6">
        <div className="flex justify-end">
          <button
            onClick={loadAnalytics}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E4E7EB] bg-white hover:bg-[#F8FAFC] text-xs font-semibold text-[#0F172A] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-600" : ""}`} />
            Refresh Telemetry
          </button>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Spend"
            value={kpis ? `$${kpis.total_cost_usd.toFixed(4)}` : "$0.0000"}
            change={`$${kpis?.estimated_savings_usd.toFixed(4) ?? "0.0000"} saved`}
            isPositiveChange={true}
            timeframe="live request_logs"
            icon={DollarSign}
            iconColor="emerald"
          />
          <KPICard
            title="Total Tokens Processed"
            value={kpis ? kpis.total_tokens.toLocaleString() : "0"}
            change={`${kpis?.total_requests ?? 0} total requests`}
            isPositiveChange={true}
            timeframe="input + output"
            icon={Cpu}
            iconColor="blue"
          />
          <KPICard
            title="Semantic Cache Hit Rate"
            value={kpis ? `${kpis.cache_hit_rate_pct}%` : "0%"}
            change={`${kpis?.cache_hits ?? 0} calls avoided`}
            isPositiveChange={true}
            timeframe="0.92 cosine sim"
            icon={Database}
            iconColor="violet"
          />
          <KPICard
            title="Avg Gateway Latency"
            value={kpis ? `${kpis.avg_latency_ms}ms` : "0ms"}
            change={`P50: ${kpis?.p50_latency_ms ?? 0}ms`}
            isPositiveChange={true}
            timeframe="real-time measurement"
            icon={Award}
            iconColor="amber"
          />
        </div>

        {/* Model Economics & Performance Table */}
        <div className="bg-white rounded-2xl border border-[#E4E7EB] p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-[#E4E7EB]">
            <div>
              <h3 className="text-base font-bold text-[#0F172A]">
                Model Efficiency & Cost Matrix
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Aggregated directly from live gateway `request_logs` in Supabase.
              </p>
            </div>
            <StatusBadge status="info" label="Live DB Telemetry" />
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E4E7EB] text-[#64748B] bg-[#F8FAFC]">
                  <th className="py-3 px-4 font-semibold">Model Name</th>
                  <th className="py-3 px-4 font-semibold">Requests Handled</th>
                  <th className="py-3 px-4 font-semibold">Tokens Consumed</th>
                  <th className="py-3 px-4 font-semibold">Avg Latency</th>
                  <th className="py-3 px-4 font-semibold">Avg Cost / 1k Tokens</th>
                  <th className="py-3 px-4 font-semibold">Total Spend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EB]">
                {models.map((m) => (
                  <tr key={m.model_used} className="hover:bg-[#F8FAFC]">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#0F172A]">
                      {m.model_used}
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-center gap-2.5">
                        <span className="w-16">
                          {m.requests_handled.toLocaleString()} ({m.share_pct}%)
                        </span>
                        <div className="w-20 h-1.5 rounded-full bg-[#F1F5F9] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#3382F6]"
                            style={{ width: `${Math.min(100, m.share_pct)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#64748B]">
                      {m.tokens_consumed.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold">
                      {m.avg_latency_ms}ms
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      ${m.cost_per_1k_tokens.toFixed(5)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#0F172A]">
                      ${m.total_spend_usd.toFixed(5)}
                    </td>
                  </tr>
                ))}
                {models.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#64748B]">
                      No model telemetry recorded yet. Run requests in the Playground to populate this matrix.
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
