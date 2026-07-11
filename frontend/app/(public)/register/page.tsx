import { RegisterForm } from "@/components/auth/RegisterForm";
import { CheckCircle2, Star, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { UserRole } from "@/types";

export const metadata: Metadata = { title: "Create Account | WinkGetJob" };

const perks = [
  "Free registration with no monthly subscription fees",
  "Connect with verified enterprise & high-paying clients",
  "Milestone payments secured via escrow safety protection",
  "Collaborate seamlessly with direct messaging & boards",
];

interface RegisterPageProps {
  searchParams: Promise<{ role?: string }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const role = (params.role === "employer" ? "employer" : "jobseeker") as UserRole;

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-[#f8fafc] overflow-hidden" style={{ fontFamily: "var(--font-poppins), sans-serif" }}>
      {/* Back to home button (Desktop only) */}
      <Link 
        href="/" 
        className="hidden lg:flex absolute top-4 left-4 z-20 items-center gap-2 px-3 py-1.5 text-[11px] font-semibold text-white bg-white/10 border border-white/10 hover:bg-white/20 hover:text-white rounded-full shadow-sm transition-all group"
      >
        <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-0.5" />
        Back to Home
      </Link>

      {/* Left panel: Premium Branding & Testimonials (50% Width) - Hidden on Mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0f172a] flex-col justify-between p-6 sm:p-8 lg:p-10 text-white overflow-hidden lg:h-full">
        {/* Dynamic Gradient Blobs */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#2c5282]/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-[#d4a017]/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 left-1/3 w-80 h-80 bg-[#1e3a5f]/40 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header / Logo */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white tracking-tight">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-md">
              <span className="text-[#1e3a5f] font-black text-base">W</span>
            </div>
            <span>
              Wink<span className="text-[#d4a017]">Get</span>Job
            </span>
          </Link>
        </div>

        {/* Center content: Messaging & Perks */}
        <div className="relative z-10 my-auto py-4 lg:py-0 max-w-xl">
          <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#d4a017] bg-[#d4a017]/10 border border-[#d4a017]/20 rounded-full mb-2 inline-block">
            Get Started
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-3 leading-tight">
            Build the Future of Freelancing.
          </h1>
          <p className="text-gray-300 text-xs sm:text-sm mb-5 leading-relaxed">
            Join thousands of skilled professionals and businesses working together transparently with protected payments.
          </p>

          <ul className="space-y-2 mb-5">
            {perks.map((p) => (
              <li key={p} className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-[#d4a017] flex-shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-gray-250 font-medium">{p}</span>
              </li>
            ))}
          </ul>

          {/* Testimonial Glass Card */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3.5 shadow-lg relative">
            <div className="flex items-center gap-1 text-[#d4a017] mb-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={12} fill="currentColor" />
              ))}
            </div>
            <p className="text-[11px] text-gray-250 italic leading-relaxed mb-2.5">
              "Finding pre-screened freelancers in India used to take weeks. With WinkGetJob, we hire developers and fund secure milestone contracts on the same day."
            </p>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#1e3a5f] to-[#d4a017] flex items-center justify-center font-bold text-[9px]">
                RK
              </div>
              <div>
                <h4 className="text-[11px] font-semibold text-white">Riya Kapoor</h4>
                <p className="text-[8px] text-gray-400">CTO, InnovateTech Solutions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer inside Left Panel */}
        <div className="relative z-10 flex flex-wrap justify-between gap-4 border-t border-white/10 pt-3 mt-3">
          <p className="text-gray-400 text-[10px]">
            © {new Date().getFullYear()} WinkGetJob. All rights reserved.
          </p>
          <div className="flex gap-3 text-[10px] text-gray-400">
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          </div>
        </div>
      </div>

      {/* Right panel: Centered Register Form (50% Width on Desktop, 100% on Mobile) */}
      <div className="w-full lg:w-1/2 h-full overflow-y-auto bg-[#f8fafc]">
        <div className="min-h-full flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 p-5 sm:p-7 shadow-md relative overflow-hidden">
            {/* Logo on mobile view only */}
            <div className="flex justify-center mb-5 lg:hidden">
              <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900 tracking-tight">
                <div className="w-8 h-8 bg-[#1e3a5f] rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-white font-black text-base">W</span>
                </div>
                <span>
                  Wink<span className="text-[#d4a017]">Get</span>Job
                </span>
              </Link>
            </div>

            {/* Subtle design element */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#1e3a5f]/5 rounded-bl-full pointer-events-none" />

            {/* Form Header */}
            <div className="mb-4">
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                Create Account
              </h2>
              <p className="text-[11px] text-gray-555 mt-0.5">
                Sign up in less than 2 minutes to start applying for jobs or hiring professionals.
              </p>
            </div>

            <RegisterForm defaultRole={role} />
          </div>
        </div>
      </div>
    </div>
  );
}
