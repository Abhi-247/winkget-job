"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { MapPin, Clock, Sparkles, ChevronLeft, ChevronRight, User, CheckCircle2 } from "lucide-react";
import { jobsApi, applicationsApi } from "@/lib/api";
import { Job, Application } from "@/types";
import { formatCurrency, formatRelativeTime, getInitials, salaryLabel } from "@/lib/utils";
import { ApplyModal } from "@/components/jobseeker/ApplyModal";

export function FeaturedJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { data: session } = useSession();
  const router = useRouter();
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [applyJob, setApplyJob] = useState<Job | null>(null);

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
        const res = (await jobsApi.getJobs({ limit: "8" })) as { data: Job[] };
        if (res && res.data && res.data.length > 0) {
          setJobs(res.data.slice(0, 8));
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

  const startAutoScroll = () => {
    stopAutoScroll();
    timerRef.current = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          const cardWidth = clientWidth > 768 ? clientWidth / 4 : 290;
          scrollRef.current.scrollTo({ left: scrollLeft + cardWidth, behavior: "smooth" });
        }
      }
    }, 4500);
  };

  const stopAutoScroll = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    if (!loading) {
      startAutoScroll();
    }
    return () => stopAutoScroll();
  }, [loading, jobs]);

  const handleScroll = (direction: "left" | "right") => {
    // Reset timer on manual scroll interaction
    startAutoScroll();

    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = direction === "left" ? -clientWidth * 0.8 : clientWidth * 0.8;
      scrollRef.current.scrollTo({ left: scrollLeft + scrollAmount, behavior: "smooth" });
    }
  };

  const getEmploymentTypeLabel = (type?: string) => {
    const map: Record<string, string> = {
      fullTime: "Full-Time",
      partTime: "Part-Time",
      contract: "Contract",
      internship: "Internship",
    };
    return type ? (map[type] || type) : "Contract";
  };

  const formatSalary = (job: Job) => {
    const min = job.salaryMin;
    const max = job.salaryMax;
    const type = job.salaryType;
    const fixed = job.salary;

    if (min !== undefined && max !== undefined && min > 0 && max > 0) {
      return `${formatCurrency(min)} - ${formatCurrency(max)}${salaryLabel(type)}`;
    }
    if (fixed !== undefined && fixed > 0) {
      return `${formatCurrency(fixed)}${salaryLabel(type)}`;
    }
    return "Negotiable";
  };

  return (
    <section
      id="featured-jobs"
      className="py-12 bg-white relative overflow-hidden"
      style={{ fontFamily: "var(--font-poppins), sans-serif" }}
    >
      {/* Decorative neon blurs */}
      <div
        className="absolute -top-32 left-1/4 w-96 h-96 bg-blue-500 rounded-full opacity-[0.03] blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-32 right-1/4 w-96 h-96 bg-[#d4a017] rounded-full opacity-[0.03] blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Header Block with Navigation Arrows */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
          <div className="text-left">
            <span className="inline-flex items-center gap-1.5 bg-amber-50 text-[#d4a017] px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase mb-2 border border-amber-100/60">
              <Sparkles size={12} className="fill-[#d4a017]/10" />
              Trending Opportunities
            </span>
            <h2 className="text-3xl font-extrabold text-[#0f172a] tracking-tight mb-1">
              Featured Job Openings
            </h2>
            <p className="text-slate-500 max-w-xl text-sm sm:text-base font-medium">
              Discover some of the highest-paying, verified projects and roles posted recently by premium employers.
            </p>
          </div>
          
          {/* Scroll Navigation Buttons */}
          <div className="flex items-center gap-2.5 self-start md:self-end">
            <button
              onClick={() => handleScroll("left")}
              className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:border-[#1e3a5f] hover:text-[#1e3a5f] transition-all duration-300 cursor-pointer shadow-sm"
              aria-label="Scroll left"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => handleScroll("right")}
              className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:border-[#1e3a5f] hover:text-[#1e3a5f] transition-all duration-300 cursor-pointer shadow-sm"
              aria-label="Scroll right"
            >
              <ChevronRight size={18} />
            </button>
            <Link href="/jobs" className="ml-2">
              <button className="border border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f]/5 px-6 py-2.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer">
                View All
              </button>
            </Link>
          </div>
        </div>

        {/* Horizontal Slider View */}
        <div 
          ref={scrollRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory scroll-smooth px-2 -mx-2"
        >
          {loading && jobs.length === 0
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-slate-50 rounded-3xl border border-slate-100 p-4 sm:p-6 animate-pulse space-y-4 w-[275px] xs:w-[300px] sm:w-[320px] lg:w-[calc(25%-18px)] flex-shrink-0">
                  <div className="flex justify-between items-center">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl" />
                    <div className="w-16 h-4 bg-slate-100 rounded-full" />
                  </div>
                  <div className="h-5 bg-slate-100 rounded w-5/6" />
                  <div className="h-4 bg-slate-100 rounded w-1/2" />
                  <div className="space-y-2 py-2">
                    <div className="h-3 bg-slate-100 rounded w-full" />
                    <div className="h-3 bg-slate-100 rounded w-4/5" />
                  </div>
                  <div className="flex gap-1.5">
                    <div className="w-10 h-5 bg-slate-100 rounded-md" />
                    <div className="w-14 h-5 bg-slate-100 rounded-md" />
                  </div>
                  <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                    <div className="w-20 h-4 bg-slate-100 rounded" />
                    <div className="w-8 h-8 bg-slate-100 rounded-full" />
                  </div>
                </div>
              ))
            : jobs.map((job) => {
                const company = typeof job.employer === "object" && job.employer !== null
                  ? job.employer.name || job.companyName || "Verified Partner"
                  : job.companyName || (typeof job.employer === "string" ? job.employer : "Verified Partner");
                
                const initials = getInitials(company);
                const isUrgent = job.employmentType === "contract"; // Map some criteria to urgent badge for visual flavor

                return (
                  <Link
                    key={job._id}
                    href={`/jobs/${job._id}`}
                    className="bg-white rounded-3xl border border-slate-100 p-4 sm:p-6 shadow-sm hover:shadow-[0_15px_35px_rgba(30,58,95,0.05)] transition-all duration-300 w-[275px] xs:w-[300px] sm:w-[320px] lg:w-[calc(25%-18px)] flex-shrink-0 flex flex-col justify-between group cursor-pointer text-left"
                  >
                    <div>
                      {/* 1. Badges Row */}
                      <div className="flex items-center gap-2 mb-4">
                        <span className="inline-flex items-center bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold border border-blue-100/50 uppercase tracking-wider">
                          {getEmploymentTypeLabel(job.employmentType)}
                        </span>
                        {isUrgent && (
                          <span className="inline-flex items-center bg-red-50 text-red-600 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold border border-red-100/50 uppercase tracking-wider">
                            Urgent
                          </span>
                        )}
                      </div>

                      {/* 2. Profile Row */}
                      <div className="flex items-start justify-between mb-4 gap-1">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-white font-extrabold text-sm sm:text-base flex-shrink-0 shadow-sm bg-gradient-to-tr from-[#1e3a5f] to-indigo-700"
                          >
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-[#0f172a] text-sm sm:text-base leading-snug truncate">{job.title}</h3>
                            <p className="text-[10px] sm:text-xs font-semibold text-slate-400 mt-0.5 truncate max-w-[100px] sm:max-w-[130px]">{company}</p>
                          </div>
                        </div>
                        <span className="text-[9px] sm:text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100/50 px-2 sm:px-2.5 py-0.5 rounded-lg flex-shrink-0">
                          Active
                        </span>
                      </div>

                      {/* 3. Location and Date */}
                      <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-500 mb-4 font-semibold">
                        <MapPin size={10} className="text-slate-400 flex-shrink-0" />
                        <span className="truncate max-w-[70px] sm:max-w-[90px]">{job.location}</span>
                        <span className="text-slate-300 font-normal">•</span>
                        <Clock size={10} className="text-slate-400 flex-shrink-0" />
                        <span className="truncate max-w-[80px]">{formatRelativeTime(job.createdAt)}</span>
                      </div>

                      {/* 4. Skills Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {job.skills.slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="px-2.5 py-1 rounded-lg bg-white border border-slate-100 text-[10px] font-bold text-slate-500"
                          >
                            {s}
                          </span>
                        ))}
                        {job.skills.length > 3 && (
                          <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-100 text-[10px] font-bold text-slate-500">
                            +{job.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <hr className="border-slate-100 mb-4" />

                      {/* 5. Footer Info & Action */}
                      <div className="flex flex-wrap items-baseline justify-between gap-y-1 mb-4 w-full">
                        <div className="flex items-baseline whitespace-nowrap">
                          <span className="text-base sm:text-lg font-bold text-[#0f172a]">
                            {formatSalary(job).split("/")[0]}
                          </span>
                          <span className="text-xs text-slate-400 ml-1">
                            {formatSalary(job).includes("/") ? "/" + formatSalary(job).split("/")[1] : ""}
                          </span>
                        </div>
                        <span className="text-[10px] sm:text-xs text-slate-400 font-bold flex items-center gap-1 flex-shrink-0">
                          <User size={10} className="flex-shrink-0" />
                          {job.applicantCount || 0} applicants
                        </span>
                      </div>

                      {appliedIds.has(job._id) ? (
                        <div className="w-full flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-[#edf2f7] border border-[#1e3a5f]/20 text-[#1e3a5f] text-xs font-bold select-none">
                          <CheckCircle2 size={13} />
                          Applied
                        </div>
                      ) : (
                        <button
                          onClick={(e) => handleApply(job, e)}
                          className="w-full bg-[#1e3a5f] hover:bg-[#12243d] text-white rounded-xl py-3 font-bold text-xs transition-all duration-300 cursor-pointer"
                        >
                          Apply Now
                        </button>
                      )}
                    </div>
                  </Link>
                );
              })}
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
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
    </section>
  );
}
