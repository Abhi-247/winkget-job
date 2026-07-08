"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { jobsApi, applicationsApi } from "@/lib/api";
import { Job, Application } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { ApplyModal } from "@/components/jobseeker/ApplyModal";
import { useSavedJobs } from "@/lib/hooks";
import {
  MapPin, Briefcase, Star, ChevronDown, SlidersHorizontal,
  X, Bookmark, Send, CheckCircle2,
} from "lucide-react";
import { formatCurrency, formatRelativeTime, salaryLabel, cn } from "@/lib/utils";
import Link from "next/link";

// ── filter maps ───────────────────────────────────────────────────────────────

const EXP_MAP: Record<string, string[]> = {
  Entry:  ["fresher", "0-1"],
  Mid:    ["1-2", "2-5"],
  Senior: ["2-5", "5-10"],
  Expert: ["5-10", "10+"],
};

const JOBTYPE_MAP: Record<string, string> = {
  Hourly:   "hourly",
  Monthly:  "monthly",
  Fixed:    "fixed",
  Project:  "project",
  Weekly:   "weekly",
};

// ── Job Card ──────────────────────────────────────────────────────────────────

interface JobCardProps {
  job: Job;
  applied: boolean;
  saved: boolean;
  onApply: (job: Job) => void;
  onToggleSave: (jobId: string) => void;
  userRole?: string;
}

