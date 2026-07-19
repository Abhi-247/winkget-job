"use client";

import { use, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { jobsApi, applicationsApi } from "@/lib/api";
import { Job, Application, User } from "@/types";
import { PageSpinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { ApplyModal } from "@/components/jobseeker/ApplyModal";
import { AutoScrollCarousel } from "@/components/ui/AutoScrollCarousel";
import { useToast } from "@/components/ui/Toast";
import { useSavedJobs } from "@/lib/hooks";
import {
  formatCurrency,
  formatRelativeTime,
  formatDate,
  salaryLabel,
} from "@/lib/utils";
import {
  MapPin,
  Star,
  ChevronDown,
  ChevronRight,
  Briefcase,
  Clock,
  Users,
  Calendar,
  Building2,
  CheckCircle2,
  Share2,
  Copy,
  ExternalLink,
  Bookmark,
  DollarSign,
  Award,
  GraduationCap,
  Timer,
  Hash,
  MessageCircle,
  Link2,
  Globe,
} from "lucide-react";
import Link from "next/link";

// ── helpers ───────────────────────────────────────────────────────────────────

const EXP_LABELS: Record<string, string> = {
  fresher: "Fresher", "0-1": "0–1 Year", "1-2": "1–2 Years",
  "2-5": "2–5 Years", "5-10": "5–10 Years", "10+": "10+ Years",
};
const SHIFT_LABELS: Record<string, string> = {
  day: "Day Shift", night: "Night Shift", rotating: "Rotating", flexible: "Flexible",
};
const EMP_LABELS: Record<string, string> = {
  fullTime: "Full Time", partTime: "Part Time", contract: "Contract", internship: "Internship",
};

function stripHtml(html: string) {
  return html.replace(/<\/?p>/g, "").replace(/<[^>]*>/g, "").trim();
}

// ── FAQ accordion ─────────────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors text-left"
      >
        {q}
        <ChevronDown size={16} className={`flex-shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-4 pb-3 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
          {a}
        </div>
      )}
    </div>
  );
}

// ── field row for <dl> ────────────────────────────────────────────────────────

function Field({ label, value, icon: Icon }: { label: string; value?: string | number | null; icon?: React.ElementType }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between items-start py-2.5 border-b border-gray-100 gap-4">
      <dt className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide pt-0.5">
        {Icon && <Icon size={13} className="text-[#1e3a5f] flex-shrink-0" />}
        {label}
      </dt>
      <dd className="text-sm font-semibold text-gray-800 text-right break-words max-w-[60%]">{value}</dd>
    </div>
  );
}

// ── star row ──────────────────────────────────────────────────────────────────

function StarRow({ rating = 0, count = 0 }: { rating?: number; count?: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <Star key={s} size={13}
          className={s <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"} />
      ))}
      <span className="ml-1 text-xs text-gray-400">{rating} ({count} reviews)</span>
    </span>
  );
}

// ── related job mini-card ─────────────────────────────────────────────────────

function RelatedJobCard({ job }: { job: Job }) {
  const employer = typeof job.employer === "object" ? job.employer : null;
  const name = employer?.company || employer?.name || "Employer";
  const salary = job.salaryMax ?? job.salary;
  return (
    <Link href={`/jobs/${job._id}`}
      className="w-56 flex-shrink-0 bg-white rounded-xl border border-gray-200 p-3 hover:shadow-md hover:border-[#1e3a5f]/20 transition-all block">
      <div className="flex items-center gap-2 mb-2">
        <Avatar name={name} src={employer?.avatar} size="sm" />
        <div className="min-w-0">
          <p className="text-xs font-semibold text-gray-900 truncate">{job.title}</p>
          <p className="text-xs text-gray-400 truncate">{name}</p>
        </div>
      </div>
      <p className="text-xs font-bold text-[#1e3a5f] mb-2">
        {formatCurrency(salary)}{salaryLabel(job.salaryType)}
      </p>
      <div className="flex flex-wrap gap-1 mb-2">
        <span className="px-1.5 py-0.5 text-xs rounded bg-gray-100 text-gray-600 border border-gray-200 capitalize">
          {job.salaryType}
        </span>
        {job.jobType && (
          <span className="px-1.5 py-0.5 text-xs rounded bg-amber-50 text-amber-700 border border-amber-200 capitalize">
            {job.jobType}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-1">
        {job.skills.slice(0, 3).map(s => (
          <span key={s} className="px-1.5 py-0.5 text-xs rounded-full bg-gray-100 text-gray-500">
            {s}
          </span>
        ))}
      </div>
    </Link>
  );
}

// ── similar employer mini-card ────────────────────────────────────────────────

function SimilarEmployerCard({ employer, openJobs }: { employer: User; openJobs: number }) {
  const name = employer.company || employer.name;
  return (
    <Link href={`/employer-profile/${employer._id}`}
      className="w-56 flex-shrink-0 bg-white rounded-xl border border-gray-200 p-3 hover:shadow-md hover:border-[#1e3a5f]/20 transition-all block">
      <div className="flex items-center gap-2 mb-2">
        <Avatar name={name} src={employer.avatar} size="md" />
        <div className="min-w-0">
          <p className="text-xs font-semibold text-gray-900 truncate">{name}</p>
          <StarRow />
        </div>
      </div>
      <p className="text-xs text-gray-400 mb-1">{openJobs} open job{openJobs !== 1 ? "s" : ""}</p>
      {employer.bio && (
        <p className="text-xs text-gray-500 line-clamp-2">{employer.bio}</p>
      )}
    </Link>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

interface Props { params: Promise<{ id: string }> }

export default function JobDetailPage({ params }: Props) {
  const { id } = use(params);
  const { data: session } = useSession();
  const { success } = useToast();
  const { isSaved, toggleSave } = useSavedJobs();

  const [job, setJob] = useState<Job | null>(null);
  const [relatedJobs, setRelatedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    setLoading(true);
    jobsApi.getJobById(id)
      .then((jobRes) => {
        const j = (jobRes as { data: Job }).data;
        setJob(j);
        setLoading(false);

        // Fetch related jobs in the background matching category
        const queryParams: Record<string, string> = {};
        if (j.category) queryParams.category = j.category;
        return Promise.all([
          Promise.resolve(j),
          jobsApi.getJobs(queryParams) as Promise<{ data: Job[] }>
        ]);
      })
      .then(([j, allRes]) => {
        const all = allRes.data ?? [];
        setRelatedJobs(
          all.filter(r => r._id !== j._id).slice(0, 12)
        );
      })
      .catch((err) => {
        console.error(err);
        setJob(null);
        setLoading(false);
      });
  }, [id]);

  // Check if logged-in jobseeker has already applied to this job
  useEffect(() => {
    if (!session?.user.accessToken || session.user.role !== "jobseeker") return;
    applicationsApi.getMyApplications(session.user.accessToken)
      .then((res) => {
        const apps = (res as { data: Application[] }).data || [];
        setHasApplied(apps.some((a) => {
          const jobObj = typeof a.job === "object" ? a.job : null;
          return jobObj?._id === id;
        }));
      })
      .catch(() => {/* non-critical */});
  }, [id, session]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    success("Link copied!");
  };

  if (loading) return <PageSpinner />;
  if (!job) {
    return (
      <div className="py-16 text-center">
        <p className="text-gray-400">Job not found.</p>
        <Link href="/jobs" className="text-[#1e3a5f] hover:underline text-sm mt-2 inline-block">
          Browse all jobs
        </Link>
      </div>
    );
  }

  const employer = typeof job.employer === "object" ? job.employer : null;
  const companyName = employer?.company || employer?.name || "Employer";
  const salary = job.salaryMax ?? job.salary;
  const salaryDisplay = job.salaryMin && job.salaryMax
    ? `${formatCurrency(job.salaryMin)} – ${formatCurrency(job.salaryMax)}`
    : formatCurrency(salary);

  const role = session?.user?.role;

  // Deduplicated similar employers from related jobs
  const employerMap = new Map<string, { employer: User; openJobs: number }>();
  relatedJobs.forEach(r => {
    if (typeof r.employer === "object") {
      const e = r.employer as User;
      const key = e._id;
      if (key !== (employer?._id ?? "")) {
        const prev = employerMap.get(key);
        employerMap.set(key, { employer: e, openJobs: (prev?.openJobs ?? 0) + 1 });
      }
    }
  });
  const similarEmployers = Array.from(employerMap.values()).slice(0, 10);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-xs text-gray-500">
            <Link href="/" className="hover:text-gray-700">Home</Link>
            <ChevronRight size={12} />
            <Link href="/jobs" className="hover:text-gray-700">Find Work</Link>
            <ChevronRight size={12} />
            <span className="text-gray-900 font-medium truncate max-w-[200px]">{job.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">

          {/* ── LEFT PANEL ──────────────────────────────────────────── */}
          <div className="space-y-5 min-w-0">

            {/* Header card */}
            <div className="relative bg-white rounded-xl border border-gray-200 p-5 sm:p-6 overflow-hidden">
              {/* JOB corner tag */}
              <span className="absolute top-0 right-0 bg-[#1e3a5f] text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg tracking-wider">
                JOB
              </span>
              <div className="flex items-start gap-4 mb-4">
                <Avatar name={companyName} src={employer?.avatar} size="xl" className="flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight mb-1">
                    {job.title}
                  </h1>
                  <p className="text-sm text-gray-500 mb-3">
                    {companyName}
                    {(employer?.location || job.location) && (
                      <span className="inline-flex items-center gap-1 ml-2">
                        <MapPin size={12} />
                        {employer?.location || job.location}
                      </span>
                    )}
                  </p>
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {job.salaryType && (
                      <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium capitalize">
                        {job.salaryType === "annual" ? "Annual" :
                         job.salaryType === "monthly" ? "Monthly" :
                         job.salaryType === "hourly" ? "Hourly" :
                         job.salaryType === "fixed" ? "Fixed" : "Project"}
                      </span>
                    )}
                    {job.jobType && (
                      <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-700 text-xs font-medium capitalize">
                        {job.jobType}
                      </span>
                    )}
                    {job.employmentType && (
                      <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-[#1e3a5f] text-xs font-medium">
                        {EMP_LABELS[job.employmentType] ?? job.employmentType}
                      </span>
                    )}
                    {job.experienceLevel && (
                      <span className="px-2.5 py-1 rounded-lg bg-gray-900 text-white text-xs font-medium">
                        {EXP_LABELS[job.experienceLevel] ?? job.experienceLevel}
                      </span>
                    )}
                  </div>
                  <StarRow />
                </div>
              </div>

          {/* Mobile Actions (Apply / Save) - Hidden on desktop */}
          <div className="lg:hidden flex flex-col sm:flex-row gap-3 mb-4 pt-4 border-t border-gray-100">
            {role === "employer" ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 w-full">
                <p className="text-xs text-amber-800 font-medium mb-1">
                  Employer accounts cannot apply to jobs.
                </p>
                <Link href="/employer/post-job" className="text-xs text-[#1e3a5f] hover:underline font-medium">
                  Post a Job instead →
                </Link>
              </div>
            ) : !session ? (
              <Link href={`/sign-in?callbackUrl=/jobs/${id}`} className="w-full">
                <Button className="w-full">Sign in to Apply</Button>
              </Link>
            ) : hasApplied ? (
              <div className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-[#edf2f7] border border-[#1e3a5f]/20 text-[#152a45] font-medium text-sm">
                <CheckCircle2 size={16} />
                Application Submitted
              </div>
            ) : (
              <Button className="w-full bg-[#1e3a5f] hover:bg-[#152a45]" onClick={() => setApplyModalOpen(true)}>
                <Briefcase size={15} className="mr-2" />
                Apply Now
              </Button>
            )}

            {session && role !== "employer" && (
              <Button
                variant="outline"
                className={`w-full sm:w-auto gap-2 flex-shrink-0 ${isSaved(id) ? "border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100" : ""}`}
                onClick={() => toggleSave(id)}
              >
                <Bookmark size={15} className={isSaved(id) ? "fill-amber-500 text-amber-500" : ""} />
                {isSaved(id) ? "Saved" : "Save Job"}
              </Button>
            )}
          </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-0.5">Budget</p>
                  <p className="text-sm font-bold text-gray-900">{formatCurrency(salary)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-0.5">Duration</p>
                  <p className="text-sm font-semibold text-gray-900">{job.projectDuration ?? "Ongoing"}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-0.5">Applicants</p>
                  <p className="text-sm font-bold text-gray-900">{job.applicantCount}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-0.5">Posted</p>
                  <p className="text-sm font-semibold text-gray-900">{formatRelativeTime(job.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Job Posting Details */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Job Posting Details</h2>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                <Field icon={Briefcase}      label="Job Title"       value={job.title} />
                <Field icon={Globe}          label="Job Category"    value={job.category} />
                <Field icon={Building2}      label="Department"      value={job.department} />
                <Field icon={Hash}           label="Job Role"        value={job.jobRole} />
                <Field icon={MapPin}         label="Area / Location" value={employer?.location || job.location} />
                <Field icon={DollarSign}     label="Salary / Budget" value={salaryDisplay} />
                <Field icon={DollarSign}     label="Salary Type"     value={salaryLabel(job.salaryType).replace(/^\//, "").trim() || job.salaryType} />
                <Field icon={DollarSign}     label="Salary Max"      value={job.salaryMax ? formatCurrency(job.salaryMax) : undefined} />
                <Field icon={Building2}      label="Job Type"        value={job.jobType ? job.jobType.charAt(0).toUpperCase() + job.jobType.slice(1) : undefined} />
                <Field icon={Briefcase}      label="Employment"      value={job.employmentType ? EMP_LABELS[job.employmentType] : undefined} />
                <Field icon={Clock}          label="Work Shift"      value={job.workShift ? SHIFT_LABELS[job.workShift] : undefined} />
                <Field icon={Award}          label="Experience"      value={job.experienceLevel ? EXP_LABELS[job.experienceLevel] : undefined} />
                <Field icon={Timer}          label="Duration"        value={job.projectDuration} />
                <Field icon={Users}          label="Vacancies"       value={job.jobVacancy} />
                <Field icon={GraduationCap}  label="Education"       value={job.education ? job.education.charAt(0).toUpperCase() + job.education.slice(1) : undefined} />
                <Field icon={Calendar}       label="Posted"          value={formatDate(job.createdAt)} />
              </dl>
            </div>

            {/* Responsibilities */}
            {(job.responsibilities || job.description) && (
              <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Responsibilities</h2>
                <div className="space-y-2">
                  {stripHtml(job.responsibilities || job.description)
                    .split("\n")
                    .map(line => line.trim())
                    .filter(Boolean)
                    .map((line, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 size={15} className="text-[#1e3a5f] flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {line.replace(/^[•\-*]\s*/, "")}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Required Skills */}
            {job.skills.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map(skill => (
                    <span key={skill}
                      className="px-3 py-1 rounded-full bg-[#edf2f7] text-[#152a45] text-sm font-medium border border-[#1e3a5f]/20">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* FAQ */}
            {job.faqs && job.faqs.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>
                <div className="space-y-2">
                  {job.faqs.map((faq, i) => (
                    <FaqItem key={i} q={faq.question} a={faq.answer} />
                  ))}
                </div>
              </div>
            )}

            {/* Related Jobs carousel */}
            {relatedJobs.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
                <AutoScrollCarousel
                  title="Related Jobs"
                  subtitle={`${relatedJobs.length} jobs`}
                >
                  {relatedJobs.map(j => <RelatedJobCard key={j._id} job={j} />)}
                </AutoScrollCarousel>
              </div>
            )}

            {/* Similar Employers carousel */}
            {similarEmployers.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
                <AutoScrollCarousel
                  title="Similar Employers"
                  subtitle="Same industry or sector"
                >
                  {similarEmployers.map(({ employer: e, openJobs }) => (
                    <SimilarEmployerCard key={e._id} employer={e} openJobs={openJobs} />
                  ))}
                </AutoScrollCarousel>
              </div>
            )}
          </div>

          {/* ── RIGHT SIDEBAR ──────────────────────────────────────── */}
          <aside className="space-y-4 lg:sticky lg:top-6 lg:w-[360px] flex-shrink-0 w-full">

            {/* Apply card */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="mb-4">
                <p className="text-2xl font-bold text-gray-900 leading-tight">
                  {salaryDisplay}
                  <span className="text-sm font-normal text-gray-400 ml-1">
                    {salaryLabel(job.salaryType)}
                  </span>
                </p>
                <p className="text-xs text-gray-400 mt-0.5">Application deadline: Not specified</p>
              </div>

              {role === "employer" ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                  <p className="text-xs text-amber-800 font-medium mb-1">
                    Employer accounts cannot apply to jobs.
                  </p>
                  <Link href="/employer/post-job" className="text-xs text-[#1e3a5f] hover:underline font-medium">
                    Post a Job instead →
                  </Link>
                </div>
              ) : !session ? (
                <Link href={`/sign-in?callbackUrl=/jobs/${id}`}>
                  <Button className="w-full mb-3">Sign in to Apply</Button>
                </Link>
              ) : hasApplied ? (
                /* Already applied — show status */
                <div className="flex items-center gap-2 w-full mb-3 px-4 py-2.5 rounded-lg bg-[#edf2f7] border border-[#1e3a5f]/20 text-[#152a45] font-medium text-sm">
                  <CheckCircle2 size={16} />
                  Application Submitted
                </div>
              ) : (
                <Button className="w-full mb-3 bg-[#1e3a5f] hover:bg-[#152a45]" onClick={() => setApplyModalOpen(true)}>
                  <Briefcase size={15} className="mr-2" />
                  Apply Now
                </Button>
              )}

              {/* Save Job button — only for logged-in jobseekers */}
              {session && role !== "employer" && (
                <Button
                  variant="outline"
                  className={`w-full mb-3 gap-2 ${isSaved(id) ? "border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100" : ""}`}
                  onClick={() => toggleSave(id)}
                >
                  <Bookmark size={15} className={isSaved(id) ? "fill-amber-500 text-amber-500" : ""} />
                  {isSaved(id) ? "Saved" : "Save Job"}
                </Button>
              )}

              <hr className="border-gray-100 mb-4" />

              {/* Job meta */}
              <ul className="space-y-3 text-sm">
                {[
                  { icon: MapPin,      label: "Location",   value: employer?.location || job.location },
                  { icon: Building2,   label: "Department", value: job.department },
                  { icon: Briefcase,   label: "Job Role",   value: job.jobRole },
                  { icon: Clock,       label: "Duration",   value: job.projectDuration ?? "Ongoing" },
                  { icon: Star,        label: "Shift",      value: job.workShift ? SHIFT_LABELS[job.workShift] : undefined },
                  { icon: Users,       label: "Vacancies",  value: job.jobVacancy ? `${job.applicantCount} / ${job.jobVacancy} filled` : undefined },
                  { icon: Users,       label: "Applicants", value: String(job.applicantCount) },
                  { icon: Calendar,    label: "Deadline",   value: "Not specified" },
                ].map(({ icon: Icon, label, value }) =>
                  value ? (
                    <li key={label} className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 text-gray-500">
                        <Icon size={14} className="text-gray-400 flex-shrink-0" />
                        {label}
                      </span>
                      <span className="text-gray-800 font-medium text-right truncate max-w-[160px]">{value}</span>
                    </li>
                  ) : null
                )}
              </ul>
            </div>

            {/* About the Employer */}
            {employer && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">About the Employer</h3>
                <div className="flex items-start gap-3 mb-4">
                  <Avatar name={companyName} src={employer.avatar} size="md" className="flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{companyName}</p>
                    <StarRow />
                  </div>
                </div>
                <dl className="space-y-2.5 text-sm mb-4">
                  {employer.location && (
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Head office</dt>
                      <dd className="text-gray-800 font-medium text-right">{employer.location}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Hire rate</dt>
                    <dd className="text-gray-800 font-medium">71%</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Member since</dt>
                    <dd className="text-gray-800 font-medium">
                      {new Date(employer.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                    </dd>
                  </div>
                </dl>
                <Link href={`/employer-profile/${employer._id}`}>
                  <Button variant="outline" className="w-full gap-1.5" size="sm">
                    <ExternalLink size={13} />
                    View Employer Profile
                  </Button>
                </Link>
              </div>
            )}

            {/* Share This Job */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
                <Share2 size={14} className="text-[#1e3a5f]" />
                Share This Job
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Check out this job: ${job.title} — ${typeof window !== "undefined" ? window.location.href : ""}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs border-[#1e3a5f]/30 text-[#1e3a5f] hover:bg-[#edf2f7]">
                    <MessageCircle size={13} className="text-[#1e3a5f]" />
                    WhatsApp
                  </Button>
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs border-[#1e3a5f]/30 text-[#1e3a5f] hover:bg-[#edf2f7]">
                    <Share2 size={13} className="text-[#1e3a5f]" />
                    LinkedIn
                  </Button>
                </a>
                <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs border-[#1e3a5f]/30 text-[#1e3a5f] hover:bg-[#edf2f7]" onClick={copyLink}>
                  <Copy size={13} className="text-[#1e3a5f]" />
                  Copy
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Apply Modal */}
      {job && (
        <ApplyModal
          job={job}
          open={applyModalOpen}
          onClose={() => setApplyModalOpen(false)}
          onSuccess={() => {
            setApplyModalOpen(false);
            setHasApplied(true);
          }}
        />
      )}
    </div>
  );
}
