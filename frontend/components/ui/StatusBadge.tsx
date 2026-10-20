import React from "react";

export type StatusType = "success" | "warning" | "danger" | "info" | "neutral";

interface StatusBadgeProps {
  status: StatusType;
  label: string;
  showDot?: boolean;
  className?: string;
}

export function StatusBadge({ status, label, showDot = true, className = "" }: StatusBadgeProps) {
  // Styles according to Section 3.3 Status badge recipe in Sentra UI/UX Design System
  const styles: Record<StatusType, { bg: string; text: string; border: string; dot: string }> = {
    success: {
      bg: "bg-[#ECFDF5]",
      text: "text-[#047857]",
      border: "border-[#A7F3D0]",
      dot: "bg-[#10B981]",
    },
    warning: {
      bg: "bg-[#FFFBEB]",
      text: "text-[#B45309]",
      border: "border-[#FDE68A]",
      dot: "bg-[#F59E0B]",
    },
    danger: {
      bg: "bg-[#FEF2F2]",
      text: "text-[#B91C1C]",
      border: "border-[#FECACA]",
      dot: "bg-[#EF4444]",
    },
    info: {
      bg: "bg-[#EFF6FF]",
      text: "text-[#1D4ED8]",
      border: "border-[#BFDBFE]",
      dot: "bg-[#3B82F6]",
    },
    neutral: {
      bg: "bg-[#F4F4F5]",
      text: "text-[#52525B]",
      border: "border-[#E4E4E7]",
      dot: "bg-[#71717A]",
    },
  };

  const current = styles[status] || styles.neutral;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${current.bg} ${current.text} ${current.border} ${className}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />}
      <span>{label}</span>
    </span>
  );
}
