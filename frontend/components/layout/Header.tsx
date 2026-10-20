"use client";

import React, { useState } from "react";
import {
  Search,
  Bell,
  Clock,
  ChevronDown,
  Layers,
  Play,
} from "lucide-react";
import Link from "next/link";

export function Header() {
  const [timeRange, setTimeRange] = useState("Last 24 Hours");

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center border-b border-[#E4E7EB] bg-white px-6">
      <div className="flex w-full min-w-0 items-center gap-3">

        {/* Left Group: Search and Environment */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {/* Global Search */}
          <div className="relative hidden min-w-0 flex-1 lg:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search request ID, model, IP..."
              className="w-full rounded-xl border border-[#E4E7EB] bg-[#F8FAFC] py-1.5 pl-9 pr-3 font-mono text-xs text-[#0F172A] placeholder:text-[#94A3B8] transition-all focus:border-[#3382F6] focus:bg-white focus:outline-none"
            />
          </div>

          {/* Environment Badge */}
          <div className="hidden shrink-0 items-center gap-1.5 rounded-xl border border-[#E4E7EB] bg-[#F8FAFC] px-2.5 py-1 text-xs text-[#64748B] sm:flex">
            <Layers className="h-3.5 w-3.5 text-blue-600" />
            <span className="font-semibold text-[#0F172A]">
              Prod-Cluster
            </span>
            <span className="font-mono text-[10px] text-[#94A3B8]">
              us-east-1
            </span>
          </div>
        </div>

        {/* Middle Group: Time Range and Notifications */}
        <div className="flex shrink-0 items-center gap-3">
          {/* Time-Range Selector */}
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="cursor-pointer appearance-none rounded-xl border border-sentra-border bg-sentra-bg py-1.5 pl-8 pr-7 text-xs font-medium text-[#0F172A] hover:bg-white focus:border-[#3382F6] focus:outline-none"
            >
              <option>Last 1 Hour</option>
              <option>Last 24 Hours</option>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
            <Clock className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#64748B]" />
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#64748B]" />
          </div>

          {/* Security Notifications */}
          <button
            type="button"
            title="Security Notifications"
            aria-label="Security Notifications"
            className="relative rounded-xl border border-[#E4E7EB] bg-white p-2 text-[#64748B] transition-colors hover:bg-[#F8FAFC]"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>
        </div>

        {/* Right Group: Playground and User Profile */}
        <div className="ml-auto flex shrink-0 items-center gap-3">
          {/* Quick Test Action */}
          <Link
            href="/playground"
            className="hidden items-center gap-1.5 rounded-xl bg-[#3382F6] px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#2563EB] sm:inline-flex"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Playground</span>
          </Link>

          {/* User Profile */}
          <div className="flex shrink-0 items-center gap-2 border-l border-[#E4E7EB] pl-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 font-mono text-xs font-bold text-white">
              SA
            </div>

            <div className="hidden text-left xl:block">
              <span className="block text-xs font-bold leading-tight text-[#0F172A]">
                SecOps Admin
              </span>
              <span className="block font-mono text-[10px] leading-tight text-[#94A3B8]">
                admin@sentra.ai
              </span>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}