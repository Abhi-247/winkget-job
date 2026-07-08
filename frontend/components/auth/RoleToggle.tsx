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
    <div className="flex rounded-xl bg-gray-100 p-1 gap-1">
      <button
        type="button"
        onClick={() => onChange("jobseeker")}
        className={cn(
          "flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all",
          value === "jobseeker"
            ? "bg-white text-[#1e3a5f] shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        )}
      >
        <User size={15} />
        Job Seeker
      </button>

      <button
        type="button"
        onClick={() => onChange("employer")}
        className={cn(
          "flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all",
          value === "employer"
            ? "bg-white text-[#1e3a5f] shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        )}
      >
        <Briefcase size={15} />
        Employer
      </button>

      {showAdmin && (
        <button
          type="button"
          onClick={() => onChange("admin")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all",
            value === "admin"
              ? "bg-white text-red-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          <Shield size={15} />
          Admin
        </button>
      )}
    </div>
  );
}
