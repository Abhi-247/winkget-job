"use client";

import { ReactNode } from "react";

interface AutoScrollCarouselProps {
  children: ReactNode[];
  title: string;
  subtitle?: string;
}

export function AutoScrollCarousel({ children, title, subtitle }: AutoScrollCarouselProps) {
  if (!children || children.length === 0) return null;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {subtitle && <span className="text-xs text-gray-400">{subtitle}</span>}
      </div>

      {/* Track wrapper — clips overflow, pauses on hover */}
      <div className="overflow-hidden carousel-track">
        {/* Inner track: items duplicated for seamless loop */}
        <div className="flex gap-4 w-max animate-scroll-left">
          {children}
          {children}
        </div>
      </div>
    </div>
  );
}
