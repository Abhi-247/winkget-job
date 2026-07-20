"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  ChevronDown,
  Briefcase,
  ArrowRight,
  Sparkles,
  Star,
  Shield,
  Users,
} from "lucide-react";
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

  // Rotating headline word
  const headlineWords = ["opportunity", "growth", "success", "freedom", "innovation"];
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const [headlineFading, setHeadlineFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeadlineFading(true);
      setTimeout(() => {
        setHeadlineIndex((prev) => (prev + 1) % headlineWords.length);
        setHeadlineFading(false);
      }, 400);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Typewriter running placeholder effect
  const placeholderTexts = [
    "React Developer",
    "UI/UX Designer",
    "Content Writer",
    "Logo Design",
    "Mobile Developer",
    "SEO Expert",
    "Data Analyst",
    "Video Editor",
  ];
  const [placeholder, setPlaceholder] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = placeholderTexts[wordIndex];
    let timer: NodeJS.Timeout;

    if (isDeleting) {
      timer = setTimeout(() => {
        setPlaceholder(currentWord.substring(0, charIndex - 1));
        setCharIndex((prev) => prev - 1);
      }, 40);
    } else {
      timer = setTimeout(() => {
        setPlaceholder(currentWord.substring(0, charIndex + 1));
        setCharIndex((prev) => prev + 1);
      }, 80);
    }

    if (!isDeleting && charIndex === currentWord.length) {
      timer = setTimeout(() => setIsDeleting(true), 1500);
    } else if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setWordIndex((prev) => (prev + 1) % placeholderTexts.length);
    }

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, wordIndex]);

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
      className="relative pt-16 pb-12 sm:pt-20 sm:pb-14 lg:pt-24 lg:pb-16 overflow-hidden"
      style={{ fontFamily: "var(--font-poppins), sans-serif" }}
    >
      {/* Warm light background with subtle texture */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#faf8f4] via-white to-[#f0f4f8]" />

      {/* Organic blob decorations */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#1e3a5f]/[0.04] rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-15%] left-[-8%] w-[500px] h-[500px] bg-[#d4a017]/[0.06] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-[20%] left-[45%] w-[300px] h-[300px] bg-[#2c5282]/[0.03] rounded-full blur-[60px] pointer-events-none" />

      {/* Dot pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.3] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, #1e3a5f 0.5px, transparent 0.5px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col items-center text-center">
          {/* Main headline — large, with rotating last word */}
          <h1 className="text-[2.25rem] sm:text-5xl md:text-6xl lg:text-[4.25rem] font-extrabold text-[#0f172a] leading-[1.08] tracking-tight mb-6 max-w-4xl">
            Where India&apos;s best{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-[#1e3a5f] via-[#2c5282] to-[#1e3a5f] bg-clip-text text-transparent">talent</span>
              <svg className="absolute -bottom-1 left-0 w-full" height="6" viewBox="0 0 200 6" fill="none" preserveAspectRatio="none" aria-hidden="true">
                <path d="M2 4C50 1 150 1 198 4" stroke="#d4a017" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>{" "}
            meets{" "}
            <span
              className={`inline-block bg-gradient-to-r from-[#d4a017] to-[#b8860b] bg-clip-text text-transparent transition-all duration-400 ${headlineFading ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0"}`}
            >
              {headlineWords[headlineIndex]}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-500 mb-8 max-w-2xl leading-relaxed font-medium">
            Post projects, discover skilled freelancers, and hire developers, designers,
            writers & marketers — with zero platform fees and escrow-protected payments.
          </p>

          {/* CTA row below subtitle — enhanced UI */}
          <div className="flex flex-row items-center justify-center gap-3 sm:gap-4 mb-12">
            <Link href="/register?role=jobseeker">
              <button className="group relative flex items-center gap-2 px-5 sm:px-8 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-[#d4a017] via-[#e6b800] to-[#b8860b] text-white font-extrabold text-xs sm:text-sm shadow-[0_10px_25px_-5px_rgba(212,160,23,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(212,160,23,0.6)] transition-all duration-300 hover:-translate-y-1 active:translate-y-0 active:scale-95 cursor-pointer whitespace-nowrap overflow-hidden">
                <span className="relative z-10">Start Freelancing</span>
                <ArrowRight size={16} className="relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </button>
            </Link>
            <Link href="/register?role=employer">
              <button className="group relative flex items-center gap-2 px-5 sm:px-8 py-3.5 sm:py-4 rounded-full bg-white border-2 border-[#1e3a5f] text-[#1e3a5f] font-extrabold text-xs sm:text-sm shadow-[0_8px_20px_-6px_rgba(30,58,95,0.12)] hover:shadow-[0_12px_25px_-5px_rgba(30,58,95,0.25)] hover:bg-[#1e3a5f] hover:text-white transition-all duration-300 hover:-translate-y-1 active:translate-y-0 active:scale-95 cursor-pointer whitespace-nowrap">
                <span>Post a Job</span>
                <Briefcase size={16} className="transition-transform duration-300 group-hover:rotate-12" />
              </button>
            </Link>
          </div>

          {/* ── Search Bar — pill shaped, centered ── */}
          <div className="w-full max-w-3xl mb-8">
            {/* Desktop */}
            <div className="hidden sm:flex items-center bg-white rounded-full border border-slate-200/80 shadow-[0_15px_30px_-5px_rgba(30,58,95,0.08)] p-2 hover:shadow-[0_20px_40px_-5px_rgba(30,58,95,0.12)] hover:border-slate-300 transition-all duration-300 focus-within:border-[#1e3a5f] focus-within:ring-4 focus-within:ring-[#1e3a5f]/5">
              <div className="flex items-center gap-3 px-5 py-3 flex-1 min-w-0">
                <Search size={18} className="text-[#1e3a5f] flex-shrink-0" />
                <input
                  type="text"
                  placeholder={`Search for ${placeholder}`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1 text-sm text-slate-800 placeholder-slate-400 outline-none bg-transparent min-w-0 font-semibold"
                />
              </div>

              <div className="h-8 w-px bg-slate-200 flex-shrink-0" />

              {/* Experience dropdown */}
              <div
                className="flex items-center gap-2 px-4 py-3 flex-shrink-0 relative cursor-pointer select-none"
                onClick={() => { setExpOpen(!expOpen); setLocOpen(false); }}
              >
                <Briefcase size={14} className="text-[#1e3a5f]" />
                <span className="text-sm text-slate-600 font-bold whitespace-nowrap">{experienceLevel}</span>
                <ChevronDown size={12} className={`text-slate-400 transition-transform duration-300 ${expOpen ? "rotate-180 text-[#1e3a5f]" : ""}`} />
                {expOpen && (
                  <>
                    <div className="fixed inset-0 z-[45]" onClick={(e) => { e.stopPropagation(); setExpOpen(false); }} />
                    <div className="absolute left-0 top-full mt-3 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50">
                      {experienceLevels.map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setExperienceLevel(level); setExpOpen(false); }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${experienceLevel === level ? "bg-[#edf2f7] text-[#1e3a5f] font-bold" : "text-slate-600 hover:bg-slate-50"}`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="h-8 w-px bg-slate-200 flex-shrink-0" />

              {/* Location dropdown */}
              <div
                className="flex items-center gap-2 px-4 py-3 flex-shrink-0 relative cursor-pointer select-none"
                onClick={() => { setLocOpen(!locOpen); setExpOpen(false); }}
              >
                <MapPin size={14} className="text-[#d4a017]" />
                <span className="text-sm text-slate-600 font-bold whitespace-nowrap">{location}</span>
                <ChevronDown size={12} className={`text-slate-400 transition-transform duration-300 ${locOpen ? "rotate-180 text-[#1e3a5f]" : ""}`} />
                {locOpen && (
                  <>
                    <div className="fixed inset-0 z-[45]" onClick={(e) => { e.stopPropagation(); setLocOpen(false); }} />
                    <div className="absolute left-0 top-full mt-3 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50">
                      {locations.map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setLocation(loc); setLocOpen(false); }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${location === loc ? "bg-[#edf2f7] text-[#1e3a5f] font-bold" : "text-slate-600 hover:bg-slate-50"}`}
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={handleSearch}
                className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#1e3a5f] to-[#152a45] hover:from-[#152a45] hover:to-[#12233a] text-white font-bold text-sm shadow-md shadow-[#1e3a5f]/25 transition-all duration-300 hover:shadow-lg active:scale-95 cursor-pointer flex-shrink-0 border-0"
              >
                <Search size={16} />
                <span>Search</span>
              </button>
            </div>

            {/* Mobile */}
            <div className="flex sm:hidden flex-col gap-3 bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-4 transition-all duration-300">
              <div className="flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-3.5 border border-slate-100 focus-within:bg-white focus-within:border-[#1e3a5f]/30 focus-within:ring-2 focus-within:ring-[#1e3a5f]/10 transition-all">
                <Search size={18} className="text-[#1e3a5f] flex-shrink-0" />
                <input
                  type="text"
                  placeholder={`Search for ${placeholder}`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1 text-sm text-slate-800 placeholder-slate-400 outline-none bg-transparent font-semibold"
                />
              </div>
              <button
                onClick={handleSearch}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-[#111c2c] to-[#1e3a5f] text-white font-extrabold text-sm shadow-md shadow-[#1e3a5f]/20 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Search size={16} />
                <span>Search Jobs</span>
              </button>
            </div>
          </div>

          {/* Quick suggestion tags */}
          <div className="flex flex-wrap justify-center items-center gap-1.5 sm:gap-2 mb-10 max-w-full px-2">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mr-1">Popular:</span>
            {["React Developer", "UI Designer", "Content Writer", "SEO Expert"].map(
              (tag) => (
                <button
                  key={tag}
                  onClick={() => { setSearchQuery(tag); handleSearch(); }}
                  className="px-3.5 py-1.5 rounded-full bg-white text-[#1e3a5f] border border-blue-200/80 hover:border-[#1e3a5f]/40 hover:bg-blue-50/50 shadow-sm transition-all duration-200 cursor-pointer text-xs font-semibold"
                >
                  {tag}
                </button>
              )
            )}
          </div>

          {/* Bottom floating cards — value propositions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 w-full max-w-3xl">
            {[
              { icon: <Shield className="text-[#1e3a5f] w-4 h-4 sm:w-[18px] sm:h-[18px]" />, label: "Escrow Protected" },
              { icon: <Sparkles className="text-[#d4a017] w-4 h-4 sm:w-[18px] sm:h-[18px]" />, label: "0% Platform Fee" },
              { icon: <Users className="text-emerald-600 w-4 h-4 sm:w-[18px] sm:h-[18px]" />, label: "50K+ Freelancers" },
              { icon: <Star className="text-purple-600 w-4 h-4 sm:w-[18px] sm:h-[18px]" />, label: "4.9 ★ Rating" },
            ].map((item) => (
              <div
                key={item.label}
                className="group flex items-center gap-1.5 sm:gap-3 bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-[14px] sm:rounded-2xl px-2 sm:px-4 py-2.5 sm:py-3.5 hover:border-slate-300 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                  {item.icon}
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-[10px] sm:text-xs font-bold text-slate-800 leading-tight">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .hero-float {
          animation: heroFloat 4s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-float { animation: none !important; }
        }
      `}</style>
    </section>
  );
}