"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { applicationsApi, jobsApi } from "@/lib/api";
import { Application, ApplicationStatus, Job } from "@/types";
import { ApplicantCard } from "@/components/employer/ApplicantCard";
import { ApplicantProfileDrawer } from "@/components/employer/ApplicantProfileDrawer";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { FileText, Search } from "lucide-react";

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
  const { data: session } = useSession();
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

  // Fetch employer's jobs for the job-chip row
  useEffect(() => {
    if (!session?.user.accessToken) return;
    jobsApi.getMyJobs(session.user.accessToken)
      .then((res) => {
        const data = (res as { data: Job[] }).data ?? [];
        setJobs(data);
        if (!selectedJob && data.length > 0) setSelectedJob(data[0]._id);
      })
      .catch(() => {});
  }, [session, selectedJob]);

  const fetchApplications = useCallback(async () => {
    if (!session?.user.accessToken || !selectedJob) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = (await applicationsApi.getJobApplications(
        session.user.accessToken,
        selectedJob
      )) as { data: Application[] };
      setApplications(res.data ?? []);
    } catch {
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [session, selectedJob]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

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
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedJob("")}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium transition-colors border",
              !selectedJob
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
            )}
          >
            All Jobs
          </button>
          {jobs.map(job => (
            <button
              key={job._id}
              onClick={() => setSelectedJob(job._id)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-colors border",
                selectedJob === job._id
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
              )}
            >
              {job.title}
            </button>
          ))}
        </div>
      )}

      {/* ── Status tabs + search ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Pill tabs */}
        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg flex-shrink-0 flex-wrap">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                statusFilter === tab.key
                  ? "bg-gray-900 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              {tab.label}
              <span className={cn(
                "ml-1.5 text-xs",
                statusFilter === tab.key ? "text-gray-300" : "text-gray-400"
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
            placeholder="Search applicants…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
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
            />
          ))}
        </div>
      )}

      {/* ── Applicant profile drawer ─────────────────────────────────── */}
      <ApplicantProfileDrawer
        application={drawerApp}
        onClose={() => setDrawerApp(null)}
        onStatusChange={handleStatusChange}
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
