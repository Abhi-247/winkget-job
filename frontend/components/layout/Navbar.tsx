"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Menu, X, ChevronDown, LayoutDashboard, Settings, LogOut, LogIn,
  Briefcase, ClipboardList, Users, Info, BookOpen, Mail, Plus
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/jobs",    label: "Find Work",   icon: Briefcase },
  { href: "/tasks",   label: "Find Task",   icon: ClipboardList },
  { href: "/talent",  label: "Hire Talent", icon: Users },
  { href: "/about",   label: "About Us",    icon: Info },
  { href: "/blog",    label: "Blog",        icon: BookOpen },
  { href: "/contact", label: "Contact",     icon: Mail },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 bg-[#1e3a5f] rounded-lg flex items-center justify-center text-white font-black text-sm">
              W
            </div>
            <span className="text-gray-900">
              Wink<span className="text-[#d4a017]">Get</span>Job
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "text-[#1e3a5f] bg-[#edf2f7]"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <NotificationBell />
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Avatar name={user.name || "User"} src={user.image} size="sm" />
                    <span className="text-sm font-medium text-gray-700">
                      {user.name?.split(" ")[0]}
                    </span>
                    <ChevronDown size={14} className="text-gray-400" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-xl border border-gray-200 shadow-lg py-1.5 z-50">
                      <Link
                        href={`/${user.role}/dashboard`}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <LayoutDashboard size={15} className="text-gray-400" />
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        href={`/${user.role}/settings`}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings size={15} className="text-gray-400" />
                        <span>Settings</span>
                      </Link>
                      <hr className="my-1 border-gray-100" />
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={15} className="text-red-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <Link href="/sign-in">
                  <Button variant="ghost" size="md">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register?role=employer">
                  <Button size="md">Post a Job</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 text-[#1e3a5f] hover:bg-[#edf2f7] hover:border-[#1e3a5f]/40 flex items-center justify-center transition-all duration-200 shadow-sm active:scale-95 cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} className="stroke-[2.2]" /> : <Menu size={20} className="stroke-[2.2]" />}
          </button>
        </div>
      </div>

      {/* Mobile menu drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 pt-3 pb-5 space-y-1 shadow-xl animate-in slide-in-from-top duration-200">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all",
                  isActive
                    ? "bg-[#edf2f7] text-[#1e3a5f] font-bold"
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                )}
                onClick={() => setMobileOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? "text-[#1e3a5f]" : "text-slate-600 group-hover:text-[#1e3a5f] transition-colors"} />
                  <span>{link.label}</span>
                </div>
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#1e3a5f]" />}
              </Link>
            );
          })}

          <div className="pt-3 border-t border-slate-100 mt-2">
            {user ? (
              <div className="grid grid-cols-2 gap-2.5">
                <Link href={`/${user.role}/dashboard`} onClick={() => setMobileOpen(false)} className="w-full">
                  <button className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#edf2f7] hover:bg-[#e2e8f0] text-[#1e3a5f] font-extrabold text-xs sm:text-sm transition-all cursor-pointer truncate">
                    <LayoutDashboard size={16} />
                    <span>Dashboard</span>
                  </button>
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/70 font-extrabold text-xs sm:text-sm transition-all cursor-pointer truncate"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                <Link href="/sign-in" onClick={() => setMobileOpen(false)} className="w-full">
                  <button className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white border-2 border-[#1e3a5f] text-[#1e3a5f] font-extrabold text-xs sm:text-sm hover:bg-[#1e3a5f] hover:text-white transition-all cursor-pointer truncate">
                    <LogIn size={16} />
                    <span>Sign In</span>
                  </button>
                </Link>
                <Link href="/register?role=employer" onClick={() => setMobileOpen(false)} className="w-full">
                  <button className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#d4a017] to-[#b8860b] text-white font-extrabold text-xs sm:text-sm shadow-md shadow-[#d4a017]/20 hover:shadow-lg transition-all cursor-pointer truncate">
                    <Plus size={16} />
                    <span>Post a Job</span>
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
