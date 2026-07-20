"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { hireRequestsApi, workUpdatesApi } from "@/lib/api";
import { HireRequest, HireRequestStatus, WorkUpdate } from "@/types";
import { EmployerHireRequestsList } from "@/components/employer/EmployerHireRequestsList";
import { WorkUpdatesDrawer } from "@/components/work/WorkUpdatesDrawer";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";

type TabId = "pending" | "accepted" | "rejected";

const TABS: { id: TabId; label: string }[] = [
  { id: "pending",  label: "Pending"  },
  { id: "accepted", label: "Accepted" },
  { id: "rejected", label: "Rejected" },
];

export default function EmployerHireRequestsPage() {
  const { data: session, status } = useSession();
  const [requests, setRequests]   = useState<HireRequest[]>([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("pending");
  const [updateCounts, setUpdateCounts] = useState<Record<string, number>>({});

  // Drawer state — opened when employer clicks "View Progress"
  const [drawerTarget, setDrawerTarget] = useState<{ refId: string; title: string } | null>(null);

  const fetchRequests = useCallback(async () => {
    if (!session?.user.accessToken) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = (await hireRequestsApi.getEmployerRequests(
        session.user.accessToken
      )) as { data: HireRequest[] };
      const data = res.data || [];
      setRequests(data);

      // Batch-fetch update counts for accepted requests
      const accepted = data.filter((r) => r.status === "accepted");
      const countMap: Record<string, number> = {};
      await Promise.allSettled(
        accepted.map(async (r) => {
          try {
            const r2 = (await workUpdatesApi.getByRef(
              session.user.accessToken!,
              "hireRequest",
              r._id
            )) as { data: WorkUpdate[] };
            countMap[r._id] = r2.data?.length ?? 0;
          } catch {
            countMap[r._id] = 0;
          }
        })
      );
      setUpdateCounts(countMap);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (status === "loading") return;
    fetchRequests();
  }, [fetchRequests, status]);

  const counts: Record<TabId, number> = {
    pending:  requests.filter((r) => r.status === "pending").length,
    accepted: requests.filter((r) => r.status === "accepted").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  const filtered: HireRequest[] = requests.filter(
    (r) => r.status === (activeTab as HireRequestStatus)
  );

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Hire Requests</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Manage hiring invitations you&apos;ve sent to job seekers
          </p>
        </div>
      </div>

      {/* ── Tab row ── */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-4 sm:px-5 border-b border-gray-100 flex items-center gap-0.5 overflow-x-auto no-scrollbar scrollbar-none" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap",
                activeTab === tab.id
                  ? "border-[#1e3a5f] text-[#1e3a5f]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-xs",
                  activeTab === tab.id ? "bg-blue-100 text-[#1e3a5f]" : "bg-gray-100 text-gray-500"
                )}
              >
                {counts[tab.id]}
              </span>
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        <div className="p-5">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText size={22} className="text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                No {activeTab} hire requests.
              </p>
              <p className="text-xs text-gray-400">
                {activeTab === "pending"  && "Send hire requests to job seekers to see them here."}
                {activeTab === "accepted" && "Accepted hire requests will appear here."}
                {activeTab === "rejected" && "Declined hire requests will appear here."}
              </p>
            </div>
          ) : (
            <EmployerHireRequestsList
              requests={filtered}
              onUpdate={fetchRequests}
              updateCounts={updateCounts}
              onViewProgress={(refId, title) => setDrawerTarget({ refId, title })}
            />
          )}
        </div>
      </div>

      {/* ── Progress drawer (employer read-only) ── */}
      <WorkUpdatesDrawer
        open={!!drawerTarget}
        onClose={() => setDrawerTarget(null)}
        refType="hireRequest"
        refId={drawerTarget?.refId ?? ""}
        title={drawerTarget?.title ?? ""}
        role="employer"
      />
    </div>
  );
}
