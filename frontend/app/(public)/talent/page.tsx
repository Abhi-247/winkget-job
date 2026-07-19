"use client";

import {
  useState, useEffect, useCallback, useMemo,
} from "react";
import { useSearchParams } from "next/navigation";
import { freelancersApi } from "@/lib/api";
import { User } from "@/types";
import { FreelancerCard } from "@/components/talent/FreelancerCard";
import { HireRequestModal } from "@/components/talent/HireRequestModal";
import { useSavedJobs } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Pagination } from "@/components/ui/Pagination";
import {
  Search, SlidersHorizontal, X, Users,
  Code2, Palette, BarChart2, PenLine, Video,
  DollarSign, Wrench, Headphones, ArrowRight,
  ChevronDown, TrendingUp, Award,
  Sparkles, Target, Zap,
} from "lucide-react";

const PAGE_LIMIT = 12;

// ── Category config with enhanced visuals ────────────────────────────────────

const CATEGORIES = [
 { name: "Web Development", icon: Code2, count: "2.3K", color: "bg-blue-500", lightBg: "bg-blue-50", textColor: "text-blue-600" },
 { name: "Design", icon: Palette, count: "1.8K", color: "bg-purple-500", lightBg: "bg-purple-50", textColor: "text-purple-600" },
 { name: "Data Science", icon: BarChart2, count: "950", color: "bg-cyan-500", lightBg: "bg-cyan-50", textColor: "text-cyan-600" },
 { name: "Writing", icon: PenLine, count: "1.5K", color: "bg-green-500", lightBg: "bg-green-50", textColor: "text-green-600" },
 { name: "Video & Animation", icon: Video, count: "720", color: "bg-red-500", lightBg: "bg-red-50", textColor: "text-red-600" },
 { name: "Finance", icon: DollarSign, count: "640", color: "bg-yellow-500", lightBg: "bg-yellow-50", textColor: "text-yellow-600" },
 { name: "Engineering", icon: Wrench, count: "890", color: "bg-slate-500", lightBg: "bg-slate-50", textColor: "text-slate-600" },
 { name: "Customer Service", icon: Headphones, count: "1.1K", color: "bg-teal-500", lightBg: "bg-teal-50", textColor: "text-teal-600" },
]; 

const RATE_OPTIONS = [
  { label: "Under ₹500/hr",      value: "0-500"       },
  { label: "₹500 – ₹1,500/hr",  value: "500-1500"    },
  { label: "₹1,500 – ₹3,000/hr", value: "1500-3000"  },
  { label: "₹3,000+/hr",         value: "3000+"       },
];

const EXP_OPTIONS = [
  { label: "Entry (0–2 yrs)",    value: "entry"  },
  { label: "Mid (2–5 yrs)",      value: "mid"    },
  { label: "Senior (5–10 yrs)",  value: "senior" },
  { label: "Expert (10+ yrs)",   value: "expert" },
];

const SORT_OPTIONS = [
  { label: "Best Match",     value: "newest"    },
  { label: "Top Rated",      value: "rate_high" },
  { label: "Most Affordable", value: "rate_low"  },
];

