"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { jobsApi, applicationsApi } from "@/lib/api";
import { Job, Application } from "@/types";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import {
  formatCurrency,
  formatDate,
  formatRelativeTime,
  salaryLabel,
} from "@/lib/utils";
import {
  ChevronLeft,
  Edit3,
  ExternalLink,
  BarChart2,
  MapPin,
  Briefcase,
  Users,
  Calendar,
  Clock,
  Building2,
  GraduationCap,
  User,
} from "lucide-react";

// ── helpers ──────────────────────────────────────────────────────────────────

const employmentLabels: Record<string, string> = {
  fullTime: "Full Time", partTime: "Part Time",
  contract: "Contract", internship: "Internship",
};
const shiftLabels: Record<string, string> = {
  day: "Day Shift", night: "Night Shift",
  rotating: "Rotating", flexible: "Flexible",
};
const expLabels: Record<string, string> = {
  fresher: "Fresher", "0-1": "0–1 Year", "1-2": "1–2 Years",
  "2-5": "2–5 Years", "5-10": "5–10 Years", "10+": "10+ Years",
};
const educationLabels: Record<string, string> = {
  any: "Any", highSchool: "High School",
  bachelor: "Bachelor's", master: "Master's", phd: "PhD",
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

// ── skeleton ─────────────────────────────────────────────────────────────────

function PanelSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse space-y-4">
      <div className="h-5 bg-gray-200 rounded w-1/3" />
      {[100, 80, 90, 70, 85].map((w) => (
        <div key={w} className="flex gap-4">
          <div className="h-4 bg-gray-200 rounded w-24 flex-shrink-0" />
          <div className="h-4 bg-gray-200 rounded" style={{ width: `${w}%` }} />
        </div>
      ))}
    </div>
  );
}

// ── detail row ───────────────────────────────────────────────────────────────

function Field({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:gap-4">
      <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-36 flex-shrink-0 pt-0.5">
        {label}
      </dt>
      <dd className="text-sm text-gray-800 mt-0.5 sm:mt-0">{value}</dd>
    </div>
  );
}

