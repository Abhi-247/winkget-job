"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { jobsApi, applicationsApi } from "@/lib/api";
import { Job, Application } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { ApplyModal } from "@/components/jobseeker/ApplyModal";
import { useSavedJobs } from "@/lib/hooks";
import {
  MapPin, Briefcase, Star, ChevronDown, SlidersHorizontal,
  X, Bookmark, Send, CheckCircle2, Search,
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

import { JobCard } from "@/components/jobseeker/JobCard";
import { Pagination } from "@/components/ui/Pagination";

const PAGE_LIMIT = 12;

// ── page ──────────────────────────────────────────────────────────────────────

export default function BrowseJobsPage() {
  const { data: session }                  = useSession();
  const router                             = useRouter();
  const { savedIds, toggleSave, isSaved }  = useSavedJobs();
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(searchParams?.get("category") || "");

  const [jobs, setJobs]               = useState<Job[]>([]);
  const [loading, setLoading]         = useState(true);
  const [appliedIds, setAppliedIds]   = useState<Set<string>>(new Set());
  const [applyJob, setApplyJob]       = useState<Job | null>(null);
  const [sortBy, setSortBy]           = useState("latest");
  const [filtersOpen, setFiltersOpen] = useState(false);
  // pagination
  const [page, setPage]         = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs]   = useState(0);

   const [budgetRange, setBudgetRange]             = useState("");
  const [experienceLevels, setExperienceLevels]   = useState<string[]>([]);
  const [jobTypes, setJobTypes]                   = useState<string[]>([]);
  const [workModes, setWorkModes]                 = useState<string[]>([]);
  const [searchQuery, setSearchQuery]             = useState("");
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const [sortOpen, setSortOpen]                   = useState(false);

  // Sync category from URL query parameters
  useEffect(() => {
    const cat = searchParams?.get("category") || "";
    setSelectedCategory(cat);
  }, [searchParams]);

  // Scroll handler for mobile floating buttons
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 150) {
        setShowFloatingButton(true);
      } else {
        setShowFloatingButton(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch jobs
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: String(page),
        limit: String(PAGE_LIMIT),
      };
      if (selectedCategory) params.category = selectedCategory;
      const res = (await jobsApi.getJobs(params)) as {
        data: Job[];
        pagination: { page: number; pages: number; total: number };
      };
      setJobs(res.data || []);
      if (res.pagination) {
        setTotalPages(res.pagination.pages);
        setTotalJobs(res.pagination.total);
      }
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, page]);

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

  const hasFilters = budgetRange || experienceLevels.length > 0 || jobTypes.length > 0 || workModes.length > 0 || selectedCategory || !!searchQuery.trim();

  const clearFilters = () => {
    setBudgetRange(""); setExperienceLevels([]); setJobTypes([]); setWorkModes([]); setSelectedCategory(""); setSearchQuery("");
    setPage(1);
    const url = new URL(window.location.href);
    url.searchParams.delete("category");
    window.history.replaceState({}, "", url.toString());
  };

  // Reset to page 1 whenever any client-side filter changes
  useEffect(() => { setPage(1); }, [budgetRange, experienceLevels, jobTypes, workModes, searchQuery, selectedCategory]);

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

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(job =>
        job.title?.toLowerCase().includes(q) ||
        job.skills?.some(s => s.toLowerCase().includes(q)) ||
        (typeof job.employer === "object" &&
          (job.employer as any)?.company?.toLowerCase().includes(q))
      );
    }

    return list;
  }, [jobs, sortBy, budgetRange, experienceLevels, jobTypes, workModes, searchQuery]);

  // ── filter panel ─────────────────────────────────────────────────────────
  const FilterPanel = () => (
    <div>

      {/* Budget Range */}
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Budget Range</h4>
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
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Experience Level</h4>
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
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Job Type</h4>
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
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Work Mode</h4>
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
      {/* Hero Header */}
      <div className="bg-[#1e3a5f] text-white py-16 sm:py-20 relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/5 rounded-full pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-white/5 rounded-full pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-5 text-white/70">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>›</span>
            <span className="text-white font-medium">Browse Jobs</span>
          </div>

          {/* Title row + Sort */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight whitespace-nowrap">Browse Jobs</h1>
              <p className="hidden sm:flex text-white/70 text-sm mt-1.5 items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#d4a017]" />
                {hasFilters
                  ? `${filteredJobs.length} jobs match filters`
                  : `Showing ${Math.min((page - 1) * PAGE_LIMIT + 1, totalJobs)}–${Math.min(page * PAGE_LIMIT, totalJobs)} of ${totalJobs} jobs`
                }
              </p>
            </div>
            <div className="relative flex items-center gap-2 flex-shrink-0">
              <span className="hidden sm:block text-sm text-white/70">Sort by:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="bg-white/10 hover:bg-white/15 text-white text-sm px-3 py-2 pr-8 rounded-lg border border-[#d4a017]/60 hover:border-[#d4a017] focus:outline-none focus:ring-2 focus:ring-[#d4a017] appearance-none cursor-pointer transition-all duration-200"
              >
                <option value="latest"      className="bg-[#1e3a5f]">Latest First</option>
                <option value="salary-high" className="bg-[#1e3a5f]">Highest Salary</option>
                <option value="salary-low"  className="bg-[#1e3a5f]">Lowest Salary</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/80" size={14} />
            </div>
          </div>

          {/* Search bar - Desktop version */}
          <div className="hidden md:flex gap-2 max-w-2xl mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && e.preventDefault()}
                placeholder="Search by job title, skill, or company..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white text-gray-900 text-sm placeholder:text-gray-400 border border-transparent focus:outline-none focus:ring-2 focus:ring-[#d4a017]"
              />
            </div>
            <button
              onClick={() => {}}
              className="px-5 py-2.5 bg-[#d4a017] hover:bg-[#b8860b] text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
            >
              Search
            </button>
          </div>

          {/* Search bar - Mobile version (Pill layout + Circular filter button next to it) */}
          <div className="flex items-center gap-2 md:hidden mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white text-gray-900 text-sm border border-transparent focus:outline-none focus:ring-2 focus:ring-[#d4a017]"
              />
            </div>
            <button
              onClick={() => setFiltersOpen(true)}
              className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 flex-shrink-0 transition-colors shadow-sm"
            >
              <SlidersHorizontal size={16} />
            </button>
          </div>

          {/* Popular chips - Hidden on mobile view */}
          <div className="hidden md:flex flex-wrap items-center gap-2">
            <span className="text-white/60 text-xs font-medium mr-1">Popular:</span>
            {["React Developer", "UI/UX Design", "Python Dev", "Data Science", "Content Writing"].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(prev => prev === cat ? "" : cat)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium border transition-all",
                  selectedCategory === cat
                    ? "bg-[#d4a017] border-[#d4a017] text-white"
                    : "bg-white/10 border-white/20 text-white/80 hover:bg-white/20 hover:border-white/40"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
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
          <aside className="hidden lg:block w-64 xl:w-72 flex-shrink-0 sticky top-[calc(var(--navbar-height)+1.5rem)] self-start max-h-[calc(100vh-var(--navbar-height)-3rem)] overflow-y-auto">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2d5282] p-4 text-white">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-sm">Filters</h3>
                  {hasFilters && (
                    <button onClick={clearFilters} className="text-xs text-[#d4a017] hover:text-[#f5c842] font-medium transition-colors">
                      Clear all
                    </button>
                  )}
                </div>
                <p className="text-xs text-white/60">Refine your search</p>
              </div>
              <div className="p-4">
                <FilterPanel />
              </div>
            </div>
          </aside>

          {/* Cards */}
          <main className="flex-1 min-w-0">
            {/* Active filter chips */}
            {hasFilters && (
              <div className="flex flex-wrap gap-2 mb-4">
                {searchQuery.trim() && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-[#1e3a5f] rounded-full text-xs font-medium">
                    "{searchQuery}"
                    <button onClick={() => setSearchQuery("")}><X size={11} /></button>
                  </span>
                )}
                {selectedCategory && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-[#1e3a5f] rounded-full text-xs font-medium">
                    Category: {selectedCategory}
                    <button onClick={() => {
                      setSelectedCategory("");
                      const url = new URL(window.location.href);
                      url.searchParams.delete("category");
                      window.history.replaceState({}, "", url.toString());
                    }}><X size={11} /></button>
                  </span>
                )}
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
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Pagination
                  page={page}
                  pages={totalPages}
                  total={totalJobs}
                  limit={PAGE_LIMIT}
                  onPageChange={n => { setPage(n); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                />
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

      {/* Floating Filter | Sort FAB for Mobile on Scroll */}
      {showFloatingButton && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 md:hidden transition-all duration-300 transform translate-y-0">
          <div className="bg-[#111c2c] hover:bg-[#1a2d44] text-white rounded-full shadow-2xl flex items-center divide-x divide-gray-700 px-6 py-3 border border-white/10 backdrop-blur-sm">
            <button
              onClick={() => setFiltersOpen(true)}
              className="flex items-center gap-2 pr-4 text-xs font-semibold uppercase tracking-wider text-gray-200 hover:text-white"
            >
              <SlidersHorizontal size={14} />
              Filter
            </button>
            <button
              onClick={() => setSortOpen(true)}
              className="flex items-center gap-2 pl-4 text-xs font-semibold uppercase tracking-wider text-gray-200 hover:text-white"
            >
              <ChevronDown size={14} className="rotate-180" />
              Sort
            </button>
          </div>
        </div>
      )}

      {/* Mobile Sort Bottom Modal */}
      {sortOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm md:hidden animate-fade-in" onClick={() => setSortOpen(false)}>
          <div className="bg-white w-full rounded-t-3xl p-6 space-y-4 max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-base">Sort By</h3>
              <button onClick={() => setSortOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-1">
              {[
                { label: "Latest First", value: "latest" },
                { label: "Highest Salary", value: "salary-high" },
                { label: "Lowest Salary", value: "salary-low" }
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setSortBy(opt.value);
                    setSortOpen(false);
                  }}
                  className={cn(
                    "w-full text-left py-3 px-4 rounded-xl text-sm font-medium transition-colors flex items-center justify-between",
                    sortBy === opt.value
                      ? "bg-[#1e3a5f]/5 text-[#1e3a5f] font-semibold"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <span>{opt.label}</span>
                  {sortBy === opt.value && <span className="w-1.5 h-1.5 rounded-full bg-[#1e3a5f]" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
