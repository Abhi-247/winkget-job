"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Task } from "@/types";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { MapPin, Users, RefreshCw } from "lucide-react";

interface TaskCardProps {
  task: Task;
  onClose: (id: string) => void;
  onReopen: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskCard({ task, onClose, onReopen, onDelete }: TaskCardProps) {
  const router = useRouter();

  const employer    = typeof task.employer === "object" ? task.employer : null;
  const companyName = employer?.company || employer?.name || task.companyName || "Employer";
  const location    = task.location || "Remote";
  const initial     = companyName.charAt(0).toUpperCase() || "T";
  const formattedBudget = `${formatCurrency(task.budget)} FIXED`;

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a")) return;
    router.push(`/employer/my-tasks/${task._id}`);
  };

  const workModeBadge =
    location.toLowerCase().includes("remote") ? "Remote"
    : location.toLowerCase().includes("hybrid") ? "Hybrid"
    : "On-site";

  const taskTypeLabel =
    task.taskType === "quick-fix"       ? "Quick Fix" :
    task.taskType === "data-entry"      ? "Data Entry" :
    task.taskType === "content-writing" ? "Content Writing" :
    task.taskType === "design"          ? "Design Task" :
    task.taskType === "testing"         ? "Testing" :
    task.taskType === "research"        ? "Research" : "Task";

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-5 hover:shadow-md hover:border-amber-200/60 transition-all duration-200 cursor-pointer flex flex-col justify-between w-full h-full flex-1 overflow-hidden"
    >
      <div className="flex-1 flex flex-col">
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-start gap-2.5 min-w-0 flex-1">
            {employer?.avatar ? (
              <Avatar name={companyName} src={employer.avatar} size="sm" className="flex-shrink-0 rounded-xl" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-[#1e3a5f] text-white flex items-center justify-center font-semibold text-base flex-shrink-0 shadow-xs">
                {initial}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-[#0f172a] text-sm sm:text-base leading-snug group-hover:text-[#1e3a5f] transition-colors line-clamp-2 break-normal">
                  {task.title}
                </h3>
                <Badge variant={statusBadge(task.status)} className="flex-shrink-0 text-[11px] font-medium">
                  {task.status === "open" ? "Active" : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 font-normal mt-0.5 truncate">
                {companyName} {location ? `· ${location}` : ""}
              </p>
            </div>
          </div>

          {/* Budget Pill */}
          <div className="flex-shrink-0">
            <span className="px-2.5 py-1 rounded-xl bg-[#eef2ff] text-[#1e3a5f] font-semibold text-xs tracking-tight whitespace-nowrap block">
              {formattedBudget}
            </span>
          </div>
        </div>

        {/* Description Line */}
        <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed mt-3 mb-3.5 line-clamp-2">
          {task.description || task.deliverables || "Task details and guidelines for completion."}
        </p>

        {/* Skills Pills */}
        {task.skills && task.skills.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            {task.skills.slice(0, 4).map((skill) => (
              <span key={skill} className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-normal text-xs">
                {skill}
              </span>
            ))}
            {task.skills.length > 4 && (
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 font-normal text-xs">
                +{task.skills.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="mt-auto pt-3">
        {/* Divider */}
        <div className="border-t border-slate-100 mb-3" />

        {/* Bottom Footer Row */}
        <div className="flex items-center justify-between gap-3 flex-wrap pt-0.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-[#eef2ff] text-[#1e3a5f] text-xs font-medium">
              {taskTypeLabel}
            </span>
            <span className="px-2.5 py-0.5 rounded-full border border-blue-200 text-[#1e3a5f] text-xs font-medium">
              {workModeBadge}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
              Claims: {task.claimCount}/{task.maxClaims}
            </span>
            <span className="text-xs text-slate-400 font-normal ml-1">
              {formatRelativeTime(task.createdAt)}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 flex-shrink-0 ml-auto" onClick={stop}>
            <Link href={`/employer/my-tasks/${task._id}`} onClick={stop}>
              <button className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-all">
                <Users size={14} /> Claims ({task.claimCount})
              </button>
            </Link>

            {task.status === "open" ? (
              <button
                onClick={(e) => { stop(e); onClose(task._id); }}
                className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white text-xs font-medium transition-all shadow-xs"
              >
                Close Task
              </button>
            ) : (
              <button
                onClick={(e) => { stop(e); onReopen(task._id); }}
                className="px-4 py-1.5 rounded-xl bg-[#1e3a5f] hover:bg-[#152a45] active:scale-[0.98] text-white text-xs font-medium transition-all flex items-center gap-1.5 shadow-xs"
              >
                <RefreshCw size={13} /> Reopen
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
