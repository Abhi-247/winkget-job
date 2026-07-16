"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  ChevronDown,
  Briefcase,
  Bell,
  UserPlus,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

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
      className="relative overflow-hidden"
      style={{ fontFamily: "var(--font-poppins), sans-serif" }}
    >
      {/* ── Full-width dark hero background ── */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0b1a2e] via-[#122640] to-[#1a3355]" />

      {/* Animated mesh / geometric shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Large circle top-right */}
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full border border-white/[0.04]" />
        <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full border border-white/[0.03]" />

        {/* Glowing orb top-left */}
        <div className="absolute top-[-8%] left-[10%] w-[300px] h-[300px] bg-[#d4a017]/10 rounded-full blur-[120px]" />

        {/* Glowing orb bottom-right */}
        <div className="absolute bottom-[-15%] right-[5%] w-[400px] h-[400px] bg-[#2c5282]/15 rounded-full blur-[100px]" />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-10 items-center">

          {/* ── LEFT CONTENT (7 cols) ── */}
          <div className="lg:col-span-7 hero-fade-in">

            {/* Badge */}
            <div className="inline-flex items-center gap-2.5 bg-white/[0.07] backdrop-blur-sm border border-white/[0.08] text-white/80 rounded-full px-5 py-2 text-xs font-semibold mb-7 hover:bg-white/[0.1] transition-colors duration-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4a017] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#d4a017]"></span>
              </span>
              <span>Trusted by 50,000+ businesses across India</span>
            </div>

            {/* Main heading */}
            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold text-white leading-[1.1] mb-6 tracking-tight">
              Hire top-tier{" "}
              <span className="relative inline-block">
                <span className="text-[#d4a017]">freelancers</span>
                <svg
                  className="absolute -bottom-1.5 left-0 w-full text-[#d4a017]/50"
                  height="8"
                  viewBox="0 0 200 8"
                  fill="none"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 5C40 1 80 1 100 4C120 7 160 1 198 5"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <br className="hidden md:block" />
              for any project.
            </h1>

            {/* Subtitle */}
            <p className="text-base md:text-lg text-slate-400 mb-9 leading-relaxed max-w-lg">
              Post jobs, browse talent, and hire developers, designers, writers &amp;
              marketing experts. Secure payments, real results.
            </p>

            {/* ── Search Bar ── */}
            <div className="mb-8 max-w-2xl">
              {/* Desktop */}
              <div className="hidden sm:flex items-center bg-white rounded-2xl p-2 shadow-2xl shadow-black/20">
                <div className="flex items-center gap-3 px-4 py-3 flex-1 min-w-0">
                  <Search size={18} className="text-slate-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search skills, job titles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="flex-1 text-sm text-slate-800 placeholder-slate-400 outline-none bg-transparent min-w-0 font-medium"
                    style={{ fontFamily: "var(--font-poppins), sans-serif" }}
                  />
                </div>

                <div className="self-stretch bg-slate-200/80 flex-shrink-0" style={{ width: "1px", marginTop: "8px", marginBottom: "8px" }} />

                {/* Experience dropdown */}
                <div
                  className="flex items-center gap-2 px-4 py-3 flex-shrink-0 relative cursor-pointer select-none"
                  onClick={() => { setExpOpen(!expOpen); setLocOpen(false); }}
                >
                  <Briefcase size={15} className="text-slate-400 flex-shrink-0" />
                  <span className="text-sm text-slate-700 font-semibold pr-5" style={{ fontFamily: "var(--font-poppins), sans-serif" }}>
                    {experienceLevel}
                  </span>
                  <ChevronDown size={13} className="text-slate-400 absolute right-3 pointer-events-none" />
                  {expOpen && (
                    <>
                      <div className="fixed inset-0 z-[45]" onClick={(e) => { e.stopPropagation(); setExpOpen(false); }} />
                      <div className="absolute left-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50">
                        {experienceLevels.map((level) => (
                          <button
                            key={level}
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setExperienceLevel(level); setExpOpen(false); }}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${experienceLevel === level ? "bg-[#edf2f7] text-[#1e3a5f] font-bold" : "text-slate-700 hover:bg-slate-50"}`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="self-stretch bg-slate-200/80 flex-shrink-0" style={{ width: "1px", marginTop: "8px", marginBottom: "8px" }} />

                {/* Location dropdown */}
                <div
                  className="flex items-center gap-2 px-4 py-3 flex-shrink-0 relative cursor-pointer select-none"
                  onClick={() => { setLocOpen(!locOpen); setExpOpen(false); }}
                >
                  <MapPin size={15} className="text-slate-400 flex-shrink-0" />
                  <span className="text-sm text-slate-700 font-semibold pr-5" style={{ fontFamily: "var(--font-poppins), sans-serif" }}>
                    {location}
                  </span>
                  <ChevronDown size={13} className="text-slate-400 absolute right-3 pointer-events-none" />
                  {locOpen && (
                    <>
                      <div className="fixed inset-0 z-[45]" onClick={(e) => { e.stopPropagation(); setLocOpen(false); }} />
                      <div className="absolute left-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50">
                        {locations.map((loc) => (
                          <button
                            key={loc}
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setLocation(loc); setLocOpen(false); }}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${location === loc ? "bg-[#edf2f7] text-[#1e3a5f] font-bold" : "text-slate-700 hover:bg-slate-50"}`}
                          >
                            {loc}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="flex-shrink-0 pl-1">
                  <Button
                    onClick={handleSearch}
                    className="rounded-xl flex items-center gap-2 px-6 py-3.5 bg-[#d4a017] hover:bg-[#c49515] text-white font-bold shadow-lg shadow-[#d4a017]/25 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <Search size={16} />
                    <span>Search</span>
                  </Button>
                </div>
              </div>

              {/* Mobile */}
              <div className="flex sm:hidden flex-col gap-3 bg-white rounded-2xl p-3.5 shadow-2xl shadow-black/20">
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-3">
                  <Search size={18} className="text-slate-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search skills or job titles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="flex-1 text-sm text-slate-800 placeholder-slate-400 outline-none bg-transparent font-medium"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    className="flex items-center gap-2 bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-2.5 relative cursor-pointer select-none"
                    onClick={() => { setExpOpen(!expOpen); setLocOpen(false); }}
                  >
                    <Briefcase size={15} className="text-slate-400 flex-shrink-0" />
                    <span className="flex-1 text-xs text-slate-700 font-semibold pr-5 truncate">{experienceLevel}</span>
                    <ChevronDown size={12} className="text-slate-400 absolute right-2.5 pointer-events-none" />
                    {expOpen && (
                      <>
                        <div className="fixed inset-0 z-[45]" onClick={(e) => { e.stopPropagation(); setExpOpen(false); }} />
                        <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50">
                          {experienceLevels.map((level) => (
                            <button key={level} type="button" onClick={(e) => { e.stopPropagation(); setExperienceLevel(level); setExpOpen(false); }}
                              className={`w-full text-left px-4 py-2 text-xs transition-colors ${experienceLevel === level ? "bg-[#edf2f7] text-[#1e3a5f] font-bold" : "text-slate-700 hover:bg-slate-50"}`}
                            >{level}</button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  <div
                    className="flex items-center gap-2 bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-2.5 relative cursor-pointer select-none"
                    onClick={() => { setLocOpen(!locOpen); setExpOpen(false); }}
                  >
                    <MapPin size={15} className="text-slate-400 flex-shrink-0" />
                    <span className="flex-1 text-xs text-slate-700 font-semibold pr-5 truncate">{location}</span>
                    <ChevronDown size={12} className="text-slate-400 absolute right-2.5 pointer-events-none" />
                    {locOpen && (
                      <>
                        <div className="fixed inset-0 z-[45]" onClick={(e) => { e.stopPropagation(); setLocOpen(false); }} />
                        <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50">
                          {locations.map((loc) => (
                            <button key={loc} type="button" onClick={(e) => { e.stopPropagation(); setLocation(loc); setLocOpen(false); }}
                              className={`w-full text-left px-4 py-2 text-xs transition-colors ${location === loc ? "bg-[#edf2f7] text-[#1e3a5f] font-bold" : "text-slate-700 hover:bg-slate-50"}`}
                            >{loc}</button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <Button onClick={handleSearch} className="rounded-xl flex items-center justify-center gap-2 py-3.5 bg-[#d4a017] hover:bg-[#c49515] w-full font-bold">
                  <Search size={16} /><span>Search Jobs</span>
                </Button>
              </div>
            </div>

            {/* Popular tags */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold mb-8">
              <span className="text-slate-500 mr-1 uppercase tracking-wider text-[10px]">Popular:</span>
              {["React Developer", "UI Designer", "Content Writer", "SEO Expert"].map(
                (tag) => (
                  <button
                    key={tag}
                    onClick={() => { setSearchQuery(tag); handleSearch(); }}
                    className="px-3.5 py-1.5 rounded-full bg-white/[0.07] border border-white/[0.1] text-white/70 hover:bg-white/[0.12] hover:text-white hover:border-white/20 transition-all duration-200 cursor-pointer"
                  >
                    {tag}
                  </button>
                )
              )}
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-6 lg:gap-8">
              {[
                { icon: <Zap size={16} className="text-[#d4a017]" />, value: "10K+", label: "Active Jobs" },
                { icon: <Users size={16} className="text-sky-400" />, value: "50K+", label: "Freelancers" },
                { icon: <TrendingUp size={16} className="text-emerald-400" />, value: "₹2Cr+", label: "Paid Out" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-lg font-extrabold text-white leading-none">{stat.value}</p>
                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide mt-0.5">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT CTA CARD (5 cols) ── */}
          <div className="lg:col-span-5 hero-fade-in" style={{ animationDelay: "0.15s" }}>

            <div className="bg-white rounded-3xl p-8 lg:p-9 shadow-2xl shadow-black/15 relative overflow-hidden">

              {/* Decorative accent stripe */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1e3a5f] via-[#2c5282] to-[#d4a017]" />

              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-[#edf2f7] text-[#1e3a5f] rounded-full px-4 py-1.5 text-xs font-bold mb-6">
                <Sparkles size={13} className="text-[#d4a017]" />
                <span>For Job Seekers</span>
              </div>

              {/* Title */}
              <h2 className="text-2xl lg:text-[1.75rem] font-extrabold text-slate-900 leading-tight mb-3">
                Let Employers<br />Find You!
              </h2>

              {/* Description */}
              <p className="text-sm text-slate-500 leading-relaxed mb-6">
                Get discovered by 10,000+ employers across India &amp; apply to jobs in a single click.
              </p>

              {/* Feature bullets */}
              <div className="space-y-2.5 mb-7">
                {[
                  "Get matched with relevant jobs instantly",
                  "Build your professional freelance profile",
                  "100% free to join — no hidden fees",
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                    <span className="text-sm text-slate-600 font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Register button */}
              <Link href="/register?role=jobseeker" className="block mb-5">
                <button className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#e53e3e] to-[#c53030] hover:from-[#c53030] hover:to-[#9b2c2c] text-white font-bold text-base py-4 rounded-2xl shadow-lg shadow-red-600/25 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer">
                  <UserPlus size={18} />
                  Register For Free
                  <ArrowRight size={16} />
                </button>
              </Link>

              {/* Job Alert section */}
              <div className="border-t border-slate-100 pt-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#edf2f7] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bell size={16} className="text-[#1e3a5f]" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 leading-snug mb-1">
                      Get notified about jobs matching your criteria
                    </p>
                    <Link
                      href="/register?role=jobseeker"
                      className="text-[#1e3a5f] text-sm font-bold hover:text-[#d4a017] transition-colors inline-flex items-center gap-1 group"
                    >
                      Create Job Alert
                      <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes heroFadeIn {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hero-fade-in {
          animation: heroFadeIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-fade-in { animation: none !important; }
        }
      `}</style>
    </section>
  );
}