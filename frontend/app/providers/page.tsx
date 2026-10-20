"use client";

import React, { useState } from "react";
import {
  Server,
  Plus,
  RefreshCw,
  Key,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { mockProviders } from "@/lib/mockData";

export default function ProvidersPage() {
  const [providers] = useState(mockProviders);
  const [testingId, setTestingId] = useState<string | null>(null);

  const handleTestConnection = (id: string) => {
    setTestingId(id);
    setTimeout(() => {
      setTestingId(null);
      alert(`Provider latency ping succeeded: 142ms healthy round-trip.`);
    }, 800);
  };

  return (
    <AppShell
      title="Multi-LLM Provider Abstraction"
      subtitle="Manage unified connectors across OpenAI, Google Gemini, Anthropic Claude, and local Ollama hardware."
    >
      <div className="space-y-6">
        {/* Top Control Bar */}
        <div className="bg-white rounded-2xl border border-[#E4E7EB] p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <Server className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">
                4 Provider Connectors Configured
              </h3>
              <p className="text-xs text-[#64748B]">
                Abstracted OpenAI-compatible interface with dynamic rate limiting.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => alert("Add Custom Provider modal")}
              className="px-3 py-2 rounded-xl bg-[#3382F6] hover:bg-[#2563EB] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Add Provider / Local Host
            </button>
          </div>
        </div>

        {/* Provider Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {providers.map((prov) => (
            <div
              key={prov.id}
              className="bg-white rounded-2xl border border-[#E4E7EB] p-6 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between pb-4 border-b border-[#E4E7EB]">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-[#0F172A]">
                        {prov.name}
                      </h4>
                      <StatusBadge
                        status={prov.status === "healthy" ? "success" : "warning"}
                        label={prov.status}
                      />
                    </div>
                    <span className="text-xs text-[#64748B] block mt-0.5">
                      {prov.type === "local"
                        ? "Local Cluster (Self-Hosted GPU)"
                        : "Cloud Managed Endpoint"}
                    </span>
                  </div>

                  <button
                    onClick={() => handleTestConnection(prov.id)}
                    disabled={testingId === prov.id}
                    className="p-2 rounded-xl border border-[#E4E7EB] bg-[#F8FAFC] hover:bg-white text-xs font-medium text-[#0F172A] inline-flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${
                        testingId === prov.id ? "animate-spin text-blue-600" : ""
                      }`}
                    />
                    <span>{testingId === prov.id ? "Testing..." : "Ping"}</span>
                  </button>
                </div>

                {/* Telemetry Stats */}
                <div className="mt-4 grid grid-cols-4 gap-2 text-center p-3 rounded-xl bg-[#F8FAFC] border border-[#E4E7EB]">
                  <div>
                    <span className="text-[10px] text-[#94A3B8] block">P50 Latency</span>
                    <span className="font-mono text-xs font-bold text-[#0F172A]">
                      {prov.latencyP50}ms
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#94A3B8] block">P95 Latency</span>
                    <span className="font-mono text-xs font-bold text-[#0F172A]">
                      {prov.latencyP95}ms
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#94A3B8] block">24h Uptime</span>
                    <span className="font-mono text-xs font-bold text-emerald-600">
                      {prov.uptime24h}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#94A3B8] block">Cost / 1k</span>
                    <span className="font-mono text-xs font-bold text-[#0F172A]">
                      {prov.costPer1kTokens}
                    </span>
                  </div>
                </div>

                {/* Active Models */}
                <div className="mt-4">
                  <span className="text-xs font-bold text-[#0F172A] block mb-2">
                    Registered Foundation Models
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {prov.models.map((model) => (
                      <span
                        key={model}
                        className="px-2.5 py-1 rounded-lg bg-[#F8FAFC] border border-[#E4E7EB] font-mono text-xs font-medium text-[#0F172A]"
                      >
                        {model}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer Credentials Info */}
              <div className="mt-6 pt-4 border-t border-[#E4E7EB] flex items-center justify-between text-xs text-[#64748B]">
                <div className="flex items-center gap-1.5 font-mono">
                  <Key className="w-3.5 h-3.5 text-[#94A3B8]" />
                  <span>Key: ••••••••••••84f2</span>
                </div>
                <button
                  onClick={() => alert(`Configure credentials for ${prov.name}`)}
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Configure
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
