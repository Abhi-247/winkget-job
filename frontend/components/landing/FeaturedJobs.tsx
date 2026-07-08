"use client";

import Link from "next/link";
import { Briefcase, MapPin, Calendar, Clock, ArrowRight, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/Button";

const featuredJobs = [
  {
    id: "1",
    title: "Senior Full Stack Next.js Engineer",
    type: "Contract",
    location: "Remote (India)",
    budget: "₹80,000 - ₹1,20,000 / month",
    posted: "2 hours ago",
    company: "ApexTech Solutions",
    tags: ["Next.js", "TailwindCSS", "Node.js", "PostgreSQL"],
    urgency: "Urgent",
  },
  {
    id: "2",
    title: "Mobile UX/UI Product Designer",
    type: "Part-Time",
    location: "Hybrid (Bangalore)",
    budget: "₹2,500 / hr",
    posted: "1 day ago",
    company: "Zeta Mobile Corp",
    tags: ["Figma", "Design Systems", "Prototyping", "iOS/Android"],
    urgency: "Featured",
  },
  {
    id: "3",
    title: "Python ML & Data Analytics Specialist",
    type: "Full-Time",
    location: "Remote",
    budget: "₹15 - ₹22 LPA",
    posted: "3 days ago",
    company: "NeuralScale AI",
    tags: ["Python", "TensorFlow", "Pandas", "AWS"],
    urgency: "Featured",
  },
];

export function FeaturedJobs() {
  return (
    <section
      id="featured-jobs"
      className="py-20 bg-white"
      style={{ fontFamily: "var(--font-poppins), sans-serif" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-1.5 bg-[#fdf8e8] text-[#d4a017] px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-3">
            <Briefcase size={12} />
            Trending Opportunities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight mb-4">
            Featured Job Openings
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Discover some of the highest-paying, verified projects and roles posted recently by premium employers.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {featuredJobs.map((job) => (
            <div
              key={job.id}
              className="group flex flex-col justify-between p-6 bg-white rounded-2xl border border-gray-200 hover:border-[#1e3a5f]/40 hover:shadow-lg transition-all duration-300 relative"
            >
              {/* Top Row with Badge & Posted Time */}
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    job.urgency === "Urgent"
                      ? "bg-red-50 text-red-600 border border-red-100"
                      : "bg-[#edf2f7] text-[#1e3a5f] border border-[#1e3a5f]/10"
                  }`}
                >
                  {job.urgency}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock size={12} />
                  {job.posted}
                </span>
              </div>

              {/* Title & Company */}
              <div className="mb-4">
                <h3 className="font-bold text-gray-900 text-lg leading-snug group-hover:text-[#1e3a5f] transition-colors mb-1">
                  {job.title}
                </h3>
                <span className="text-sm font-semibold text-gray-500">
                  {job.company}
                </span>
              </div>

              {/* Metadata */}
              <div className="space-y-2 mb-5">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                  <MapPin size={14} className="text-gray-400" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#1e3a5f]">
                  <DollarSign size={14} className="text-[#d4a017]" />
                  <span>{job.budget}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-6">
                {job.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded bg-[#f8fafc] border border-gray-100 text-[11px] font-semibold text-gray-500 group-hover:bg-[#edf2f7]/50 transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Action Button */}
              <Link href={`/jobs`} className="mt-auto">
                <Button
                  className="w-full bg-[#1e3a5f]/5 hover:bg-[#1e3a5f] text-[#1e3a5f] hover:text-white rounded-xl py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  View Details & Apply
                  <ArrowRight size={14} />
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* View All jobs CTA */}
        <div className="text-center mt-12">
          <Link href="/jobs">
            <span className="inline-flex items-center gap-2 text-sm font-bold text-[#1e3a5f] hover:text-[#1e3a5f]/80 transition-colors cursor-pointer group">
              Explore All Job Listings
              <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
