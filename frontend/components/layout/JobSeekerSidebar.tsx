"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Bookmark,
  MessageSquare,
  Settings,
  LogOut,
  ChevronRight,
  Wallet,
  Users,
  User,
  X,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "MAIN MENU",
    items: [
      { href: "/jobseeker/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/jobseeker/profile", icon: User, label: "Profile" },
      { href: "/jobseeker/my-jobs", icon: Briefcase, label: "My Jobs" },
      { href: "/jobseeker/applications", icon: FileText, label: "Applications" },
      { href: "/jobseeker/proposals", icon: Users, label: "Proposals" },
      { href: "/jobseeker/saved-jobs", icon: Bookmark, label: "Saved Jobs" },
    ],
  },
  {
    label: "ACCOUNT",
    items: [
      { href: "/jobseeker/messages", icon: MessageSquare, label: "Messages" },
      { href: "/jobseeker/earnings", icon: Wallet, label: "Earnings" },
      { href: "/jobseeker/hire-requests", icon: Users, label: "Hire Requests" },
      { href: "/jobseeker/settings", icon: Settings, label: "Settings" },
    ],
  },
];

interface JobSeekerSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function JobSeekerSidebar({ isOpen = true, onClose }: JobSeekerSidebarProps) {
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
      <aside className={cn(
        "fixed lg:sticky lg:top-0 inset-y-0 left-0 z-50 w-64 h-screen bg-[#090d16] border-r border-slate-800/40 flex flex-col flex-shrink-0 transform transition-transform duration-200 ease-in-out lg:translate-x-0 shadow-2xl",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-800/50">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#1e3a5f] rounded-lg flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-900/25">
                W
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-none tracking-tight">Wink<span className="text-[#d4a017]">Get</span>Job</p>
                <p className="text-gray-400 text-[10px] mt-0.5 font-semibold">Job Seeker Portal</p>
              </div>
            </Link>
            
            {/* Close button for mobile */}
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

        {/* Nav with hidden scrollbar */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto no-scrollbar">
          {navItems.map((section) => (
            <div key={section.label} className="mb-5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">
                {section.label}
              </p>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/jobseeker/dashboard" &&
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
                            isActive ? "text-[#d4a017] scale-110" : "text-gray-500 group-hover:text-gray-300"
                          )}
                        />
                        <span className="flex-1">{item.label}</span>
                        {isActive && (
                          <ChevronRight size={13} className="text-[#d4a017] animate-pulse" />
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
            <Avatar name={user?.name || "User"} src={user?.image} size="sm" className="ring-1 ring-slate-700/30" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150"
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
