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
  Sparkles, Target, Zap, ShieldCheck, MessageSquare,
  CheckCircle2, LayoutGrid, UserCheck, MoreHorizontal, Check, Star,
  Percent
} from "lucide-react";
import Image from "next/image";

const PAGE_LIMIT = 12;

// ── Category config with enhanced visuals ────────────────────────────────────

const CATEGORIES = [
  { name: "Web Development", icon: Code2, count: "2.3K", color: "bg-blue-500", lightBg: "bg-blue-50", textColor: "text-blue-600" },
  { name: "Design", icon: Palette, count: "1.8K", color: "bg-purple-500", lightBg: "bg-purple-50", textColor: "text-purple-600" },
  { name: "Data Science", icon: BarChart2, count: "950", color: "bg-cyan-500", lightBg: "bg-cyan-50", textColor: "text-cyan-600" },
  { name: "Writing", icon: PenLine, count: "1.5K", color: "bg-green-500", lightBg: "bg-green-50", textColor: "text-green-600" },
  { name: "Video & Animation", icon: Video, count: "720", color: "bg-red-500", lightBg: "bg-red-50", textColor: "text-red-600" },
  { name: "Finance", icon: DollarSign, count: "640", color: "bg-yellow-500", lightBg: "bg-yellow-50", textColor: "text-yellow-600" },
  { name: "Customer Service", icon: Headphones, count: "1.1K", color: "bg-teal-500", lightBg: "bg-teal-50", textColor: "text-teal-600" },
];

const RATE_OPTIONS = [
  { label: "Under ₹500/hr", value: "0-500" },
  { label: "₹500 – ₹1,500/hr", value: "500-1500" },
  { label: "₹1,500 – ₹3,000/hr", value: "1500-3000" },
  { label: "₹3,000+/hr", value: "3000+" },
];

const EXP_OPTIONS = [
  { label: "Entry (0–2 yrs)", value: "entry" },
  { label: "Mid (2–5 yrs)", value: "mid" },
  { label: "Senior (5–10 yrs)", value: "senior" },
  { label: "Expert (10+ yrs)", value: "expert" },
];

