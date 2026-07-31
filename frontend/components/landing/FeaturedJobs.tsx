"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Sparkles, ArrowRight, ChevronLeft, ChevronRight, MapPin, CheckCircle2 } from "lucide-react";
import { jobsApi, applicationsApi } from "@/lib/api";
import { Job, Application, User } from "@/types";
import { ApplyModal } from "@/components/jobseeker/ApplyModal";
import { getInitials } from "@/lib/utils";

export function FeaturedJobCard({
  job,
  applied = false,
  onApply,
}: {
  job: Job;
  applied?: boolean;
  onApply?: (job: Job) => void;
}) {
  const router = useRouter();
  const employer = typeof job.employer === "object" ? (job.employer as User) : null;
  const companyName = job.companyName || employer?.company || employer?.name || "winkget Employer";
  const initials = getInitials(companyName);

  // Salary format
  let salaryText = "Negotiable";
  if (job.salaryMin || job.salaryMax) {
    const minStr = job.salaryMin ? `₹${job.salaryMin.toLocaleString("en-IN")}` : "";
    const maxStr = job.salaryMax ? `₹${job.salaryMax.toLocaleString("en-IN")}` : "";
    salaryText = job.salaryMin && job.salaryMax ? `${minStr} - ${maxStr}` : (minStr || maxStr);
    if (job.salaryType) {
      salaryText += `/${job.salaryType === "monthly" ? "mo" : job.salaryType === "hourly" ? "hr" : job.salaryType === "annual" ? "yr" : "project"}`;
    }
  }

  // Avatar bg
  const avatarBgs = ["bg-purple-600", "bg-indigo-600", "bg-blue-600", "bg-emerald-600", "bg-[#1e3a5f]"];
  const avatarBg = avatarBgs[companyName.length % avatarBgs.length];

  const workModeText = job.jobType || (job.location.toLowerCase().includes("remote") ? "Remote" : "Office");
  const jobTypeText = job.employmentType || "Full Time";

  return (
    <div
      onClick={() => router.push(`/jobs/${job._id}`)}
      className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-blue-200 transition-all duration-300 w-full flex-shrink-0 flex flex-col justify-between items-center text-center relative group cursor-pointer h-full"
    >
      <div className="w-full">
        {/* Top Company Avatar */}
        <div className="relative mb-3 mx-auto w-14 h-14">
          {employer?.avatar ? (
            <img
              src={employer.avatar}
              alt={companyName}
              className="w-14 h-14 rounded-2xl object-cover shadow-xs border-2 border-white"
            />
          ) : (
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-base shadow-xs border-2 border-white ${avatarBg}`}
            >
              {initials}
            </div>
          )}
          <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-xs">
            <CheckCircle2 size={9} className="text-white" />
          </span>
        </div>

        {/* Job Title */}
        <h3 className="font-semibold text-slate-900 text-sm sm:text-base leading-snug truncate group-hover:text-[#1e3a5f] transition-colors px-1">
          {job.title}
        </h3>

        {/* Company Name */}
        <p className="text-xs font-normal text-slate-500 mt-0.5 truncate max-w-[200px] mx-auto">
          {companyName}
        </p>

        {/* High Impact Salary Pill */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-bold text-xs mt-2.5 mb-2">
          {salaryText}
        </div>

        {/* Work Mode & Type Badges */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 my-2">
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 capitalize">
            {jobTypeText}
          </span>
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 text-blue-600 capitalize">
            {workModeText}
          </span>
          {job.experienceLevel && (
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-700 capitalize">
              {job.experienceLevel === "fresher" ? "Fresher" : `${job.experienceLevel} Yrs`}
            </span>
          )}
        </div>
      </div>

      {/* Footer Section */}
      <div className="w-full border-t border-slate-100 pt-3.5 mt-3 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 font-normal">
          <span className="flex items-center gap-1 truncate max-w-[130px]">
            <MapPin size={12} className="flex-shrink-0 text-slate-400" />
            <span className="truncate">{job.location || "India"}</span>
          </span>
          <span className="text-slate-400 text-[11px] flex-shrink-0">
            {job.createdAt ? new Date(job.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "Recent"}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onApply) {
              onApply(job);
            } else {
              router.push(`/jobs/${job._id}`);
            }
          }}
          disabled={applied}
          className={`w-full font-medium text-xs py-2.5 rounded-xl transition-all shadow-xs cursor-pointer border-0 flex items-center justify-center gap-1.5 ${
            applied
              ? "bg-slate-100 text-slate-500 cursor-not-allowed"
              : "bg-[#1e3a5f] hover:bg-[#152a45] text-white active:scale-95"
          }`}
        >
          {applied ? "Applied" : "Apply Now"}
        </button>
      </div>
    </div>
  );
}

export function FeaturedJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  const { data: session } = useSession();
  const router = useRouter();
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [applyJob, setApplyJob] = useState<Job | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function fetchApplied() {
      if (!session?.user.accessToken || session.user.role !== "jobseeker") return;
      try {
        const res = (await applicationsApi.getMyApplications(
          session.user.accessToken
        )) as { data: Application[] };
        const ids = new Set(
          (res.data || []).map((a) => {
            const jobObj = typeof a.job === "object" ? a.job : null;
            return jobObj?._id ?? "";
          }).filter(Boolean)
        );
        setAppliedIds(ids);
      } catch {
        // ignore
      }
    }
    fetchApplied();
  }, [session]);

  const handleApply = (job: Job, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session) {
      router.push(`/sign-in?callbackUrl=/jobs/${job._id}`);
      return;
    }
    if (session.user.role === "employer") return;
    setApplyJob(job);
  };

  const handleApplySuccess = (jobId: string) => {
    setAppliedIds((prev) => new Set([...prev, jobId]));
    setApplyJob(null);
  };

  useEffect(() => {
    async function fetchJobs() {
      try {
        const res = (await jobsApi.getJobs({ limit: "15" })) as { data: Job[] };
        if (res && res.data && res.data.length > 0) {
          setJobs(res.data);
        } else {
          setJobs([]);
        }
      } catch (err) {
        console.error("Failed to fetch featured jobs:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  // Filter logic
  const filteredJobs = jobs.filter((job) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "contract") return job.employmentType === "contract";
    if (activeFilter === "fullTime") return job.employmentType === "fullTime";
    if (activeFilter === "remote") return job.location.toLowerCase().includes("remote");
    return true;
  }).slice(0, 12);

  const startAutoScroll = () => {
    stopAutoScroll();
    timerRef.current = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 15) {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          const cardWidth = clientWidth >= 1024 ? clientWidth / 4 : (clientWidth >= 768 ? clientWidth / 2 : clientWidth);
          scrollRef.current.scrollTo({ left: scrollLeft + cardWidth, behavior: "smooth" });
        }
      }
    }, 4000);
  };

  const stopAutoScroll = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    if (!loading && filteredJobs.length > 0) {
      startAutoScroll();
    }
    return () => stopAutoScroll();
  }, [loading, jobs, activeFilter]);

  const handleScroll = (direction: "left" | "right") => {
    startAutoScroll();
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = direction === "left" ? -clientWidth * 0.8 : clientWidth * 0.8;
      scrollRef.current.scrollTo({ left: scrollLeft + scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section
      id="featured-jobs"
      className="py-14 sm:py-16 bg-[#faf8f5] relative overflow-hidden"
      style={{ fontFamily: "var(--font-poppins), sans-serif" }}
    >
      <div className="absolute top-[-10%] left-[-5%] w-[350px] h-[350px] bg-[#1e3a5f]/[0.02] rounded-full blur-[60px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[350px] h-[350px] bg-[#d4a017]/[0.02] rounded-full blur-[60px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Title & Filtering/Navigation Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="text-left space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-[#edf2f7] text-[#1e3a5f] px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
              <Sparkles size={12} className="fill-[#1e3a5f]/10" />
              <span>Job Feed</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0f172a] tracking-tight">
              Featured Job Openings
            </h2>
            <p className="text-slate-500 max-w-xl text-sm font-medium">
              Apply to curated high-paying opportunities listed by verified businesses.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Filtering Pills — rounded-full oval pills with website brand dark navy colors */}
            <div className="flex flex-wrap sm:flex-nowrap gap-1.5 sm:gap-2">
              {[
                { id: "all", label: "All" },
                { id: "contract", label: "Contract" },
                { id: "fullTime", label: "Full-Time" },
                { id: "remote", label: "Remote" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer border whitespace-nowrap ${
                    activeFilter === f.id
                      ? "bg-[#111c2c] text-white border-[#111c2c] shadow-sm"
                      : "bg-white text-[#1e3a5f] border-blue-200/80 hover:border-[#1e3a5f]/40 hover:bg-blue-50/50"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Navigation arrows — visible on sm+ in header */}
            <div className="hidden sm:flex items-center gap-2">
              <button 
                onClick={() => handleScroll("left")}
                className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:border-[#1e3a5f] hover:text-[#1e3a5f] transition-all duration-200 cursor-pointer shadow-sm"
                aria-label="Scroll left"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                onClick={() => handleScroll("right")}
                className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:border-[#1e3a5f] hover:text-[#1e3a5f] transition-all duration-200 cursor-pointer shadow-sm"
                aria-label="Scroll right"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Jobs Horizontal Scroller with overlay arrows on mobile */}
        <div className="relative">
          {/* Left arrow — mobile overlay */}
          <button 
            onClick={() => handleScroll("left")}
            className="sm:hidden absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 border border-slate-200 flex items-center justify-center text-slate-600 shadow-md backdrop-blur-sm cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Right arrow — mobile overlay */}
          <button 
            onClick={() => handleScroll("right")}
            className="sm:hidden absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 border border-slate-200 flex items-center justify-center text-slate-600 shadow-md backdrop-blur-sm cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight size={16} />
          </button>

          <div 
            ref={scrollRef}
            className="flex items-stretch gap-6 overflow-x-auto py-2 pb-4 scrollbar-hide snap-x snap-mandatory scroll-smooth px-2 -mx-2"
          >
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-3xl border border-slate-100 p-6 animate-pulse space-y-4 w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] flex-shrink-0 snap-start flex flex-col justify-between">
                  <div className="flex gap-3">
                    <div className="w-11 h-11 bg-slate-100 rounded-xl flex-shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-slate-100 rounded w-3/4" />
                      <div className="h-3 bg-slate-100 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-3 bg-slate-100 rounded w-full" />
                  <div className="h-3 bg-slate-100 rounded w-5/6" />
                  <div className="h-8 bg-slate-100 rounded w-full" />
                </div>
              ))
            : filteredJobs.map((job) => (
                <div
                  key={job._id}
                  className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] flex-shrink-0 snap-start flex flex-col"
                >
                  <FeaturedJobCard
                    job={job}
                    applied={appliedIds.has(job._id)}
                    onApply={(j) => handleApply(j, { preventDefault: () => {}, stopPropagation: () => {} } as React.MouseEvent)}
                  />
                </div>
              ))}
        </div>
        </div>

        {/* View all jobs footer link */}
        <div className="text-center mt-8">
          <Link href="/jobs">
            <button className="group border-2 border-[#1e3a5f] hover:bg-[#1e3a5f] text-[#1e3a5f] hover:text-white px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 mx-auto cursor-pointer">
              <span>View All Featured Jobs</span>
              <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </Link>
        </div>
      </div>

      {applyJob && (
        <ApplyModal
          job={applyJob}
          open={!!applyJob}
          onClose={() => setApplyJob(null)}
          onSuccess={() => handleApplySuccess(applyJob._id)}
        />
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
