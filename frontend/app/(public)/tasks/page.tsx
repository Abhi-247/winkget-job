"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { tasksApi } from "@/lib/api";
import { Task } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import {
  MapPin, Star, ChevronDown, SlidersHorizontal, X, Clock, ClipboardList,
  Calendar, Search, LayoutGrid, Bookmark, Zap, ShieldCheck, Percent,
  FileText, PenTool, Palette, FlaskConical, MoreHorizontal, CheckCircle2,
  ArrowRight
} from "lucide-react";
import { formatCurrency, formatRelativeTime, cn } from "@/lib/utils";
import { TaskCard } from "@/components/jobseeker/TaskCard";
import { Pagination } from "@/components/ui/Pagination";
import Link from "next/link";
import Image from "next/image";

const PAGE_LIMIT = 12;

export default function FindTaskPage() {
  const searchParams = useSearchParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("latest");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showFloatingButton, setShowFloatingButton] = useState(false);

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);

  // Filter states
  const [budgetRange, setBudgetRange] = useState<string>("");
  const [taskTypes, setTaskTypes] = useState<string[]>([]);
  const [workModes, setWorkModes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParams?.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Sync category & search from URL query parameters
  useEffect(() => {
    const cat = searchParams?.get("category") || "";
    if (cat) setSelectedCategory(cat);
    const s = searchParams?.get("search") || "";
    if (s) setSearchQuery(s);
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

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: String(page),
        limit: String(PAGE_LIMIT),
        sort: sortBy,
      };

      if (budgetRange) {
        const [min, max] = budgetRange.split("-");
        if (min) params.budgetMin = min;
        if (max && max !== "5000+") params.budgetMax = max;
      }
      if (selectedCategory) {
        params.category = selectedCategory;
      }
      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }
      if (taskTypes.length > 0) {
        const typeMap: Record<string, string> = {
          "Quick Fix": "quick-fix",
          "Data Entry": "data-entry",
          "Content Writing": "content-writing",
          "Design Task": "design",
          "Testing": "testing",
          "Research": "research",
          "Other": "other",
        };
        const mapped = taskTypes.map((t) => typeMap[t] || t.toLowerCase());
        params.taskType = mapped.join(",");
      }
      if (workModes.length > 0) {
        params.location = workModes.join(",");
      }

      const res = (await tasksApi.getTasks(params)) as {
        data: Task[];
        pagination?: { page: number; pages: number; total: number };
        pages?: number;
        total?: number;
      };
      setTasks(res.data || []);
      const pagesCount = (res.pagination?.pages ?? res.pages ?? Math.ceil((res.data || []).length / PAGE_LIMIT)) || 1;
      const totalCount = res.pagination?.total ?? res.total ?? (res.data || []).length;
      setTotalPages(pagesCount);
      setTotalTasks(totalCount);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [budgetRange, selectedCategory, debouncedSearch, taskTypes, workModes, sortBy, page]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    setPage(1);
  }, [budgetRange, taskTypes, workModes, debouncedSearch, selectedCategory, sortBy]);

  const toggleCheckbox = (
    value: string,
    list: string[],
    setter: (list: string[]) => void
  ) => {
    setter(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const hasFilters = !!(budgetRange || taskTypes.length > 0 || workModes.length > 0 || searchQuery.trim() || selectedCategory);

  const clearFilters = () => {
    setBudgetRange(""); setTaskTypes([]); setWorkModes([]); setSearchQuery(""); setSelectedCategory(""); setPage(1);
  };

  // Database-backed tasks list
  const filteredTasks = useMemo(() => {
    return tasks;
  }, [tasks]);

  const displayedTasks = useMemo(() => {
    return tasks;
  }, [tasks]);


  const FilterPanel = () => (
    <div>

      {/* Budget Range */}
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Budget Range
        </h4>
        <div className="space-y-2">
          {[
            { label: "Any Budget", value: "" },
            { label: "Under ₹500", value: "0-500" },
            { label: "₹500 – ₹1,500", value: "500-1500" },
            { label: "₹1,500 – ₹5,000", value: "1500-5000" },
            { label: "₹5,000 – ₹15,000", value: "5000-15000" },
            { label: "₹15,000+", value: "15000-999999" },
          ].map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="budget"
                value={opt.value}
                checked={budgetRange === opt.value}
                onChange={(e) => setBudgetRange(e.target.value)}
                className="w-4 h-4 accent-[#1e3a5f]"
              />
              <span className="text-sm text-gray-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Task Type */}
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Task Type
        </h4>
        <div className="space-y-2">
          {["Quick Fix", "Data Entry", "Content Writing", "Design Task", "Testing", "Research", "Other"].map((type) => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={taskTypes.includes(type)}
                onChange={() => toggleCheckbox(type, taskTypes, setTaskTypes)}
                className="w-4 h-4 accent-[#1e3a5f] rounded"
              />
              <span className="text-sm text-gray-700">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Work Mode */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Work Mode
        </h4>
        <div className="space-y-2">
          {["Remote", "On-site", "Hybrid"].map((mode) => (
            <label key={mode} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={workModes.includes(mode)}
                onChange={() => toggleCheckbox(mode, workModes, setWorkModes)}
                className="w-4 h-4 accent-[#1e3a5f] rounded"
              />
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
              {/* Category Tag */}
              <span className="text-[#6366f1] font-bold text-xs tracking-wider uppercase mb-2">
                FIND TASKS
              </span>

              {/* Main Headline */}
              <h1 className="text-2xl sm:text-3xl lg:text-[2.25rem] xl:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.18] mb-2.5">
                Small Tasks. <br className="hidden sm:inline" />
                Big <span className="text-[#6366f1]">Opportunities.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-slate-600 text-xs sm:text-sm font-normal max-w-lg mb-4 leading-relaxed">
                From quick fixes to micro projects, get things done fast and get paid instantly.
              </p>

              {/* Feature Highlights Cards */}
              <div className="grid grid-cols-3 gap-1.5 sm:flex sm:items-center sm:gap-2.5 mb-4">
                <div className="flex items-center justify-center gap-1 sm:gap-2 bg-white px-1.5 sm:px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
                  <span className="p-0.5 sm:p-1 rounded-md sm:rounded-lg bg-purple-50 text-purple-600 border border-purple-200/50 shrink-0">
                    <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </span>
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-800 truncate">Instant Payouts</span>
                </div>
                <div className="flex items-center justify-center gap-1 sm:gap-2 bg-white px-1.5 sm:px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
                  <span className="p-0.5 sm:p-1 rounded-md sm:rounded-lg bg-amber-50 text-amber-600 border border-amber-200/50 shrink-0">
                    <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </span>
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-800 truncate">100% Secure</span>
                </div>
                <div className="flex items-center justify-center gap-1 sm:gap-2 bg-white px-1.5 sm:px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
                  <span className="p-0.5 sm:p-1 rounded-md sm:rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200/50 shrink-0">
                    <Percent className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </span>
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-800 truncate">Zero Commission</span>
                </div>
              </div>

              {/* Quick Live Stats Row (Centered layout with smaller description) */}
              <div className="grid grid-cols-3 gap-1 pt-3 border-t border-slate-200/70 w-full max-w-md">
                <div className="text-center flex flex-col items-center">
                  <p className="text-base sm:text-lg font-extrabold text-slate-900 leading-none">15K+</p>
                  <p className="text-[9px] sm:text-[11px] text-slate-500 font-medium mt-1 whitespace-nowrap">Active Tasks</p>
                </div>
                <div className="text-center flex flex-col items-center">
                  <p className="text-base sm:text-lg font-extrabold text-slate-900 leading-none">₹500+</p>
                  <p className="text-[9px] sm:text-[11px] text-slate-500 font-medium mt-1 whitespace-nowrap">Avg Payout</p>
                </div>
                <div className="text-center flex flex-col items-center">
                  <p className="text-base sm:text-lg font-extrabold text-slate-900 leading-none">24h</p>
                  <p className="text-[9px] sm:text-[11px] text-slate-500 font-medium mt-1 whitespace-nowrap">Instant Payout</p>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Girl Illustration + Organic Purple Background + Floating Cards */}
            <div className="hidden lg:flex lg:col-span-6 relative items-center justify-end min-h-[320px] xl:min-h-[360px] lg:pr-2 xl:pr-6">
              {/* Organic Soft Purple Blob Background */}
              <div className="absolute w-[360px] xl:w-[420px] h-[300px] xl:h-[340px] bg-[#f0edff] rounded-[65%_35%_60%_40%/50%_60%_40%_50%] pointer-events-none -z-0 right-0 xl:right-4" />

              {/* Girl Image */}
              <div className="relative z-10 w-[400px] xl:w-[470px] h-auto flex items-center justify-end">
                <Image
                  src="/tsk.png"
                  alt="Find Tasks Illustration"
                  width={560}
                  height={560}
                  priority
                  className="object-contain drop-shadow-md w-full h-auto"
                />
              </div>

              {/* Floating Card 1: Top Left - Tasks Completed */}
              <div className="absolute top-4 left-0 xl:left-4 z-20 bg-white/95 backdrop-blur-md rounded-xl p-2.5 shadow-lg border border-slate-100/80 w-36 transition-transform duration-300 hover:scale-105">
                <p className="text-[10px] font-medium text-slate-500 mb-0.5">Tasks Completed</p>
                <p className="text-xs font-extrabold text-slate-900">1,248</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[9px] font-semibold text-slate-500">+32 this week</span>
                  <div className="h-3.5 w-10">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 50 20" fill="none">
                      <path
                        d="M0 16 Q 15 5, 30 12 T 50 4"
                        stroke="#10b981"
                        strokeWidth="2"
                        strokeLinecap="round"
                        fill="none"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Floating Card 2: Top Right - Work From Anywhere */}
              <div className="absolute top-0 right-0 xl:right-2 z-20 bg-white/95 backdrop-blur-md rounded-xl px-3 py-2 shadow-lg border border-slate-100/80 flex items-center gap-2 transition-transform duration-300 hover:scale-105">
                <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={14} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-900 leading-tight">Work From</p>
                  <p className="text-[9px] text-slate-500 font-medium">Anywhere</p>
                </div>
              </div>

              {/* Floating Card 3: Middle Right - Flexible Time */}
              <div className="absolute bottom-2 right-2 xl:right-6 z-20 bg-white/95 backdrop-blur-md rounded-xl px-3 py-2 shadow-lg border border-slate-100/80 flex items-center gap-2 transition-transform duration-300 hover:scale-105">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Clock size={15} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-900 leading-tight">Flexible Time</p>
                  <p className="text-[9px] text-slate-500 font-medium">Your Schedule</p>
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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
                  placeholder="Search by task title, skill, or keyword.."
                  className="w-full text-slate-900 text-xs sm:text-sm placeholder:text-slate-400 bg-transparent border-none focus:outline-none font-normal"
                />
              </div>

              {/* Vertical Divider */}
              <div className="hidden md:block w-[1px] h-7 bg-slate-200 shrink-0" />

              {/* Category & Task Type Selects (Side-by-side in 1 row on mobile) */}
              <div className="grid grid-cols-2 gap-2 md:contents">
                {/* All Categories Dropdown */}
                <div className="relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2.5 md:py-1.5 md:w-52 shrink-0 bg-slate-50/80 md:bg-transparent rounded-xl md:rounded-none">
                  <LayoutGrid className="text-slate-400 shrink-0" size={15} />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full text-slate-700 text-xs sm:text-sm bg-transparent border-none focus:outline-none appearance-none cursor-pointer pr-5 font-medium truncate"
                  >
                    <option value="">All Categories</option>
                    <option value="Quick Fix">Quick Fix</option>
                    <option value="Data Entry">Data Entry</option>
                    <option value="Content Writing">Content Writing</option>
                    <option value="Design Task">Design Task</option>
                    <option value="Testing">Testing</option>
                    <option value="Research">Research</option>
                    <option value="Other">Other</option>
                  </select>
                  <ChevronDown className="absolute right-2 text-slate-400 pointer-events-none" size={14} />
                </div>

                {/* Vertical Divider */}
                <div className="hidden md:block w-[1px] h-7 bg-slate-200 shrink-0" />

                {/* Task Type Dropdown */}
                <div className="relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2.5 md:py-1.5 md:w-48 shrink-0 bg-slate-50/80 md:bg-transparent rounded-xl md:rounded-none">
                  <Bookmark className="text-slate-400 shrink-0" size={15} />
                  <select
                    value={taskTypes[0] || ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      setTaskTypes(v ? [v] : []);
                    }}
                    className="w-full text-slate-700 text-xs sm:text-sm bg-transparent border-none focus:outline-none appearance-none cursor-pointer pr-5 font-medium truncate"
                  >
                    <option value="">Task Type</option>
                    <option value="Quick Fix">Quick Fix</option>
                    <option value="Data Entry">Data Entry</option>
                    <option value="Content Writing">Content Writing</option>
                    <option value="Design Task">Design Task</option>
                    <option value="Testing">Testing</option>
                    <option value="Research">Research</option>
                    <option value="Other">Other</option>
                  </select>
                  <ChevronDown className="absolute right-2 text-slate-400 pointer-events-none" size={14} />
                </div>
              </div>

              {/* Search Button */}
              <button
                onClick={() => setPage(1)}
                className="w-full md:w-auto bg-[#6366f1] hover:bg-[#4f46e5] text-white text-xs sm:text-sm font-bold px-7 py-3 rounded-xl transition-all duration-200 shadow-md cursor-pointer whitespace-nowrap active:scale-98 shrink-0 flex items-center justify-center gap-2"
              >
                <Search size={15} className="md:hidden" />
                <span>Search Tasks</span>
              </button>
            </div>
          </div>

          {/* CATEGORY PILLS BAR (Inside Hero Container for Perfect Vertical Alignment) */}
          <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto scrollbar-hide no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pt-4 pb-1">
            {/* Left "All Categories" Badge */}
            <button
              onClick={() => {
                setSelectedCategory("");
                setPage(1);
              }}
              className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm shrink-0 border transition-colors cursor-pointer ${!selectedCategory
                ? "bg-[#eef2ff] text-[#4f46e5] border-[#c7d2fe]"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
            >
              <LayoutGrid size={15} />
              <span>All Categories</span>
            </button>

            {/* Category Pills */}
            {[
              { label: "Quick Fix", value: "Quick Fix", icon: Zap },
              { label: "Data Entry", value: "Data Entry", icon: FileText },
              { label: "Content Writing", value: "Content Writing", icon: PenTool },
              { label: "Design Task", value: "Design Task", icon: Palette },
              { label: "Testing", value: "Testing", icon: FlaskConical },
              { label: "Research", value: "Research", icon: Search },
              { label: "Other", value: "Other", icon: MoreHorizontal },
            ].map((cat) => {
              const isActive = selectedCategory.toLowerCase() === cat.value.toLowerCase();
              const Icon = cat.icon;
              return (
                <button
                  key={cat.label}
                  onClick={() => {
                    setSelectedCategory(isActive ? "" : cat.value);
                    setPage(1);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 border ${isActive
                    ? "bg-[#eef2ff] text-[#4f46e5] border-[#c7d2fe] shadow-2xs font-bold"
                    : "bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                >
                  <Icon size={14} className={isActive ? "text-[#4f46e5]" : "text-slate-400"} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

        </div>
      </section>


      {/* Mobile filter drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setFiltersOpen(false)}
          />
          {/* Drawer */}
          <div className="relative ml-auto w-72 max-w-full h-full bg-white overflow-y-auto shadow-2xl">
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
                    { label: "Latest First", value: "latest" },
                    { label: "Highest Budget", value: "budget-high" },
                    { label: "Lowest Budget", value: "budget-low" },
                    { label: "Urgent Deadline", value: "deadline" },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setSortBy(opt.value)}
                      className={cn(
                        "w-full text-left py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-between",
                        sortBy === opt.value
                          ? "bg-[#1e3a5f]/8 text-[#1e3a5f] font-semibold"
                          : "text-gray-700 hover:bg-gray-50"
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
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6 items-start">
          {/* Sidebar — desktop only */}
          <aside className="hidden lg:block w-64 xl:w-72 flex-shrink-0 sticky top-[calc(var(--navbar-height)+1.5rem)] self-start max-h-[calc(100vh-var(--navbar-height)-3rem)] overflow-y-auto">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2d5282] p-4 text-white">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-sm">Filters</h3>
                  {(budgetRange || taskTypes.length > 0 || workModes.length > 0) && (
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
                <FilterPanel />
              </div>
            </div>
          </aside>

          {/* Task Cards */}
          <main className="flex-1 min-w-0">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse"
                  >
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
            ) : filteredTasks.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <ClipboardList size={40} className="mx-auto mb-3 text-gray-350" />
                <p className="text-gray-500 font-medium">No tasks found matching your criteria.</p>
                <p className="text-sm text-gray-450 mt-2">Try adjusting your filters or check back later for new tasks.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col gap-4">
                  {displayedTasks.map((task) => (
                    <TaskCard key={task._id} task={task} />
                  ))}
                </div>
                <Pagination
                  page={page}
                  pages={totalPages}
                  total={totalTasks}
                  limit={PAGE_LIMIT}
                  onPageChange={(n) => {
                    setPage(n);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              </div>
            )}
          </main>
        </div>
      </div>
      {/* Floating Filter FAB for Mobile on Scroll */}
      {showFloatingButton && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 md:hidden">
          <button
            onClick={() => setFiltersOpen(true)}
            className="flex items-center gap-3 bg-[#1e3a5f] hover:bg-[#2d5282] active:scale-95 text-white rounded-full shadow-2xl px-5 py-3 border border-white/10 backdrop-blur-sm transition-all duration-200"
          >
            <SlidersHorizontal size={15} />
            <span className="text-sm font-semibold">Filters & Sort</span>
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
