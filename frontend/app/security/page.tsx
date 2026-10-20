"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  AlertOctagon,
  Sliders,
  Flame,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { KPICard } from "@/components/ui/KPICard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { mockSecurityEvents } from "@/lib/mockData";

export default function SecurityPage() {
  const [blockThreshold, setBlockThreshold] = useState(85);
  const [sanitizeThreshold, setSanitizeThreshold] = useState(60);

  return (
    <AppShell
      title="Cybersecurity & Prompt Injection Shield"
      subtitle="Defend LLM endpoints against prompt injection, jailbreaks, system prompt extraction, and role exploits."
    >
      <div className="space-y-6">
        {/* Security KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Prompts Evaluated"
            value="65,050"
            change="100% scanned"
            isPositiveChange={true}
            timeframe="all active endpoints"
            icon={ShieldCheck}
            iconColor="blue"
          />
          <KPICard
            title="Injection Attacks Blocked"
            value="342"
            change="0.71% threat rate"
            isPositiveChange={false}
            timeframe="0 breached"
            icon={ShieldAlert}
            iconColor="rose"
          />
          <KPICard
            title="Classifier Accuracy"
            value="99.4%"
            change="0.12% false pos"
            isPositiveChange={true}
            timeframe="DeBERTa-v3 model"
            icon={Lock}
            iconColor="emerald"
          />
          <KPICard
            title="Avg Shield Overhead"
            value="4.2ms"
            change="negligible impact"
            isPositiveChange={true}
            timeframe="pre-execution scan"
            icon={AlertOctagon}
            iconColor="violet"
          />
        </div>

        {/* Threat Categories & Threshold Sliders */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Attack Categories Breakdown (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E4E7EB] p-6 shadow-xs">
            <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-600" />
              OWASP Top 10 LLM Threat Taxonomy
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Threat detection rates classified by the Sentra NLP security pipeline.
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-[#0F172A]">
                    Direct Prompt Injection (Instruction Overwrite)
                  </span>
                  <span className="font-mono font-bold text-rose-600">
                    144 attacks (42%)
                  </span>
                </div>
                <div className="w-full bg-[#F4F4F5] rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-rose-500 h-2 rounded-full"
                    style={{ width: "42%" }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-[#0F172A]">
                    Jailbreaks & Uncensored Persona (DAN, Roleplay)
                  </span>
                  <span className="font-mono font-bold text-amber-600">
                    96 attacks (28%)
                  </span>
                </div>
                <div className="w-full bg-[#F4F4F5] rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-amber-500 h-2 rounded-full"
                    style={{ width: "28%" }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-[#0F172A]">
                    System Prompt & Internal Instruction Extraction
                  </span>
                  <span className="font-mono font-bold text-purple-600">
                    62 attacks (18%)
                  </span>
                </div>
                <div className="w-full bg-[#F4F4F5] rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: "18%" }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-[#0F172A]">
                    Context Manipulation & Delimiter Hijacking
                  </span>
                  <span className="font-mono font-bold text-blue-600">
                    40 attacks (12%)
                  </span>
                </div>
                <div className="w-full bg-[#F4F4F5] rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: "12%" }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E4E7EB] grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E4E7EB]">
                <span className="text-[10px] text-[#94A3B8] block">Primary Model</span>
                <span className="text-xs font-mono font-bold text-[#0F172A]">
                  DeBERTa-v3 Fine-tuned
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E4E7EB]">
                <span className="text-[10px] text-[#94A3B8] block">Vector Heuristics</span>
                <span className="text-xs font-mono font-bold text-emerald-600">
                  Cosine Threshold 0.88
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E4E7EB]">
                <span className="text-[10px] text-[#94A3B8] block">Rules Engine</span>
                <span className="text-xs font-mono font-bold text-[#0F172A]">
                  128 Signatures Active
                </span>
              </div>
            </div>
          </div>

          {/* Action Threshold Configuration (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E4E7EB] p-6 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                Automated Risk Action Thresholds
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Set autonomous mitigation policy based on ML risk probability.
              </p>

              <div className="mt-6 space-y-6">
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="font-semibold text-rose-700">
                      Block & Abort (HTTP 403 Forbidden)
                    </span>
                    <span className="font-mono font-bold text-rose-700">
                      Risk &gt; {blockThreshold}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="99"
                    value={blockThreshold}
                    onChange={(e) => setBlockThreshold(Number(e.target.value))}
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                  <p className="text-[11px] text-[#94A3B8] mt-1">
                    Completely drops connection, returns security advisory payload.
                  </p>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="font-semibold text-amber-700">
                      Sanitize & Strip Prompt Directives
                    </span>
                    <span className="font-mono font-bold text-amber-700">
                      Risk &gt; {sanitizeThreshold}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max={blockThreshold - 5}
                    value={sanitizeThreshold}
                    onChange={(e) => setSanitizeThreshold(Number(e.target.value))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                  <p className="text-[11px] text-[#94A3B8] mt-1">
                    Strips override instructions while preserving the underlying benign query.
                  </p>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="font-semibold text-emerald-700">
                      Allow & Forward to Router
                    </span>
                    <span className="font-mono font-bold text-emerald-700">
                      Risk &lt; {sanitizeThreshold}%
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                    Requests pass cleanly to semantic cache & LLM provider.
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E4E7EB] flex items-center justify-between">
              <span className="text-xs text-[#64748B]">Auto-ban malicious IPs:</span>
              <StatusBadge status="success" label="Active (3+ attempts)" />
            </div>
          </div>
        </div>

        {/* Real-time Threat Intercept Feed */}
        <div className="bg-white rounded-2xl border border-[#E4E7EB] p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-[#E4E7EB]">
            <div>
              <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                Live Malicious Intercept Log
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Every prompt injection attempt captured before reaching foundation models.
              </p>
            </div>
            <StatusBadge status="danger" label="Firewall Enforced" />
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E4E7EB] text-[#64748B] bg-[#F8FAFC]">
                  <th className="py-3 px-4 font-semibold">Incident ID</th>
                  <th className="py-3 px-4 font-semibold">Time</th>
                  <th className="py-3 px-4 font-semibold">Attack Category</th>
                  <th className="py-3 px-4 font-semibold">Risk Score</th>
                  <th className="py-3 px-4 font-semibold">Rule Triggered</th>
                  <th className="py-3 px-4 font-semibold">Malicious Payload Snippet</th>
                  <th className="py-3 px-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EB]">
                {mockSecurityEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-[#F8FAFC]">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#0F172A]">
                      {event.id}
                    </td>
                    <td className="py-3.5 px-4 text-[#64748B] whitespace-nowrap">
                      {event.timestamp}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#0F172A]">
                      {event.attackType}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-rose-600">
                      {(event.riskScore * 100).toFixed(0)}%
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#64748B]">
                      {event.matchedRule}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-[#0F172A] max-w-xs truncate">
                      {event.snippet}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-rose-50 text-rose-700 border border-rose-200">
                        {event.actionTaken}
                      </span>
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