const SORT_OPTIONS = [
  { label: "Best Match", value: "newest" },
  { label: "Top Rated", value: "rate_high" },
  { label: "Most Affordable", value: "rate_low" },
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
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [rateRange, setRateRange] = useState("");
  const [expLevels, setExpLevels] = useState<string[]>([]);
  const [availOnly, setAvailOnly] = useState(false);
  const [sort, setSort] = useState("newest");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showFloatingButton, setShowFloatingButton] = useState(false);

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

  // Data
  const [freelancers, setFreelancers] = useState<User[]>([]);
  const [topRated, setTopRated] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [topLoading, setTopLoading] = useState(true);
  const [hireTarget, setHireTarget] = useState<User | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  // Is this a "browse" view?
  const isBrowse = !!(debouncedSearch || category || rateRange || expLevels.length || availOnly);

  // ── Build API params ──
  const apiParams = useMemo(() => {
    const p: Record<string, string> = { sort, page: String(page), limit: String(PAGE_LIMIT) };
    if (debouncedSearch) p.search = debouncedSearch;
    if (category) p.category = category;
    if (availOnly) p.availableOnly = "true";
    if (rateRange) {
      const [min, max] = rateRange.split("-");
      if (min && min !== "3000") p.minRate = min;
      if (max) p.maxRate = max;
      if (rateRange === "3000+") p.minRate = "3000";
    }
    // Send all selected experience levels joined by comma
    if (expLevels.length > 0) p.experience = expLevels.join(",");
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
    const q = searchParams.get("search");
    if (cat) setCategory(cat);
    if (q) setSearch(q);
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
      <section className="bg-slate-50/70 border-b border-slate-200/60 pt-5 pb-6 sm:pt-7 sm:pb-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

            {/* LEFT COLUMN: Text & Key Highlights */}
            <div className="lg:col-span-6 flex flex-col items-start pt-1">
              {/* Category Tag */}
              <span className="text-[#6d28d9] font-bold text-xs tracking-wider uppercase mb-2">
                HIRE TALENT
              </span>

              {/* Main Headline */}
              <h1 className="text-2xl sm:text-3xl lg:text-[2.25rem] xl:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.18] mb-2.5">
                Hire Top Freelancers. <br className="hidden sm:inline" />
                <span className="text-[#6d28d9]">Get Work Done.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-slate-600 text-xs sm:text-sm font-normal max-w-lg mb-4 leading-relaxed">
                Connect with verified and skilled professionals to get your projects done on time with zero hiring fees.
              </p>

              {/* Feature Highlights Cards */}
              <div className="grid grid-cols-3 gap-1.5 sm:flex sm:items-center sm:gap-2.5 mb-4">
                <div className="flex items-center justify-center gap-1 sm:gap-2 bg-white px-1.5 sm:px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
                  <span className="p-0.5 sm:p-1 rounded-md sm:rounded-lg bg-purple-50 text-purple-600 border border-purple-200/50 shrink-0">
                    <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </span>
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-800 truncate">Top 1% Talent</span>
                </div>
                <div className="flex items-center justify-center gap-1 sm:gap-2 bg-white px-1.5 sm:px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
                  <span className="p-0.5 sm:p-1 rounded-md sm:rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200/50 shrink-0">
                    <Percent className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </span>
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-800 truncate">Zero Hiring Fees</span>
                </div>
                <div className="flex items-center justify-center gap-1 sm:gap-2 bg-white px-1.5 sm:px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
                  <span className="p-0.5 sm:p-1 rounded-md sm:rounded-lg bg-amber-50 text-amber-600 border border-amber-200/50 shrink-0">
                    <MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </span>
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-800 truncate">Quick &amp; Easy</span>
                </div>
              </div>

              {/* Quick Live Stats Row (Centered layout with smaller description) */}
              <div className="grid grid-cols-3 gap-1 pt-3 border-t border-slate-200/70 w-full max-w-md">
                <div className="text-center flex flex-col items-center">
                  <p className="text-base sm:text-lg font-extrabold text-slate-900 leading-none">50K+</p>
                  <p className="text-[9px] sm:text-[11px] text-slate-500 font-medium mt-1 whitespace-nowrap">Talent</p>
                </div>
                <div className="text-center flex flex-col items-center">
                  <p className="text-base sm:text-lg font-extrabold text-slate-900 leading-none">98%</p>
                  <p className="text-[9px] sm:text-[11px] text-slate-500 font-medium mt-1 whitespace-nowrap">Completion Rate</p>
                </div>
                <div className="text-center flex flex-col items-center">
                  <p className="text-base sm:text-lg font-extrabold text-slate-900 leading-none">0%</p>
                  <p className="text-[9px] sm:text-[11px] text-slate-500 font-medium mt-1 whitespace-nowrap">Hiring Fee</p>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Man in Purple Hoodie + Organic Purple Background + Floating Cards */}
            <div className="hidden lg:flex lg:col-span-6 relative items-center justify-end min-h-[320px] xl:min-h-[360px] lg:pr-2 xl:pr-6">
              {/* Organic Soft Purple Blob Background */}
              <div className="absolute w-[360px] xl:w-[420px] h-[300px] xl:h-[340px] bg-[#f0edff] rounded-[65%_35%_60%_40%/50%_60%_40%_50%] pointer-events-none -z-0 right-0 xl:right-4" />

              {/* Man Image */}
              <div className="relative z-10 w-[400px] xl:w-[470px] h-auto flex items-center justify-end">
                <Image
                  src="/tltt.png"
                  alt="Hire Talent Illustration"
                  width={560}
                  height={560}
                  priority
                  className="object-contain drop-shadow-md w-full h-auto"
                />
              </div>

              {/* Floating Card 1: Top Left - Top 1% Talent */}
              <div className="absolute top-4 left-0 xl:left-4 z-20 bg-white/95 backdrop-blur-md rounded-xl px-3 py-2 shadow-lg border border-slate-100/80 flex items-center gap-2 transition-transform duration-300 hover:scale-105">
                <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <Star size={14} fill="currentColor" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-900 leading-tight">Top 1% Talent</p>
                  <p className="text-[9px] text-slate-500 font-medium">Skill Verified</p>
                </div>
              </div>

              {/* Floating Card 2: Top Right - 50,000+ Verified Professionals */}
              <div className="absolute top-0 right-0 xl:right-2 z-20 bg-white/95 backdrop-blur-md rounded-xl px-3 py-2 shadow-lg border border-slate-100/80 flex items-center gap-2 transition-transform duration-300 hover:scale-105">
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Users size={15} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-900 leading-tight">50,000+</p>
                  <p className="text-[9px] text-slate-500 font-medium">Verified Talent</p>
                </div>
              </div>

              {/* Floating Card 3: Middle Right - Direct Chat & Hire */}
              <div className="absolute bottom-2 right-2 xl:right-6 z-20 bg-white/95 backdrop-blur-md rounded-xl px-3 py-2 shadow-lg border border-slate-100/80 flex items-center gap-2 transition-transform duration-300 hover:scale-105">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <MessageSquare size={15} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-900 leading-tight">Direct Chat &amp; Hire</p>
                  <p className="text-[9px] text-slate-500 font-medium">Zero Hiring Fees</p>
                </div>
              </div>
            </div>

          </div>

          {/* SEARCH BAR CONTAINER */}
          <div className="bg-white rounded-2xl p-2.5 sm:p-2 border border-slate-200/90 shadow-xl shadow-slate-200/40 mt-5 sm:mt-6">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 sm:gap-3">

              {/* Search Input */}
              <div className="flex-1 flex items-center gap-2.5 px-3 py-2.5 md:py-1.5 bg-slate-50/80 md:bg-transparent rounded-xl md:rounded-none">
                <Search className="text-slate-400 shrink-0" size={17} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
                  placeholder="Search by skill, name, or category..."
                  className="w-full text-slate-900 text-xs sm:text-sm placeholder:text-slate-400 bg-transparent border-none focus:outline-none font-normal"
                />
              </div>

              {/* Vertical Divider */}
              <div className="hidden md:block w-[1px] h-7 bg-slate-200 shrink-0" />

              {/* Category & Availability Selects (Side-by-side in 1 row on mobile) */}
              <div className="grid grid-cols-2 gap-2 md:contents">
                {/* All Categories Dropdown */}
                <div className="relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2.5 md:py-1.5 md:w-52 shrink-0 bg-slate-50/80 md:bg-transparent rounded-xl md:rounded-none">
                  <LayoutGrid className="text-slate-400 shrink-0" size={15} />
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setPage(1);
                    }}
                    className="w-full text-slate-700 text-xs sm:text-sm bg-transparent border-none focus:outline-none appearance-none cursor-pointer pr-5 font-medium truncate"
                  >
                    <option value="">All Categories</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 text-slate-400 pointer-events-none" size={14} />
                </div>

                {/* Vertical Divider */}
                <div className="hidden md:block w-[1px] h-7 bg-slate-200 shrink-0" />

                {/* Availability Dropdown */}
                <div className="relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2.5 md:py-1.5 md:w-48 shrink-0 bg-slate-50/80 md:bg-transparent rounded-xl md:rounded-none">
                  <UserCheck className="text-slate-400 shrink-0" size={15} />
                  <select
                    value={availOnly ? "available" : ""}
                    onChange={(e) => {
                      setAvailOnly(e.target.value === "available");
                      setPage(1);
                    }}
                    className="w-full text-slate-700 text-xs sm:text-sm bg-transparent border-none focus:outline-none appearance-none cursor-pointer pr-5 font-medium truncate"
                  >
                    <option value="">Availability</option>
                    <option value="available">Available Immediately</option>
                  </select>
                  <ChevronDown className="absolute right-2 text-slate-400 pointer-events-none" size={14} />
                </div>
              </div>

              {/* Search Talent Button */}
              <button
                onClick={() => setPage(1)}
                className="w-full md:w-auto bg-[#6d28d9] hover:bg-[#5b21b6] text-white text-xs sm:text-sm font-bold px-7 py-3 rounded-xl transition-all duration-200 shadow-md cursor-pointer whitespace-nowrap active:scale-98 shrink-0 flex items-center justify-center gap-2"
              >
                <Search size={15} className="md:hidden" />
                <span>Search Talent</span>
              </button>
            </div>
          </div>

          {/* CATEGORY PILLS BAR (Inside Hero Container for Perfect Vertical Alignment) */}
          <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto scrollbar-hide no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pt-4 pb-1">
            {/* Left "All Categories" Badge */}
            <button
              onClick={() => {
                setCategory("");
                setPage(1);
              }}
              className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm shrink-0 border transition-colors cursor-pointer ${!category
                ? "bg-[#f3e8ff] text-[#6d28d9] border-[#d8b4fe]"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
            >
              <LayoutGrid size={15} />
              <span>All Categories</span>
            </button>

            {/* Category Pills */}
            {CATEGORIES.map(({ name, icon: Icon }) => {
              const isActive = category === name;
              return (
                <button
                  key={name}
                  onClick={() => {
                    setCategory(isActive ? "" : name);
                    setPage(1);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 border ${isActive
                    ? "bg-[#f3e8ff] text-[#6d28d9] border-[#d8b4fe] shadow-2xs font-bold"
                    : "bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                >
                  <Icon size={14} className={isActive ? "text-[#6d28d9]" : "text-slate-400"} />
                  <span>{name}</span>
                </button>
              );
            })}

            {/* More Categories Link / Pill */}
            <button
              onClick={() => {
                setCategory("");
                setPage(1);
              }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 border bg-white text-slate-500 border-slate-200/80 hover:bg-slate-50 hover:text-slate-900"
            >
              <MoreHorizontal size={14} className="text-slate-400" />
              <span>More</span>
            </button>
          </div>

        </div>
      </section>

      {/* Mobile filter drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setFiltersOpen(false)} />
          <div className="relative ml-auto w-80 max-w-full h-full bg-white overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-br from-[#1e3a5f] to-[#2d5282] text-white p-4 flex items-center justify-between z-10">
              <div>
                <h3 className="font-semibold text-sm">Filters & Sort</h3>
                <p className="text-xs text-white/60">Refine your search</p>
              </div>
              <button onClick={() => setFiltersOpen(false)} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-4">
              {/* Sort section */}
              <div className="mb-5 pb-5 border-b border-gray-100">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Sort By</h4>
                <div className="space-y-1">
                  {[
                    { label: "Best Match", value: "newest" },
                    { label: "Top Rated", value: "rate_high" },
                    { label: "Most Affordable", value: "rate_low" }
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setSort(opt.value)}
                      className={cn(
                        "w-full text-left py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-between",
                        sort === opt.value
                          ? "bg-[#1e3a5f]/8 text-[#1e3a5f] font-semibold"
                          : "text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      <span>{opt.label}</span>
                      {sort === opt.value && <span className="w-2 h-2 rounded-full bg-[#1e3a5f]" />}
                    </button>
                  ))}
                </div>
              </div>
              <Filters />
            </div>
          </div>
        </div>
      )}


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6 items-start">

          {/* ── Desktop Sidebar (always visible) ── */}
          <aside className="hidden lg:block w-64 xl:w-72 flex-shrink-0 sticky top-[calc(var(--navbar-height)+1.5rem)] self-start max-h-[calc(100vh-var(--navbar-height)-3rem)] overflow-y-auto">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2d5282] p-4 text-white">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-sm">Filters</h3>
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
              <div className="p-4">
                <Filters />
              </div>
            </div>
          </aside>

          {/* ── Main Content ── */}
          <main className="flex-1 min-w-0">

            {/* Active filter chips */}
            {activeCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {debouncedSearch && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-[#1e3a5f] rounded-full text-xs font-medium">
                    "{debouncedSearch}" <button onClick={() => setSearch("")}><X size={11} /></button>
                  </span>
                )}
                {category && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-[#1e3a5f] rounded-full text-xs font-medium">
                    {category} <button onClick={() => setCategory("")}><X size={11} /></button>
                  </span>
                )}
                {rateRange && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-[#1e3a5f] rounded-full text-xs font-medium">
                    {RATE_OPTIONS.find((r) => r.value === rateRange)?.label}
                    <button onClick={() => setRateRange("")}><X size={11} /></button>
                  </span>
                )}
                {expLevels.map((e) => (
                  <span key={e} className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-[#1e3a5f] rounded-full text-xs font-medium">
                    {EXP_OPTIONS.find((o) => o.value === e)?.label}
                    <button onClick={() => toggleExp(e)}><X size={11} /></button>
                  </span>
                ))}
                {availOnly && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-[#1e3a5f] rounded-full text-xs font-medium">
                    Available now <button onClick={() => setAvailOnly(false)}><X size={11} /></button>
                  </span>
                )}
                <button onClick={clearFilters} className="text-xs text-gray-500 hover:text-gray-700 underline ml-1">
                  Clear all
                </button>
              </div>
            )}

            {/* ── Top Rated Section (no active filters) ── */}
            {!isBrowse && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Top Rated Professionals</h2>
                    <p className="text-sm text-gray-500">Handpicked experts with proven track records</p>
                  </div>
                  <button
                    onClick={() => { setSort("rate_high"); setAvailOnly(true); }}
                    className="text-sm text-[#1e3a5f] hover:text-[#d4a017] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    View all <ArrowRight size={14} />
                  </button>
                </div>
                {topLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
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
                ) : (
                  <div className="flex flex-col gap-4">
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
            )}

            {/* ── Browse / Filter Results ── */}
            {isBrowse && (
              <>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
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
                ) : freelancers.length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
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
                  <div className="space-y-6">
                    <div className="flex flex-col gap-4">
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
                    <Pagination
                      page={page}
                      pages={totalPages}
                      total={total}
                      limit={PAGE_LIMIT}
                      onPageChange={n => { setPage(n); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    />
                  </div>
                )}
              </>
            )}

            {/* ── How it works + CTA (no active filters) ── */}
            {!isBrowse && (
              <>
                {/* How it works */}
                <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2d5282] rounded-3xl p-8 sm:p-10 mb-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4a017]/10 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
                  <div className="relative z-10">
                    <div className="text-center mb-8">
                      <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">How Hiring Works</h2>
                      <p className="text-white/70 text-sm">Get started in minutes and hire with confidence</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { step: "1", icon: Target, title: "Post a job", desc: "Describe your project requirements and budget", color: "bg-blue-500" },
                        { step: "2", icon: Users, title: "Browse talent", desc: "Search our directory of verified professionals", color: "bg-purple-500" },
                        { step: "3", icon: Zap, title: "Send a request", desc: "Reach out with your timeline and expectations", color: "bg-green-500" },
                        { step: "4", icon: TrendingUp, title: "Start working", desc: "Chat, collaborate, and get the job done", color: "bg-yellow-500" },
                      ].map(({ step, icon: Icon, title, desc, color }) => (
                        <div key={step} className="relative">
                          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-200">
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold mb-3", color)}>
                              <Icon size={20} />
                            </div>
                            <div className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-[#d4a017] text-white font-bold text-xs flex items-center justify-center border-4 border-[#1e3a5f]">
                              {step}
                            </div>
                            <p className="text-sm font-semibold text-white mb-1">{title}</p>
                            <p className="text-xs text-white/70 leading-relaxed">{desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* CTA Banner */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 text-center shadow-sm">
                  <div className="inline-flex items-center gap-2 bg-[#1e3a5f]/5 px-4 py-2 rounded-full mb-4">
                    <Award size={16} className="text-[#d4a017]" />
                    <span className="text-sm font-medium text-[#1e3a5f]">Trusted by 10,000+ Businesses</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Ready to hire top talent?</h2>
                  <p className="text-gray-600 text-sm mb-6 max-w-xl mx-auto">
                    Join thousands of businesses who trust WinkGetJob. Post a job for free or browse our talent pool.
                  </p>
                  <div className="flex items-center justify-center gap-4 flex-wrap">
                    <button
                      onClick={() => setSearch(" ")}
                      className="px-6 py-3 bg-[#1e3a5f] hover:bg-[#2d5282] text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 text-sm"
                    >
                      <Users size={16} />
                      Browse Freelancers
                    </button>
                    <Link href="/register?role=employer">
                      <button className="px-6 py-3 bg-white hover:bg-gray-50 border-2 border-[#1e3a5f] text-[#1e3a5f] font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 text-sm">
                        <Sparkles size={16} />
                        Post a Job Free
                      </button>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      {/* Hire Request Modal */}
      <HireRequestModal
        freelancer={hireTarget}
        onClose={() => setHireTarget(null)}
      />

      {/* Floating Filter FAB for Mobile on Scroll */}
      {showFloatingButton && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 md:hidden">
          <button
            onClick={() => setFiltersOpen(true)}
            className="flex items-center gap-3 bg-[#1e3a5f] hover:bg-[#2d5282] active:scale-95 text-white rounded-full shadow-2xl px-6 py-3 border border-white/10 backdrop-blur-sm transition-all duration-200"
          >
            <SlidersHorizontal size={16} />
            <span className="text-sm font-semibold tracking-wide">Filters & Sort</span>
            {activeCount > 0 && (
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
