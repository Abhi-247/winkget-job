"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { adminApi } from "@/lib/api";
import { User, Job, Task, Application, HireRequest, TaskClaim, WorkRefType } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate, formatCurrency, cn } from "@/lib/utils";
import {
  X, MapPin, Calendar, Briefcase, ClipboardList, Building2,
  UserCheck, FileText, ShieldOff, ShieldCheck, Trash2,
  Globe, ListTodo, Activity,
} from "lucide-react";
import { Github, Linkedin, Twitter } from "@/components/ui/BrandIcons";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { IdBadge } from "@/components/ui/IdBadge";
import { WorkUpdatesDrawer } from "@/components/work/WorkUpdatesDrawer";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserDetail {
  user: User;
  jobs: Job[];
  tasks: Task[];
  applications: Application[];
  hireRequests: HireRequest[];
  taskClaims: TaskClaim[];
}

type EmployerTab = "jobs" | "tasks" | "hireRequests";
type JobseekerTab = "applications" | "hireRequests" | "taskClaims";
type ActivityTab = EmployerTab | JobseekerTab;

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

// ─── Employer profile body ────────────────────────────────────────────────────

function EmployerProfile({
  user,
  detail,
  activeTab,
  setActiveTab,
  onViewUpdates,
}: {
  user: User;
  detail: UserDetail;
  activeTab: ActivityTab;
  setActiveTab: (t: ActivityTab) => void;
  onViewUpdates: (refType: WorkRefType, refId: string, title: string) => void;
}) {
  const tabs: { key: EmployerTab; label: string; count: number; icon: React.ElementType }[] = [
    { key: "jobs",         label: "Jobs",         count: detail.jobs.length,         icon: Briefcase   },
    { key: "tasks",        label: "Tasks",        count: detail.tasks.length,        icon: ListTodo    },
    { key: "hireRequests", label: "Hire Requests",count: detail.hireRequests.length, icon: UserCheck   },
  ];

  const socialLinks = user.socialLinks ?? {};

  return (
    <div className="px-6 py-5 space-y-5">
      {/* Company info */}
      <div className="grid grid-cols-2 gap-3">
        {user.company && (
          <div className="col-span-2 flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <Building2 size={14} className="text-blue-500 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-blue-400 font-medium">Company</p>
              <p className="text-sm font-semibold text-blue-800 truncate">{user.company}</p>
            </div>
          </div>
        )}
        {user.title && (
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <Briefcase size={13} className="text-gray-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-gray-400">Role</p>
              <p className="text-sm font-medium text-gray-700 truncate">{user.title}</p>
            </div>
          </div>
        )}
        {user.location && (
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <MapPin size={13} className="text-gray-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-gray-400">Location</p>
              <p className="text-sm font-medium text-gray-700 truncate">{user.location}</p>
            </div>
          </div>
        )}
      </div>

      {/* About / Bio */}
      {user.bio && (
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">About</h3>
          <p className="text-sm text-gray-700 leading-relaxed">{user.bio}</p>
        </div>
      )}

      {/* Social links */}
      {(socialLinks.website || socialLinks.linkedin || socialLinks.github || socialLinks.twitter) && (
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Links</h3>
          <div className="flex flex-wrap gap-2">
            {socialLinks.website && (
              <a href={socialLinks.website} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-600 hover:bg-gray-100 transition-colors">
                <Globe size={12} /> Website
              </a>
            )}
            {socialLinks.linkedin && (
              <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100 text-xs text-blue-600 hover:bg-blue-100 transition-colors">
                <Linkedin size={12} /> LinkedIn
              </a>
            )}
            {socialLinks.github && (
              <a href={socialLinks.github} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-700 hover:bg-gray-100 transition-colors">
                <Github size={12} /> GitHub
              </a>
            )}
            {socialLinks.twitter && (
              <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 border border-sky-100 text-xs text-sky-600 hover:bg-sky-100 transition-colors">
                <Twitter size={12} /> Twitter
              </a>
            )}
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
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0",
                  activeTab === tab.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}>
                <Icon size={12} />
                {tab.label}
                <span className="text-xs text-gray-400">({tab.count})</span>
              </button>
            );
          })}
        </div>

        {/* Jobs tab */}
        {activeTab === "jobs" && (
          <div className="space-y-2">
            {detail.jobs.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No jobs posted.</p>
            ) : (
              detail.jobs.map((job) => (
                <div key={job._id} className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{job.title}</p>
                    <p className="text-xs text-gray-400">
                      {job.location} · {formatDate(job.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant={statusBadge(job.status)}>{job.status}</Badge>
                    <button
                      onClick={() => onViewUpdates("application", job._id, job.title)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#1e3a5f]/10 text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white text-xs font-bold transition-all cursor-pointer"
                      title="View execution status"
                    >
                      <Activity size={12} /> Status
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tasks tab */}
        {activeTab === "tasks" && (
          <div className="space-y-2">
            {detail.tasks.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No tasks posted.</p>
            ) : (
              detail.tasks.map((task) => {
                const acceptedId = task.acceptedClaim ? (typeof task.acceptedClaim === "object" ? (task.acceptedClaim as any)._id : task.acceptedClaim) : task._id;
                return (
                  <div key={task._id} className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                      <p className="text-xs text-gray-400">
                        {formatCurrency(task.budget)} · {formatDate(task.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant={statusBadge(task.status)}>{task.status}</Badge>
                      <button
                        onClick={() => onViewUpdates("taskClaim", acceptedId, task.title)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#1e3a5f]/10 text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white text-xs font-bold transition-all cursor-pointer"
                        title="View execution status"
                      >
                        <Activity size={12} /> Status
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Hire Requests tab */}
        {activeTab === "hireRequests" && (
          <div className="space-y-2">
            {detail.hireRequests.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No hire requests sent.</p>
            ) : (
              detail.hireRequests.map((hr) => {
                const job = typeof hr.job === "object" ? hr.job : null;
                const isFreelance = hr.hireType === "freelance";
                const title = isFreelance ? (hr.projectTitle ?? "Freelance Project") : (job?.title ?? "Hire Request");
                return (
                  <div key={hr._id} className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
                      <p className="text-xs text-gray-400">{formatCurrency(hr.salary)}/mo · {formatDate(hr.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant={statusBadge(hr.status)}>{hr.status}</Badge>
                      <button
                        onClick={() => onViewUpdates("hireRequest", hr._id, title)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#1e3a5f]/10 text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white text-xs font-bold transition-all cursor-pointer"
                        title="View execution status"
                      >
                        <Activity size={12} /> Status
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Jobseeker profile body ───────────────────────────────────────────────────

function JobseekerProfile({
  user,
  detail,
  activeTab,
  setActiveTab,
  onViewUpdates,
}: {
  user: User;
  detail: UserDetail;
  activeTab: ActivityTab;
  setActiveTab: (t: ActivityTab) => void;
  onViewUpdates: (refType: WorkRefType, refId: string, title: string) => void;
}) {
  const tabs: { key: JobseekerTab; label: string; count: number; icon: React.ElementType }[] = [
    { key: "applications", label: "Applications", count: detail.applications.length, icon: FileText     },
    { key: "hireRequests", label: "Hire Requests",count: detail.hireRequests.length, icon: UserCheck    },
    { key: "taskClaims",   label: "Task Claims",  count: detail.taskClaims.length,   icon: ClipboardList},
  ];

  return (
    <div className="px-6 py-5 space-y-5">
      {/* Quick stats row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-center">
          <p className="text-lg font-bold text-[#1e3a5f]">{detail.applications.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">Applications</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-center">
          <p className="text-lg font-bold text-[#1e3a5f]">{detail.hireRequests.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">Hire Requests</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-center">
          <p className="text-lg font-bold text-[#1e3a5f]">{detail.taskClaims.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">Task Claims</p>
        </div>
      </div>

      {/* Info chips */}
      <div className="flex flex-wrap gap-2 text-xs">
        {user.hourlyRate && (
          <span className="px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-100 font-medium">
            ${user.hourlyRate}/hr
          </span>
        )}
        {user.yearsOfExperience !== undefined && (
          <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100 font-medium">
            {user.yearsOfExperience} yr{user.yearsOfExperience !== 1 ? "s" : ""} exp
          </span>
        )}
        {user.availability && (
          <span className="px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100 font-medium capitalize">
            {user.availability}
          </span>
        )}
        {user.ratingAvg !== undefined && user.ratingCount !== undefined && user.ratingCount > 0 && (
          <span className="px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-100 font-medium">
            ⭐ {user.ratingAvg.toFixed(1)} ({user.ratingCount})
          </span>
        )}
      </div>

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

      {/* Work experience */}
      {user.workExperience && user.workExperience.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Experience</h3>
          <div className="space-y-2">
            {user.workExperience.map((w, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-sm font-semibold text-gray-800">{w.position}</p>
                <p className="text-xs text-gray-500">{w.company} · {w.startYear}–{w.endYear || "Present"}</p>
                {w.description && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{w.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {user.education && user.education.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Education</h3>
          <div className="space-y-2">
            {user.education.map((e, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-sm font-semibold text-gray-800">{e.degree} in {e.fieldOfStudy}</p>
                <p className="text-xs text-gray-500">{e.school} · {e.startYear}–{e.endYear || "Present"}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Social links */}
      {user.socialLinks && Object.values(user.socialLinks).some(Boolean) && (
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Links</h3>
          <div className="flex flex-wrap gap-2">
            {user.socialLinks.website && (
              <a href={user.socialLinks.website} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-600 hover:bg-gray-100 transition-colors">
                <Globe size={12} /> Website
              </a>
            )}
            {user.socialLinks.linkedin && (
              <a href={user.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100 text-xs text-blue-600 hover:bg-blue-100 transition-colors">
                <Linkedin size={12} /> LinkedIn
              </a>
            )}
            {user.socialLinks.github && (
              <a href={user.socialLinks.github} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-700 hover:bg-gray-100 transition-colors">
                <Github size={12} /> GitHub
              </a>
            )}
            {user.socialLinks.twitter && (
              <a href={user.socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 border border-sky-100 text-xs text-sky-600 hover:bg-sky-100 transition-colors">
                <Twitter size={12} /> Twitter
              </a>
            )}
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
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0",
                  activeTab === tab.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}>
                <Icon size={12} />
                {tab.label}
                <span className="text-xs text-gray-400">({tab.count})</span>
              </button>
            );
          })}
        </div>

        {activeTab === "applications" && (
          <div className="space-y-2">
            {detail.applications.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No applications.</p>
            ) : (
              detail.applications.map((app) => {
                const job = typeof app.job === "object" ? app.job : null;
                const title = job?.title ?? "Application";
                return (
                  <div key={app._id} className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
                      <p className="text-xs text-gray-400">{formatDate(app.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant={statusBadge(app.status)}>{app.status}</Badge>
                      <button
                        onClick={() => onViewUpdates("application", app._id, title)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#1e3a5f]/10 text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white text-xs font-bold transition-all cursor-pointer"
                        title="View execution status"
                      >
                        <Activity size={12} /> Status
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === "hireRequests" && (
          <div className="space-y-2">
            {detail.hireRequests.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No hire requests.</p>
            ) : (
              detail.hireRequests.map((hr) => {
                const job = typeof hr.job === "object" ? hr.job : null;
                const isFreelance = hr.hireType === "freelance";
                const title = isFreelance ? (hr.projectTitle ?? "Freelance Project") : (job?.title ?? "Hire Request");
                return (
                  <div key={hr._id} className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
                      <p className="text-xs text-gray-400">{formatCurrency(hr.salary)}/mo · {formatDate(hr.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant={statusBadge(hr.status)}>{hr.status}</Badge>
                      <button
                        onClick={() => onViewUpdates("hireRequest", hr._id, title)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#1e3a5f]/10 text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white text-xs font-bold transition-all cursor-pointer"
                        title="View execution status"
                      >
                        <Activity size={12} /> Status
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === "taskClaims" && (
          <div className="space-y-2">
            {detail.taskClaims.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No task claims.</p>
            ) : (
              detail.taskClaims.map((claim) => {
                const task = typeof claim.task === "object" ? claim.task : null;
                const title = task?.title ?? "Task Claim";
                return (
                  <div key={claim._id} className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
                      <p className="text-xs text-gray-400">{formatDate(claim.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant={statusBadge(claim.status)}>{claim.status}</Badge>
                      <button
                        onClick={() => onViewUpdates("taskClaim", claim._id, title)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#1e3a5f]/10 text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white text-xs font-bold transition-all cursor-pointer"
                        title="View execution status"
                      >
                        <Activity size={12} /> Status
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AdminUserDrawer({ userId, onClose, onUserUpdated }: AdminUserDrawerProps) {
  const { data: session } = useSession();
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<ActivityTab>("jobs");
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const handleVerifyUser = async (isVerified: boolean) => {
    if (!session?.user.accessToken || !userId || !detail) return;
    setVerifying(true);
    try {
      await adminApi.updateUserVerification(session.user.accessToken, userId, {
        isVerified,
        verificationStatus: isVerified ? "approved" : "none",
        verificationNote: isVerified ? "Approved by Admin via Profile Audit" : "Badge revoked",
      });
      setDetail((prev) =>
        prev
          ? {
              ...prev,
              user: {
                ...prev.user,
                isVerified,
                verificationStatus: isVerified ? "approved" : "none",
              },
            }
          : prev
      );
      onUserUpdated();
    } finally {
      setVerifying(false);
    }
  };

  const isOpen = !!userId;

  useEffect(() => {
    if (!userId || !session?.user.accessToken) return;
    setDetail(null);
    setLoading(true);
    (adminApi.getUserDetail(session.user.accessToken, userId) as Promise<{ data: UserDetail }>)
      .then((res) => {
        setDetail(res.data);
        // Default tab depends on role
        setActiveTab(res.data.user.role === "employer" ? "jobs" : "applications");
      })
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
    setDeleting(true);
    try {
      await adminApi.deleteUser(session.user.accessToken, userId);
      onUserUpdated();
      onClose();
    } finally {
      setDeleting(false);
      setConfirmDeleteOpen(false);
    }
  };

  const [workUpdatesTarget, setWorkUpdatesTarget] = useState<{
    refType: WorkRefType;
    refId: string;
    title: string;
  } | null>(null);

  const handleViewUpdates = (refType: WorkRefType, refId: string, title: string) => {
    setWorkUpdatesTarget({ refType, refId, title });
  };

  const user = detail?.user;
  const isEmployer = user?.role === "employer";

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
          <span className="text-sm font-semibold text-gray-700">
            {isEmployer ? "Employer Profile" : "User Profile"}
          </span>
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
          ) : !user || !detail ? (
            <div className="p-6 text-center text-gray-400 text-sm">Failed to load profile.</div>
          ) : (
            <>
              {/* Hero — shared */}
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
                    {isEmployer && user.company && (
                      <p className="text-sm font-semibold text-[#1e3a5f] mb-0.5">{user.company}</p>
                    )}
                    {user.title && (
                      <p className="text-sm text-gray-500 mb-1">{user.title}</p>
                    )}
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    <IdBadge id={user._id} prefix={isEmployer ? "EMP" : "USR"} className="mt-1" />
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

              {/* Role-specific body */}
              {isEmployer ? (
                <EmployerProfile
                  user={user}
                  detail={detail}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  onViewUpdates={handleViewUpdates}
                />
              ) : (
                <JobseekerProfile
                  user={user}
                  detail={detail}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  onViewUpdates={handleViewUpdates}
                />
              )}
            </>
          )}
        </div>

        {/* Sticky action bar */}
        {user && !loading && (
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 flex flex-wrap gap-2 items-center justify-between z-10">
            <div className="flex items-center gap-2">
              {!user.isVerified ? (
                <Button
                  size="sm"
                  onClick={() => handleVerifyUser(true)}
                  loading={verifying}
                  className="bg-emerald-600 hover:bg-emerald-700 text-xs gap-1.5 font-semibold px-4"
                >
                  <ShieldCheck size={14} />
                  Confirm & Grant Badge
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleVerifyUser(false)}
                  loading={verifying}
                  className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50 gap-1.5"
                >
                  <ShieldOff size={14} />
                  Revoke Badge
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={user.isActive ? "danger" : "secondary"}
                onClick={handleToggle}
                loading={toggling}
                className="gap-1.5"
              >
                {user.isActive ? <ShieldOff size={13} /> : <ShieldCheck size={13} />}
                {user.isActive ? "Ban User" : "Activate"}
              </Button>
            </div>
          </div>
        )}
      </aside>

      <ConfirmDeleteModal
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        title={`Delete ${user?.name ?? "user"}?`}
        description="This will permanently delete this account and all associated jobs, applications, and data."
        confirmPhrase="delete"
        loading={deleting}
      />

      {/* Execution Progress & Work Updates Drawer for Admin */}
      {workUpdatesTarget && (
        <WorkUpdatesDrawer
          open={!!workUpdatesTarget}
          onClose={() => setWorkUpdatesTarget(null)}
          refType={workUpdatesTarget.refType}
          refId={workUpdatesTarget.refId}
          title={workUpdatesTarget.title}
          role="admin"
        />
      )}
    </>
  );
}
