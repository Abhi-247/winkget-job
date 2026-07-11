"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { applicationsApi } from "@/lib/api";
import { Application } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { formatCurrency, cn } from "@/lib/utils";
import { Briefcase, Search, MessageSquare, Plus } from "lucide-react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = "active" | "completed" | "cancelled";

const TABS: { id: TabId; label: string }[] = [
  { id: "active", label: "Active" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTabApplications(applications: Application[], tab: TabId): Application[] {
  switch (tab) {
    case "active":
      return applications.filter((a) => a.status === "accepted");
    case "completed":
      // No "completed" status exists yet — show empty
      return [];
    case "cancelled":
      return applications.filter((a) => a.status === "rejected");
    default:
      return [];
  }
}

function getStatusBadge(tab: TabId) {
  switch (tab) {
    case "active":    return { label: "Just Started", className: "border border-[#d4a017] text-[#1e3a5f] bg-[#edf2f7]" };
    case "completed": return { label: "Completed",    className: "border border-gray-300  text-gray-500  bg-gray-50"  };
    case "cancelled": return { label: "Cancelled",    className: "border border-red-400   text-red-500   bg-red-50"   };
  }
}

// ─── Job Card ─────────────────────────────────────────────────────────────────

interface JobCardProps {
  app: Application;
  tab: TabId;
}

function JobCard({ app, tab }: JobCardProps) {
  const job      = typeof app.job      === "object" ? app.job      : null;
  const employer = job && typeof job.employer === "object" ? job.employer : null;

  const statusBadge = getStatusBadge(tab);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      {/* Top row: avatar + title + salary */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Avatar
            name={employer?.company || employer?.name || "Co"}
            size="md"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-semibold text-gray-900 truncate">
                {job?.title || "—"}
              </h4>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                  statusBadge.className
                )}
              >
                {statusBadge.label}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5 truncate">
              {employer?.company || employer?.name || "—"}
              {job?.category ? ` · ${job.category}` : ""}
            </p>
          </div>
        </div>

        {/* Salary */}
        <div className="flex-shrink-0 text-right">
          {job && (
            <p className="text-sm font-bold text-gray-800">
              {formatCurrency(job.salary)}
              <span className="text-xs font-normal text-gray-400"> / Monthly</span>
            </p>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 pt-1">
        <Link href={`/jobseeker/messages?thread=${employer?._id || ""}`}>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 border-blue-300 text-[#1e3a5f] hover:bg-[#edf2f7]"
          >
            <MessageSquare size={13} />
            Message Client
          </Button>
        </Link>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MyJobsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialTab = (searchParams.get("tab") as TabId) || "active";
  const [activeTab, setActiveTab]     = useState<TabId>(initialTab);
  const [search, setSearch]           = useState("");
  const [loading, setLoading]         = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);

  const fetchApplications = useCallback(async () => {
    if (!session?.user.accessToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = (await applicationsApi.getMyApplications(
        session.user.accessToken
      )) as { data: Application[] };
      setApplications(res.data || []);
    } catch {
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (status === "loading") return;
    fetchApplications();
  }, [fetchApplications, status]);

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    router.replace(`/jobseeker/my-jobs?tab=${tab}`);
  };

  // Filtered by tab then by search
  const tabApps = getTabApplications(applications, activeTab);
  const filtered = search.trim()
    ? tabApps.filter((a) => {
        const job = typeof a.job === "object" ? a.job : null;
        return job?.title?.toLowerCase().includes(search.toLowerCase());
      })
    : tabApps;

  // Counts per tab
  const counts: Record<TabId, number> = {
    active:    getTabApplications(applications, "active").length,
    completed: 0,
    cancelled: getTabApplications(applications, "cancelled").length,
  };

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">My Jobs</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Track and manage all your ongoing and past projects
          </p>
        </div>
        <Link href="/jobs">
          <Button size="sm" className="gap-1.5 self-start sm:self-auto">
            <Plus size={14} />
            Find New Jobs
          </Button>
        </Link>
      </div>

      {/* ── Tabs + Search ── */}
      <div className="bg-white rounded-xl border border-gray-200">

        {/* Tab bar row */}
        <div className="border-b border-gray-100">
          <div className="flex px-4 pt-3" role="tablist">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "flex items-center gap-1 px-3 py-2 text-xs font-medium border-b-2 transition-colors -mb-px whitespace-nowrap",
                  activeTab === tab.id
                    ? "border-blue-600 text-[#1e3a5f]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-xs",
                    activeTab === tab.id
                      ? "bg-blue-100 text-[#1e3a5f]"
                      : "bg-gray-100 text-gray-500"
                  )}
                >
                  {counts[tab.id]}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="px-5 py-3 border-b border-gray-100">
          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
            />
          </div>
        </div>

        {/* ── Content ── */}
        <div className="p-5">
          {loading ? (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase size={24} className="text-gray-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-700 mb-1">
                {search
                  ? "No matching jobs found"
                  : activeTab === "active"
                  ? "No active jobs yet"
                  : activeTab === "completed"
                  ? "No completed jobs yet"
                  : "No cancelled jobs"}
              </h3>
              <p className="text-sm text-gray-400 mb-5">
                {!search && activeTab === "active" && (
                  <>Apply to jobs and accepted ones will appear here.</>
                )}
              </p>
              {!search && activeTab === "active" && (
                <Link href="/jobs">
                  <Button size="sm">Find New Jobs</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filtered.map((app) => (
                <JobCard key={app._id} app={app} tab={activeTab} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