function JobCard({ job, applied, saved, onApply, onToggleSave, userRole }: JobCardProps) {
  const employer      = typeof job.employer === "object" ? job.employer : null;
  const companyName   = employer?.company || employer?.name || "Employer";
  const location      = employer?.location || job.location || "Remote";
  const salary        = job.salaryMax ?? job.salary;
  const workModeBadge =
    job.jobType === "hybrid"                          ? "Hybrid"
    : job.location?.toLowerCase().includes("remote") ? "Remote"
    : job.jobType === "office"                        ? "On-site"
    : job.location;

  const isJobseeker = !userRole || userRole === "jobseeker";

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all group">
      {/* Clickable area → job detail */}
      <Link href={`/jobs/${job._id}`} className="block p-4 sm:p-5 pb-3">
        {/* Row 1: avatar + title/company/location + salary */}
        <div className="flex gap-3 mb-3">
          <Avatar name={companyName} src={employer?.avatar} size="md" className="flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-0.5 sm:gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 leading-tight truncate">{job.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{companyName}</p>
                <p className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                  <MapPin size={11} />{location}
                </p>
              </div>
              <div className="sm:text-right flex-shrink-0">
                <p className="font-bold text-gray-900 text-base leading-tight">
                  {formatCurrency(salary)}
                </p>
                <p className="text-xs text-gray-400 capitalize">
                  {salaryLabel(job.salaryType) || `/ ${job.salaryType}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: description */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">
          {job.responsibilities?.replace(/<[^>]*>/g, "") || job.description}
        </p>

        {/* Row 3: skills */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {job.skills.slice(0, 4).map(skill => (
            <span key={skill}
              className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full border border-gray-200">
              {skill}
            </span>
          ))}
          {job.skills.length > 4 && (
            <span className="px-2.5 py-0.5 bg-gray-100 text-gray-400 text-xs rounded-full border border-gray-200">
              +{job.skills.length - 4} more
            </span>
          )}
        </div>

        {/* Row 4: badges + rating + time */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 rounded border border-blue-300 text-[#1e3a5f] font-medium capitalize">
              {job.salaryType === "fixed"   ? "Fixed"   :
               job.salaryType === "monthly" ? "Monthly" :
               job.salaryType === "hourly"  ? "Hourly"  :
               job.salaryType === "annual"  ? "Annual"  : "Project"}
            </span>
            <span className="px-2 py-0.5 rounded border border-amber-300 text-amber-700 font-medium">
              {workModeBadge}
            </span>
            {job.projectDuration && (
              <span className="text-gray-400">{job.projectDuration}</span>
            )}
            <span className="flex items-center gap-0.5 text-gray-300">
              {[1,2,3,4,5].map(s => (
                <Star key={s} size={11} className="text-gray-300" />
              ))}
              <span className="ml-1 text-gray-400">0 (0)</span>
            </span>
          </div>
          <span className="text-gray-400">{formatRelativeTime(job.createdAt)}</span>
        </div>
      </Link>

      {/* Action bar — outside the Link so clicks don't navigate */}
      {isJobseeker && (
        <div
          className="px-4 sm:px-5 pb-4 pt-0 flex items-center gap-2 border-t border-gray-100 mt-0 pt-3"
          onClick={(e) => e.preventDefault()} // belt-and-suspenders
        >
          {applied ? (
            /* Already applied — status chip */
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#edf2f7] border border-[#1e3a5f]/20 text-[#1e3a5f] text-xs font-medium select-none">
              <CheckCircle2 size={13} />
              Applied
            </div>
          ) : (
            /* Apply button */
            <button
              onClick={() => onApply(job)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#1e3a5f] hover:bg-[#152a45] active:scale-95 text-white text-xs font-semibold transition-all"
            >
              <Send size={12} />
              Apply
            </button>
          )}

          {/* Save / Bookmark button */}
          <button
            onClick={() => onToggleSave(job._id)}
            aria-label={saved ? "Remove from saved jobs" : "Save job"}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all active:scale-95",
              saved
                ? "bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100"
                : "border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300"
            )}
          >
            <Bookmark size={13} className={saved ? "fill-amber-500 text-amber-500" : ""} />
            {saved ? "Saved" : "Save"}
          </button>
        </div>
      )}
    </div>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function BrowseJobsPage() {
  const { data: session }                  = useSession();
  const router                             = useRouter();
  const { savedIds, toggleSave, isSaved }  = useSavedJobs();

  const [jobs, setJobs]               = useState<Job[]>([]);
  const [loading, setLoading]         = useState(true);
  const [appliedIds, setAppliedIds]   = useState<Set<string>>(new Set());
  const [applyJob, setApplyJob]       = useState<Job | null>(null);
  const [sortBy, setSortBy]           = useState("latest");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [budgetRange, setBudgetRange]             = useState("");
  const [experienceLevels, setExperienceLevels]   = useState<string[]>([]);
  const [jobTypes, setJobTypes]                   = useState<string[]>([]);
  const [workModes, setWorkModes]                 = useState<string[]>([]);

  // Fetch jobs
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = (await jobsApi.getJobs({})) as { data: Job[] };
      setJobs(res.data || []);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user's existing applications to mark "Applied" status
  const fetchApplied = useCallback(async () => {
    if (!session?.user.accessToken || session.user.role !== "jobseeker") return;
    try {
      const res = (await applicationsApi.getMyApplications(
        session.user.accessToken
      )) as { data: Application[] };
      const ids = new Set(
        (res.data || []).map((a) => {
          const job = typeof a.job === "object" ? a.job : null;
          return job?._id ?? "";
        }).filter(Boolean)
      );
      setAppliedIds(ids);
    } catch {
      // non-critical — ignore
    }
  }, [session]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);
  useEffect(() => { fetchApplied(); }, [fetchApplied]);

  const toggle = (value: string, list: string[], setter: (v: string[]) => void) =>
    setter(list.includes(value) ? list.filter(v => v !== value) : [...list, value]);

  const hasFilters = budgetRange || experienceLevels.length > 0 || jobTypes.length > 0 || workModes.length > 0;

  const clearFilters = () => {
    setBudgetRange(""); setExperienceLevels([]); setJobTypes([]); setWorkModes([]);
  };

  // Handle apply click — redirect to sign-in if not logged in
  const handleApply = (job: Job) => {
    if (!session) {
      router.push(`/sign-in?callbackUrl=/jobs/${job._id}`);
      return;
    }
    if (session.user.role === "employer") return; // employers can't apply
    setApplyJob(job);
  };

  // Called on successful application — mark the job as applied locally
  const handleApplySuccess = (jobId: string) => {
    setAppliedIds((prev) => new Set([...prev, jobId]));
    setApplyJob(null);
  };

  // ── client-side filtering ─────────────────────────────────────────────────
  const filteredJobs = useMemo(() => {
    let list = [...jobs];

    if (sortBy === "salary-high") list.sort((a, b) => (b.salaryMax ?? b.salary) - (a.salaryMax ?? a.salary));
    else if (sortBy === "salary-low") list.sort((a, b) => (a.salaryMax ?? a.salary) - (b.salaryMax ?? b.salary));

    if (budgetRange) {
      list = list.filter(job => {
        const s = job.salaryMax ?? job.salary;
        if (budgetRange === "0-1000")    return s < 1000;
        if (budgetRange === "1000-2500") return s >= 1000 && s < 2500;
        if (budgetRange === "2500-5000") return s >= 2500 && s < 5000;
        if (budgetRange === "5000+")     return s >= 5000;
        return true;
      });
    }

    if (experienceLevels.length > 0) {
      const allowed = experienceLevels.flatMap(l => EXP_MAP[l] ?? []);
      list = list.filter(job => !job.experienceLevel || allowed.includes(job.experienceLevel));
    }

    if (jobTypes.length > 0) {
      const allowed = jobTypes.map(t => JOBTYPE_MAP[t]).filter(Boolean);
      list = list.filter(job => allowed.includes(job.salaryType));
    }

    if (workModes.length > 0) {
      list = list.filter(job => {
        if (workModes.includes("Remote")  && job.location?.toLowerCase().includes("remote")) return true;
        if (workModes.includes("On-site") && job.jobType === "office") return true;
        if (workModes.includes("Hybrid")  && job.jobType === "hybrid") return true;
        return false;
      });
    }

    return list;
  }, [jobs, sortBy, budgetRange, experienceLevels, jobTypes, workModes]);

  // ── filter panel ─────────────────────────────────────────────────────────
  const FilterPanel = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-gray-900">Filters</h3>
        {hasFilters && (
          <button onClick={clearFilters} className="text-xs text-[#1e3a5f] hover:underline">
            Clear all
          </button>
        )}
      </div>

      {/* Budget Range */}
      <div className="mb-5">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Budget Range</h4>
        <div className="space-y-2">
          {[
            { label: "Under ₹1,000",     value: "0-1000"    },
            { label: "₹1,000 – ₹2,500",  value: "1000-2500" },
            { label: "₹2,500 – ₹5,000",  value: "2500-5000" },
            { label: "₹5,000+",           value: "5000+"     },
          ].map(opt => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="budget" value={opt.value}
                checked={budgetRange === opt.value}
                onChange={e => setBudgetRange(e.target.value)}
                className="w-4 h-4 accent-[#1e3a5f]" />
              <span className="text-sm text-gray-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Experience */}
      <div className="mb-5">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Experience Level</h4>
        <div className="space-y-2">
          {["Entry", "Mid", "Senior", "Expert"].map(level => (
            <label key={level} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={experienceLevels.includes(level)}
                onChange={() => toggle(level, experienceLevels, setExperienceLevels)}
                className="w-4 h-4 accent-[#1e3a5f] rounded" />
              <span className="text-sm text-gray-700">{level}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Job Type */}
      <div className="mb-5">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Job Type</h4>
        <div className="space-y-2">
          {["Hourly", "Weekly", "Monthly", "Fixed", "Project"].map(type => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={jobTypes.includes(type)}
                onChange={() => toggle(type, jobTypes, setJobTypes)}
                className="w-4 h-4 accent-[#1e3a5f] rounded" />
              <span className="text-sm text-gray-700">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Work Mode */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Work Mode</h4>
        <div className="space-y-2">
          {["Remote", "On-site", "Hybrid"].map(mode => (
            <label key={mode} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={workModes.includes(mode)}
                onChange={() => toggle(mode, workModes, setWorkModes)}
                className="w-4 h-4 accent-[#1e3a5f] rounded" />
              <span className="text-sm text-gray-700">{mode}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Green Header */}
      <div className="bg-[#1e3a5f] text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm mb-3 opacity-90">
            <Link href="/" className="hover:underline">Home</Link>
            <span className="opacity-60">›</span>
            <span className="font-medium">Browse Jobs</span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight">Browse Jobs</h1>
              <p className="text-blue-100 text-sm mt-0.5">
                {hasFilters ? filteredJobs.length : jobs.length} jobs found
                {hasFilters && jobs.length !== filteredJobs.length && (
                  <span className="ml-2 opacity-70">(of {jobs.length} total)</span>
                )}
              </p>
            </div>
            <div className="relative flex items-center gap-2 flex-shrink-0">
              <span className="hidden sm:block text-sm text-gray-250">Sort by:</span>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="bg-white/10 hover:bg-white/15 text-white text-sm px-3 py-2 pr-8 rounded-lg border border-[#d4a017]/60 hover:border-[#d4a017] focus:outline-none focus:ring-2 focus:ring-[#d4a017] appearance-none cursor-pointer transition-all duration-200">
                <option value="latest" className="bg-[#1e3a5f] text-white">Latest First</option>
                <option value="salary-high" className="bg-[#1e3a5f] text-white">Highest Salary</option>
                <option value="salary-low" className="bg-[#1e3a5f] text-white">Lowest Salary</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/80" size={14} />
            </div>
          </div>
          <button onClick={() => setFiltersOpen(true)}
            className="mt-4 flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-[#d4a017]/60 hover:border-[#d4a017] text-white text-sm px-4 py-2 rounded-lg lg:hidden transition-all duration-200">
            <SlidersHorizontal size={15} />
            Filters
            {hasFilters && (
              <span className="bg-[#d4a017] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">!</span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setFiltersOpen(false)} />
          <div className="relative ml-auto w-72 max-w-full h-full bg-gray-50 overflow-y-auto p-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-gray-900">Filters</span>
              <button onClick={() => setFiltersOpen(false)} className="p-1 rounded hover:bg-gray-200">
                <X size={18} />
              </button>
            </div>
            <FilterPanel />
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6 items-start">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-64 xl:w-72 flex-shrink-0 sticky top-6">
            <FilterPanel />
          </aside>

          {/* Cards */}
          <main className="flex-1 min-w-0">
            {/* Active filter chips */}
            {hasFilters && (
              <div className="flex flex-wrap gap-2 mb-4">
                {budgetRange && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-[#1e3a5f] rounded-full text-xs font-medium">
                    Budget: {budgetRange}
                    <button onClick={() => setBudgetRange("")}><X size={11} /></button>
                  </span>
                )}
                {experienceLevels.map(l => (
                  <span key={l} className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-[#1e3a5f] rounded-full text-xs font-medium">
                    {l} <button onClick={() => toggle(l, experienceLevels, setExperienceLevels)}><X size={11} /></button>
                  </span>
                ))}
                {jobTypes.map(t => (
                  <span key={t} className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-[#1e3a5f] rounded-full text-xs font-medium">
                    {t} <button onClick={() => toggle(t, jobTypes, setJobTypes)}><X size={11} /></button>
                  </span>
                ))}
                {workModes.map(m => (
                  <span key={m} className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-[#1e3a5f] rounded-full text-xs font-medium">
                    {m} <button onClick={() => toggle(m, workModes, setWorkModes)}><X size={11} /></button>
                  </span>
                ))}
                <button onClick={clearFilters} className="text-xs text-gray-500 hover:text-gray-700 underline ml-1">
                  Clear all
                </button>
              </div>
            )}

            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                    <div className="flex gap-3 mb-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-2/3" />
                        <div className="h-3 bg-gray-200 rounded w-1/3" />
                      </div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-4/5" />
                  </div>
                ))}
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <Briefcase size={40} className="mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500">No jobs match your filters.</p>
                {hasFilters && (
                  <button onClick={clearFilters} className="text-[#1e3a5f] text-sm hover:underline mt-2">
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredJobs.map(job => (
                  <JobCard
                    key={job._id}
                    job={job}
                    applied={appliedIds.has(job._id)}
                    saved={isSaved(job._id)}
                    onApply={handleApply}
                    onToggleSave={toggleSave}
                    userRole={session?.user.role}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Apply modal */}
      {applyJob && (
        <ApplyModal
          job={applyJob}
          open={!!applyJob}
          onClose={() => setApplyJob(null)}
          onSuccess={() => handleApplySuccess(applyJob._id)}
        />
      )}
    </div>
  );
}
