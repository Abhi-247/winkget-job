"use client";

import { Bell, Search, LogOut, Plus, Menu, ChevronDown, LayoutDashboard } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

function getBreadcrumbs(pathname: string): { label: string; href: string }[] {
  const segments = pathname.split("/").filter(Boolean);
  // segments: ["jobseeker", "dashboard"] or ["employer", "applications"]
  const breadcrumbs: { label: string; href: string }[] = [];

  if (segments.length === 0) return breadcrumbs;

  // Role label
  const roleLabels: Record<string, string> = {
    jobseeker: "Job Seeker",
    employer: "Employer",
    admin: "Admin",
  };
  const roleSegment = segments[0];
  const roleLabel = roleLabels[roleSegment] || capitalize(roleSegment);
  breadcrumbs.push({ label: roleLabel, href: `/${roleSegment}/dashboard` });

  // Page label (last segment)
  if (segments.length > 1) {
    const pageSegment = segments[segments.length - 1];
    const pageLabel = pageSegment
      .split("-")
      .map(capitalize)
      .join(" ");
    breadcrumbs.push({ label: pageLabel, href: pathname });
  }

  return breadcrumbs;
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

interface DashboardTopbarProps {
  browseJobsLink?: string;
  onMenuClick?: () => void;
  badgeCount?: number;
}

export function DashboardTopbar({
  browseJobsLink = "/jobs",
  onMenuClick,
  badgeCount = 0,
}: DashboardTopbarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const user = session?.user;
  const breadcrumbs = getBreadcrumbs(pathname);
  const currentPage = breadcrumbs[breadcrumbs.length - 1]?.label || "Dashboard";
  const roleSectionHref = breadcrumbs[0]?.href || "/";

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Derive user title/role subtitle
  const roleLabel =
    user?.role === "employer"
      ? "Employer"
      : user?.role === "admin"
      ? "Admin"
      : "Job Seeker";

  const dashboardHref =
    user?.role === "employer"
      ? "/employer/dashboard"
      : user?.role === "admin"
      ? "/admin/dashboard"
      : "/jobseeker/dashboard";

  return (
    <header className="h-14 sm:h-16 bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Left: hamburger + breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        )}

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm min-w-0">
          {breadcrumbs.length > 1 ? (
            <>
              <Link
                href={roleSectionHref}
                className="text-gray-400 hover:text-gray-600 transition-colors truncate hidden sm:block"
              >
                {breadcrumbs[0].label}
              </Link>
              <span className="text-gray-300 hidden sm:block">›</span>
              <span className="font-semibold text-gray-900 truncate">{currentPage}</span>
            </>
          ) : (
            <span className="font-semibold text-gray-900 truncate">{currentPage}</span>
          )}
        </nav>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Search icon */}
        <button
          className="hidden sm:flex p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
          aria-label="Search"
        >
          <Search size={17} />
        </button>

        {/* Notification bell */}
        <NotificationBell />

        {/* Browse / Post button */}
        <Link href={browseJobsLink}>
          <Button size="sm" className="gap-1.5 hidden sm:inline-flex">
            <Plus size={14} />
            <span>{user?.role === "employer" ? "Post a Job" : "Browse Jobs"}</span>
          </Button>
        </Link>

        {/* Avatar + name + dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
          >
            <Avatar name={user?.name || "User"} src={user?.image} size="sm" />
            <div className="hidden sm:flex flex-col items-start leading-tight">
              <span className="text-sm font-semibold text-gray-900 max-w-[120px] truncate">
                {user?.name || "User"}
              </span>
              <span className="text-[11px] text-gray-400">{roleLabel}</span>
            </div>
            <ChevronDown
              size={14}
              className={cn(
                "hidden sm:block text-gray-400 transition-transform",
                dropdownOpen && "rotate-180"
              )}
            />
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-50">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
              <Link
                href={dashboardHref}
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <LayoutDashboard size={15} className="text-gray-400" />
                Dashboard
              </Link>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={15} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
