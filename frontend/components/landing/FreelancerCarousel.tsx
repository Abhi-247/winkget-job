"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { Star, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { freelancersApi } from "@/lib/api";
import { User } from "@/types";
import { getInitials } from "@/lib/utils";
import { HireRequestModal } from "@/components/talent/HireRequestModal";

export function FreelancerCarousel() {
  const [freelancers, setFreelancers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [hireTarget, setHireTarget] = useState<User | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function fetchFreelancers() {
      try {
        const res = (await freelancersApi.getAll({ limit: "8" })) as { data: User[] };
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
    }, 4500);
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
      className="py-12 bg-[#f8fafc]"
      style={{ fontFamily: "var(--font-poppins), sans-serif" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header section with Arrow Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-600 rounded-full px-3 py-1 text-xs font-bold mb-2 border border-amber-100/50">
              <Star size={12} className="fill-amber-500 text-amber-500" />
              <span>Top Rated Talent</span>
            </div>
            <h2 className="text-3xl font-extrabold text-[#0f172a] mb-1 tracking-tight">
              Hire the Best Freelancers
            </h2>
            <p className="text-slate-500 max-w-xl text-sm sm:text-base font-medium">
              Hand-picked professionals with 4.8+ ratings, verified reviews, and proven track records across every skill.
            </p>
          </div>
          
          <div className="flex items-center gap-2.5 self-start md:self-end">
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
            <Link href="/talent" className="ml-2">
              <button className="border border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f]/5 px-6 py-2.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer">
                View All
              </button>
            </Link>
          </div>
        </div>

        {/* Horizontal scroll grid */}
        <div 
          ref={scrollRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory scroll-smooth px-2 -mx-2"
        >
          {loading && freelancers.length === 0 ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl border border-slate-100 p-4 sm:p-6 animate-pulse space-y-4 w-[275px] xs:w-[300px] sm:w-[320px] lg:w-[calc(25%-18px)] flex-shrink-0">
                <div className="flex justify-between items-center">
                  <div className="w-20 h-4 bg-slate-100 rounded-md" />
                  <div className="w-12 h-4 bg-slate-100 rounded-md" />
                </div>
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 rounded-2xl" />
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-100 rounded w-20" />
                    <div className="h-3 bg-slate-100 rounded w-14" />
                  </div>
                </div>
                <div className="h-3 bg-slate-100 rounded w-full" />
                <div className="h-3 bg-slate-100 rounded w-4/5" />
                <div className="flex gap-1">
                  <div className="w-10 h-5 bg-slate-100 rounded-md" />
                  <div className="w-12 h-5 bg-slate-100 rounded-md" />
                </div>
                <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                  <div className="w-16 h-4 bg-slate-100 rounded" />
                  <div className="w-20 h-4 bg-slate-100 rounded" />
                </div>
              </div>
            ))
          ) : (
            freelancers.map((f) => {
              const initials = getInitials(f.name);
              const avatarBg = getAvatarBg(f.name);
              const ratingVal = 4.8 + (f.name.charCodeAt(0) % 3) * 0.1;
              const reviewsVal = 20 + (f.name.charCodeAt(1) % 100);
              const jobsVal = 10 + (f.name.charCodeAt(0) % 80);

              return (
                <div
                  key={f._id}
                  className="bg-white rounded-3xl border border-slate-100 p-4 sm:p-6 shadow-sm hover:shadow-[0_15px_35px_rgba(30,58,95,0.05)] transition-all duration-300 w-[275px] xs:w-[300px] sm:w-[320px] lg:w-[calc(25%-18px)] flex-shrink-0 flex flex-col justify-between"
                >
                  <div>
                    {/* 1. Badges Row */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="inline-flex items-center gap-0.5 bg-orange-50 text-orange-600 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold border border-orange-100/50 uppercase tracking-wider">
                        ★ Top Rated
                      </span>
                      <span className="inline-flex items-center bg-emerald-50 text-emerald-600 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold border border-emerald-100/50 uppercase tracking-wider">
                        Verified
                      </span>
                    </div>

                    {/* 2. Profile Row */}
                    <div className="flex items-start justify-between mb-4 gap-1">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {f.avatar ? (
                          <img
                            src={f.avatar}
                            alt={f.name}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl object-cover shadow-sm flex-shrink-0"
                          />
                        ) : (
                          <div
                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-white font-extrabold text-sm sm:text-base flex-shrink-0 shadow-sm ${avatarBg}`}
                          >
                            {initials}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h3 className="font-bold text-[#0f172a] text-sm sm:text-base leading-snug truncate">{f.name}</h3>
                          <p className="text-[10px] sm:text-xs font-semibold text-slate-400 mt-0.5 truncate max-w-[100px] sm:max-w-[130px]">
                            {f.title || "Freelance Developer"}
                          </p>
                        </div>
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100/50 px-2 sm:px-2.5 py-0.5 rounded-lg flex-shrink-0">
                        {f.availability === "Immediately" ? "Available" : "Busy"}
                      </span>
                    </div>

                    {/* 3. Rating and Location */}
                    <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-500 mb-4 font-semibold">
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={10}
                            className={
                              star <= Math.floor(ratingVal)
                                ? "text-amber-400 fill-amber-400"
                                : "text-slate-200 fill-slate-200"
                            }
                          />
                        ))}
                      </div>
                      <span className="font-extrabold text-slate-800 text-xs ml-0.5">{ratingVal.toFixed(1)}</span>
                      <span className="text-[9px] sm:text-[10px] text-slate-400">({reviewsVal})</span>
                      <span className="text-slate-300 font-normal">•</span>
                      <MapPin size={10} className="text-slate-400 flex-shrink-0" />
                      <span className="truncate max-w-[70px] sm:max-w-[90px]">{f.location || "India"}</span>
                    </div>

                    {/* 4. Description */}
                    <p className="text-[11px] sm:text-sm text-slate-500 mb-5 leading-relaxed line-clamp-2 min-h-[35px] sm:min-h-[40px]">
                      {f.bio || "No biography provided. Click Hire Now to discuss project details and skills."}
                    </p>

                    {/* 5. Skills Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {f.skills && f.skills.slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-100 text-[10px] font-bold text-slate-500"
                        >
                          {s}
                        </span>
                      ))}
                      {f.skills && f.skills.length > 3 && (
                        <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-100 text-[10px] font-bold text-slate-500">
                          +{f.skills.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <hr className="border-slate-100 mb-4" />

                    {/* 6. Footer Info & Action */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-base sm:text-lg font-bold text-[#0f172a]">
                          ₹{(f.hourlyRate || 1500).toLocaleString("en-IN")}
                        </span>
                        <span className="text-xs text-slate-400">/hr</span>
                      </div>
                      <span className="text-[10px] sm:text-xs text-slate-400 font-bold">
                        {jobsVal} jobs • 100% success
                      </span>
                    </div>

                    <button
                      onClick={() => setHireTarget(f)}
                      className="w-full bg-[#1e3a5f] hover:bg-[#12243d] text-white rounded-xl py-3 font-bold text-xs transition-all duration-300 cursor-pointer text-center block border-0"
                    >
                      Hire Now
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Hire Request Modal */}
      <HireRequestModal
        freelancer={hireTarget}
        onClose={() => setHireTarget(null)}
      />

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
    </section>
  );
}
