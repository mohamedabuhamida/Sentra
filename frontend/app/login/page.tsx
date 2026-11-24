"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Lock, Mail, AlertCircle, Loader2, MailCheck, RefreshCw, ShieldCheck, Zap, Eye } from "lucide-react";
import { useAuth } from "@/lib/authContext";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEmailNotConfirmed(false);
    setResendSuccess(false);
    setLoading(true);

    const res = await signIn(email, password);
    setLoading(false);

    if (!res.success) {
      const errMsg = res.error || "";
      if (
        errMsg.toLowerCase().includes("email not confirmed") ||
        errMsg.toLowerCase().includes("not confirmed") ||
        errMsg.toLowerCase().includes("confirm your email")
      ) {
        setEmailNotConfirmed(true);
      } else {
        setError(errMsg || "Failed to sign in");
      }
    } else {
      router.push("/");
    }
  };

  const handleResendConfirmation = async () => {
    setResendLoading(true);
    try {
      const { error: resendErr } = await supabase.auth.resend({
        type: "signup",
        email,
      });
      if (resendErr) {
        setError("Could not resend: " + resendErr.message);
      } else {
        setResendSuccess(true);
      }
    } catch {
      setError("Failed to resend confirmation email.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — dark brand side */}
      <div className="hidden lg:flex lg:w-5/12 bg-[#0F172A] flex-col justify-between p-12 relative overflow-hidden">
        {/* Background texture dots */}
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
            Secure AI gateway<br />for your team
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
            Route, monitor, and protect every LLM request across all providers from a single control plane.
          </p>
        </div>

        {/* Feature callouts */}
        <div className="relative space-y-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Prompt injection defense</p>
              <p className="text-xs text-slate-500 mt-0.5">NLP classifier blocks OWASP LLM01–10 attacks before they reach any model.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Semantic cache &amp; fallback</p>
              <p className="text-xs text-slate-500 mt-0.5">Cosine-similarity cache reduces token spend. Automatic failover across providers.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
              <Eye className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Full request observability</p>
              <p className="text-xs text-slate-500 mt-0.5">Every token, latency, cost, and routing decision logged to Supabase in real time.</p>
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

          <h2 className="text-2xl font-bold text-[#0F172A] mb-1">Sign in</h2>
          <p className="text-sm text-[#64748B] mb-8">Access gateway controls, telemetry, and security shield.</p>

          {/* Email Not Confirmed Banner */}
          {emailNotConfirmed && (
            <div className="mb-5 rounded-xl bg-amber-50 border border-amber-200 p-4">
              <div className="flex items-start gap-3">
                <MailCheck className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-800">Confirm your email first</p>
                  <p className="text-xs text-amber-700 mt-1">
                    We sent a link to <span className="font-semibold">{email}</span>. Click it, then come back.
                  </p>
                  {resendSuccess ? (
                    <p className="text-xs text-emerald-600 font-semibold mt-2">
                      ✓ Confirmation email resent.
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendConfirmation}
                      disabled={resendLoading}
                      className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-900 disabled:opacity-50 transition-colors"
                    >
                      {resendLoading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3 w-3" />
                      )}
                      Resend confirmation
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600 border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sentra.ai"
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
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-[#D1D5DB] bg-white py-2.5 pl-9 pr-3 text-sm text-[#0F172A] focus:border-[#3382F6] focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
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
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign in to dashboard</span>
              )}
            </button>
          </form>

          <p className="mt-6 text-sm text-[#64748B] text-center">
            No account?{" "}
            <Link href="/signup" className="font-semibold text-[#3382F6] hover:text-[#2563EB]">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
