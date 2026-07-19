"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { hireRequestsApi } from "@/lib/api";
import { HireRequest, HireRequestStatus } from "@/types";
import { EmployerHireRequestsList } from "@/components/employer/EmployerHireRequestsList";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/ui/Pagination";
import { FileText } from "lucide-react";

const PAGE_LIMIT = 10;

type TabId = "pending" | "accepted" | "rejected";

const TABS: { id: TabId; label: string }[] = [
  { id: "pending", label: "Pending" },
  { id: "accepted", label: "Accepted" },
  { id: "rejected", label: "Rejected" },
];

export default function EmployerHireRequestsPage() {
  const { data: session, status } = useSession();
  const [requests, setRequests] = useState<HireRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("pending");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchRequests = useCallback(async () => {
    if (!session?.user.accessToken) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = (await hireRequestsApi.getEmployerRequests(
        session.user.accessToken
      )) as { data: HireRequest[] };
      setRequests(res.data || []);
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
    pending: requests.filter((r) => r.status === "pending").length,
    accepted: requests.filter((r) => r.status === "accepted").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  const filtered: HireRequest[] = requests.filter(
    (r) => r.status === (activeTab as HireRequestStatus)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Hire Requests</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Manage hiring invitations you've sent to job seekers
          </p>
        </div>
      </div>

      {/* Tab row */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 border-b border-gray-100 flex items-center gap-0.5 overflow-x-auto" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap"
              style={{
                borderColor: activeTab === tab.id ? "#1e3a5f" : "transparent",
                color: activeTab === tab.id ? "#1e3a5f" : "#6b7280",
              }}
            >
              {tab.label}
              <span
                className="rounded-full px-1.5 py-0.5 text-xs"
                style={{
                  backgroundColor: activeTab === tab.id ? "#dbeafe" : "#f3f4f6",
                  color: activeTab === tab.id ? "#1e3a5f" : "#6b7280",
                }}
              >
                {counts[tab.id]}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
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
                {activeTab === "pending" && "Send hire requests to job seekers to see them here."}
                {activeTab === "accepted" && "Accepted hire requests will appear here."}
                {activeTab === "rejected" && "Declined hire requests will appear here."}
              </p>
            </div>
          ) : (
            <EmployerHireRequestsList
              requests={filtered}
              onUpdate={fetchRequests}
            />
          )}
        </div>
      </div>
    </div>
  );
}
