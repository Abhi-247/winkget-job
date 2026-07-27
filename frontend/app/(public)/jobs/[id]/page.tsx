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
import { FeaturedJobCard } from "@/components/landing/FeaturedJobs";
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
  Sparkles,
  ArrowRight,
  Send,
  Tag,
  Building,
} from "lucide-react";
import { Linkedin } from "@/components/ui/BrandIcons";
import Link from "next/link";

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

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white shadow-xs">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-xs sm:text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-colors text-left"
      >
        <span>{q}</span>
        <ChevronDown size={15} className={`flex-shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-4 pb-4 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 bg-slate-50/40 font-normal">
          {a}
        </div>
      )}
    </div>
  );
}

function Field({ label, value, icon: Icon }: { label: string; value?: string | number | null; icon?: React.ElementType }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between items-start py-2.5 border-b border-slate-100 gap-4">
      <dt className="flex items-center gap-1.5 text-xs font-normal text-slate-500 uppercase tracking-wide pt-0.5">
        {Icon && <Icon size={13} className="text-slate-400 flex-shrink-0" />}
        {label}
      </dt>
      <dd className="text-xs sm:text-sm font-medium text-slate-800 text-right break-words max-w-[60%]">{value}</dd>
    </div>
  );
}

function StarRow({ rating = 5.0, count = 1 }: { rating?: number; count?: number }) {
  return (
    <span className="flex items-center gap-1 text-xs">
      <span className="text-amber-500 font-semibold flex items-center gap-0.5">
        ★ {rating.toFixed(1)}
      </span>
      <span className="text-slate-400 font-normal">({count} reviews)</span>
    </span>
  );
}

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

  const [activeTab, setActiveTab] = useState<"details" | "skills" | "company" | "faq">("details");
  const [checkedSkills, setCheckedSkills] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setLoading(true);
    jobsApi.getJobById(id)
      .then(async (res) => {
        const j = (res as { data: Job }).data;
        setJob(j);
        setLoading(false);

        try {
          const categoryRes = j?.category
            ? (await jobsApi.getJobs({ category: j.category }) as { data: Job[] })
            : { data: [] };
          const categoryJobs = (categoryRes.data || []).filter(r => r._id !== j._id);

          if (categoryJobs.length >= 4) {
            setRelatedJobs(categoryJobs.slice(0, 12));
          } else {
            const allRes = (await jobsApi.getJobs({}) as { data: Job[] });
            const allJobs = (allRes.data || []).filter(r => r._id !== j._id);
            const combined = Array.from(
              new Map([...categoryJobs, ...allJobs].map(item => [item._id, item])).values()
            );
            setRelatedJobs(combined.slice(0, 12));
          }
        } catch {}
      })
      .catch((err) => {
        console.error(err);
        setJob(null);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (!session?.user?.accessToken || session.user.role !== "jobseeker") return;
    applicationsApi.getMyApplications(session.user.accessToken)
      .then((res) => {
        const apps = (res as { data: Application[] }).data || [];
        setHasApplied(apps.some(a => {
          const jobObj = typeof a.job === "object" ? a.job : null;
          return jobObj?._id === id;
        }));
      })
      .catch(() => {});
  }, [id, session]);

  const copyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      success("Job link copied to clipboard!");
    }
  };

  const scrollToSection = (sectionId: "details" | "skills" | "company" | "faq") => {
    setActiveTab(sectionId);
    const el = document.getElementById(`section-${sectionId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (loading) return <PageSpinner />;
  if (!job) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-8">
        <div className="text-center bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-md">
          <Sparkles size={36} className="mx-auto text-slate-400 mb-3" />
          <h2 className="text-base font-semibold text-slate-900 mb-1">Job Not Found</h2>
          <p className="text-xs text-slate-500 mb-4 font-normal">The job listing you are looking for does not exist or has been removed.</p>
          <Link href="/jobs">
            <Button variant="outline" size="sm">Browse Jobs</Button>
          </Link>
        </div>
      </div>
    );
  }

  const employer = typeof job.employer === "object" ? (job.employer as User) : null;
  const companyName = job.companyName || employer?.company || employer?.name || "Employer";
  const employerId = employer?._id;
  const role = session?.user?.role;
  const salary = job.salaryMax ?? job.salary;
  const salaryDisplay = `${formatCurrency(salary)}${salaryLabel(job.salaryType)}`;

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16">
      {/* ── BREADCRUMB ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link href="/" className="hover:text-slate-800 transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link href="/jobs" className="hover:text-slate-800 transition-colors">Jobs</Link>
            <ChevronRight size={12} />
            <span className="text-slate-900 font-semibold truncate max-w-[200px]">{job.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">

          {/* ── TITLE CARD (order-1 on mobile, stays in left column on desktop) ───── */}
          <div className="order-1 lg:col-start-1 lg:row-start-1 space-y-6 min-w-0">

            {/* Top Header Card */}
            <div className="relative bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs overflow-hidden">
              <span className="absolute top-0 right-0 bg-slate-100 text-slate-600 border-b border-l border-slate-200/60 text-[10px] font-semibold px-3 py-1 rounded-bl-xl tracking-wider">
                JOB LISTING
              </span>

              <div className="flex items-start gap-4 mb-4">
                <Avatar name={companyName} src={employer?.avatar} size="xl" className="flex-shrink-0" />
                <div className="flex-1 min-w-0 pr-12">
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight mb-1">
                    {job.title}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mb-2.5 font-medium">
                    {companyName}
                    {(employer?.location || job.location) && (
                      <span className="inline-flex items-center gap-1 ml-2 text-slate-400 font-normal">
                        <MapPin size={12} />
                        {employer?.location || job.location}
                      </span>
                    )}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {job.salaryType && (
                      <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium capitalize border border-slate-200/60">
                        {job.salaryType}
                      </span>
                    )}
                    {job.jobType && (
                      <span className="px-2.5 py-0.5 rounded-md bg-indigo-50/70 text-indigo-700 text-xs font-medium capitalize border border-indigo-100">
                        {job.jobType}
                      </span>
                    )}
                    {job.employmentType && (
                      <span className="px-2.5 py-0.5 rounded-md bg-[#edf2f7] text-[#1e3a5f] text-xs font-medium border border-[#1e3a5f]/10">
                        {EMP_LABELS[job.employmentType] ?? job.employmentType}
                      </span>
                    )}
                    {job.experienceLevel && (
                      <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200/60">
                        {(job.experienceLevel && EXP_LABELS[job.experienceLevel]) ?? job.experienceLevel}
                      </span>
                    )}
                  </div>
                  <StarRow />
                </div>
              </div>

              {/* Sub-Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-xs text-slate-600 font-medium">
                <div className="text-left sm:text-center">
                  <p className="text-[11px] text-slate-400 font-normal">Salary / Budget</p>
                  <p className="text-xs sm:text-sm font-bold text-slate-900">{salaryDisplay}</p>
                </div>
                <div className="text-left sm:text-center">
                  <p className="text-[11px] text-slate-400 font-normal">Experience</p>
                  <p className="text-xs sm:text-sm font-semibold text-slate-900">{(job.experienceLevel && EXP_LABELS[job.experienceLevel]) ?? "Intermediate"}</p>
                </div>
                <div className="text-left sm:text-center">
                  <p className="text-[11px] text-slate-400 font-normal">Applicants</p>
                  <p className="text-xs sm:text-sm font-bold text-slate-900">{job.applicantCount || 0}</p>
                </div>
                <div className="text-left sm:text-center">
                  <p className="text-[11px] text-slate-400 font-normal">Posted Date</p>
                  <p className="text-xs sm:text-sm font-semibold text-slate-900">{formatDate(job.createdAt)}</p>
                </div>
              </div>

            </div>
          </div>

          {/* ── REST OF LEFT CONTENT (order-3 on mobile, stays in left column on desktop) ───── */}
          <div className="order-3 lg:order-none lg:col-start-1 lg:row-start-2 space-y-6 min-w-0">

            {/* Quick Section Anchor Tab Navigation */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-1.5 flex flex-wrap gap-1 shadow-xs sticky top-4 z-20">
              {[
                { id: "details", label: "Details", icon: Briefcase },
                { id: "skills", label: "Skills", icon: CheckCircle2 },
                { id: "company", label: "Company", icon: Building2 },
                { id: "faq", label: "FAQs", icon: MessageCircle },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => scrollToSection(tab.id as any)}
                    className={`flex-1 min-w-[90px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      active
                        ? "bg-[#1e3a5f] text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Icon size={14} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* SECTION 1: Specifications & Description */}
            <div id="section-details" className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <span className="w-1.5 h-4 bg-[#1e3a5f] rounded-full inline-block" /> Job Specifications
                </div>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                  <Field icon={Briefcase}      label="Job Title"       value={job.title} />
                  <Field icon={Globe}          label="Category"        value={job.category} />
                  <Field icon={Building2}      label="Department"      value={job.department} />
                  <Field icon={Hash}           label="Role"            value={job.jobRole} />
                  <Field icon={MapPin}         label="Location"        value={employer?.location || job.location} />
                  <Field icon={DollarSign}     label="Salary Range"    value={salaryDisplay} />
                  <Field icon={DollarSign}     label="Salary Type"     value={salaryLabel(job.salaryType).replace(/^\//, "").trim() || job.salaryType} />
                  <Field icon={Building2}      label="Job Type"        value={job.jobType ? job.jobType.charAt(0).toUpperCase() + job.jobType.slice(1) : undefined} />
                  <Field icon={Briefcase}      label="Employment"      value={job.employmentType ? EMP_LABELS[job.employmentType] : undefined} />
                  <Field icon={Clock}          label="Work Shift"      value={job.workShift ? SHIFT_LABELS[job.workShift] : undefined} />
                  <Field icon={Award}          label="Experience"      value={job.experienceLevel ? EXP_LABELS[job.experienceLevel] : undefined} />
                  <Field icon={Timer}          label="Duration"        value={job.projectDuration} />
                  <Field icon={Users}          label="Vacancies"       value={job.jobVacancy} />
                  <Field icon={GraduationCap}  label="Education"       value={job.education ? job.education.charAt(0).toUpperCase() + job.education.slice(1) : undefined} />
                  <Field icon={Calendar}       label="Posted Date"     value={formatDate(job.createdAt)} />
                </dl>
              </div>

              {job.description && (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <span className="w-1.5 h-4 bg-[#1e3a5f] rounded-full inline-block" /> Description
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal whitespace-pre-wrap">
                    {stripHtml(job.description)}
                  </p>
                </div>
              )}
            </div>

            {/* SECTION 2: Responsibilities & Skills */}
            <div id="section-skills" className="space-y-6">
              {job.responsibilities && (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3.5">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <span className="w-1.5 h-4 bg-[#1e3a5f] rounded-full inline-block" /> Responsibilities
                  </div>
                  <div className="space-y-2">
                    {stripHtml(job.responsibilities)
                      .split("\n")
                      .map(line => line.trim())
                      .filter(Boolean)
                      .map((line, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <CheckCircle2 size={15} className="text-[#1e3a5f] flex-shrink-0 mt-0.5" />
                          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                            {line.replace(/^[•\-*]\s*/, "")}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Interactive Skill Matcher */}
              {job.skills.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                        <span className="w-1.5 h-4 bg-[#1e3a5f] rounded-full inline-block" /> Required Skills & Matcher
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 font-normal">Select skills you possess to evaluate your profile suitability</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-[#1e3a5f]">
                        {Math.round((Object.values(checkedSkills).filter(Boolean).length / job.skills.length) * 100)}%
                      </span>
                      <span className="text-[11px] text-slate-400 block font-normal">Match Score</span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-[#1e3a5f] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(Object.values(checkedSkills).filter(Boolean).length / job.skills.length) * 100}%` }}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {job.skills.map((skill) => {
                      const checked = !!checkedSkills[skill];
                      return (
                        <button
                          key={skill}
                          onClick={() =>
                            setCheckedSkills((prev) => ({ ...prev, [skill]: !prev[skill] }))
                          }
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                            checked
                              ? "bg-[#1e3a5f] text-white border-[#1e3a5f] shadow-xs"
                              : "bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100"
                          }`}
                        >
                          <CheckCircle2 size={13} className={checked ? "text-emerald-300" : "text-slate-400"} />
                          <span>{skill}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 3: Company Info */}
            <div id="section-company" className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3.5">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <span className="w-1.5 h-4 bg-[#1e3a5f] rounded-full inline-block" /> About Employer / Company
              </div>
              <div className="flex items-start gap-4 p-4 bg-slate-50/60 rounded-xl border border-slate-200/60">
                <Avatar name={companyName} src={employer?.avatar} size="lg" className="flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">{companyName}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-normal">{employer?.bio || "Verified company hiring top talent on winkget."}</p>
                  {(employer as any)?.website && (
                    <a href={(employer as any).website} target="_blank" rel="noreferrer" className="text-xs text-[#1e3a5f] font-medium hover:underline mt-1.5 inline-flex items-center gap-1">
                      <Globe size={13} /> Visit Website →
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 4: FAQs */}
            <div id="section-faq" className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3.5">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <span className="w-1.5 h-4 bg-[#1e3a5f] rounded-full inline-block" /> Frequently Asked Questions
              </div>
              <div className="space-y-2.5">
                <FaqItem
                  q="What is the recruitment process for this role?"
                  a="Once you submit your application, the employer reviews your profile and portfolio. Selected candidates are invited for direct communication or interview."
                />
                <FaqItem
                  q="Is this job open for remote applicants?"
                  a={`Yes, this role specified location is ${employer?.location || job.location || "Remote"}. Please check specification guidelines above.`}
                />
                <FaqItem
                  q="How will payments or contract agreements be managed?"
                  a="Winkget ensures safe contract tracking with transparent milestone agreements and verified employer processing."
                />
              </div>
            </div>

            {/* Related Jobs Carousel */}
            {relatedJobs.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                <AutoScrollCarousel
                  title="Related Jobs & Positions"
                  subtitle={`${relatedJobs.length} positions`}
                >
                  {relatedJobs.map(j => (
                    <div key={j._id} className="w-72 sm:w-80 flex-shrink-0">
                      <FeaturedJobCard
                        job={j}
                        onApply={(targetJob) => {
                          setApplyModalOpen(true);
                        }}
                      />
                    </div>
                  ))}
                </AutoScrollCarousel>
              </div>
            )}
          </div>

          {/* ── RIGHT FIXED SIDEBAR (Centered Navy Header Box + White Apply Button) ───────── */}
          <aside className="order-2 lg:order-none lg:col-start-2 lg:row-start-1 lg:row-span-2 space-y-6 lg:sticky lg:top-6 flex-shrink-0 w-full">
            
            {/* 1. CENTERED NAVY HIGHLIGHTED APPLY SIDEBAR CARD */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              {/* Dark Navy Background Header Box (Centered) */}
              <div className="bg-gradient-to-br from-[#1e3a5f] via-[#162d4a] to-[#0f172a] text-white p-5 text-center flex flex-col items-center justify-center space-y-4">
                <div className="text-center space-y-1.5 flex flex-col items-center">
                  <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-baseline justify-center gap-1">
                    {formatCurrency(salary)}
                    <span className="text-xs font-normal text-slate-300">{salaryLabel(job.salaryType)}</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-950/60 px-3 py-0.5 rounded-full border border-emerald-500/30">
                    • Open for applications
                  </div>
                </div>

                {/* Action Buttons inside Navy Box */}
                <div className="space-y-2 pt-1 w-full">
                  {role === "employer" ? (
                    <div className="bg-white/10 border border-white/20 rounded-xl p-3 text-center">
                      <p className="text-xs text-slate-200 font-medium">Employer accounts cannot apply to jobs.</p>
                    </div>
                  ) : !session ? (
                    <Link href={`/sign-in?callbackUrl=/jobs/${id}`} className="block w-full">
                      <button className="w-full py-2.5 px-5 bg-white hover:bg-slate-100 text-[#1e3a5f] font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer border-0 transition-colors">
                        <span>Sign in to Apply</span>
                        <ArrowRight size={14} />
                      </button>
                    </Link>
                  ) : hasApplied ? (
                    <div className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs">
                      <CheckCircle2 size={16} />
                      Application Submitted
                    </div>
                  ) : (
                    <Button
                      onClick={() => setApplyModalOpen(true)}
                      className="w-full py-2.5 bg-white hover:bg-slate-100 text-[#1e3a5f] font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer border-0 transition-colors"
                    >
                      <Briefcase size={15} /> Apply Now
                    </Button>
                  )}

                  {session && role !== "employer" && (
                    <Button
                      variant="outline"
                      className={`w-full py-2 text-xs font-medium rounded-xl gap-2 border-white/20 text-white hover:bg-white/10 ${isSaved(id) ? "bg-white/20" : ""}`}
                      onClick={() => toggleSave(id)}
                    >
                      <Bookmark size={14} className={isSaved(id) ? "fill-white text-white" : ""} />
                      {isSaved(id) ? "Saved Job" : "Save Job"}
                    </Button>
                  )}
                </div>
              </div>

              {/* 2. OVERVIEW SUMMARY LIST IN SIDEBAR */}
              <div className="p-5 space-y-3 text-xs">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 pb-1 border-b border-slate-100 uppercase tracking-wider">
                  <span className="w-1.5 h-3.5 bg-[#1e3a5f] rounded-full inline-block" /> Job Overview
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="flex items-center gap-2 text-slate-400 font-normal"><Award size={14} /> Experience</span>
                  <span className="font-semibold text-slate-900">{(job.experienceLevel && EXP_LABELS[job.experienceLevel]) ?? "Intermediate"}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="flex items-center gap-2 text-slate-400 font-normal"><Tag size={14} /> Job Type</span>
                  <span className="font-semibold text-slate-900 capitalize">{job.jobType || "Full Time"}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="flex items-center gap-2 text-slate-400 font-normal"><MapPin size={14} /> Location</span>
                  <span className="font-semibold text-slate-900">{employer?.location || job.location || "Remote"}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="flex items-center gap-2 text-slate-400 font-normal"><Users size={14} /> Vacancies</span>
                  <span className="font-semibold text-slate-900">{job.jobVacancy || 1}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="flex items-center gap-2 text-slate-400 font-normal"><Clock size={14} /> Work Shift</span>
                  <span className="font-semibold text-slate-900">{(job.workShift && SHIFT_LABELS[job.workShift]) || "Flexible"}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="flex items-center gap-2 text-slate-400 font-normal"><Calendar size={14} /> Posted</span>
                  <span className="font-semibold text-slate-900">{formatDate(job.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* 3. EMPLOYER PROFILE CARD IN SIDEBAR */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3.5">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <span className="w-1.5 h-4 bg-[#1e3a5f] rounded-full inline-block" /> Employer Profile
              </div>
              <div className="flex items-start gap-3">
                <Avatar name={companyName} src={employer?.avatar} size="lg" className="flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{companyName}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 font-normal">{employer?.bio || "Verified employer listing hiring on winkget."}</p>
                  <div className="flex items-center gap-2 mt-1.5 text-xs">
                    <span className="text-amber-500 font-semibold">★ 5.0</span>
                    <span className="text-slate-400 font-normal">• {employer?.location || job.location || "India"}</span>
                  </div>
                </div>
              </div>
              {employerId ? (
                <Link href={`/employer-profile/${employerId}`} className="block w-full">
                  <Button variant="outline" className="w-full py-2 text-xs font-medium rounded-xl border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-1.5">
                    <Building size={13} /> View Employer Profile
                  </Button>
                </Link>
              ) : (
                <Button variant="outline" disabled className="w-full py-2 text-xs font-medium rounded-xl border-slate-200 text-slate-400">
                  <Building size={13} /> Employer Profile Verified
                </Button>
              )}
            </div>

            {/* 4. SHARE JOB CARD */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <span className="w-1.5 h-4 bg-[#1e3a5f] rounded-full inline-block" /> Share Job
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`, "_blank")}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Linkedin size={13} className="text-blue-600" /> LinkedIn
                </button>
                <button
                  type="button"
                  onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this job opportunity: ${typeof window !== "undefined" ? window.location.href : ""}`)}`, "_blank")}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Send size={13} className="text-emerald-600" /> WhatsApp
                </button>
                <button
                  type="button"
                  onClick={copyLink}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Copy size={13} /> Copy Link
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Apply Modal */}
      {applyModalOpen && (
        <ApplyModal
          open={applyModalOpen}
          job={job}
          onClose={() => setApplyModalOpen(false)}
          onSuccess={() => {
            setHasApplied(true);
            setApplyModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
