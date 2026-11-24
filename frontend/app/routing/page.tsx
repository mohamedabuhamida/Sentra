"use client";

import React, { useState, useEffect } from "react";
import {
  Sliders,
  DollarSign,
  Award,
  Plus,
  Trash2,
  Power,
  Lock,
  Loader2,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AdminGuard } from "@/components/ui/AdminGuard";
import { API_BASE_URL } from "@/lib/api";
import { useAuth } from "@/lib/authContext";

interface RoutingRule {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  priority: number;
  match_task_type: string[];
  match_keywords: string[];
  min_complexity?: string;
  force_model?: string;
  routing_strategy: string;
}

export default function RoutingPage() {
  const { token, profile, loading: authLoading } = useAuth();
  const isAdmin = profile?.role === "admin";

  const [activeStrategy, setActiveStrategy] = useState("multi-objective");
  const [rules, setRules] = useState<RoutingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create rule form
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newModel, setNewModel] = useState("gemini-2.5-flash");
  const [newPriority, setNewPriority] = useState(10);
  const [saving, setSaving] = useState(false);

  const loadRules = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/routing`);
      if (res.ok) {
        setRules(await res.json());
      }
    } catch {
      setError("Failed to load routing rules from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const handleToggleRule = async (rule: RoutingRule) => {
    if (!isAdmin || !token) return;
    setError(null);
    const res = await fetch(`${API_BASE_URL}/routing/${rule.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ is_active: !rule.is_active }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setError(err.detail || "Admin permission required to update routing rules.");
      return;
    }
    loadRules();
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !token) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/routing`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newName,
          description: newDesc,
          force_model: newModel,
          priority: newPriority,
          routing_strategy: activeStrategy,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError(err.detail || "Failed to create routing rule.");
      } else {
        setNewName("");
        setNewDesc("");
        setShowNew(false);
        loadRules();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!isAdmin || !token) return;
    const res = await fetch(`${API_BASE_URL}/routing/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) loadRules();
  };

  if (authLoading) {
    return (
      <AppShell title="Model Routing" subtitle="Loading routing permissions...">
        <div className="flex items-center justify-center py-24 text-xs text-[#64748B]">
          <Loader2 className="w-4 h-4 animate-spin mr-2 text-[#3382F6]" />
          Verifying workspace permissions...
        </div>
      </AppShell>
    );
  }

  if (!isAdmin) {
    return (
      <AppShell title="Model Routing" subtitle="Admin-only routing policies">
        <AdminGuard pageName="Model Routing policies" />
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Intelligent Model Routing & Fallback Policies"
      subtitle="Live routing rules stored in Supabase `routing_rules` with role-based admin control."
    >
      <div className="space-y-6">
        {!isAdmin && (
          <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
            <Lock className="w-4 h-4 shrink-0" />
            <span>
              <strong>Viewer Mode (Read-Only):</strong> Your role is{" "}
              <code className="font-mono">{profile?.role || "viewer"}</code>. Only{" "}
              <strong>admin</strong> users can create, toggle, or delete routing rules.
            </span>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
            {error}
          </div>
        )}

        {/* Strategy Selector — horizontal tab strip */}
        <div className="bg-white border border-[#E4E7EB] rounded-2xl p-1.5 flex gap-1">
          {[
            {
              key: "multi-objective",
              title: "Multi-objective router",
              desc: "Balances cost, quality, and SLA latency",
              icon: Sliders,
            },
            {
              key: "cost-first",
              title: "Cost minimizer",
              desc: "Gemini Flash and Llama 3 for standard tasks",
              icon: DollarSign,
            },
            {
              key: "quality-first",
              title: "Quality frontier",
              desc: "Claude 3.5 Sonnet and GPT-4o guaranteed",
              icon: Award,
            },
          ].map((s) => {
            const Icon = s.icon;
            const active = activeStrategy === s.key;
            return (
              <button
                key={s.key}
                onClick={() => setActiveStrategy(s.key)}
                className={`flex-1 flex items-center gap-2.5 px-4 py-3 rounded-xl text-left transition-all ${
                  active
                    ? "bg-[#0F172A] text-white shadow-sm"
                    : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? "text-blue-300" : ""}`} />
                <div className="min-w-0">
                  <span className={`block text-xs font-semibold ${active ? "text-white" : "text-[#0F172A]"}`}>
                    {s.title}
                  </span>
                  <span className={`block text-[11px] truncate mt-0.5 ${active ? "text-slate-400" : "text-[#94A3B8]"}`}>
                    {s.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Live Routing Rules Table */}
        <div className="bg-white rounded-2xl border border-[#E4E7EB] p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-[#E4E7EB]">
            <div>
              <h3 className="text-base font-bold text-[#0F172A]">
                Database Routing Rules (`public.routing_rules`)
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                {rules.length} rule(s) loaded from Supabase PostgreSQL.
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowNew(!showNew)}
                className="px-3 py-2 rounded-xl bg-[#3382F6] hover:bg-[#2563EB] text-white text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Routing Rule
              </button>
            )}
          </div>

          {showNew && isAdmin && (
            <form onSubmit={handleCreateRule} className="mt-4 p-4 rounded-xl bg-[#F8FAFC] border border-[#E4E7EB] grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Rule name (e.g. Code Generation)"
                className="px-3 py-2 rounded-lg border border-[#E4E7EB] bg-white text-xs"
              />
              <input
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Description"
                className="px-3 py-2 rounded-lg border border-[#E4E7EB] bg-white text-xs"
              />
              <input
                value={newModel}
                onChange={(e) => setNewModel(e.target.value)}
                placeholder="Force model (e.g. gpt-4o)"
                className="px-3 py-2 rounded-lg border border-[#E4E7EB] bg-white text-xs font-mono"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  value={newPriority}
                  onChange={(e) => setNewPriority(Number(e.target.value))}
                  className="w-20 px-3 py-2 rounded-lg border border-[#E4E7EB] bg-white text-xs"
                />
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-3 py-2 rounded-lg bg-[#3382F6] text-white text-xs font-semibold flex items-center justify-center gap-1"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save"}
                </button>
              </div>
            </form>
          )}

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E4E7EB] text-[#64748B] bg-[#F8FAFC]">
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Rule Name</th>
                  <th className="py-3 px-4">Strategy</th>
                  <th className="py-3 px-4">Target Model</th>
                  <th className="py-3 px-4">Status</th>
                  {isAdmin && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EB]">
                {rules.map((r) => (
                  <tr key={r.id} className="hover:bg-[#F8FAFC]">
                    <td className="py-3 px-4 font-mono font-bold">#{r.priority}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-[#0F172A] block">{r.name}</span>
                      {r.description && <span className="text-[11px] text-[#64748B]">{r.description}</span>}
                    </td>
                    <td className="py-3 px-4 font-mono">{r.routing_strategy}</td>
                    <td className="py-3 px-4 font-mono text-blue-600">{r.force_model || "Auto"}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={r.is_active ? "success" : "neutral"} label={r.is_active ? "Active" : "Paused"} />
                    </td>
                    {isAdmin && (
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleToggleRule(r)}
                          className="p-1.5 rounded-lg border border-[#E4E7EB] hover:bg-white text-[#64748B]"
                          title="Toggle rule"
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRule(r.id)}
                          className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600"
                          title="Delete rule"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                {rules.length === 0 && !loading && (
                  <tr>
                    <td colSpan={isAdmin ? 6 : 5} className="py-8 text-center text-[#64748B]">
                      No routing rules in Supabase yet. {isAdmin ? "Click 'Add Routing Rule' to create one." : ""}
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
