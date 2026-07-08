"use client";

import { Application, ApplicationStatus } from "@/types";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Star, MapPin, Eye } from "lucide-react";

interface ApplicantCardProps {
  application: Application;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
  onViewDetails: (application: Application) => void;
}

function StarRating({ rating = 4.5 }: { rating?: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={12}
          className={s <= Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}
        />
      ))}
      <span className="text-xs text-gray-400 ml-1">({0} reviews)</span>
    </div>
  );
}

export function ApplicantCard({ application, onStatusChange, onViewDetails }: ApplicantCardProps) {
  const applicant = typeof application.applicant === "object" ? application.applicant : null;
  const job       = typeof application.job === "object" ? application.job : null;

  const salaryDisplay = job?.salaryMax
    ? `${formatCurrency(job.salaryMax)}/mo`
    : job?.salary
    ? `${formatCurrency(job.salary)}/mo`
    : null;

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-[#1e3a5f]/20 transition-all cursor-pointer"
      onClick={() => onViewDetails(application)}
    >
      {/* ── Row 1: avatar · name · status · salary ───────────────────── */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar
            name={applicant?.name ?? "Applicant"}
            src={applicant?.avatar}
            size="lg"
            className="flex-shrink-0"
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <p className="font-semibold text-gray-900 truncate">
                {applicant?.name ?? "Applicant"}
              </p>
              <Badge variant={statusBadge(application.status)}>
                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
              </Badge>
            </div>
            {job && (
              <p className="text-xs text-gray-400 truncate">
                For: <span className="text-gray-600 font-medium">{job.title}</span>
              </p>
            )}
          </div>
        </div>

        {salaryDisplay && (
          <div className="text-right flex-shrink-0">
            <p className="font-bold text-gray-900 text-sm">{salaryDisplay}</p>
            <p className="text-xs text-gray-400">Budget</p>
          </div>
        )}
      </div>

      {/* ── Row 2: title · location · experience · stars ─────────────── */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-3 text-xs text-gray-500">
        {applicant?.title && (
          <span className="font-medium text-gray-700">{applicant.title}</span>
        )}
        {applicant?.location && (
          <span className="flex items-center gap-1">
            <MapPin size={11} />
            {applicant.location}
          </span>
        )}
        <StarRating />
        <span className="text-[#1e3a5f] font-medium">95% completion</span>
      </div>

      {/* ── Cover letter quote ───────────────────────────────────────── */}
      {application.coverLetter && (
        <p className="text-sm text-gray-500 italic line-clamp-2 mb-3 border-l-2 border-gray-200 pl-3">
          "{application.coverLetter}"
        </p>
      )}

      {/* ── Skills ──────────────────────────────────────────────────── */}
      {applicant?.skills && applicant.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {applicant.skills.slice(0, 5).map((skill) => (
            <span
              key={skill}
              className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs border border-gray-200"
            >
              {skill}
            </span>
          ))}
          {applicant.skills.length > 5 && (
            <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-400 text-xs border border-gray-200">
              +{applicant.skills.length - 5} more
            </span>
          )}
        </div>
      )}

      {/* ── Footer: date · actions ───────────────────────────────────── */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gray-100"
        onClick={stop}
      >
        <p className="text-xs text-gray-400">
          Applied {formatDate(application.createdAt)}
        </p>

        <div className="flex flex-wrap gap-2">
          {application.status === "pending" && (
            <>
              <Button
                size="sm"
                variant="secondary"
                className="text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200"
                onClick={() => onStatusChange(application._id, "shortlisted")}
              >
                Shortlist
              </Button>
              <Button
                size="sm"
                onClick={() => onStatusChange(application._id, "accepted")}
              >
                Accept
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => onStatusChange(application._id, "rejected")}
              >
                Reject
              </Button>
            </>
          )}
          {application.status === "shortlisted" && (
            <>
              <Button
                size="sm"
                onClick={() => onStatusChange(application._id, "accepted")}
              >
                Accept
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => onStatusChange(application._id, "rejected")}
              >
                Reject
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => onViewDetails(application)}
          >
            <Eye size={13} />
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
}
