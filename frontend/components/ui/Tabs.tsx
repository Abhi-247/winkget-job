"use client";

import { useState, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (id: string) => void;
  className?: string;
  children?: ReactNode;
}

export function Tabs({ tabs, defaultTab, onChange, className }: TabsProps) {
  const [active, setActive] = useState(defaultTab || tabs[0]?.id);

  const handleChange = (id: string) => {
    setActive(id);
    onChange?.(id);
  };

  return (
    <div
      className={cn(
        "flex gap-1 border-b border-gray-200 overflow-x-auto",
        className
      )}
      role="tablist"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => handleChange(tab.id)}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap",
            "border-b-2 transition-colors",
            active === tab.id
              ? "border-[#1e3a5f] text-[#1e3a5f]"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-xs",
                active === tab.id
                  ? "bg-blue-100 text-[#1e3a5f]"
                  : "bg-gray-100 text-gray-600"
              )}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
