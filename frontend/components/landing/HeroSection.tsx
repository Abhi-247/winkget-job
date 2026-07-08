"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, ChevronDown, Star, CheckCircle, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";

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

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("Experience Level");
  const [location, setLocation] = useState("Location");
  const router = useRouter();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (experienceLevel !== "Experience Level")
      params.set("experience", experienceLevel);
    if (location !== "Location") params.set("location", location);
    router.push(`/jobs?${params.toString()}`);
  };

  return (
    <section
      className="relative overflow-hidden bg-[#f8fafc]"
      style={{
        fontFamily: "var(--font-poppins), sans-serif",
      }}
    >
      {/* Dot-grid texture */}
      <div
        className="absolute inset-0 opacity-[0.35] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(30,58,95,0.12) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 30%, black 40%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 30%, black 40%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-13 md:py-16 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="hero-fade-in">
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 bg-[#edf2f7] text-[#1e3a5f] rounded-full px-4 py-1.5 text-sm font-medium mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4a017] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#d4a017]"></span>
              </span>
              <span>Trusted by 50,000+ businesses across India</span>
            </div>

            {/* Main heading */}
            <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-bold text-[#0f172a] leading-[1.15] mb-6 tracking-tight">
              Find the right
              <br />
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-[#1e3a5f] to-[#2c5282] bg-clip-text text-transparent">
                  freelancer
                </span>
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  height="10"
                  viewBox="0 0 200 10"
                  fill="none"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 7C40 2 80 2 100 5C120 8 160 2 198 6"
                    stroke="#d4a017"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <br />
              for your job
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-gray-500 mb-8 leading-relaxed max-w-lg font-normal">
              Hire hourly, weekly, or long-term professionals —
              <br className="hidden sm:block" />
              fast and hassle-free. Connect with top talent
              <br className="hidden sm:block" />
              across 200+ skills.
            </p>

            {/* Search bar */}
            <div className="group bg-white rounded-2xl shadow-lg hover:shadow-xl focus-within:shadow-xl focus-within:ring-2 focus-within:ring-[#d4a017]/40 border border-gray-200 p-1.5 max-w-2xl transition-shadow duration-300">
              {/* Desktop layout */}
              <div className="hidden sm:flex items-center">
                {/* Search input */}
                <div className="flex items-center gap-2 px-4 py-3 flex-1 min-w-[80px]">
                  <Search size={18} className="text-gray-400 flex-shrink-0 group-focus-within:text-[#1e3a5f] transition-colors" />
                  <input
                    type="text"
                    placeholder="Search skills, job titles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="flex-1 text-sm text-gray-800 placeholder-gray-300 outline-none bg-transparent min-w-0"
                    style={{ fontFamily: "var(--font-poppins), sans-serif" }}
                  />
                </div>

                <div className="self-stretch bg-gray-200 flex-shrink-0" style={{ width: "1px", marginTop: "8px", marginBottom: "8px" }}></div>

                {/* Experience Level */}
                <div className="flex items-center gap-2 px-4 py-3 flex-shrink-0">
                  <Briefcase size={16} className="text-gray-400 flex-shrink-0" />
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="text-sm text-gray-600 bg-transparent outline-none appearance-none cursor-pointer font-medium"
                    style={{ fontFamily: "var(--font-poppins), sans-serif" }}
                  >
                    {experienceLevels.map((level) => (
                      <option key={level}>{level}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
                </div>

                <div className="self-stretch bg-gray-200 flex-shrink-0" style={{ width: "1px", marginTop: "8px", marginBottom: "8px" }}></div>

                {/* Location */}
                <div className="flex items-center gap-2 px-4 py-3 flex-shrink-0">
                  <MapPin size={16} className="text-gray-400 flex-shrink-0" />
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="text-sm text-gray-600 bg-transparent outline-none appearance-none cursor-pointer font-medium"
                    style={{ fontFamily: "var(--font-poppins), sans-serif" }}
                  >
                    {locations.map((loc) => (
                      <option key={loc}>{loc}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
                </div>

                {/* Search button */}
                <div className="flex-shrink-0 pl-1">
                  <Button
                    onClick={handleSearch}
                    className="rounded-xl flex items-center gap-2 px-5 py-3 whitespace-nowrap transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98]"
                  >
                    <Search size={16} />
                    Search
                  </Button>
                </div>
              </div>

              {/* Mobile layout */}
              <div className="flex sm:hidden flex-col gap-0">
                {/* Search input */}
                <div className="flex items-center gap-2 px-4 py-3">
                  <Search size={18} className="text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search skills or job title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="flex-1 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
                    style={{ fontFamily: "var(--font-poppins), sans-serif" }}
                  />
                </div>

                <div className="h-px bg-gray-200 mx-3"></div>

                {/* Experience Level */}
                <div className="flex items-center gap-2 px-4 py-3">
                  <Briefcase size={16} className="text-gray-400 flex-shrink-0" />
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="flex-1 text-sm text-gray-600 bg-transparent outline-none appearance-none cursor-pointer font-medium"
                    style={{ fontFamily: "var(--font-poppins), sans-serif" }}
                  >
                    {experienceLevels.map((level) => (
                      <option key={level}>{level}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
                </div>

                <div className="h-px bg-gray-200 mx-3"></div>

                {/* Location */}
                <div className="flex items-center gap-2 px-4 py-3">
                  <MapPin size={16} className="text-gray-400 flex-shrink-0" />
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="flex-1 text-sm text-gray-600 bg-transparent outline-none appearance-none cursor-pointer font-medium"
                    style={{ fontFamily: "var(--font-poppins), sans-serif" }}
                  >
                    {locations.map((loc) => (
                      <option key={loc}>{loc}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
                </div>

                {/* Search button */}
                <Button
                  onClick={handleSearch}
                  className="rounded-xl flex items-center justify-center gap-2 py-3 mt-1 w-full transition-transform duration-200 active:scale-[0.98]"
                >
                  <Search size={16} />
                  Search
                </Button>
              </div>
            </div>

            {/* Popular tags */}
            <div className="flex flex-wrap items-center gap-3 mt-6 text-sm">
              <span className="text-gray-400 font-medium">Popular:</span>
              {["React Developer", "UI Designer", "Content Writer", "SEO Expert"].map(
                (tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSearchQuery(tag);
                      handleSearch();
                    }}
                    className="px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-600 hover:border-[#1e3a5f] hover:text-[#1e3a5f] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-sm font-medium"
                  >
                    {tag}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Right: floating cards */}
          <div className="relative hidden lg:block">
            <div className="relative h-[420px]">
              {/* Main illustration area */}
              <div
                className="hero-float hero-float-1 absolute top-12 right-8 w-64 h-64 rounded-3xl flex items-center justify-center shadow-xl"
                style={{
                  background:
                    "linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%)",
                }}
              >
                {/* subtle inner texture */}
                <div
                  className="absolute inset-0 rounded-3xl opacity-20"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)",
                    backgroundSize: "16px 16px",
                  }}
                  aria-hidden="true"
                />
                {/* Decorative illustration */}
                <div className="relative">
                  {/* Monitor shape */}
                  <div className="w-32 h-24 bg-white/20 rounded-xl relative">
                    <div className="absolute inset-2 bg-white/10 rounded-lg"></div>
                    {/* Chart bars */}
                    <div className="absolute bottom-3 left-3 flex items-end gap-1.5">
                      <div className="w-3 h-6 bg-[#d4a017]/70 rounded-sm"></div>
                      <div className="w-3 h-10 bg-white/50 rounded-sm"></div>
                      <div className="w-3 h-8 bg-[#d4a017]/70 rounded-sm"></div>
                      <div className="w-3 h-12 bg-white/50 rounded-sm"></div>
                    </div>
                  </div>
                  {/* Person emoji */}
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-4xl">
                    😊
                  </div>
                </div>
              </div>

              {/* Profile card - Ayesha Siddiqui */}
              <div className="hero-float hero-float-2 absolute top-0 left-4 bg-white rounded-2xl shadow-xl p-4 w-56 border border-gray-100 z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative">
                    <span className="absolute -inset-0.5 rounded-full bg-[#d4a017]/40 animate-pulse"></span>
                    <Avatar name="Ayesha Siddiqui" size="md" />
                    <span className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 border-2 border-white rounded-full w-3 h-3"></span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Ayesha Siddiqui
                    </p>
                    <p className="text-xs text-gray-500">React Developer</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={12}
                      className="text-amber-400 fill-amber-400"
                    />
                  ))}
                  <span className="text-xs text-gray-500 ml-1">5.0 (128)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#1e3a5f] font-bold text-sm">₹2,500/hr</span>
                  <span className="text-xs bg-[#edf2f7] text-[#1e3a5f] px-2 py-0.5 rounded-full font-medium">
                    Available
                  </span>
                </div>
              </div>

              {/* 98% Success Rate badge */}
              <div className="hero-float hero-float-3 absolute top-2 right-0 bg-white rounded-2xl shadow-xl px-4 py-3 border border-gray-100 z-10 text-center">
                <div className="text-2xl font-black text-[#0f172a] tabular-nums">98%</div>
                <div className="text-xs font-medium text-gray-500">Success Rate</div>
              </div>

              {/* Job Matched notification */}
              <div className="hero-float hero-float-2 absolute bottom-8 right-0 bg-white rounded-2xl shadow-xl p-4 border border-gray-100 z-10 w-56">
                <div className="flex items-start gap-2 mb-2">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#edf2f7] flex items-center justify-center">
                    <CheckCircle size={14} className="text-[#d4a017]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900">Job Matched!</p>
                    <p className="text-xs text-gray-400">2 min ago</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mb-2">
                  UI Designer needed for
                  <br />
                  mobile app
                </p>
                <div className="flex items-center gap-1">
                  {/* Small avatar circles */}
                  <div className="flex -space-x-1.5">
                    <div className="w-5 h-5 rounded-full bg-[#1e3a5f] border-2 border-white"></div>
                    <div className="w-5 h-5 rounded-full bg-[#2c5282] border-2 border-white"></div>
                    <div className="w-5 h-5 rounded-full bg-[#d4a017] border-2 border-white"></div>
                  </div>
                  <span className="text-xs text-gray-500 ml-1">+8 proposals</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle decorative elements */}
      <div
        className="absolute -top-20 -right-20 w-80 h-80 bg-[#1e3a5f] rounded-full opacity-[0.04] blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-10 -left-10 w-52 h-52 bg-[#d4a017] rounded-full opacity-[0.04] blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <style jsx>{`
        @keyframes heroFadeIn {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .hero-fade-in {
          animation: heroFadeIn 0.6s ease-out both;
        }

        @keyframes floatY {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        .hero-float {
          animation: floatY 6s ease-in-out infinite;
        }
        .hero-float-1 {
          animation-delay: 0s;
          animation-duration: 7s;
        }
        .hero-float-2 {
          animation-delay: 0.6s;
          animation-duration: 5.5s;
        }
        .hero-float-3 {
          animation-delay: 1.2s;
          animation-duration: 6.5s;
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-fade-in,
          .hero-float {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}