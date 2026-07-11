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
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex items-center justify-between py-3">
        <span className="font-semibold text-gray-900 text-sm">{title}</span>
        {onClear && activeCount > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-[#1e3a5f] hover:underline font-medium"
          >
            Clear all {activeCount > 0 && `(${activeCount})`}
          </button>
        )}
      </CardHeader>
      <CardBody className="py-4 space-y-5">{children}</CardBody>
    </Card>
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
    <div className={cn("space-y-2.5", className)}>
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {label}
      </h4>
      {children}
    </div>
  );
}
