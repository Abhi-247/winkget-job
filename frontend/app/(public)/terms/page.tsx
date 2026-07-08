"use client";

import { FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <main
      className="bg-white min-h-screen py-16"
      style={{ fontFamily: "var(--font-poppins), sans-serif" }}
    >
      {/* Terms Hero */}
      <section className="relative overflow-hidden mb-16 py-12">
        <div className="absolute inset-0 bg-gradient-to-br from-[#edf2f7] to-[#f8fafc] opacity-60 -z-10" />
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-1.5 bg-[#edf2f7] text-[#1e3a5f] rounded-full px-4 py-1.5 text-xs font-semibold mb-6">
            <FileText size={12} className="text-[#1e3a5f]" />
            <span>Please read these terms carefully</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 leading-tight">
            Terms of Service
          </h1>
          <p className="text-sm text-gray-400">Last updated: July 5, 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-3xl mx-auto px-6 mb-12">
        <div className="prose prose-green max-w-none text-gray-600 space-y-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Agreement to Terms</h2>
            <p className="leading-relaxed">
              By accessing or using WinkGetJob, you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not utilize our platform or services.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. User Account Registration</h2>
            <p className="leading-relaxed">
              Users must provide accurate, current, and complete details during the registration flow. You are entirely responsible for protecting your password credentials and account activity.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Platform Fees & Escrow Payments</h2>
            <p className="leading-relaxed">
              We currently offer a ₹0 platform fee for standard jobs. All freelancer bookings are initiated using secure escrow payments. Funds are released automatically only after work is delivered and approved by the employer.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Rules of Engagement</h2>
            <p className="leading-relaxed">
              Any attempt to bypass the platform's escrow system to escape safety protocols, post deceptive job opportunities, or distribute malicious files is strictly forbidden and will result in immediate profile suspension.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Disclaimer & Limitation of Liability</h2>
            <p className="leading-relaxed">
              WinkGetJob operates as a marketplace platform connecting independent parties. We do not guarantee the performance of any client or freelancer and are not liable for disagreements or project delivery lapses.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
