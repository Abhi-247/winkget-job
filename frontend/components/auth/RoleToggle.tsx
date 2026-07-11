"use client";

import { UserRole } from "@/types";
import { cn } from "@/lib/utils";
import { Briefcase, User, Shield } from "lucide-react";

interface RoleToggleProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
  /** Show the Admin tab — only rendered when explicitly needed (e.g. admin sign-in page) */
  showAdmin?: boolean;
}

export function RoleToggle({ value, onChange, showAdmin = false }: RoleToggleProps) {
  return (
    <div className="flex rounded-2xl bg-gray-100/90 border border-gray-200/40 p-1.5 gap-1.5 shadow-inner">
      <button
        type="button"
        onClick={() => onChange("jobseeker")}
        className={cn(
          "flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium transition-all duration-300 transform active:scale-95",
          value === "jobseeker"
            ? "bg-[#1e3a5f] text-white shadow-md shadow-slate-900/20 font-semibold scale-[1.02]"
            : "text-gray-650 hover:text-[#1e3a5f] hover:bg-white/40"
        )}
      >
        <User size={16} className={cn("transition-transform duration-300", value === "jobseeker" && "scale-110")} />
        Freelancer
      </button>

      <button
        type="button"
        onClick={() => onChange("employer")}
        className={cn(
          "flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium transition-all duration-300 transform active:scale-95",
          value === "employer"
            ? "bg-[#1e3a5f] text-white shadow-md shadow-slate-900/20 font-semibold scale-[1.02]"
            : "text-gray-650 hover:text-[#1e3a5f] hover:bg-white/40"
        )}
      >
        <Briefcase size={16} className={cn("transition-transform duration-300", value === "employer" && "scale-110")} />
        Employer
      </button>

      {showAdmin && (
        <button
          type="button"
          onClick={() => onChange("admin")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium transition-all duration-300 transform active:scale-95",
            value === "admin"
              ? "bg-red-650 text-white shadow-md shadow-red-900/25 font-semibold scale-[1.02]"
              : "text-gray-650 hover:text-red-650 hover:bg-white/40"
          )}
        >
          <Shield size={16} className={cn("transition-transform duration-300", value === "admin" && "scale-110")} />
          Admin
        </button>
      )}
    </div>
  );
}