// ── hooks ─────────────────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TalentPage() {
  const searchParams = useSearchParams();
  const { isSaved, toggleSave } = useSavedJobs();

  // ── URL-seeded filter state ──
  const [search,       setSearch]       = useState(searchParams.get("search")   ?? "");
  const [category,     setCategory]     = useState(searchParams.get("category") ?? "");
  const [rateRange,    setRateRange]    = useState("");
  const [expLevels,    setExpLevels]    = useState<string[]>([]);
  const [availOnly,    setAvailOnly]    = useState(false);
  const [sort,         setSort]         = useState("newest");
  const [filtersOpen,  setFiltersOpen]  = useState(false);

  // Data
  const [freelancers,  setFreelancers]  = useState<User[]>([]);
  const [topRated,     setTopRated]     = useState<User[]>([]);
  const [total,        setTotal]        = useState(0);
  const [totalPages,   setTotalPages]   = useState(1);
  const [page,         setPage]         = useState(1);
  const [loading,      setLoading]      = useState(true);
  const [topLoading,   setTopLoading]   = useState(true);
  const [hireTarget,   setHireTarget]   = useState<User | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  // Is this a "browse" view?
  const isBrowse = !!(debouncedSearch || category || rateRange || expLevels.length || availOnly);

  // ── Build API params ──
  const apiParams = useMemo(() => {
    const p: Record<string, string> = { sort, page: String(page), limit: String(PAGE_LIMIT) };
    if (debouncedSearch) p.search = debouncedSearch;
    if (category)        p.category = category;
    if (availOnly)       p.availableOnly = "true";
    if (rateRange) {
      const [min, max] = rateRange.split("-");
      if (min && min !== "3000") p.minRate = min;
      if (max) p.maxRate = max;
      if (rateRange === "3000+") p.minRate = "3000";
    }
    if (expLevels.length === 1) p.experience = expLevels[0];
    return p;
  }, [debouncedSearch, category, rateRange, expLevels, availOnly, sort, page]);

  // ── Fetch freelancers ──
  const fetchFreelancers = useCallback(async () => {
    setLoading(true);
    try {
      const res = (await freelancersApi.getAll(apiParams)) as {
        data: User[]; total: number; pages: number;
      };
      setFreelancers(res.data ?? []);
      setTotal(res.total ?? 0);
      setTotalPages(res.pages ?? 1);
    } catch {
      setFreelancers([]);
    } finally {
      setLoading(false);
    }
  }, [apiParams]);

  // Top-rated — fetched once on mount
  const fetchTopRated = useCallback(async () => {
    setTopLoading(true);
    try {
      const res = (await freelancersApi.getAll({ sort: "rate_high", limit: "6" })) as {
        data: User[];
      };
      setTopRated(res.data ?? []);
    } catch {
      setTopRated([]);
    } finally {
      setTopLoading(false);
    }
  }, []);

  useEffect(() => { fetchFreelancers(); }, [fetchFreelancers]);
  useEffect(() => { fetchTopRated(); }, [fetchTopRated]);

  // ── Sync URL params on mount ──
  useEffect(() => {
    const cat = searchParams.get("category");
    const q   = searchParams.get("search");
    if (cat) setCategory(cat);
    if (q)   setSearch(q);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Filter helpers ──
  const activeCount = [
    !!debouncedSearch, !!category, !!rateRange,
    expLevels.length > 0, availOnly,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearch(""); setCategory(""); setRateRange("");
    setExpLevels([]); setAvailOnly(false); setPage(1);
  };

  const toggleExp = (v: string) =>
    setExpLevels((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    );

  // Reset page when filters change (but not when page itself changes)
  useEffect(() => { setPage(1); }, [debouncedSearch, category, rateRange, availOnly]);

  // ── Filter panel ──
  const Filters = () => (
    <div>
      {/* Search */}
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Search</h4>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Name or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
          />
        </div>
      </div>

      {/* Category */}
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Category</h4>
        <div className="space-y-2">
          {CATEGORIES.map(({ name }) => (
            <label key={name} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={category === name}
                onChange={() => setCategory(category === name ? "" : name)}
                className="w-4 h-4 accent-[#1e3a5f] rounded"
              />
              <span className="text-sm text-gray-700">{name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Hourly Rate */}
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Hourly Rate</h4>
        <div className="space-y-2">
          {RATE_OPTIONS.map(({ label, value }) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="rate"
                checked={rateRange === value}
                onChange={() => setRateRange(rateRange === value ? "" : value)}
                className="w-4 h-4 accent-[#1e3a5f]"
              />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Experience Level */}
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Experience Level</h4>
        <div className="space-y-2">
          {EXP_OPTIONS.map(({ label, value }) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={expLevels.includes(value)}
                onChange={() => toggleExp(value)}
                className="w-4 h-4 accent-[#1e3a5f] rounded"
              />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Availability</h4>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={availOnly}
            onChange={() => setAvailOnly((v) => !v)}
            className="w-4 h-4 accent-[#1e3a5f] rounded"
          />
          <span className="text-sm text-gray-700">Available immediately</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-[family-name:var(--font-poppins)]">

      {/* ══ HERO SECTION ═════════════════════════════════════════════════════ */}
      <div className="bg-[#1e3a5f] text-white py-16 sm:py-20 relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/5 rounded-full pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-white/5 rounded-full pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-5 text-white/70">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>›</span>
            <span className="text-white font-medium">Hire Talent</span>
          </div>

          {/* Title row + Sort */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
                {isBrowse ? (category || "Browse Talent") : "Hire Talent"}
              </h1>
              <p className="text-white/70 text-sm mt-1.5 flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#d4a017]" />
                {isBrowse
                  ? <>{total} freelancer{total !== 1 ? "s" : ""} found{activeCount > 1 && <span className="opacity-60 ml-1">(· {activeCount} filters)</span>}</>
                  : "50,000+ verified professionals ready to hire"
                }
              </p>
            </div>
            <div className="relative flex items-center gap-2 flex-shrink-0 mt-1">
              <span className="hidden sm:block text-sm text-white/70">Sort by:</span>
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="bg-white/10 hover:bg-white/15 text-white text-sm px-3 py-2 pr-8 rounded-lg border border-[#d4a017]/60 hover:border-[#d4a017] focus:outline-none focus:ring-2 focus:ring-[#d4a017] appearance-none cursor-pointer transition-all duration-200"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value} className="bg-[#1e3a5f]">{o.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/80" size={14} />
            </div>
          </div>

          {/* Search bar */}
          <div className="flex gap-2 max-w-2xl mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === "Enter" && e.preventDefault()}
                placeholder="Search by skill, name, or category..."
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

          {/* Category chips + mobile filter toggle */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-white/60 text-xs font-medium mr-1">Categories:</span>
            {CATEGORIES.map(({ name, icon: Icon, lightBg, textColor }) => (
              <button
                key={name}
                onClick={() => setCategory(prev => prev === name ? "" : name)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all",
                  category === name
                    ? "bg-[#d4a017] border-[#d4a017] text-white"
                    : "bg-white/10 border-white/20 text-white/80 hover:bg-white/20 hover:border-white/40"
                )}
              >
                <Icon size={12} />
                {name}
              </button>
            ))}
            {/* Mobile filter button */}
            <button
              onClick={() => setFiltersOpen(true)}
              className="ml-auto flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-[#d4a017]/60 text-white text-xs px-3 py-1.5 rounded-full lg:hidden transition-all"
            >
              <SlidersHorizontal size={13} />
              Filters
              {activeCount > 0 && (
                <span className="bg-[#d4a017] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">!</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setFiltersOpen(false)} />
          <div className="relative ml-auto w-80 max-w-full h-full bg-white overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-br from-[#1e3a5f] to-[#2d5282] text-white p-4 flex items-center justify-between z-10">
              <div>
                <h3 className="font-semibold text-sm">Filters</h3>
                <p className="text-xs text-white/60">Refine your search</p>
              </div>
              <button onClick={() => setFiltersOpen(false)} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-4">
              <Filters />
            </div>
          </div>
        </div>
      )}

      {/* Active filter chips */}
      {activeCount > 0 && isBrowse && (
        <div className="bg-white border-b border-gray-200 py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap gap-2 items-center">
            <span className="text-xs text-gray-500 font-medium">Active filters:</span>
            {debouncedSearch && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e3a5f] text-white rounded-full text-xs font-medium">
                "{debouncedSearch}" <button onClick={() => setSearch("")} className="hover:text-[#d4a017]"><X size={12} /></button>
              </span>
            )}
            {category && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e3a5f] text-white rounded-full text-xs font-medium">
                {category} <button onClick={() => setCategory("")} className="hover:text-[#d4a017]"><X size={12} /></button>
              </span>
            )}
            {rateRange && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e3a5f] text-white rounded-full text-xs font-medium">
                {RATE_OPTIONS.find((r) => r.value === rateRange)?.label}
                <button onClick={() => setRateRange("")} className="hover:text-[#d4a017]"><X size={12} /></button>
              </span>
            )}
            {expLevels.map((e) => (
              <span key={e} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e3a5f] text-white rounded-full text-xs font-medium">
                {EXP_OPTIONS.find((o) => o.value === e)?.label}
                <button onClick={() => toggleExp(e)} className="hover:text-[#d4a017]"><X size={12} /></button>
              </span>
            ))}
            {availOnly && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e3a5f] text-white rounded-full text-xs font-medium">
                Available now <button onClick={() => setAvailOnly(false)} className="hover:text-[#d4a017]"><X size={12} /></button>
              </span>
            )}
            <button onClick={clearFilters} className="text-xs text-[#1e3a5f] hover:text-[#d4a017] font-medium underline ml-1">
              Clear all
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* ══ LANDING VIEW ═════════════════════════════════════════════════════ */}
        {!isBrowse && (
          <>
            {/* Top Rated Freelancers */}
            <div className="mb-16">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">Top Rated Professionals</h2>
                  <p className="text-sm text-gray-500">Handpicked experts with proven track records</p>
                </div>
                <button onClick={() => setSort("rate_high")} className="text-sm text-[#1e3a5f] hover:text-[#d4a017] font-medium flex items-center gap-1.5 transition-colors">
                  View all <ArrowRight size={14} />
                </button>
              </div>
              {topLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
                      <div className="flex gap-3 mb-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-xl flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-2/3" />
                          <div className="h-3 bg-gray-200 rounded w-1/2" />
                        </div>
                      </div>
                      <div className="h-3 bg-gray-200 rounded w-full mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-4/5" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {topRated.map((f) => (
                    <FreelancerCard
                      key={f._id}
                      freelancer={f}
                      onHire={setHireTarget}
                      saved={isSaved(f._id)}
                      onToggleSave={toggleSave}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* How it works */}
            <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2d5282] rounded-3xl p-8 sm:p-12 mb-16 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4a017]/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
              
              <div className="relative z-10">
                <div className="text-center mb-10">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                    How Hiring Works
                  </h2>
                  <p className="text-white/70 text-sm sm:text-base">
                    Get started in minutes and hire with confidence
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { step: "1", icon: Target, title: "Post a job", desc: "Describe your project requirements and budget", color: "bg-blue-500" },
                    { step: "2", icon: Users, title: "Browse talent", desc: "Search our directory of verified professionals", color: "bg-purple-500" },
                    { step: "3", icon: Zap, title: "Send a request", desc: "Reach out with your timeline and expectations", color: "bg-green-500" },
                    { step: "4", icon: TrendingUp, title: "Start working", desc: "Chat, collaborate, and get the job done", color: "bg-yellow-500" },
                  ].map(({ step, icon: Icon, title, desc, color }) => (
                    <div key={step} className="relative">
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-200">
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg mb-4", color)}>
                          <Icon size={24} />
                        </div>
                        <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-[#d4a017] text-white font-bold text-sm flex items-center justify-center border-4 border-[#1e3a5f]">
                          {step}
                        </div>
                        <p className="text-base font-semibold text-white mb-2">{title}</p>
                        <p className="text-sm text-white/70 leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA Banner */}
            <div className="bg-white rounded-3xl border-2 border-gray-200 p-8 sm:p-12 text-center shadow-lg">
              <div className="inline-flex items-center gap-2 bg-[#1e3a5f]/5 px-4 py-2 rounded-full mb-4">
                <Award size={16} className="text-[#d4a017]" />
                <span className="text-sm font-medium text-[#1e3a5f]">Trusted by 10,000+ Businesses</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                Ready to hire top talent?
              </h2>
              <p className="text-gray-600 text-sm sm:text-base mb-8 max-w-2xl mx-auto">
                Join thousands of businesses who trust WinkGetJob for their hiring needs. 
                Post a job for free or browse our talent pool today.
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <button
                  onClick={() => setSearch(" ")}
                  className="px-8 py-3.5 bg-[#1e3a5f] hover:bg-[#2d5282] text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <Users size={18} />
                  Browse Freelancers
                </button>
                <Link href="/register?role=employer">
                  <button className="px-8 py-3.5 bg-white hover:bg-gray-50 border-2 border-[#1e3a5f] text-[#1e3a5f] font-semibold rounded-xl transition-all duration-200 flex items-center gap-2">
                    <Sparkles size={18} />
                    Post a Job Free
                  </button>
                </Link>
              </div>
            </div>
          </>
        )}

        {/* ══ BROWSE / FILTER VIEW ═════════════════════════════════════════════ */}
        {isBrowse && (
          <div className="flex gap-6 items-start">
            {/* Desktop sidebar */}
            <aside className="hidden lg:block w-72 flex-shrink-0 sticky top-6">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2d5282] p-5 text-white">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-base">Filters</h3>
                    {activeCount > 0 && (
                      <button
                        onClick={clearFilters}
                        className="text-xs text-[#d4a017] hover:text-[#f5c842] font-medium transition-colors"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-white/60">Refine your search</p>
                </div>
                <div className="p-5">
                  <Filters />
                </div>
              </div>
            </aside>

            {/* Results */}
            <main className="flex-1 min-w-0">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
                      <div className="flex gap-3 mb-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-xl flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-2/3" />
                          <div className="h-3 bg-gray-200 rounded w-1/2" />
                        </div>
                      </div>
                      <div className="h-3 bg-gray-200 rounded w-full mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-4/5" />
                    </div>
                  ))}
                </div>
              ) : freelancers.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No freelancers found</h3>
                  <p className="text-gray-500 mb-6">Try adjusting your filters or search term</p>
                  <button
                    onClick={clearFilters}
                    className="px-6 py-2.5 bg-[#1e3a5f] hover:bg-[#2d5282] text-white font-medium rounded-lg transition-all duration-200"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {freelancers.map((f) => (
                    <FreelancerCard
                      key={f._id}
                      freelancer={f}
                      onHire={setHireTarget}
                      saved={isSaved(f._id)}
                      onToggleSave={toggleSave}
                    />
                  ))}
                </div>
              )}
              <Pagination
                page={page}
                pages={totalPages}
                total={total}
                limit={PAGE_LIMIT}
                onPageChange={n => { setPage(n); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              />
            </main>
          </div>
        )}
      </div>

      {/* Hire Request Modal */}
      <HireRequestModal
        freelancer={hireTarget}
        onClose={() => setHireTarget(null)}
      />
    </div>
  );
}
