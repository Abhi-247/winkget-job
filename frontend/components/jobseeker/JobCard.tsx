"use client";

import { Job } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { MapPin, CheckCircle2, Bookmark, Star, Clock } from "lucide-react";
import { formatCurrency, salaryLabel, formatRelativeTime } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
}: JobCardProps) {
  const router = useRouter();
  const employer    = typeof job.employer === "object" ? job.employer : null;
  const companyName = employer?.company || employer?.name || job.companyName || "Winkget Express";
  const location    = employer?.location || job.location || "Lucknow";
  const salary      = job.salaryMax ?? job.salary;

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a")) return;
    router.push(`/jobs/${job._id}`);
  };

  const workModeBadge =
    job.jobType === "hybrid"                          ? "Hybrid"
    : job.location?.toLowerCase().includes("remote") ? "Remote"
    : job.jobType === "office"                        ? "On-site"
    : job.location || "Hybrid";

  const isJobseeker = !userRole || userRole === "jobseeker";

  const salaryTypeLabel =
    job.salaryType === "fixed"   ? "Fixed"       :
    job.salaryType === "monthly" ? "Monthly"     :
    job.salaryType === "hourly"  ? "Hourly"      :
    job.salaryType === "annual"  ? "Annual"      : "Project";

  const employmentTypeLabel =
    job.employmentType === "fullTime"   ? "Full Time"   :
    job.employmentType === "partTime"   ? "Part Time"   :
    job.employmentType === "contract"   ? "Contract"    :
    job.employmentType === "internship" ? "Internship"  : "Full Time";

  const expLevelLabel =
    job.experienceLevel === "fresher" ? "Fresher" :
    job.experienceLevel === "0-1"     ? "0-1 Years" :
    job.experienceLevel === "1-2"     ? "1-2 Years" :
    job.experienceLevel === "2-5"     ? "2-5 Years" :
    job.experienceLevel === "5-10"    ? "5-10 Years" :
    job.experienceLevel === "10+"     ? "10+ Years" : "Fresher";

  const initial = companyName.charAt(0).toUpperCase() || "W";
  const formattedSalary = `${formatCurrency(salary)}${salaryLabel(job.salaryType)}`;
  const description = job.responsibilities || job.description || "Plan and execute marketing campaigns across multiple channels. Create engaging content for social media, email, and promotional materials.";

  const ratingAvg = employer?.ratingAvg || 0;
  const ratingCount = employer?.ratingCount || 0;

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-5 hover:shadow-md hover:border-blue-200 transition-all duration-200 flex flex-col justify-between w-full h-full flex-1 overflow-hidden cursor-pointer"
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
              <Link href={`/jobs/${job._id}`}>
                <h3 className="font-semibold text-[#0f172a] text-sm sm:text-base leading-snug group-hover:text-[#1e3a5f] transition-colors line-clamp-2 break-normal">
                  {job.title}
                </h3>
              </Link>
              <p className="text-xs text-slate-500 font-normal mt-0.5 truncate">
                {companyName} {location ? `· ${location}` : ""}
              </p>
            </div>
          </div>

          {/* Salary Pill */}
          <div className="flex-shrink-0">
            <span className="px-2.5 py-1 rounded-xl bg-[#eef2ff] text-[#1e3a5f] font-semibold text-xs tracking-tight whitespace-nowrap block">
              {formattedSalary}
            </span>
          </div>
        </div>

        {/* Description Line */}
        <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed mt-3 mb-3.5 line-clamp-2">
          {description}
        </p>

        {/* Skills Pills */}
        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            {job.skills.slice(0, 4).map((skill) => (
              <span key={skill} className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-normal text-xs">
                {skill}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 font-normal text-xs">
                +{job.skills.length - 4}
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
                {salaryTypeLabel}
              </span>
              <span className="px-2.5 py-0.5 rounded-full border border-blue-200 text-[#1e3a5f] text-xs font-medium">
                {workModeBadge}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                {employmentTypeLabel}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#1e3a5f] text-white text-xs font-medium">
                {expLevelLabel}
              </span>
            </div>

            {job.projectDuration && (
              <span className="text-xs text-slate-400 font-normal flex items-center gap-1 ml-auto">
                <Clock size={12} className="text-slate-400" />
                {job.projectDuration}
              </span>
            )}
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
              <span className="truncate">{formatRelativeTime(job.createdAt)}</span>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0 ml-auto">
              {applied ? (
                <button
                  disabled
                  onClick={(e) => e.stopPropagation()}
                  className="px-3.5 py-1.5 rounded-xl bg-[#eef2ff] border border-[#1e3a5f]/20 text-[#1e3a5f] text-xs font-medium flex items-center gap-1 cursor-default"
                >
                  <CheckCircle2 size={14} /> Applied
                </button>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); onApply(job); }}
                  className="px-4 py-1.5 rounded-xl bg-[#1e3a5f] hover:bg-[#152a45] active:scale-[0.98] text-white text-xs sm:text-sm font-medium transition-all shadow-xs"
                >
                  Apply
                </button>
              )}

              {isJobseeker && (
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleSave(job._id); }}
                  aria-label={saved ? "Remove from saved" : "Save job"}
                  className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-amber-500 hover:border-amber-200 transition-colors flex items-center justify-center flex-shrink-0"
                >
                  <Bookmark size={16} className={saved ? "fill-amber-500 text-amber-500" : "text-slate-400"} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}





