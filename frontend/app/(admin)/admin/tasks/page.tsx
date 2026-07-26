"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { adminApi } from "@/lib/api";
import { Task } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TableRowSkeleton } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/ui/Pagination";
import { Input } from "@/components/ui/Input";
import { TaskDetailModal } from "@/components/admin/TaskDetailModal";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { ClipboardList, Search, XCircle, Star } from "lucide-react";
import { IdBadge } from "@/components/ui/IdBadge";

const PAGE_LIMIT = 20;

type StatusFilter = "all" | "open" | "assigned" | "completed" | "closed";

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "assigned", label: "Assigned" },
  { key: "completed", label: "Completed" },
  { key: "closed", label: "Closed" },
];

export default function AdminTasksPage() {
  const { data: session, status } = useSession();
  const { success, error } = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [closing, setClosing] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchTasks = useCallback(async () => {
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
      if (search) params.search = search;
      const res = (await adminApi.getAllTasks(
        session.user.accessToken,
        params,
      )) as {
        data: Task[];
        pagination: { page: number; pages: number; total: number };
      };
      setTasks(res.data || []);
      if (res.pagination) {
        setTotalPages(res.pagination.pages);
        setTotal(res.pagination.total);
      }
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [session, statusFilter, search, page]);

  useEffect(() => {
    if (status === "loading") return;
    const t = setTimeout(fetchTasks, 300);
    return () => clearTimeout(t);
  }, [fetchTasks, status]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, search]);

  const handleClose = async (id: string) => {
    if (!session?.user.accessToken) return;
    setClosing(id);
    try {
      await adminApi.updateTaskStatus(session.user.accessToken, id, "closed");
      success("Task closed");
      fetchTasks();
    } catch {
      error("Failed to close task");
    } finally {
      setClosing(null);
    }
  };

  const handleToggleFeatured = async (id: string, isFeatured: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!session?.user.accessToken) return;
    try {
      await adminApi.toggleTaskFeatured(session.user.accessToken, id, { isFeatured: !isFeatured });
      success(isFeatured ? "Task unfeatured" : "Task marked as Featured");
      setTasks((prev) => prev.map((t) => (t._id === id ? { ...t, isFeatured: !isFeatured } : t)));
    } catch {
      error("Failed to toggle featured status");
    }
  };

  const filtered = search.trim()
    ? tasks.filter((t) => {
        const q = search.toLowerCase();
        const cleanQ = q.replace(/^(tsk-|emp-)/i, "");
        const employer = typeof t.employer === "object" ? t.employer : null;
        return (
          t.title?.toLowerCase().includes(q) ||
          t.category?.toLowerCase().includes(q) ||
          t.taskType?.toLowerCase().includes(q) ||
          t.location?.toLowerCase().includes(q) ||
          t._id?.toLowerCase().includes(cleanQ) ||
          (employer && (
            (employer.name || "").toLowerCase().includes(q) ||
            (employer.company || "").toLowerCase().includes(q) ||
            ((employer as any).email || "").toLowerCase().includes(q) ||
            employer._id?.toLowerCase().includes(cleanQ)
          ))
        );
      })
    : tasks;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Tasks</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {total > 0 ? `${total} total tasks` : "Manage all micro-tasks"}
          </p>
        </div>
        <Input
          placeholder="Search by Task Title, Task ID, or Employer ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search size={15} />}
          className="w-full sm:w-80"
        />
      </div>

      {/* Status filter tabs */}
      <div className="flex w-full sm:w-fit gap-1 p-1 bg-gray-100 rounded-xl">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={cn(
              "flex-1 sm:flex-initial px-2.5 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all text-center whitespace-nowrap",
              statusFilter === tab.key
                ? "bg-white text-[#1e3a5f] shadow-sm"
                : "text-gray-500 hover:text-gray-700",
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
                <div key={i} className="h-28 animate-pulse bg-gray-50" />
              ))
            : filtered.map((task) => {
                const employer =
                  typeof task.employer === "object" ? task.employer : null;
                return (
                  <div
                    key={task._id}
                    className="space-y-3 p-4"
                    onClick={() => setSelectedTask(task)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar
                        name={employer?.company || employer?.name || "?"}
                        size="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-gray-900">
                          {task.title}
                        </p>
                        <p className="text-xs capitalize text-gray-400">
                          {task.taskType}
                        </p>
                        <p className="mt-1 text-xs text-gray-600">
                          {formatCurrency(task.budget)}
                        </p>
                      </div>
                      <Badge variant={statusBadge(task.status)}>
                        {task.status}
                      </Badge>
                    </div>
                    {task.status !== "closed" && (
                      <div
                        className="flex justify-end"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleClose(task._id)}
                          loading={closing === task._id}
                          className="gap-1.5"
                        >
                          <XCircle size={13} /> Close
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
          {!loading && filtered.length === 0 && (
            <div className="p-8 text-center text-sm text-gray-400">
              No tasks found.
            </div>
          )}
        </div>
        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Task
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">
                  Employer
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">
                  Budget
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">
                  Deadline
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
                : filtered.map((task) => {
                    const employer =
                      typeof task.employer === "object" ? task.employer : null;
                    return (
                      <tr
                        key={task._id}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => setSelectedTask(task)}
                      >
                        <td className="px-6 py-3">
                          <p className="font-medium text-gray-900 truncate max-w-[200px]">
                            {task.title}
                          </p>
                          <p className="text-xs text-gray-400 capitalize mb-1">
                            {task.taskType}
                          </p>
                          <IdBadge id={task._id} prefix="TSK" />
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <Avatar
                              name={employer?.company || employer?.name || "?"}
                              size="xs"
                            />
                            <div className="min-w-0">
                              <span className="text-xs text-gray-700 truncate block max-w-[120px]">
                                {employer?.company || employer?.name || "—"}
                              </span>
                              {employer?._id && <IdBadge id={employer._id} prefix="EMP" />}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 hidden sm:table-cell">
                          {formatCurrency(task.budget)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={statusBadge(task.status)}>
                            {task.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400 hidden lg:table-cell">
                          {task.endDate ? formatDate(task.endDate) : "—"}
                        </td>
                        <td
                          className="px-4 py-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => handleToggleFeatured(task._id, Boolean(task.isFeatured), e)}
                              className={cn(
                                "p-1.5 rounded-lg border transition-all cursor-pointer",
                                task.isFeatured
                                  ? "bg-amber-50 text-amber-600 border-amber-200"
                                  : "bg-slate-50 text-slate-400 border-slate-200 hover:text-amber-500"
                              )}
                              title={task.isFeatured ? "Featured Task (Click to unfeature)" : "Mark as Featured"}
                            >
                              <Star size={14} className={task.isFeatured ? "fill-amber-400 text-amber-400" : ""} />
                            </button>
                            {task.status !== "closed" && (
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleClose(task._id)}
                                loading={closing === task._id}
                                className="gap-1.5"
                              >
                                <XCircle size={13} />
                                Close
                              </Button>
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
                <ClipboardList size={20} className="text-gray-300" />
              </div>
              <p className="text-sm text-gray-500">No tasks found.</p>
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

      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </div>
  );
}
