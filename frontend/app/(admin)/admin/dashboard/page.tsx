"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { adminApi } from "@/lib/api";
import { AdminStats, User } from "@/types";
import { AdminStatsCards } from "@/components/admin/AdminStatsCards";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { formatRelativeTime } from "@/lib/utils";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({ totalUsers: 0, activeJobs: 0, totalEmployers: 0, totalJobseekers: 0 });
  const [recentUsers, setRecentUsers] = useState<User[]>([]);

  const fetchData = useCallback(async () => {
    if (!session?.user.accessToken) return;
    setLoading(true);
    try {
      const [statsRes, signupsRes] = await Promise.all([
        adminApi.getStats(session.user.accessToken) as Promise<{ data: AdminStats }>,
        adminApi.getRecentSignups(session.user.accessToken) as Promise<{ data: User[] }>,
      ]);
      setStats(statsRes.data);
      setRecentUsers(signupsRes.data || []);
    } catch {
      // keep defaults
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Admin Dashboard</h2>
        <p className="text-sm text-gray-500 mt-0.5">Platform overview and management</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <AdminStatsCards stats={stats} />
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Recent Sign-ups</h3>
        {loading ? (
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)}</div>
        ) : recentUsers.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No users yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentUsers.map((user) => (
              <div key={user._id} className="flex items-center gap-3 py-3">
                <Avatar name={user.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
                <Badge variant={user.role === "employer" ? "info" : "success"}>{user.role}</Badge>
                <span className="text-xs text-gray-400 hidden sm:block">{formatRelativeTime(user.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
