"use client";

import React, { useState } from "react";
import {
  Sliders,
  Zap,
  DollarSign,
  Award,
  ArrowRight,
  RefreshCw,
  Plus,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default function RoutingPage() {
  const [costWeight, setCostWeight] = useState(40);
  const [qualityWeight, setQualityWeight] = useState(45);
  const [latencyWeight, setLatencyWeight] = useState(15);
  const [activeStrategy, setActiveStrategy] = useState("multi-objective");

  return (
    <AppShell
      title="Intelligent Model Routing & Fallback Policies"
      subtitle="Configure dynamic model selection algorithms, task-specific rules, and resilient fallback chains."
    >
      <div className="space-y-6">
        {/* Strategy Selector Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => {
              setActiveStrategy("multi-objective");
              setCostWeight(40);
              setQualityWeight(45);
              setLatencyWeight(15);
            }}
            className={`p-4 rounded-2xl border text-left transition-all ${
              activeStrategy === "multi-objective"
                ? "bg-white border-[#3382F6] ring-2 ring-blue-500/20 shadow-xs"
                : "bg-white border-[#E4E7EB] hover:border-[#CBD5E1]"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
                <Sliders className="w-4 h-4" />
              </span>
              <StatusBadge status="success" label="Active" />
            </div>
            <h3 className="text-sm font-bold text-[#0F172A]">
              Multi-Objective ML Router
            </h3>
            <p className="text-xs text-[#64748B] mt-1">
              Balances cost, output quality, and SLA latency based on extracted task features.
            </p>
          </button>

          <button
            onClick={() => {
              setActiveStrategy("cost-first");
              setCostWeight(75);
              setQualityWeight(15);
              setLatencyWeight(10);
            }}
            className={`p-4 rounded-2xl border text-left transition-all ${
              activeStrategy === "cost-first"
                ? "bg-white border-[#3382F6] ring-2 ring-blue-500/20 shadow-xs"
                : "bg-white border-[#E4E7EB] hover:border-[#CBD5E1]"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                <DollarSign className="w-4 h-4" />
              </span>
              <StatusBadge status="neutral" label="Ready" />
            </div>
            <h3 className="text-sm font-bold text-[#0F172A]">
              Aggressive Cost Minimizer
            </h3>
            <p className="text-xs text-[#64748B] mt-1">
              Prioritizes high-efficiency models (Gemini Flash, Llama 3) for standard tasks.
            </p>
          </button>

          <button
            onClick={() => {
              setActiveStrategy("quality-first");
              setCostWeight(10);
              setQualityWeight(80);
              setLatencyWeight(10);
            }}
            className={`p-4 rounded-2xl border text-left transition-all ${
              activeStrategy === "quality-first"
                ? "bg-white border-[#3382F6] ring-2 ring-blue-500/20 shadow-xs"
                : "bg-white border-[#E4E7EB] hover:border-[#CBD5E1]"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-200">
                <Award className="w-4 h-4" />
              </span>
              <StatusBadge status="neutral" label="Ready" />
            </div>
            <h3 className="text-sm font-bold text-[#0F172A]">
              Maximum Quality Frontier
            </h3>
            <p className="text-xs text-[#64748B] mt-1">
              Guarantees top-tier frontier models (Claude 3.5 Sonnet, GPT-4o) regardless of price.
            </p>
          </button>
        </div>

        {/* Weights Tuning & Fallback Chain */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Optimization Weights Slider */}
          <div className="bg-white rounded-2xl border border-[#E4E7EB] p-6 shadow-xs">
            <h3 className="text-base font-bold text-[#0F172A]">
              Routing Optimization Weights
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Fine-tune the scoring function used by the routing engine.
            </p>

            <div className="mt-6 space-y-6">
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="font-semibold text-[#0F172A] flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-purple-600" />
                    Quality & Accuracy Weight
                  </span>
                  <span className="font-mono font-bold text-purple-600">
                    {qualityWeight}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={qualityWeight}
                  onChange={(e) => setQualityWeight(Number(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="font-semibold text-[#0F172A] flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    Cost Optimization Weight
                  </span>
                  <span className="font-mono font-bold text-emerald-600">
                    {costWeight}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={costWeight}
                  onChange={(e) => setCostWeight(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="font-semibold text-[#0F172A] flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-blue-600" />
                    Latency & SLA Weight
                  </span>
                  <span className="font-mono font-bold text-blue-600">
                    {latencyWeight}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={latencyWeight}
                  onChange={(e) => setLatencyWeight(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div className="pt-4 border-t border-[#E4E7EB] flex items-center justify-between">
                <span className="text-xs text-[#64748B]">
                  Estimated Monthly Savings:
                </span>
                <span className="text-sm font-mono font-bold text-emerald-600">
                  ~34.8% reduction
                </span>
              </div>
            </div>
          </div>

          {/* Automatic Fallback Resiliency Chain */}
          <div className="bg-white rounded-2xl border border-[#E4E7EB] p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#E4E7EB]">
              <div>
                <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-blue-600" />
                  Provider Fallback Cascade
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Automated circuit breaker and failover sequence on provider timeouts.
                </p>
              </div>
              <StatusBadge status="success" label="Circuit Ready" />
            </div>

            <div className="mt-4 space-y-3">
              <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold font-mono">
                    1
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-[#0F172A]">
                      Primary: Selected LLM by Router
                    </h4>
                    <p className="text-[11px] text-[#64748B]">
                      Timeout limit: 4,000ms • HTTP 429 / 5xx triggers step 2
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono text-blue-700 font-semibold">
                  Primary
                </span>
              </div>

              <div className="flex justify-center -my-1 text-[#CBD5E1]">
                <ArrowRight className="w-4 h-4 rotate-90" />
              </div>

              <div className="p-3.5 rounded-xl border border-[#E4E7EB] bg-[#F8FAFC] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs font-bold font-mono">
                    2
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-[#0F172A]">
                      Secondary: Cross-Provider Equivalent
                    </h4>
                    <p className="text-[11px] text-[#64748B]">
                      E.g. GPT-4o → Claude 3.5 Sonnet / Gemini 1.5 Pro
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono text-[#64748B]">
                  Cloud Backup
                </span>
              </div>

              <div className="flex justify-center -my-1 text-[#CBD5E1]">
                <ArrowRight className="w-4 h-4 rotate-90" />
              </div>

              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold font-mono">
                    3
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-[#0F172A]">
                      Tertiary: Local Self-Hosted Ollama Cluster
                    </h4>
                    <p className="text-[11px] text-[#64748B]">
                      Guaranteed zero external network dependencies (Llama-3-8B)
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono text-emerald-700 font-semibold">
                  Air-Gapped
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Task Domain Routing Matrix */}
        <div className="bg-white rounded-2xl border border-[#E4E7EB] p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-[#E4E7EB]">
            <div>
              <h3 className="text-base font-bold text-[#0F172A]">
                Task-Domain Model Mapping Rules
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Explicit model assignments based on Request Analyzer classification.
              </p>
            </div>
            <button
              onClick={() => alert("Add task mapping rule modal")}
              className="px-3 py-1.5 rounded-xl bg-[#3382F6] hover:bg-[#2563EB] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Domain Rule
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E4E7EB] text-[#64748B] bg-[#F8FAFC]">
                  <th className="py-3 px-4 font-semibold">Detected Task Type</th>
                  <th className="py-3 px-4 font-semibold">Complexity</th>
                  <th className="py-3 px-4 font-semibold">Preferred Model</th>
                  <th className="py-3 px-4 font-semibold">Fallback Model</th>
                  <th className="py-3 px-4 font-semibold">Cache TTL</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EB]">
                <tr className="hover:bg-[#F8FAFC]">
                  <td className="py-3.5 px-4 font-semibold text-[#0F172A]">
                    Document & Financial Analysis
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-medium">
                      High (Long Context)
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-[#0F172A]">
                    claude-3-5-sonnet
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#64748B]">
                    gpt-4o
                  </td>
                  <td className="py-3.5 px-4 font-mono">12 Hours</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status="success" label="Active" />
                  </td>
                </tr>

                <tr className="hover:bg-[#F8FAFC]">
                  <td className="py-3.5 px-4 font-semibold text-[#0F172A]">
                    Code Generation & Refactoring
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                      High (Technical)
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-[#0F172A]">
                    gpt-4o
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#64748B]">
                    qwen-2.5-coder (Local)
                  </td>
                  <td className="py-3.5 px-4 font-mono">24 Hours</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status="success" label="Active" />
                  </td>
                </tr>

                <tr className="hover:bg-[#F8FAFC]">
                  <td className="py-3.5 px-4 font-semibold text-[#0F172A]">
                    General Q&A / Customer Support
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">
                      Low (Fast Response)
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-[#0F172A]">
                    gemini-1.5-flash
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#64748B]">
                    llama-3-8b (Local)
                  </td>
                  <td className="py-3.5 px-4 font-mono">7 Days</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status="success" label="Active" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
