import { SignInForm } from "@/components/auth/SignInForm";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sign In" };

const features = [
  "Access thousands of freelance jobs across India",
  "Secure payments with milestones & escrow protection",
  "Track applications and contract states in real time",
  "Zero platform fee for independent freelancers",
];

export default function SignInPage() {
  return (
    <div className="min-h-screen flex bg-white" style={{ fontFamily: "var(--font-poppins), sans-serif" }}>
      {/* Left panel: Image background with overlay */}
      <div 
        className="hidden lg:flex lg:w-1/2 relative bg-cover bg-center flex-col justify-between p-12 text-white"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80')`
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
              Welcome back
            </span>
            <h1 className="text-4xl font-extrabold text-white mb-6 leading-tight max-w-md">
              Your professional freelance gateway
            </h1>
            <p className="text-gray-300 text-lg mb-8 max-w-md">
              Sign in to resume matching, working, and getting paid securely.
            </p>
            <ul className="space-y-4 max-w-md">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-[#d4a017] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-200">{f}</span>
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
        {/* Top-right register redirect link — desktop only */}
        <div className="hidden sm:block absolute top-6 right-8 text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-[#1e3a5f] hover:text-[#d4a017] font-semibold transition-colors ml-1">
            Register
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
            Sign In
          </h2>
          <p className="text-sm text-gray-500 mb-8">
            Access your secure dashboard to manage tasks and contracts.
          </p>

          <SignInForm />
        </div>
      </div>
    </div>
  );
}
