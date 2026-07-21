"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { adminApi } from "@/lib/api";
import { Pagination } from "@/components/ui/Pagination";
import { cn } from "@/lib/utils";
import {
  BarChart2, Users, Briefcase, ClipboardList, UserCheck,
  FileText, Activity, TrendingUp, Building2, RefreshCw,
  ShieldOff, ShieldCheck, Trash2, XCircle, CheckCircle2, Star,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GrowthPoint { label: string; users: number; jobs: number; }

interface AnalyticsData {
  growthData:    GrowthPoint[];
  appBreakdown:  Record<string, number>;
  jobBreakdown:  Record<string, number>;
  taskBreakdown: Record<string, number>;
  hireBreakdown: Record<string, number>;
  topEmployers:  { _id: string; name: string; company?: string; jobCount: number }[];
}

interface ActivityLogEntry {
  _id: string;
  action: string;
  adminName: string;
  targetName: string;
  targetType: string;
  createdAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ACTION_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  user_deleted:             { label: "User deleted",              icon: Trash2,        color: "text-red-500 bg-red-50"      },
  user_banned:              { label: "User banned",               icon: ShieldOff,     color: "text-orange-500 bg-orange-50"},
  user_activated:           { label: "User activated",            icon: ShieldCheck,   color: "text-green-600 bg-green-50"  },
  job_deleted:              { label: "Job deleted",               icon: Trash2,        color: "text-red-500 bg-red-50"      },
  job_closed:               { label: "Job closed",                icon: XCircle,       color: "text-orange-500 bg-orange-50"},
  job_reopened:             { label: "Job reopened",              icon: RefreshCw,     color: "text-blue-500 bg-blue-50"    },
  task_closed:              { label: "Task closed",               icon: XCircle,       color: "text-orange-500 bg-orange-50"},
  application_accepted:     { label: "Application accepted",      icon: CheckCircle2,  color: "text-green-600 bg-green-50"  },
  application_rejected:     { label: "Application rejected",      icon: XCircle,       color: "text-red-500 bg-red-50"      },
  application_shortlisted:  { label: "Application shortlisted",   icon: Star,          color: "text-purple-500 bg-purple-50"},
  hire_request_accepted:    { label: "Hire request accepted",     icon: CheckCircle2,  color: "text-green-600 bg-green-50"  },
  hire_request_rejected:    { label: "Hire request rejected",     icon: XCircle,       color: "text-red-500 bg-red-50"      },
};

function formatLogDate(dateStr: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  }).format(new Date(dateStr));
}

// ─── Bar chart component (pure CSS) ──────────────────────────────────────────

