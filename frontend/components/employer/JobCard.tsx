"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Job } from "@/types";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency, salaryLabel, formatRelativeTime } from "@/lib/utils";
import { MapPin, Briefcase, Users, RefreshCw } from "lucide-react";

interface JobCardProps {
  job: Job;
  onClose: (id: string) => void;
  onReopen: (id: string) => void;
  onDelete: (id: string) => void;
}

const employmentLabels: Record<string, string> = {
  fullTime: "Full Time",
  partTime: "Part Time",
  contract: "Contract",
  internship: "Internship",
};

export function JobCard({ job, onClose, onReopen, onDelete }: JobCardProps) {
  const router = useRouter();

  const salaryDisplay =
    job.salaryMin && job.salaryMax
      ? `${formatCurrency(job.salaryMin)} – ${formatCurrency(job.salaryMax)}`
      : formatCurrency(job.salary);

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a")) {
      return;
    }
    router.push(`/employer/my-jobs/${job._id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="relative bg-white rounded-2xl border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer overflow-hidden p-5 flex flex-col justify-between min-h-[280px]"
    >
      {/* Corner Tag */}
      <span className="absolute top-0 right-0 bg-[#1e3a5f] text-white text-[9px] font-bold px-3 py-1 rounded-bl-lg tracking-wider z-10">
        JOB
      </span>

      <div>
        {/* Row 1: Icon + Title + Status Badge */}
        <div className="flex gap-3 items-start pr-8">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center">
            <Briefcase size={18} className="text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-[16px] leading-snug line-clamp-2 break-words pr-4">
              {job.title}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5 truncate capitalize">
              {job.department || "No Department"}
            </p>
          </div>
          <Badge variant={statusBadge(job.status)} className="flex-shrink-0 mr-4">
            {job.status === "open" ? "Active" : job.status.charAt(0).toUpperCase() + job.status.slice(1)}
          </Badge>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide border border-emerald-250 text-emerald-600 bg-emerald-50/50">
              {salaryDisplay}{salaryLabel(job.salaryType) ? ` ${salaryLabel(job.salaryType).trim().toUpperCase()}` : ""}
          </span>
          {job.jobVacancy && (
            <span className="px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide border border-purple-250 text-purple-600 bg-purple-50/50">
              Vacancy {job.applicantCount}/{job.jobVacancy}
            </span>
          )}
          {job.employmentType && (
            <span className="px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide border border-blue-250 text-blue-600 bg-blue-50/50">
              {employmentLabels[job.employmentType] ?? job.employmentType}
            </span>
          )}
        </div>

        {/* Location & Posted Time */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mt-4 font-medium">
          <MapPin size={14} className="text-gray-300 flex-shrink-0" />
          <span className="truncate">{job.location || "Remote"}</span>
          <span>•</span>
          <span className="whitespace-nowrap">{formatRelativeTime(job.createdAt)}</span>
        </div>
      </div>

      {/* Skills & Action Buttons */}
      <div className="mt-4">
        {/* Skills as plain text */}
        {job.skills.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-4 pt-3 border-t border-gray-100">
            {job.skills.slice(0, 4).map(skill => (
              <span key={skill} className="text-xs text-gray-600 font-medium">{skill}</span>
            ))}
            {job.skills.length > 4 && (
              <span className="text-xs text-gray-400 font-medium">+{job.skills.length - 4}</span>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2" onClick={stop}>
          <Link href={`/employer/applications?job=${job._id}`} onClick={stop} className="flex-1">
            <Button variant="outline" size="sm" className="w-full gap-1.5 py-2.5 rounded-full">
              <Users size={14} />
              Applications ({job.applicantCount})
            </Button>
          </Link>

          {job.status === "open" ? (
            <button
              onClick={(e) => { stop(e); onClose(job._id); }}
              className="flex-1 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white text-sm font-semibold transition-all text-center"
            >
              Close Job
            </button>
          ) : (
            <button
              onClick={(e) => { stop(e); onReopen(job._id); }}
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
