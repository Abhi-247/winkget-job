"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { tasksApi } from "@/lib/api";
import { Task } from "@/types";
import { Button } from "@/components/ui/Button";
import { TaskCard } from "@/components/employer/TaskCard";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

type TabKey = "all" | "open" | "assigned" | "completed" | "closed";

const TABS: { key: TabKey; label: string }[] = [
  { key: "all",       label: "All" },
  { key: "open",      label: "Active" },
  { key: "assigned",  label: "Assigned" },
  { key: "completed", label: "Completed" },
  { key: "closed",    label: "Closed" },
];

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

export default function MyTasksPage() {
  const { data: session, status } = useSession();
  const { success, error } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [search, setSearch] = useState("");

  const fetchTasks = useCallback(async () => {
    if (!session?.user.accessToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = (await tasksApi.getMyTasks(session.user.accessToken)) as { data: Task[] };
      setTasks(res.data || []);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (status === "loading") return;
    fetchTasks();
  }, [fetchTasks, status]);

  const handleClose = async (id: string) => {
    if (!session?.user.accessToken) return;
    try {
      await tasksApi.updateTask(session.user.accessToken, id, { status: "closed" });
      success("Task closed");
      fetchTasks();
    } catch {
      error("Failed to close task");
    }
  };

  const handleReopen = async (id: string) => {
    if (!session?.user.accessToken) return;
    try {
      await tasksApi.updateTask(session.user.accessToken, id, { status: "open" });
      success("Task reopened");
      fetchTasks();
    } catch {
      error("Failed to reopen task");
    }
  };

  const handleDelete = async (id: string) => {
    if (!session?.user.accessToken) return;
    if (!confirm("Delete this task? This cannot be undone.")) return;
    try {
      await tasksApi.deleteTask(session.user.accessToken, id);
      success("Task deleted");
      fetchTasks();
    } catch {
      error("Failed to delete task");
    }
  };

  const counts = {
    all:       tasks.length,
    open:      tasks.filter(t => t.status === "open").length,
    assigned:  tasks.filter(t => t.status === "assigned").length,
    completed: tasks.filter(t => t.status === "completed").length,
    closed:    tasks.filter(t => t.status === "closed").length,
  };

  const visible = tasks.filter(t => {
    const matchesTab = activeTab === "all" || t.status === activeTab;
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">My Tasks</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {counts.open} active · {counts.assigned} assigned · {counts.completed} completed · {counts.closed} closed
          </p>
        </div>
        <Link href="/employer/post-task">
          <Button size="sm" className="gap-1.5 w-full sm:w-auto">
            <Plus size={14} />
            Post New Task
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg flex-shrink-0 overflow-x-auto max-w-full">
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

        <div className="relative w-full sm:max-w-xs ml-auto">
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

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : visible.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
          <p className="text-gray-500 text-sm">
            {search ? `No tasks match "${search}"` : "No tasks in this category."}
          </p>
          {!search && activeTab === "all" && (
            <Link href="/employer/post-task" className="text-[#1e3a5f] text-sm hover:underline mt-2 inline-block">
              Post your first task
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map(task => (
            <TaskCard
              key={task._id}
              task={task}
              onClose={handleClose}
              onReopen={handleReopen}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
