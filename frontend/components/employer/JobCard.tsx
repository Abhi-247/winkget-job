"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Job } from "@/types";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatRelativeTime, salaryLabel } from "@/lib/utils";
import { Edit3, Users, MapPin, Briefcase, RefreshCw } from "lucide-react";

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

const expLabels: Record<string, string> = {
  fresher: "Fresher",
  "0-1": "0–1 yr",
  "1-2": "1–2 yrs",
  "2-5": "2–5 yrs",
  "5-10": "5–10 yrs",
  "10+": "10+ yrs",
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
      className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-[#1e3a5f]/20 transition-all cursor-pointer"
    >
      {/* ── Row 1: title, status, vacancy, applications ─────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold text-gray-900">{job.title}</h3>
          <Badge variant={statusBadge(job.status)}>
            {job.status === "open" ? "Active" : job.status.charAt(0).toUpperCase() + job.status.slice(1)}
          </Badge>
          {job.jobVacancy && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border border-purple-300 text-purple-700 bg-purple-50">
              Vacancy {job.applicantCount}/{job.jobVacancy}
            </span>
          )}
        </div>

        {/* Applications count */}
        <div className="flex-shrink-0 text-right">
          <p className="text-2xl font-bold text-gray-900 leading-none">
            {job.applicantCount}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Applications</p>
        </div>
      </div>

      {/* ── Row 2: meta info ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 mb-3 text-xs text-gray-500">
        {job.department && (
          <span className="flex items-center gap-1">
            <Briefcase size={12} />
            {job.department}
          </span>
        )}
        {job.location && (
          <span className="flex items-center gap-1">
            <MapPin size={12} />
            {job.location}
          </span>
        )}
        {job.employmentType && (
          <span className="px-2 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 font-medium">
            {employmentLabels[job.employmentType] ?? job.employmentType}
          </span>
        )}
        <span className="font-semibold text-gray-700">
          {salaryDisplay}
          <span className="font-normal text-gray-400">{salaryLabel(job.salaryType)}</span>
        </span>
        {job.experienceLevel && (
          <span className="text-gray-400">
            {expLabels[job.experienceLevel] ?? job.experienceLevel}
          </span>
        )}
        {job.jobType && (
          <span className="capitalize text-gray-400">{job.jobType}</span>
        )}
      </div>

      {/* ── Row 3: skills ────────────────────────────────────────────── */}
      {job.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {job.skills.slice(0, 5).map((skill) => (
            <span
              key={skill}
              className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs border border-gray-200"
            >
              {skill}
            </span>
          ))}
          {job.skills.length > 5 && (
            <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-400 text-xs border border-gray-200">
              +{job.skills.length - 5} more
            </span>
          )}
        </div>
      )}

      {/* ── Row 4: posted date + action buttons ──────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          Posted {formatRelativeTime(job.createdAt)} · No deadline
        </p>

        <div className="flex flex-wrap items-center gap-2" onClick={stop}>
          <Link href={`/employer/applications?job=${job._id}`} onClick={stop}>
            <Button size="sm" variant="outline" className="gap-1.5">
              <Users size={13} />
              View Applications ({job.applicantCount})
            </Button>
          </Link>

          {job.status === "open" ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => { stop(e); onClose(job._id); }}
              className="text-yellow-700 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200"
            >
              Close Opening
            </Button>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => { stop(e); onReopen(job._id); }}
              className="text-[#1e3a5f] bg-[#edf2f7] hover:bg-[#dce4ef] border border-[#1e3a5f]/20 gap-1"
            >
              <RefreshCw size={12} />
              Reopen
            </Button>
          )}

          <Link href={`/employer/post-job?edit=${job._id}`} onClick={stop}>
            <Button size="sm" variant="ghost" className="gap-1.5 text-gray-600">
              <Edit3 size={13} />
              Edit
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
