"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Copy, Trash2, Check, KeyRound, Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { API_BASE_URL } from "@/lib/api";
import { useAuth } from "@/lib/authContext";

interface ApiKeyItem {
  id: string;
  name: string;
  key_prefix: string;
  scope: string;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string | null;
}

export default function ApiKeysPage() {
  const { token, profile } = useAuth();
  const isAdmin = profile?.role === "admin";

  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newScope, setNewScope] = useState("read_write");
  const [revealedSecret, setRevealedSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadKeys = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api-keys`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setKeys(await res.json());
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadKeys();
  }, [loadKeys]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api-keys`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newName, scope: newScope }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || "Could not create API key.");
      } else {
        setRevealedSecret(data.secret_key);
        setNewName("");
        setShowModal(false);
        loadKeys();
      }
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!token) return;
    await fetch(`${API_BASE_URL}/api-keys/${id}/revoke`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    loadKeys();
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    await fetch(`${API_BASE_URL}/api-keys/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    loadKeys();
  };

  const copySecret = () => {
    if (!revealedSecret) return;
    navigator.clipboard.writeText(revealedSecret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppShell
      title="Gateway API Keys & Access Tokens"
      subtitle={
        isAdmin
          ? "Manage all organization gateway API keys in Supabase."
          : "Create and manage your personal Sentra Gateway API keys."
      }
    >
      <div className="space-y-6">
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
            {error}
          </div>
        )}

        {revealedSecret && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <KeyRound className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-900">New API Key Created (copy now — shown once)</p>
                <code className="text-xs font-mono text-emerald-800 break-all">{revealedSecret}</code>
              </div>
            </div>
            <button
              onClick={copySecret}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        )}

        {/* Keys Table with integrated header */}
        <div className="bg-white rounded-2xl border border-[#E4E7EB] shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E4E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">
                {isAdmin ? "All client authentication keys" : "My personal API keys"}
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Include this secret in your Authorization header:{" "}
                <code className="px-1.5 py-0.5 rounded bg-[#F8FAFC] font-mono text-[11px] border border-[#E4E7EB]">
                  Bearer sk_live_...
                </code>
              </p>
            </div>

            <button
              onClick={() => setShowModal(!showModal)}
              className="px-3.5 py-2 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              Create secret key
            </button>
          </div>

          {showModal && (
            <form onSubmit={handleCreate} className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E4E7EB] flex flex-col sm:flex-row gap-3">
              <input
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Key name (e.g. My App Key)"
                className="flex-1 px-3 py-2 rounded-xl border border-[#E4E7EB] bg-white text-xs"
              />
              <select
                value={newScope}
                onChange={(e) => setNewScope(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#E4E7EB] bg-white text-xs"
              >
                <option value="read_write">Inference (read_write)</option>
                <option value="read_only">Read Only (read_only)</option>
                {isAdmin && <option value="admin">Full Admin (admin)</option>}
              </select>
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 rounded-xl bg-[#3382F6] hover:bg-[#2563EB] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Generate"}
              </button>
            </form>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E4E7EB] text-[#64748B] bg-[#F8FAFC]">
                  <th className="py-3 px-4 font-semibold">Key Identifier & Name</th>
                  <th className="py-3 px-4 font-semibold">Secret Prefix</th>
                  <th className="py-3 px-4 font-semibold">Scope</th>
                  <th className="py-3 px-4 font-semibold">Created</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EB]">
                {keys.map((k) => (
                  <tr key={k.id} className="hover:bg-[#F8FAFC]">
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-[#0F172A] block">{k.name}</span>
                      <span className="font-mono text-[10px] text-[#94A3B8]">{k.id.slice(0, 12)}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-[#0F172A]">{k.key_prefix}</td>
                    <td className="py-3.5 px-4 text-[#64748B]">{k.scope}</td>
                    <td className="py-3.5 px-4 text-[#64748B]">
                      {k.created_at ? new Date(k.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge
                        status={k.is_active ? "success" : "neutral"}
                        label={k.is_active ? "active" : "revoked"}
                      />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {k.is_active && (
                        <button
                          onClick={() => handleRevoke(k.id)}
                          className="px-2 py-1 rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-50 text-[11px] font-semibold"
                        >
                          Revoke
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(k.id)}
                        className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 inline-flex items-center"
                        title="Delete key"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {keys.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#64748B]">
                      No API keys yet. Click &quot;Create Secret Key&quot; to generate one.
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
