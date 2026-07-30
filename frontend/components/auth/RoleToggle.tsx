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
    <div className="flex rounded-2xl bg-gray-100/90 border border-gray-200/40 p-1 sm:p-1.5 gap-1 sm:gap-1.5 shadow-inner w-full min-w-0 overflow-hidden">
      <button
        type="button"
        onClick={() => onChange("jobseeker")}
        className={cn(
          "flex-1 min-w-0 flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-2.5 px-1.5 sm:px-3 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 transform active:scale-95",
          value === "jobseeker"
            ? "bg-[#1e3a5f] text-white shadow-md shadow-slate-900/20 font-semibold"
            : "text-gray-600 hover:text-[#1e3a5f] hover:bg-white/40"
        )}
      >
        <User className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-transform duration-300", value === "jobseeker" && "scale-110")} />
        <span className="truncate min-w-0">Freelancer</span>
      </button>

      <button
        type="button"
        onClick={() => onChange("employer")}
        className={cn(
          "flex-1 min-w-0 flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-2.5 px-1.5 sm:px-3 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 transform active:scale-95",
          value === "employer"
            ? "bg-[#1e3a5f] text-white shadow-md shadow-slate-900/20 font-semibold"
            : "text-gray-600 hover:text-[#1e3a5f] hover:bg-white/40"
        )}
      >
        <Briefcase className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-transform duration-300", value === "employer" && "scale-110")} />
        <span className="truncate min-w-0">Employer</span>
      </button>

      {showAdmin && (
        <button
          type="button"
          onClick={() => onChange("admin")}
          className={cn(
            "flex-1 min-w-0 flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-2.5 px-1.5 sm:px-3 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 transform active:scale-95",
            value === "admin"
              ? "bg-red-600 text-white shadow-md shadow-red-900/25 font-semibold"
              : "text-gray-600 hover:text-red-600 hover:bg-white/40"
          )}
        >
          <Shield className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-transform duration-300", value === "admin" && "scale-110")} />
          <span className="truncate min-w-0">Admin</span>
        </button>
      )}
    </div>
  );
}
