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
  X, Bookmark, Send, CheckCircle2, Search, LayoutGrid,
  Code, Palette, Megaphone, PenTool, BarChart2, TrendingUp,
  Headphones, Sparkles, ShieldCheck, ThumbsUp, ArrowRight,
} from "lucide-react";
import { formatCurrency, formatRelativeTime, salaryLabel, cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

// ── filter maps ───────────────────────────────────────────────────────────────

const EXP_MAP: Record<string, string[]> = {
  Entry: ["fresher", "0-1"],
  Mid: ["1-2", "2-5"],
  Senior: ["2-5", "5-10"],
  Expert: ["5-10", "10+"],
};

const JOBTYPE_MAP: Record<string, string> = {
  Hourly: "hourly",
  Monthly: "monthly",
  Fixed: "fixed",
  Project: "project",
  Weekly: "weekly",
};

import { JobCard } from "@/components/jobseeker/JobCard";
import { Pagination } from "@/components/ui/Pagination";

const PAGE_LIMIT = 12;

// ── page ──────────────────────────────────────────────────────────────────────

export default function BrowseJobsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { savedIds, toggleSave, isSaved } = useSavedJobs();
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(searchParams?.get("category") || "");

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [applyJob, setApplyJob] = useState<Job | null>(null);
  const [sortBy, setSortBy] = useState("latest");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showFloatingButton, setShowFloatingButton] = useState(false);

  // pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);

  const [budgetRange, setBudgetRange] = useState("");
  const [experienceLevels, setExperienceLevels] = useState<string[]>([]);
  const [jobTypes, setJobTypes] = useState<string[]>([]);
  const [workModes, setWorkModes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParams?.get("search") || "");
  const [locationFilter, setLocationFilter] = useState(searchParams?.get("location") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Sync category, search, location, and experience from URL query parameters
  useEffect(() => {
    const cat = searchParams?.get("category") || "";
    setSelectedCategory(cat);
    const s = searchParams?.get("search") || "";
    if (s) setSearchQuery(s);
    const loc = searchParams?.get("location") || "";
    if (loc) setLocationFilter(loc);
    const exp = searchParams?.get("experience") || "";
    if (exp) {
      if (exp.includes("Entry")) setExperienceLevels((prev) => Array.from(new Set([...prev, "Entry"])));
      else if (exp.includes("Intermediate") || exp.includes("Mid")) setExperienceLevels((prev) => Array.from(new Set([...prev, "Mid"])));
      else if (exp.includes("Senior")) setExperienceLevels((prev) => Array.from(new Set([...prev, "Senior"])));
      else if (exp.includes("Expert")) setExperienceLevels((prev) => Array.from(new Set([...prev, "Expert"])));
    }
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
        sort: sortBy,
      };
      if (selectedCategory) params.category = selectedCategory;
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (locationFilter.trim()) params.location = locationFilter.trim();
      if (budgetRange) {
        const [min, max] = budgetRange.split("-");
        if (min) params.salaryMin = min;
        if (max && max !== "5000+") params.salaryMax = max;
      }
      if (jobTypes.length > 0) {
        const mapped = jobTypes.map((t) => JOBTYPE_MAP[t]).filter(Boolean);
        if (mapped.length > 0) params.salaryType = mapped.join(",");
      }
      if (experienceLevels.length > 0) {
        params.experienceLevel = experienceLevels.join(",");
      }
      if (workModes.length > 0) {
        params.jobType = workModes.join(",");
      }

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
  }, [selectedCategory, debouncedSearch, locationFilter, budgetRange, jobTypes, experienceLevels, workModes, sortBy, page]);

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

  const hasFilters = budgetRange || experienceLevels.length > 0 || jobTypes.length > 0 || workModes.length > 0 || selectedCategory || locationFilter || !!searchQuery.trim();

  const clearFilters = () => {
    setBudgetRange(""); setExperienceLevels([]); setJobTypes([]); setWorkModes([]); setSelectedCategory(""); setSearchQuery(""); setLocationFilter("");
    setPage(1);
    const url = new URL(window.location.href);
    url.searchParams.delete("category");
    url.searchParams.delete("search");
    url.searchParams.delete("location");
    window.history.replaceState({}, "", url.toString());
  };

  // Reset to page 1 whenever any filter changes
  useEffect(() => { setPage(1); }, [budgetRange, experienceLevels, jobTypes, workModes, debouncedSearch, selectedCategory, locationFilter, sortBy]);

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

  // ── Database-backed jobs list ──────────────────────────────
  const filteredJobs = useMemo(() => {
    return jobs;
  }, [jobs]);


  // ── filter panel ─────────────────────────────────────────────────────────
  const FilterPanel = () => (
    <div>

      {/* Budget Range */}
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Budget Range</h4>
        <div className="space-y-2">
          {[
            { label: "Under ₹1,000", value: "0-1000" },
            { label: "₹1,000 – ₹2,500", value: "1000-2500" },
            { label: "₹2,500 – ₹5,000", value: "2500-5000" },
            { label: "₹5,000+", value: "5000+" },
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
      <section className="bg-slate-50/70 border-b border-slate-200/60 pt-5 pb-6 sm:pt-7 sm:pb-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

            {/* LEFT COLUMN: Text & Key Highlights */}
            <div className="lg:col-span-6 flex flex-col items-start pt-1">
              {/* Category Pill Tag */}
              <span className="text-[#16a34a] font-bold text-xs tracking-wider uppercase mb-2">
                FIND WORK
              </span>

              {/* Main Headline */}
              <h1 className="text-2xl sm:text-3xl lg:text-[2.25rem] xl:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.18] mb-2.5">
                Discover opportunities <br className="hidden sm:inline" />
                that <span className="text-[#16a34a]">match your skills</span>
              </h1>

              {/* Subtitle */}
              <p className="text-slate-600 text-xs sm:text-sm font-normal max-w-lg mb-4 leading-relaxed">
                Explore verified jobs from top companies, connect directly with clients, and start building your career today.
              </p>

              {/* Feature Highlights Cards */}
              <div className="grid grid-cols-3 gap-1.5 sm:flex sm:items-center sm:gap-2.5 mb-4">
                <div className="flex items-center justify-center gap-1 sm:gap-2 bg-white px-1.5 sm:px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
                  <span className="p-0.5 sm:p-1 rounded-md sm:rounded-lg bg-amber-50 text-amber-600 border border-amber-200/50 shrink-0">
                    <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </span>
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-800 truncate">Verified Companies</span>
                </div>
                <div className="flex items-center justify-center gap-1 sm:gap-2 bg-white px-1.5 sm:px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
                  <span className="p-0.5 sm:p-1 rounded-md sm:rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200/50 shrink-0">
                    <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </span>
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-800 truncate">Secure Payments</span>
                </div>
                <div className="flex items-center justify-center gap-1 sm:gap-2 bg-white px-1.5 sm:px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
                  <span className="p-0.5 sm:p-1 rounded-md sm:rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200/50 shrink-0">
                    <ThumbsUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </span>
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-800 truncate">100% Free</span>
                </div>
              </div>

              {/* Quick Stats Row (Centered layout with smaller description) */}
              <div className="grid grid-cols-3 gap-1 pt-3 border-t border-slate-200/70 w-full max-w-md">
                <div className="text-center flex flex-col items-center">
                  <p className="text-base sm:text-lg font-extrabold text-slate-900 leading-none">50K+</p>
                  <p className="text-[9px] sm:text-[11px] text-slate-500 font-medium mt-1 whitespace-nowrap">Live Jobs</p>
                </div>
                <div className="text-center flex flex-col items-center">
                  <p className="text-base sm:text-lg font-extrabold text-slate-900 leading-none">10K+</p>
                  <p className="text-[9px] sm:text-[11px] text-slate-500 font-medium mt-1 whitespace-nowrap">Top Employers</p>
                </div>
                <div className="text-center flex flex-col items-center">
                  <p className="text-base sm:text-lg font-extrabold text-slate-900 leading-none">₹0</p>
                  <p className="text-[9px] sm:text-[11px] text-slate-500 font-medium mt-1 whitespace-nowrap">Platform Fee</p>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Boy Illustration + Organic Mint Background + Floating Cards */}
            <div className="hidden lg:flex lg:col-span-6 relative items-center justify-end min-h-[320px] xl:min-h-[360px] lg:pr-2 xl:pr-6">
              {/* Mint Green Organic Shape Blob */}
              <div className="absolute w-[360px] xl:w-[420px] h-[300px] xl:h-[340px] bg-[#e6f4ea] rounded-[65%_35%_60%_40%/50%_60%_40%_50%] pointer-events-none -z-0 right-0 xl:right-4" />

              {/* Boy Image */}
              <div className="relative z-10 w-[340px] xl:w-[410px] h-auto flex items-center justify-end">
                <Image
                  src="/boybg.png"
                  alt="Browse Jobs Illustration"
                  width={480}
                  height={480}
                  priority
                  className="object-contain drop-shadow-md w-full h-auto"
                />
              </div>

              {/* Floating Card 1: Top Left - New opportunities (bridges middle gap) */}
              <div className="absolute top-4 left-0 xl:left-4 z-20 bg-white/95 backdrop-blur-md rounded-xl p-2.5 shadow-lg border border-slate-100/80 w-36 transition-transform duration-300 hover:scale-105">
                <p className="text-[10px] font-medium text-slate-500 mb-0.5">New opportunities</p>
                <p className="text-xs font-extrabold text-slate-900">5,000+ jobs</p>
                <div className="mt-1 h-4 w-full">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 100 25" fill="none">
                    <path
                      d="M0 20 Q 25 5, 50 16 T 100 5"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                </div>
              </div>

              {/* Floating Card 2: Top Right - Top Companies */}
              <div className="absolute top-0 right-0 xl:right-2 z-20 bg-white/95 backdrop-blur-md rounded-xl px-3 py-2 shadow-lg border border-slate-100/80 flex items-center gap-2 transition-transform duration-300 hover:scale-105">
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Briefcase size={15} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-900 leading-tight">Top Companies</p>
                  <p className="text-[9px] text-slate-500 font-medium">Hiring now</p>
                </div>
              </div>

              {/* Floating Card 3: Bottom Right - 10K+ Freelancers hired */}
              <div className="absolute bottom-2 right-2 xl:right-6 z-20 bg-[#fef9c3]/90 backdrop-blur-md rounded-xl px-3 py-2 shadow-lg border border-amber-200/60 flex items-center gap-2.5 transition-transform duration-300 hover:scale-105">
                <div className="flex -space-x-2 overflow-hidden shrink-0">
                  <div className="w-6 h-6 rounded-full ring-2 ring-white bg-slate-800 text-white font-bold text-[9px] flex items-center justify-center overflow-hidden">
                    <Image src="/avatar-man-1.png" alt="Avatar" width={24} height={24} className="object-cover" />
                  </div>
                  <div className="w-6 h-6 rounded-full ring-2 ring-white bg-amber-500 text-white font-bold text-[9px] flex items-center justify-center overflow-hidden">
                    <Image src="/avatar-woman-2.png" alt="Avatar" width={24} height={24} className="object-cover" />
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-extrabold text-slate-900 leading-tight">10K+</p>
                  <p className="text-[9px] text-slate-600 font-semibold">Freelancers hired</p>
                </div>
              </div>
            </div>

          </div>

          {/* SEARCH BAR CONTAINER */}
          <div className="bg-white rounded-2xl p-2.5 sm:p-2 border border-slate-200/90 shadow-xl shadow-slate-200/40 mt-5 sm:mt-6">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 sm:gap-3">

              {/* Search input */}
              <div className="flex-1 flex items-center gap-2.5 px-3 py-2.5 md:py-1.5 bg-slate-50/80 md:bg-transparent rounded-xl md:rounded-none">
                <Search className="text-slate-400 shrink-0" size={17} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
                  placeholder="Search by job title, skill, or company"
                  className="w-full text-slate-900 text-xs sm:text-sm placeholder:text-slate-400 bg-transparent border-none focus:outline-none font-normal"
                />
              </div>

              {/* Vertical divider */}
              <div className="hidden md:block w-[1px] h-7 bg-slate-200 shrink-0" />

              {/* Location & Category Selects (Side-by-side in 1 row on mobile) */}
              <div className="grid grid-cols-2 gap-2 md:contents">
                {/* Location Select */}
                <div className="relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2.5 md:py-1.5 md:w-48 shrink-0 bg-slate-50/80 md:bg-transparent rounded-xl md:rounded-none">
                  <MapPin className="text-slate-400 shrink-0" size={15} />
                  <select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full text-slate-700 text-xs sm:text-sm bg-transparent border-none focus:outline-none appearance-none cursor-pointer pr-5 font-medium truncate"
                  >
                    <option value="">Location</option>
                    <option value="Remote">Remote</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Bangalore">Bangalore</option>
                    <option value="Hyderabad">Hyderabad</option>
                  </select>
                  <ChevronDown className="absolute right-2 text-slate-400 pointer-events-none" size={14} />
                </div>

                {/* Vertical divider */}
                <div className="hidden md:block w-[1px] h-7 bg-slate-200 shrink-0" />

                {/* Category Select */}
                <div className="relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2.5 md:py-1.5 md:w-52 shrink-0 bg-slate-50/80 md:bg-transparent rounded-xl md:rounded-none">
                  <LayoutGrid className="text-slate-400 shrink-0" size={15} />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full text-slate-700 text-xs sm:text-sm bg-transparent border-none focus:outline-none appearance-none cursor-pointer pr-5 font-medium truncate"
                  >
                    <option value="">All Categories</option>
                    <option value="Development">Development</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Writing">Writing</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Sales">Sales</option>
                    <option value="Customer Support">Customer Support</option>
                  </select>
                  <ChevronDown className="absolute right-2 text-slate-400 pointer-events-none" size={14} />
                </div>
              </div>

              {/* Search Button */}
              <button
                onClick={() => setPage(1)}
                className="w-full md:w-auto bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs sm:text-sm font-bold px-7 py-3 rounded-xl transition-all duration-200 shadow-md cursor-pointer whitespace-nowrap active:scale-98 shrink-0 flex items-center justify-center gap-2"
              >
                <Search size={15} className="md:hidden" />
                <span>Search Jobs</span>
              </button>
            </div>
          </div>

          {/* CATEGORY PILLS BAR (Inside Hero Container for Perfect Vertical Alignment) */}
          <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto scrollbar-hide no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pt-4 pb-1">
            {/* Left "Browse by Category" Badge */}
            <div className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#e6f4ea] text-[#137333] font-bold text-xs sm:text-sm shrink-0 border border-[#ceead6]">
              <LayoutGrid size={15} />
              <span>Browse by Category</span>
            </div>

            {/* Category Filter Pills */}
            {[
              { label: "All", value: "", icon: Sparkles },
              { label: "Development", value: "Development", icon: Code },
              { label: "Design", value: "Design", icon: Palette },
              { label: "Marketing", value: "Marketing", icon: Megaphone },
              { label: "Writing", value: "Writing", icon: PenTool },
              { label: "Data Science", value: "Data Science", icon: BarChart2 },
              { label: "Sales", value: "Sales", icon: TrendingUp },
              { label: "Customer Support", value: "Customer Support", icon: Headphones },
            ].map((cat) => {
              const isActive =
                selectedCategory.toLowerCase() === cat.value.toLowerCase() ||
                (!selectedCategory && cat.value === "");
              const Icon = cat.icon;
              return (
                <button
                  key={cat.label}
                  onClick={() => {
                    setSelectedCategory(cat.value);
                    setPage(1);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 border ${isActive
                      ? "bg-[#e6f4ea] text-[#137333] border-[#ceead6] shadow-2xs font-bold"
                      : "bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                >
                  <Icon size={14} className={isActive ? "text-[#137333]" : "text-slate-400"} />
                  <span>{cat.label}</span>
                </button>
              );
            })}

            {/* View All Categories Link on Right */}
            <button
              onClick={() => {
                setSelectedCategory("");
                setPage(1);
              }}
              className="text-xs font-semibold text-[#16a34a] hover:text-[#15803d] flex items-center gap-1 shrink-0 ml-auto pl-2 hover:underline cursor-pointer"
            >
              <span>View all</span>
              <ArrowRight size={14} />
            </button>
          </div>

        </div>
      </section>

      {/* Mobile drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setFiltersOpen(false)} />
          <div className="relative ml-auto w-72 max-w-full h-full bg-gray-50 overflow-y-auto p-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-gray-900">Filters & Sort</span>
              <button onClick={() => setFiltersOpen(false)} className="p-1 rounded hover:bg-gray-200">
                <X size={18} />
              </button>
            </div>
            {/* Sort section */}
            <div className="mb-5 pb-5 border-b border-gray-200">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Sort By</h4>
              <div className="space-y-1">
                {[
                  { label: "Latest First", value: "latest" },
                  { label: "Highest Salary", value: "salary-high" },
                  { label: "Lowest Salary", value: "salary-low" },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setSortBy(opt.value)}
                    className={cn(
                      "w-full text-left py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-between",
                      sortBy === opt.value
                        ? "bg-[#1e3a5f]/8 text-[#1e3a5f] font-semibold"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <span>{opt.label}</span>
                    {sortBy === opt.value && <span className="w-2 h-2 rounded-full bg-[#1e3a5f]" />}
                  </button>
                ))}
              </div>
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
                {locationFilter && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-[#1e3a5f] rounded-full text-xs font-medium">
                    Location: {locationFilter}
                    <button onClick={() => setLocationFilter("")}><X size={11} /></button>
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
                <div className="flex flex-col gap-4">
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

      {/* Floating Filter FAB for Mobile on Scroll */}
      {showFloatingButton && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 md:hidden">
          <button
            onClick={() => setFiltersOpen(true)}
            className="flex items-center gap-3 bg-[#1e3a5f] hover:bg-[#2d5282] active:scale-95 text-white rounded-full shadow-2xl px-6 py-3 border border-white/10 backdrop-blur-sm transition-all duration-200"
          >
            <SlidersHorizontal size={16} />
            <span className="text-sm font-semibold tracking-wide">Filters & Sort</span>
            {hasFilters && (
              <span className="w-5 h-5 rounded-full bg-[#d4a017] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                !
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
