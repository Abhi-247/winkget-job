"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/jobs",   label: "Find Work"    },
  { href: "/tasks",  label: "Find Task"    },
  { href: "/talent", label: "Hire Talent"  },
  { href: "/about",  label: "About Us"     },
  { href: "/blog",   label: "Blog"         },
  { href: "/contact", label: "Contact"     },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
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
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl border border-gray-200 shadow-lg py-1 z-50">
                    <Link
                      href={`/${user.role}/dashboard`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href={`/${user.role}/settings`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Settings
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
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
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            {user ? (
              <>
                <Link href={`/${user.role}/dashboard`}>
                  <Button variant="secondary" size="sm" fullWidth>
                    Dashboard
                  </Button>
                </Link>
                <Button
                  variant="danger"
                  size="sm"
                  fullWidth
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/sign-in">
                  <Button variant="outline" size="sm" fullWidth>
                    Sign In
                  </Button>
                </Link>
                <Link href="/register?role=employer">
                  <Button size="sm" fullWidth>
                    Post a Job
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
