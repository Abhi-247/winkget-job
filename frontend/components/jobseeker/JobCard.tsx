"use client";

import { Job } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { MapPin, CheckCircle2, Bookmark } from "lucide-react";
import { formatCurrency, salaryLabel, formatRelativeTime } from "@/lib/utils";
import Link from "next/link";

interface JobCardProps {
  job: Job;
  applied: boolean;
  saved: boolean;
  onApply: (job: Job) => void;
  onToggleSave: (jobId: string) => void;
  userRole?: string;
  variant?: "card" | "list";
}

export function JobCard({
  job,
  applied,
  saved,
  onApply,
  onToggleSave,
  userRole,
  variant = "card",
}: JobCardProps) {
  const employer    = typeof job.employer === "object" ? job.employer : null;
  const companyName = employer?.company || employer?.name || "Employer";
  const location    = employer?.location || job.location || "Remote";
  const salary      = job.salaryMax ?? job.salary;
  const workModeBadge =
    job.jobType === "hybrid"                          ? "Hybrid"
    : job.location?.toLowerCase().includes("remote") ? "Remote"
    : job.jobType === "office"                        ? "On-site"
    : job.location;

  const isJobseeker = !userRole || userRole === "jobseeker";

  const salaryTypeLabel =
    job.salaryType === "fixed"   ? "Fixed-Price" :
    job.salaryType === "monthly" ? "Monthly"     :
    job.salaryType === "hourly"  ? "Hourly"      :
    job.salaryType === "annual"  ? "Full-Time"   : "Project";

  if (variant === "list") {
    return (
      <div className="group flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-blue-200 hover:shadow-sm lg:flex-row lg:items-center">
        <div className="flex min-w-0 items-center gap-3 lg:w-[28%] lg:flex-shrink-0">
          <Avatar name={companyName} src={employer?.avatar} size="md" className="flex-shrink-0" />
          <div className="min-w-0">
            <Link href={`/jobs/${job._id}`}>
              <h3 className="text-base font-bold text-gray-900 transition-colors group-hover:text-[#1e3a5f] line-clamp-2 break-words">
                {job.title}
              </h3>
            </Link>
            <p className="mt-0.5 truncate text-xs text-gray-500">{companyName}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:flex-1">
          <span className="rounded-full border border-emerald-250 bg-emerald-50/50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-600">
            {salaryTypeLabel}
          </span>
          <span className="rounded-full border border-amber-250 bg-amber-50/50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-600">
            {workModeBadge}
          </span>
          {job.experienceLevel && (
            <span className="rounded-full border border-blue-250 bg-blue-50/50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-600">
              {job.experienceLevel}
            </span>
          )}
          <span className="rounded-full border border-gray-200 bg-gray-50/50 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-gray-600">
            {formatCurrency(salary)}{salaryLabel(job.salaryType) ? ` ${salaryLabel(job.salaryType).trim().toUpperCase()}` : ""}
          </span>
          <div className="flex items-center gap-2 text-xs font-medium text-gray-400 lg:ml-1">
            <MapPin size={14} className="flex-shrink-0 text-gray-300" />
            <span className="truncate">{location}</span>
            <span>•</span>
            <span className="whitespace-nowrap">{formatRelativeTime(job.createdAt)}</span>
          </div>
        </div>

        <div className="hidden min-w-0 items-center gap-x-3 xl:flex xl:w-[16%] xl:flex-shrink-0">
          {job.skills.slice(0, 2).map((skill) => (
            <span key={skill} className="truncate text-xs font-medium text-gray-600">{skill}</span>
          ))}
          {job.skills.length > 2 && (
            <span className="whitespace-nowrap text-xs font-medium text-gray-400">+{job.skills.length - 2}</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:flex-shrink-0 lg:flex-nowrap">
          <Link
            href={`/jobs/${job._id}`}
            className="flex-1 whitespace-nowrap rounded-full border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 lg:flex-none"
          >
            View Details
          </Link>
          {applied ? (
            <button
              disabled
              className="flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-[#1e3a5f]/20 bg-[#edf2f7] px-4 py-2 text-sm font-medium text-[#1e3a5f] lg:flex-none"
            >
              <CheckCircle2 size={14} /> Applied
            </button>
          ) : (
            <button
              onClick={() => onApply(job)}
              className="flex-1 whitespace-nowrap rounded-full bg-[#1e3a5f] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[#152a45] active:scale-[0.98] lg:flex-none"
            >
              Apply Now
            </button>
          )}
          {isJobseeker && (
            <button
              onClick={() => onToggleSave(job._id)}
              aria-label={saved ? "Remove from saved" : "Save job"}
              className="rounded-full p-2 text-gray-400 transition-colors hover:bg-amber-50 hover:text-amber-500"
            >
              <Bookmark size={18} className={saved ? "fill-amber-500 text-amber-500" : "text-gray-300"} />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-white rounded-2xl border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all group overflow-hidden p-5 flex flex-col justify-between h-[320px]">
      {/* Corner Tag */}
      <span className="absolute top-0 right-0 bg-[#1e3a5f] text-white text-[9px] font-bold px-3 py-1 rounded-bl-lg tracking-wider z-10">
        JOB
      </span>

      <div>
        {/* Row 1: Avatar + Title/Company + Bookmark */}
        <div className="flex gap-3 items-start pr-8">
          <Avatar name={companyName} src={employer?.avatar} size="md" className="flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <Link href={`/jobs/${job._id}`}>
              <h3 className="font-bold text-gray-900 text-[16px] leading-snug group-hover:text-[#1e3a5f] transition-colors line-clamp-2 break-words pr-4">
                {job.title}
              </h3>
            </Link>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{companyName}</p>
          </div>
          {isJobseeker && (
            <button
              onClick={() => onToggleSave(job._id)}
              aria-label={saved ? "Remove from saved" : "Save job"}
              className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Bookmark size={18} className={saved ? "fill-amber-500 text-amber-500" : "text-gray-300"} />
            </button>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide border border-emerald-250 text-emerald-600 bg-emerald-50/50">
            {salaryTypeLabel}
          </span>
          <span className="px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide border border-amber-250 text-amber-600 bg-amber-50/50">
            {workModeBadge}
          </span>
          {job.experienceLevel && (
            <span className="px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide border border-blue-250 text-blue-600 bg-blue-50/50">
              {job.experienceLevel}
            </span>
          )}
          <span className="px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide border border-gray-200 text-gray-600 bg-gray-50/50">
            {formatCurrency(salary)}{salaryLabel(job.salaryType) ? ` ${salaryLabel(job.salaryType).trim().toUpperCase()}` : ""}
          </span>
        </div>

        {/* Location & Posted Time */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mt-4 font-medium">
          <MapPin size={14} className="text-gray-300 flex-shrink-0" />
          <span className="truncate">{location}</span>
          <span>•</span>
          <span className="whitespace-nowrap">{formatRelativeTime(job.createdAt)}</span>
        </div>
      </div>

      {/* Skills & Action Buttons */}
      <div className="mt-4">
        {/* Skills as plain text */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-4 pt-3 border-t border-gray-100">
          {job.skills.slice(0, 4).map(skill => (
            <span key={skill} className="text-xs text-gray-600 font-medium">{skill}</span>
          ))}
          {job.skills.length > 4 && (
            <span className="text-xs text-gray-400 font-medium">+{job.skills.length - 4}</span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <Link
            href={`/jobs/${job._id}`}
            className="flex-1 text-center py-2.5 rounded-full border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            View Details
          </Link>
          {applied ? (
            <button
              disabled
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full bg-[#edf2f7] border border-[#1e3a5f]/20 text-[#1e3a5f] text-sm font-medium cursor-not-allowed"
            >
              <CheckCircle2 size={14} /> Applied
            </button>
          ) : (
            <button
              onClick={() => onApply(job)}
              className="flex-1 py-2.5 rounded-full bg-[#1e3a5f] hover:bg-[#152a45] active:scale-[0.98] text-white text-sm font-semibold transition-all"
            >
              Apply Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
