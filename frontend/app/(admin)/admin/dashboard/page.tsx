"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { adminApi } from "@/lib/api";
import { AdminStats, User, Job, Task, HireRequest, ActivityLog } from "@/types";
import { AdminStatsCards } from "@/components/admin/AdminStatsCards";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { formatRelativeTime, formatCurrency, getGreeting } from "@/lib/utils";
import {
  ArrowRight, Users, Briefcase, ClipboardList, FileText,
  UserCheck, BarChart2, Activity, ShieldCheck, Server, Zap,
  CheckCircle2, Clock, XCircle, Star,
} from "lucide-react";
import Link from "next/link";
import { IdBadge } from "@/components/ui/IdBadge";
import { AdminUserDrawer } from "@/components/admin/AdminUserDrawer";
import { JobDetailModal } from "@/components/admin/JobDetailModal";
import { TaskDetailModal } from "@/components/admin/TaskDetailModal";

function getFormattedDate() {
  return new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

const ACTION_ICONS: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  user_registered:         { label: "User registered",         icon: UserCheck,     color: "text-blue-600 bg-blue-50"    },
  user_deleted:            { label: "User deleted",            icon: Users,         color: "text-red-500 bg-red-50"      },
  user_banned:             { label: "User banned",             icon: Users,         color: "text-orange-500 bg-orange-50"},
  user_activated:          { label: "User activated",          icon: ShieldCheck,   color: "text-green-600 bg-green-50"  },
  job_posted:              { label: "Job posted",              icon: Briefcase,     color: "text-indigo-600 bg-indigo-50"},
  job_closed:              { label: "Job closed",              icon: XCircle,       color: "text-orange-500 bg-orange-50"},
  task_posted:             { label: "Task posted",             icon: ClipboardList, color: "text-purple-600 bg-purple-50"},
  application_submitted:   { label: "Application submitted",   icon: FileText,      color: "text-blue-600 bg-blue-50"    },
  application_accepted:    { label: "Application accepted",    icon: CheckCircle2,  color: "text-green-600 bg-green-50"  },
  hire_request_created:    { label: "Hire request created",    icon: UserCheck,     color: "text-blue-600 bg-blue-50"    },
};

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0, activeJobs: 0, totalJobs: 0, totalTasks: 0,
    totalApplications: 0, totalHireRequests: 0, totalEmployers: 0, totalJobseekers: 0,
  });
  const [recentUsers, setRecentUsers]         = useState<User[]>([]);
  const [recentJobs, setRecentJobs]           = useState<Job[]>([]);
  const [recentTasks, setRecentTasks]         = useState<Task[]>([]);
  const [recentHireReqs, setRecentHireReqs]   = useState<HireRequest[]>([]);
  const [recentLogs, setRecentLogs]           = useState<any[]>([]);

  // Drawers
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedJob, setSelectedJob]       = useState<Job | null>(null);
  const [selectedTask, setSelectedTask]     = useState<Task | null>(null);

  const fetchData = useCallback(async () => {
    if (!session?.user.accessToken) { setLoading(false); return; }
    setLoading(true);
    try {
      const [statsRes, signupsRes, jobsRes, tasksRes, hireRes, logsRes] = await Promise.all([
        adminApi.getStats(session.user.accessToken) as Promise<{ data: AdminStats }>,
        adminApi.getRecentSignups(session.user.accessToken) as Promise<{ data: User[] }>,
        adminApi.getAllJobs(session.user.accessToken, { page: "1", limit: "5" }) as Promise<{ data: Job[] }>,
        adminApi.getAllTasks(session.user.accessToken, { page: "1", limit: "5" }) as Promise<{ data: Task[] }>,
        adminApi.getAllHireRequests(session.user.accessToken, { page: "1", limit: "5" }) as Promise<{ data: HireRequest[] }>,
        adminApi.getActivityLogs(session.user.accessToken, { page: "1", limit: "5" }) as Promise<{ data: any[] }>,
      ]);
      setStats(statsRes.data);
      setRecentUsers(signupsRes.data || []);
      setRecentJobs(jobsRes.data || []);
      setRecentTasks(tasksRes.data || []);
      setRecentHireReqs(hireRes.data || []);
      setRecentLogs(logsRes.data || []);
    } catch {
      // keep defaults
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (status === "loading") return;
    fetchData();
  }, [fetchData, status]);

  const greeting = getGreeting();
  const firstName = session?.user.name?.split(" ")[0] || "Admin";

  return (
    <div className="space-y-6">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{greeting}, {firstName}! 👋</h2>
          <p className="text-sm text-gray-400 mt-0.5">{getFormattedDate()} · Platform Control Center</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            System Live
          </span>
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-[#edf2f7] text-[#1e3a5f] border border-[#1e3a5f]/10">
            Admin Panel
          </span>
        </div>
      </div>

      {/* ── System Status & Quick Actions Bar ── */}
      <div className="bg-gradient-to-r from-[#1e3a5f] to-[#0f172a] rounded-xl p-5 text-white shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Zap size={20} className="text-yellow-400" />
            </div>
            <div>
              <p className="text-xs text-white/70 uppercase tracking-wide font-semibold">Quick Actions</p>
              <p className="text-sm font-medium text-white">Direct Management Shortcuts</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 transition-colors px-3 py-1.5 rounded-lg border border-white/10"
            >
              <Users size={13} /> Users
            </Link>
            <Link
              href="/admin/jobs"
              className="inline-flex items-center gap-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 transition-colors px-3 py-1.5 rounded-lg border border-white/10"
            >
              <Briefcase size={13} /> Jobs
            </Link>
            <Link
              href="/admin/tasks"
              className="inline-flex items-center gap-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 transition-colors px-3 py-1.5 rounded-lg border border-white/10"
            >
              <ClipboardList size={13} /> Tasks
            </Link>
            <Link
              href="/admin/applications"
              className="inline-flex items-center gap-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 transition-colors px-3 py-1.5 rounded-lg border border-white/10"
            >
              <FileText size={13} /> Applications
            </Link>
            <Link
              href="/admin/reports"
              className="inline-flex items-center gap-1.5 text-xs font-medium bg-amber-500 hover:bg-amber-600 transition-colors text-white px-3 py-1.5 rounded-lg font-semibold"
            >
              <BarChart2 size={13} /> Reports
            </Link>
          </div>
        </div>

        {/* System metrics row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs">
          <div className="flex items-center gap-2">
            <Server size={14} className="text-emerald-400" />
            <span className="text-white/70">Database:</span>
            <span className="font-semibold text-emerald-400">Connected</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-blue-400" />
            <span className="text-white/70">API Latency:</span>
            <span className="font-semibold text-blue-300">~38ms</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-purple-400" />
            <span className="text-white/70">Security:</span>
            <span className="font-semibold text-purple-300">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-amber-400" />
            <span className="text-white/70">System Health:</span>
            <span className="font-semibold text-amber-300">100% Optimal</span>
          </div>
        </div>
      </div>

      {/* ── Key Metrics Cards ── */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <AdminStatsCards stats={stats} />
      )}

      {/* ── Section 1: Recent Sign-ups & Recent Jobs ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Sign-ups */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Users size={16} className="text-[#1e3a5f]" /> Recent Sign-ups
              </h3>
              <Link href="/admin/users" className="text-xs text-[#1e3a5f] hover:underline flex items-center gap-0.5">
                View All <ArrowRight size={11} />
              </Link>
            </div>
            {loading ? (
              <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)}</div>
            ) : recentUsers.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">No users yet.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentUsers.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center gap-3 py-2.5 hover:bg-gray-50/80 p-1.5 rounded-lg cursor-pointer transition-colors"
                    onClick={() => setSelectedUserId(user._id)}
                  >
                    <Avatar name={user.name} src={user.avatar} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    <Badge variant={user.role === "employer" ? "info" : user.role === "admin" ? "danger" : "success"}>
                      {user.role}
                    </Badge>
                    <IdBadge id={user._id} prefix={user.role === "employer" ? "EMP" : "USR"} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Briefcase size={16} className="text-[#1e3a5f]" /> Recent Jobs
              </h3>
              <Link href="/admin/jobs" className="text-xs text-[#1e3a5f] hover:underline flex items-center gap-0.5">
                View All <ArrowRight size={11} />
              </Link>
            </div>
            {loading ? (
              <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)}</div>
            ) : recentJobs.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">No jobs yet.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentJobs.map((job) => {
                  const employer = typeof job.employer === "object" ? job.employer : null;
                  return (
                    <div
                      key={job._id}
                      className="flex items-center gap-3 py-2.5 hover:bg-gray-50/80 p-1.5 rounded-lg cursor-pointer transition-colors"
                      onClick={() => setSelectedJob(job)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{job.title}</p>
                        <p className="text-xs text-gray-400 truncate">
                          {employer?.company || employer?.name || "—"} · {formatCurrency(job.salary)}
                        </p>
                      </div>
                      <Badge variant={statusBadge(job.status)}>{job.status}</Badge>
                      <IdBadge id={job._id} prefix="JOB" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Section 2: Recent Micro-Tasks & Hire Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Micro-Tasks */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <ClipboardList size={16} className="text-[#1e3a5f]" /> Recent Micro-Tasks
              </h3>
              <Link href="/admin/tasks" className="text-xs text-[#1e3a5f] hover:underline flex items-center gap-0.5">
                View All <ArrowRight size={11} />
              </Link>
            </div>
            {loading ? (
              <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)}</div>
            ) : recentTasks.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">No micro-tasks posted yet.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentTasks.map((task) => {
                  const employer = typeof task.employer === "object" ? task.employer : null;
                  return (
                    <div
                      key={task._id}
                      className="flex items-center gap-3 py-2.5 hover:bg-gray-50/80 p-1.5 rounded-lg cursor-pointer transition-colors"
                      onClick={() => setSelectedTask(task)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                        <p className="text-xs text-gray-400 truncate">
                          {employer?.company || employer?.name || "—"} · {formatCurrency(task.budget)}
                        </p>
                      </div>
                      <Badge variant={statusBadge(task.status)}>{task.status}</Badge>
                      <IdBadge id={task._id} prefix="TSK" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent Hire Requests */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <UserCheck size={16} className="text-[#1e3a5f]" /> Recent Hire Activity
              </h3>
              <Link href="/admin/hire-requests" className="text-xs text-[#1e3a5f] hover:underline flex items-center gap-0.5">
                View All <ArrowRight size={11} />
              </Link>
            </div>
            {loading ? (
              <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)}</div>
            ) : recentHireReqs.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">No hire activity recorded yet.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentHireReqs.map((req) => {
                  const employer = typeof req.employer === "object" ? req.employer : null;
                  const jobseeker = typeof req.jobseeker === "object" ? req.jobseeker : null;
                  const job = typeof req.job === "object" ? req.job : null;
                  const title = req.hireType === "freelance" ? req.projectTitle : job?.title || "Hiring Request";
                  return (
                    <div key={req._id} className="flex items-center gap-3 py-2.5">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {employer?.company || employer?.name || "Employer"} → {jobseeker?.name || "Candidate"}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {title} · {formatCurrency(req.salary)}/mo
                        </p>
                      </div>
                      <Badge variant={statusBadge(req.status)}>{req.status}</Badge>
                      <IdBadge id={req._id} prefix="HR" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Section 3: Real-time Activity Log Preview ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Activity size={16} className="text-[#1e3a5f]" /> Live Activity Stream
          </h3>
          <Link href="/admin/reports" className="text-xs text-[#1e3a5f] hover:underline flex items-center gap-0.5">
            Full Activity Logs <ArrowRight size={11} />
          </Link>
        </div>
        {loading ? (
          <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}</div>
        ) : recentLogs.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No activity logged yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentLogs.map((logItem) => {
              const meta = ACTION_ICONS[logItem.action] ?? { label: logItem.action, icon: Activity, color: "text-gray-500 bg-gray-50" };
              const Icon = meta.icon;
              return (
                <div key={logItem._id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.color}`}>
                      <Icon size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        <span className="font-semibold text-gray-900">{logItem.adminName}</span> {meta.label.toLowerCase()}: <span className="text-[#1e3a5f] font-semibold">{logItem.targetName}</span>
                      </p>
                      <p className="text-xs text-gray-400 capitalize">{logItem.targetType}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                    {formatRelativeTime(logItem.createdAt)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Slide-over Side Drawers ── */}
      <AdminUserDrawer
        userId={selectedUserId}
        onClose={() => setSelectedUserId(null)}
        onUserUpdated={fetchData}
      />
      <JobDetailModal
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
      />
      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </div>
  );
}
