"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  pages: number;
  total: number;
  limit?: number;
  onPageChange: (n: number) => void;
  className?: string;
}

/** Returns the page pill windows to render, with -1 as ellipsis sentinel */
function getPageWindows(page: number, pages: number): (number | -1)[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);

  const windows: (number | -1)[] = [1];

  if (page > 3) windows.push(-1);

  const start = Math.max(2, page - 1);
  const end   = Math.min(pages - 1, page + 1);
  for (let i = start; i <= end; i++) windows.push(i);

  if (page < pages - 2) windows.push(-1);

  windows.push(pages);
  return windows;
}

export function Pagination({
  page,
  pages,
  total,
  limit = 12,
  onPageChange,
  className,
}: PaginationProps) {
  if (pages <= 1) return null;

  const from = (page - 1) * limit + 1;
  const to   = Math.min(page * limit, total);
  const windows = getPageWindows(page, pages);

  return (
    <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-3 pt-4", className)}>
      {/* Label */}
      <p className="text-xs text-gray-500 order-2 sm:order-1">
        Showing <span className="font-medium text-gray-700">{from}–{to}</span> of{" "}
        <span className="font-medium text-gray-700">{total}</span> results
      </p>

      {/* Controls */}
      <div className="flex items-center gap-1 order-1 sm:order-2">
        {/* Prev */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
          className={cn(
            "w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors border",
            page === 1
              ? "text-gray-300 border-gray-100 cursor-not-allowed"
              : "text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
          )}
        >
          <ChevronLeft size={15} />
        </button>

        {/* Page pills */}
        {windows.map((w, idx) =>
          w === -1 ? (
            <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm select-none">
              …
            </span>
          ) : (
            <button
              key={w}
              onClick={() => onPageChange(w)}
              aria-current={w === page ? "page" : undefined}
              className={cn(
                "w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors border",
                w === page
                  ? "bg-[#1e3a5f] text-white border-[#1e3a5f]"
                  : "text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
              )}
            >
              {w}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === pages}
          aria-label="Next page"
          className={cn(
            "w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors border",
            page === pages
              ? "text-gray-300 border-gray-100 cursor-not-allowed"
              : "text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
          )}
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
