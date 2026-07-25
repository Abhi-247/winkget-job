"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Job } from "@/types";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { formatCurrency, formatDate, salaryLabel, cn } from "@/lib/utils";
import {
  MapPin, Briefcase, Users, Calendar, Building2,
  GraduationCap, Clock, Layers, BookOpen, X,
} from "lucide-react";
import { IdBadge } from "@/components/ui/IdBadge";

const employmentLabels: Record<string, string> = {
  fullTime:   "Full Time",
  partTime:   "Part Time",
  contract:   "Contract",
  internship: "Internship",
};

const jobTypeLabels: Record<string, string> = {
  remote: "Remote",
  onsite: "On-site",
  hybrid: "Hybrid",
};

const experienceLevels: Record<string, string> = {
  fresher: "Fresher",
  "0-1":   "0–1 yr",
  "1-2":   "1–2 yrs",
  "2-5":   "2–5 yrs",
  "5-10":  "5–10 yrs",
  "10+":   "10+ yrs",
};

const educationLabels: Record<string, string> = {
  any:        "Any",
  highSchool: "High School",
  bachelor:   "Bachelor's",
  master:     "Master's",
  phd:        "PhD",
};

interface JobDetailModalProps {
  job: Job | null;
  onClose: () => void;
}

function InfoChip({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5 p-3 bg-gray-50 rounded-lg border border-gray-100">
      <Icon size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-gray-800 truncate">{value}</p>
      </div>
    </div>
  );
}

export function JobDetailModal({ job, onClose }: JobDetailModalProps): React.ReactNode {
  const [mounted, setMounted] = useState(false);
  const isOpen = !!job;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!job || !mounted) return null;

  const employer = typeof job.employer === "object" ? job.employer : null;

  const salaryDisplay =
    job.salaryMin && job.salaryMax
      ? `${formatCurrency(job.salaryMin)} – ${formatCurrency(job.salaryMax)}`
      : formatCurrency(job.salary);

  const salaryPer = salaryLabel(job.salaryType);

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-200",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-full sm:w-[520px] md:w-[580px] bg-white shadow-2xl flex flex-col",
          "transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <span className="text-sm font-semibold text-gray-700">Job Details</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Hero */}
          <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
              <Briefcase size={20} className="text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-lg font-bold text-gray-900 leading-snug">{job.title}</h2>
                <Badge variant={statusBadge(job.status)} className="capitalize">
                  {job.status}
                </Badge>
                <IdBadge id={job._id} prefix="JOB" />
              </div>
              {employer && (
                <div className="flex items-center gap-2 text-sm text-[#1e3a5f] font-semibold mt-1">
                  <Avatar name={employer.company || employer.name} size="xs" />
                  <span>{employer.company || employer.name}</span>
                  {employer._id && <IdBadge id={employer._id} prefix="EMP" />}
                </div>
              )}
              <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-400">
                {job.location && (
                  <span className="flex items-center gap-1"><MapPin size={11} /> {job.location}</span>
                )}
                <span className="flex items-center gap-1"><Calendar size={11} /> Posted {formatDate(job.createdAt)}</span>
                <span className="flex items-center gap-1"><Users size={11} /> {job.applicantCount} applicant{job.applicantCount !== 1 ? "s" : ""}</span>
              </div>
            </div>
          </div>

          {/* Key details grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <InfoChip icon={Layers}         label="Salary"     value={`${salaryDisplay}${salaryPer}`} />
            {job.employmentType && (
              <InfoChip icon={Briefcase}    label="Type"       value={employmentLabels[job.employmentType] ?? job.employmentType} />
            )}
            {job.jobType && (
              <InfoChip icon={Building2}    label="Work Mode"  value={jobTypeLabels[job.jobType] ?? job.jobType} />
            )}
            {job.department && (
              <InfoChip icon={BookOpen}     label="Department" value={job.department} />
            )}
            {job.experienceLevel && (
              <InfoChip icon={Clock}        label="Experience" value={experienceLevels[job.experienceLevel] ?? job.experienceLevel} />
            )}
            {job.education && job.education !== "any" && (
              <InfoChip icon={GraduationCap} label="Education" value={educationLabels[job.education] ?? job.education} />
            )}
            {job.jobVacancy && (
              <InfoChip icon={Users}        label="Vacancies"  value={String(job.jobVacancy)} />
            )}
            {job.workShift && (
              <InfoChip icon={Clock}        label="Shift"      value={job.workShift.charAt(0).toUpperCase() + job.workShift.slice(1)} />
            )}
          </div>

          {/* Skills */}
          {job.skills && job.skills.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Required Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {job.skills.map((s) => (
                  <span key={s} className="px-2.5 py-0.5 rounded-full bg-[#edf2f7] text-[#1e3a5f] text-xs border border-[#1e3a5f]/20 font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {job.description && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Description</h3>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{job.description}</p>
            </div>
          )}

          {/* Responsibilities */}
          {job.responsibilities && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Responsibilities</h3>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{job.responsibilities}</p>
            </div>
          )}

          {/* Company info */}
          {(job.companyName || job.companyAddress) && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 space-y-1">
              {job.companyName && (
                <p className="text-sm font-semibold text-blue-800">{job.companyName}</p>
              )}
              {job.companyAddress && (
                <p className="text-xs text-blue-600 flex items-center gap-1">
                  <MapPin size={11} /> {job.companyAddress}
                </p>
              )}
            </div>
          )}

          {/* FAQs */}
          {job.faqs && job.faqs.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">FAQs</h3>
              <div className="space-y-2">
                {job.faqs.map((faq, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-sm font-semibold text-gray-800 mb-1">{faq.question}</p>
                    <p className="text-sm text-gray-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>,
    document.body
  );
}
