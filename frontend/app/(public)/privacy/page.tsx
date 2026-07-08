"use client";

import { Shield } from "lucide-react";

export default function PrivacyPage() {
  return (
    <main
      className="bg-white min-h-screen py-16"
      style={{ fontFamily: "var(--font-poppins), sans-serif" }}
    >
      {/* Privacy Hero */}
      <section className="relative overflow-hidden mb-16 py-12">
        <div className="absolute inset-0 bg-gradient-to-br from-[#edf2f7] to-[#f8fafc] opacity-60 -z-10" />
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-1.5 bg-[#edf2f7] text-[#1e3a5f] rounded-full px-4 py-1.5 text-xs font-semibold mb-6">
            <Shield size={12} className="text-[#1e3a5f]" />
            <span>Your privacy is important to us</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 leading-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-400">Last updated: July 5, 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-3xl mx-auto px-6 mb-12">
        <div className="prose prose-green max-w-none text-gray-600 space-y-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Information We Collect</h2>
            <p className="leading-relaxed">
              We collect information you provide directly to us when creating a profile, applying to jobs, or communicating with other users. This includes your name, email address, phone number, location, skill sets, resume details, and payment/payout information.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. How We Use Your Information</h2>
            <p className="leading-relaxed">
              We use the collected data to verify identities, match freelancers with employers, facilitate communication, process transactions through our secure escrow environment, and send account-related alerts.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Escrow & Secure Transactions</h2>
            <p className="leading-relaxed">
              To keep transactions secure, payments are stored in an escrow mechanism. Financial credentials are encrypted and processed by PCI-compliant payment gateways. We never store raw credit card numbers or banking secrets on our servers.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Cookies & Trackers</h2>
            <p className="leading-relaxed">
              We use cookies to maintain your login session active, store layout preferences, and gather anonymous visitor interaction metrics. Please check our Cookie Policy for more detailed information.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Your Data Rights</h2>
            <p className="leading-relaxed">
              You retain the right to edit or delete your account information at any time. You can also request an export of the private data WinkGetJob holds about you by raising a request to our support desk.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
