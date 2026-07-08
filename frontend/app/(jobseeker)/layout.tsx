"use client";

import { ReactNode, useState } from "react";
import { JobSeekerSidebar } from "@/components/layout/JobSeekerSidebar";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";

export default function JobSeekerLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <JobSeekerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardTopbar 
          browseJobsLink="/jobs" 
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
