import React from "react";
import Link from "next/link";
import {
  Activity,
  ShieldAlert,
  Clock,
  Sparkles,
  ArrowUpRight,
  Server,
  ArrowRight,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { KPICard } from "@/components/ui/KPICard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { RequestFlowVisualizer } from "@/components/ui/RequestFlowVisualizer";
import { mockRequests, mockProviders, mockSecurityEvents } from "@/lib/mockData";

export default function OverviewPage() {
  return (
    <AppShell
      
    >
      <div className="space-y-6">
        {/* KPI Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Requests"
            value="65,050"
            change="14.2%"
            isPositiveChange={true}
            timeframe="vs yesterday"
            icon={Activity}
            iconColor="blue"
          />
          <KPICard
            title="Threats Blocked"
            value="342"
            change="0.71% threat rate"
            isPositiveChange={false}
            timeframe="100% mitigated"
            icon={ShieldAlert}
            iconColor="rose"
          />
          <KPICard
            title="Avg Latency (P50)"
            value="142ms"
            change="28ms faster"
            isPositiveChange={true}
            timeframe="via semantic cache"
            icon={Clock}
            iconColor="emerald"
          />
          <KPICard
            title="Cost Savings"
            value="$418.50"
            change="38.2% cache hit"
            isPositiveChange={true}
            timeframe="model optimization"
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
                  Multi-provider abstraction layer with automatic fallback & SLA routing.
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

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mockProviders.map((provider) => (
                <div
                  key={provider.id}
                  className="p-4 rounded-xl border border-[#E4E7EB] bg-[#F8FAFC] hover:bg-white transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-[#0F172A]">
                        {provider.name}
                      </h4>
                      <p className="text-[11px] text-[#64748B]">
                        {provider.type === "local" ? "On-Premises Hardware" : "Managed Cloud API"}
                      </p>
                    </div>
                    <StatusBadge
                      status={provider.status === "healthy" ? "success" : "warning"}
                      label={provider.status}
                    />
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#E4E7EB] grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-[#94A3B8] block">Latency</span>
                      <span className="font-mono font-bold text-[#0F172A]">
                        {provider.latencyP50}ms
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#94A3B8] block">Uptime</span>
                      <span className="font-mono font-bold text-emerald-600">
                        {provider.uptime24h}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#94A3B8] block">Cost/1k</span>
                      <span className="font-mono font-bold text-[#0F172A]">
                        {provider.costPer1kTokens}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {provider.models.map((model) => (
                      <span
                        key={model}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-[#E4E7EB] text-[#64748B]"
                      >
                        {model}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
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
                {mockSecurityEvents.slice(0, 3).map((event) => (
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
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[#E4E7EB]">
              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E4E7EB] flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-[#0F172A] block">
                    Zero-Day Injection Model
                  </span>
                  <span className="text-[11px] text-[#64748B]">
                    DeBERTa-v3 Classifier Active
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
                Full request lifecycle including token counts, model decisions, and caching.
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
                {mockRequests.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-[#F8FAFC] transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-mono font-semibold text-[#0F172A]">
                      {req.id}
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
                        label={req.status.toUpperCase()}
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
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
