"use client";

import { useState } from "react";
import {
  FileText,
  ShieldCheck,
  CreditCard,
  Building2,
  Lock,
  UserCheck,
  AlertTriangle,
  Scale,
  HelpCircle,
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState("section-1");

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const sections = [
    { id: "section-1", title: "1. Agreement & Operating Entity" },
    { id: "section-2", title: "2. Definitions & Key Terminology" },
    { id: "section-3", title: "3. Account Registration & Eligibility" },
    { id: "section-4", title: "4. Platform Services & User Roles" },
    { id: "section-5", title: "5. Pricing, Fees & Payment Gateway Terms" },
    { id: "section-6", title: "6. Escrow Payment System & Release" },
    { id: "section-7", title: "7. Cancellation & Refund Policy Summary" },
    { id: "section-8", title: "8. User Conduct & Fair Safety Rules" },
    { id: "section-9", title: "9. Intellectual Property Rights" },
    { id: "section-10", title: "10. Dispute Resolution & Arbitration" },
    { id: "section-11", title: "11. Limitation of Liability & Disclaimers" },
    { id: "section-12", title: "12. Account Termination & Suspension" },
    { id: "section-13", title: "13. Governing Law & Contact Details" },
  ];

  return (
    <main
      className="bg-[#f8fafc] min-h-screen pb-24"
      style={{ fontFamily: "var(--font-poppins), sans-serif" }}
    >
      {/* Hero Header */}
      <section className="relative bg-[#0f172a] text-white py-16 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d4a017_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#1e293b] text-[#d4a017] border border-[#334155] rounded-full px-4 py-1.5 text-xs font-medium mb-6 shadow-sm">
            <ShieldCheck size={14} className="text-[#d4a017]" />
            <span>Verified Payment Gateway Legal Compliance</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 text-white">
            Terms of Service & Rules
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed mb-6">
            Please review these binding Terms of Service carefully before utilizing the WinkGetJob platform, escrow services, or payment features.
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Sparkles size={12} className="text-[#d4a017]" /> Effective Date: July 5, 2026
            </span>
            <span>•</span>
            <span>Version: 2.4 (Payment Gateway Compliant)</span>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sticky Sidebar Navigation */}
          <aside className="hidden lg:block lg:col-span-4 xl:col-span-3">
            <div className="sticky top-24 bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">
                Table of Contents
              </h3>
              <nav className="space-y-1">
                {sections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => scrollToSection(sec.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-between ${
                      activeSection === sec.id
                        ? "bg-[#1e3a5f] text-white font-semibold shadow-xs"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <span className="truncate">{sec.title}</span>
                    {activeSection === sec.id && <ChevronRight size={12} className="text-[#d4a017]" />}
                  </button>
                ))}
              </nav>

              <div className="mt-6 pt-4 border-t border-gray-100 bg-[#f8fafc] rounded-xl p-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-800 mb-1">
                  <Building2 size={14} className="text-[#1e3a5f]" />
                  <span>Merchant Support</span>
                </div>
                <p className="text-[11px] text-gray-500 mb-2">
                  Need legal assistance or billing queries?
                </p>
                <a
                  href="mailto:winkgetexpress@gmail.com"
                  className="text-xs font-medium text-[#1e3a5f] hover:underline flex items-center gap-1"
                >
                  winkgetexpress@gmail.com
                </a>
              </div>
            </div>
          </aside>

          {/* Content Body */}
          <section className="lg:col-span-8 xl:col-span-9 bg-white rounded-2xl border border-gray-200 p-6 sm:p-10 shadow-xs space-y-12">
            
            {/* Entity Banner */}
            <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#166534] text-white flex items-center justify-center font-bold flex-shrink-0">
                  <Building2 size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#14532d]">Registered Business Entity</h4>
                  <p className="text-xs text-[#166534] leading-relaxed">
                    WinkGetJob operates under <strong>WinkGet / WinkGet Express</strong>. Operating addresses located in New Delhi & Uttar Pradesh, India.
                  </p>
                </div>
              </div>
              <span className="bg-[#dcfce7] text-[#15803d] text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap">
                Official Merchant Terms
              </span>
            </div>

            {/* Section 1 */}
            <div id="section-1" className="scroll-mt-28 space-y-4">
              <div className="flex items-center gap-2 text-[#1e3a5f]">
                <FileText size={20} />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  1. Agreement & Operating Entity
                </h2>
              </div>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Welcome to <strong>WinkGetJob</strong> (&quot;Platform&quot;, &quot;We&quot;, &quot;Us&quot;, or &quot;Our&quot;), an online job search marketplace and freelance matching platform operated under <strong>WinkGet / WinkGet Express</strong>.
              </p>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                By registering, browsing, posting a job listing, submitting a freelance project proposal, or initiating any financial payment transaction through our platform, you (&quot;User&quot;, &quot;Employer&quot;, or &quot;Jobseeker/Freelancer&quot;) explicitly agree to be bound by these Terms of Service, our Privacy Policy, and our Refund & Cancellation Policy. If you do not agree to these terms, you must immediately cease accessing or using our platform.
              </p>
            </div>

            {/* Section 2 */}
            <div id="section-2" className="scroll-mt-28 space-y-4 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-[#1e3a5f]">
                <Scale size={20} />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  2. Definitions & Key Terminology
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="bg-[#f8fafc] p-4 rounded-xl border border-gray-200">
                  <span className="font-bold text-gray-900 block mb-1">Employer / Client:</span>
                  <span className="text-gray-600">Any individual or business entity registered to post job opportunities, contract freelancers, or hire talent through WinkGetJob.</span>
                </div>
                <div className="bg-[#f8fafc] p-4 rounded-xl border border-gray-200">
                  <span className="font-bold text-gray-900 block mb-1">Jobseeker / Freelancer:</span>
                  <span className="text-gray-600">Any individual registered to apply for job vacancies, complete task assignments, or deliver freelance services.</span>
                </div>
                <div className="bg-[#f8fafc] p-4 rounded-xl border border-gray-200">
                  <span className="font-bold text-gray-900 block mb-1">Escrow System:</span>
                  <span className="text-gray-600">Our secure financial transaction environment where funds deposited by Employers are safely held until milestone tasks are verified.</span>
                </div>
                <div className="bg-[#f8fafc] p-4 rounded-xl border border-gray-200">
                  <span className="font-bold text-gray-900 block mb-1">Payment Gateway:</span>
                  <span className="text-gray-600">Third-party PCI-DSS compliant financial institutions (e.g., Razorpay, Paytm, Cashfree, Stripe) handling electronic fund routing.</span>
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div id="section-3" className="scroll-mt-28 space-y-4 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-[#1e3a5f]">
                <UserCheck size={20} />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  3. Account Registration & Eligibility
                </h2>
              </div>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                To access features such as posting jobs, accepting bids, or receiving payouts, users must complete profile registration.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-[#1e3a5f] mt-0.5 flex-shrink-0" />
                  <span><strong>Age Requirement:</strong> You must be at least 18 years of age or possess legal corporate authority to form a binding contract under Indian law.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-[#1e3a5f] mt-0.5 flex-shrink-0" />
                  <span><strong>Accurate Information:</strong> Users agree to provide true, current, and complete contact, identity, and payment routing credentials.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-[#1e3a5f] mt-0.5 flex-shrink-0" />
                  <span><strong>Account Security:</strong> You are strictly responsible for preserving password secrecy. WinkGetJob is not liable for unauthorized account access resulting from user negligence.</span>
                </li>
              </ul>
            </div>

            {/* Section 4 */}
            <div id="section-4" className="scroll-mt-28 space-y-4 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-[#1e3a5f]">
                <Building2 size={20} />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  4. Platform Services & User Roles
                </h2>
              </div>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                WinkGetJob operates as a neutral digital marketplace bridging Employers and Jobseekers across India. We facilitate job listings, application processing, worker verification, task management, and secure payout routing. We do not directly act as an employer, partner, or employment agency for any posted listing unless explicitly stated.
              </p>
            </div>

            {/* Section 5 - Payment Gateway Compliance */}
            <div id="section-5" className="scroll-mt-28 space-y-4 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-[#1e3a5f]">
                <CreditCard size={20} />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  5. Pricing, Fees & Payment Gateway Terms
                </h2>
              </div>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                WinkGetJob maintains clear and transparent pricing structures for job postings, premium listings, subscriptions, and escrow transactions.
              </p>

              <div className="bg-[#edf2f7] p-5 rounded-xl border border-[#cbd5e1] space-y-3">
                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Lock size={16} className="text-[#1e3a5f]" />
                  Secure Payment Gateway Processing
                </h4>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                  All online payment transactions (including Credit/Debit Cards, Net Banking, UPI, and Digital Wallets) are processed through RBI-authorized, PCI-DSS Level 1 compliant payment gateway partners (such as Razorpay, Paytm, Cashfree, or Stripe). WinkGetJob <strong>never stores sensitive card numbers, CVVs, or online banking passwords</strong> on our servers.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs font-semibold text-[#1e3a5f]">
                  <span className="bg-white px-3 py-1.5 rounded-lg border text-center">UPI Payouts</span>
                  <span className="bg-white px-3 py-1.5 rounded-lg border text-center">Credit / Debit Cards</span>
                  <span className="bg-[#1e3a5f] text-white px-3 py-1.5 rounded-lg text-center">Net Banking</span>
                  <span className="bg-white px-3 py-1.5 rounded-lg border text-center">Escrow Wallet</span>
                </div>
              </div>

              <ul className="space-y-2 text-sm text-gray-600 pt-2">
                <li>• <strong>Currency:</strong> All payments are denominated and charged in <strong>Indian Rupees (INR ₹)</strong> unless explicitly stated otherwise.</li>
                <li>• <strong>Taxes:</strong> Applicable Goods and Services Tax (GST) will be calculated and added to invoice totals during checkout where required by Indian statutory laws.</li>
                <li>• <strong>Platform Fees:</strong> Standard job listings currently feature promotional ₹0 posting fees. Any optional featured promotion or service fee will be transparently itemized prior to payment authorization.</li>
              </ul>
            </div>

            {/* Section 6 - Escrow System */}
            <div id="section-6" className="scroll-mt-28 space-y-4 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-[#1e3a5f]">
                <Lock size={20} />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  6. Escrow Payment System & Release Guidelines
                </h2>
              </div>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                To guarantee financial safety for both Employers and Freelancers, micro-tasks and project agreements utilize our secure Escrow System:
              </p>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="p-3 bg-[#f8fafc] border-l-4 border-[#1e3a5f] rounded-r-lg">
                  <strong>1. Escrow Funding:</strong> When an Employer approves a freelance project proposal, agreed project funds are locked into our secure escrow holding account via our payment gateway.
                </div>
                <div className="p-3 bg-[#f8fafc] border-l-4 border-[#d4a017] rounded-r-lg">
                  <strong>2. Work Submission & Review:</strong> Upon task completion, the freelancer submits work updates. Employers have a 7-day review window to inspect and request revisions or approve work.
                </div>
                <div className="p-3 bg-[#f8fafc] border-l-4 border-green-600 rounded-r-lg">
                  <strong>3. Fund Payout:</strong> Upon explicit Employer approval (or automatic system approval after the 7-day review period without dispute), escrowed funds are released directly to the Freelancer&apos;s verified bank account or UPI address.
                </div>
              </div>
            </div>

            {/* Section 7 - Refund Summary */}
            <div id="section-7" className="scroll-mt-28 space-y-4 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-[#1e3a5f]">
                <AlertTriangle size={20} />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  7. Cancellation & Refund Policy Summary
                </h2>
              </div>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                We maintain a transparent and fair refund structure in compliance with Indian consumer protection standards. For complete details, please visit our dedicated <a href="/refund-policy" className="text-[#1e3a5f] font-semibold underline">Refund & Cancellation Policy</a>.
              </p>
              <div className="bg-[#fef2f2] border border-[#fecaca] rounded-xl p-4 text-xs sm:text-sm text-[#991b1b]">
                <strong>Key Refund Highlight:</strong> Approved refunds for cancelled escrow agreements or failed technical transactions are credited back to the buyer&apos;s original payment method (Bank Account / Card / UPI) within <strong>5 to 7 working days</strong>.
              </div>
            </div>

            {/* Section 8 - Code of Conduct */}
            <div id="section-8" className="scroll-mt-28 space-y-4 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-[#1e3a5f]">
                <ShieldCheck size={20} />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  8. User Conduct & Fair Safety Rules
                </h2>
              </div>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                To preserve platform integrity, users agree strictly NOT to:
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-gray-700">
                <li className="flex items-center gap-2 bg-[#f8fafc] p-3 rounded-lg border">
                  <span className="text-red-500 font-bold">✕</span> Solicit off-platform payments to circumvent escrow safety.
                </li>
                <li className="flex items-center gap-2 bg-[#f8fafc] p-3 rounded-lg border">
                  <span className="text-red-500 font-bold">✕</span> Post misleading, discriminatory, or illegal job openings.
                </li>
                <li className="flex items-center gap-2 bg-[#f8fafc] p-3 rounded-lg border">
                  <span className="text-red-500 font-bold">✕</span> Upload harmful computer code, viruses, or spam links.
                </li>
                <li className="flex items-center gap-2 bg-[#f8fafc] p-3 rounded-lg border">
                  <span className="text-red-500 font-bold">✕</span> Impersonate other persons, brands, or corporate entities.
                </li>
              </ul>
            </div>

            {/* Section 9 */}
            <div id="section-9" className="scroll-mt-28 space-y-4 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-[#1e3a5f]">
                <FileText size={20} />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  9. Intellectual Property Rights
                </h2>
              </div>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                All platform software, graphics, branding, and text are protected by Indian trademark and copyright laws. Deliverables produced by freelancers during paid milestone projects automatically transfer ownership to the Employer upon full release of escrow funds.
              </p>
            </div>

            {/* Section 10 */}
            <div id="section-10" className="scroll-mt-28 space-y-4 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-[#1e3a5f]">
                <Scale size={20} />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  10. Dispute Resolution & Escrow Arbitration
                </h2>
              </div>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                In the event of a quality or delivery dispute between an Employer and Freelancer, either party may request WinkGetJob Dispute Support within 7 days of work submission. Our compliance team will review submitted work files, chat logs, and project specifications to issue a final administrative escrow allocation.
              </p>
            </div>

            {/* Section 11 */}
            <div id="section-11" className="scroll-mt-28 space-y-4 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-[#1e3a5f]">
                <AlertTriangle size={20} />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  11. Limitation of Liability & Disclaimers
                </h2>
              </div>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                WinkGetJob provides platform access on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. We are not liable for indirect, incidental, or consequential damages resulting from lost profits, network downtime, or third-party user conduct. Our maximum aggregated liability for any claim shall not exceed the total fees received by us from the user in the preceding 6 months.
              </p>
            </div>

            {/* Section 12 */}
            <div id="section-12" className="scroll-mt-28 space-y-4 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-[#1e3a5f]">
                <HelpCircle size={20} />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  12. Account Termination & Suspension
                </h2>
              </div>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                We reserve the right to suspend or terminate accounts that breach safety guidelines, engage in payment fraud, or initiate unverified chargebacks. Pending undisputed escrow funds will be disbursed according to our dispute guidelines.
              </p>
            </div>

            {/* Section 13 */}
            <div id="section-13" className="scroll-mt-28 space-y-6 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-[#1e3a5f]">
                <Building2 size={20} />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  13. Governing Law & Official Contact Details
                </h2>
              </div>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                These Terms shall be governed by and construed under the laws of the Republic of India. Any legal disputes arising hereunder shall be subject to the exclusive jurisdiction of the courts in New Delhi / Gorakhpur, Uttar Pradesh.
              </p>

              {/* Nodal Officer Box */}
              <div className="bg-[#f8fafc] border border-gray-200 rounded-2xl p-6 space-y-4">
                <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-[#1e3a5f]" />
                  Merchant Nodal & Grievance Contact
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-gray-600">
                  <div>
                    <span className="font-semibold text-gray-900 block">Business Entity Name:</span>
                    <span>WinkGet / WinkGet Express</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 block">Support & Legal Email:</span>
                    <a href="mailto:winkgetexpress@gmail.com" className="text-[#1e3a5f] hover:underline font-medium">winkgetexpress@gmail.com</a>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 block">Helpline Phone:</span>
                    <a href="tel:+918175981920" className="text-[#1e3a5f] hover:underline font-medium">+91 8175981920</a>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 block">Head Office:</span>
                    <span>806, Aggarwal Corporate Heights, NSP, Pitampura, New Delhi, India</span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-semibold text-gray-900 block">Branch Office:</span>
                    <span>6A Swastik Trade Center, Gandhi Gali, Gorakhpur, UP 273001, India</span>
                  </div>
                </div>
              </div>
            </div>

          </section>
        </div>
      </div>
    </main>
  );
}
