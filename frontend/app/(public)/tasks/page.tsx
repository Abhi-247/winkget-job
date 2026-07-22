"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { tasksApi } from "@/lib/api";
import { Task } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { MapPin, Star, ChevronDown, SlidersHorizontal, X, Clock, ClipboardList, Calendar, Search } from "lucide-react";
import { formatCurrency, formatRelativeTime, cn } from "@/lib/utils";
import { TaskCard } from "@/components/jobseeker/TaskCard";
import { Pagination } from "@/components/ui/Pagination";
import Link from "next/link";

const PAGE_LIMIT = 12;

export default function FindTaskPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("latest");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const [sortOpen, setSortOpen]                   = useState(false);

  // Pagination states
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);

  // Filter states
  const [budgetRange, setBudgetRange] = useState<string>("");
  const [taskTypes, setTaskTypes] = useState<string[]>([]);
  const [workModes, setWorkModes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

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
      };

      if (budgetRange) {
        const [min, max] = budgetRange.split("-");
        if (min) params.budgetMin = min;
        if (max) params.budgetMax = max;
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
  }, [budgetRange, page]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    setPage(1);
  }, [budgetRange, taskTypes, workModes, searchQuery, selectedCategory]);

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

  // Client-side filtering & sorting
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Filter by Task Type
    if (taskTypes.length > 0) {
      result = result.filter(task => {
        // Map labels to taskType keys
        const typeMap: Record<string, string> = {
          "Quick Fix": "quick-fix",
          "Data Entry": "data-entry",
          "Content Writing": "content-writing",
          "Design Task": "design",
          "Testing": "testing",
          "Research": "research",
          "Other": "other"
        };
        const mappedTypes = taskTypes.map(t => typeMap[t] || t.toLowerCase());
        return mappedTypes.includes(task.taskType);
      });
    }

    // Filter by Selected Popular Category
    if (selectedCategory) {
      const cat = selectedCategory.toLowerCase();
      const typeMap: Record<string, string> = {
        "quick fix": "quick-fix",
        "data entry": "data-entry",
        "content writing": "content-writing",
        "design task": "design",
        "testing": "testing",
        "research": "research",
      };
      const mapped = typeMap[cat] || cat;
      result = result.filter(task =>
        task.taskType?.toLowerCase().includes(mapped) ||
        task.title?.toLowerCase().includes(cat) ||
        (task.description && task.description.toLowerCase().includes(cat))
      );
    }

    // Filter by Work Mode (Location Remote / On-site / Hybrid)
    if (workModes.length > 0) {
      result = result.filter(task => {
        const loc = (task.location || "remote").toLowerCase();
        return workModes.some(mode => loc.includes(mode.toLowerCase()));
      });
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(task =>
        task.title.toLowerCase().includes(q) ||
        (task.description && task.description.toLowerCase().includes(q)) ||
        (task.companyName && task.companyName.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sortBy === "latest") {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === "budget-high") {
      result.sort((a, b) => b.budget - a.budget);
    } else if (sortBy === "budget-low") {
      result.sort((a, b) => a.budget - b.budget);
    } else if (sortBy === "deadline") {
      result.sort((a, b) => {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });
    }

    return result;
  }, [tasks, budgetRange, taskTypes, workModes, searchQuery, selectedCategory, sortBy]);


  const displayedTasks = useMemo(() => {
    if (filteredTasks.length <= PAGE_LIMIT) return filteredTasks;
    const start = (page - 1) * PAGE_LIMIT;
    return filteredTasks.slice(start, start + PAGE_LIMIT);
  }, [filteredTasks, page]);


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
      <div className="bg-[#1e3a5f] text-white py-14 sm:py-16 lg:py-20 relative overflow-hidden">
        {/* Glowing background color blobs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#d4a017]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 left-1/4 w-80 h-80 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -left-20 w-64 h-64 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm mb-4 text-white/70">
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                <span>›</span>
                <span className="text-white font-medium">Find Task</span>
              </div>

              {/* Title row + Sort */}
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="min-w-0">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">Find Tasks & Micro-Gigs</h1>
                  <p className="hidden sm:flex text-white/70 text-sm mt-1.5 items-center gap-2">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#d4a017]" />
                    {filteredTasks.length} small projects & quick tasks available
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
                    <option value="budget-high" className="bg-[#1e3a5f]">Highest Budget</option>
                    <option value="budget-low"  className="bg-[#1e3a5f]">Lowest Budget</option>
                    <option value="deadline"    className="bg-[#1e3a5f]">Urgent Deadline</option>
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
                    placeholder="Search by task title, skill, or type..."
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

              {/* Search bar - Mobile version */}
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

              {/* Popular categories chips */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scrollbar-none py-1 max-w-full">
                <span className="text-white/70 text-xs font-semibold flex-shrink-0 mr-1">Popular:</span>
                {["Quick Fix", "Data Entry", "Content Writing", "Design Task", "Testing", "Research"].map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(prev => prev === cat ? "" : cat);
                      setPage(1);
                    }}
                    className={cn(
                      "px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 cursor-pointer flex-shrink-0 whitespace-nowrap shadow-xs",
                      selectedCategory === cat
                        ? "bg-[#d4a017] border-[#d4a017] text-white shadow-md font-semibold scale-105"
                        : "bg-white/10 border-white/20 text-white/90 hover:bg-white/20 hover:border-white/40"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>

            </div>

            {/* Desktop Only Right Visual Card with Blurred Image & Glass Floaters */}
            <div className="hidden lg:flex lg:col-span-5 relative items-center justify-center pl-4">
              <div className="relative w-full max-w-sm aspect-[4/3] rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-white/5 backdrop-blur-md p-6 flex flex-col justify-between group">
                {/* Blurred Background Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center filter blur-[2px] scale-110 opacity-40 mix-blend-overlay transition-transform duration-700 group-hover:scale-115"
                  style={{ backgroundImage: "url('https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&auto=format&fit=crop')" }}
                />
                
                {/* Top Badge */}
                <div className="relative z-10 self-start backdrop-blur-md bg-white/15 border border-white/25 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-lg transform -rotate-1 group-hover:rotate-0 transition-transform duration-300">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                    ⚡
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Instant Claims</p>
                    <p className="text-[10px] text-white/80">Get Paid Same Day</p>
                  </div>
                </div>

                {/* Bottom Floating Card */}
                <div className="relative z-10 self-end backdrop-blur-lg bg-[#0f172a]/85 border border-white/20 px-4 py-3 rounded-2xl flex items-center gap-3 shadow-xl max-w-[240px] transform translate-x-2 group-hover:translate-x-0 transition-transform duration-300">
                  <div className="w-8 h-8 rounded-full bg-[#d4a017] text-white font-bold flex items-center justify-center text-xs shadow-xs flex-shrink-0">
                    ₹
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">₹0 Commission Fee</p>
                    <p className="text-[10px] text-emerald-400 font-medium">Keep 100% of payout</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


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
                <h3 className="font-semibold text-sm">Filters</h3>
                <p className="text-xs text-white/60">Refine your search</p>
              </div>
              <button onClick={() => setFiltersOpen(false)} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-4">
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
                { label: "Highest Budget", value: "budget-high" },
                { label: "Lowest Budget", value: "budget-low" },
                { label: "Urgent Deadline", value: "deadline" }
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
