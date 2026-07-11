"use client";

import {
  useState, useEffect, useCallback, useMemo,
  useRef, FormEvent,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { freelancersApi } from "@/lib/api";
import { User } from "@/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { FilterPanel, FilterSection } from "@/components/ui/FilterPanel";
import { FreelancerCard } from "@/components/talent/FreelancerCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { JobCardSkeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { HireRequestModal } from "@/components/talent/HireRequestModal";
import { useSavedJobs } from "@/lib/hooks";
import { cn, formatCurrency } from "@/lib/utils";
import Link from "next/link";
import {
  Search, SlidersHorizontal, X, Users,
  Code2, Palette, BarChart2, PenLine,
  Video, DollarSign, Wrench, Headphones,
  ArrowRight, ChevronDown,
} from "lucide-react";

// ── Category config ───────────────────────────────────────────────────────────

const CATEGORIES = [
 { name: "Web Development", icon: Code2, skills: ["React", "Node.js"], accent: "from-blue-50 to-indigo-50", iconBg: "bg-blue-100", iconColor: "text-blue-600", border: "hover:border-blue-200" },
 { name: "Design", icon: Palette, skills: ["Figma", "UI/UX"], accent: "from-purple-50 to-pink-50", iconBg: "bg-purple-100", iconColor: "text-purple-600", border: "hover:border-purple-200" },
 { name: "Data Science", icon: BarChart2, skills: ["Python", "ML"], accent: "from-cyan-50 to-sky-50", iconBg: "bg-cyan-100", iconColor: "text-cyan-600", border: "hover:border-cyan-200" },
 { name: "Writing", icon: PenLine, skills: ["SEO", "Content"], accent: "from-green-50 to-emerald-50", iconBg: "bg-green-100", iconColor: "text-green-600", border: "hover:border-green-200" },
 { name: "Video & Animation", icon: Video, skills: ["Motion", "Editing"], accent: "from-red-50 to-orange-50", iconBg: "bg-red-100", iconColor: "text-red-500", border: "hover:border-red-200" },
 { name: "Finance", icon: DollarSign, skills: ["Accounting", "Tax"], accent: "from-yellow-50 to-amber-50", iconBg: "bg-yellow-100", iconColor: "text-yellow-600", border: "hover:border-yellow-200" },
 { name: "Engineering", icon: Wrench, skills: ["CAD", "Mechanical"], accent: "from-slate-50 to-gray-100", iconBg: "bg-slate-100", iconColor: "text-slate-600", border: "hover:border-slate-300" },
 { name: "Customer Service", icon: Headphones, skills: ["Support", "CRM"], accent: "from-teal-50 to-teal-100", iconBg: "bg-teal-100", iconColor: "text-teal-600", border: "hover:border-teal-200" },
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
  { label: "Newest",         value: "newest"    },
  { label: "Rate: High→Low", value: "rate_high" },
  { label: "Rate: Low→High", value: "rate_low"  },
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
  const router       = useRouter();
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

  // Landing search box (separate from sidebar search)
  const [heroSearch,   setHeroSearch]   = useState("");

  // Data
  const [freelancers,  setFreelancers]  = useState<User[]>([]);
  const [topRated,     setTopRated]     = useState<User[]>([]);
  const [total,        setTotal]        = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [topLoading,   setTopLoading]   = useState(true);
  const [hireTarget,   setHireTarget]   = useState<User | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  // Is this a "browse" view (any filter / param active)?
  const isBrowse = !!(debouncedSearch || category || rateRange || expLevels.length || availOnly);

  // ── Build API params ──
  const apiParams = useMemo(() => {
    const p: Record<string, string> = { sort };
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
  }, [debouncedSearch, category, rateRange, expLevels, availOnly, sort]);

  // ── Fetch freelancers ──
  const fetchFreelancers = useCallback(async () => {
    setLoading(true);
    try {
      const res = (await freelancersApi.getAll(apiParams)) as {
        data: User[]; total: number;
      };
      setFreelancers(res.data ?? []);
      setTotal(res.total ?? 0);
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
      const res = (await freelancersApi.getAll({ sort: "rate_high", limit: "4" })) as {
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
    setExpLevels([]); setAvailOnly(false);
  };

  const toggleExp = (v: string) =>
    setExpLevels((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    );

  const handleHeroSearch = (e: FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) setSearch(heroSearch.trim());
  };

  // ── Filter panel (shared desktop + mobile) ──
  const Filters = () => (
    <FilterPanel
      onClear={clearFilters}
      activeCount={activeCount}
    >
      <FilterSection label="Search">
        <Input
          placeholder="Name or skill..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search size={14} />}
        />
      </FilterSection>

      <FilterSection label="Category">
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
      </FilterSection>

      <FilterSection label="Hourly Rate">
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
      </FilterSection>

      <FilterSection label="Experience Level">
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
      </FilterSection>

      <FilterSection label="Availability">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={availOnly}
            onChange={() => setAvailOnly((v) => !v)}
            className="w-4 h-4 accent-[#1e3a5f] rounded"
          />
          <span className="text-sm text-gray-700">Available immediately</span>
        </label>
      </FilterSection>
    </FilterPanel>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-[family-name:var(--font-poppins)]">

      {/* ══ DARK HEADER ══════════════════════════════════════════════════════ */}
      <PageHeader
        dark
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Hire Talent" },
        ]}
        title={category ? category : "Hire Top Talent"}
        subtitle={
          isBrowse
            ? `${total} freelancer${total !== 1 ? "s" : ""} found${activeCount > 1 ? ` · ${activeCount} filters applied` : ""}`
            : "Find skilled professionals for any project"
        }
        right={
          /* Hero search — only shown when not in browse mode */
          !isBrowse ? (
            <form onSubmit={handleHeroSearch} className="flex gap-2 w-full sm:w-auto">
              <Input
                placeholder="Search by skill or name..."
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                leftIcon={<Search size={14} />}
                className="w-56 sm:w-72 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white focus:text-gray-900 focus:placeholder:text-gray-400 transition-colors"
              />
              <Button type="submit" variant="outline" className="border-white text-white hover:bg-white/10">
                Search
              </Button>
            </form>
          ) : (
            /* Sort dropdown in browse mode */
            <div className="relative flex items-center gap-2">
              <span className="text-white/70 text-sm hidden sm:block">Sort by:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-white/10 hover:bg-white/15 text-white text-sm px-3 py-2 pr-8 rounded-lg border border-[#d4a017]/60 hover:border-[#d4a017] focus:outline-none focus:ring-2 focus:ring-[#d4a017] appearance-none cursor-pointer transition-all duration-200"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} className="bg-[#1e3a5f]">
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/80 pointer-events-none"
              />
            </div>
          )
        }
      />

      {/* Popular skill chips — only on landing */}
      {!isBrowse && (
        <div className="bg-[#1e3a5f] border-t border-white/10 pb-5 pt-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-white/50 text-xs mr-1">Popular:</span>
              {["React", "Node.js", "Python", "Figma", "WordPress", "SEO", "Flutter"].map((skill) => (
                <button
                  key={skill}
                  onClick={() => setSearch(skill)}
                  className="text-xs px-3 py-1 rounded-full border border-[#d4a017]/40 text-white/70 hover:border-[#d4a017] hover:text-white transition-colors"
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile filter button */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-2.5 sticky top-16 z-20">
        <button
          onClick={() => setFiltersOpen(true)}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-[#d4a017]/60 hover:border-[#d4a017] bg-[#1e3a5f] text-white text-sm px-4 py-2 rounded-lg transition-all duration-200"
        >
          <SlidersHorizontal size={15} />
          Filters
          {activeCount > 0 && (
            <span className="bg-[#d4a017] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile filter drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setFiltersOpen(false)} />
          <div className="relative ml-auto w-72 h-full bg-gray-50 overflow-y-auto p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-gray-900">Filters</span>
              <button onClick={() => setFiltersOpen(false)} className="p-1 rounded hover:bg-gray-200">
                <X size={18} />
              </button>
            </div>
            <Filters />
          </div>
        </div>
      )}

      {/* Active filter chips */}
      {activeCount > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 flex flex-wrap gap-2">
          {debouncedSearch && (
            <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-[#1e3a5f] rounded-full text-xs font-medium">
              "{debouncedSearch}" <button onClick={() => setSearch("")}><X size={10} /></button>
            </span>
          )}
          {category && (
            <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-[#1e3a5f] rounded-full text-xs font-medium">
              {category} <button onClick={() => setCategory("")}><X size={10} /></button>
            </span>
          )}
          {rateRange && (
            <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-[#1e3a5f] rounded-full text-xs font-medium">
              {RATE_OPTIONS.find((r) => r.value === rateRange)?.label}
              <button onClick={() => setRateRange("")}><X size={10} /></button>
            </span>
          )}
          {expLevels.map((e) => (
            <span key={e} className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-[#1e3a5f] rounded-full text-xs font-medium">
              {EXP_OPTIONS.find((o) => o.value === e)?.label}
              <button onClick={() => toggleExp(e)}><X size={10} /></button>
            </span>
          ))}
          {availOnly && (
            <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-[#1e3a5f] rounded-full text-xs font-medium">
              Available now <button onClick={() => setAvailOnly(false)}><X size={10} /></button>
            </span>
          )}
          <button onClick={clearFilters} className="text-xs text-gray-500 hover:text-gray-700 underline ml-1">
            Clear all
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ══ LANDING VIEW — no filters active ════════════════════════════════ */}
        {!isBrowse && (
          <>
            {/* Stats strip */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-10">
              {[
                { value: "50K+",  label: "Freelancers" },
                { value: "120K+", label: "Projects done" },
                { value: "98%",   label: "Satisfaction" },
                { value: "4.9",   label: "Avg. rating" },
                { value: "24h",   label: "Avg. response" },
              ].map(({ value, label }) => (
                <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
                  <p className="text-2xl font-bold text-[#1e3a5f]">{value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Browse by Category */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Browse by Category</h2>
                <button onClick={() => setSearch(" ")} className="text-sm text-[#1e3a5f] hover:underline flex items-center gap-1">
                  All categories <ArrowRight size={13} />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {CATEGORIES.map(({ name, icon: Icon, skills, iconBg, iconColor }) => (
                  <Card
                    hover
                    key={name}
                    className="p-4 cursor-pointer"
                    onClick={() => setCategory(name)}
                  >
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-2.5", iconBg, iconColor)}>
                      <Icon size={18} />
                    </div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">{name}</p>
                    <div className="flex flex-wrap gap-1">
                      {skills.map((s) => (
                        <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Top Rated Freelancers */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Top Rated Freelancers</h2>
                <button onClick={() => setSort("rate_high")} className="text-sm text-[#1e3a5f] hover:underline flex items-center gap-1">
                  View all <ArrowRight size={13} />
                </button>
              </div>
              {topLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => <JobCardSkeleton key={i} />)}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-10 mb-10">
              <h2 className="text-lg font-bold text-gray-900 text-center mb-8">
                How Hiring Works
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                {[
                  { step: "1", title: "Post a job",      desc: "Describe your project and required skills"        },
                  { step: "2", title: "Browse talent",   desc: "Search our directory of verified freelancers"     },
                  { step: "3", title: "Send a request",  desc: "Reach out with your budget and timeline"          },
                  { step: "4", title: "Start working",   desc: "Chat, collaborate, and get the job done"          },
                ].map(({ step, title, desc }) => (
                  <div key={step} className="text-center">
                    <div className="w-10 h-10 rounded-full bg-[#1e3a5f] text-white font-bold text-sm flex items-center justify-center mx-auto mb-3">
                      {step}
                    </div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">{title}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Banner */}
            <div className="bg-[#1e3a5f] rounded-2xl p-8 sm:p-12 text-center text-white">
              <h2 className="text-xl sm:text-2xl font-bold mb-2">Ready to hire top talent?</h2>
              <p className="text-white/60 text-sm mb-6">
                Join thousands of businesses who trust WinkGetJob for their hiring needs.
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <Button
                  variant="secondary"
                  onClick={() => setSearch(" ")}
                >
                  Browse Freelancers
                </Button>
                <Link href="/register?role=employer">
                  <Button variant="outline" className="border-white text-white hover:bg-white/10">
                    Post a Job
                  </Button>
                </Link>
              </div>
            </div>
          </>
        )}

        {/* ══ BROWSE / FILTER VIEW ════════════════════════════════════════════ */}
        {isBrowse && (
          <div className="flex gap-6 items-start">
            {/* Desktop sidebar */}
            <aside className="hidden lg:block w-64 xl:w-72 flex-shrink-0 sticky top-6">
              <Filters />
            </aside>

            {/* Results */}
            <main className="flex-1 min-w-0">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => <JobCardSkeleton key={i} />)}
                </div>
              ) : freelancers.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200">
                  <EmptyState
                    icon={Users}
                    title="No freelancers found"
                    description="Try adjusting your filters or search term"
                    action={{ label: "Clear filters", onClick: clearFilters }}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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
