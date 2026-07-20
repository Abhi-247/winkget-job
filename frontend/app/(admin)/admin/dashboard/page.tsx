"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { adminApi } from "@/lib/api";
import { AdminStats, User, Job } from "@/types";
import { AdminStatsCards } from "@/components/admin/AdminStatsCards";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { formatRelativeTime, formatCurrency, getGreeting } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

function getFormattedDate() {
  return new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0, activeJobs: 0, totalJobs: 0, totalTasks: 0,
    totalApplications: 0, totalHireRequests: 0, totalEmployers: 0, totalJobseekers: 0,
  });
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [recentJobs, setRecentJobs]   = useState<Job[]>([]);

  const fetchData = useCallback(async () => {
    if (!session?.user.accessToken) { setLoading(false); return; }
    setLoading(true);
    try {
      const [statsRes, signupsRes, jobsRes] = await Promise.all([
        adminApi.getStats(session.user.accessToken) as Promise<{ data: AdminStats }>,
        adminApi.getRecentSignups(session.user.accessToken) as Promise<{ data: User[] }>,
        adminApi.getAllJobs(session.user.accessToken, { page: "1", limit: "6" }) as Promise<{ data: Job[] }>,
      ]);
      setStats(statsRes.data);
      setRecentUsers(signupsRes.data || []);
      setRecentJobs(jobsRes.data || []);
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
      {/* Greeting */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{greeting}, {firstName}!</h2>
          <p className="text-sm text-gray-400 mt-0.5">{getFormattedDate()}</p>
        </div>
        <span className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-[#edf2f7] text-[#1e3a5f] border border-[#1e3a5f]/10">
          Admin Panel
        </span>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <AdminStatsCards stats={stats} />
      )}

      {/* Two-column panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Sign-ups */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Sign-ups</h3>
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
                <div key={user._id} className="flex items-center gap-3 py-3">
                  <Avatar name={user.name} src={user.avatar} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                  <Badge variant={user.role === "employer" ? "info" : user.role === "admin" ? "danger" : "success"}>
                    {user.role}
                  </Badge>
                  <span className="text-xs text-gray-400 hidden sm:block whitespace-nowrap">
                    {formatRelativeTime(user.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Jobs */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Jobs</h3>
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
                  <div key={job._id} className="flex items-center gap-3 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{job.title}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {employer?.company || employer?.name || "—"} · {formatCurrency(job.salary)}
                      </p>
                    </div>
                    <Badge variant={statusBadge(job.status)}>{job.status}</Badge>
                    <span className="text-xs text-gray-400 hidden sm:block whitespace-nowrap">
                      {formatRelativeTime(job.createdAt)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
