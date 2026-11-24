"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  RefreshCw,
  Key,
  Power,
  ChevronDown,
  X,
  Trash2,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Circle,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { AdminGuard } from "@/components/ui/AdminGuard";
import { API_BASE_URL } from "@/lib/api";
import { useAuth } from "@/lib/authContext";

interface Provider {
  id: string;
  name: string;
  display_name: string;
  base_url?: string;
  default_model?: string;
  is_active: boolean;
  priority: number;
  cost_per_1k_tokens: number;
  avg_latency_ms: number;
  success_rate: number;
  has_api_key?: boolean;
  api_key_source?: "database" | "env" | "none";
  api_key_masked?: string;
}

// Provider brand colors (subtle left-strip accent)
const PROVIDER_ACCENTS: Record<string, string> = {
  openai: "#10B981",
  gemini: "#3382F6",
  google: "#3382F6",
  anthropic: "#8B5CF6",
  ollama: "#F59E0B",
};

function providerAccent(name: string): string {
  return PROVIDER_ACCENTS[name.toLowerCase()] ?? "#64748B";
}

function KeyBadge({ prov }: { prov: Provider }) {
  if (prov.has_api_key) {
    if (prov.api_key_source === "database") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-2 py-0.5">
          <Key className="w-3 h-3" />
          {prov.api_key_masked}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-sky-700 bg-sky-50 border border-sky-200 rounded-md px-2 py-0.5">
        <Key className="w-3 h-3" />
        .env {prov.api_key_masked}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-2 py-0.5">
      <AlertTriangle className="w-3 h-3" />
      No key — simulated
    </span>
  );
}

