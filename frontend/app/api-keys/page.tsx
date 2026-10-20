"use client";

import React, { useState } from "react";
import {
  Plus,
  Copy,
  Trash2,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface ApiKeyItem {
  id: string;
  name: string;
  prefix: string;
  scope: string;
  createdAt: string;
  lastUsed: string;
  status: "active" | "revoked";
  requestsCount: string;
}

export default function ApiKeysPage() {
  const [keys] = useState<ApiKeyItem[]>([
    {
      id: "key_1",
      name: "Production Backend Cluster",
      prefix: "sk_live_sentra_98a7****************3b",
      scope: "Full Access (Inference + Routing)",
      createdAt: "Oct 12, 2026",
      lastUsed: "2 mins ago",
      status: "active",
      requestsCount: "54,210",
    },
    {
      id: "key_2",
      name: "Staging & Integration Test",
      prefix: "sk_test_sentra_44c1****************1f",
      scope: "Restricted (Inference Only)",
      createdAt: "Oct 18, 2026",
      lastUsed: "1 hour ago",
      status: "active",
      requestsCount: "8,940",
    },
    {
      id: "key_3",
      name: "Legacy Analytics Ingest",
      prefix: "sk_live_sentra_11e0****************99",
      scope: "Read Only",
      createdAt: "Aug 20, 2026",
      lastUsed: "Never",
      status: "revoked",
      requestsCount: "1,900",
    },
  ]);

  return (
    <AppShell
      title="Gateway API Keys & Access Tokens"
      subtitle="Issue and manage secure bearer tokens with granular rate limits and routing scopes."
    >
      <div className="space-y-6">
        {/* Top Control Bar */}
        <div className="bg-white rounded-2xl border border-[#E4E7EB] p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-[#0F172A]">
              Client Authentication Keys
            </h3>
            <p className="text-xs text-[#64748B]">
              Include this secret in your HTTP Authorization header:{" "}
              <code className="px-1.5 py-0.5 rounded bg-[#F8FAFC] font-mono text-[11px] border border-[#E4E7EB]">
                Bearer sk_live_...
              </code>
            </p>
          </div>

          <button
            onClick={() => alert("Generate New Sentra Gateway API Key modal")}
            className="px-3 py-2 rounded-xl bg-[#3382F6] hover:bg-[#2563EB] text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Secret Key
          </button>
        </div>

        {/* Keys Table */}
        <div className="bg-white rounded-2xl border border-[#E4E7EB] p-6 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E4E7EB] text-[#64748B] bg-[#F8FAFC]">
                  <th className="py-3 px-4 font-semibold">Key Identifier & Name</th>
                  <th className="py-3 px-4 font-semibold">Secret Prefix</th>
                  <th className="py-3 px-4 font-semibold">Scope</th>
                  <th className="py-3 px-4 font-semibold">Created</th>
                  <th className="py-3 px-4 font-semibold">Last Inbound Request</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EB]">
                {keys.map((k) => (
                  <tr key={k.id} className="hover:bg-[#F8FAFC]">
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-[#0F172A] block">
                        {k.name}
                      </span>
                      <span className="font-mono text-[10px] text-[#94A3B8]">
                        {k.id}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-[#0F172A]">
                      {k.prefix}
                    </td>
                    <td className="py-3.5 px-4 text-[#64748B]">{k.scope}</td>
                    <td className="py-3.5 px-4 text-[#64748B]">{k.createdAt}</td>
                    <td className="py-3.5 px-4 text-[#64748B]">{k.lastUsed}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge
                        status={k.status === "active" ? "success" : "neutral"}
                        label={k.status.toUpperCase()}
                      />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        title="Copy Key Token"
                        onClick={() => alert(`Copied token ${k.prefix}`)}
                        className="p-1.5 rounded-lg border border-[#E4E7EB] hover:bg-[#F8FAFC] text-[#64748B]"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        title="Revoke Key"
                        onClick={() => alert(`Revoked key ${k.name}`)}
                        className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
