"use client";

import { Info } from "lucide-react";

export default function CookiesPage() {
  return (
    <main
      className="bg-white min-h-screen py-16"
      style={{ fontFamily: "var(--font-poppins), sans-serif" }}
    >
      {/* Cookies Hero */}
      <section className="relative overflow-hidden mb-16 py-12">
        <div className="absolute inset-0 bg-gradient-to-br from-[#edf2f7] to-[#f8fafc] opacity-60 -z-10" />
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-1.5 bg-[#edf2f7] text-[#1e3a5f] rounded-full px-4 py-1.5 text-xs font-semibold mb-6">
            <Info size={12} className="text-[#1e3a5f]" />
            <span>Understanding cookie tracking parameters</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 leading-tight">
            Cookie Policy
          </h1>
          <p className="text-sm text-gray-400">Last updated: July 5, 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-3xl mx-auto px-6 mb-12">
        <div className="prose prose-green max-w-none text-gray-600 space-y-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. What are Cookies?</h2>
            <p className="leading-relaxed">
              Cookies are small text documents stored on your local browser folder when visiting websites. They help remember logins, preferences, and optimize overall speed.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Essential Cookies</h2>
            <p className="leading-relaxed">
              These cookies are strictly required to let you navigate the site, authenticate your profile sessions safely, and process secure payments. Without these, the application cannot operate properly.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Performance & Analytical Cookies</h2>
            <p className="leading-relaxed">
              Analytical tracking elements collect anonymous insights on page clicks, errors, and load duration. This aggregate information is solely used to debug issues and improve UX responsiveness.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Customizing Cookie Prefs</h2>
            <p className="leading-relaxed">
              You can block or purge cookies through your browser options dashboard. However, blocking essential cookies will interrupt active logins and profile state features.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