export default function ProvidersPage() {
  const { token, profile, loading: authLoading } = useAuth();
  const isAdmin = profile?.role === "admin";

  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editState, setEditState] = useState<Partial<Provider> & { api_key?: string }>({});
  const [saving, setSaving] = useState(false);
  const [pingResults, setPingResults] = useState<Record<string, { latency_ms: number; status: string }>>({});
  const [testingId, setTestingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProvider, setNewProvider] = useState({
    name: "", display_name: "", priority: 1,
    cost_per_1k_tokens: 0.002, base_url: "", default_model: "", api_key: "",
  });

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/providers`);
      if (res.ok) setProviders(await res.json());
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProviders(); }, []);

  const toggleExpand = (prov: Provider) => {
    if (expandedId === prov.id) {
      setExpandedId(null);
      setEditState({});
    } else {
      setExpandedId(prov.id);
      setEditState({ ...prov, api_key: "" });
    }
  };

  const handleSave = async (clearKey = false) => {
    if (!editState.id || !token) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        display_name: editState.display_name,
        cost_per_1k_tokens: editState.cost_per_1k_tokens,
        base_url: editState.base_url,
        priority: editState.priority,
        default_model: editState.default_model,
      };
      if (clearKey) {
        payload.api_key = "";
      } else if (editState.api_key?.trim()) {
        payload.api_key = editState.api_key.trim();
      }
      const res = await fetch(`${API_BASE_URL}/providers/${editState.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setExpandedId(null);
        setEditState({});
        await fetchProviders();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.detail || "Save failed");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (prov: Provider) => {
    if (!token) return;
    setProviders(prev => prev.map(p => p.id === prov.id ? { ...p, is_active: !p.is_active } : p));
    const res = await fetch(`${API_BASE_URL}/providers/${prov.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ is_active: !prov.is_active }),
    });
    if (!res.ok) fetchProviders();
  };

  const handlePriorityChange = async (prov: Provider, newPriority: number) => {
    if (!token) return;
    setProviders(prev => prev.map(p => p.id === prov.id ? { ...p, priority: newPriority } : p));
    const res = await fetch(`${API_BASE_URL}/providers/${prov.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ priority: newPriority }),
    });
    if (!res.ok) fetchProviders();
  };

  const handlePing = async (prov: Provider) => {
    setTestingId(prov.id);
    try {
      const res = await fetch(`${API_BASE_URL}/providers/${prov.name}/ping`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setPingResults(prev => ({ ...prev, [prov.id]: { latency_ms: data.latency_ms, status: data.status } }));
      }
    } finally {
      setTestingId(null);
    }
  };

  const handleDelete = async (prov: Provider) => {
    if (!token) return;
    if (!confirm(`Remove "${prov.display_name}"? This cannot be undone.`)) return;
    const res = await fetch(`${API_BASE_URL}/providers/${prov.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setProviders(prev => prev.filter(p => p.id !== prov.id));
    else alert("Delete failed");
  };

  const handleCreateProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    const res = await fetch(`${API_BASE_URL}/providers`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(newProvider),
    });
    if (res.ok) {
      setShowAddModal(false);
      setNewProvider({ name: "", display_name: "", priority: 1, cost_per_1k_tokens: 0.002, base_url: "", default_model: "", api_key: "" });
      fetchProviders();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.detail || "Could not register provider");
    }
  };

  if (authLoading) {
    return (
      <AppShell title="LLM Providers" subtitle="Loading...">
        <div className="flex items-center justify-center py-32 text-sm text-[#64748B]">
          <RefreshCw className="w-4 h-4 animate-spin mr-2 text-[#3382F6]" />
          Verifying permissions…
        </div>
      </AppShell>
    );
  }

  if (!isAdmin) {
    return (
      <AppShell title="LLM Providers" subtitle="Admin access required">
        <AdminGuard pageName="the LLM Providers configuration" />
      </AppShell>
    );
  }

  const activeCount = providers.filter(p => p.is_active).length;

  return (
    <AppShell
      title="LLM Providers"
      subtitle="Configure inference endpoints, API keys, routing priorities, and model defaults."
    >
      <div className="space-y-5">

        {/* Header bar */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[22px] font-bold tracking-tight text-[#0F172A] leading-none">
              {providers.length} providers
            </h2>
            <p className="mt-1 text-sm text-[#64748B]">
              {activeCount} active · {providers.length - activeCount} disabled
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add provider
          </button>
        </div>

        {/* Provider list */}
        <div className="rounded-2xl border border-[#E4E7EB] bg-white overflow-hidden shadow-sm">
          {loading && providers.length === 0 ? (
            <div className="py-20 text-center text-sm text-[#64748B]">
              <RefreshCw className="w-4 h-4 animate-spin inline mr-2 text-[#3382F6]" />
              Loading providers…
            </div>
          ) : providers.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-sm text-[#64748B]">No providers configured.</p>
              <button onClick={() => setShowAddModal(true)} className="mt-3 text-sm text-[#3382F6] font-semibold hover:underline">
                Add your first provider →
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-[#E4E7EB]">
              {providers.map((prov) => {
                const isExpanded = expandedId === prov.id;
                const ping = pingResults[prov.id];
                const accent = providerAccent(prov.name);
                const latency = ping ? ping.latency_ms : (prov.avg_latency_ms || 120);

                return (
                  <li key={prov.id} className={`transition-colors ${isExpanded ? "bg-[#F8FAFC]" : "hover:bg-[#FAFBFC]"}`}>
                    {/* Row summary */}
                    <div className="flex items-center gap-0">
                      {/* Priority / status strip */}
                      <div
                        className="self-stretch w-1 shrink-0 rounded-tl-lg rounded-bl-lg"
                        style={{ backgroundColor: prov.is_active ? accent : "#CBD5E1" }}
                      />

                      <div className="flex-1 flex items-center gap-4 px-5 py-4">
                        {/* Provider identity */}
                        <div className="w-52 shrink-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[15px] text-[#0F172A] leading-tight">
                              {prov.display_name}
                            </span>
                            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold rounded-full px-2 py-0.5 ${
                              prov.is_active
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                            }`}>
                              <Circle className="w-1.5 h-1.5 fill-current" />
                              {prov.is_active ? "active" : "off"}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#94A3B8] font-mono mt-0.5 block">{prov.name}</span>
                        </div>

                        {/* Priority selector */}
                        <div className="shrink-0">
                          <select
                            value={prov.priority}
                            onChange={(e) => handlePriorityChange(prov, Number(e.target.value))}
                            className="rounded-lg border border-[#E4E7EB] bg-white text-xs font-mono font-bold text-[#0F172A] px-2 py-1.5 focus:outline-none focus:border-[#3382F6] cursor-pointer"
                          >
                            {[1,2,3,4,5,6,7,8].map(n => (
                              <option key={n} value={n}>P{n}</option>
                            ))}
                          </select>
                        </div>

                        {/* Model */}
                        <div className="hidden md:block w-44 shrink-0">
                          <span className="font-mono text-xs text-[#0F172A] bg-[#F1F5F9] px-2.5 py-1 rounded-lg border border-[#E4E7EB] inline-block">
                            {prov.default_model || "auto"}
                          </span>
                        </div>

                        {/* API Key */}
                        <div className="hidden lg:block flex-1 min-w-0">
                          <KeyBadge prov={prov} />
                        </div>

                        {/* Latency */}
                        <div className="hidden xl:block w-24 shrink-0 text-right">
                          <span className="font-mono text-sm font-bold text-[#0F172A]">
                            {Math.round(latency)}ms
                          </span>
                          <span className="block text-[11px] text-[#94A3B8] font-mono">
                            ${prov.cost_per_1k_tokens.toFixed(5)}/1k
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                          <button
                            onClick={() => handlePing(prov)}
                            disabled={testingId === prov.id}
                            title="Ping"
                            className="p-2 rounded-lg border border-[#E4E7EB] hover:bg-white text-[#64748B] hover:text-[#3382F6] transition-colors"
                          >
                            <Zap className={`w-3.5 h-3.5 ${testingId === prov.id ? "animate-pulse text-[#3382F6]" : ""}`} />
                          </button>

                          <button
                            onClick={() => handleToggleActive(prov)}
                            title={prov.is_active ? "Disable" : "Enable"}
                            className={`p-2 rounded-lg border transition-colors ${
                              prov.is_active
                                ? "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                : "border-[#E4E7EB] bg-[#F8FAFC] text-[#94A3B8] hover:bg-white hover:text-[#64748B]"
                            }`}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => toggleExpand(prov)}
                            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                              isExpanded
                                ? "bg-[#0F172A] border-[#0F172A] text-white"
                                : "bg-white border-[#E4E7EB] text-[#0F172A] hover:border-[#CBD5E1]"
                            }`}
                          >
                            Configure
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                          </button>

                          <button
                            onClick={() => handleDelete(prov)}
                            title="Remove provider"
                            className="p-2 rounded-lg border border-transparent hover:border-rose-200 hover:bg-rose-50 text-[#CBD5E1] hover:text-rose-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded config drawer */}
                    {isExpanded && (
                      <div className="border-t border-[#E4E7EB] bg-white px-6 py-6">
                        <h4 className="text-sm font-bold text-[#0F172A] mb-5">
                          Configure {editState.display_name || prov.display_name}
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                          <div>
                            <label className="block text-xs font-semibold text-[#64748B] mb-1.5">Display name</label>
                            <input
                              type="text"
                              value={editState.display_name || ""}
                              onChange={e => setEditState(s => ({ ...s, display_name: e.target.value }))}
                              className="w-full rounded-xl border border-[#E4E7EB] bg-[#F8FAFC] py-2.5 px-3.5 text-sm text-[#0F172A] focus:bg-white focus:outline-none focus:border-[#3382F6] transition-colors"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-[#64748B] mb-1.5">Default model</label>
                            <input
                              type="text"
                              value={editState.default_model || ""}
                              onChange={e => setEditState(s => ({ ...s, default_model: e.target.value }))}
                              placeholder="e.g. gpt-4o, gemini-2.5-flash"
                              className="w-full rounded-xl border border-[#E4E7EB] bg-[#F8FAFC] py-2.5 px-3.5 text-sm font-mono text-[#0F172A] focus:bg-white focus:outline-none focus:border-[#3382F6] transition-colors"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-[#64748B] mb-1.5">Base URL</label>
                            <input
                              type="text"
                              value={editState.base_url || ""}
                              onChange={e => setEditState(s => ({ ...s, base_url: e.target.value }))}
                              placeholder="https://api.openai.com/v1"
                              className="w-full rounded-xl border border-[#E4E7EB] bg-[#F8FAFC] py-2.5 px-3.5 text-sm font-mono text-[#0F172A] focus:bg-white focus:outline-none focus:border-[#3382F6] transition-colors"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-[#64748B] mb-1.5">Cost per 1k tokens (USD)</label>
                            <input
                              type="number"
                              step="0.0001"
                              value={editState.cost_per_1k_tokens ?? ""}
                              onChange={e => setEditState(s => ({ ...s, cost_per_1k_tokens: parseFloat(e.target.value) || 0 }))}
                              className="w-full rounded-xl border border-[#E4E7EB] bg-[#F8FAFC] py-2.5 px-3.5 text-sm font-mono text-[#0F172A] focus:bg-white focus:outline-none focus:border-[#3382F6] transition-colors"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-[#64748B] mb-1.5">Routing priority</label>
                            <input
                              type="number"
                              min={1}
                              max={10}
                              value={editState.priority ?? ""}
                              onChange={e => setEditState(s => ({ ...s, priority: parseInt(e.target.value) || 1 }))}
                              className="w-full rounded-xl border border-[#E4E7EB] bg-[#F8FAFC] py-2.5 px-3.5 text-sm font-mono text-[#0F172A] focus:bg-white focus:outline-none focus:border-[#3382F6] transition-colors"
                            />
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="text-xs font-semibold text-[#64748B]">API key</label>
                              {prov.api_key_source === "database" && (
                                <button
                                  onClick={() => handleSave(true)}
                                  className="text-[11px] font-semibold text-rose-500 hover:text-rose-600"
                                >
                                  Remove key
                                </button>
                              )}
                            </div>
                            <input
                              type="password"
                              value={editState.api_key || ""}
                              onChange={e => setEditState(s => ({ ...s, api_key: e.target.value }))}
                              placeholder={
                                prov.has_api_key
                                  ? `${prov.api_key_masked} — paste to rotate`
                                  : "sk-… or AIza… (encrypted at rest)"
                              }
                              className="w-full rounded-xl border border-[#E4E7EB] bg-[#F8FAFC] py-2.5 px-3.5 text-sm font-mono text-[#0F172A] focus:bg-white focus:outline-none focus:border-[#3382F6] transition-colors"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-6 pt-5 border-t border-[#E4E7EB]">
                          <div className="text-[11px] font-mono text-[#94A3B8]">
                            id: {prov.id.slice(0, 16)}…
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => { setExpandedId(null); setEditState({}); }}
                              className="px-4 py-2 rounded-xl border border-[#E4E7EB] text-sm font-semibold text-[#64748B] hover:bg-[#F8FAFC] transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSave(false)}
                              disabled={saving}
                              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#3382F6] hover:bg-[#2563EB] text-white text-sm font-semibold transition-colors disabled:opacity-60"
                            >
                              {saving ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              )}
                              Save changes
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Add Provider Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-[#E4E7EB] overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4E7EB]">
                <h3 className="text-base font-bold text-[#0F172A]">Add provider</h3>
                <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-lg text-[#94A3B8] hover:bg-[#F8FAFC] hover:text-[#64748B] transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateProvider} className="px-6 py-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#64748B] mb-1.5">Provider slug</label>
                    <input
                      required
                      type="text"
                      placeholder="groq, vllm-local…"
                      value={newProvider.name}
                      onChange={e => setNewProvider(s => ({ ...s, name: e.target.value }))}
                      className="w-full rounded-xl border border-[#E4E7EB] bg-[#F8FAFC] py-2.5 px-3.5 text-sm font-mono focus:bg-white focus:outline-none focus:border-[#3382F6] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#64748B] mb-1.5">Display name</label>
                    <input
                      required
                      type="text"
                      placeholder="Groq (Llama 3 70B)"
                      value={newProvider.display_name}
                      onChange={e => setNewProvider(s => ({ ...s, display_name: e.target.value }))}
                      className="w-full rounded-xl border border-[#E4E7EB] bg-[#F8FAFC] py-2.5 px-3.5 text-sm focus:bg-white focus:outline-none focus:border-[#3382F6] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#64748B] mb-1.5">Default model</label>
                    <input
                      type="text"
                      placeholder="llama-3-70b"
                      value={newProvider.default_model}
                      onChange={e => setNewProvider(s => ({ ...s, default_model: e.target.value }))}
                      className="w-full rounded-xl border border-[#E4E7EB] bg-[#F8FAFC] py-2.5 px-3.5 text-sm font-mono focus:bg-white focus:outline-none focus:border-[#3382F6] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#64748B] mb-1.5">Base URL</label>
                    <input
                      type="text"
                      placeholder="https://api.groq.com/openai/v1"
                      value={newProvider.base_url}
                      onChange={e => setNewProvider(s => ({ ...s, base_url: e.target.value }))}
                      className="w-full rounded-xl border border-[#E4E7EB] bg-[#F8FAFC] py-2.5 px-3.5 text-sm font-mono focus:bg-white focus:outline-none focus:border-[#3382F6] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#64748B] mb-1.5">API key (encrypted in Supabase)</label>
                  <input
                    type="password"
                    placeholder="sk-… or gsk_… (optional, stored encrypted)"
                    value={newProvider.api_key}
                    onChange={e => setNewProvider(s => ({ ...s, api_key: e.target.value }))}
                    className="w-full rounded-xl border border-[#E4E7EB] bg-[#F8FAFC] py-2.5 px-3.5 text-sm font-mono focus:bg-white focus:outline-none focus:border-[#3382F6] transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#64748B] mb-1.5">Priority</label>
                    <input
                      type="number" min={1} max={10}
                      value={newProvider.priority}
                      onChange={e => setNewProvider(s => ({ ...s, priority: parseInt(e.target.value) || 1 }))}
                      className="w-full rounded-xl border border-[#E4E7EB] bg-[#F8FAFC] py-2.5 px-3.5 text-sm font-mono focus:bg-white focus:outline-none focus:border-[#3382F6] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#64748B] mb-1.5">Cost / 1k tokens</label>
                    <input
                      type="number" step="0.0001"
                      value={newProvider.cost_per_1k_tokens}
                      onChange={e => setNewProvider(s => ({ ...s, cost_per_1k_tokens: parseFloat(e.target.value) || 0 }))}
                      className="w-full rounded-xl border border-[#E4E7EB] bg-[#F8FAFC] py-2.5 px-3.5 text-sm font-mono focus:bg-white focus:outline-none focus:border-[#3382F6] transition-colors"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E4E7EB] mt-5">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl border border-[#E4E7EB] text-sm font-semibold text-[#64748B] hover:bg-[#F8FAFC] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-sm font-semibold transition-colors"
                  >
                    Register provider
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
