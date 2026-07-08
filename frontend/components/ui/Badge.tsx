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
  default: "bg-gray-100 text-gray-700",
  success: "bg-blue-100 text-[#1e3a5f]",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
  info: "bg-blue-100 text-[#1e3a5f]",
  purple: "bg-purple-100 text-purple-700",
  outline: "border border-gray-300 text-gray-600 bg-transparent",
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

export function statusBadge(status: string): BadgeVariant {
  switch (status) {
    case "accepted": return "success";
    case "rejected":  return "danger";
    case "pending":   return "warning";
    case "shortlisted": return "purple";
    case "open":      return "success";
    case "closed":    return "danger";
    case "draft":     return "default";
    default:          return "default";
  }
}
