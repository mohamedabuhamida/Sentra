"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Lock, Mail, User, AlertCircle, CheckCircle2, Loader2, ShieldCheck, Zap, Eye } from "lucide-react";
import { useAuth } from "@/lib/authContext";
import { supabase } from "@/lib/supabase";

export default function SignUpPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    const res = await signUp(email, password, fullName);
    setLoading(false);

    if (!res.success) {
      setError(res.error || "Failed to create account");
    } else {
      if (res.user) {
        try {
          await supabase.from("user_profiles").upsert({
            id: res.user.id,
            email: res.user.email ?? email,
            full_name: fullName,
            role: "viewer",
          });
        } catch (dbErr) {
          console.warn("Direct user_profiles upsert note:", dbErr);
        }
      }

      if (res.session) {
        setSuccess("Account registered. Redirecting to dashboard...");
        setTimeout(() => { router.push("/"); }, 1200);
      } else {
        setSuccess(
          `Account created for ${email}. Check your inbox for a confirmation link.`
        );
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — dark brand side */}
      <div className="hidden lg:flex lg:w-5/12 bg-[#0F172A] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "24px 24px"
        }} />

        <div className="relative">
          <div className="flex items-center gap-2.5 mb-16">
            <div className="relative h-8 w-8">
              <Image src="/sentra-icon.png" alt="Sentra" fill priority className="object-contain" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">Sentra</span>
          </div>

          <h1 className="text-3xl font-bold text-white leading-tight mb-4">
            Start securing your<br />AI requests today
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
            New accounts are provisioned as viewers. An admin can promote your role in the team workspace.
          </p>
        </div>

        <div className="relative space-y-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Zero-trust by default</p>
              <p className="text-xs text-slate-500 mt-0.5">Every request authenticated, every response audited.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Multi-provider routing</p>
              <p className="text-xs text-slate-500 mt-0.5">OpenAI, Gemini, Claude, Ollama — intelligent failover included.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
              <Eye className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Live cost telemetry</p>
              <p className="text-xs text-slate-500 mt-0.5">Token spend, latency, and cache savings tracked per request.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col justify-center items-center bg-[#F8FAFC] px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-10">
            <div className="relative h-7 w-7">
              <Image src="/sentra-icon.png" alt="Sentra" fill priority className="object-contain" />
            </div>
            <span className="font-bold text-lg tracking-tight text-[#0F172A]">Sentra</span>
          </div>

          <h2 className="text-2xl font-bold text-[#0F172A] mb-1">Create account</h2>
          <p className="text-sm text-[#64748B] mb-8">Join your team on the Sentra gateway workspace.</p>

          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600 border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">Full name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Security Analyst"
                  className="w-full rounded-xl border border-[#D1D5DB] bg-white py-2.5 pl-9 pr-3 text-sm text-[#0F172A] placeholder:text-[#9CA3AF] focus:border-[#3382F6] focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@sentra.ai"
                  className="w-full rounded-xl border border-[#D1D5DB] bg-white py-2.5 pl-9 pr-3 text-sm text-[#0F172A] placeholder:text-[#9CA3AF] focus:border-[#3382F6] focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full rounded-xl border border-[#D1D5DB] bg-white py-2.5 pl-9 pr-3 text-sm text-[#0F172A] placeholder:text-[#9CA3AF] focus:border-[#3382F6] focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#3382F6] py-2.5 px-4 text-sm font-semibold text-white hover:bg-[#2563EB] disabled:opacity-50 transition-colors shadow-sm cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <span>Create account</span>
              )}
            </button>
          </form>

          <p className="mt-6 text-sm text-[#64748B] text-center">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[#3382F6] hover:text-[#2563EB]">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
