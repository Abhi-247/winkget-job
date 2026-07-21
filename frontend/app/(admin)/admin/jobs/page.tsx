"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { adminApi } from "@/lib/api";
import { Job } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TableRowSkeleton } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/ui/Pagination";
import { Input } from "@/components/ui/Input";
import { JobDetailModal } from "@/components/admin/JobDetailModal";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { Briefcase, Search, XCircle, RefreshCw, Trash2 } from "lucide-react";

const PAGE_LIMIT = 20;

type StatusFilter = "all" | "open" | "closed" | "draft";

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: "all",    label: "All"    },
  { key: "open",   label: "Open"   },
  { key: "closed", label: "Closed" },
  { key: "draft",  label: "Draft"  },
];

const employmentLabels: Record<string, string> = {
  fullTime:   "Full Time",
  partTime:   "Part Time",
  contract:   "Contract",
  internship: "Internship",
};

export default function AdminJobsPage() {
  const { data: session, status } = useSession();
  const { success, error } = useToast();

  const [jobs, setJobs]               = useState<Job[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [updating, setUpdating]       = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [deleting, setDeleting]       = useState(false);
  const [page, setPage]               = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [total, setTotal]             = useState(0);

  const fetchJobs = useCallback(async () => {
    if (!session?.user.accessToken) { setLoading(false); return; }
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: String(PAGE_LIMIT) };
      if (statusFilter !== "all") params.status = statusFilter;
      const res = (await adminApi.getAllJobs(session.user.accessToken, params)) as {
        data: Job[];
        pagination: { page: number; pages: number; total: number };
      };
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
  }, [session, statusFilter, page]);

  useEffect(() => {
    if (status === "loading") return;
    fetchJobs();
  }, [fetchJobs, status]);

  useEffect(() => { setPage(1); }, [statusFilter, search]);

  const handleStatusUpdate = async (id: string, newStatus: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!session?.user.accessToken) return;
    setUpdating(id);
    try {
      await adminApi.updateJobStatus(session.user.accessToken, id, newStatus);
      success(`Job ${newStatus === "open" ? "reopened" : "closed"}`);
      // Optimistic update
      setJobs((prev) => prev.map((j) => j._id === id ? { ...j, status: newStatus as Job["status"] } : j));
      setSelectedJob((prev) => prev?._id === id ? { ...prev, status: newStatus as Job["status"] } : prev);
    } catch {
      error("Failed to update job status");
      fetchJobs();
    } finally {
      setUpdating(null);
    }
  };

  const handleDeleteJob = async () => {
    if (!session?.user.accessToken || !deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deleteJob(session.user.accessToken, deleteTarget.id);
      success("Job deleted");
      setDeleteTarget(null);
      setSelectedJob(null);
      fetchJobs();
    } catch {
      error("Failed to delete job");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = search.trim()
    ? jobs.filter((j) =>
        j.title.toLowerCase().includes(search.toLowerCase()) ||
        (typeof j.employer === "object" && (j.employer.company || j.employer.name || "").toLowerCase().includes(search.toLowerCase()))
      )
    : jobs;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Jobs</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {total > 0 ? `${total} total jobs` : "Manage all platform jobs"}
          </p>
        </div>
        <Input
          placeholder="Search jobs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search size={15} />}
          className="w-52"
        />
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl w-fit flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
              statusFilter === tab.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Job</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Employer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Salary</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Posted</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => <TableRowSkeleton key={i} cols={7} />)
                : filtered.map((job) => {
                    const employer = typeof job.employer === "object" ? job.employer : null;
                    const salaryDisplay =
                      job.salaryMin && job.salaryMax
                        ? `${formatCurrency(job.salaryMin)} – ${formatCurrency(job.salaryMax)}`
                        : formatCurrency(job.salary);

                    return (
                      <tr
                        key={job._id}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => setSelectedJob(job)}
                      >
                        <td className="px-6 py-3">
                          <p className="font-medium text-gray-900 truncate max-w-[200px]">{job.title}</p>
                          <p className="text-xs text-gray-400 capitalize">
                            {job.department || job.category || "—"}
                          </p>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <Avatar name={employer?.company || employer?.name || "?"} size="xs" />
                            <span className="text-xs text-gray-700 truncate max-w-[130px]">
                              {employer?.company || employer?.name || "—"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 hidden sm:table-cell whitespace-nowrap">
                          {salaryDisplay}
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="text-xs text-gray-500">
                            {job.employmentType ? (employmentLabels[job.employmentType] ?? job.employmentType) : "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={statusBadge(job.status)} className="capitalize">
                            {job.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400 hidden lg:table-cell">
                          {formatDate(job.createdAt)}
                        </td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end gap-1.5">
                            {job.status === "open" ? (
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={(e) => handleStatusUpdate(job._id, "closed", e)}
                                loading={updating === job._id}
                                className="gap-1.5"
                              >
                                <XCircle size={13} />
                                Close
                              </Button>
                            ) : job.status === "closed" ? (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={(e) => handleStatusUpdate(job._id, "open", e)}
                                loading={updating === job._id}
                                className="gap-1.5"
                              >
                                <RefreshCw size={13} />
                                Reopen
                              </Button>
                            ) : null}
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => setDeleteTarget({ id: job._id, title: job.title })}
                              className="gap-1"
                            >
                              <Trash2 size={13} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
          {!loading && filtered.length === 0 && (
            <div className="text-center py-14">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Briefcase size={20} className="text-gray-300" />
              </div>
              <p className="text-sm text-gray-500">No jobs found.</p>
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-gray-100">
          <Pagination page={page} pages={totalPages} total={total} limit={PAGE_LIMIT} onPageChange={setPage} />
        </div>
      </div>

      <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} />

      <ConfirmDeleteModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteJob}
        title={`Delete "${deleteTarget?.title ?? "job"}"?`}
        description="This will permanently delete the job and all its applications. This cannot be undone."
        confirmPhrase="delete"
        loading={deleting}
      />
    </div>
  );
}
