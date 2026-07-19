"use client";

import { useState } from "react";
import { Quote, Star, CheckCircle, ChevronRight } from "lucide-react";

const testimonials = [
  {
    quote: "Finding high-quality freelance React developers in India used to take weeks. With WinkGetJob, we connected with an expert and kicked off the project within 48 hours. The escrow system gives us complete peace of mind.",
    author: "Siddharth Sen",
    role: "CTO, OmniScale Systems",
    rating: 5,
    avatarInitials: "SS",
    avatarBg: "bg-[#1e3a5f]",
  },
  {
    quote: "As a freelancer, payment security is always my top concern. The zero-percent platform fee and escrow protection on WinkGetJob are game-changers. I got paid immediately after my milestones were approved.",
    author: "Priya Sharma",
    role: "Independent UI/UX Designer",
    rating: 5,
    avatarInitials: "PS",
    avatarBg: "bg-[#d4a017]",
  },
  {
    quote: "We hired a backend database developer to scale our core APIs. The profile matching and applicant dashboard made shortlisting and interviewing incredibly smooth. Highly recommend it to any startup.",
    author: "Aditya Roy",
    role: "Co-Founder, PayZest",
    rating: 5,
    avatarInitials: "AR",
    avatarBg: "bg-slate-800",
  },
];

export function Testimonials() {
  const [activeIdx, setActiveIdx] = useState(0);
  const current = testimonials[activeIdx];

  return (
    <section
      id="testimonials"
      className="py-10 bg-white relative border-t border-slate-100 overflow-hidden"
      style={{ fontFamily: "var(--font-poppins), sans-serif" }}
    >
      <div className="absolute top-[20%] right-[-10%] w-[350px] h-[350px] bg-[#d4a017]/[0.02] rounded-full blur-[80px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Intro */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 bg-[#fdf8e8] text-[#d4a017] border border-amber-100 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <span>★ Success Stories</span>
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight">
            Trusted by creators &amp; builders
          </h2>
        </div>

        {/* Split Dynamic Review Container */}
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-16 items-center bg-slate-50/80 border border-slate-200/50 rounded-2xl sm:rounded-[2.5rem] p-3.5 sm:p-10 lg:p-12">
          
          {/* LEFT: Highlighted Quote */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-left relative sm:min-h-[220px] flex flex-col justify-center">
            <div className="text-[#d4a017] mb-1 sm:mb-2">
              <Quote size={32} className="sm:w-12 sm:h-12 fill-current opacity-20" />
            </div>

            {/* Stars */}
            <div className="flex gap-1">
              {[...Array(current.rating)].map((_, i) => (
                <Star key={i} size={14} className="fill-[#d4a017] text-[#d4a017]" />
              ))}
            </div>

            {/* Dynamic quote with fade-in effect */}
            <p className="text-slate-700 italic text-sm sm:text-xl md:text-2xl leading-relaxed font-medium transition-all duration-300">
              &ldquo;{current.quote}&rdquo;
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 pt-3 sm:pt-4 border-t border-slate-200/60 w-full">
              <span className="font-extrabold text-slate-800 text-xs sm:text-base">{current.author}</span>
              <span className="text-[10px] sm:text-xs text-slate-400 font-semibold">
                <span className="hidden sm:inline mr-2">•</span>{current.role}
              </span>
            </div>
          </div>

          {/* RIGHT: Selectable Reviewers list */}
          <div className="lg:col-span-5 space-y-2 sm:space-y-3">
            {testimonials.map((t, idx) => {
              const isActive = activeIdx === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveIdx(idx)}
                  className={`group flex items-center justify-between p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border cursor-pointer transition-all duration-300 ${
                    isActive
                      ? "bg-white border-slate-200 shadow-md shadow-slate-100/50"
                      : "bg-transparent border-transparent hover:bg-white/50 hover:border-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${t.avatarBg} text-white flex items-center justify-center font-bold text-[10px] sm:text-xs flex-shrink-0`}>
                      {t.avatarInitials}
                    </div>
                    <div className="min-w-0 text-left flex-1">
                      <p className={`font-bold text-[11px] sm:text-sm truncate transition-colors ${isActive ? "text-[#1e3a5f]" : "text-slate-600"}`}>
                        {t.author}
                      </p>
                      <p className="text-[9px] sm:text-[10px] text-slate-400 font-semibold truncate">
                        {t.role}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {isActive && <span className="hidden sm:inline text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Active</span>}
                    <ChevronRight size={14} className={`text-slate-400 transition-transform ${isActive ? "rotate-90 text-[#1e3a5f]" : "group-hover:translate-x-0.5"}`} />
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
