"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Task } from "@/types";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { MapPin, Calendar, Clock, Users, RefreshCw } from "lucide-react";

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

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a")) return;
    router.push(`/employer/my-tasks/${task._id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="relative bg-white rounded-2xl border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer overflow-hidden p-5 flex flex-col justify-between min-h-[280px]"
    >
      {/* Corner Tag */}
      <span className="absolute top-0 right-0 bg-[#d4a017] text-white text-[9px] font-bold px-3 py-1 rounded-bl-lg tracking-wider z-10">
        TASK
      </span>

      <div>
        {/* Row 1: Avatar + Title/Company + Status Badge */}
        <div className="flex gap-3 items-start pr-8">
          <Avatar name={companyName} src={employer?.avatar} size="md" className="flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-[16px] leading-snug group-hover:text-[#1e3a5f] transition-colors line-clamp-2 break-words pr-4">
              {task.title}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{companyName}</p>
          </div>
          <Badge variant={statusBadge(task.status)} className="flex-shrink-0 mr-4">
            {task.status === "open" ? "Active" : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
          </Badge>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide border border-emerald-250 text-emerald-600 bg-emerald-50/50">
            {formatCurrency(task.budget)} Fixed
          </span>
          <span className="px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide border border-purple-250 text-purple-600 bg-purple-50/50">
            Claims {task.claimCount}/{task.maxClaims}
          </span>
          {task.durationType === "hours" && task.durationHours ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide border border-amber-250 text-amber-600 bg-amber-50/50">
              <Clock size={11} />
              {task.durationHours} {task.durationHours === 1 ? "Hour" : "Hours"} Task
            </span>
          ) : (task.startDate || task.endDate) ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide border border-amber-250 text-amber-600 bg-amber-50/50">
              <Calendar size={10} />
              {task.startDate ? new Date(task.startDate).toLocaleDateString() : "—"}
              {" → "}
              {task.endDate ? new Date(task.endDate).toLocaleDateString() : (task.deadline ? new Date(task.deadline).toLocaleDateString() : "—")}
            </span>
          ) : null}
        </div>

        {/* Location & Posted Time */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mt-4 font-medium">
          <MapPin size={14} className="text-gray-300 flex-shrink-0" />
          <span className="truncate">{task.location || "Remote"}</span>
          <span>•</span>
          <span className="whitespace-nowrap">{formatRelativeTime(task.createdAt)}</span>
        </div>
      </div>

      {/* Skills & Action Buttons */}
      <div className="mt-4">
        {/* Skills as plain text */}
        {task.skills.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-4 pt-3 border-t border-gray-100">
            {task.skills.slice(0, 4).map(skill => (
              <span key={skill} className="text-xs text-gray-600 font-medium">{skill}</span>
            ))}
            {task.skills.length > 4 && (
              <span className="text-xs text-gray-400 font-medium">+{task.skills.length - 4}</span>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2" onClick={stop}>
          <Link
            href={`/employer/my-tasks/${task._id}`}
            onClick={stop}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors text-center"
          >
            <Users size={14} />
            Claims ({task.claimCount})
          </Link>
          {task.status === "open" ? (
            <button
              onClick={(e) => { stop(e); onClose(task._id); }}
              className="flex-1 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white text-sm font-semibold transition-all"
            >
              Close Task
            </button>
          ) : (
            <button
              onClick={(e) => { stop(e); onReopen(task._id); }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full bg-[#1e3a5f] hover:bg-[#152a45] active:scale-[0.98] text-white text-sm font-semibold transition-all"
            >
              <RefreshCw size={13} />
              Reopen
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
