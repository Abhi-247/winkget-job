"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { jobsApi } from "@/lib/api";
import { Job } from "@/types";
import { Button } from "@/components/ui/Button";
import { JobCard } from "@/components/employer/JobCard";
import { Pagination } from "@/components/ui/Pagination";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

type TabKey = "all" | "open" | "closed" | "draft";

const TABS: { key: TabKey; label: string }[] = [
  { key: "all",    label: "All" },
  { key: "open",   label: "Active" },
  { key: "draft",  label: "Paused" },
  { key: "closed", label: "Closed" },
];

const PAGE_LIMIT = 10;

function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse space-y-3">
      <div className="flex justify-between">
        <div className="h-5 bg-gray-200 rounded w-1/3" />
        <div className="h-8 bg-gray-200 rounded w-12" />
      </div>
      <div className="flex gap-2">
        <div className="h-4 bg-gray-200 rounded w-20" />
        <div className="h-4 bg-gray-200 rounded w-24" />
        <div className="h-4 bg-gray-200 rounded w-16" />
      </div>
      <div className="flex gap-1.5">
        {[60, 72, 56, 68].map((w) => (
          <div key={w} className="h-6 bg-gray-200 rounded-full" style={{ width: w }} />
        ))}
      </div>
      <div className="flex justify-between pt-2 border-t border-gray-100">
        <div className="h-4 bg-gray-200 rounded w-32" />
        <div className="flex gap-2">
          <div className="h-8 bg-gray-200 rounded w-28" />
          <div className="h-8 bg-gray-200 rounded w-20" />
          <div className="h-8 bg-gray-200 rounded w-16" />
        </div>
      </div>
    </div>
  );
}

export default function MyJobsPage() {
  const { data: session, status } = useSession();
  const { success, error } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [search, setSearch] = useState("");
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]           = useState(0);

  const fetchJobs = useCallback(async () => {
    if (!session?.user.accessToken) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = (await jobsApi.getMyJobs(session.user.accessToken, {
        page: String(page),
        limit: String(PAGE_LIMIT),
      })) as { data: Job[]; pagination: { page: number; pages: number; total: number } };
      setJobs(res.data || []);
      if (res.pagination) {
        setTotalPages(res.pagination.pages);
        setTotal(res.pagination.total);
      }
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [session, page]);

  useEffect(() => {
    if (status === "loading") return;
    fetchJobs();
  }, [fetchJobs, status]);

  const handleClose = async (id: string) => {
    if (!session?.user.accessToken) return;
    try {
      await jobsApi.updateJob(session.user.accessToken, id, { status: "closed" });
      success("Job closed");
      fetchJobs();
    } catch { error("Failed to close job"); }
  };

  const handleReopen = async (id: string) => {
    if (!session?.user.accessToken) return;
    try {
      await jobsApi.updateJob(session.user.accessToken, id, { status: "open" });
      success("Job reopened");
      fetchJobs();
    } catch { error("Failed to reopen job"); }
  };

  const handleDelete = async (id: string) => {
    if (!session?.user.accessToken) return;
    if (!confirm("Delete this job? This cannot be undone.")) return;
    try {
      await jobsApi.deleteJob(session.user.accessToken, id);
      success("Job deleted");
      fetchJobs();
    } catch { error("Failed to delete job"); }
  };

  // Tab counts
  const counts = {
    all:    jobs.length,
    open:   jobs.filter(j => j.status === "open").length,
    draft:  jobs.filter(j => j.status === "draft").length,
    closed: jobs.filter(j => j.status === "closed").length,
  };

  // Filtered list
  const visible = jobs.filter(j => {
    const matchesTab = activeTab === "all" || j.status === activeTab;
    const matchesSearch = j.title.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const activeCount = counts.open;
  const pausedCount = counts.draft;
  const closedCount = counts.closed;

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">My Jobs</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {activeCount} active · {pausedCount} paused · {closedCount} closed
          </p>
        </div>
        <Link href="/employer/post-job">
          <Button size="sm" className="gap-1.5 w-full sm:w-auto">
            <Plus size={14} />
            Post New Job
          </Button>
        </Link>
      </div>

      {/* ── Tabs + Search ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Tab pills */}
        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg flex-shrink-0">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                activeTab === tab.key
                  ? "bg-gray-900 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              {tab.label}
              <span className={cn(
                "ml-1.5 text-xs",
                activeTab === tab.key ? "text-gray-300" : "text-gray-400"
              )}>
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
          <input
            type="text"
            placeholder="Search by title…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
          />
        </div>
      </div>

      {/* ── Card list ────────────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : visible.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
          <p className="text-gray-500 text-sm">
            {search ? `No jobs match "${search}"` : "No jobs in this category."}
          </p>
          {!search && activeTab === "all" && (
            <Link href="/employer/post-job" className="text-[#1e3a5f] text-sm hover:underline mt-2 inline-block">
              Post your first job
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map(job => (
            <JobCard
              key={job._id}
              job={job}
              onClose={handleClose}
              onReopen={handleReopen}
              onDelete={handleDelete}
            />
          ))}
          <Pagination
            page={page}
            pages={totalPages}
            total={total}
            limit={PAGE_LIMIT}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
