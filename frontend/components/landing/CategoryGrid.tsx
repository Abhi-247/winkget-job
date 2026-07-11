import Link from "next/link";
import {
  Code2,
  Paintbrush,
  TrendingUp,
  PenTool,
  Smartphone,
  BarChart2,
  Search,
  ArrowRight
} from "lucide-react";

export function CategoryGrid() {
  return (
    <section
      id="categories"
      className="py-12 bg-[#f1f5f9]/50 border-y border-slate-200/40 relative overflow-hidden"
      style={{ fontFamily: "var(--font-poppins), sans-serif" }}
    >
      {/* Decorative background blurs */}
      <div
        className="absolute -top-32 -left-32 w-96 h-96 bg-[#1e3a5f] rounded-full opacity-[0.04] blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#d4a017] rounded-full opacity-[0.04] blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-10">
          <span className="inline-block text-[11px] font-bold tracking-widest text-[#d4a017] bg-amber-50 border border-amber-100/60 rounded-full px-4 py-1 uppercase mb-3">
            Specialized Categories
          </span>
          <h2 className="text-3xl font-extrabold text-[#0f172a] tracking-tight mb-2">
            Browse by Category
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto text-sm sm:text-base font-medium">
            Find skilled professionals across every domain — from tech to creative.
          </p>
        </div>

        {/* Bento Grid Layout (cols-2 on mobile, cols-4 on desktop) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:auto-rows-fr">
          
          {/* 1. Web Development (Spans 2 cols on mobile, 2 cols + 2 rows on desktop) */}
          <Link
            href={`/jobs?category=${encodeURIComponent("Web Development")}`}
            className="group relative flex flex-col items-start p-6 sm:p-8 rounded-3xl border border-slate-100 bg-white transition-all duration-300 hover:-translate-y-1.5 hover:border-transparent col-span-2 lg:row-span-2 min-h-[260px] sm:min-h-[300px] overflow-hidden hover:shadow-[0_20px_40px_rgba(59,130,246,0.08)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-3xl" />
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center mb-4 sm:mb-5 bg-gradient-to-tr from-blue-50 to-indigo-50 text-blue-600 border border-blue-100/50 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3 shadow-sm z-10">
              <Code2 size={20} />
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight transition-colors duration-300 group-hover:text-[#1e3a5f] mb-2 z-10 leading-tight">
              Web & Software Dev
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-xs leading-relaxed mb-4 sm:mb-6 z-10">
              Build high-performance websites, custom web applications, APIs, and complex software systems.
            </p>
            
            {/* Watermark text */}
            <div className="absolute -right-4 bottom-12 text-6xl sm:text-8xl font-black text-slate-100/30 dark:text-slate-900/5 pointer-events-none select-none z-0 tracking-tighter leading-none transition-all duration-300 group-hover:text-blue-500/10 group-hover:scale-105">
              CODE
            </div>
            
            {/* Visual Editor Element inside wide card */}
            <div className="w-full bg-slate-950/90 rounded-xl p-3 border border-slate-800 text-[9px] sm:text-[10px] font-mono text-slate-300 opacity-70 group-hover:opacity-90 transition-opacity duration-300 pointer-events-none shadow-lg mb-4 sm:mb-6 z-10">
              <div className="flex items-center gap-1.5 mb-1.5 border-b border-slate-800 pb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              </div>
              <div className="text-emerald-400">const developer = {"{"}</div>
              <div className="pl-3">skills: [&apos;React&apos;, &apos;Next.js&apos;],</div>
              <div className="pl-3">available: <span className="text-amber-400">true</span></div>
              <div className="text-emerald-400">{"}"};</div>
            </div>

            <div className="mt-auto flex justify-end w-full z-10">
              <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#1e3a5f] group-hover:text-white group-hover:border-transparent transition-all duration-300 transform group-hover:scale-110">
                <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-0.5" />
              </div>
            </div>
          </Link>

          {/* 2. UI/UX Design (Spans 2 cols on mobile, 1 col + 2 rows on desktop) */}
          <Link
            href={`/jobs?category=${encodeURIComponent("Design")}`}
            className="group relative flex flex-col items-start p-6 sm:p-8 rounded-3xl border border-slate-100 bg-white transition-all duration-300 hover:-translate-y-1.5 hover:border-transparent col-span-2 lg:col-span-1 lg:row-span-2 min-h-[260px] sm:min-h-[300px] overflow-hidden hover:shadow-[0_20px_40px_rgba(168,85,247,0.08)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-3xl" />
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center mb-4 sm:mb-5 bg-gradient-to-tr from-purple-50 to-pink-50 text-purple-600 border border-purple-100/50 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3 shadow-sm z-10">
              <Paintbrush size={20} />
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight transition-colors duration-300 group-hover:text-[#1e3a5f] mb-2 z-10 leading-tight">
              UI/UX & Creative Design
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed mb-4 sm:mb-6 z-10">
              Craft stunning interfaces, custom graphic illustrations, style-guides, and brand designs.
            </p>
            
            {/* Watermark text */}
            <div className="absolute -right-4 bottom-12 text-6xl sm:text-8xl font-black text-slate-100/30 dark:text-slate-900/5 pointer-events-none select-none z-0 tracking-tighter leading-none transition-all duration-300 group-hover:text-purple-500/10 group-hover:scale-105">
              DESIGN
            </div>

            {/* Visual Color Palette element inside tall card */}
            <div className="flex flex-col gap-1.5 items-center w-full bg-slate-550 border border-slate-100 rounded-xl p-2.5 shadow-sm mb-4 sm:mb-6 z-10 group-hover:bg-white transition-colors duration-300">
              <div className="flex gap-1.5">
                <span className="w-4 h-4 rounded-full bg-[#1e3a5f] shadow-inner" />
                <span className="w-4 h-4 rounded-full bg-[#d4a017]" />
                <span className="w-4 h-4 rounded-full bg-purple-500" />
                <span className="w-4 h-4 rounded-full bg-pink-400" />
              </div>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Brand Colors</span>
            </div>

            <div className="mt-auto flex justify-end w-full z-10">
              <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#1e3a5f] group-hover:text-white group-hover:border-transparent transition-all duration-300 transform group-hover:scale-110">
                <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-0.5" />
              </div>
            </div>
          </Link>          {/* 3. Digital Marketing (Spans 1 col on mobile, 1 col on desktop - Part of 2x2 grid) */}
          <Link
            href={`/jobs?category=${encodeURIComponent("Marketing")}`}
            className="group relative flex flex-col items-start p-5 sm:p-6 rounded-3xl border border-slate-100 bg-white transition-all duration-300 hover:-translate-y-1.5 hover:border-transparent hover:shadow-[0_20px_40px_rgba(245,158,11,0.08)] col-span-1 overflow-hidden min-h-[150px] sm:min-h-[170px]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-3xl" />
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 sm:mb-4 bg-gradient-to-tr from-amber-50 to-orange-50 text-amber-600 border border-amber-100/50 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3 shadow-sm z-10">
              <TrendingUp size={16} />
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-800 tracking-tight transition-colors duration-300 group-hover:text-[#1e3a5f] mb-1 z-10 leading-snug">
              Digital Marketing
            </h3>
            
            {/* Watermark text */}
            <div className="absolute -right-2 bottom-6 text-4xl sm:text-5xl font-black text-slate-100/30 dark:text-slate-900/5 pointer-events-none select-none z-0 tracking-tighter leading-none transition-all duration-300 group-hover:text-amber-500/10 group-hover:scale-105">
              MARKETING
            </div>
            
            <div className="mt-auto flex justify-end w-full z-10">
              <div className="w-7 h-7 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#1e3a5f] group-hover:text-white group-hover:border-transparent transition-all duration-300 transform group-hover:scale-110">
                <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-0.5" />
              </div>
            </div>
          </Link>

          {/* 4. Content Writing (Spans 1 col on mobile, 1 col on desktop - Part of 2x2 grid) */}
          <Link
            href={`/jobs?category=${encodeURIComponent("Writing")}`}
            className="group relative flex flex-col items-start p-5 sm:p-6 rounded-3xl border border-slate-100 bg-white transition-all duration-300 hover:-translate-y-1.5 hover:border-transparent hover:shadow-[0_20px_40px_rgba(244,63,94,0.08)] col-span-1 overflow-hidden min-h-[150px] sm:min-h-[170px]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-3xl" />
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 sm:mb-4 bg-gradient-to-tr from-pink-50 to-rose-50 text-pink-600 border border-pink-100/50 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3 shadow-sm z-10">
              <PenTool size={16} />
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-800 tracking-tight transition-colors duration-300 group-hover:text-[#1e3a5f] mb-1 z-10 leading-snug">
              Content Writing
            </h3>
            
            {/* Watermark text */}
            <div className="absolute -right-2 bottom-6 text-4xl sm:text-5xl font-black text-slate-100/30 dark:text-slate-900/5 pointer-events-none select-none z-0 tracking-tighter leading-none transition-all duration-300 group-hover:text-pink-500/10 group-hover:scale-105">
              WRITING
            </div>
            
            <div className="mt-auto flex justify-end w-full z-10">
              <div className="w-7 h-7 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#1e3a5f] group-hover:text-white group-hover:border-transparent transition-all duration-300 transform group-hover:scale-110">
                <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-0.5" />
              </div>
            </div>
          </Link>

          {/* 5. Data Science & AI (Spans 2 cols on mobile, 2 cols on desktop) */}
          <Link
            href={`/jobs?category=${encodeURIComponent("Data Science")}`}
            className="group relative flex flex-col items-start p-5 sm:p-6 rounded-3xl border border-slate-100 bg-white transition-all duration-300 hover:-translate-y-1.5 hover:border-transparent hover:shadow-[0_20px_40px_rgba(99,102,241,0.08)] col-span-2 overflow-hidden min-h-[150px] sm:min-h-[170px]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-3xl" />
            <div className="flex items-center gap-3 sm:gap-5 mb-3 sm:mb-4 z-10">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center bg-gradient-to-tr from-indigo-50 to-blue-50 text-indigo-600 border border-indigo-100/50 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3 shadow-sm">
                <BarChart2 size={20} />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg sm:text-2xl font-extrabold text-slate-800 tracking-tight transition-colors duration-300 group-hover:text-[#1e3a5f] leading-snug">
                  Data Science & Machine Learning
                </h3>
                <span className="text-[10px] sm:text-xs font-semibold text-slate-400 block mt-0.5">AI Engineers, ML Engineers, Analysts</span>
              </div>
            </div>
            
            {/* Watermark text */}
            <div className="absolute right-24 bottom-6 text-4xl sm:text-6xl font-black text-slate-100/30 dark:text-slate-900/5 pointer-events-none select-none z-0 tracking-tighter leading-none transition-all duration-300 group-hover:text-indigo-500/10 group-hover:scale-105">
              DATA SCIENCE
            </div>

            {/* Visual Mini Chart overlay */}
            <div className="absolute right-6 bottom-4 flex items-end gap-1 h-8 pointer-events-none opacity-30 group-hover:opacity-75 transition-opacity duration-300">
              <div className="w-1 bg-indigo-500/30 rounded-t-sm h-[30%]" />
              <div className="w-1 bg-indigo-500/50 rounded-t-sm h-[60%]" />
              <div className="w-1 bg-indigo-500/80 rounded-t-sm h-[45%]" />
              <div className="w-1 bg-indigo-500 rounded-t-sm h-[90%]" />
            </div>

            <div className="mt-auto flex justify-end w-full z-10">
              <div className="w-7 h-7 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#1e3a5f] group-hover:text-white group-hover:border-transparent transition-all duration-300 transform group-hover:scale-110">
                <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-0.5" />
              </div>
            </div>
          </Link>

          {/* 6. Mobile App Dev (Spans 1 col on mobile, 1 col on desktop - Part of 2x2 grid) */}
          <Link
            href={`/jobs?category=${encodeURIComponent("Mobile Development")}`}
            className="group relative flex flex-col items-start p-5 sm:p-6 rounded-3xl border border-slate-100 bg-white transition-all duration-300 hover:-translate-y-1.5 hover:border-transparent hover:shadow-[0_20px_40px_rgba(234,88,12,0.08)] col-span-1 overflow-hidden min-h-[150px] sm:min-h-[170px]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-3xl" />
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 sm:mb-4 bg-gradient-to-tr from-orange-50 to-red-50 text-orange-600 border border-orange-100/50 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3 shadow-sm z-10">
              <Smartphone size={16} />
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-800 tracking-tight transition-colors duration-300 group-hover:text-[#1e3a5f] mb-1 z-10 leading-snug">
              Mobile App Dev
            </h3>
            
            {/* Watermark text */}
            <div className="absolute -right-2 bottom-6 text-4xl sm:text-5xl font-black text-slate-100/30 dark:text-slate-900/5 pointer-events-none select-none z-0 tracking-tighter leading-none transition-all duration-300 group-hover:text-orange-500/10 group-hover:scale-105">
              MOBILE
            </div>
            
            <div className="mt-auto flex justify-end w-full z-10">
              <div className="w-7 h-7 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#1e3a5f] group-hover:text-white group-hover:border-transparent transition-all duration-300 transform group-hover:scale-110">
                <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-0.5" />
              </div>
            </div>
          </Link>

          {/* 7. SEO & SEM (Spans 1 col on mobile, 1 col on desktop - Part of 2x2 grid) */}
          <Link
            href={`/jobs?category=${encodeURIComponent("Marketing")}`}
            className="group relative flex flex-col items-start p-5 sm:p-6 rounded-3xl border border-slate-100 bg-white transition-all duration-300 hover:-translate-y-1.5 hover:border-transparent hover:shadow-[0_20px_40px_rgba(20,184,166,0.08)] col-span-1 overflow-hidden min-h-[150px] sm:min-h-[170px]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-3xl" />
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 sm:mb-4 bg-gradient-to-tr from-teal-50 to-emerald-50 text-teal-600 border border-teal-100/50 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3 shadow-sm z-10">
              <Search size={16} />
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-800 tracking-tight transition-colors duration-300 group-hover:text-[#1e3a5f] mb-1 z-10 leading-snug">
              SEO & SEM Experts
            </h3>
            
            {/* Watermark text */}
            <div className="absolute -right-2 bottom-6 text-4xl sm:text-5xl font-black text-slate-100/30 dark:text-slate-900/5 pointer-events-none select-none z-0 tracking-tighter leading-none transition-all duration-300 group-hover:text-teal-500/10 group-hover:scale-105">
              SEO
            </div>
            
            <div className="mt-auto flex justify-end w-full z-10">
              <div className="w-7 h-7 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#1e3a5f] group-hover:text-white group-hover:border-transparent transition-all duration-300 transform group-hover:scale-110">
                <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-0.5" />
              </div>
            </div>
          </Link>

          {/* 8. Glowing Custom CTA Bento Card (Spans 2 cols on mobile, 4 columns on desktop) */}
          <div className="col-span-2 lg:col-span-4 relative flex flex-col md:flex-row items-center justify-between p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#1e3a5f] via-[#2c5282] to-[#12233a] text-white border border-[#1e3a5f]/40 overflow-hidden group min-h-[150px]">
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
            
            <div className="mb-5 md:mb-0 text-left relative z-10">
              <h3 className="text-base sm:text-lg font-bold mb-1.5 flex items-center gap-2">
                Need custom project deliverables?
              </h3>
              <p className="text-slate-300 text-[11px] sm:text-xs font-semibold max-w-2xl leading-relaxed">
                Post your specifications on WinkGetJob today. Hire top-tier freelancers and pay hourly or fixed-price with secure escrow protection.
              </p>
            </div>
            
            <Link href="/register?role=employer" className="flex-shrink-0 relative z-10 w-full md:w-auto">
              <button className="bg-gradient-to-r from-[#d4a017] to-amber-500 text-slate-900 font-extrabold px-6 py-3 rounded-full text-xs shadow-md transition-all duration-300 hover:scale-105 hover:shadow-amber-500/20 cursor-pointer w-full md:w-auto">
                Post a Job Now
              </button>
            </Link>
          </div>

        </div>

        <div className="flex justify-center mt-10">
          <Link href="/jobs">
            <button className="group border-2 border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-sm hover:shadow-md">
              View All Categories
              <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes categoryFadeIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .category-card {
          animation: categoryFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @media (prefers-reduced-motion: reduce) {
          .category-card {
            animation: none !important;
          }
        }
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
        .group:hover .group-hover\\:animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
      `}</style>
    </section>
  );
}