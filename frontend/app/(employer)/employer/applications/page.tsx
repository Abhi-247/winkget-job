"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { applicationsApi, jobsApi, workUpdatesApi } from "@/lib/api";
import { Application, ApplicationStatus, Job, WorkUpdate } from "@/types";
import { ApplicantCard } from "@/components/employer/ApplicantCard";
import { ApplicantProfileDrawer } from "@/components/employer/ApplicantProfileDrawer";
import { WorkUpdatesDrawer } from "@/components/work/WorkUpdatesDrawer";
import { Pagination } from "@/components/ui/Pagination";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { FileText, Search } from "lucide-react";

const PAGE_LIMIT = 10;

// ── types ────────────────────────────────────────────────────────────────────

type StatusFilter = "all" | "pending" | "shortlisted" | "accepted" | "rejected";

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: "all",         label: "All" },
  { key: "pending",     label: "Pending" },
  { key: "shortlisted", label: "Shortlisted" },
  { key: "accepted",    label: "Accepted" },
  { key: "rejected",    label: "Rejected" },
];

// ── skeleton ─────────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-3 bg-gray-200 rounded w-1/4" />
        </div>
        <div className="h-6 bg-gray-200 rounded w-16" />
      </div>
      <div className="h-3 bg-gray-200 rounded w-full" />
      <div className="h-3 bg-gray-200 rounded w-4/5" />
      <div className="flex gap-2">
        {[60, 72, 56].map((w) => (
          <div key={w} className="h-6 bg-gray-200 rounded-full" style={{ width: w }} />
        ))}
      </div>
    </div>
  );
}

// ── main inner component ─────────────────────────────────────────────────────

