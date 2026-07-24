"use client";

import { useState } from "react";
import { Copy, Check, Hash } from "lucide-react";
import { cn } from "@/lib/utils";

interface IdBadgeProps {
  id?: string;
  prefix?: string;
  label?: string;
  className?: string;
  showHash?: boolean;
}

export function IdBadge({
  id = "",
  prefix = "",
  label,
  className,
  showHash = true,
}: IdBadgeProps) {
  const [copied, setCopied] = useState(false);

  if (!id) return null;

  // Format short ID e.g., USR-60d5ec... (show first 6 chars) or formatted ID
  const displayId = prefix
    ? `${prefix}-${id.slice(-6).toUpperCase()}`
    : `${id.slice(0, 8)}...${id.slice(-4)}`;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      onClick={handleCopy}
      title={`Click to copy full ID: ${id}`}
      className={cn(
        "inline-flex items-center gap-1.5 bg-gray-100/80 hover:bg-gray-200/80 text-gray-700 font-mono text-[11px] px-2 py-0.5 rounded-md border border-gray-200/60 transition-all cursor-pointer group select-none",
        className
      )}
    >
      {showHash && <Hash size={11} className="text-gray-400 group-hover:text-gray-600" />}
      {label && <span className="font-sans font-bold text-[10px] text-gray-500 uppercase mr-0.5">{label}:</span>}
      <span className="font-semibold tracking-tight">{displayId}</span>
      {copied ? (
        <Check size={11} className="text-emerald-600 flex-shrink-0" />
      ) : (
        <Copy size={11} className="text-gray-400 group-hover:text-gray-600 opacity-60 group-hover:opacity-100 flex-shrink-0" />
      )}
    </div>
  );
}
