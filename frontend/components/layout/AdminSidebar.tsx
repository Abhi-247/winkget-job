"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  BarChart2,
  Settings,
  LogOut,
  ChevronRight,
  X,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/jobs", icon: Briefcase, label: "Jobs" },
  { href: "/admin/reports", icon: BarChart2, label: "Reports" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ isOpen = true, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "fixed lg:sticky lg:top-0 inset-y-0 left-0 z-50 w-64 h-screen bg-gray-900 flex flex-col flex-shrink-0 transform transition-transform duration-200 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="px-6 py-5 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-black text-sm">
                W
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-none">Wink<span className="text-[#d4a017]">Get</span>Job</p>
                <p className="text-gray-400 text-xs mt-0.5">Admin Panel</p>
              </div>
            </Link>

            {/* Close button for mobile */}
            {onClose && (
              <button
                onClick={onClose}
                className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-3">
            ADMINISTRATION
          </p>
          <ul className="space-y-0.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={handleLinkClick}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group",
                      isActive
                        ? "bg-red-600/20 text-red-400"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                    )}
                  >
                    <Icon size={17} className={cn("flex-shrink-0", isActive ? "text-red-400" : "text-gray-500 group-hover:text-white")} />
                    <span className="flex-1">{item.label}</span>
                    {isActive && <ChevronRight size={14} className="text-red-400" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="px-3 py-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <Avatar name={user?.name || "Admin"} src={user?.image} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-red-400 font-medium">Administrator</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-red-400 transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