function ApplicationsContent() {
  const { data: session, status } = useSession();
  const { success, error } = useToast();
  const searchParams = useSearchParams();
  const jobIdParam = searchParams.get("job");

  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>(jobIdParam ?? "");
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [drawerApp, setDrawerApp] = useState<Application | null>(null);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]           = useState(0);
  // Progress drawer + unseen counts
  const [progressDrawer, setProgressDrawer] = useState<{ refId: string; title: string } | null>(null);
  const [unseenCounts, setUnseenCounts] = useState<Record<string, number>>({});  // Fetch employer's jobs for the job-chip row
  useEffect(() => {
    if (status === "loading" || !session?.user.accessToken) return;
    jobsApi.getMyJobs(session.user.accessToken)
      .then((res) => {
        const data = (res as { data: Job[] }).data ?? [];
        setJobs(data);
        if (!selectedJob && data.length > 0) setSelectedJob(data[0]._id);
      })
      .catch(() => {});
  }, [session, selectedJob, status]);

  const fetchApplications = useCallback(async () => {
    if (!session?.user.accessToken || !selectedJob) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = (await applicationsApi.getJobApplications(
        session.user.accessToken,
        selectedJob,
        { page: String(page), limit: String(PAGE_LIMIT) }
      )) as { data: Application[]; pagination: { page: number; pages: number; total: number } };
      setApplications(res.data ?? []);
      if (res.pagination) {
        setTotalPages(res.pagination.pages);
        setTotal(res.pagination.total);
      }

      // Batch-fetch unseen update counts for accepted applications
      const accepted = (res.data ?? []).filter((a: Application) => a.status === "accepted");
      const unseenMap: Record<string, number> = {};
      await Promise.allSettled(
        accepted.map(async (a: Application) => {
          try {
            const r = (await workUpdatesApi.getByRef(
              session.user.accessToken!,
              "application",
              a._id
            )) as { data: WorkUpdate[] };
            unseenMap[a._id] = (r.data ?? []).filter((u) => !u.seenByEmployer).length;
          } catch {
            unseenMap[a._id] = 0;
          }
        })
      );
      setUnseenCounts(unseenMap);
    } catch {
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [session, selectedJob, page]);

  useEffect(() => {
    if (status === "loading") return;
    fetchApplications();
  }, [fetchApplications, status]);

  // Reset to page 1 when selected job or status filter changes
  useEffect(() => { setPage(1); }, [selectedJob, statusFilter]);

  const handleStatusChange = async (id: string, status: ApplicationStatus) => {
    if (!session?.user.accessToken) return;
    try {
      await applicationsApi.updateStatus(session.user.accessToken, id, status);
      success(`Application ${status}`);
      // Optimistically update both the list and the open drawer
      setApplications(prev =>
        prev.map(a => a._id === id ? { ...a, status } : a)
      );
      setDrawerApp(prev =>
        prev?._id === id ? { ...prev, status } : prev
      );
    } catch {
      error("Failed to update status");
    }
  };

  // Counts per status for tab badges
  const counts: Record<StatusFilter, number> = {
    all:         applications.length,
    pending:     applications.filter(a => a.status === "pending").length,
    shortlisted: applications.filter(a => a.status === "shortlisted").length,
    accepted:    applications.filter(a => a.status === "accepted").length,
    rejected:    applications.filter(a => a.status === "rejected").length,
  };

  const visible = applications.filter(a => {
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    const applicant = typeof a.applicant === "object" ? a.applicant : null;
    const matchSearch = !search ||
      applicant?.name?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const selectedJobTitle = jobs.find(j => j._id === selectedJob)?.title ?? "";

  return (
    <div className="space-y-5">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Applications</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Review and manage all proposals from freelancers
        </p>
      </div>

      {/* ── Job filter chips ─────────────────────────────────────────── */}
      {jobs.length > 0 && (
        <div className="flex items-center gap-1.5 sm:gap-2 max-w-full overflow-x-auto no-scrollbar py-1 flex-nowrap sm:flex-wrap">
          <button
            onClick={() => setSelectedJob("")}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border whitespace-nowrap flex-shrink-0",
              !selectedJob
                ? "bg-[#111c2c] text-white border-[#111c2c] shadow-sm"
                : "bg-white text-[#1e3a5f] border-blue-200/80 hover:border-[#1e3a5f]/40 hover:bg-blue-50/50"
            )}
          >
            All Jobs
          </button>
          {jobs.map(job => (
            <button
              key={job._id}
              onClick={() => setSelectedJob(job._id)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border whitespace-nowrap flex-shrink-0",
                selectedJob === job._id
                  ? "bg-[#111c2c] text-white border-[#111c2c] shadow-sm"
                  : "bg-white text-[#1e3a5f] border-blue-200/80 hover:border-[#1e3a5f]/40 hover:bg-blue-50/50"
              )}
            >
              {job.title}
            </button>
          ))}
        </div>
      )}

      {/* ── Status tabs + search ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Pill tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-xl max-w-full overflow-x-auto no-scrollbar flex-nowrap sm:flex-wrap">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 flex-shrink-0 cursor-pointer",
                statusFilter === tab.key
                  ? "bg-[#111c2c] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              )}
            >
              <span>{tab.label}</span>
              <span className={cn(
                "px-1.5 py-0.2 text-[10px] rounded-full font-bold",
                statusFilter === tab.key
                  ? "bg-white/20 text-white"
                  : "bg-slate-200/80 text-slate-600"
              )}>
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64 flex-shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            type="text"
            placeholder="Search applicants…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all"
          />
        </div>
      </div>

      {/* ── Sub-heading for selected job ────────────────────────────── */}
      {selectedJobTitle && (
        <p className="text-xs text-gray-400">
          Showing applications for: <span className="font-medium text-gray-600">{selectedJobTitle}</span>
        </p>
      )}

      {/* ── Card list ────────────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : visible.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
          <FileText size={36} className="mx-auto mb-3 text-gray-200" />
          <p className="text-gray-500 text-sm">
            {!selectedJob
              ? "Select a job to view its applications."
              : search
              ? `No applicants match "${search}"`
              : "No applications match this filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map(app => (
            <ApplicantCard
              key={app._id}
              application={app}
              onStatusChange={handleStatusChange}
              onViewDetails={setDrawerApp}
              onViewProgress={(appId, title) => {
                setProgressDrawer({ refId: appId, title });
                // Clear unseen dot optimistically
                setUnseenCounts(prev => ({ ...prev, [appId]: 0 }));
              }}
              hasUnseen={(unseenCounts[app._id] ?? 0) > 0}
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

      {/* ── Applicant profile drawer ─────────────────────────────────── */}
      <ApplicantProfileDrawer
        application={drawerApp}
        onClose={() => setDrawerApp(null)}
        onStatusChange={handleStatusChange}
      />

      {/* ── Progress updates drawer (employer read-only) ─────────────── */}
      <WorkUpdatesDrawer
        open={!!progressDrawer}
        onClose={() => setProgressDrawer(null)}
        refType="application"
        refId={progressDrawer?.refId ?? ""}
        title={progressDrawer?.title ?? ""}
        role="employer"
      />
    </div>
  );
}

// ── page export with Suspense (needed for useSearchParams) ───────────────────

export default function EmployerApplicationsPage() {
  return (
    <Suspense fallback={
      <div className="space-y-5">
        <div>
          <div className="h-7 bg-gray-200 rounded w-40 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-64 mt-2 animate-pulse" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-4/5" />
            </div>
          ))}
        </div>
      </div>
    }>
      <ApplicationsContent />
    </Suspense>
  );
}
