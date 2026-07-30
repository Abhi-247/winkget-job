"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { EmployerStatsCards } from "@/components/employer/EmployerStatsCards";
import { RecentJobPosts } from "@/components/employer/RecentJobPosts";
import { EscrowSummary } from "@/components/employer/EscrowSummary";
import { ActiveProgressWidget } from "@/components/work/ActiveProgressWidget";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { jobsApi, tasksApi } from "@/lib/api";
import { Job, Task, EmployerStats } from "@/types";
import { getGreeting, formatCurrency, formatRelativeTime, getFormattedDate } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge, statusBadge } from "@/components/ui/Badge";
import {
  Plus, Briefcase, ClipboardList, Users, UserCheck,
  FileText, MessageSquare, ShieldCheck, Zap, ArrowRight,
} from "lucide-react";
import { IdBadge } from "@/components/ui/IdBadge";

export default function EmployerDashboard() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<EmployerStats>({
    totalPosted: 0,
    totalReceived: 0,
    acceptedApplicants: 0,
    activeContracts: 0,
    activeTasks: 0,
  });

  const fetchData = useCallback(async () => {
    if (!session?.user.accessToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [jobsRes, tasksRes, statsRes] = await Promise.all([
        jobsApi.getMyJobs(session.user.accessToken),
        tasksApi.getMyTasks(session.user.accessToken),
        jobsApi.getEmployerStats(session.user.accessToken)
      ]);
      setJobs((jobsRes as { data: Job[] }).data || []);
      setTasks((tasksRes as { data: Task[] }).data || []);
      setStats((statsRes as { data: EmployerStats }).data || {
        totalPosted: 0,
        totalReceived: 0,
        acceptedApplicants: 0,
        activeContracts: 0,
        activeTasks: 0,
      });
    } catch {
      setJobs([]);
      setTasks([]);
      setStats({
        totalPosted: 0,
        totalReceived: 0,
        acceptedApplicants: 0,
        activeContracts: 0,
        activeTasks: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    setMounted(true);
    if (status === "loading") return;
    fetchData();
  }, [fetchData, status]);

  const greeting = getGreeting();
  const firstName = session?.user.name?.split(" ")[0] || "Employer";
  const formattedDate = mounted ? getFormattedDate() : "";

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-w-0">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-gray-900 truncate">
            {greeting}, {firstName}! 👋
          </h2>
          <p suppressHydrationWarning className="text-xs sm:text-sm text-gray-400 mt-0.5 leading-relaxed">
            {formattedDate} · Manage jobs, micro-tasks, and candidates
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
          <Link href="/employer/post-job">
            <Button size="sm" className="gap-1.5">
              <Plus size={14} />
              Post a Job
            </Button>
          </Link>
          <Link href="/employer/post-task">
            <Button size="sm" variant="secondary" className="gap-1.5 bg-[#edf2f7] text-[#1e3a5f] hover:bg-[#e2e8f0]">
              <Plus size={14} />
              Post a Task
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Action Toolbar */}
      <div className="bg-gradient-to-r from-[#1e3a5f] to-[#0f172a] rounded-xl p-4 sm:p-5 text-white shadow-sm space-y-3 max-w-full overflow-hidden">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <Zap size={18} className="text-yellow-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-white/70 uppercase tracking-wide font-semibold truncate">Employer Hub</p>
              <p className="text-xs sm:text-sm font-semibold text-white truncate">Management Shortcuts</p>
            </div>
          </div>
          <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-white/10 text-white/90 flex-shrink-0">
            <ShieldCheck size={13} className="text-emerald-400" /> Escrow Protected
          </span>
        </div>
        <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
            <Link
              href="/employer/my-jobs"
              className="inline-flex items-center justify-center gap-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 transition-colors px-3 py-2 sm:py-1.5 rounded-lg text-white text-center"
            >
              <Briefcase size={13} className="flex-shrink-0" /> My Jobs ({jobs.length})
            </Link>
            <Link
              href="/employer/my-tasks"
              className="inline-flex items-center justify-center gap-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 transition-colors px-3 py-2 sm:py-1.5 rounded-lg text-white text-center"
            >
              <ClipboardList size={13} className="flex-shrink-0" /> Tasks ({tasks.length})
            </Link>
            <Link
              href="/employer/applications"
              className="inline-flex items-center justify-center gap-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 transition-colors px-3 py-2 sm:py-1.5 rounded-lg text-white text-center"
            >
              <FileText size={13} className="flex-shrink-0" /> Candidates ({stats.totalReceived})
            </Link>
            <Link
              href="/employer/hire-requests"
              className="inline-flex items-center justify-center gap-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 transition-colors px-3 py-2 sm:py-1.5 rounded-lg text-white text-center"
            >
              <UserCheck size={13} className="flex-shrink-0" /> Hire Requests
            </Link>
          </div>
          <Link
            href="/talent"
            className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-600 transition-colors text-white px-3 py-2 sm:py-1.5 rounded-lg w-full sm:w-auto sm:ml-auto"
          >
            <Users size={13} className="flex-shrink-0" /> Browse Talent Pool
          </Link>
        </div>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <EmployerStatsCards stats={stats} />
      )}

      {/* Active Progress Widget */}
      <ActiveProgressWidget role="employer" />

      {/* Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6 min-w-0 overflow-hidden">
        {/* Recent job posts */}
        <div className="lg:col-span-2 space-y-6 min-w-0 overflow-hidden">
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 min-w-0 overflow-hidden">
            <div className="flex items-center justify-between gap-2 mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 min-w-0">
                <Briefcase size={16} className="text-[#1e3a5f] shrink-0" /> <span className="truncate">Recent Job Listings</span>
              </h3>
              <Link
                href="/employer/my-jobs"
                className="text-xs text-[#1e3a5f] hover:underline flex items-center gap-0.5 shrink-0 whitespace-nowrap"
              >
                View all <ArrowRight size={11} />
              </Link>
            </div>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <RecentJobPosts jobs={jobs} />
            )}
          </div>

          {/* Micro-Tasks Overview */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 min-w-0 overflow-hidden">
            <div className="flex items-center justify-between gap-2 mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 min-w-0">
                <ClipboardList size={16} className="text-[#1e3a5f] shrink-0" /> <span className="truncate">Posted Tasks</span>
              </h3>
              <Link
                href="/employer/my-tasks"
                className="text-xs text-[#1e3a5f] hover:underline flex items-center gap-0.5 shrink-0"
              >
                Manage Tasks <ArrowRight size={11} />
              </Link>
            </div>
            {loading ? (
              <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}</div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-gray-200 rounded-lg">
                <p className="text-sm text-gray-400 mb-2">No micro-tasks posted yet.</p>
                <Link href="/employer/post-task">
                  <Button size="sm" variant="outline" className="gap-1">
                    <Plus size={13} /> Post First Task
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {tasks.slice(0, 4).map((task) => (
                  <div key={task._id} className="flex items-center gap-3 py-3 min-w-0">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {task.category} · {formatCurrency(task.budget)} · {task.claimCount}/{task.maxClaims} claimed
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge variant={statusBadge(task.status)}>{task.status}</Badge>
                      <div className="hidden sm:flex">
                        <IdBadge id={task._id} prefix="TSK" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Escrow & Billing */}
        <div className="min-w-0 overflow-hidden">
          <EscrowSummary />
        </div>
      </div>
    </div>
  );
}
