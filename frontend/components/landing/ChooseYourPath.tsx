"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Users,
  UserPlus,
  Briefcase,
  Send,
  ShieldCheck,
  Building2,
  FileText,
  Eye,
  UserCheck,
  ArrowRight,
} from "lucide-react";

export function ChooseYourPath() {
  return (
    <section className="pt-4 sm:pt-6 pb-4 sm:pb-6 bg-[#faf8f5] relative overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200/60 text-amber-700 text-xs font-bold uppercase tracking-wider mb-3 shadow-2xs">
            <Users size={14} />
            <span>Choose Your Path</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight mb-2">
            Find your place on WinkGetJob
          </h2>

          <p className="text-slate-500 text-sm sm:text-base font-medium leading-relaxed max-w-xl mx-auto">
            Whether you&apos;re looking for your next opportunity or the right
            talent for your team, WinkGetJob is built for you.
          </p>
        </div>

        {/* 2 Path Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          
          {/* CARD 1: FOR FREELANCERS */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300">
            <div>
              {/* Top Row: Icon + Text + Avatar Image */}
              <div className="flex items-center justify-between gap-2.5 sm:gap-4 mb-4">
                {/* Icon on Left */}
                <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0 shadow-inner">
                  <UserPlus size={22} className="sm:w-6 sm:h-6" />
                </div>

                {/* Text Block in Middle */}
                <div className="flex-1 min-w-0 pr-1">
                  <span className="inline-block px-2 sm:px-2.5 py-0.5 rounded-md bg-emerald-100/70 text-emerald-800 font-extrabold text-[9px] sm:text-[11px] tracking-wider uppercase mb-1 whitespace-nowrap">
                    FOR FREELANCERS
                  </span>
                  <h3 className="text-lg sm:text-2xl lg:text-3xl font-bold text-slate-900 leading-tight">
                    <span className="whitespace-nowrap">Register as</span>{" "}
                    <span className="font-extrabold text-emerald-700 whitespace-nowrap block sm:inline">
                      Freelancer
                    </span>
                  </h3>
                </div>

                {/* Avatar Image */}
                <div className="shrink-0 relative w-28 h-36 sm:w-48 sm:h-52 lg:w-52 lg:h-52 -my-2">
                  <Image
                    src="/boybg.png"
                    alt="Register as Freelancer"
                    fill
                    sizes="(max-width: 640px) 112px, 208px"
                    className="object-contain drop-shadow-md"
                    priority
                  />
                </div>
              </div>

              {/* Compact Steps Bar */}
              <div className="bg-slate-50/70 rounded-2xl p-3 sm:p-4 border border-slate-100 shadow-2xs mb-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1.5">
                      <UserPlus size={15} />
                    </div>
                    <span className="text-[10px] sm:text-xs font-medium text-slate-700 leading-tight">
                      Create Profile
                    </span>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1.5">
                      <Briefcase size={15} />
                    </div>
                    <span className="text-[10px] sm:text-xs font-medium text-slate-700 leading-tight">
                      Find Jobs &amp; Projects
                    </span>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1.5">
                      <Send size={15} />
                    </div>
                    <span className="text-[10px] sm:text-xs font-medium text-slate-700 leading-tight">
                      Send Proposals
                    </span>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1.5">
                      <ShieldCheck size={15} />
                    </div>
                    <span className="text-[10px] sm:text-xs font-medium text-slate-700 leading-tight">
                      Get Paid Securely
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div>
              <Link href="/register?role=jobseeker" className="block mb-3">
                <button className="w-full py-3.5 px-5 rounded-2xl bg-[#047857] hover:bg-[#065f46] text-[#ffffff] font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-900/10 hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer">
                  <span>Register as Freelancer</span>
                  <ArrowRight size={16} />
                </button>
              </Link>

              <p className="text-center text-xs text-slate-500 font-medium">
                Already have an account?{" "}
                <Link
                  href="/sign-in"
                  className="text-emerald-700 font-bold hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          {/* CARD 2: FOR EMPLOYERS */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300">
            <div>
              {/* Top Row: Icon + Text + Avatar Image */}
              <div className="flex items-center justify-between gap-2.5 sm:gap-4 mb-4">
                {/* Icon on Left */}
                <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-amber-100/80 text-amber-700 flex items-center justify-center shrink-0 shadow-inner">
                  <Building2 size={22} className="sm:w-6 sm:h-6" />
                </div>

                {/* Text Block in Middle */}
                <div className="flex-1 min-w-0 pr-1">
                  <span className="inline-block px-2 sm:px-2.5 py-0.5 rounded-md bg-amber-100/70 text-amber-800 font-extrabold text-[9px] sm:text-[11px] tracking-wider uppercase mb-1 whitespace-nowrap">
                    FOR EMPLOYERS
                  </span>
                  <h3 className="text-lg sm:text-2xl lg:text-3xl font-bold text-slate-900 leading-tight">
                    <span className="whitespace-nowrap">Register as</span>{" "}
                    <span className="font-extrabold text-[#d97706] whitespace-nowrap block sm:inline">
                      Employer
                    </span>
                  </h3>
                </div>

                {/* Avatar Image */}
                <div className="shrink-0 relative w-28 h-36 sm:w-48 sm:h-52 lg:w-52 lg:h-52 -my-2">
                  <Image
                    src="/girlbg.png"
                    alt="Register as Employer"
                    fill
                    sizes="(max-width: 640px) 112px, 208px"
                    className="object-contain drop-shadow-md"
                    priority
                  />
                </div>
              </div>

              {/* Compact Steps Bar */}
              <div className="bg-slate-50/70 rounded-2xl p-3 sm:p-4 border border-slate-100 shadow-2xs mb-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-1.5">
                      <Building2 size={15} />
                    </div>
                    <span className="text-[10px] sm:text-xs font-medium text-slate-700 leading-tight">
                      Create Company Profile
                    </span>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-1.5">
                      <FileText size={15} />
                    </div>
                    <span className="text-[10px] sm:text-xs font-medium text-slate-700 leading-tight">
                      Post Jobs &amp; Projects
                    </span>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-1.5">
                      <Eye size={15} />
                    </div>
                    <span className="text-[10px] sm:text-xs font-medium text-slate-700 leading-tight">
                      Review Proposals
                    </span>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-1.5">
                      <UserCheck size={15} />
                    </div>
                    <span className="text-[10px] sm:text-xs font-medium text-slate-700 leading-tight">
                      Hire with Confidence
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div>
              <Link href="/register?role=employer" className="block mb-3">
                <button className="w-full py-3.5 px-5 rounded-2xl bg-[#d97706] hover:bg-[#b45309] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-900/10 hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer">
                  <span>Register as Employer</span>
                  <ArrowRight size={16} />
                </button>
              </Link>

              <p className="text-center text-xs text-slate-500 font-medium">
                Already have an account?{" "}
                <Link
                  href="/sign-in"
                  className="text-amber-700 font-bold hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
