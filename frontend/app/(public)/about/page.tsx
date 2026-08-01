"use client";

import {
  Users,
  Award,
  ShieldCheck,
  Heart,
  Sparkles,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Briefcase,
  Zap,
  Globe,
  ArrowRight,
  Star,
  Quote,
  Building2,
  Clock,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState<"freelancer" | "employer">("freelancer");

  const milestones = [
    {
      year: "2023",
      title: "Foundation & Launch",
      desc: "WinkGetJob was founded in New Delhi with a vision to simplify freelance hiring in India, onboarding the first 1,000 verified professionals.",
      icon: Building2,
    },
    {
      year: "2024",
      title: "Milestone Escrow Payouts",
      desc: "Introduced 100% secure escrow payments, guaranteeing project funds are locked safely before work begins.",
      icon: ShieldCheck,
    },
    {
      year: "2025",
      title: "Pan-India Expansion",
      desc: "Scaled across 25+ cities including Bangalore, Mumbai, Hyderabad, and Pune with over 25,000 active projects completed.",
      icon: Globe,
    },
    {
      year: "2026",
      title: "Smart Matching Engine",
      desc: "Rolled out instant skill matching and live project tracking drawers, empowering seamless employer-freelancer collaboration.",
      icon: Zap,
    },
  ];

  const teamMembers = [
    {
      name: "Abhishek Verma",
      role: "Founder & Chief Executive Officer",
      bio: "Passionate about building scalable digital platforms that bridge the gap between Indian talent and modern enterprises.",
      avatarBg: "bg-blue-600 text-white",
      skills: ["Product Strategy", "Leadership", "Platform Architecture"],
    },
    {
      name: "Sneha Sharma",
      role: "Head of Product & User Experience",
      bio: "Focused on creating intuitive, friction-free web experiences for employers and job seekers across India.",
      avatarBg: "bg-amber-500 text-white",
      skills: ["UI/UX Design", "User Research", "Growth"],
    },
    {
      name: "Rohan Kulkarni",
      role: "Lead Platform Engineer",
      bio: "Architecting real-time communication systems, secure authentication pipelines, and high-concurrency microservices.",
      avatarBg: "bg-indigo-600 text-white",
      skills: ["Next.js", "Node.js", "System Design"],
    },
    {
      name: "Pooja Patel",
      role: "Head of Talent Trust & Safety",
      bio: "Ensuring 100% profile authenticity, dispute resolution fairness, and safe transaction workflows for every user.",
      avatarBg: "bg-emerald-600 text-white",
      skills: ["Escrow Audit", "Trust & Safety", "Legal Compliance"],
    },
  ];

  const comparisons = [
    {
      feature: "Platform Commission Fee",
      winkget: "0% for Freelancers (Transparent)",
      agency: "20% - 35% Cut",
      global: "10% - 20% Service Fee",
    },
    {
      feature: "Escrow Payment Guarantee",
      winkget: "Included on All Projects",
      agency: "Manual Paper Contracts",
      global: "Standard Escrow",
    },
    {
      feature: "Local Support (India)",
      winkget: "24/7 Phone, WhatsApp & Email",
      agency: "Business Hours Only",
      global: "Automated Bot Support",
    },
    {
      feature: "Fast Payout Options",
      winkget: "Instant UPI & Direct Bank Transfer",
      agency: "30-60 Day Wire Terms",
      global: "3-5 Business Days + Wire Fees",
    },
    {
      feature: "Skill Verification Badge",
      winkget: "Verified Portfolio & Code Review",
      agency: "Self-Reported Resumes",
      global: "Basic Paid Skill Tests",
    },
  ];

  return (
    <main
      className="bg-white min-h-screen"
      style={{ fontFamily: "var(--font-poppins), sans-serif" }}
    >
      {/* HERO SECTION - Light Soft Emerald Theme */}
      <section className="bg-[#f8fafc]/90 border-b border-slate-200/60 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

            {/* LEFT COLUMN: Text + Badges + Highlights + Stats */}
            <div className="lg:col-span-6 z-10">

              {/* Tag / Category Indicator */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-xs border border-emerald-200/60 mb-3 shadow-2xs">
                <Sparkles size={14} className="text-emerald-600" />
                <span className="uppercase tracking-wider font-extrabold text-[10px]">ABOUT WINKGETJOB</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-2xl sm:text-4xl lg:text-[2.25rem] xl:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.18] mb-2.5">
                Bridging Indian Talent with <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Global Opportunities</span>
              </h1>

              {/* Subtitle */}
              <p className="text-slate-600 text-xs sm:text-sm font-normal max-w-lg mb-4 leading-relaxed">
                WinkGetJob is India’s fastest-growing freelance marketplace — connecting verified developers, designers, and creators directly with companies with 100% escrow protection.
              </p>

              {/* Feature Highlights Cards */}
              <div className="grid grid-cols-3 gap-1.5 sm:flex sm:items-center sm:gap-2.5 mb-4">
                <div className="flex items-center justify-center gap-1 sm:gap-2 bg-white px-1.5 sm:px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
                  <span className="p-0.5 sm:p-1 rounded-md sm:rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200/50 shrink-0">
                    <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </span>
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-800 truncate">100% Escrow</span>
                </div>
                <div className="flex items-center justify-center gap-1 sm:gap-2 bg-white px-1.5 sm:px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
                  <span className="p-0.5 sm:p-1 rounded-md sm:rounded-lg bg-amber-50 text-amber-600 border border-amber-200/50 shrink-0">
                    <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </span>
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-800 truncate">0% Fee</span>
                </div>
                <div className="flex items-center justify-center gap-1 sm:gap-2 bg-white px-1.5 sm:px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
                  <span className="p-0.5 sm:p-1 rounded-md sm:rounded-lg bg-teal-50 text-teal-600 border border-teal-200/50 shrink-0">
                    <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </span>
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-800 truncate">Instant UPI</span>
                </div>
              </div>

              {/* Quick Stats Row (Centered layout) */}
              <div className="grid grid-cols-3 gap-1 pt-3 border-t border-slate-200/70 w-full max-w-md">
                <div className="text-center flex flex-col items-center">
                  <p className="text-base sm:text-lg font-extrabold text-slate-900 leading-none">50K+</p>
                  <p className="text-[9px] sm:text-[11px] text-slate-500 font-medium mt-1 whitespace-nowrap">Freelancers</p>
                </div>
                <div className="text-center flex flex-col items-center">
                  <p className="text-base sm:text-lg font-extrabold text-slate-900 leading-none">18K+</p>
                  <p className="text-[9px] sm:text-[11px] text-slate-500 font-medium mt-1 whitespace-nowrap">Projects Done</p>
                </div>
                <div className="text-center flex flex-col items-center">
                  <p className="text-base sm:text-lg font-extrabold text-slate-900 leading-none">₹0</p>
                  <p className="text-[9px] sm:text-[11px] text-slate-500 font-medium mt-1 whitespace-nowrap">Platform Fee</p>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Custom Generated Image + Organic Soft Blob + Floating Cards */}
            <div className="hidden lg:flex lg:col-span-6 relative items-center justify-end min-h-[320px] xl:min-h-[360px] lg:pr-2 xl:pr-6">
              {/* Organic Soft Mint Blob Background */}
              <div className="absolute w-[360px] xl:w-[420px] h-[300px] xl:h-[340px] bg-[#e6f4ea] rounded-[65%_35%_60%_40%/50%_60%_40%_50%] pointer-events-none -z-0 right-0 xl:right-4" />

              {/* Custom Generated Image */}
              <div className="relative z-10 w-[360px] xl:w-[430px] h-auto flex items-center justify-end">
                <Image
                  src="/about-hero.png"
                  alt="About WinkGetJob Custom Illustration"
                  width={520}
                  height={520}
                  priority
                  className="object-contain drop-shadow-md w-full h-auto rounded-2xl"
                />
              </div>

              {/* Floating Card 1: Top Left */}
              <div className="absolute top-4 left-0 xl:left-4 z-20 bg-white/95 backdrop-blur-md rounded-xl p-2.5 shadow-lg border border-slate-100/80 w-36 transition-transform duration-300 hover:scale-105">
                <p className="text-[10px] font-medium text-slate-500 mb-0.5">Active Workforce</p>
                <p className="text-xs font-extrabold text-slate-900">50,000+ Vetted</p>
              </div>

              {/* Floating Card 2: Bottom Right */}
              <div className="absolute bottom-2 right-2 xl:right-6 z-20 bg-[#fef9c3]/90 backdrop-blur-md rounded-xl px-3 py-2 shadow-lg border border-amber-200/60 flex items-center gap-2.5 transition-transform duration-300 hover:scale-105">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <Star size={15} fill="currentColor" />
                </div>
                <div>
                  <p className="text-[11px] font-extrabold text-slate-900 leading-tight">4.9★ Rating</p>
                  <p className="text-[9px] text-slate-600 font-semibold">10K+ Reviews</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="py-16 space-y-24">
        {/* Stats Board */}
        <section className="max-w-6xl mx-auto px-6">
          <div className="bg-gradient-to-br from-slate-900 to-[#1e3a5f] rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative z-10">
              <div className="p-4 border-r border-white/10 last:border-[#1e3a5f]">
                <div className="text-3xl sm:text-4xl font-extrabold text-[#d4a017] mb-2">50,000+</div>
                <div className="text-xs sm:text-sm text-white/70 font-medium">Verified Freelancers</div>
              </div>
              <div className="p-4 border-r border-white/10 last:border-none">
                <div className="text-3xl sm:text-4xl font-extrabold text-[#d4a017] mb-2">18,500+</div>
                <div className="text-xs sm:text-sm text-white/70 font-medium">Completed Projects</div>
              </div>
              <div className="p-4 border-r border-white/10 last:border-none">
                <div className="text-3xl sm:text-4xl font-extrabold text-[#d4a017] mb-2">₹28Cr+</div>
                <div className="text-xs sm:text-sm text-white/70 font-medium">Earned by Talent</div>
              </div>
              <div className="p-4">
                <div className="text-3xl sm:text-4xl font-extrabold text-[#d4a017] mb-2">99.4%</div>
                <div className="text-xs sm:text-sm text-white/70 font-medium">Client Satisfaction</div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-[#1e3a5f] to-[#152a45] text-white rounded-3xl p-8 sm:p-10 shadow-lg border border-blue-900/50 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                  <TrendingUp className="text-[#d4a017]" size={24} />
                </div>
                <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                <p className="leading-relaxed text-blue-100/90 text-sm sm:text-base">
                  To democratize access to high-value work for every skilled Indian professional, while enabling businesses — from early-stage startups to enterprises — to scale seamlessly without traditional hiring friction.
                </p>
              </div>
              <ul className="mt-8 space-y-3 border-t border-white/10 pt-6 text-sm text-blue-200">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#d4a017]" /> Zero commission cuts on freelancer earnings
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#d4a017]" /> Protected milestone payouts on every job
                </li>
              </ul>
            </div>

            <div className="bg-white border border-gray-200 rounded-3xl p-8 sm:p-10 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#1e3a5f] flex items-center justify-center mb-6">
                  <Globe className="text-[#d4a017]" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h2>
                <p className="leading-relaxed text-gray-600 text-sm sm:text-base">
                  To shape India into the global epicenter of remote talent excellence by combining smart skill verification, transparent escrow protections, and ultra-fast payment infrastructure.
                </p>
              </div>
              <ul className="mt-8 space-y-3 border-t border-gray-100 pt-6 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" /> Pan-India coverage from Tier 1 to Tier 3 hubs
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" /> Real-time work update drawers and delivery tracking
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Milestones & Journey */}
        <section className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Our Growth Journey</h2>
            <p className="text-gray-500 text-sm">
              How WinkGetJob evolved from a grassroots initiative into India's trusted freelance hub.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {milestones.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-gray-50/80 border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-all hover:-translate-y-1 relative"
                >
                  <span className="text-3xl font-extrabold text-[#1e3a5f]/20 absolute top-4 right-4">
                    {item.year}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-[#1e3a5f] text-white flex items-center justify-center mb-4 shadow-md">
                    <Icon size={20} />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Core Values */}
        <section className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">What We Stand For</h2>
            <p className="text-gray-500 text-sm">
              Principles guiding every feature, transaction, and interaction on WinkGetJob.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: ShieldCheck,
                title: "Financial Security",
                desc: "Every contract utilizes milestone escrow. Funds are locked before work starts and released upon client approval.",
                color: "bg-blue-50 text-blue-600 border-blue-100",
              },
              {
                icon: Users,
                title: "Talent Empowerment",
                desc: "We respect independent creators. No predatory fee deductions, no hidden charges, and complete control over quotes.",
                color: "bg-purple-50 text-purple-600 border-purple-100",
              },
              {
                icon: Award,
                title: "Vetted Quality",
                desc: "Every applicant profile undergoes portfolio verification, identity checks, and real job performance reviews.",
                color: "bg-amber-50 text-amber-600 border-amber-100",
              },
              {
                icon: Heart,
                title: "Prompt Resolution",
                desc: "Our customer success team operates 24/7 in India to handle inquiries, technical help, and dispute mediation.",
                color: "bg-emerald-50 text-emerald-600 border-emerald-100",
              },
            ].map((val, idx) => {
              const Icon = val.icon;
              return (
                <div
                  key={idx}
                  className={`bg-white rounded-2xl border p-6 shadow-sm hover:shadow-md transition-shadow ${val.color}`}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-white shadow-sm">
                    <Icon size={24} />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{val.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{val.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Why Choose Us - Comparison Matrix */}
        <section className="max-w-6xl mx-auto px-6">
          <div className="bg-gray-50 border border-gray-200 rounded-3xl p-8 sm:p-12">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-bold text-[#1e3a5f] bg-blue-100/60 px-3 py-1 rounded-full uppercase tracking-wider">
                Why We Are Different
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-3 mb-2">
                WinkGetJob vs Other Marketplaces
              </h2>
              <p className="text-gray-500 text-sm">
                See how our platform gives freelancers and clients a fairer, faster experience.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <th className="py-4 px-4">Feature</th>
                    <th className="py-4 px-4 bg-[#1e3a5f] text-white rounded-t-xl text-center">
                      WinkGetJob
                    </th>
                    <th className="py-4 px-4 text-center">Traditional Agency</th>
                    <th className="py-4 px-4 text-center">Global Portals</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm">
                  {comparisons.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-100/60 transition-colors">
                      <td className="py-4 px-4 font-semibold text-gray-800">{row.feature}</td>
                      <td className="py-4 px-4 bg-[#1e3a5f]/5 text-center font-bold text-[#1e3a5f]">
                        {row.winkget}
                      </td>
                      <td className="py-4 px-4 text-center text-gray-500">{row.agency}</td>
                      <td className="py-4 px-4 text-center text-gray-500">{row.global}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Leadership & Core Team */}
        <section className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Meet the Leadership</h2>
            <p className="text-gray-500 text-sm">
              The passionate minds committed to reinventing independent work in India.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div
                    className={`w-16 h-16 rounded-2xl ${member.avatarBg} font-bold text-xl flex items-center justify-center mb-5 shadow-md`}
                  >
                    {member.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">{member.name}</h3>
                  <div className="text-xs font-semibold text-[#1e3a5f] mb-3">{member.role}</div>
                  <p className="text-xs text-gray-500 leading-relaxed mb-4">{member.bio}</p>
                </div>
                <div className="border-t border-gray-100 pt-4 flex flex-wrap gap-1.5">
                  {member.skills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="bg-gray-100 text-gray-600 text-[10px] font-semibold px-2.5 py-0.5 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="max-w-6xl mx-auto px-6">
          <div className="bg-gradient-to-r from-[#1e3a5f] via-[#152a45] to-slate-900 rounded-3xl p-10 sm:p-14 text-white text-center shadow-xl relative overflow-hidden">
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">
                Ready to Join India's Most Trusted Freelance Ecosystem?
              </h2>
              <p className="text-white/80 text-sm sm:text-base leading-relaxed">
                Whether you are looking to hire top-tier developers and designers or build a high-earning freelance career, WinkGetJob is built for you.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <Link
                  href="/register?role=jobseeker"
                  className="bg-[#d4a017] hover:bg-[#c29213] text-[#1e3a5f] font-bold px-8 py-3.5 rounded-xl transition-all shadow-md text-sm"
                >
                  Join as Freelancer
                </Link>
                <Link
                  href="/register?role=employer"
                  className="bg-white hover:bg-gray-100 text-[#1e3a5f] font-bold px-8 py-3.5 rounded-xl transition-all shadow-md text-sm"
                >
                  Post a Project
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
