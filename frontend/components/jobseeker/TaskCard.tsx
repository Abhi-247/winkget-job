"use client";

import { Task } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { MapPin, Calendar, Clock } from "lucide-react";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import Link from "next/link";

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const employer    = typeof task.employer === "object" ? task.employer : null;
  const companyName = employer?.company || employer?.name || task.companyName || "Employer";
  const location    = task.location || "Remote";

  const workModeBadge =
    location.toLowerCase().includes("remote") ? "Remote"
    : location.toLowerCase().includes("hybrid") ? "Hybrid"
    : "On-site";

  return (
    <div className="relative bg-white rounded-2xl border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all group overflow-hidden p-5 flex flex-col justify-between min-h-[280px]">
      {/* Corner Tag */}
      <span className="absolute top-0 right-0 bg-[#d4a017] text-white text-[9px] font-bold px-3 py-1 rounded-bl-lg tracking-wider z-10">
        TASK
      </span>

      <div>
        {/* Row 1: Avatar + Title/Company */}
        <div className="flex gap-3 items-start pr-8">
          <Avatar name={companyName} src={employer?.avatar} size="md" className="flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <Link href={`/tasks/${task._id}`}>
              <h3 className="font-bold text-gray-900 text-[16px] leading-snug group-hover:text-[#1e3a5f] transition-colors line-clamp-2 break-words pr-4">
                {task.title}
              </h3>
            </Link>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{companyName}</p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide border border-emerald-250 text-emerald-600 bg-emerald-50/50">
            {task.taskType}
          </span>
          <span className="px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide border border-amber-250 text-amber-600 bg-amber-50/50">
            {workModeBadge}
          </span>
          {task.durationType === "hours" && task.durationHours ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide border border-blue-250 text-blue-600 bg-blue-50/50">
              <Clock size={11} className="flex-shrink-0" />
              {task.durationHours} {task.durationHours === 1 ? "Hour" : "Hours"} Task
            </span>
          ) : (task.startDate || task.endDate || task.deadline) ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide border border-blue-250 text-blue-600 bg-blue-50/50">
              <Calendar size={10} className="flex-shrink-0" />
              {task.startDate ? new Date(task.startDate).toLocaleDateString() : "—"}
              {" → "}
              {task.endDate ? new Date(task.endDate).toLocaleDateString() : (task.deadline ? new Date(task.deadline).toLocaleDateString() : "—")}
            </span>
          ) : null}
          <span className="px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide border border-gray-200 text-gray-600 bg-gray-50/50">
            {formatCurrency(task.budget)} FIXED
          </span>
        </div>

        {/* Location & Posted Time */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mt-4 font-medium">
          <MapPin size={14} className="text-gray-300 flex-shrink-0" />
          <span className="truncate">{location}</span>
          <span>•</span>
          <span className="whitespace-nowrap">{formatRelativeTime(task.createdAt)}</span>
        </div>
      </div>

      {/* Skills & Action Buttons */}
      <div className="mt-4">
        {/* Skills as plain text */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-4 pt-3 border-t border-gray-100">
          {task.skills.slice(0, 4).map(skill => (
            <span key={skill} className="text-xs text-gray-600 font-medium">{skill}</span>
          ))}
          {task.skills.length > 4 && (
            <span className="text-xs text-gray-400 font-medium">+{task.skills.length - 4}</span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <Link
            href={`/tasks/${task._id}`}
            className="flex-1 text-center py-2.5 rounded-full border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            View Details
          </Link>
          <Link
            href={`/tasks/${task._id}`}
            className="flex-1 text-center py-2.5 rounded-full bg-[#1e3a5f] hover:bg-[#152a45] active:scale-[0.98] text-white text-sm font-semibold transition-all"
          >
            Claim Task
          </Link>
        </div>
      </div>
    </div>
  );
}
