"use client";

import { Application, ApplicationStatus } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { formatDate, formatCurrency, cn } from "@/lib/utils";
import {
  MapPin, Calendar, Briefcase, CheckCircle2, XCircle,
  Star, FileText, Clock,
} from "lucide-react";

interface ApplicationDetailModalProps {
  application: Application | null;
  onClose: () => void;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
}

function StarRating({ rating = 0 }: { rating?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={12}
          className={s <= Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}
        />
      ))}
    </div>
  );
}

export function ApplicationDetailModal({
  application,
  onClose,
  onStatusChange,
}: ApplicationDetailModalProps) {
  if (!application) return null;

  const applicant = typeof application.applicant === "object" ? application.applicant : null;
  const job       = typeof application.job       === "object" ? application.job       : null;

  const salaryDisplay = job?.salaryMax
    ? `${formatCurrency(job.salaryMax)}/mo`
    : job?.salary
    ? `${formatCurrency(job.salary)}/mo`
    : null;

  const employmentLabels: Record<string, string> = {
    fullTime: "Full Time", partTime: "Part Time",
    contract: "Contract",  internship: "Internship",
  };

  return (
    <Modal open={!!application} onClose={onClose} size="lg">
      <div className="space-y-5 -mt-1">

        {/* ── Applicant hero ── */}
        <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
          <Avatar
            name={applicant?.name ?? "?"}
            src={applicant?.avatar}
            size="xl"
            className="flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-lg font-bold text-gray-900">{applicant?.name ?? "Applicant"}</h2>
              <Badge variant={statusBadge(application.status)} className="capitalize">
                {application.status}
              </Badge>
            </div>
            {applicant?.title && (
              <p className="text-sm text-gray-500 mb-1">{applicant.title}</p>
            )}
            <div className="flex flex-wrap gap-3 text-xs text-gray-400">
              {applicant?.location && (
                <span className="flex items-center gap-1"><MapPin size={11} /> {applicant.location}</span>
              )}
              <span className="flex items-center gap-1">
                <Calendar size={11} /> Applied {formatDate(application.createdAt)}
              </span>
              {applicant?.plan && (
                <span className={cn(
                  "px-2 py-0.5 rounded-full font-medium",
                  applicant.plan === "pro" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"
                )}>
                  {applicant.plan === "pro" ? "⭐ Pro" : "Free Plan"}
                </span>
              )}
            </div>
            {applicant?.ratingAvg !== undefined && (
              <div className="flex items-center gap-2 mt-1.5">
                <StarRating rating={applicant.ratingAvg} />
                <span className="text-xs text-gray-400">
                  {applicant.ratingAvg.toFixed(1)} ({applicant.ratingCount ?? 0} reviews)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Applied for ── */}
        {job && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wide mb-1">Applied For</p>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-sm font-bold text-blue-900">{job.title}</p>
                <div className="flex flex-wrap gap-3 mt-0.5 text-xs text-blue-600">
                  {job.location && <span className="flex items-center gap-1"><MapPin size={10} />{job.location}</span>}
                  {job.employmentType && <span><Briefcase size={10} className="inline mr-1" />{employmentLabels[job.employmentType] ?? job.employmentType}</span>}
                  {salaryDisplay && <span className="font-semibold">{salaryDisplay}</span>}
                </div>
              </div>
              <Badge variant={statusBadge(job.status)} className="capitalize flex-shrink-0">
                {job.status}
              </Badge>
            </div>
          </div>
        )}

        {/* ── Applicant info chips ── */}
        <div className="flex flex-wrap gap-2 text-xs">
          {applicant?.hourlyRate && (
            <span className="px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-100 font-medium">
              ₹{applicant.hourlyRate}/hr
            </span>
          )}
          {applicant?.yearsOfExperience !== undefined && (
            <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100 font-medium">
              {applicant.yearsOfExperience} yr{applicant.yearsOfExperience !== 1 ? "s" : ""} exp
            </span>
          )}
          {applicant?.availability && (
            <span className="px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100 font-medium capitalize">
              {applicant.availability}
            </span>
          )}
        </div>

        {/* ── Bio ── */}
        {applicant?.bio && (
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">About</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{applicant.bio}</p>
          </div>
        )}

        {/* ── Skills ── */}
        {applicant?.skills && applicant.skills.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {applicant.skills.map((s) => (
                <span key={s} className="px-2.5 py-0.5 rounded-full bg-[#edf2f7] text-[#1e3a5f] text-xs border border-[#1e3a5f]/20 font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Cover letter ── */}
        {application.coverLetter && (
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <FileText size={12} /> Cover Letter
            </h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-700 leading-relaxed italic">
                &ldquo;{application.coverLetter}&rdquo;
              </p>
            </div>
          </div>
        )}

        {/* ── Work experience ── */}
        {applicant?.workExperience && applicant.workExperience.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Experience</h3>
            <div className="space-y-2">
              {applicant.workExperience.map((w, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-sm font-semibold text-gray-800">{w.position}</p>
                  <p className="text-xs text-gray-500">{w.company} · {w.startYear}–{w.endYear || "Present"}</p>
                  {w.description && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{w.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Education ── */}
        {applicant?.education && applicant.education.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Education</h3>
            <div className="space-y-2">
              {applicant.education.map((e, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-sm font-semibold text-gray-800">{e.degree} in {e.fieldOfStudy}</p>
                  <p className="text-xs text-gray-500">{e.school} · {e.startYear}–{e.endYear || "Present"}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Status actions ── */}
        {(application.status === "pending" || application.status === "shortlisted") && (
          <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
            {application.status === "pending" && (
              <Button
                size="sm"
                variant="secondary"
                className="text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 gap-1.5"
                onClick={() => { onStatusChange(application._id, "shortlisted"); }}
              >
                Shortlist
              </Button>
            )}
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => { onStatusChange(application._id, "accepted"); onClose(); }}
            >
              <CheckCircle2 size={13} />
              Accept
            </Button>
            <Button
              size="sm"
              variant="danger"
              className="gap-1.5"
              onClick={() => { onStatusChange(application._id, "rejected"); onClose(); }}
            >
              <XCircle size={13} />
              Reject
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
