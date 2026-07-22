"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Job } from "@/types";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { formatCurrency, salaryLabel, formatRelativeTime } from "@/lib/utils";
import { MapPin, Users, RefreshCw } from "lucide-react";

interface JobCardProps {
  job: Job;
  onClose: (id: string) => void;
  onReopen: (id: string) => void;
  onDelete: (id: string) => void;
}

export function JobCard({ job, onClose, onReopen, onDelete }: JobCardProps) {
  const router = useRouter();

  const salaryDisplay =
    job.salaryMin && job.salaryMax
      ? `${formatCurrency(job.salaryMin)} – ${formatCurrency(job.salaryMax)}`
      : formatCurrency(job.salary);

  const formattedSalary = `${salaryDisplay}${salaryLabel(job.salaryType)}`;
  const companyName = job.companyName || job.department || "Company";
  const initial = companyName.charAt(0).toUpperCase() || "J";

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a")) return;
    router.push(`/employer/my-jobs/${job._id}`);
  };

  const workModeBadge =
    job.jobType === "hybrid"                          ? "Hybrid"
    : job.location?.toLowerCase().includes("remote") ? "Remote"
    : job.jobType === "office"                        ? "On-site"
    : job.location || "Hybrid";

  const salaryTypeLabel =
    job.salaryType === "fixed"   ? "Fixed"       :
    job.salaryType === "monthly" ? "Monthly"     :
    job.salaryType === "hourly"  ? "Hourly"      :
    job.salaryType === "annual"  ? "Annual"      : "Project";

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-5 hover:shadow-md hover:border-blue-200 transition-all duration-200 cursor-pointer flex flex-col justify-between w-full h-full flex-1 overflow-hidden"
    >
      <div className="flex-1 flex flex-col">
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-start gap-2.5 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-xl bg-[#1e3a5f] text-white flex items-center justify-center font-semibold text-base flex-shrink-0 shadow-xs">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-[#0f172a] text-sm sm:text-base leading-snug group-hover:text-[#1e3a5f] transition-colors line-clamp-2 break-normal">
                  {job.title}
                </h3>
                <Badge variant={statusBadge(job.status)} className="flex-shrink-0 text-[11px] font-medium">
                  {job.status === "open" ? "Active" : job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 font-normal mt-0.5 truncate">
                {companyName} {job.location ? `· ${job.location}` : ""}
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
          {job.responsibilities || job.description || "Job posting details and requirements."}
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
        <div className="flex items-center justify-between gap-3 flex-wrap pt-0.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-[#eef2ff] text-[#1e3a5f] text-xs font-medium">
              {salaryTypeLabel}
            </span>
            <span className="px-2.5 py-0.5 rounded-full border border-blue-200 text-[#1e3a5f] text-xs font-medium">
              {workModeBadge}
            </span>
            {job.jobVacancy && (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                Vacancy: {job.applicantCount}/{job.jobVacancy}
              </span>
            )}
            <span className="text-xs text-slate-400 font-normal ml-1">
              {formatRelativeTime(job.createdAt)}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 flex-shrink-0 ml-auto" onClick={stop}>
            <Link href={`/employer/applications?job=${job._id}`} onClick={stop}>
              <button className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-all">
                <Users size={14} /> Applications ({job.applicantCount})
              </button>
            </Link>

            {job.status === "open" ? (
              <button
                onClick={(e) => { stop(e); onClose(job._id); }}
                className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white text-xs font-medium transition-all shadow-xs"
              >
                Close Job
              </button>
            ) : (
              <button
                onClick={(e) => { stop(e); onReopen(job._id); }}
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




