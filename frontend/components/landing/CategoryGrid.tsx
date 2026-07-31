"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Code2,
  PenTool,
  Megaphone,
  FileText,
  BarChart3,
  Smartphone,
  ArrowRight,
} from "lucide-react";
import { jobsApi } from "@/lib/api";

const categoryList = [
  {
    name: "Web & Software Dev",
    category: "Web Development",
    icon: Code2,
    fallbackJobs: "2,400+ jobs",
    bg: "bg-emerald-50",
    textColor: "text-emerald-600",
  },
  {
    name: "UI/UX Design",
    category: "Design",
    icon: PenTool,
    fallbackJobs: "1,800+ jobs",
    bg: "bg-indigo-50",
    textColor: "text-indigo-600",
  },
  {
    name: "Digital Marketing",
    category: "Marketing",
    icon: Megaphone,
    fallbackJobs: "1,200+ jobs",
    bg: "bg-amber-50",
    textColor: "text-amber-600",
  },
  {
    name: "Content Writing",
    category: "Writing",
    icon: FileText,
    fallbackJobs: "950+ jobs",
    bg: "bg-emerald-50",
    textColor: "text-emerald-600",
  },
  {
    name: "Data Science & AI",
    category: "Data Science",
    icon: BarChart3,
    fallbackJobs: "780+ jobs",
    bg: "bg-indigo-50",
    textColor: "text-indigo-600",
  },
  {
    name: "Mobile App Development",
    category: "Mobile Development",
    icon: Smartphone,
    fallbackJobs: "640+ jobs",
    bg: "bg-amber-50",
    textColor: "text-amber-600",
  },
];

export function CategoryGrid() {
  const [jobCounts, setJobCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    async function loadCategoryCounts() {
      try {
        const data: any = await jobsApi.getJobs();
        const jobs = data.jobs || data || [];
        if (Array.isArray(jobs)) {
          const counts: Record<string, number> = {};
          jobs.forEach((job: any) => {
            const cat = job.category || "";
            if (cat) {
              counts[cat] = (counts[cat] || 0) + 1;
            }
          });
          setJobCounts(counts);
        }
      } catch (err) {
        // Fallback to initial display
      }
    }
    loadCategoryCounts();
  }, []);

  return (
    <section
      id="categories"
      className="pt-4 sm:pt-6 pb-14 sm:pb-16 bg-[#faf8f5] relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <span className="text-amber-600 font-extrabold text-xs tracking-wider uppercase mb-1.5 block">
              EXPLORE CATEGORIES
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0f172a] tracking-tight mb-2">
              Browse by expertise
            </h2>
            <p className="text-slate-500 text-sm sm:text-base font-medium">
              Find the right talent or opportunity in your field of expertise.
            </p>
          </div>

          <Link href="/jobs">
            <button className="px-5 py-2.5 rounded-full border border-slate-200/90 bg-white text-slate-700 hover:text-slate-900 hover:border-slate-300 font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-2xs hover:shadow-xs transition-all cursor-pointer shrink-0">
              <span>View all categories</span>
              <ArrowRight size={15} />
            </button>
          </Link>
        </div>

        {/* 6 Category Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
          {categoryList.map((cat) => {
            const Icon = cat.icon;
            const liveCount = jobCounts[cat.category];
            const jobsText =
              liveCount !== undefined
                ? `${liveCount} ${liveCount === 1 ? "job" : "jobs"}`
                : cat.fallbackJobs;

            return (
              <Link
                key={cat.name}
                href={`/jobs?category=${encodeURIComponent(cat.category)}`}
                className="group bg-white border border-slate-200/70 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.03)] hover:shadow-xl hover:border-slate-300 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[140px] sm:min-h-[230px]"
              >
                {/* Top Icon Circle */}
                <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full ${cat.bg} flex items-center justify-center mb-3 sm:mb-6 shrink-0`}>
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${cat.textColor}`} />
                </div>

                {/* Middle Title */}
                <h3 className="font-semibold text-slate-800 text-xs sm:text-lg leading-snug mb-auto group-hover:text-slate-900 transition-colors">
                  {cat.name}
                </h3>

                {/* Bottom Row: Real Jobs Count + Arrow */}
                <div className="flex items-center justify-between mt-3 sm:mt-6 pt-1 sm:pt-2">
                  <span className="text-[10px] sm:text-xs text-slate-400 font-medium">
                    {jobsText}
                  </span>
                  <ArrowRight
                    size={14}
                    className="text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition-all sm:w-4 sm:h-4"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}