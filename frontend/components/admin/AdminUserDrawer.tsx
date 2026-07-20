"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { adminApi } from "@/lib/api";
import { User, Job, Application, HireRequest, TaskClaim } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate, formatCurrency, cn } from "@/lib/utils";
import {
  X, MapPin, Calendar, Briefcase, ClipboardList,
  UserCheck, FileText, ShieldOff, ShieldCheck, Trash2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserDetail {
  user: User;
  jobs: Job[];
  applications: Application[];
  hireRequests: HireRequest[];
  taskClaims: TaskClaim[];
}

type ActivityTab = "jobs" | "applications" | "hireRequests" | "taskClaims";

interface AdminUserDrawerProps {
  userId: string | null;
  onClose: () => void;
  onUserUpdated: () => void;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DrawerSkeleton() {
  return (
    <div className="animate-pulse p-6 space-y-5">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gray-200 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gray-200 rounded w-2/3" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
      {[80, 100, 70, 90, 60].map((w) => (
        <div key={w} className="h-4 bg-gray-200 rounded" style={{ width: `${w}%` }} />
      ))}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AdminUserDrawer({ userId, onClose, onUserUpdated }: AdminUserDrawerProps) {
  const { data: session } = useSession();
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<ActivityTab>("jobs");
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOpen = !!userId;

  useEffect(() => {
    if (!userId || !session?.user.accessToken) return;
    setDetail(null);
    setActiveTab("jobs");
    setLoading(true);
    (adminApi.getUserDetail(session.user.accessToken, userId) as Promise<{ data: UserDetail }>)
      .then((res) => setDetail(res.data))
      .catch(() => setDetail(null))
      .finally(() => setLoading(false));
  }, [userId, session]);

  const handleToggle = async () => {
    if (!session?.user.accessToken || !userId || !detail) return;
    setToggling(true);
    try {
      await adminApi.toggleUserStatus(session.user.accessToken, userId);
      setDetail((prev) =>
        prev ? { ...prev, user: { ...prev.user, isActive: !prev.user.isActive } } : prev
      );
      onUserUpdated();
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async () => {
    if (!session?.user.accessToken || !userId) return;
    if (!confirm("Delete this user and all their data? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await adminApi.deleteUser(session.user.accessToken, userId);
      onUserUpdated();
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  const user = detail?.user;

  const tabs: { key: ActivityTab; label: string; count: number; icon: React.ElementType }[] = [
    { key: "jobs",         label: "Jobs",         count: detail?.jobs.length ?? 0,         icon: Briefcase    },
    { key: "applications", label: "Applications", count: detail?.applications.length ?? 0, icon: FileText     },
    { key: "hireRequests", label: "Hire Requests",count: detail?.hireRequests.length ?? 0, icon: UserCheck    },
    { key: "taskClaims",   label: "Task Claims",  count: detail?.taskClaims.length ?? 0,   icon: ClipboardList},
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-opacity duration-200",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-full sm:w-[500px] bg-white shadow-2xl flex flex-col",
          "transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <span className="text-sm font-semibold text-gray-700">User Profile</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto pb-32">
          {loading ? (
            <DrawerSkeleton />
          ) : !user ? (
            <div className="p-6 text-center text-gray-400 text-sm">Failed to load profile.</div>
          ) : (
            <>
              {/* Hero */}
              <div className="bg-gradient-to-br from-gray-50 to-white px-6 py-6 border-b border-gray-100">
                <div className="flex items-start gap-4">
                  <Avatar name={user.name} src={user.avatar} size="xl" className="flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h2 className="text-lg font-bold text-gray-900 truncate">{user.name}</h2>
                      <Badge variant={user.role === "employer" ? "info" : user.role === "admin" ? "danger" : "success"}>
                        {user.role}
                      </Badge>
                      <Badge variant={user.isActive ? "success" : "danger"}>
                        {user.isActive ? "Active" : "Banned"}
                      </Badge>
                    </div>
                    {user.title && <p className="text-sm text-gray-500 mb-1">{user.title}</p>}
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
                      {user.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={11} /> {user.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar size={11} /> Joined {formatDate(user.createdAt)}
                      </span>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium",
                        user.plan === "pro" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"
                      )}>
                        {user.plan === "pro" ? "⭐ Pro" : "Free Plan"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-5 space-y-5">
                {/* Bio */}
                {user.bio && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">About</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">{user.bio}</p>
                  </div>
                )}

                {/* Skills */}
                {user.skills && user.skills.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {user.skills.map((s) => (
                        <span key={s} className="px-2.5 py-0.5 rounded-full bg-[#edf2f7] text-[#1e3a5f] text-xs border border-[#1e3a5f]/20">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Activity tabs */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Activity</h3>
                  <div className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-4 overflow-x-auto">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.key}
                          onClick={() => setActiveTab(tab.key)}
                          className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0",
                            activeTab === tab.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                          )}
                        >
                          <Icon size={12} />
                          {tab.label}
                          <span className={cn("text-xs", activeTab === tab.key ? "text-gray-400" : "text-gray-400")}>
                            ({tab.count})
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Jobs */}
                  {activeTab === "jobs" && (
                    <div className="space-y-2">
                      {detail?.jobs.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-4">No jobs posted.</p>
                      ) : (
                        detail?.jobs.map((job) => (
                          <div key={job._id} className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{job.title}</p>
                              <p className="text-xs text-gray-400">{formatCurrency(job.salary)} · {formatDate(job.createdAt)}</p>
                            </div>
                            <Badge variant={statusBadge(job.status)}>{job.status}</Badge>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Applications */}
                  {activeTab === "applications" && (
                    <div className="space-y-2">
                      {detail?.applications.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-4">No applications.</p>
                      ) : (
                        detail?.applications.map((app) => {
                          const job = typeof app.job === "object" ? app.job : null;
                          return (
                            <div key={app._id} className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{job?.title ?? "—"}</p>
                                <p className="text-xs text-gray-400">{formatDate(app.createdAt)}</p>
                              </div>
                              <Badge variant={statusBadge(app.status)}>{app.status}</Badge>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                  {/* Hire Requests */}
                  {activeTab === "hireRequests" && (
                    <div className="space-y-2">
                      {detail?.hireRequests.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-4">No hire requests.</p>
                      ) : (
                        detail?.hireRequests.map((hr) => {
                          const job = typeof hr.job === "object" ? hr.job : null;
                          const isFreelance = hr.hireType === "freelance";
                          return (
                            <div key={hr._id} className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {isFreelance ? (hr.projectTitle ?? "Freelance") : (job?.title ?? "—")}
                                </p>
                                <p className="text-xs text-gray-400">{formatCurrency(hr.salary)}/mo · {formatDate(hr.createdAt)}</p>
                              </div>
                              <Badge variant={statusBadge(hr.status)}>{hr.status}</Badge>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                  {/* Task Claims */}
                  {activeTab === "taskClaims" && (
                    <div className="space-y-2">
                      {detail?.taskClaims.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-4">No task claims.</p>
                      ) : (
                        detail?.taskClaims.map((claim) => {
                          const task = typeof claim.task === "object" ? claim.task : null;
                          return (
                            <div key={claim._id} className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{task?.title ?? "—"}</p>
                                <p className="text-xs text-gray-400">{formatDate(claim.createdAt)}</p>
                              </div>
                              <Badge variant={statusBadge(claim.status)}>{claim.status}</Badge>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Sticky action bar */}
        {user && !loading && (
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={user.isActive ? "danger" : "secondary"}
              onClick={handleToggle}
              loading={toggling}
              className="gap-1.5 flex-1 sm:flex-none"
            >
              {user.isActive ? <ShieldOff size={13} /> : <ShieldCheck size={13} />}
              {user.isActive ? "Ban User" : "Activate User"}
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={handleDelete}
              loading={deleting}
              className="gap-1.5 flex-1 sm:flex-none"
            >
              <Trash2 size={13} />
              Delete Account
            </Button>
          </div>
        )}
      </aside>
    </>
  );
}
