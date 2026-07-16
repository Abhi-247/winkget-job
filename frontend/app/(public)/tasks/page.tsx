"use client";

import { useEffect, useState, useCallback } from "react";
import { tasksApi } from "@/lib/api";
import { Task } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { MapPin, Star, ChevronDown, SlidersHorizontal, X, Clock, ClipboardList, Calendar } from "lucide-react";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import Link from "next/link";

export default function FindTaskPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("latest");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filter states
  const [budgetRange, setBudgetRange] = useState<string>("");
  const [taskTypes, setTaskTypes] = useState<string[]>([]);
  const [workModes, setWorkModes] = useState<string[]>([]);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};

      if (budgetRange) {
        const [min, max] = budgetRange.split("-");
        if (min) params.budgetMin = min;
        if (max) params.budgetMax = max;
      }

      const res = (await tasksApi.getTasks(params)) as { data: Task[] };
      setTasks(res.data || []);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [budgetRange]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const toggleCheckbox = (
    value: string,
    list: string[],
    setter: (list: string[]) => void
  ) => {
    setter(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  // Client-side filtering & sorting
  const getFilteredAndSortedTasks = () => {
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

    // Filter by Work Mode (Location Remote / On-site / Hybrid)
    if (workModes.length > 0) {
      result = result.filter(task => {
        const locationLower = task.location?.toLowerCase() || "";
        const isRemote = locationLower.includes("remote");
        const isHybrid = locationLower.includes("hybrid");
        
        return workModes.some(mode => {
          if (mode === "Remote") return isRemote;
          if (mode === "Hybrid") return isHybrid;
          if (mode === "On-site") return !isRemote && !isHybrid;
          return false;
        });
      });
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
  };

  const filteredTasks = getFilteredAndSortedTasks();

  const FilterPanel = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-gray-900">Filters</h3>
        {(budgetRange || taskTypes.length > 0 || workModes.length > 0) && (
          <button
            onClick={() => {
              setBudgetRange("");
              setTaskTypes([]);
              setWorkModes([]);
            }}
            className="text-xs text-red-600 hover:underline font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Budget Range */}
      <div className="mb-5">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
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
      <div className="mb-5">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
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
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
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
      {/* Blue Header */}
      <div className="bg-[#1e3a5f] text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-3 opacity-90">
            <Link href="/" className="hover:underline">Home</Link>
            <span className="opacity-60">›</span>
            <span className="font-medium">Find Task</span>
          </div>

          {/* Title row */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight">Find Task</h1>
              <p className="text-blue-100 text-sm mt-0.5">{filteredTasks.length} small projects & quick tasks available</p>
            </div>

            {/* Sort */}
            <div className="relative flex items-center gap-2 flex-shrink-0">
              <span className="hidden sm:block text-sm text-gray-200">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white/10 hover:bg-white/15 text-white text-sm px-3 py-2 pr-8 rounded-lg border border-[#d4a017]/60 hover:border-[#d4a017] focus:outline-none focus:ring-2 focus:ring-[#d4a017] appearance-none cursor-pointer transition-all duration-200"
              >
                <option value="latest" className="bg-[#1e3a5f] text-white">Latest First</option>
                <option value="budget-high" className="bg-[#1e3a5f] text-white">Highest Budget</option>
                <option value="budget-low" className="bg-[#1e3a5f] text-white">Lowest Budget</option>
                <option value="deadline" className="bg-[#1e3a5f] text-white">Urgent Deadline</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/80" size={14} />
            </div>
          </div>

          {/* Mobile filter toggle button */}
          <button
            onClick={() => setFiltersOpen(true)}
            className="mt-4 flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-[#d4a017]/60 hover:border-[#d4a017] text-white text-sm px-4 py-2 rounded-lg lg:hidden transition-all duration-200"
          >
            <SlidersHorizontal size={15} />
            Filters
          </button>
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
          {/* Sidebar — desktop only */}
          <aside className="hidden lg:block w-64 xl:w-72 flex-shrink-0 sticky top-6">
            <FilterPanel />
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
                {filteredTasks.map((task) => {
                  const employer = typeof task.employer === "object" ? task.employer : null;
                  const companyName = task.companyName || employer?.company || employer?.name || "Client";
                  const location = task.location || "Remote";

                  return (
                    <Link
                      key={task._id}
                      href={`/tasks/${task._id}`}
                      className="block bg-white rounded-xl border border-gray-200 p-4 sm:p-5 hover:shadow-md hover:border-blue-300 transition-all"
                    >
                      {/* Top row: avatar + title + budget */}
                      <div className="flex gap-3 mb-3">
                        <Avatar
                          name={companyName}
                          src={employer?.avatar}
                          size="md"
                          className="flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-0.5 sm:gap-2">
                            {/* Title + client */}
                            <div className="min-w-0">
                              <h3 className="font-semibold text-gray-900 leading-tight truncate">
                                {task.title}
                              </h3>
                              <p className="text-xs text-gray-500 mt-0.5 truncate">
                                {companyName}
                              </p>
                            </div>
                            {/* Budget */}
                            <div className="sm:text-right flex-shrink-0">
                              <p className="font-bold text-[#1e3a5f] text-sm sm:text-base leading-tight">
                                ₹{formatCurrency(task.budget)}
                              </p>
                              <p className="text-xs text-gray-400">Fixed Budget</p>
                            </div>
                          </div>
                          {/* Location & Deadline */}
                          <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                            <span className="flex items-center gap-1">
                              <MapPin size={11} />
                              {location}
                            </span>
                            {task.deadline && (
                              <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-medium border border-amber-200/50">
                                <Calendar size={11} />
                                Ends {new Date(task.deadline).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">
                        {task.description}
                      </p>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {task.skills.slice(0, 5).map((skill) => (
                          <span
                            key={skill}
                            className="px-2.5 py-0.5 bg-[#edf2f7] text-[#1e3a5f] text-xs rounded-full border border-[#1e3a5f]/20"
                          >
                            {skill}
                          </span>
                        ))}
                        {task.skills.length > 5 && (
                          <span className="px-2.5 py-0.5 bg-gray-100 text-gray-400 text-xs rounded-full border border-gray-200">
                            +{task.skills.length - 5} more
                          </span>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-100 text-xs text-gray-500">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 bg-orange-50 text-orange-700 rounded border border-orange-200 font-medium capitalize">
                            {task.taskType}
                          </span>
                          <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded border border-purple-200 font-medium">
                            {task.location}
                          </span>
                          <span className="flex items-center gap-0.5 text-yellow-400">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                size={11}
                                fill={s <= 4 ? "currentColor" : "none"}
                                className={s <= 4 ? "text-yellow-400" : "text-gray-300"}
                              />
                            ))}
                          </span>
                        </div>
                        <span className="text-gray-400">{formatRelativeTime(task.createdAt)}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
