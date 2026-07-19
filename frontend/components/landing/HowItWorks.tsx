"use client";

import { useState } from "react";
import { UserPlus, Search, CreditCard, Sparkles, CheckCircle2, ChevronRight } from "lucide-react";

const steps = [
  {
    id: 1,
    number: "01",
    icon: UserPlus,
    title: "Configure Professional Profile",
    subtitle: "Complete verification in 2 minutes",
    description:
      "Join as a business or a freelancer. Populate your skills inventory, showcase past works, and state hourly rates.",
    visual: (
      <div className="w-full bg-[#f8fafc] border border-slate-200/80 rounded-2xl p-5 text-left relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#d4a017]/10 rounded-full blur-[20px]" />
        <div className="flex gap-4 items-center mb-5">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#1e3a5f] to-[#2c5282] text-white flex items-center justify-center font-bold text-sm shadow-sm">
            PS
          </div>
          <div>
            <h4 className="font-extrabold text-slate-800 text-sm">Priya Sharma</h4>
            <p className="text-[10px] font-semibold text-slate-400">UI/UX Designer • Pune</p>
          </div>
        </div>
        <div className="space-y-2 mb-4">
          <div className="h-2 bg-slate-200 rounded w-full" />
          <div className="h-2 bg-slate-200 rounded w-5/6" />
          <div className="h-2 bg-slate-200 rounded w-2/3" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {["Figma", "Webflow", "Prototyping"].map(t => (
            <span key={t} className="text-[9px] font-extrabold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
              {t}
            </span>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 2,
    number: "02",
    icon: Search,
    title: "Post & Shortlist Candidates",
    subtitle: "Match instantly with premium talent",
    description:
      "Clients publish assignments with fixed-price or hourly budgets. Freelancers craft detailed proposals indicating completion timelines.",
    visual: (
      <div className="w-full bg-[#f8fafc] border border-slate-200/80 rounded-2xl p-5 text-left space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100/50 px-2 py-0.5 rounded">
            Incoming Proposals (4)
          </span>
          <span className="text-[10px] font-bold text-slate-400">2m ago</span>
        </div>
        {[
          { name: "Amit K.", rate: "₹1,800/hr", match: "98% Match" },
          { name: "Sneha R.", rate: "₹2,200/hr", match: "95% Match" },
        ].map((prop, i) => (
          <div key={i} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
            <div className="min-w-0">
              <p className="font-bold text-slate-800 text-xs">{prop.name}</p>
              <p className="text-[9px] font-semibold text-slate-400">{prop.rate}</p>
            </div>
            <span className="text-[9px] font-extrabold text-[#1e3a5f] bg-[#1e3a5f]/5 px-2 py-0.5 rounded-md">
              {prop.match}
            </span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 3,
    number: "03",
    icon: CreditCard,
    title: "Milestone Escrow & Release",
    subtitle: "Absolute safety for both parties",
    description:
      "Initiate work contracts and fund the current milestone. Verify submitted files and trigger instant payouts securely.",
    visual: (
      <div className="w-full bg-white border border-slate-200/80 rounded-2xl p-5 text-left space-y-5 shadow-sm relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-24 h-24 bg-emerald-500/10 rounded-full blur-[20px]" />
        <div>
          <h4 className="font-extrabold text-slate-800 text-sm mb-1">Milestone Escrow Status</h4>
          <p className="text-[10px] font-semibold text-slate-400">Project: Landing Page Redesign</p>
        </div>
        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Milestone Fund</p>
            <p className="text-xl font-black text-[#1e3a5f]">₹15,000</p>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Protected
          </span>
        </div>
        <button className="w-full bg-[#1e3a5f] hover:bg-[#12243d] text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow-sm">
          Release Payments
        </button>
      </div>
    ),
  },
];

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(1);

  return (
    <section
      id="how-it-works"
      className="py-10 bg-white relative overflow-hidden"
      style={{ fontFamily: "var(--font-poppins), sans-serif" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header section */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1 bg-[#fdf8e8] text-[#d4a017] border border-amber-100 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles size={12} className="fill-amber-500/10" />
            <span>Operational Flow</span>
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] mb-3 tracking-tight">
            How WinkGetJob works
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto text-sm sm:text-base font-medium">
            A simplified, secured, and zero-fee operational cycle designed for modern businesses.
          </p>
        </div>

        {/* Dynamic split view */}
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* LEFT: interactive steps selectors */}
          <div className="lg:col-span-6 space-y-4">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = activeStep === step.id;
              return (
                <div
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  onMouseEnter={() => setActiveStep(step.id)}
                  className={`group text-left p-5 sm:p-6 rounded-3xl cursor-pointer border transition-all duration-300 ${
                    isActive
                      ? "bg-slate-50 border-slate-200/80 shadow-md shadow-slate-100/50"
                      : "bg-white border-transparent hover:border-slate-100 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex gap-4 items-start">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                        isActive
                          ? "bg-[#1e3a5f] text-white shadow-sm"
                          : "bg-slate-50 border border-slate-100 text-slate-400 group-hover:text-slate-700"
                      }`}
                    >
                      <Icon size={18} />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-[#d4a017] tracking-wider uppercase">
                          Step {step.number}
                        </span>
                        <ChevronRight
                          size={12}
                          className={`text-slate-400 transition-transform duration-300 ${
                            isActive ? "rotate-90 text-[#1e3a5f]" : "group-hover:translate-x-0.5"
                          }`}
                        />
                      </div>
                      <h3 className="font-extrabold text-slate-800 text-sm sm:text-base leading-tight">
                        {step.title}
                      </h3>
                      <p className="text-slate-400 text-[11px] sm:text-xs font-semibold leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT: Visual Mockup container */}
          <div className="lg:col-span-6 flex justify-center items-center">
            <div className="w-full max-w-sm bg-gradient-to-br from-[#1e3a5f] via-[#2c5282] to-[#12233a] rounded-[2.5rem] p-6 shadow-2xl shadow-slate-900/15 relative overflow-hidden min-h-[360px] flex items-center justify-center">
              
              {/* Outer decorative elements */}
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-[#d4a017]/10 rounded-full blur-[40px]" />
              <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-emerald-500/10 rounded-full blur-[55px]" />
              
              {/* Glassmorphic card back */}
              <div className="absolute inset-4 bg-white/[0.03] backdrop-blur-2xl rounded-[1.75rem] border border-white/[0.05] pointer-events-none" />

              {/* Dynamic content wrapper */}
              <div className="w-full relative z-10 scale-95 md:scale-100 transition-all duration-500 ease-out transform">
                {steps.find((s) => s.id === activeStep)?.visual}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
