"use client";

import { Shield, Zap, Users, Headphones, CheckCircle2, ArrowRight, Lock, Sparkles } from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Shield,
    iconBg: "bg-indigo-50 text-indigo-600",
    title: "100% Escrow Protection",
    description:
      "Funds are held securely in escrow and only released when the deliverables meet your expectations.",
  },
  {
    icon: Zap,
    iconBg: "bg-emerald-50 text-emerald-600",
    title: "Instant Matching",
    description:
      "Our AI algorithms match your project requirements with the most relevant and competent talent within minutes.",
  },
  {
    icon: Users,
    iconBg: "bg-amber-50 text-amber-600",
    title: "Highly Screened Talent",
    description:
      "Every freelancer goes through identity verification and technical screening before joining our platform.",
  },
  {
    icon: Headphones,
    iconBg: "bg-rose-50 text-rose-500",
    title: "Dedicated Human Support",
    description:
      "Get round-the-clock assistance from our real support team for any queries or issue resolution.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-14 sm:py-20 bg-[#faf8f5] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* LEFT: Intro block */}
          <div className="lg:col-span-5 space-y-6">
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200/60 text-amber-700 text-xs font-bold uppercase tracking-wider shadow-2xs">
              <Sparkles size={14} className="text-amber-600" />
              <span>Why WinkGetJob</span>
            </div>

            {/* Title */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0f172a] leading-[1.14] tracking-tight">
              A brand new era of secure{" "}
              <span className="relative inline-block text-[#d97706]">
                freelancing
                <svg
                  className="absolute -bottom-1.5 left-0 w-full"
                  height="8"
                  viewBox="0 0 160 8"
                  fill="none"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3 5C45 2 115 2 157 5"
                    stroke="#eab308"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h2>

            {/* Description */}
            <p className="text-slate-500 text-sm sm:text-base font-medium leading-relaxed">
              We did away with the old freelancing models. No hidden commissions, no endless waiting for matching talent, and no uncertainty with payments.
            </p>

            {/* Checkmark Bullets */}
            <div className="space-y-3.5 pt-2">
              {[
                "Zero commission taken from freelancers",
                "Robust automated milestone tracking",
                "Instant payouts upon client validation",
                "24/7 dedicated human support",
              ].map((bullet) => (
                <div key={bullet} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={16} />
                  </div>
                  <span className="text-slate-700 text-sm font-semibold">{bullet}</span>
                </div>
              ))}
            </div>

            {/* Link */}
            <div className="pt-2">
              <Link href="/register?role=jobseeker">
                <button className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer">
                  <span>Learn more about security terms</span>
                  <ArrowRight size={16} />
                </button>
              </Link>
            </div>
          </div>

          {/* RIGHT: 2x2 Feature Cards Grid */}
          <div className="lg:col-span-7 grid sm:grid-cols-2 gap-5">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-white border border-slate-200/70 rounded-3xl p-6 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.03)] hover:shadow-xl hover:border-slate-300 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
                >
                  <div className={`w-12 h-12 rounded-2xl ${feature.iconBg} flex items-center justify-center mb-5 shrink-0`}>
                    <Icon size={22} className="shrink-0" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base sm:text-lg mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-slate-500 text-xs sm:text-sm font-normal leading-relaxed">
                      {feature.description}
                    </p>
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