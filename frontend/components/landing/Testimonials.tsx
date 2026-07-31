"use client";

import { useState } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    quote: "WinkGetJob helped us hire the right developer within days. The escrow system and verified talent make the entire process smooth and stress-free.",
    author: "Siddharth Sen",
    role: "CTO, OmniScale Systems",
    quoteColor: "text-emerald-500",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
  },
  {
    quote: "As a freelancer, I love how easy it is to find quality projects and get paid on time. WinkGetJob truly values professionals.",
    author: "Priya Sharma",
    role: "UI/UX Designer",
    quoteColor: "text-indigo-500",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
  },
  {
    quote: "The quality of candidates and the level of support we get is unmatched. Our go-to platform for all hiring needs.",
    author: "Arjun Mehta",
    role: "Founder, BrightBrand Solutions",
    quoteColor: "text-amber-500",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
  },
];

const brandLogos = [
  "omniscale SYSTEMS",
  "BrightBrand SOLUTIONS",
  "PayZest",
  "TechNova",
  "writeflow",
  "invoicely",
];

export function Testimonials() {
  const [activeIdx, setActiveIdx] = useState(0);

  const nextTestimonial = () => {
    setActiveIdx((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIdx((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section id="testimonials" className="py-14 sm:py-20 bg-[#faf8f5] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-14">
          
          {/* LEFT: Section Header & Rating Card */}
          <div className="lg:col-span-4 space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-amber-600 font-semibold text-xs tracking-wider uppercase mb-1.5">
                <Star size={14} className="fill-amber-500 text-amber-500" />
                <span>TRUSTED BY</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#0f172a] tracking-tight mb-3">
                Trusted by creators &amp; builders
              </h2>
              <p className="text-slate-500 text-sm sm:text-base font-medium leading-relaxed">
                From startups to established brands, thousands of businesses trust WinkGetJob to build their teams and ship great work.
              </p>
            </div>

            {/* Rating Card */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/60 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.03)] inline-flex items-center gap-3">
              <div className="flex items-center gap-1 text-amber-500">
                <Star size={18} className="fill-amber-500" />
                <span className="font-extrabold text-slate-900 text-base">4.9/5</span>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                Average rating from 10,000+ users
              </span>
            </div>
          </div>

          {/* RIGHT: Testimonial Cards & Carousel */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Top Right Navigation Buttons */}
            <div className="flex justify-end gap-2">
              <button
                onClick={prevTestimonial}
                className="w-10 h-10 rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                aria-label="Previous testimonial"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={nextTestimonial}
                className="w-10 h-10 rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                aria-label="Next testimonial"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* 3 Testimonial Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {testimonials.map((t, idx) => (
                <div
                  key={t.author}
                  className={`bg-white rounded-3xl p-6 border border-slate-200/70 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.03)] flex flex-col justify-between transition-all duration-300 ${
                    activeIdx === idx ? "ring-2 ring-amber-400/50 shadow-lg" : ""
                  }`}
                >
                  <div>
                    {/* Quote mark */}
                    <span className={`text-4xl font-serif leading-none block mb-2 ${t.quoteColor}`}>
                      “
                    </span>
                    <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed mb-6">
                      {t.quote}
                    </p>
                  </div>

                  {/* Author info */}
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                    <img
                      src={t.avatar}
                      alt={t.author}
                      className="w-9 h-9 rounded-full object-cover shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs leading-tight">
                        {t.author}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium leading-tight">
                        {t.role}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>

        {/* Brand Logos Row */}
        <div className="pt-8 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-6 opacity-60">
          {brandLogos.map((brand) => (
            <span
              key={brand}
              className="text-slate-500 font-bold text-sm sm:text-base tracking-tight hover:opacity-100 transition-opacity"
            >
              {brand}
            </span>
          ))}
        </div>

      </div>
    </section>
  );
}
