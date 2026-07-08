"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";

export default function PublicLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/sign-in" || pathname === "/register";

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {!isAuthPage && <Navbar />}
      <main className="flex-1 flex flex-col">{children}</main>
      {!isAuthPage && <Footer />}
    </div>
  );
}
