"use client";

import Link from "next/link";
import { Star, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

const freelancers = [
  {
    name: "Ayesha Siddiqui",
    title: "Senior React Developer",
    location: "Mumbai",
    rating: 5.0,
    reviews: 128,
    hourlyRate: 2500,
    avatarBg: "bg-purple-600",
    initials: "AS",
    description: "5+ years building production React apps for startups and enterprises. Specializing in Next.js,...",
    skills: ["React", "Next.js", "TypeScript", "+1"],
    badges: [
      { text: "★ Top Rated", className: "bg-amber-50 text-amber-600" },
      { text: "Verified", className: "bg-emerald-50 text-emerald-600" },
    ],
    stats: "87 jobs • 100% success",
  },
  {
    name: "Rahul Mehta2dsgdgg",
    title: "UI/UX Designer",
    location: "Bangalore",
    rating: 4.9,
    reviews: 94,
    hourlyRate: 1800,
    avatarBg: "bg-[#1e3a5f]",
    initials: "RM",
    description: "Product designer with 6 years of experience creating intuitive digital experiences for B2B and...",
    skills: ["Figma", "Adobe XD", "Prototyping", "+1"],
    badges: [
      { text: "★ Top Rated", className: "bg-amber-50 text-amber-600" },
      { text: "Verified", className: "bg-emerald-50 text-emerald-600" },
    ],
    stats: "63 jobs • 98% success",
  },
  {
    name: "Vikram Nair",
    title: "Data Scientist",
    location: "Hyderabad",
    rating: 4.9,
    reviews: 61,
    hourlyRate: 3000,
    avatarBg: "bg-teal-600",
    initials: "VN",
    description: "Data scientist with 8 years in ML and analytics. Experience in fintech, healthcare, and e-...",
    skills: ["Python", "TensorFlow", "SQL", "+1"],
    badges: [
      { text: "★ Top Rated", className: "bg-amber-50 text-amber-600" },
      { text: "Expert", className: "bg-purple-50 text-purple-600" },
    ],
    stats: "44 jobs • 99% success",
  },
];

export function FreelancerCarousel() {
  return (
    <section
      id="freelancers"
      className="py-16 bg-[#f8fafc]"
      style={{ fontFamily: "var(--font-poppins), sans-serif" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <div className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 rounded-full px-3 py-1 text-xs font-semibold mb-3">
              <Star size={12} className="fill-amber-500 text-amber-500" />
              <span>Top Rated Talent</span>
            </div>
            <h2 className="text-3xl font-bold text-[#0f172a] mb-2">
              Hire the Best Freelancers
            </h2>
            <p className="text-gray-500 max-w-xl text-lg">
              Hand-picked professionals with 4.8+ ratings, verified reviews, and proven track records across every skill.
            </p>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <button className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:border-[#1e3a5f] hover:text-[#1e3a5f] transition-colors">
              <ChevronLeft size={18} />
            </button>
            <button className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:border-[#1e3a5f] hover:text-[#1e3a5f] transition-colors">
              <ChevronRight size={18} />
            </button>
            <Link href="/jobs">
              <button className="border border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#edf2f7] px-5 py-2 rounded-full text-sm font-semibold transition-colors">
                View All →
              </button>
            </Link>
          </div>
        </div>

        {/* Carousel Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {freelancers.map((f) => (
            <div
              key={f.name}
              className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all"
            >
              {/* Badges row */}
              <div className="flex items-center gap-2 mb-3">
                {f.badges.map((b) => (
                  <span
                    key={b.text}
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${b.className}`}
                  >
                    {b.text}
                  </span>
                ))}
              </div>

              {/* Profile row */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-sm ${f.avatarBg}`}
                  >
                    {f.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 leading-tight">{f.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{f.title}</p>
                  </div>
                </div>
                <span className="text-[11px] bg-[#edf2f7] text-[#1e3a5f] px-2 py-0.5 rounded-full font-semibold">
                  Available
                </span>
              </div>

              {/* Rating and Location */}
              <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={12}
                      className={
                        star <= Math.floor(f.rating)
                          ? "text-amber-400 fill-amber-400"
                          : "text-gray-200 fill-gray-200"
                      }
                    />
                  ))}
                </div>
                <span className="font-bold text-gray-900 text-xs ml-0.5">{f.rating.toFixed(1)}</span>
                <span className="text-xs text-gray-400">({f.reviews})</span>
                <span className="text-gray-300 mx-1">•</span>
                <MapPin size={12} className="text-gray-400" />
                <span className="text-xs">{f.location}</span>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-500 mb-4 leading-relaxed line-clamp-2 min-h-[40px]">
                {f.description}
              </p>

              {/* Skills */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {f.skills.map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-0.5 rounded bg-gray-50 border border-gray-100 text-xs font-medium text-gray-600"
                  >
                    {s}
                  </span>
                ))}
              </div>

              <hr className="border-gray-100 my-4" />

              {/* Footer info & action */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-lg font-bold text-[#0f172a]">
                    ₹{f.hourlyRate.toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs text-gray-400">/hr</span>
                </div>
                <span className="text-xs text-gray-500 font-medium">
                  {f.stats}
                </span>
              </div>

              <Button className="w-full bg-[#1e3a5f] hover:bg-[#152a45] text-white rounded-xl py-3 font-semibold text-sm">
                Hire Now
              </Button>
            </div>
          ))}
        </div>

        {/* Indicator dots */}
        <div className="flex justify-center items-center gap-1.5 mt-8">
          <div className="w-5 h-1.5 rounded-full bg-[#1e3a5f]"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
        </div>
      </div>
    </section>
  );
}
