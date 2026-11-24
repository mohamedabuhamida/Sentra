"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, PlayCircle, KeyRound, Settings } from "lucide-react";

export function AdminGuard({ pageName = "this page" }: { pageName?: string }) {
  return (
    <div className="max-w-lg mx-auto mt-12 rounded-2xl border border-[#E4E7EB] bg-white p-8 text-center shadow-xs">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 text-amber-600">
        <ShieldAlert className="h-6 w-6" />
      </div>
      <h2 className="text-base font-bold text-[#0F172A]">Admin Access Required</h2>
      <p className="mt-1.5 text-xs text-[#64748B]">
        Your account has the <strong>viewer</strong> role. Only administrators can access {pageName}.
        You can test prompts in the Playground, manage your API Keys, and customize your Profile provider priorities.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link
          href="/playground"
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#3382F6] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#2563EB]"
        >
          <PlayCircle className="h-3.5 w-3.5" />
          Playground
        </Link>
        <Link
          href="/api-keys"
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#E4E7EB] bg-[#F8FAFC] px-3.5 py-2 text-xs font-semibold text-[#0F172A] hover:bg-white"
        >
          <KeyRound className="h-3.5 w-3.5" />
          My API Keys
        </Link>
        <Link
          href="/settings"
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#E4E7EB] bg-[#F8FAFC] px-3.5 py-2 text-xs font-semibold text-[#0F172A] hover:bg-white"
        >
          <Settings className="h-3.5 w-3.5" />
          Profile Priorities
        </Link>
      </div>
    </div>
  );
}
