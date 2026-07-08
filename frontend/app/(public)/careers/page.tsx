"use client";

import { Briefcase, MapPin, ArrowRight, Zap, Coffee, Globe, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/Button";

const openRoles = [
  {
    title: "Senior React/Next.js Developer",
    department: "Engineering",
    location: "Remote, India",
    type: "Full-time",
  },
  {
    title: "Product / UI UX Designer",
    department: "Product & Design",
    location: "Remote, India",
    type: "Full-time",
  },
  {
    title: "Marketing & Growth Lead",
    department: "Growth",
    location: "Bengaluru / Hybrid",
    type: "Full-time",
  },
];

const perks = [
  {
    icon: Globe,
    title: "Remote First",
    desc: "Work from anywhere in India with flexible scheduling and support.",
  },
  {
    icon: GraduationCap,
    title: "Learning Allowance",
    desc: "Annual budget for courses, books, workshops, and certifications.",
  },
  {
    icon: Coffee,
    title: "Home Office Budget",
    desc: "Allowance to set up a comfortable, ergonomic home office workspace.",
  },
  {
    icon: Zap,
    title: "Performance Bonuses",
    desc: "Competitive compensation packages with annual incentive metrics.",
  },
];

export default function CareersPage() {
  return (
    <main
      className="bg-white min-h-screen py-16"
      style={{ fontFamily: "var(--font-poppins), sans-serif" }}
    >
      {/* Careers Hero */}
      <section className="relative overflow-hidden mb-16 py-12">
        <div className="absolute inset-0 bg-gradient-to-br from-[#edf2f7] to-[#f8fafc] opacity-60 -z-10" />
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-1.5 bg-[#edf2f7] text-[#1e3a5f] rounded-full px-4 py-1.5 text-xs font-semibold mb-6">
            <Briefcase size={12} className="text-[#1e3a5f]" />
            <span>Join our fast-growing startup team</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
            Work with <span className="text-[#1e3a5f]">WinkGetJob</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            We are looking for passionate, curious, and collaborative minds to build India's leading remote opportunities network.
          </p>
        </div>
      </section>

      {/* Perks and Benefits */}
      <section className="max-w-5xl mx-auto px-6 mb-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Perks & Benefits
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {perks.map((p, index) => {
            const Icon = p.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-[#edf2f7] text-[#1e3a5f] rounded-xl flex items-center justify-center mb-4">
                  <Icon size={22} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{p.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Open Openings */}
      <section className="max-w-3xl mx-auto px-6 mb-12">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Current Openings
        </h2>
        <div className="space-y-4">
          {openRoles.map((role, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">{role.title}</h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">
                    {role.department}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={12} />
                    {role.location}
                  </span>
                  <span>•</span>
                  <span>{role.type}</span>
                </div>
              </div>
              <div>
                <Button className="bg-[#1e3a5f] hover:bg-[#152a45] gap-1.5" size="sm">
                  Apply Now
                  <ArrowRight size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
