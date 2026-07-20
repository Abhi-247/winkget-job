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
  ClipboardList,
  FileText,
  UserCheck,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

const navSections = [
  {
    label: "OVERVIEW",
    items: [
      { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    ],
  },
  {
    label: "MANAGEMENT",
    items: [
      { href: "/admin/users",         icon: Users,         label: "Users"         },
      { href: "/admin/jobs",          icon: Briefcase,     label: "Jobs"          },
      { href: "/admin/tasks",         icon: ClipboardList, label: "Tasks"         },
      { href: "/admin/applications",  icon: FileText,      label: "Applications"  },
      { href: "/admin/hire-requests", icon: UserCheck,     label: "Hire Requests" },
    ],
  },
  {
    label: "SYSTEM",
    items: [
      { href: "/admin/reports",  icon: BarChart2, label: "Reports"  },
      { href: "/admin/settings", icon: Settings,  label: "Settings" },
    ],
  },
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

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky lg:top-0 inset-y-0 left-0 z-50 w-64 h-screen bg-[#090d16] border-r border-slate-800/40 flex flex-col flex-shrink-0 transform transition-transform duration-200 ease-in-out lg:translate-x-0 shadow-2xl",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800/50">
          <div className="flex items-center justify-between">
            <Link href="/admin/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#1e3a5f] rounded-lg flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-900/25">
                W
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-none tracking-tight">
                  Wink<span className="text-[#d4a017]">Get</span>Job
                </p>
                <p className="text-gray-400 text-[10px] mt-0.5 font-semibold">Admin Panel</p>
              </div>
            </Link>

            {onClose && (
              <button
                onClick={onClose}
                className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:bg-slate-800/60 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto no-scrollbar">
          {navSections.map((section) => (
            <div key={section.label} className="mb-5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">
                {section.label}
              </p>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/admin/dashboard" &&
                      pathname.startsWith(item.href));
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={handleLinkClick}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                          isActive
                            ? "bg-slate-800/40 text-white font-semibold border-l-2 border-[#d4a017] pl-2.5 shadow-inner"
                            : "text-gray-400 hover:bg-slate-850/30 hover:text-gray-200"
                        )}
                      >
                        <Icon
                          size={17}
                          className={cn(
                            "flex-shrink-0 transition-transform duration-150",
                            isActive
                              ? "text-[#d4a017] scale-110"
                              : "text-gray-500 group-hover:text-gray-300"
                          )}
                        />
                        <span className="flex-1">{item.label}</span>
                        {isActive && (
                          <ChevronRight size={13} className="text-[#d4a017]" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-slate-800/50 bg-[#06090f]">
          <div className="flex items-center gap-3 bg-slate-900/30 border border-slate-800/20 rounded-xl p-2.5 mb-2">
            <Avatar
              name={user?.name || "Admin"}
              src={user?.image}
              size="sm"
              className="ring-1 ring-slate-700/30"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {user?.name || "Admin"}
              </p>
              <p className="text-[10px] text-[#d4a017] font-medium truncate">
                Administrator
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
