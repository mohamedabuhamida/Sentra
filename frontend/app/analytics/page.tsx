"use client";

import React from "react";
import {
  DollarSign,
  Cpu,
  Database,
  Award,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { KPICard } from "@/components/ui/KPICard";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default function AnalyticsPage() {
  return (
    <AppShell
      title="Observability, Cost Analytics & Quality Metrics"
      subtitle="Comprehensive performance attribution, token economics, and semantic cache ROI."
    >
      <div className="space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Spend (24h)"
            value="$184.20"
            change="34.8% saved"
            isPositiveChange={true}
            timeframe="vs single-provider baseline"
            icon={DollarSign}
            iconColor="emerald"
          />
          <KPICard
            title="Total Tokens Processed"
            value="42.8M"
            change="1.4M / hour avg"
            isPositiveChange={true}
            timeframe="input + output"
            icon={Cpu}
            iconColor="blue"
          />
          <KPICard
            title="Semantic Cache Hit Rate"
            value="38.2%"
            change="24,800 calls avoided"
            isPositiveChange={true}
            timeframe="0.92 cosine sim"
            icon={Database}
            iconColor="violet"
          />
          <KPICard
            title="Average Output Quality"
            value="4.86 / 5.0"
            change="98.2% rubric pass"
            isPositiveChange={true}
            timeframe="automated evaluation"
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
                Real-world benchmark metrics collected from live gateway requests.
              </p>
            </div>
            <StatusBadge status="info" label="Telemetry Real-time" />
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E4E7EB] text-[#64748B] bg-[#F8FAFC]">
                  <th className="py-3 px-4 font-semibold">Model Provider & Name</th>
                  <th className="py-3 px-4 font-semibold">Requests Handled</th>
                  <th className="py-3 px-4 font-semibold">Tokens Consumed</th>
                  <th className="py-3 px-4 font-semibold">Avg Latency</th>
                  <th className="py-3 px-4 font-semibold">Cost / 1k Tokens</th>
                  <th className="py-3 px-4 font-semibold">Quality Index</th>
                  <th className="py-3 px-4 font-semibold">Total Spend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EB]">
                <tr className="hover:bg-[#F8FAFC]">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#0F172A]">
                    gpt-4o
                  </td>
                  <td className="py-3.5 px-4 font-mono">18,420 (28%)</td>
                  <td className="py-3.5 px-4 font-mono text-[#64748B]">14.2M</td>
                  <td className="py-3.5 px-4 font-mono font-semibold">245ms</td>
                  <td className="py-3.5 px-4 font-mono">$0.0050</td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-purple-600">
                      0.98 (Excellent)
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#0F172A]">
                    $71.00
                  </td>
                </tr>

                <tr className="hover:bg-[#F8FAFC]">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#0F172A]">
                    gemini-1.5-flash
                  </td>
                  <td className="py-3.5 px-4 font-mono">24,810 (38%)</td>
                  <td className="py-3.5 px-4 font-mono text-[#64748B]">16.8M</td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-emerald-600">
                    124ms
                  </td>
                  <td className="py-3.5 px-4 font-mono">$0.0005</td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-blue-600">
                      0.93 (High)
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#0F172A]">
                    $8.40
                  </td>
                </tr>

                <tr className="hover:bg-[#F8FAFC]">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#0F172A]">
                    claude-3-5-sonnet
                  </td>
                  <td className="py-3.5 px-4 font-mono">9,640 (15%)</td>
                  <td className="py-3.5 px-4 font-mono text-[#64748B]">8.6M</td>
                  <td className="py-3.5 px-4 font-mono font-semibold">312ms</td>
                  <td className="py-3.5 px-4 font-mono">$0.0030</td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-purple-600">
                      0.99 (Frontier)
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#0F172A]">
                    $25.80
                  </td>
                </tr>

                <tr className="hover:bg-[#F8FAFC]">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#0F172A]">
                    llama-3-8b (Ollama Local)
                  </td>
                  <td className="py-3.5 px-4 font-mono">12,180 (19%)</td>
                  <td className="py-3.5 px-4 font-mono text-[#64748B]">3.2M</td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-emerald-600">
                    88ms
                  </td>
                  <td className="py-3.5 px-4 font-mono">$0.0000</td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-emerald-600">
                      0.91 (Good)
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">
                    $0.00 (Free)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Semantic Cache Deep Dive */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-[#E4E7EB] p-6 shadow-xs">
            <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-600" />
              Semantic Cache Performance
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Vector index similarity caching powered by text-embedding-3-small.
            </p>

            <div className="mt-4 space-y-3">
              <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E4E7EB] flex justify-between items-center text-xs">
                <span className="text-[#64748B]">Cache Hit Ratio:</span>
                <span className="font-mono font-bold text-emerald-600">
                  38.2% (24,800 hits)
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E4E7EB] flex justify-between items-center text-xs">
                <span className="text-[#64748B]">Average Cache Latency:</span>
                <span className="font-mono font-bold text-[#0F172A]">
                  12ms (vs 240ms origin)
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E4E7EB] flex justify-between items-center text-xs">
                <span className="text-[#64748B]">Cosine Similarity Threshold:</span>
                <span className="font-mono font-bold text-[#0F172A]">
                  &gt;= 0.92
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E4E7EB] flex justify-between items-center text-xs">
                <span className="text-[#64748B]">Net Cost Saved:</span>
                <span className="font-mono font-bold text-emerald-600">
                  $314.80 / day
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E4E7EB] p-6 shadow-xs">
            <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600" />
              Latency Percentile Distribution
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Global gateway response timing across all processed prompts.
            </p>

            <div className="mt-4 space-y-3">
              <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E4E7EB] flex justify-between items-center text-xs">
                <span className="text-[#64748B]">P50 (Median):</span>
                <span className="font-mono font-bold text-emerald-600">
                  142ms
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E4E7EB] flex justify-between items-center text-xs">
                <span className="text-[#64748B]">P90:</span>
                <span className="font-mono font-bold text-blue-600">
                  280ms
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E4E7EB] flex justify-between items-center text-xs">
                <span className="text-[#64748B]">P95:</span>
                <span className="font-mono font-bold text-amber-600">
                  385ms
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E4E7EB] flex justify-between items-center text-xs">
                <span className="text-[#64748B]">P99 (SLA Boundary):</span>
                <span className="font-mono font-bold text-[#0F172A]">
                  580ms
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
