"use client";

import React, { useState } from "react";
import {
  Shield,
  Database,
  Save,
  CheckCircle2,
  Server,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default function SettingsPage() {
  const [gatewayName, setGatewayName] = useState("Sentra Enterprise Gateway Cluster");
  const [defaultTimeoutMs, setDefaultTimeoutMs] = useState(4000);
  const [cacheTtlHours, setCacheTtlHours] = useState(24);
  const [webhookUrl, setWebhookUrl] = useState("https://hooks.slack.com/services/T00/B00/X00");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AppShell
      title="System Settings & Infrastructure Configuration"
      subtitle="Configure gateway timeouts, security alert integrations, vector caching engines, and team permissions."
    >
      <div className="space-y-6 max-w-4xl">
        {/* General Gateway Config */}
        <div className="bg-white rounded-2xl border border-[#E4E7EB] p-6 shadow-xs">
          <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 pb-3 border-b border-[#E4E7EB]">
            <Server className="w-4 h-4 text-blue-600" />
            General Gateway Parameters
          </h3>

          <div className="mt-4 space-y-4 text-xs">
            <div>
              <label className="font-semibold text-[#0F172A] block mb-1.5">
                Cluster Identifier
              </label>
              <input
                type="text"
                value={gatewayName}
                onChange={(e) => setGatewayName(e.target.value)}
                className="w-full p-2.5 bg-[#F8FAFC] border border-[#E4E7EB] rounded-xl text-xs font-medium text-[#0F172A] focus:outline-none focus:border-[#3382F6] focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-[#0F172A] block mb-1.5">
                  Provider Timeout SLA (ms)
                </label>
                <input
                  type="number"
                  value={defaultTimeoutMs}
                  onChange={(e) => setDefaultTimeoutMs(Number(e.target.value))}
                  className="w-full p-2.5 bg-[#F8FAFC] border border-[#E4E7EB] rounded-xl text-xs font-mono text-[#0F172A] focus:outline-none focus:border-[#3382F6] focus:bg-white"
                />
                <span className="text-[10px] text-[#94A3B8] mt-1 block">
                  Triggers secondary fallback if exceeded.
                </span>
              </div>

              <div>
                <label className="font-semibold text-[#0F172A] block mb-1.5">
                  Default Semantic Cache TTL (Hours)
                </label>
                <input
                  type="number"
                  value={cacheTtlHours}
                  onChange={(e) => setCacheTtlHours(Number(e.target.value))}
                  className="w-full p-2.5 bg-[#F8FAFC] border border-[#E4E7EB] rounded-xl text-xs font-mono text-[#0F172A] focus:outline-none focus:border-[#3382F6] focus:bg-white"
                />
                <span className="text-[10px] text-[#94A3B8] mt-1 block">
                  Expiration for vector distance entries.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Webhook Alerts */}
        <div className="bg-white rounded-2xl border border-[#E4E7EB] p-6 shadow-xs">
          <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 pb-3 border-b border-[#E4E7EB]">
            <Shield className="w-4 h-4 text-rose-600" />
            Security Incident Webhooks & SIEM Ingestion
          </h3>

          <div className="mt-4 space-y-4 text-xs">
            <div>
              <label className="font-semibold text-[#0F172A] block mb-1.5">
                Slack / Discord / PagerDuty Webhook URL
              </label>
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full p-2.5 bg-[#F8FAFC] border border-[#E4E7EB] rounded-xl text-xs font-mono text-[#0F172A] focus:outline-none focus:border-[#3382F6] focus:bg-white"
              />
              <span className="text-[10px] text-[#94A3B8] mt-1 block">
                Dispatches instant payload on high-risk prompt injection blocks.
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E4E7EB] flex items-center justify-between">
              <div>
                <span className="font-semibold text-[#0F172A] block">
                  Strict OWASP LLM01 Enforcement
                </span>
                <span className="text-[11px] text-[#64748B]">
                  Immediately quarantine repeated malicious actors.
                </span>
              </div>
              <StatusBadge status="success" label="Enabled" />
            </div>
          </div>
        </div>

        {/* Vector Engine Backend */}
        <div className="bg-white rounded-2xl border border-[#E4E7EB] p-6 shadow-xs">
          <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 pb-3 border-b border-[#E4E7EB]">
            <Database className="w-4 h-4 text-purple-600" />
            Vector Search & Cache Backend
          </h3>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/40">
              <span className="font-bold text-[#0F172A] block">
                PostgreSQL + pgvector
              </span>
              <p className="text-[11px] text-[#64748B] mt-1">
                Persistent relational data + HNSW index for high dimensional embeddings.
              </p>
              <div className="mt-3">
                <StatusBadge status="success" label="Connected (port 5432)" />
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-[#E4E7EB] bg-[#F8FAFC]">
              <span className="font-bold text-[#0F172A] block">
                Redis In-Memory Tier
              </span>
              <p className="text-[11px] text-[#64748B] mt-1">
                Sub-millisecond token bucket rate limits and request de-duplication.
              </p>
              <div className="mt-3">
                <StatusBadge status="success" label="Connected (port 6379)" />
              </div>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#94A3B8]">
            Last updated by admin@sentra.ai • Revision 12
          </span>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-[#3382F6] hover:bg-[#2563EB] text-white text-xs font-bold inline-flex items-center gap-2 shadow-xs transition-colors"
          >
            {saved ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Saved Changes!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Configuration</span>
              </>
            )}
          </button>
        </div>
      </div>
    </AppShell>
  );
}
