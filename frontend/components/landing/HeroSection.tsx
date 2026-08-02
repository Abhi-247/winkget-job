"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Search,
  MapPin,
  ChevronDown,
  Briefcase,
  Shield,
  Percent,
  Users,
  Star,
  UserCheck,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";

const experienceLevels = [
  "Experience Level",
  "Entry Level",
  "Intermediate",
  "Expert",
];

const locations = [
  "Location",
  "Remote",
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
];

const popularTags = [
  "React Developer",
  "UI Designer",
  "Content Writer",
  "SEO Expert",
];

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("Experience Level");
  const [location, setLocation] = useState("Location");
  const [expOpen, setExpOpen] = useState(false);
  const [locOpen, setLocOpen] = useState(false);
  const router = useRouter();

  const handleSearch = (queryOverride?: string) => {
    const q = queryOverride !== undefined ? queryOverride : searchQuery;
    const params = new URLSearchParams();
    if (q) params.set("search", q);
    if (experienceLevel !== "Experience Level") {
      params.set("experience", experienceLevel);
    }
    if (location !== "Location") {
      params.set("location", location);
    }
    router.push(`/jobs?${params.toString()}`);
  };

  return (
    <section className="relative pt-6 pb-4 sm:pt-10 sm:pb-6 lg:pt-12 lg:pb-6 bg-[#faf8f5] overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#fef9c3] text-[#92400e] text-xs sm:text-sm font-semibold mb-6">
              <Shield className="w-4 h-4 text-[#d97706]" />
              <span>India&apos;s trusted platform for work &amp; hiring</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-[3.25rem] xl:text-[3.5rem] font-bold text-[#0f172a] leading-[1.14] tracking-tight mb-5">
              Where India&apos;s best talent meets{" "}
              <span className="relative inline-block text-[#d97706]">
                freedom
                <svg
                  className="absolute -bottom-1.5 left-0 w-full"
                  height="8"
                  viewBox="0 0 160 8"
                  fill="none"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3 5C45 2 115 2 157 5"
                    stroke="#eab308"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-slate-600 text-base sm:text-lg mb-8 leading-relaxed max-w-xl font-normal">
              Post projects, discover skilled freelancers, and hire developers,
              designers, writers &amp; marketers — with zero platform fees and
              escrow-protected payments.
            </p>

            {/* Search Bar Card - Seamless Pill without borders */}
            <div className="w-full lg:w-[125%] xl:w-[135%] max-w-4xl mb-6 relative z-20">
              {/* Desktop / Tablet Search Bar */}
              <div className="hidden sm:flex items-center bg-white rounded-full shadow-[0_10px_25px_-5px_rgba(0,0,0,0.08)] p-2 border border-slate-100/80">
                {/* Text Input */}
                <div className="flex items-center gap-2.5 px-4 py-2 flex-1 min-w-[240px]">
                  <Search size={18} className="text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search for skills, roles or keywords"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="w-full text-sm text-slate-800 placeholder-slate-400 outline-none bg-transparent font-medium"
                  />
                </div>

                <div className="h-7 w-px bg-slate-200 shrink-0" />

                {/* Experience Dropdown */}
                <div
                  className="flex items-center gap-2 px-3.5 sm:px-4 py-2 shrink-0 relative cursor-pointer select-none"
                  onClick={() => {
                    setExpOpen(!expOpen);
                    setLocOpen(false);
                  }}
                >
                  <Briefcase size={15} className="text-slate-500" />
                  <span className="text-sm text-slate-700 font-medium whitespace-nowrap">
                    {experienceLevel}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-slate-400 transition-transform duration-200 ${expOpen ? "rotate-180 text-slate-700" : ""
                      }`}
                  />
                  {expOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpOpen(false);
                        }}
                      />
                      <div className="absolute left-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl py-2 z-50">
                        {experienceLevels.map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExperienceLevel(lvl);
                              setExpOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${experienceLevel === lvl
                                ? "bg-slate-100 text-slate-900 font-semibold"
                                : "text-slate-600 hover:bg-slate-50"
                              }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="h-7 w-px bg-slate-200 shrink-0" />

                {/* Location Dropdown */}
                <div
                  className="flex items-center gap-2 px-3.5 sm:px-4 py-2 shrink-0 relative cursor-pointer select-none"
                  onClick={() => {
                    setLocOpen(!locOpen);
                    setExpOpen(false);
                  }}
                >
                  <MapPin size={15} className="text-slate-500" />
                  <span className="text-sm text-slate-700 font-medium whitespace-nowrap">
                    {location}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-slate-400 transition-transform duration-200 ${locOpen ? "rotate-180 text-slate-700" : ""
                      }`}
                  />
                  {locOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocOpen(false);
                        }}
                      />
                      <div className="absolute left-0 top-full mt-2 w-44 bg-white rounded-2xl shadow-xl py-2 z-50">
                        {locations.map((loc) => (
                          <button
                            key={loc}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLocation(loc);
                              setLocOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${location === loc
                                ? "bg-slate-100 text-slate-900 font-semibold"
                                : "text-slate-600 hover:bg-slate-50"
                              }`}
                          >
                            {loc}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Search Button */}
                <button
                  onClick={() => handleSearch()}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#0f172a] hover:bg-[#1e293b] text-white font-medium text-sm transition-all active:scale-[0.98] shrink-0 cursor-pointer border-0 ml-1"
                >
                  <Search size={15} />
                  <span>Search</span>
                </button>
              </div>

              {/* Mobile Search Bar */}
              <div className="flex sm:hidden flex-col gap-2.5 bg-white rounded-3xl p-3 shadow-md">
                <div className="flex items-center gap-2.5 bg-slate-50 rounded-2xl px-3.5 py-3">
                  <Search size={18} className="text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search skills, roles or keywords"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="w-full text-sm text-slate-800 placeholder-slate-400 outline-none bg-transparent font-medium"
                  />
                </div>
                <button
                  onClick={() => handleSearch()}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#0f172a] text-white font-semibold text-sm active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Search size={16} />
                  <span>Search</span>
                </button>
              </div>
            </div>

            {/* Popular Searches */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Popular:</span>
              {popularTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setSearchQuery(tag);
                    handleSearch(tag);
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-white text-slate-700 hover:bg-slate-50 transition-all font-medium cursor-pointer shadow-2xs border-0"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN - Hidden on mobile/tablet (< lg), visible on desktop (lg+) */}
          <div className="hidden lg:flex lg:col-span-5 justify-end relative mt-6 lg:mt-0">
            <div className="relative w-full max-w-[600px] lg:max-w-none">

              {/* Base Workspace Image */}
              <Image
                src="/hero-workspace.png"
                alt="Hero Workspace Setup"
                width={650}
                height={520}
                priority
                className="w-full h-auto object-contain"
              />

              {/* BADGE 1: Verified Talent (Top Left) */}
              <div className="absolute top-2 left-2 sm:top-6 sm:left-4 bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 shadow-[0_12px_30px_-5px_rgba(0,0,0,0.06)] flex items-center gap-3.5 z-20">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                  <UserCheck size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-xs sm:text-sm leading-tight">
                    Verified Talent
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5">
                    50K+ professionals
                  </p>
                </div>
              </div>

              {/* BADGE 2: Project Budget (Middle Right) */}
              {/* <div className="absolute top-[28%] right-[8%] sm:top-[28%] sm:right-[12%] bg-white/95 backdrop-blur-md rounded-2xl p-3.5 sm:p-4.5 shadow-[0_15px_30px_-5px_rgba(0,0,0,0.07)] z-20 min-w-[200px] sm:min-w-[230px]">
                <span className="text-[11px] sm:text-xs text-slate-400 font-medium">
                  Project Budget
                </span>
                <div className="flex items-center justify-between gap-3 my-1">
                  <span className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                    ₹2,45,000
                  </span>
                  <svg className="w-16 h-8 text-emerald-500" viewBox="0 0 70 30" fill="none">
                    <path
                      d="M3 25 C15 22, 25 15, 35 18 C45 21, 55 8, 67 5"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M3 25 C15 22, 25 15, 35 18 C45 21, 55 8, 67 5 L67 30 L3 30 Z"
                      fill="currentColor"
                      fillOpacity="0.12"
                    />
                  </svg>
                </div>
                <div className="flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-emerald-600">
                  <TrendingUp size={13} />
                  <span>18% this month</span>
                </div>
              </div> */}

              {/* BADGE 3: Payments Secured (Bottom Right) */}
              <div className="absolute bottom-[16%] right-2 sm:bottom-[18%] sm:right-6 bg-white/95 backdrop-blur-md rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 shadow-[0_12px_30px_-5px_rgba(0,0,0,0.06)] flex items-center gap-4 z-20 min-w-[190px] sm:min-w-[210px]">
                <div>
                  <p className="text-[11px] sm:text-xs text-slate-400 font-medium">
                    Payments Secured
                  </p>
                  <p className="text-lg sm:text-xl font-extrabold text-slate-800 leading-tight">
                    100%
                  </p>
                </div>
                <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                  <ShieldCheck size={20} />
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* BOTTOM FEATURE BAR - 2 Rows (2x2 Grid) on Mobile, 4 Columns on Desktop */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.04)] p-3.5 sm:p-6 mt-6 sm:mt-8 w-full">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-0 divide-y-0 lg:divide-x divide-slate-100">

            {/* Feature 1 */}
            <div className="flex items-center justify-center gap-2.5 sm:gap-3.5 px-2 sm:px-3 lg:px-2 xl:px-4">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Shield size={18} className="sm:w-5 sm:h-5" />
              </div>
              <div className="flex flex-col justify-center my-auto">
                <h4 className="font-bold text-slate-900 text-sm sm:text-base lg:text-sm xl:text-base leading-snug">
                  Escrow Protected
                </h4>
                <p className="hidden sm:block text-[10px] sm:text-[11px] lg:text-[10px] xl:text-[11px] text-slate-400 font-normal leading-snug mt-0.5 whitespace-nowrap">
                  Your payments are 100% safe
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-center justify-center gap-2.5 sm:gap-3.5 px-2 sm:px-3 lg:px-2 xl:px-4">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Percent size={18} className="stroke-[2.5] sm:w-5 sm:h-5" />
              </div>
              <div className="flex flex-col justify-center my-auto">
                <h4 className="font-bold text-slate-900 text-sm sm:text-base lg:text-sm xl:text-base leading-snug">
                  0% Platform Fee
                </h4>
                <p className="hidden sm:block text-[10px] sm:text-[11px] lg:text-[10px] xl:text-[11px] text-slate-400 font-normal leading-snug mt-0.5 whitespace-nowrap">
                  Keep more of what you earn
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-center justify-center gap-2.5 sm:gap-3.5 px-2 sm:px-3 lg:px-2 xl:px-4">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Users size={18} className="sm:w-5 sm:h-5" />
              </div>
              <div className="flex flex-col justify-center my-auto">
                <h4 className="font-bold text-slate-900 text-sm sm:text-base lg:text-sm xl:text-base leading-snug">
                  50K+ Freelancers
                </h4>
                <p className="hidden sm:block text-[10px] sm:text-[11px] lg:text-[10px] xl:text-[11px] text-slate-400 font-normal leading-snug mt-0.5 whitespace-nowrap">
                  Verified &amp; skilled professionals
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-center justify-center gap-2.5 sm:gap-3.5 px-2 sm:px-3 lg:px-2 xl:px-4">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                <Star size={18} className="fill-rose-500 text-rose-500 sm:w-5 sm:h-5" />
              </div>
              <div className="flex flex-col justify-center my-auto">
                <h4 className="font-bold text-slate-900 text-sm sm:text-base lg:text-sm xl:text-base leading-snug">
                  4.9/5 Rating
                </h4>
                <p className="hidden sm:block text-[10px] sm:text-[11px] lg:text-[10px] xl:text-[11px] text-slate-400 font-normal leading-snug mt-0.5 whitespace-nowrap">
                  Trusted by thousands of users
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}