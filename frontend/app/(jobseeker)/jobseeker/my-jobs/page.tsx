"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { applicationsApi, workUpdatesApi } from "@/lib/api";
import { Application, WorkUpdate } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { AddUpdateModal } from "@/components/work/AddUpdateModal";
import { WorkUpdatesDrawer } from "@/components/work/WorkUpdatesDrawer";
import { formatCurrency, cn } from "@/lib/utils";
import { Briefcase, Search, MessageSquare, Plus, ClipboardList } from "lucide-react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = "active" | "completed" | "cancelled";

const TABS: { id: TabId; label: string }[] = [
  { id: "active",    label: "Active"    },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTabApplications(applications: Application[], tab: TabId): Application[] {
  switch (tab) {
    case "active":    return applications.filter((a) => a.status === "accepted");
    case "completed": return [];
    case "cancelled": return applications.filter((a) => a.status === "rejected");
    default:          return [];
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
  updateCount: number;
  onAddUpdate: (refId: string, title: string) => void;
  onViewUpdates: (refId: string, title: string) => void;
}

function JobCard({ app, tab, updateCount, onAddUpdate, onViewUpdates }: JobCardProps) {
  const job      = typeof app.job      === "object" ? app.job      : null;
  const employer = job && typeof job.employer === "object" ? job.employer : null;
  const statusBadge = getStatusBadge(tab);
  const jobTitle = job?.title || "Job";

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        {/* Left: avatar + title + meta */}
        <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
          <Avatar
            name={employer?.company || employer?.name || "Co"}
            size="md"
            className="flex-shrink-0 mt-0.5 sm:mt-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-2 break-words">{jobTitle}</h4>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold flex-shrink-0",
                  statusBadge.className
                )}
              >
                {statusBadge.label}
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-1 truncate">
              {employer?.company || employer?.name || "—"}
              {job?.category ? ` · ${job.category}` : ""}
            </p>
          </div>
        </div>

        {/* Right: salary + actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
          {job && (
            <p className="text-sm font-extrabold text-slate-900 whitespace-nowrap">
              {formatCurrency(job.salary)}
              <span className="text-xs font-semibold text-slate-400"> / Monthly</span>
            </p>
          )}

          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            <Link href={`/jobseeker/messages?thread=${employer?._id || ""}`}>
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all cursor-pointer"
                title="Message Client"
              >
                <MessageSquare size={14} />
                <span className="sm:inline">Message</span>
              </button>
            </Link>

            {/* Progress buttons — active tab only */}
            {tab === "active" && (
              <>
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#edf2f7] text-[#1e3a5f] hover:bg-[#e2e8f0] transition-all cursor-pointer"
                  onClick={() => onAddUpdate(app._id, jobTitle)}
                >
                  <Plus size={14} />
                  <span>Add Update</span>
                </button>

                {updateCount > 0 && (
                  <button
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                    onClick={() => onViewUpdates(app._id, jobTitle)}
                  >
                    <ClipboardList size={14} />
                    <span>Updates ({updateCount})</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

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
  const [updateCounts, setUpdateCounts] = useState<Record<string, number>>({});

  // Progress modal/drawer state
  const [updateTarget, setUpdateTarget] = useState<{ refId: string; title: string } | null>(null);
  const [drawerTarget, setDrawerTarget] = useState<{ refId: string; title: string } | null>(null);

  const fetchApplications = useCallback(async () => {
    if (!session?.user.accessToken) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = (await applicationsApi.getMyApplications(
        session.user.accessToken
      )) as { data: Application[] };
      const data = res.data || [];
      setApplications(data);

      // Batch-fetch update counts for accepted applications
      const accepted = data.filter((a) => a.status === "accepted");
      const countMap: Record<string, number> = {};
      await Promise.allSettled(
        accepted.map(async (a) => {
          try {
            const r = (await workUpdatesApi.getByRef(
              session.user.accessToken!,
              "application",
              a._id
            )) as { data: WorkUpdate[] };
            countMap[a._id] = r.data?.length ?? 0;
          } catch {
            countMap[a._id] = 0;
          }
        })
      );
      setUpdateCounts(countMap);
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

  // Bump count locally after posting, then re-fetch to stay in sync
  const handlePosted = (refId: string) => {
    setUpdateCounts((prev) => ({ ...prev, [refId]: (prev[refId] ?? 0) + 1 }));
  };

  const tabApps = getTabApplications(applications, activeTab);
  const filtered = search.trim()
    ? tabApps.filter((a) => {
        const job = typeof a.job === "object" ? a.job : null;
        return job?.title?.toLowerCase().includes(search.toLowerCase());
      })
    : tabApps;

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

        {/* Tab bar */}
        <div className="border-b border-gray-100">
          <div className="flex px-4 pt-3 overflow-x-auto no-scrollbar scrollbar-none flex-nowrap" role="tablist">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-all -mb-px whitespace-nowrap flex-shrink-0 cursor-pointer",
                  activeTab === tab.id
                    ? "border-[#1e3a5f] text-[#1e3a5f]"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-xs font-bold",
                    activeTab === tab.id
                      ? "bg-[#edf2f7] text-[#1e3a5f]"
                      : "bg-slate-100 text-slate-500"
                  )}
                >
                  {counts[tab.id]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
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

        {/* Content */}
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
            <div className="flex flex-col gap-3">
              {filtered.map((app) => (
                <JobCard
                  key={app._id}
                  app={app}
                  tab={activeTab}
                  updateCount={updateCounts[app._id] ?? 0}
                  onAddUpdate={(refId, title) => setUpdateTarget({ refId, title })}
                  onViewUpdates={(refId, title) => setDrawerTarget({ refId, title })}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Add Update Modal ── */}
      <AddUpdateModal
        open={!!updateTarget}
        onClose={() => setUpdateTarget(null)}
        refType="application"
        refId={updateTarget?.refId ?? ""}
        title={updateTarget?.title ?? ""}
        onPosted={() => {
          if (updateTarget) handlePosted(updateTarget.refId);
          setUpdateTarget(null);
        }}
      />

      {/* ── Updates Drawer ── */}
      <WorkUpdatesDrawer
        open={!!drawerTarget}
        onClose={() => setDrawerTarget(null)}
        refType="application"
        refId={drawerTarget?.refId ?? ""}
        title={drawerTarget?.title ?? ""}
        role="jobseeker"
      />
    </div>
  );
}
