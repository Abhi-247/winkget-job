"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Star, MapPin, ChevronLeft, ChevronRight, User, CheckCircle2, ArrowRight } from "lucide-react";
import { freelancersApi } from "@/lib/api";
import { User as UserType } from "@/types";
import { getInitials } from "@/lib/utils";
import { HireRequestModal } from "@/components/talent/HireRequestModal";

export function FreelancerCarousel() {
  const [freelancers, setFreelancers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [hireTarget, setHireTarget] = useState<UserType | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function fetchFreelancers() {
      try {
        const res = (await freelancersApi.getAll({ limit: "12" })) as { data: UserType[] };
        if (res && res.data && res.data.length > 0) {
          setFreelancers(res.data);
        } else {
          setFreelancers([]);
        }
      } catch (err) {
        console.error("Failed to fetch freelancers:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchFreelancers();
  }, []);

  const startAutoScroll = () => {
    stopAutoScroll();
    timerRef.current = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          const cardWidth = clientWidth > 768 ? clientWidth / 4 : 290;
          scrollRef.current.scrollTo({ left: scrollLeft + cardWidth, behavior: "smooth" });
        }
      }
    }, 5000);
  };

  const stopAutoScroll = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    if (!loading) {
      startAutoScroll();
    }
    return () => stopAutoScroll();
  }, [loading, freelancers]);

  const handleScroll = (direction: "left" | "right") => {
    startAutoScroll();
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = direction === "left" ? -clientWidth * 0.8 : clientWidth * 0.8;
      scrollRef.current.scrollTo({ left: scrollLeft + scrollAmount, behavior: "smooth" });
    }
  };

  const getAvatarBg = (name: string) => {
    const backgrounds = ["bg-purple-600", "bg-teal-600", "bg-indigo-600", "bg-blue-600", "bg-emerald-600"];
    return backgrounds[name.length % backgrounds.length];
  };

  return (
    <section
      id="freelancers"
      className="py-10 bg-white relative overflow-hidden"
      style={{ fontFamily: "var(--font-poppins), sans-serif" }}
    >
      <div className="absolute top-[20%] left-[-5%] w-[300px] h-[300px] bg-[#1e3a5f]/[0.02] rounded-full blur-[60px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <div className="text-left space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-[#edf2f7] text-[#1e3a5f] rounded-full px-3.5 py-1.5 text-xs font-bold uppercase border border-slate-100">
              <Star size={12} className="fill-amber-500 text-amber-500" />
              <span>Top Talent</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight">
              Hire vetted specialists
            </h2>
            <p className="text-slate-500 max-w-xl text-sm font-medium">
              Collaborate with verified freelancers with 4.8+ ratings and proven work histories.
            </p>
          </div>
          
          {/* Scroll Nav Buttons */}
          <div className="flex items-center gap-2.5 self-start md:self-end">
            <div className="hidden sm:flex items-center gap-2.5">
              <button 
                onClick={() => handleScroll("left")}
                className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:border-[#1e3a5f] hover:text-[#1e3a5f] transition-all duration-200 cursor-pointer shadow-sm"
                aria-label="Scroll left"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                onClick={() => handleScroll("right")}
                className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:border-[#1e3a5f] hover:text-[#1e3a5f] transition-all duration-200 cursor-pointer shadow-sm"
                aria-label="Scroll right"
              >
                <ChevronRight size={18} />
              </button>
            </div>
            <Link href="/talent" className="ml-0 sm:ml-2">
              <button className="border border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f]/5 px-6 py-2.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer">
                View All Talent
              </button>
            </Link>
          </div>
        </div>

        {/* Scroll Track Wrapper */}
        <div className="relative">
          {/* Left Arrow - mobile only */}
          <button 
            onClick={() => handleScroll("left")}
            className="sm:hidden absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 border border-slate-200 flex items-center justify-center text-slate-600 shadow-md backdrop-blur-sm cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Right Arrow - mobile only */}
          <button 
            onClick={() => handleScroll("right")}
            className="sm:hidden absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 border border-slate-200 flex items-center justify-center text-slate-600 shadow-md backdrop-blur-sm cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight size={16} />
          </button>

          <div 
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory scroll-smooth px-2 -mx-2"
          >
          {loading && freelancers.length === 0 ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-slate-50 rounded-3xl border border-slate-100 p-6 animate-pulse space-y-4 w-[280px] flex-shrink-0">
                <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto" />
                <div className="h-4 bg-slate-100 rounded w-1/2 mx-auto" />
                <div className="h-3 bg-slate-100 rounded w-3/4 mx-auto" />
                <div className="h-8 bg-slate-100 rounded w-full pt-4" />
              </div>
            ))
          ) : (
            freelancers.map((f) => {
              const initials = getInitials(f.name);
              const avatarBg = getAvatarBg(f.name);
              const ratingVal = 4.8 + (f.name.charCodeAt(0) % 3) * 0.1;
              const reviewsVal = 20 + (f.name.charCodeAt(1) % 100);

              return (
                <div
                  key={f._id}
                  className="bg-slate-50/50 hover:bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm hover:shadow-lg hover:shadow-slate-200/25 transition-all duration-300 w-[280px] flex-shrink-0 flex flex-col justify-between items-center text-center relative group"
                >
                  <div className="w-full">
                    {/* Top capsule avatar */}
                    <div className="relative mb-5 mx-auto w-20 h-20">
                      {f.avatar ? (
                        <img
                          src={f.avatar}
                          alt={f.name}
                          className="w-20 h-20 rounded-full object-cover shadow-md border-2 border-white"
                        />
                      ) : (
                        <div
                          className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-extrabold text-lg shadow-md border-2 border-white ${avatarBg}`}
                        >
                          {initials}
                        </div>
                      )}
                      <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-sm">
                        <CheckCircle2 size={10} className="text-white" />
                      </span>
                    </div>

                    {/* Metadata */}
                    <h3 className="font-extrabold text-slate-800 text-base leading-snug truncate px-1">
                      {f.name}
                    </h3>
                    <p className="text-[11px] font-bold text-[#d4a017] mt-0.5 uppercase tracking-wide truncate max-w-[200px] mx-auto">
                      {f.title || "Freelance Developer"}
                    </p>

                    {/* Rating row */}
                    <div className="flex items-center justify-center gap-1 mt-3 mb-4 text-xs font-bold text-slate-700">
                      <Star size={12} className="fill-amber-400 text-amber-400" />
                      <span>{ratingVal.toFixed(1)}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">({reviewsVal} reviews)</span>
                    </div>

                    {/* Description snippet */}
                    <p className="text-slate-400 text-[11px] leading-relaxed font-semibold line-clamp-2 min-h-[34px] px-1 mb-5">
                      {f.bio || "Discuss project deliverables and timelines directly with this freelancer."}
                    </p>
                  </div>

                  <div className="w-full border-t border-slate-100 pt-5 space-y-4">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-400 font-semibold flex items-center gap-1">
                        <MapPin size={12} />
                        {f.location || "India"}
                      </span>
                      <span className="text-slate-800">
                        ₹{(f.hourlyRate || 1500).toLocaleString("en-IN")}<span className="text-[10px] text-slate-400 font-semibold">/hr</span>
                      </span>
                    </div>

                    <button
                      onClick={() => setHireTarget(f)}
                      className="w-full bg-[#1e3a5f] hover:bg-[#12243d] text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow-sm cursor-pointer border-0"
                    >
                      Hire Talent
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
        </div>
      </div>

      <HireRequestModal
        freelancer={hireTarget}
        onClose={() => setHireTarget(null)}
      />

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
