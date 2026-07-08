import { RegisterForm } from "@/components/auth/RegisterForm";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { UserRole } from "@/types";

export const metadata: Metadata = { title: "Create Account" };

const perks = [
  "Free registration with no membership fees",
  "Connect with high-paying Indian clients",
  "Milestone payments secured via escrow safety",
  "Collaborate easily via structured dashboard tools",
];

interface RegisterPageProps {
  searchParams: Promise<{ role?: string }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const role = (params.role === "employer" ? "employer" : "jobseeker") as UserRole;

  return (
    <div className="min-h-screen flex bg-white" style={{ fontFamily: "var(--font-poppins), sans-serif" }}>
      {/* Left panel: Image background with overlay */}
      <div 
        className="hidden lg:flex lg:w-1/2 relative bg-cover bg-center flex-col justify-between p-12 text-white"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80')`
        }}
      >
        {/* Dark Navy brand overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a5f]/90 via-[#1e3a5f]/95 to-[#152a45]/98 z-0" />

        {/* Content wrapper */}
        <div className="relative z-10 flex flex-col justify-between h-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-[#1e3a5f] font-black text-sm">W</span>
            </div>
            <span>
              Wink<span className="text-[#d4a017]">Get</span>Job
            </span>
          </Link>

          {/* Core Info */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#d4a017] mb-3 inline-block">
              Get Started
            </span>
            <h1 className="text-4xl font-extrabold text-white mb-6 leading-tight max-w-md">
              Build the future of your freelance career
            </h1>
            <p className="text-gray-300 text-lg mb-8 max-w-md">
              Join thousands of skilled professionals and businesses working together transparently.
            </p>
            <ul className="space-y-4 max-w-md">
              {perks.map((p) => (
                <li key={p} className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-[#d4a017] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-200">{p}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer inside left panel */}
          <p className="text-gray-400 text-xs">
            © {new Date().getFullYear()} WinkGetJob. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right panel: Centered form */}
      <div className="flex-1 flex flex-col justify-center p-8 sm:p-12 lg:p-16 relative bg-white">
        {/* Top-right sign-in redirect link — desktop only */}
        <div className="hidden sm:block absolute top-6 right-8 text-sm text-gray-500">
          Already registered?{" "}
          <Link href="/sign-in" className="text-[#1e3a5f] hover:text-[#d4a017] font-semibold transition-colors ml-1">
            Sign In
          </Link>
        </div>

        {/* Form container */}
        <div className="max-w-md w-full mx-auto">
          {/* Mobile logo (visible on mobile only) */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl mb-8 lg:hidden"
          >
            <div className="w-8 h-8 bg-[#1e3a5f] rounded-lg flex items-center justify-center text-white font-black text-sm">
              W
            </div>
            <span>
              Wink<span className="text-[#d4a017]">Get</span>Job
            </span>
          </Link>

          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            Create Account
          </h2>
          <p className="text-sm text-gray-500 mb-8">
            Create your account in under 2 minutes to start applying or hiring.
          </p>

          <RegisterForm defaultRole={role} />
        </div>
      </div>
    </div>
  );
}
