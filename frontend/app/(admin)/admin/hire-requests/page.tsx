"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { adminApi } from "@/lib/api";
import { HireRequest, HireRequestStatus } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TableRowSkeleton } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/ui/Pagination";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, formatRelativeTime, cn } from "@/lib/utils";
import { UserCheck, ArrowRight, XCircle, Search } from "lucide-react";
import { IdBadge } from "@/components/ui/IdBadge";

const PAGE_LIMIT = 20;

type StatusFilter = "all" | "pending" | "accepted" | "rejected";

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: "all",      label: "All"      },
  { key: "pending",  label: "Pending"  },
  { key: "accepted", label: "Accepted" },
  { key: "rejected", label: "Rejected" },
];

export default function AdminHireRequestsPage() {
  const { data: session, status } = useSession();
  const { success, error } = useToast();

  const [requests, setRequests]   = useState<HireRequest[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]           = useState(0);

  const fetchRequests = useCallback(async () => {
    if (!session?.user.accessToken) { setLoading(false); return; }
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: String(page),
        limit: String(PAGE_LIMIT),
      };
      if (statusFilter !== "all") params.status = statusFilter;
      if (search) params.search = search;
      const res = (await adminApi.getAllHireRequests(session.user.accessToken, params)) as {
        data: HireRequest[];
        pagination: { page: number; pages: number; total: number };
      };
      setRequests(res.data || []);
      if (res.pagination) {
        setTotalPages(res.pagination.pages);
        setTotal(res.pagination.total);
      }
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [session, statusFilter, search, page]);

  useEffect(() => {
    if (status === "loading") return;
    const t = setTimeout(fetchRequests, 300);
    return () => clearTimeout(t);
  }, [fetchRequests, status]);

  useEffect(() => { setPage(1); }, [statusFilter, search]);

  const handleCancel = async (id: string) => {
    if (!session?.user.accessToken) return;
    setCancelling(id);
    try {
      await adminApi.updateHireRequestStatus(session.user.accessToken, id, "rejected");
      success("Hire request cancelled");
      fetchRequests();
    } catch {
      error("Failed to cancel hire request");
    } finally {
      setCancelling(null);
    }
  };

  const filtered = search.trim()
    ? requests.filter((req) => {
        const q = search.toLowerCase();
        const cleanQ = q.replace(/^(hr-|emp-|usr-|job-)/i, "");
        const employer = typeof req.employer === "object" ? req.employer : null;
        const jobseeker = typeof req.jobseeker === "object" ? req.jobseeker : null;
        const job = typeof req.job === "object" ? req.job : null;
        return (
          (req.projectTitle || "").toLowerCase().includes(q) ||
          (job?.title || "").toLowerCase().includes(q) ||
          (employer?.name || "").toLowerCase().includes(q) ||
          (employer?.company || "").toLowerCase().includes(q) ||
          (jobseeker?.name || "").toLowerCase().includes(q) ||
          (employer?._id || "").toLowerCase().includes(cleanQ) ||
          (jobseeker?._id || "").toLowerCase().includes(cleanQ) ||
          (job?._id || "").toLowerCase().includes(cleanQ) ||
          (req._id || "").toLowerCase().includes(cleanQ)
        );
      })
    : requests;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Hire Requests</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          {total > 0 ? `${total} total hire requests` : "View all hiring activity on the platform"}
        </p>
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg w-fit flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={cn(
              "px-4 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
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
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Employer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">→</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Job Seeker</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Project / Job</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Salary</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden xl:table-cell">Sent</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => <TableRowSkeleton key={i} cols={8} />)
                : filtered.map((req) => {
                    const employer  = typeof req.employer  === "object" ? req.employer  : null;
                    const jobseeker = typeof req.jobseeker === "object" ? req.jobseeker : null;
                    const job       = typeof req.job       === "object" ? req.job       : null;
                    const isFreelance = req.hireType === "freelance";
                    const projectTitle = isFreelance
                      ? (req.projectTitle ?? "Freelance Project")
                      : (job?.title ?? "—");

                    return (
                      <tr key={req._id} className="hover:bg-gray-50 transition-colors">
                        {/* Employer */}
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <Avatar name={employer?.company || employer?.name || "?"} src={(employer as any)?.avatar} size="xs" />
                            <div className="min-w-0">
                              <span className="text-xs text-gray-700 truncate block max-w-[120px]">
                                {employer?.company || employer?.name || "—"}
                              </span>
                              {employer?._id && <IdBadge id={employer._id} prefix="EMP" />}
                            </div>
                          </div>
                        </td>
                        {/* Arrow */}
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <ArrowRight size={14} className="text-gray-300" />
                        </td>
                        {/* Job Seeker */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Avatar name={jobseeker?.name || "?"} src={(jobseeker as any)?.avatar} size="xs" />
                            <div className="min-w-0">
                              <span className="text-xs text-gray-700 truncate block max-w-[120px]">
                                {jobseeker?.name || "—"}
                              </span>
                              {jobseeker?._id && <IdBadge id={jobseeker._id} prefix="USR" />}
                            </div>
                          </div>
                        </td>
                        {/* Project / Job */}
                        <td className="px-4 py-3 hidden md:table-cell">
                          <p className="text-xs text-gray-700 truncate max-w-[160px] mb-0.5">{projectTitle}</p>
                          <IdBadge id={req._id} prefix="HR" />
                          {isFreelance && (
                            <span className="text-[10px] text-blue-500 font-medium ml-1">Freelance</span>
                          )}
                        </td>
                        {/* Salary */}
                        <td className="px-4 py-3 text-xs text-gray-700 hidden lg:table-cell whitespace-nowrap">
                          {formatCurrency(req.salary)}/mo
                        </td>
                        {/* Status */}
                        <td className="px-4 py-3">
                          <Badge variant={statusBadge(req.status)}>
                            {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                          </Badge>
                        </td>
                        {/* Sent */}
                        <td className="px-4 py-3 text-xs text-gray-400 hidden xl:table-cell whitespace-nowrap">
                          {formatRelativeTime(req.createdAt)}
                        </td>
                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex justify-end">
                            {req.status === "pending" && (
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleCancel(req._id)}
                                loading={cancelling === req._id}
                                className="gap-1.5"
                              >
                                <XCircle size={13} />
                                Cancel
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
          {!loading && requests.length === 0 && (
            <div className="text-center py-14">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <UserCheck size={20} className="text-gray-300" />
              </div>
              <p className="text-sm text-gray-500">No hire requests found.</p>
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-gray-100">
          <Pagination page={page} pages={totalPages} total={total} limit={PAGE_LIMIT} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
}