function BarChart({
  data,
  barKey,
  color,
  label,
}: {
  data: GrowthPoint[];
  barKey: "users" | "jobs";
  color: string;
  label: string;
}) {
  const max = Math.max(...data.map((d) => d[barKey]), 1);
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{label}</p>
      <div className="flex items-end gap-1 h-32">
        {data.map((d) => {
          const pct = Math.round((d[barKey] / max) * 100);
          return (
            <div key={d.label} className="flex-1 flex flex-col items-center gap-1 group relative">
              {/* Tooltip */}
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {d[barKey]}
              </div>
              <div
                className={cn("w-full rounded-t-sm transition-all", color)}
                style={{ height: `${Math.max(pct, 2)}%` }}
              />
            </div>
          );
        })}
      </div>
      {/* X labels — show every 3rd */}
      <div className="flex gap-1 mt-1">
        {data.map((d, i) => (
          <div key={d.label} className="flex-1 text-center">
            {i % 3 === 0 && (
              <span className="text-[9px] text-gray-400 leading-none">{d.label}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Donut-style breakdown bar ────────────────────────────────────────────────

function BreakdownBars({
  data,
  colorMap,
  title,
}: {
  data: Record<string, number>;
  colorMap: Record<string, string>;
  title: string;
}) {
  const total = Object.values(data).reduce((s, v) => s + v, 0) || 1;
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);

  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{title}</p>
      <div className="space-y-2">
        {entries.map(([key, val]) => {
          const pct = Math.round((val / total) * 100);
          const color = colorMap[key] ?? "bg-gray-300";
          return (
            <div key={key}>
              <div className="flex items-center justify-between text-xs mb-0.5">
                <span className="capitalize text-gray-700 font-medium">{key}</span>
                <span className="text-gray-400">{val} ({pct}%)</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className={cn("h-2 rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
        {entries.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-2">No data yet.</p>
        )}
      </div>
    </div>
  );
}

// ─── Stat tile ────────────────────────────────────────────────────────────────

function StatTile({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", color)}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-bold text-gray-900 leading-none">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
        {sub && <p className="text-[10px] text-gray-400">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const LOG_LIMIT = 20;

const LOG_TYPE_FILTERS = [
  { key: "",             label: "All"          },
  { key: "user",         label: "Users"        },
  { key: "job",          label: "Jobs"         },
  { key: "task",         label: "Tasks"        },
  { key: "application",  label: "Applications" },
  { key: "hireRequest",  label: "Hire Requests"},
];

export default function AdminReportsPage() {
  const { data: session, status } = useSession();

  // Analytics state
  const [analytics, setAnalytics]   = useState<AnalyticsData | null>(null);
  const [aLoading, setALoading]     = useState(true);

  // Activity log state
  const [logs, setLogs]             = useState<ActivityLogEntry[]>([]);
  const [lLoading, setLLoading]     = useState(true);
  const [logPage, setLogPage]       = useState(1);
  const [logTotal, setLogTotal]     = useState(0);
  const [logPages, setLogPages]     = useState(1);
  const [typeFilter, setTypeFilter] = useState("");

  // ── Fetch analytics ──
  const fetchAnalytics = useCallback(async () => {
    if (!session?.user.accessToken) return;
    setALoading(true);
    try {
      const res = (await adminApi.getAnalytics(session.user.accessToken)) as { data: AnalyticsData };
      setAnalytics(res.data);
    } catch {
      // keep null
    } finally {
      setALoading(false);
    }
  }, [session]);

  // ── Fetch activity logs ──
  const fetchLogs = useCallback(async () => {
    if (!session?.user.accessToken) return;
    setLLoading(true);
    try {
      const params: Record<string, string> = {
        page:  String(logPage),
        limit: String(LOG_LIMIT),
      };
      if (typeFilter) params.targetType = typeFilter;
      const res = (await adminApi.getActivityLogs(session.user.accessToken, params)) as {
        data: ActivityLogEntry[];
        pagination: { total: number; pages: number };
      };
      setLogs(res.data || []);
      setLogTotal(res.pagination?.total ?? 0);
      setLogPages(res.pagination?.pages ?? 1);
    } catch {
      setLogs([]);
    } finally {
      setLLoading(false);
    }
  }, [session, logPage, typeFilter]);

  useEffect(() => {
    if (status === "loading") return;
    fetchAnalytics();
  }, [fetchAnalytics, status]);

  useEffect(() => {
    if (status === "loading") return;
    fetchLogs();
  }, [fetchLogs, status]);

  useEffect(() => { setLogPage(1); }, [typeFilter]);

  // ── Derived totals from analytics ──
  const totalApps    = analytics ? Object.values(analytics.appBreakdown).reduce((s, v) => s + v, 0) : 0;
  const totalJobs    = analytics ? Object.values(analytics.jobBreakdown).reduce((s, v) => s + v, 0) : 0;
  const totalTasks   = analytics ? Object.values(analytics.taskBreakdown).reduce((s, v) => s + v, 0) : 0;
  const totalHire    = analytics ? Object.values(analytics.hireBreakdown).reduce((s, v) => s + v, 0) : 0;
  const totalSignups = analytics ? analytics.growthData.reduce((s, d) => s + d.users, 0) : 0;
  const totalJobsPosted = analytics ? analytics.growthData.reduce((s, d) => s + d.jobs, 0) : 0;

  return (
    <div className="space-y-8">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Reports & Analytics</h2>
          <p className="text-sm text-gray-500 mt-0.5">Platform metrics and admin activity overview</p>
        </div>
        <button
          onClick={() => { fetchAnalytics(); fetchLogs(); }}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* ── Summary stat tiles ── */}
      {aLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse h-20" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatTile icon={Users}     label="New Signups (12m)"  value={totalSignups}    color="bg-blue-50 text-blue-600"   />
          <StatTile icon={Briefcase} label="Jobs Posted (12m)"  value={totalJobsPosted} color="bg-indigo-50 text-indigo-600"/>
          <StatTile icon={FileText}  label="Applications"       value={totalApps}       color="bg-purple-50 text-purple-600"/>
          <StatTile icon={ClipboardList} label="Tasks"          value={totalTasks}      color="bg-orange-50 text-orange-600"/>
          <StatTile icon={UserCheck} label="Hire Requests"      value={totalHire}       color="bg-green-50 text-green-600"  />
          <StatTile icon={Activity}  label="Activity Logs"      value={logTotal}        color="bg-rose-50 text-rose-600"    />
        </div>
      )}

      {/* ── Growth charts ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp size={16} className="text-[#1e3a5f]" />
          <h3 className="font-semibold text-gray-900">Growth — Last 12 Months</h3>
        </div>
        {aLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-40 bg-gray-100 rounded-lg animate-pulse" />
            <div className="h-40 bg-gray-100 rounded-lg animate-pulse" />
          </div>
        ) : analytics ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <BarChart data={analytics.growthData} barKey="users" color="bg-blue-400"   label="New User Signups" />
            <BarChart data={analytics.growthData} barKey="jobs"  color="bg-indigo-400" label="New Job Postings" />
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-8">Failed to load analytics.</p>
        )}
      </div>

      {/* ── Breakdown section ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          {aLoading ? <div className="h-32 bg-gray-100 rounded animate-pulse" /> : (
            <BreakdownBars
              title="Application Status"
              data={analytics?.appBreakdown ?? {}}
              colorMap={{ pending: "bg-amber-400", shortlisted: "bg-purple-400", accepted: "bg-green-500", rejected: "bg-red-400" }}
            />
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          {aLoading ? <div className="h-32 bg-gray-100 rounded animate-pulse" /> : (
            <BreakdownBars
              title="Job Status"
              data={analytics?.jobBreakdown ?? {}}
              colorMap={{ open: "bg-green-500", closed: "bg-red-400", draft: "bg-gray-400" }}
            />
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          {aLoading ? <div className="h-32 bg-gray-100 rounded animate-pulse" /> : (
            <BreakdownBars
              title="Task Status"
              data={analytics?.taskBreakdown ?? {}}
              colorMap={{ open: "bg-green-500", assigned: "bg-blue-400", completed: "bg-indigo-500", closed: "bg-red-400" }}
            />
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          {aLoading ? <div className="h-32 bg-gray-100 rounded animate-pulse" /> : (
            <BreakdownBars
              title="Hire Request Status"
              data={analytics?.hireBreakdown ?? {}}
              colorMap={{ pending: "bg-amber-400", accepted: "bg-green-500", rejected: "bg-red-400" }}
            />
          )}
        </div>
      </div>

      {/* ── Top employers ── */}
      {!aLoading && analytics && analytics.topEmployers.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 size={16} className="text-[#1e3a5f]" />
            <h3 className="font-semibold text-gray-900">Top Employers by Job Posts</h3>
          </div>
          <div className="space-y-3">
            {analytics.topEmployers.map((emp, i) => {
              const maxJobs = analytics.topEmployers[0].jobCount || 1;
              const pct = Math.round((emp.jobCount / maxJobs) * 100);
              return (
                <div key={emp._id} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 w-4 text-center">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-xs mb-0.5">
                      <span className="font-medium text-gray-800 truncate">
                        {emp.company || emp.name}
                      </span>
                      <span className="text-gray-400 ml-2 flex-shrink-0">{emp.jobCount} jobs</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-[#1e3a5f] transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Activity Log ── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-[#1e3a5f]" />
            <h3 className="font-semibold text-gray-900">Activity Log</h3>
            <span className="text-xs text-gray-400">({logTotal} total)</span>
          </div>
          {/* Filter tabs */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-lg overflow-x-auto">
            {LOG_TYPE_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setTypeFilter(f.key)}
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors",
                  typeFilter === f.key
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {lLoading ? (
          <div className="divide-y divide-gray-50">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-6 py-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-2.5 bg-gray-100 rounded w-1/3" />
                </div>
                <div className="h-2.5 bg-gray-100 rounded w-20" />
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-14">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Activity size={20} className="text-gray-300" />
            </div>
            <p className="text-sm text-gray-500">No activity logged yet.</p>
            <p className="text-xs text-gray-400 mt-1">Actions like banning users or closing jobs will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {logs.map((log) => {
              const meta = ACTION_META[log.action] ?? {
                label: log.action.replace(/_/g, " "),
                icon: Activity,
                color: "text-gray-500 bg-gray-100",
              };
              const Icon = meta.icon;
              return (
                <div key={log._id} className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors">
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm", meta.color)}>
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800">
                      <span className="font-semibold">{log.adminName}</span>
                      {" · "}
                      <span className="text-gray-600">{meta.label}</span>
                      {" — "}
                      <span className="font-medium text-gray-900 truncate">{log.targetName}</span>
                    </p>
                    <p className="text-xs text-gray-400 capitalize">{log.targetType}</p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                    {formatLogDate(log.createdAt)}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <div className="px-6 py-4 border-t border-gray-100">
          <Pagination
            page={logPage}
            pages={logPages}
            total={logTotal}
            limit={LOG_LIMIT}
            onPageChange={setLogPage}
          />
        </div>
      </div>
    </div>
  );
}
