"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  ChevronDown,
  Briefcase,
  Code2,
  Palette,
  Database,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Google, Github, Linkedin, Twitter } from "@/components/ui/BrandIcons";
import Image from "next/image";

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
  const [expOpen, setExpOpen] = useState(false);
  const [locOpen, setLocOpen] = useState(false);
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
      className="relative overflow-hidden bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] py-8 lg:py-12"
      style={{
        fontFamily: "var(--font-poppins), sans-serif",
      }}
    >
      {/* Background patterns */}
      <div
        className="absolute inset-0 opacity-[0.25] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(30,58,95,0.15) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          maskImage:
            "radial-gradient(ellipse 80% 80% at 50% 30%, black 50%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 80% at 50% 30%, black 50%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      {/* Decorative blurred gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gradient-to-tr from-[#1e3a5f]/10 to-[#d4a017]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-[#2c5282]/15 to-[#d4a017]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* Left content (8 cols on large screens) */}
          <div className="lg:col-span-8 hero-fade-in flex flex-col justify-center">

            {/* Glowing Tagline */}
            <div className="inline-flex items-center gap-2 bg-[#edf2f7] hover:bg-[#e2e8f0] transition-colors duration-300 text-[#1e3a5f] rounded-full px-4.5 py-2 text-xs font-semibold mb-6 shadow-sm mr-auto">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4a017] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#d4a017]"></span>
              </span>
              <span>Trusted by 50,000+ businesses across India</span>
            </div>

            {/* Main heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.15] mb-6 tracking-tight">
              Hire top-tier{" "}
              <span className="relative inline-block my-1">
                <span className="bg-gradient-to-r from-[#1e3a5f] via-[#2c5282] to-[#d4a017] bg-clip-text text-transparent font-black">
                  freelancers
                </span>
                <svg
                  className="absolute -bottom-2 left-0 w-full text-[#d4a017]"
                  height="10"
                  viewBox="0 0 200 10"
                  fill="none"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 7C40 2 80 2 100 5C120 8 160 2 198 6"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>{" "}
              for any project.
            </h1>

            {/* Subtitle */}
            <p className="text-base md:text-lg text-slate-500 mb-8 leading-relaxed max-w-xl font-normal">
              Hire top-tier developers, designers, writers, and marketing experts.
              Pay hourly or fixed-price, with 100% secure payments and support.
            </p>

            {/* Search bar container */}
            <div className="mb-6 max-w-2xl">
              {/* Desktop layout */}
              <div className="hidden sm:flex items-center bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-slate-200/80 p-2 focus-within:shadow-[0_15px_40px_rgba(30,58,95,0.08)] focus-within:border-[#1e3a5f]/40 transition-all duration-300">

                {/* Search input */}
                <div className="flex items-center gap-3 px-4 py-3 flex-1 min-w-0">
                  <Search size={18} className="text-slate-400 flex-shrink-0 transition-colors duration-300" />
                  <input
                    type="text"
                    placeholder="Search skills, job titles, roles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="flex-1 text-sm text-slate-800 placeholder-slate-400 outline-none bg-transparent min-w-0 font-medium"
                    style={{ fontFamily: "var(--font-poppins), sans-serif" }}
                  />
                </div>

                <div className="self-stretch bg-slate-200/80 flex-shrink-0" style={{ width: "1px", marginTop: "8px", marginBottom: "8px" }}></div>

                {/* Experience Level dropdown */}
                <div 
                  className="flex items-center gap-2 px-4 py-3 flex-shrink-0 relative cursor-pointer select-none"
                  onClick={() => {
                    setExpOpen(!expOpen);
                    setLocOpen(false);
                  }}
                >
                  <Briefcase size={16} className="text-slate-400 flex-shrink-0" />
                  <span
                    className="text-sm text-slate-700 font-semibold pr-6"
                    style={{ fontFamily: "var(--font-poppins), sans-serif" }}
                  >
                    {experienceLevel}
                  </span>
                  <ChevronDown size={14} className="text-slate-400 absolute right-3 pointer-events-none" />

                  {/* Dropdown Options List */}
                  {expOpen && (
                    <>
                      <div className="fixed inset-0 z-45" onClick={(e) => { e.stopPropagation(); setExpOpen(false); }} />
                      <div className="absolute left-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        {experienceLevels.map((level) => (
                          <button
                            key={level}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExperienceLevel(level);
                              setExpOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors duration-150 ${
                              experienceLevel === level
                                ? "bg-[#edf2f7] text-[#1e3a5f] font-bold"
                                : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                            }`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="self-stretch bg-slate-200/80 flex-shrink-0" style={{ width: "1px", marginTop: "8px", marginBottom: "8px" }}></div>

                {/* Location dropdown */}
                <div 
                  className="flex items-center gap-2 px-4 py-3 flex-shrink-0 relative cursor-pointer select-none"
                  onClick={() => {
                    setLocOpen(!locOpen);
                    setExpOpen(false);
                  }}
                >
                  <MapPin size={16} className="text-slate-400 flex-shrink-0" />
                  <span
                    className="text-sm text-slate-700 font-semibold pr-6"
                    style={{ fontFamily: "var(--font-poppins), sans-serif" }}
                  >
                    {location}
                  </span>
                  <ChevronDown size={14} className="text-slate-400 absolute right-3 pointer-events-none" />

                  {/* Dropdown Options List */}
                  {locOpen && (
                    <>
                      <div className="fixed inset-0 z-45" onClick={(e) => { e.stopPropagation(); setLocOpen(false); }} />
                      <div className="absolute left-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        {locations.map((loc) => (
                          <button
                            key={loc}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLocation(loc);
                              setLocOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors duration-150 ${
                              location === loc
                                ? "bg-[#edf2f7] text-[#1e3a5f] font-bold"
                                : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                            }`}
                          >
                            {loc}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Search button */}
                <div className="flex-shrink-0 pl-2">
                  <Button
                    onClick={handleSearch}
                    className="rounded-xl flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#1e3a5f] to-[#2c5282] text-white font-semibold shadow-md transition-all duration-300 hover:shadow-[#1e3a5f]/20 hover:-translate-y-0.5"
                  >
                    <Search size={16} />
                    <span>Search</span>
                  </Button>
                </div>
              </div>

              {/* Mobile layout */}
              <div className="flex sm:hidden flex-col gap-3 bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-lg">
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-3">
                  <Search size={18} className="text-slate-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search skills or job titles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="flex-1 text-sm text-slate-800 placeholder-slate-400 outline-none bg-transparent font-medium"
                    style={{ fontFamily: "var(--font-poppins), sans-serif" }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div 
                    className="flex items-center gap-2 bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-2.5 relative cursor-pointer select-none"
                    onClick={() => {
                      setExpOpen(!expOpen);
                      setLocOpen(false);
                    }}
                  >
                    <Briefcase size={15} className="text-slate-400 flex-shrink-0" />
                    <span
                      className="flex-1 text-xs text-slate-700 font-semibold pr-5 truncate"
                      style={{ fontFamily: "var(--font-poppins), sans-serif" }}
                    >
                      {experienceLevel}
                    </span>
                    <ChevronDown size={12} className="text-slate-400 absolute right-2.5 pointer-events-none" />

                    {/* Dropdown Options List */}
                    {expOpen && (
                      <>
                        <div className="fixed inset-0 z-45" onClick={(e) => { e.stopPropagation(); setExpOpen(false); }} />
                        <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                          {experienceLevels.map((level) => (
                            <button
                              key={level}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExperienceLevel(level);
                                setExpOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2 text-xs transition-colors duration-150 ${
                                experienceLevel === level
                                  ? "bg-[#edf2f7] text-[#1e3a5f] font-bold"
                                  : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                              }`}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <div 
                    className="flex items-center gap-2 bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-2.5 relative cursor-pointer select-none"
                    onClick={() => {
                      setLocOpen(!locOpen);
                      setExpOpen(false);
                    }}
                  >
                    <MapPin size={15} className="text-slate-400 flex-shrink-0" />
                    <span
                      className="flex-1 text-xs text-slate-700 font-semibold pr-5 truncate"
                      style={{ fontFamily: "var(--font-poppins), sans-serif" }}
                    >
                      {location}
                    </span>
                    <ChevronDown size={12} className="text-slate-400 absolute right-2.5 pointer-events-none" />

                    {/* Dropdown Options List */}
                    {locOpen && (
                      <>
                        <div className="fixed inset-0 z-45" onClick={(e) => { e.stopPropagation(); setLocOpen(false); }} />
                        <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                          {locations.map((loc) => (
                            <button
                              key={loc}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setLocation(loc);
                                setLocOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2 text-xs transition-colors duration-150 ${
                                location === loc
                                  ? "bg-[#edf2f7] text-[#1e3a5f] font-bold"
                                  : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                              }`}
                            >
                              {loc}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleSearch}
                  className="rounded-xl flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#1e3a5f] to-[#2c5282] w-full font-semibold"
                >
                  <Search size={16} />
                  <span>Search Jobs</span>
                </Button>
              </div>
            </div>

            {/* Popular tags */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold text-slate-500">
              <span className="text-slate-400 mr-1 uppercase tracking-wider text-[10px]">Popular searches:</span>
              {["React Developer", "UI Designer", "Content Writer", "SEO Expert"].map(
                (tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSearchQuery(tag);
                      handleSearch();
                    }}
                    className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200/80 text-slate-600 hover:border-[#1e3a5f] hover:text-[#1e3a5f] hover:shadow-sm transition-all duration-250 cursor-pointer"
                  >
                    {tag}
                  </button>
                )
              )}
            </div>

            {/* Trusted Brand Logos */}
            <div className="mt-6 pt-4 border-t border-slate-200/60 max-w-lg">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                Trusted by top-tier business teams
              </p>
              <div className="flex items-center gap-6">
                <Google size={20} className="text-slate-400 opacity-40 hover:opacity-85 hover:text-slate-600 transition-all duration-300 grayscale" />
                <Github size={20} className="text-slate-400 opacity-40 hover:opacity-85 hover:text-slate-600 transition-all duration-300 grayscale" />
                <Linkedin size={20} className="text-slate-400 opacity-40 hover:opacity-85 hover:text-slate-600 transition-all duration-300 grayscale" />
                <Twitter size={18} className="text-slate-400 opacity-40 hover:opacity-85 hover:text-slate-600 transition-all duration-300 grayscale" />
              </div>
            </div>

          </div>

          {/* Right graphics (4 cols on large screens, hidden below lg) */}
          <div className="lg:col-span-4 relative hidden lg:block hero-fade-in pl-4">

            {/* Glowing backdrop rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-gradient-to-tr from-[#1e3a5f]/10 to-[#d4a017]/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />

            {/* Main Visual Frame Container */}
            <div className="relative mx-auto w-[320px]">

              {/* Main Visual Frame */}
              <div className="relative w-full aspect-[4/5] rounded-[2.5rem] overflow-hidden border-[8px] border-white shadow-[0_20px_50px_rgba(30,58,95,0.15)] bg-slate-50 transition-all duration-500 hover:scale-[1.01] hover:shadow-[0_25px_60px_rgba(30,58,95,0.22)]">
                <Image
                  src="/hero-freelancer.png"
                  alt="Top Freelancer"
                  fill
                  priority
                  className="object-cover object-top transition-transform duration-700 hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 320px"
                />
                {/* Soft overlay gradient on the image */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent pointer-events-none" />
              </div>



              {/* Floating Skill Bubble 1: Code */}
              <div className="hero-float hero-float-1 absolute top-[10%] -left-[14%] w-12 h-12 rounded-full backdrop-blur-md bg-white/90 border border-white/50 shadow-md flex items-center justify-center hover:scale-110 hover:shadow-lg transition-all duration-300">
                <Code2 size={18} className="text-[#1e3a5f]" />
              </div>

              {/* Floating Skill Bubble 2: Design */}
              <div className="hero-float hero-float-3 absolute top-[25%] -right-[12%] w-12 h-12 rounded-full backdrop-blur-md bg-white/90 border border-white/50 shadow-md flex items-center justify-center hover:scale-110 hover:shadow-lg transition-all duration-300">
                <Palette size={18} className="text-[#d4a017]" />
              </div>

              {/* Floating Skill Bubble 3: Database */}
              <div className="hero-float hero-float-2 absolute bottom-[25%] -left-[16%] w-12 h-12 rounded-full backdrop-blur-md bg-white/90 border border-white/50 shadow-md flex items-center justify-center hover:scale-110 hover:shadow-lg transition-all duration-300">
                <Database size={18} className="text-emerald-500" />
              </div>

              {/* Floating Skill Bubble 4: Analytics */}
              <div className="hero-float hero-float-1 absolute bottom-[15%] -right-[10%] w-12 h-12 rounded-full backdrop-blur-md bg-white/90 border border-white/50 shadow-md flex items-center justify-center hover:scale-110 hover:shadow-lg transition-all duration-300">
                <BarChart3 size={18} className="text-blue-500" />
              </div>

            </div>

          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes heroFadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .hero-fade-in {
          animation: heroFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes floatY {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
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
          animation-delay: 0.8s;
          animation-duration: 5.8s;
        }
        .hero-float-3 {
          animation-delay: 1.6s;
          animation-duration: 6.6s;
        }

        @keyframes pulseSlow {
          0%, 100% {
            opacity: 0.15;
            transform: scale(1);
          }
          50% {
            opacity: 0.25;
            transform: scale(1.05);
          }
        }
        .animate-pulse-slow {
          animation: pulseSlow 8s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-fade-in,
          .hero-float,
          .animate-pulse-slow {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}