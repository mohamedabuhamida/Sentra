"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Activity,
  Split,
  ShieldAlert,
  Server,
  PlayCircle,
} from "lucide-react";

const semesterOneItems = [
  { name: "Overview", href: "/", icon: LayoutDashboard, badge: "MVP" },
  { name: "Request Logs", href: "/requests", icon: Activity, badge: "Live" },
  {
    name: "Security Shield",
    href: "/security",
    icon: ShieldAlert,
    badge: "OWASP",
    badgeType: "danger",
  },
  { name: "Basic Model Routing", href: "/routing", icon: Split, badge: null },
  {
    name: "LLM Providers",
    href: "/providers",
    icon: Server,
    badge: "4 Active",
  },
  {
    name: "Gateway Playground",
    href: "/playground",
    icon: PlayCircle,
    badge: "Test",
    badgeType: "ai",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="group/sidebar sticky top-0 z-30 flex h-screen w-16 shrink-0 flex-col overflow-x-hidden overflow-y-auto border-r border-sentra-border bg-white transition-[width] duration-300 ease-in-out hover:w-64">
      {/* Brand Header */}
      <div className="flex h-16 shrink-0 items-center justify-start overflow-hidden border-b border-sentra-border px-3">
        <Link
          href="/"
          aria-label="Sentra home"
          className="relative block h-10 w-10 shrink-0 transition-[width] duration-300 group-hover/sidebar:w-[224px]"
        >
          {/* Collapsed Icon */}
          <Image
            src="/sentra-icon.png"
            alt="Sentra"
            fill
            priority
            sizes="40px"
            className="object-contain opacity-100 transition-opacity duration-150 group-hover/sidebar:opacity-0"
          />

          {/* Expanded Logo */}
          <Image
            src="/sentra-logo.png"
            alt="Sentra - AI Gateway & Security"
            fill
            priority
            sizes="224px"
            className="object-contain object-left opacity-0 transition-opacity duration-200 group-hover/sidebar:opacity-100"
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {semesterOneItems.map((item) => {
          const Icon = item.icon;

          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              title={item.name}
              aria-current={isActive ? "page" : undefined}
              className={`group/item relative flex h-10 w-full items-center gap-3 rounded-xl px-3 text-xs font-medium transition-colors duration-200 ${
                isActive
                  ? "bg-[#3382F6] text-white shadow-xs"
                  : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
              }`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 ${
                  isActive ? "text-white" : "text-[#64748B]"
                }`}
              />

              {/* Navigation Label */}
              <span className="min-w-0 flex-1 overflow-hidden whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover/sidebar:opacity-100">
                {item.name}
              </span>

              {/* Navigation Badge */}
              {item.badge && (
                <span
                  className={`absolute right-3 hidden shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold group-hover/sidebar:block ${
                    isActive
                      ? "bg-white/20 text-white"
                      : item.badgeType === "danger"
                        ? "border border-rose-200 bg-rose-50 text-rose-600"
                        : item.badgeType === "ai"
                          ? "border border-purple-200 bg-purple-50 text-purple-600"
                          : "border border-[#E4E7EB] bg-[#F4F4F5] text-[#64748B]"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}