// ── page ─────────────────────────────────────────────────────────────────────

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!id || !session?.user.accessToken) return;
    setLoading(true);
    try {
      const [jobRes, appRes] = await Promise.all([
        jobsApi.getJobById(id) as Promise<{ data: Job }>,
        applicationsApi.getJobApplications(session.user.accessToken, id) as Promise<{ data: Application[] }>,
      ]);
      setJob(jobRes.data);
      setApplications(appRes.data || []);
    } catch {
      setJob(null);
    } finally {
      setLoading(false);
    }
  }, [id, session]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
        <div className="h-8 bg-gray-200 rounded w-1/2 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PanelSkeleton />
          <PanelSkeleton />
        </div>
        <PanelSkeleton />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Job not found.</p>
        <Link href="/employer/my-jobs" className="text-[#1e3a5f] text-sm hover:underline mt-2 inline-block">
          ← Back to My Jobs
        </Link>
      </div>
    );
  }

  const salaryDisplay =
    job.salaryMin && job.salaryMax
      ? `${formatCurrency(job.salaryMin)} – ${formatCurrency(job.salaryMax)}`
      : formatCurrency(job.salary);

  const accepted = applications.filter(a => a.status === "accepted").length;
  const pending  = applications.filter(a => a.status === "pending").length;

  return (
    <div className="space-y-6">

      {/* ── Breadcrumb ──────────────────────────────────────────────── */}
      <Link
        href="/employer/my-jobs"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ChevronLeft size={16} />
        My Jobs
      </Link>

      {/* ── Title row ───────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
            <Badge variant={statusBadge(job.status)}>
              {job.status === "open" ? "Active" : job.status.charAt(0).toUpperCase() + job.status.slice(1)}
            </Badge>
          </div>
          <p className="text-sm text-gray-500">
            {[job.department, salaryDisplay + salaryLabel(job.salaryType), job.employmentType ? employmentLabels[job.employmentType] : null]
              .filter(Boolean).join(" · ")}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 flex-shrink-0">
          <Button variant="outline" size="sm" className="gap-1.5">
            <BarChart2 size={14} />
            View Progress
          </Button>
          <Link href={`/jobs/${job._id}`} target="_blank">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ExternalLink size={14} />
              Public View
            </Button>
          </Link>
          <Link href={`/employer/post-job?edit=${job._id}`}>
            <Button size="sm" className="gap-1.5">
              <Edit3 size={14} />
              Edit Job
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Two-column panels ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left — Job Posting Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-5 pb-3 border-b border-gray-100">
            Job Posting Details
          </h2>
          <dl className="space-y-3.5">
            <Field label="Job Title"           value={job.title} />
            <Field label="Department"          value={job.department} />
            <Field label="Job Role"            value={job.jobRole} />
            <Field label="Location / Area"     value={job.location} />
            <Field label="Salary / Budget"     value={salaryDisplay} />
            <Field label="Salary Type"         value={salaryLabel(job.salaryType).replace("/", "").trim() || job.salaryType} />
            <Field label="Salary Max"          value={job.salaryMax ? formatCurrency(job.salaryMax) : undefined} />
            <Field label="Duration"            value={job.projectDuration} />
            <Field label="Vacancies"           value={job.jobVacancy ? `${accepted} / ${job.jobVacancy} filled` : undefined} />
            <Field label="Posted"              value={formatDate(job.createdAt)} />
            <Field label="Deadline"            value="No deadline" />
            <Field label="Applications"        value={String(job.applicantCount)} />
            <Field label="Employment Type"     value={job.employmentType ? employmentLabels[job.employmentType] : undefined} />
            <Field label="Job Type"            value={job.jobType ? job.jobType.charAt(0).toUpperCase() + job.jobType.slice(1) : undefined} />
            <Field label="Work Shift"          value={job.workShift ? shiftLabels[job.workShift] : undefined} />
            <Field label="Company"             value={job.companyName} />
            <Field label="Address"             value={job.companyAddress} />
            <Field label="Posted By"           value={job.postedBy} />
          </dl>
        </div>

        {/* Right — Requirements & Responsibilities */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          <h2 className="text-sm font-semibold text-gray-900 pb-3 border-b border-gray-100">
            Responsibilities & Requirements
          </h2>

          {/* Description */}
          {job.description && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Description</p>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {stripHtml(job.description)}
              </p>
            </div>
          )}

          {/* Responsibilities */}
          {job.responsibilities && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Responsibilities</p>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {stripHtml(job.responsibilities)}
              </p>
            </div>
          )}

          {/* Candidate requirements */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {job.experienceLevel && (
              <div className="flex items-center gap-2 text-gray-600">
                <Clock size={14} className="text-gray-400 flex-shrink-0" />
                {expLabels[job.experienceLevel] ?? job.experienceLevel}
              </div>
            )}
            {job.education && job.education !== "any" && (
              <div className="flex items-center gap-2 text-gray-600">
                <GraduationCap size={14} className="text-gray-400 flex-shrink-0" />
                {educationLabels[job.education]}
              </div>
            )}
            {job.genderPreference && job.genderPreference !== "any" && (
              <div className="flex items-center gap-2 text-gray-600">
                <User size={14} className="text-gray-400 flex-shrink-0" />
                {job.genderPreference.charAt(0).toUpperCase() + job.genderPreference.slice(1)} preferred
              </div>
            )}
          </div>

          {/* Skills */}
          {job.skills.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {job.skills.map(skill => (
                  <span key={skill} className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs border border-gray-200">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* FAQs */}
          {job.faqs && job.faqs.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">FAQ</p>
              <div className="space-y-3">
                {job.faqs.map((faq, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-800 mb-1">Q: {faq.question}</p>
                    <p className="text-sm text-gray-600">A: {faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── All Applications panel ──────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">All Applications</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {applications.length} total · {accepted} accepted · {pending} pending
            </p>
          </div>
          <Link href={`/employer/applications?job=${job._id}`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Users size={13} />
              Manage applications →
            </Button>
          </Link>
        </div>

        {applications.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No applications yet.</p>
        ) : (
          <div className="space-y-3">
            {applications.slice(0, 3).map(app => {
              const applicant = typeof app.applicant === "object" ? app.applicant : null;
              return (
                <div key={app._id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <Avatar name={applicant?.name ?? "Applicant"} src={applicant?.avatar} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {applicant?.name ?? "Applicant"}
                    </p>
                    <p className="text-xs text-gray-400">{applicant?.email ?? ""}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge variant={
                      app.status === "accepted" ? "success" :
                      app.status === "rejected" ? "danger" : "warning"
                    }>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </Badge>
                    <span className="text-xs text-gray-400 hidden sm:block">
                      {formatRelativeTime(app.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
            {applications.length > 3 && (
              <p className="text-xs text-gray-400 text-center pt-1">
                +{applications.length - 3} more —{" "}
                <Link href={`/employer/applications?job=${job._id}`} className="text-[#1e3a5f] hover:underline">
                  view all
                </Link>
              </p>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
