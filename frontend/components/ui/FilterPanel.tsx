import { ReactNode } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

// ─── FilterPanel ─────────────────────────────────────────────────────────────

interface FilterPanelProps {
  title?: string;
  children: ReactNode;
  onClear?: () => void;
  activeCount?: number;
  className?: string;
}

export function FilterPanel({
  title = "Filters",
  children,
  onClear,
  activeCount = 0,
  className,
}: FilterPanelProps) {
  return (
    <div className={cn("bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden", className)}>
      <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2d5282] p-4 text-white">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-sm">{title}</h3>
          {onClear && activeCount > 0 && (
            <button
              onClick={onClear}
              className="text-xs text-[#d4a017] hover:text-[#f5c842] font-medium transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
        <p className="text-xs text-white/60">Refine your search</p>
      </div>
      <div className="p-4 space-y-4">{children}</div>
    </div>
  );
}

// ─── FilterSection ────────────────────────────────────────────────────────────

interface FilterSectionProps {
  label: string;
  children: ReactNode;
  className?: string;
}

export function FilterSection({ label, children, className }: FilterSectionProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {label}
      </h4>
      {children}
    </div>
  );
}
