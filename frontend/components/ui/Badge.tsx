import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "purple"
  | "outline";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-slate-100 text-slate-700 border border-slate-200/60 font-semibold",
  success: "bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-semibold",
  warning: "bg-amber-50 text-amber-700 border border-amber-200/80 font-semibold",
  danger: "bg-rose-50 text-rose-700 border border-rose-200/80 font-semibold",
  info: "bg-sky-50 text-sky-700 border border-sky-200/80 font-semibold",
  purple: "bg-purple-50 text-purple-700 border border-purple-200/80 font-semibold",
  outline: "border border-slate-300 text-slate-600 bg-transparent font-medium",
};

export function Badge({
  variant = "default",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function statusBadge(status?: string | null): BadgeVariant {
  if (!status) return "default";
  switch (status.toLowerCase()) {
    case "accepted":
    case "approved":
    case "completed":
    case "open":
      return "success";
    case "rejected":
    case "closed":
      return "danger";
    case "pending":
    case "in-progress":
    case "in_progress":
      return "warning";
    case "shortlisted":
      return "purple";
    case "assigned":
      return "info";
    case "draft":
    default:
      return "default";
  }
}
