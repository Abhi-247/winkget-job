import { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  breadcrumbs?: Breadcrumb[];
  title: string;
  subtitle?: string;
  right?: ReactNode;
  dark?: boolean;         // true = navy bg (#1e3a5f), white text
  className?: string;
}

export function PageHeader({
  breadcrumbs = [],
  title,
  subtitle,
  right,
  dark = false,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "w-full py-10 sm:py-14 relative overflow-hidden",
        dark 
          ? "bg-gradient-to-r from-[#1e3a5f] via-[#1e4a7a] to-[#2d5282] text-white" 
          : "bg-white text-gray-900 border-b border-gray-200",
        className
      )}
    >
      {/* Decorative elements for dark mode */}
      {dark && (
        <>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        </>
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Breadcrumb */}
        {breadcrumbs.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            className={cn(
              "flex items-center gap-1 text-xs mb-3 flex-wrap",
              dark ? "text-white/70" : "text-gray-400"
            )}
          >
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <span className="opacity-60">›</span>}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className={cn(
                      "hover:underline transition-colors",
                      dark ? "hover:text-white" : "hover:text-gray-700"
                    )}
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={dark ? "text-white font-medium" : "text-gray-600 font-medium"}>
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
        )}

        {/* Title row */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="min-w-0">
            <h1
              className={cn(
                "text-2xl sm:text-3xl font-bold leading-tight mb-2",
                dark ? "text-white" : "text-gray-900"
              )}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                className={cn(
                  "text-sm",
                  dark ? "text-white/70" : "text-gray-500"
                )}
              >
                {subtitle}
              </p>
            )}
          </div>
          {right && <div className="flex-shrink-0">{right}</div>}
        </div>
      </div>
    </div>
  );
}
