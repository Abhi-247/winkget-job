"use client";

import { ReactNode, useState } from "react";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardTopbar 
          browseJobsLink="/admin/jobs" 
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
