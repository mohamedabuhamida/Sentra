import React from "react";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  change?: string;
  isPositiveChange?: boolean;
  timeframe?: string;
  icon: LucideIcon;
  iconColor?: "blue" | "violet" | "emerald" | "amber" | "rose";
}

export function KPICard({
  title,
  value,
  change,
  isPositiveChange = true,
  timeframe = "vs last 24h",
  icon: Icon,
  iconColor = "blue",
}: KPICardProps) {
  const colorStyles = {
    blue: {
      bg: "bg-blue-50 text-blue-600 border-blue-100",
    },
    violet: {
      bg: "bg-purple-50 text-purple-600 border-purple-100",
    },
    emerald: {
      bg: "bg-emerald-50 text-emerald-600 border-emerald-100",
    },
    amber: {
      bg: "bg-amber-50 text-amber-600 border-amber-100",
    },
    rose: {
      bg: "bg-rose-50 text-rose-600 border-rose-100",
    },
  };

  const selectedColor = colorStyles[iconColor] || colorStyles.blue;

  return (
    <div className="bg-white rounded-2xl border border-[#E4E7EB] p-5 shadow-xs hover:border-[#CBD5E1] transition-all duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-[#64748B] tracking-wider uppercase">
            {title}
          </p>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-[#0F172A]">
            {value}
          </h3>
        </div>
        <div className={`p-2.5 rounded-xl border ${selectedColor.bg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(change || timeframe) && (
        <div className="mt-4 flex items-center gap-2 text-xs">
          {change && (
            <span
              className={`inline-flex items-center font-semibold ${
                isPositiveChange ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {isPositiveChange ? "↑" : "↓"} {change}
            </span>
          )}
          <span className="text-[#94A3B8]">{timeframe}</span>
        </div>
      )}
    </div>
  );
}
