"use client";

import React, { useState, useEffect } from "react";
import { Shield, Save, CheckCircle2, User, Sliders } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { API_BASE_URL } from "@/lib/api";
import { useAuth } from "@/lib/authContext";

const PROVIDERS_LIST = [
  { key: "openai", label: "OpenAI (GPT-4o / GPT-4o-mini)" },
  { key: "gemini", label: "Google Gemini (2.5 Flash / Pro)" },
  { key: "anthropic", label: "Anthropic (Claude 3.5 Sonnet)" },
  { key: "ollama", label: "Ollama (Local Llama-3)" },
];

export default function SettingsPage() {
  const { token, profile, refreshSession } = useAuth();
  const isAdmin = profile?.role === "admin";

  // Personal Profile + Per-Profile Provider Priorities (all users)
  const [fullName, setFullName] = useState("");
  const [priorities, setPriorities] = useState<Record<string, number>>({
    openai: 1,
    gemini: 2,
    anthropic: 3,
    ollama: 4,
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savedProfile, setSavedProfile] = useState(false);

  // Global Gateway Thresholds (admin only)
  const [defaultTimeoutMs, setDefaultTimeoutMs] = useState(4000);
  const [blockThreshold, setBlockThreshold] = useState(0.85);
  const [sanitizeThreshold, setSanitizeThreshold] = useState(0.60);
  const [cacheThreshold, setCacheThreshold] = useState(0.92);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      if (profile.provider_priorities && Object.keys(profile.provider_priorities).length > 0) {
        setPriorities((prev) => ({ ...prev, ...profile.provider_priorities }));
      }
    }
  }, [profile]);

  useEffect(() => {
    if (!isAdmin) return;
    fetch(`${API_BASE_URL}/settings`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          if (data.block_threshold !== undefined) setBlockThreshold(data.block_threshold);
          if (data.sanitize_threshold !== undefined) setSanitizeThreshold(data.sanitize_threshold);
          if (data.cache_threshold !== undefined) setCacheThreshold(data.cache_threshold);
        }
      })
      .catch(() => {});
  }, [isAdmin]);

  const handleSaveProfile = async () => {
    if (!token) return;
    setSavingProfile(true);
    try {
      const res = await fetch(`${API_BASE_URL}/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: fullName,
          provider_priorities: priorities,
        }),
      });
      if (res.ok) {
        await refreshSession();
        setSavedProfile(true);
        setTimeout(() => setSavedProfile(false), 2500);
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveGlobal = async () => {
    if (!isAdmin || !token) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          block_threshold: blockThreshold,
          sanitize_threshold: sanitizeThreshold,
          cache_threshold: cacheThreshold,
          timeout_sla_ms: defaultTimeoutMs,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell
      title={isAdmin ? "Profile & System Gateway Settings" : "My Profile & Provider Priorities"}
      subtitle={
        isAdmin
          ? "Manage your personal profile priorities and global Sentra gateway security thresholds."
          : "Customize your profile and preferred LLM provider priority order for your requests."
      }
    >
      <div className="space-y-6 max-w-4xl">
        {/* Personal Profile & Per-Profile Provider Priority (All Users) */}
        <div className="bg-white rounded-2xl border border-[#E4E7EB] p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#E4E7EB]">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                My Profile &amp; Provider Priority Order
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Saved to your profile in Supabase (`{profile?.role || "viewer"}`).
              </p>
            </div>
            <button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3382F6] hover:bg-[#2563EB] text-white text-xs font-semibold shadow-xs transition-colors"
            >
              {savedProfile ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
              <span>{savedProfile ? "Profile Saved" : savingProfile ? "Saving..." : "Save Profile"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#0F172A] mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E4E7EB] bg-[#F8FAFC] text-[#0F172A]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#0F172A] mb-1">Email &amp; Role</label>
              <input
                type="text"
                disabled
                value={`${profile?.email || ""} (${profile?.role || "viewer"})`}
                className="w-full px-3 py-2 rounded-xl border border-[#E4E7EB] bg-slate-100 text-[#64748B]"
              />
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5 mb-3">
              <Sliders className="w-3.5 h-3.5 text-blue-600" />
              Preferred Provider Priority for My Profile (P1 = Highest)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PROVIDERS_LIST.map((p) => (
                <div
                  key={p.key}
                  className="flex items-center justify-between p-3 rounded-xl border border-[#E4E7EB] bg-[#F8FAFC]"
                >
                  <span className="text-xs font-semibold text-[#0F172A]">{p.label}</span>
                  <select
                    value={priorities[p.key] ?? 4}
                    onChange={(e) =>
                      setPriorities((prev) => ({ ...prev, [p.key]: Number(e.target.value) }))
                    }
                    className="px-2.5 py-1 rounded-lg border border-[#E4E7EB] bg-white text-xs font-mono font-bold text-[#0F172A]"
                  >
                    <option value={1}>P1 (1st)</option>
                    <option value={2}>P2 (2nd)</option>
                    <option value={3}>P3 (3rd)</option>
                    <option value={4}>P4 (4th)</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Global Gateway Controls (Admin Only) */}
        {isAdmin && (
          <>
            {/* Admin section separator */}
            <div className="flex items-center gap-3 pt-2">
              <div className="h-px flex-1 bg-[#E4E7EB]" />
              <span className="text-[11px] font-semibold text-[#94A3B8] px-1">Admin controls</span>
              <div className="h-px flex-1 bg-[#E4E7EB]" />
            </div>

            <div className="bg-[#0F172A] rounded-2xl p-5 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-white">Global gateway configuration</h4>
                <p className="text-xs text-slate-400 mt-0.5">Changes apply immediately across running gateway worker nodes.</p>
              </div>
              <button
                onClick={handleSaveGlobal}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors border border-white/10"
              >
                {saved ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
                <span>{saved ? "Saved" : saving ? "Applying..." : "Save config"}</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-[#E4E7EB] p-6 shadow-xs">
              <h3 className="text-sm font-semibold text-[#0F172A] flex items-center gap-2 pb-3 border-b border-[#E4E7EB]">
                <Shield className="w-4 h-4 text-rose-600" />
                Prompt injection &amp; cache thresholds
              </h3>

              <div className="mt-4 space-y-5 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-[#0F172A]">Hard Block Threshold (HTTP 403)</label>
                    <span className="font-mono font-bold text-rose-600">{Math.round(blockThreshold * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.50"
                    max="0.99"
                    step="0.01"
                    value={blockThreshold}
                    onChange={(e) => setBlockThreshold(parseFloat(e.target.value))}
                    className="w-full accent-rose-600"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-[#0F172A]">Sanitize Threshold</label>
                    <span className="font-mono font-bold text-amber-600">{Math.round(sanitizeThreshold * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.30"
                    max="0.80"
                    step="0.01"
                    value={sanitizeThreshold}
                    onChange={(e) => setSanitizeThreshold(parseFloat(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-[#0F172A]">Semantic Cache Similarity</label>
                    <span className="font-mono font-bold text-emerald-600">{cacheThreshold.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.75"
                    max="0.99"
                    step="0.01"
                    value={cacheThreshold}
                    onChange={(e) => setCacheThreshold(parseFloat(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">Provider Timeout SLA (ms)</label>
                  <input
                    type="number"
                    value={defaultTimeoutMs}
                    onChange={(e) => setDefaultTimeoutMs(Number(e.target.value))}
                    className="w-40 px-3 py-1.5 rounded-lg border border-[#E4E7EB] bg-[#F8FAFC] font-mono"
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
