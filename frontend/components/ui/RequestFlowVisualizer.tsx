"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Cpu,
  Database,
  Sparkles,
  Search,
  CheckCircle2,
} from "lucide-react";

interface PipelineStep {
  id: string;
  name: string;
  tag: string;
  desc: string;
  icon: React.ElementType;
  status: "healthy" | "active" | "alert";
  stat: string;
}

const pipelineSteps: PipelineStep[] = [
  {
    id: "ingress",
    name: "API Ingress",
    tag: "v1/chat",
    desc: "Authentication, rate limiting, and request schema parsing.",
    icon: Search,
    status: "healthy",
    stat: "1,240 req/min",
  },
  {
    id: "analyzer",
    name: "Request Analyzer",
    tag: "Intent & Task",
    desc: "Extracts prompt characteristics, task domain, and context length.",
    icon: Sparkles,
    status: "healthy",
    stat: "2.1ms avg",
  },
  {
    id: "security",
    name: "Prompt Injection Shield",
    tag: "ML Classifier",
    desc: "Evaluates risk against jailbreaks, direct injections, and system prompt leaks.",
    icon: ShieldCheck,
    status: "healthy",
    stat: "99.4% accuracy",
  },
  {
    id: "cache",
    name: "Semantic Cache",
    tag: "Vector Index",
    desc: "Checks embedding distance for cached responses (threshold: 0.92 cosine).",
    icon: Database,
    status: "active",
    stat: "38.2% hit rate",
  },
  {
    id: "router",
    name: "Model Router",
    tag: "Multi-Objective",
    desc: "Balances cost, SLA latency, and required capability with dynamic fallback.",
    icon: Cpu,
    status: "healthy",
    stat: "4 providers",
  },
  {
    id: "evaluator",
    name: "Response Evaluator",
    tag: "Quality & Cost",
    desc: "Calculates token usage, exact cost, latency, and quality verification.",
    icon: CheckCircle2,
    status: "healthy",
    stat: "100% verified",
  },
];

export function RequestFlowVisualizer() {
  const [selectedStep, setSelectedStep] = useState<PipelineStep>(pipelineSteps[2]);

  return (
    <div className="bg-white rounded-2xl border border-[#E4E7EB] p-6 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#E4E7EB] gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[#0F172A]">
              Sentra Gateway Request Pipeline
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live Flow
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            End-to-end lifecycle from client request to model execution and response auditing.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-[#64748B]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Active Gateway
          </span>
          <span className="text-[#CBD5E1]">|</span>
          <span className="font-mono text-[11px] text-[#0F172A] bg-[#F8FAFC] px-2 py-1 rounded border border-[#E4E7EB]">
            P95: 142ms
          </span>
        </div>
      </div>

      {/* Interactive Step Blocks */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-6 gap-3">
        {pipelineSteps.map((step, idx) => {
          const Icon = step.icon;
          const isSelected = selectedStep.id === step.id;

          return (
            <button
              key={step.id}
              onClick={() => setSelectedStep(step)}
              className={`relative text-left p-3.5 rounded-xl border transition-all duration-200 ${
                isSelected
                  ? "bg-blue-50/50 border-[#3382F6] ring-2 ring-blue-500/20 shadow-xs"
                  : "bg-[#F8FAFC] border-[#E4E7EB] hover:bg-white hover:border-[#CBD5E1]"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`p-1.5 rounded-lg border ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-[#64748B] border-[#E4E7EB]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-mono font-medium text-[#64748B]">
                  0{idx + 1}
                </span>
              </div>
              <h4 className="text-xs font-bold text-[#0F172A] truncate">
                {step.name}
              </h4>
              <p className="text-[11px] text-[#64748B] mt-0.5 truncate">
                {step.tag}
              </p>
              <div className="mt-2.5 pt-2 border-t border-[#E4E7EB]/60 flex items-center justify-between text-[10px]">
                <span className="text-[#94A3B8]">Metric</span>
                <span className="font-mono font-semibold text-[#0F172A]">
                  {step.stat}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Step Detail Panel */}
      <div className="mt-5 p-4 rounded-xl bg-[#F8FAFC] border border-[#E4E7EB] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-100/70 text-blue-700 border border-blue-200 mt-0.5">
            <selectedStep.icon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h5 className="text-xs font-bold text-[#0F172A]">
                Stage {pipelineSteps.findIndex((s) => s.id === selectedStep.id) + 1}: {selectedStep.name}
              </h5>
              <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-white text-[#64748B] border border-[#E4E7EB]">
                {selectedStep.tag}
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-1 max-w-2xl leading-relaxed">
              {selectedStep.desc}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-[#94A3B8] block">
              Operational Metric
            </span>
            <span className="text-xs font-mono font-bold text-[#0F172A]">
              {selectedStep.stat}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Normal
          </span>
        </div>
      </div>
    </div>
  );
}
