"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { applicationsApi, hireRequestsApi } from "@/lib/api";
import { Application, HireRequest } from "@/types";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import {
  Briefcase,
  DollarSign,
  Clock,
  UserCheck,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { formatCurrency, formatRelativeTime, getGreeting } from "@/lib/utils";
import Link from "next/link";

// ─── Stat card config ─────────────────────────────────────────────────────────

const statConfig = [
  {
    key: "activeJobs",
    label: "Active Jobs",
    icon: Briefcase,
    bg: "bg-[#edf2f7]",
    iconBg: "bg-blue-100",
    iconColor: "text-[#1e3a5f]",
    valueColor: "text-[#1e3a5f]",
  },
  {
    key: "earnings",
    label: "Total Earnings",
    icon: DollarSign,
    bg: "bg-[#edf2f7]",
    iconBg: "bg-blue-100",
    iconColor: "text-[#1e3a5f]",
    valueColor: "text-[#1e3a5f]",
    format: (v: number) => formatCurrency(v),
  },
  {
    key: "pendingApplications",
    label: "Pending Applications",
    icon: Clock,
    bg: "bg-amber-50",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    valueColor: "text-amber-700",
  },
  {
    key: "hireRequests",
    label: "Hire Requests",
    icon: UserCheck,
    bg: "bg-orange-50",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    valueColor: "text-orange-700",
  },
  {
    key: "completedJobs",
    label: "Completed Jobs",
    icon: CheckCircle,
    bg: "bg-purple-50",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    valueColor: "text-purple-700",
  },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getFormattedDate() {
  return new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function JobSeekerDashboard() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [hireRequests, setHireRequests] = useState<HireRequest[]>([]);

  const fetchData = useCallback(async () => {
    if (!session?.user.accessToken) {
      // Token is missing — stop loading so we don't show skeleton forever
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [appsRes, hireRes] = await Promise.all([
        applicationsApi.getMyApplications(session.user.accessToken) as Promise<{ data: Application[] }>,
        hireRequestsApi.getMy(session.user.accessToken) as Promise<{ data: HireRequest[] }>,
      ]);
      setApplications(appsRes.data || []);
      setHireRequests(hireRes.data || []);
    } catch {
      // keep empty on error
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    // Only attempt fetch once the session is resolved (not still loading)
    if (status === "loading") return;
    fetchData();
  }, [fetchData, status]);

  const greeting = getGreeting();
  const firstName = session?.user.name?.split(" ")[0] || "there";
  const formattedDate = getFormattedDate();

  const activeJobs = applications.filter((a) => a.status === "accepted");
  const stats = {
    activeJobs: activeJobs.length,
    earnings: 0,
    pendingApplications: applications.filter((a) => a.status === "pending").length,
    hireRequests: hireRequests.filter((h) => h.status === "pending").length,
    completedJobs: applications.filter((a) => a.status === "accepted").length,
  };

  const recentApplications = applications.slice(0, 5);
  const recentHireRequests = hireRequests.slice(0, 4);

  return (
    <div className="space-y-6">

      {/* ── Greeting ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {greeting}, {firstName}! 👋
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">{formattedDate}</p>
        </div>
        <Link href="/jobs">
          <Button size="sm" className="gap-1.5 self-start sm:self-auto">
            + Browse New Jobs
          </Button>
        </Link>
      </div>

      {/* ── Stat Cards ── */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {statConfig.map((card) => {
            const Icon = card.icon;
            const value = stats[card.key as keyof typeof stats];
            const display =
              "format" in card
                ? card.format(value)
                : value.toString();
            return (
              <div key={card.key} className={`${card.bg} rounded-xl p-5 border border-white`}>
                <div className={`${card.iconBg} w-9 h-9 rounded-lg flex items-center justify-center mb-3`}>
                  <Icon size={18} className={card.iconColor} />
                </div>
                <div className={`text-2xl font-bold ${card.valueColor} mb-1`}>
                  {display}
                </div>
                <div className="text-xs text-gray-500 font-medium">{card.label}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Two-col grid: Recent Applications + Hire Requests ── */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Recent Applications */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-gray-900">Recent Applications</h3>
            <Link href="/jobseeker/applications" className="text-xs text-[#1e3a5f] hover:underline flex items-center gap-0.5">
              View All <ArrowRight size={11} />
            </Link>
          </div>
          <p className="text-xs text-gray-400 mb-4">Jobs you applied to</p>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : recentApplications.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              No applications yet.{" "}
              <Link href="/jobs" className="text-[#1e3a5f] hover:underline">Browse jobs</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentApplications.map((app) => {
                const job = typeof app.job === "object" ? app.job : null;
                const employer = job && typeof job.employer === "object" ? job.employer : null;
                return (
                  <div key={app._id} className="flex items-center justify-between py-3 gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Avatar
                        name={employer?.company || employer?.name || "Co"}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {job?.title || "—"}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {employer?.company || employer?.name || "—"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {job && (
                        <span className="text-sm font-semibold text-gray-700 hidden sm:block">
                          {formatCurrency(job.salary)}
                        </span>
                      )}
                      <Badge variant={statusBadge(app.status)}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Hire Requests */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-gray-900">Hire Requests</h3>
            <Link href="/jobseeker/hire-requests" className="text-xs text-[#1e3a5f] hover:underline flex items-center gap-0.5">
              View All <ArrowRight size={11} />
            </Link>
          </div>
          <p className="text-xs text-gray-400 mb-4">Invitations from employers</p>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : recentHireRequests.length === 0 ? (
            <p className="text-center py-8 text-sm text-gray-400">No hire requests yet.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentHireRequests.map((req) => {
                const employer = typeof req.employer === "object" ? req.employer : null;
                const job = typeof req.job === "object" ? req.job : null;
                return (
                  <div key={req._id} className="flex items-center justify-between py-3 gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Avatar
                        name={employer?.company || employer?.name || "Co"}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {job?.title || "—"}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {employer?.company || employer?.name || "—"} · {formatCurrency(req.salary)}/mo
                        </p>
                      </div>
                    </div>
                    <Badge variant={statusBadge(req.status)}>
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Active Jobs ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Active Jobs</h3>
          <Link href="/jobseeker/my-jobs" className="text-xs text-[#1e3a5f] hover:underline flex items-center gap-0.5">
            View All <ArrowRight size={11} />
          </Link>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : activeJobs.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">
            No active jobs yet.{" "}
            <Link href="/jobs" className="text-[#1e3a5f] hover:underline">Browse open positions</Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {activeJobs.slice(0, 4).map((app) => {
              const job = typeof app.job === "object" ? app.job : null;
              const employer = job && typeof job.employer === "object" ? job.employer : null;
              return (
                <div key={app._id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <Avatar name={employer?.company || employer?.name || "Co"} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {job?.title || "—"}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {employer?.company || employer?.name || "—"}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    {job && (
                      <p className="text-sm font-semibold text-gray-800">
                        {formatCurrency(job.salary)}
                      </p>
                    )}
                    <Badge variant="success" className="mt-0.5">Active</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
