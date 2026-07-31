"use client";

import { UserPlus, FileText, MessageSquare, ShieldCheck, Wallet, Zap } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Create Profile",
    description: "Join as a freelancer or employer and set up your profile in minutes.",
    icon: UserPlus,
    bg: "bg-emerald-50",
    textColor: "text-emerald-600",
  },
  {
    number: "02",
    title: "Post or Discover",
    description: "Employers post jobs or projects. Freelancers discover opportunities that match their skills.",
    icon: FileText,
    bg: "bg-amber-50",
    textColor: "text-amber-600",
  },
  {
    number: "03",
    title: "Connect & Discuss",
    description: "Communicate, discuss requirements, timelines and budget to align expectations.",
    icon: MessageSquare,
    bg: "bg-indigo-50",
    textColor: "text-indigo-600",
  },
  {
    number: "04",
    title: "Work Securely",
    description: "Escrow protects payments. Work, track progress and submit deliverables with complete peace of mind.",
    icon: ShieldCheck,
    bg: "bg-emerald-50",
    textColor: "text-emerald-600",
  },
  {
    number: "05",
    title: "Complete & Get Paid",
    description: "Once the work is approved, payments are released securely. Build trust and grow together.",
    icon: Wallet,
    bg: "bg-amber-50",
    textColor: "text-amber-600",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-14 sm:py-20 bg-[#faf8f5] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Section Header */}
        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center gap-1.5 text-amber-600 font-semibold text-xs tracking-wider uppercase mb-1.5">
            <Zap size={14} className="fill-amber-600" />
            <span>HOW IT WORKS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0f172a] tracking-tight mb-2">
            How WinkGetJob works
          </h2>
          <p className="text-slate-500 text-sm sm:text-base font-medium">
            A simple, secure and transparent process designed for modern professionals and businesses.
          </p>
        </div>

        {/* 5 Step Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="bg-white border border-slate-200/70 rounded-3xl p-5 sm:p-6 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.03)] hover:shadow-xl hover:border-slate-300 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[220px]"
              >
                {/* Top Row: Icon + Number Badge */}
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-12 h-12 rounded-2xl ${step.bg} flex items-center justify-center shrink-0`}>
                    <Icon size={22} className={step.textColor} />
                  </div>
                  <span className={`w-7 h-7 rounded-full ${step.bg} ${step.textColor} text-xs font-bold flex items-center justify-center`}>
                    {step.number}
                  </span>
                </div>

                {/* Content */}
                <div>
                  <h3 className="font-bold text-slate-900 text-base sm:text-lg mb-2 leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-slate-500 text-xs font-normal leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
