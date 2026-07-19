"use client";

import { Job } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { MapPin, Star, CheckCircle2, Send, Bookmark } from "lucide-react";
import { formatCurrency, formatRelativeTime, salaryLabel, cn } from "@/lib/utils";
import Link from "next/link";

interface JobCardProps {
  job: Job;
  applied: boolean;
  saved: boolean;
  onApply: (job: Job) => void;
  onToggleSave: (jobId: string) => void;
  userRole?: string;
}

export function JobCard({ job, applied, saved, onApply, onToggleSave, userRole }: JobCardProps) {
  const employer      = typeof job.employer === "object" ? job.employer : null;
  const companyName   = employer?.company || employer?.name || "Employer";
  const location      = employer?.location || job.location || "Remote";
  const salary        = job.salaryMax ?? job.salary;
  const workModeBadge =
    job.jobType === "hybrid"                          ? "Hybrid"
    : job.location?.toLowerCase().includes("remote") ? "Remote"
    : job.jobType === "office"                        ? "On-site"
    : job.location;

  const isJobseeker = !userRole || userRole === "jobseeker";

  return (
    <div className="relative bg-white rounded-xl border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all group overflow-hidden">
      {/* JOB corner tag */}
      <span className="absolute top-0 right-0 bg-[#1e3a5f] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-bl-lg tracking-wider z-10">
        JOB
      </span>
      {/* Clickable area → job detail */}
      <Link href={`/jobs/${job._id}`} className="block p-4 sm:p-5 pb-3">
        {/* Row 1: avatar + title/company/location + salary */}
        <div className="flex gap-3 mb-3">
          <Avatar name={companyName} src={employer?.avatar} size="md" className="flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-0.5 sm:gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 leading-tight truncate group-hover:text-[#1e3a5f] transition-colors">{job.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{companyName}</p>
                <p className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                  <MapPin size={11} />{location}
                </p>
              </div>
              <div className="sm:text-right flex-shrink-0">
                <p className="font-bold text-gray-900 text-base leading-tight">
                  {formatCurrency(salary)}
                </p>
                <p className="text-xs text-gray-400 capitalize">
                  {salaryLabel(job.salaryType) || `/ ${job.salaryType}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: description */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">
          {job.responsibilities?.replace(/<[^>]*>/g, "") || job.description}
        </p>

        {/* Row 3: skills */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {job.skills.slice(0, 4).map(skill => (
            <span key={skill}
              className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full border border-gray-200">
              {skill}
            </span>
          ))}
          {job.skills.length > 4 && (
            <span className="px-2.5 py-0.5 bg-gray-100 text-gray-400 text-xs rounded-full border border-gray-200">
              +{job.skills.length - 4} more
            </span>
          )}
        </div>

        {/* Row 4: badges + rating + time */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 rounded border border-blue-300 text-[#1e3a5f] font-medium capitalize">
              {job.salaryType === "fixed"   ? "Fixed"   :
               job.salaryType === "monthly" ? "Monthly" :
               job.salaryType === "hourly"  ? "Hourly"  :
               job.salaryType === "annual"  ? "Annual"  : "Project"}
            </span>
            <span className="px-2 py-0.5 rounded border border-amber-300 text-amber-700 font-medium">
              {workModeBadge}
            </span>
            {job.projectDuration && (
              <span className="text-gray-400">{job.projectDuration}</span>
            )}
            <span className="flex items-center gap-0.5 text-gray-300">
              {[1,2,3,4,5].map(s => (
                <Star key={s} size={11} className="text-gray-300" />
              ))}
              <span className="ml-1 text-gray-400">0 (0)</span>
            </span>
          </div>
          <span className="text-gray-400">{formatRelativeTime(job.createdAt)}</span>
        </div>
      </Link>

      {/* Action bar — outside the Link so clicks don't navigate */}
      {isJobseeker && (
        <div
          className="px-4 sm:px-5 pb-4 pt-0 flex items-center gap-2 border-t border-gray-100 mt-0 pt-3"
          onClick={(e) => e.preventDefault()} // belt-and-suspenders
        >
          {applied ? (
            /* Already applied — status chip */
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#edf2f7] border border-[#1e3a5f]/20 text-[#1e3a5f] text-xs font-medium select-none">
              <CheckCircle2 size={13} />
              Applied
            </div>
          ) : (
            /* Apply button */
            <button
              onClick={() => onApply(job)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#1e3a5f] hover:bg-[#152a45] active:scale-95 text-white text-xs font-semibold transition-all"
            >
              <Send size={12} />
              Apply
            </button>
          )}

          {/* Save / Bookmark button */}
          <button
            onClick={() => onToggleSave(job._id)}
            aria-label={saved ? "Remove from saved jobs" : "Save job"}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all active:scale-95",
              saved
                ? "bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100"
                : "border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300"
            )}
          >
            <Bookmark size={13} className={saved ? "fill-amber-500 text-amber-500" : ""} />
            {saved ? "Saved" : "Save"}
          </button>
        </div>
      )}
    </div>
  );
}
