"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { applicationsApi, jobsApi } from "@/lib/api";
import { Application, JobSeekerStats } from "@/types";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import {
  Briefcase,
  DollarSign,
  Clock,
  UserCheck,
  ArrowRight,
} from "lucide-react";
import { formatCurrency, formatRelativeTime, getGreeting, getFormattedDate } from "@/lib/utils";
import Link from "next/link";
import { ActiveProgressWidget } from "@/components/work/ActiveProgressWidget";

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
    label: "Proposals",
    icon: UserCheck,
    bg: "bg-orange-50",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    valueColor: "text-orange-700",
  },
] as const;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function JobSeekerDashboard() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const { error: toastError } = useToast();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);

  const [stats, setStats] = useState<JobSeekerStats>({
    activeJobs: 0,
    earnings: 0,
    pendingApplications: 0,
    hireRequests: 0,
    completedJobs: 0,
  });

  useEffect(() => {
    if (searchParams?.get("error") === "employer_only") {
      toastError("Please login as an employer first");
      const url = new URL(window.location.href);
      url.searchParams.delete("error");
      window.history.replaceState({}, "", url.toString());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const fetchData = useCallback(async () => {
    if (!session?.user.accessToken) {
      // Token is missing — stop loading so we don't show skeleton forever
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [appsRes, statsRes] = await Promise.all([
        applicationsApi.getMyApplications(session.user.accessToken) as Promise<{ data: Application[] }>,
        jobsApi.getJobseekerStats(session.user.accessToken) as Promise<{ data: JobSeekerStats }>,
      ]);
      setApplications(appsRes.data || []);
      setStats(statsRes.data || {
        activeJobs: 0,
        earnings: 0,
        pendingApplications: 0,
        hireRequests: 0,
        completedJobs: 0,
      });
    } catch {
      // keep empty on error
      setStats({
        activeJobs: 0,
        earnings: 0,
        pendingApplications: 0,
        hireRequests: 0,
        completedJobs: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    setMounted(true);
    // Only attempt fetch once the session is resolved (not still loading)
    if (status === "loading") return;
    fetchData();
  }, [fetchData, status]);

  const greeting = getGreeting();
  const firstName = session?.user.name?.split(" ")[0] || "there";
  const formattedDate = mounted ? getFormattedDate() : "";

  const activeJobs = applications.filter((a) => a.status === "accepted");

  const recentApplications = applications.slice(0, 5);


  return (
    <div className="space-y-6">

      {/* ── Greeting ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {greeting}, {firstName}! 👋
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">{formattedDate} · Candidate Workspace</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/jobs">
            <Button size="sm" className="gap-1.5 whitespace-nowrap">
              <Briefcase size={14} />
              Browse Jobs
            </Button>
          </Link>
          <Link href="/tasks">
            <Button size="sm" variant="secondary" className="gap-1.5 whitespace-nowrap bg-[#edf2f7] text-[#1e3a5f]">
              <Clock size={14} />
              Tasks
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Quick Action Toolbar ── */}
      <div className="bg-gradient-to-r from-[#1e3a5f] to-[#0f172a] rounded-xl p-5 text-white shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <Briefcase size={18} className="text-blue-300" />
            </div>
            <div>
              <p className="text-xs text-white/70 uppercase tracking-wide font-semibold">Job Seeker Hub</p>
              <p className="text-sm font-semibold text-white">Navigation Shortcuts</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
            <Link
              href="/jobs"
              className="inline-flex items-center justify-center gap-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 transition-colors px-3 py-2 sm:py-1.5 rounded-lg text-white text-center"
            >
              <Briefcase size={13} className="flex-shrink-0" /> Jobs
            </Link>
            <Link
              href="/tasks"
              className="inline-flex items-center justify-center gap-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 transition-colors px-3 py-2 sm:py-1.5 rounded-lg text-white text-center"
            >
              <Clock size={13} className="flex-shrink-0" /> Tasks
            </Link>
            <Link
              href="/jobseeker/applications"
              className="inline-flex items-center justify-center gap-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 transition-colors px-3 py-2 sm:py-1.5 rounded-lg text-white text-center"
            >
              <Clock size={13} className="flex-shrink-0" /> Applications ({stats.pendingApplications})
            </Link>
            <Link
              href="/jobseeker/hire-requests"
              className="inline-flex items-center justify-center gap-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 transition-colors px-3 py-2 sm:py-1.5 rounded-lg text-white text-center"
            >
              <UserCheck size={13} className="flex-shrink-0" /> Direct Offers ({stats.hireRequests})
            </Link>
          </div>
          <Link
            href="/jobseeker/earnings"
            className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-600 transition-colors text-white px-3 py-2 sm:py-1.5 rounded-lg w-full sm:w-auto sm:ml-auto"
          >
            <DollarSign size={13} className="flex-shrink-0" /> My Earnings ({formatCurrency(stats.earnings)})
          </Link>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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

      {/* ── Active Progress Widget ── */}
      <ActiveProgressWidget role="jobseeker" />

      {/* ── Recent Applications ── */}
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
