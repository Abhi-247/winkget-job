"use client";

import { Task } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { MapPin, Clock, Star, Bookmark } from "lucide-react";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSavedJobs } from "@/lib/hooks";

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const router = useRouter();
  const { isSaved, toggleSave } = useSavedJobs();
  const employer    = typeof task.employer === "object" ? task.employer : null;
  const companyName = employer?.company || employer?.name || task.companyName || "Employer";
  const location    = task.location || "Remote";

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a")) return;
    router.push(`/tasks/${task._id}`);
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

  const initial = companyName.charAt(0).toUpperCase() || "T";
  const formattedBudget = `${formatCurrency(task.budget)} FIXED`;
  const ratingAvg = employer?.ratingAvg || 0;
  const ratingCount = employer?.ratingCount || 0;
  const saved = isSaved(task._id);

  const durationStr = task.durationType === "hours" && task.durationHours
    ? `${task.durationHours} ${task.durationHours === 1 ? "hour" : "hours"}`
    : task.endDate ? "1-3 days" : "1-3 months";

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-5 hover:shadow-md hover:border-amber-200/60 transition-all duration-200 flex flex-col justify-between w-full h-full flex-1 overflow-hidden cursor-pointer"
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
              <Link href={`/tasks/${task._id}`}>
                <h3 className="font-semibold text-[#0f172a] text-sm sm:text-base leading-snug group-hover:text-[#1e3a5f] transition-colors line-clamp-2 break-normal">
                  {task.title}
                </h3>
              </Link>
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
          {task.description || task.deliverables || "Complete assigned deliverables within specified timeline."}
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
        <div className="flex flex-col gap-2.5">
          {/* Badges row & optional duration */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-[#eef2ff] text-[#1e3a5f] text-xs font-medium">
                {taskTypeLabel}
              </span>
              <span className="px-2.5 py-0.5 rounded-full border border-blue-200 text-[#1e3a5f] text-xs font-medium">
                {workModeBadge}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                Fixed Price
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#1e3a5f] text-white text-xs font-medium">
                Open Task
              </span>
            </div>

            <span className="text-xs text-slate-400 font-normal flex items-center gap-1 ml-auto">
              <Clock size={12} className="text-slate-400" />
              {durationStr}
            </span>
          </div>

          {/* Rating stars line & Action buttons */}
          <div className="flex items-center justify-between gap-2 pt-0.5">
            <div className="flex items-center gap-1 text-xs text-slate-400 font-normal min-w-0 truncate">
              <div className="flex items-center text-amber-400 gap-0.5 flex-shrink-0">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={11} className="text-slate-300 fill-slate-200" />
                ))}
              </div>
              <span className="truncate">{ratingAvg.toFixed(1)} ({ratingCount})</span>
              <span>·</span>
              <span className="truncate">{formatRelativeTime(task.createdAt)}</span>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0 ml-auto">
              <Link
                href={`/tasks/${task._id}`}
                onClick={(e) => e.stopPropagation()}
                className="px-4 py-1.5 rounded-xl bg-[#1e3a5f] hover:bg-[#152a45] active:scale-[0.98] text-white text-xs sm:text-sm font-medium transition-all shadow-xs"
              >
                Claim Task
              </Link>

              <button
                onClick={(e) => { e.stopPropagation(); toggleSave(task._id); }}
                aria-label={saved ? "Remove from saved" : "Save task"}
                className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-amber-500 hover:border-amber-200 transition-colors flex items-center justify-center flex-shrink-0"
              >
                <Bookmark size={16} className={saved ? "fill-amber-500 text-amber-500" : "text-slate-400"} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


