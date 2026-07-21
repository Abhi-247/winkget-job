"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { adminApi } from "@/lib/api";
import { Application, ApplicationStatus } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TableRowSkeleton } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/ui/Pagination";
import { Input } from "@/components/ui/Input";
import { ApplicationDetailModal } from "@/components/admin/ApplicationDetailModal";
import { useToast } from "@/components/ui/Toast";
import { formatDate, cn } from "@/lib/utils";
import { FileText, Search } from "lucide-react";

const PAGE_LIMIT = 20;

type StatusFilter = "all" | "pending" | "shortlisted" | "accepted" | "rejected";

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "shortlisted", label: "Shortlisted" },
  { key: "accepted", label: "Accepted" },
  { key: "rejected", label: "Rejected" },
];

export default function AdminApplicationsPage() {
  const { data: session, status } = useSession();
  const { success, error } = useToast();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selected, setSelected] = useState<Application | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchApplications = useCallback(async () => {
    if (!session?.user.accessToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: String(page),
        limit: String(PAGE_LIMIT),
      };
      if (statusFilter !== "all") params.status = statusFilter;
      const res = (await adminApi.getAllApplications(
        session.user.accessToken,
        params,
      )) as {
        data: Application[];
        pagination: { page: number; pages: number; total: number };
      };
      setApplications(res.data || []);
      if (res.pagination) {
        setTotalPages(res.pagination.pages);
        setTotal(res.pagination.total);
      }
    } catch {
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [session, statusFilter, page]);

  useEffect(() => {
    if (status === "loading") return;
    fetchApplications();
  }, [fetchApplications, status]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, search]);

  const handleStatusChange = async (
    id: string,
    newStatus: ApplicationStatus,
  ) => {
    if (!session?.user.accessToken) return;
    try {
      await adminApi.updateApplicationStatus(
        session.user.accessToken,
        id,
        newStatus,
      );
      success(`Application ${newStatus}`);
      setApplications((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status: newStatus } : a)),
      );
      setSelected((prev) =>
        prev?._id === id ? { ...prev, status: newStatus } : prev,
      );
    } catch {
      error("Failed to update status");
    }
  };

  // Client-side search by applicant name or job title
  const filtered = search.trim()
    ? applications.filter((a) => {
        const applicant = typeof a.applicant === "object" ? a.applicant : null;
        const job = typeof a.job === "object" ? a.job : null;
        const q = search.toLowerCase();
        return (
          applicant?.name?.toLowerCase().includes(q) ||
          job?.title?.toLowerCase().includes(q)
        );
      })
    : applications;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Applications</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {total > 0
              ? `${total} total applications`
              : "Manage all candidate applications"}
          </p>
        </div>
        <Input
          placeholder="Search applicants or jobs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search size={15} />}
          className="w-full sm:w-56"
        />
      </div>

      {/* Status filter tabs */}
      <div className="flex w-full items-center gap-1 overflow-x-auto p-1 bg-gray-100 rounded-xl sm:w-fit sm:flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={cn(
              "min-w-max px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
              statusFilter === tab.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="sm:hidden divide-y divide-gray-100">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 animate-pulse bg-gray-50" />
              ))
            : filtered.map((app) => {
                const applicant =
                  typeof app.applicant === "object" ? app.applicant : null;
                const job = typeof app.job === "object" ? app.job : null;
                return (
                  <div
                    key={app._id}
                    className="space-y-3 p-4"
                    onClick={() => setSelected(app)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar
                        name={applicant?.name ?? "?"}
                        src={applicant?.avatar}
                        size="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-gray-900">
                          {applicant?.name ?? "-"}
                        </p>
                        <p className="truncate text-xs text-gray-400">
                          {applicant?.title || applicant?.email || "-"}
                        </p>
                        <p className="mt-1 truncate text-xs text-gray-600">
                          {job?.title ?? "-"}
                        </p>
                      </div>
                      <Badge
                        variant={statusBadge(app.status)}
                        className="capitalize"
                      >
                        {app.status}
                      </Badge>
                    </div>
                    <div
                      className="flex flex-wrap justify-end gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {app.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="text-purple-700 bg-purple-50 border border-purple-200"
                            onClick={() =>
                              handleStatusChange(app._id, "shortlisted")
                            }
                          >
                            Shortlist
                          </Button>
                          <Button
                            size="sm"
                            onClick={() =>
                              handleStatusChange(app._id, "accepted")
                            }
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() =>
                              handleStatusChange(app._id, "rejected")
                            }
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {app.status === "shortlisted" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() =>
                              handleStatusChange(app._id, "accepted")
                            }
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() =>
                              handleStatusChange(app._id, "rejected")
                            }
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
          {!loading && filtered.length === 0 && (
            <div className="p-8 text-center text-sm text-gray-400">
              No applications found.
            </div>
          )}
        </div>
        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Applicant
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">
                  Applied For
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">
                  Skills
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">
                  Applied
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <TableRowSkeleton key={i} cols={6} />
                  ))
                : filtered.map((app) => {
                    const applicant =
                      typeof app.applicant === "object" ? app.applicant : null;
                    const job = typeof app.job === "object" ? app.job : null;

                    return (
                      <tr
                        key={app._id}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => setSelected(app)}
                      >
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar
                              name={applicant?.name ?? "?"}
                              src={applicant?.avatar}
                              size="sm"
                            />
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 truncate">
                                {applicant?.name ?? "—"}
                              </p>
                              <p className="text-xs text-gray-400 truncate">
                                {applicant?.title || applicant?.email || "—"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <p className="text-sm text-gray-700 truncate max-w-[180px]">
                            {job?.title ?? "—"}
                          </p>
                          <p className="text-xs text-gray-400 capitalize">
                            {job?.employmentType
                              ? ({
                                  fullTime: "Full Time",
                                  partTime: "Part Time",
                                  contract: "Contract",
                                  internship: "Internship",
                                }[job.employmentType] ?? job.employmentType)
                              : (job?.category ?? "—")}
                          </p>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {applicant?.skills?.slice(0, 3).map((s) => (
                              <span
                                key={s}
                                className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs border border-gray-200"
                              >
                                {s}
                              </span>
                            ))}
                            {(applicant?.skills?.length ?? 0) > 3 && (
                              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 text-xs">
                                +{applicant!.skills.length - 3}
                              </span>
                            )}
                            {!applicant?.skills?.length && (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={statusBadge(app.status)}
                            className="capitalize"
                          >
                            {app.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400 hidden lg:table-cell">
                          {formatDate(app.createdAt)}
                        </td>
                        <td
                          className="px-4 py-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex justify-end gap-1.5 flex-wrap">
                            {app.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200"
                                  onClick={() =>
                                    handleStatusChange(app._id, "shortlisted")
                                  }
                                >
                                  Shortlist
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleStatusChange(app._id, "accepted")
                                  }
                                >
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={() =>
                                    handleStatusChange(app._id, "rejected")
                                  }
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            {app.status === "shortlisted" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleStatusChange(app._id, "accepted")
                                  }
                                >
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={() =>
                                    handleStatusChange(app._id, "rejected")
                                  }
                                >
                                  Reject
                                </Button>
                              </>
                            )}
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
                <FileText size={20} className="text-gray-300" />
              </div>
              <p className="text-sm text-gray-500">No applications found.</p>
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-gray-100">
          <Pagination
            page={page}
            pages={totalPages}
            total={total}
            limit={PAGE_LIMIT}
            onPageChange={setPage}
          />
        </div>
      </div>

      <ApplicationDetailModal
        application={selected}
        onClose={() => setSelected(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
