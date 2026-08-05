"use client";

import { useState } from "react";
import {
  RotateCcw,
  ShieldCheck,
  CreditCard,
  Building2,
  Clock,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  HelpCircle,
  FileText,
} from "lucide-react";

export default function RefundPolicyPage() {
  const [activeSection, setActiveSection] = useState("section-1");

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const sections = [
    { id: "section-1", title: "1. Policy Overview & Scope" },
    { id: "section-2", title: "2. Escrow Payment Refund Triggers" },
    { id: "section-3", title: "3. Job Posting & Subscription Cancellations" },
    { id: "section-4", title: "4. Refund Settlement Timelines (5-7 Days)" },
    { id: "section-5", title: "5. How to Raise a Refund Request" },
    { id: "section-6", title: "6. Disputes & Chargeback Protocol" },
    { id: "section-7", title: "7. Merchant Contact Details" },
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
            <RotateCcw size={14} className="text-[#d4a017]" />
            <span>5-7 Business Days Refund Settlement Guarantee</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 text-white">
            Refund & Cancellation Policy
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed mb-6">
            Clear, transparent, and fair guidelines governing milestone escrow cancellations, refund eligibility, and payment gateway settlements.
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Sparkles size={12} className="text-[#d4a017]" /> Effective Date: July 5, 2026
            </span>
            <span>•</span>
            <span>Payment Gateway Onboarding Compliant</span>
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
                Policy Navigation
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
                  <RotateCcw size={14} className="text-[#1e3a5f]" />
                  <span>Refund Desk</span>
                </div>
                <p className="text-[11px] text-gray-500 mb-2">
                  Need help with an active refund?
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
            
            {/* Timeline Guarantee Banner */}
            <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#166534] text-white flex items-center justify-center font-bold flex-shrink-0">
                  <Clock size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#14532d]">Standard Banking Refund SLA</h4>
                  <p className="text-xs text-[#166534] leading-relaxed">
                    Approved refunds are processed back to the original source mode within <strong>5 to 7 working days</strong>.
                  </p>
                </div>
              </div>
              <span className="bg-[#dcfce7] text-[#15803d] text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap">
                Direct Back to Source Mode
              </span>
            </div>

            {/* Section 1 */}
            <div id="section-1" className="scroll-mt-28 space-y-4">
              <div className="flex items-center gap-2 text-[#1e3a5f]">
                <FileText size={20} />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  1. Policy Overview & Scope
                </h2>
              </div>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                This Refund & Cancellation Policy governs financial transactions, escrow fund deposits, job posting fees, and refund requests made through <strong>WinkGetJob</strong> (operated under <strong>WinkGet / WinkGet Express</strong>).
              </p>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Our primary goal is to ensure absolute transparency, consumer fairness, and financial protection for both Employers and Freelancers across India.
              </p>
            </div>

            {/* Section 2 - Escrow Refund Conditions */}
            <div id="section-2" className="scroll-mt-28 space-y-4 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-[#1e3a5f]">
                <ShieldCheck size={20} />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  2. Escrow Payment Refund Triggers
                </h2>
              </div>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                When an Employer funds a milestone project, the money is securely locked in our Escrow System. Refunds are eligible under the following specific conditions:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="bg-[#f8fafc] p-4 rounded-xl border border-gray-200">
                  <span className="font-bold text-[#1e3a5f] block mb-1">100% Refund Before Work Begins:</span>
                  <span className="text-gray-600">If a project contract is cancelled by mutual agreement before the freelancer commences work or delivers milestones.</span>
                </div>
                <div className="bg-[#f8fafc] p-4 rounded-xl border border-gray-200">
                  <span className="font-bold text-[#1e3a5f] block mb-1">Non-Delivery by Freelancer:</span>
                  <span className="text-gray-600">If the hired freelancer fails to submit work updates within the agreed deadline without a valid extension.</span>
                </div>
                <div className="bg-[#f8fafc] p-4 rounded-xl border border-gray-200">
                  <span className="font-bold text-[#1e3a5f] block mb-1">Dispute Resolution Allocation:</span>
                  <span className="text-gray-600">If our arbitration team determines that submitted work does not meet agreed project requirements.</span>
                </div>
                <div className="bg-[#f8fafc] p-4 rounded-xl border border-gray-200">
                  <span className="font-bold text-[#1e3a5f] block mb-1">Duplicate / Glitch Payments:</span>
                  <span className="text-gray-600">100% refund for accidental double payment charges caused by payment gateway timeouts or network latency.</span>
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div id="section-3" className="scroll-mt-28 space-y-4 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-[#1e3a5f]">
                <Building2 size={20} />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  3. Job Posting & Premium Subscription Cancellations
                </h2>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-[#1e3a5f] mt-0.5 flex-shrink-0" />
                  <span><strong>Free Job Postings:</strong> Standard job posts currently feature ₹0 fees and carry no payment obligation.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-[#1e3a5f] mt-0.5 flex-shrink-0" />
                  <span><strong>Featured Promotions / Subscriptions:</strong> Optional featured job promotion fees are non-refundable once the promotion goes live and begins receiving candidate applications, except in cases of verified platform outages.</span>
                </li>
              </ul>
            </div>

            {/* Section 4 - Crucial Refund SLA Box */}
            <div id="section-4" className="scroll-mt-28 space-y-4 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-[#1e3a5f]">
                <CreditCard size={20} />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  4. Refund Settlement Timelines & Modes
                </h2>
              </div>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                All approved refunds are initiated through our payment gateway (Razorpay, Paytm, Cashfree, Stripe) back to the exact source payment method used during checkout:
              </p>

              <div className="bg-[#edf2f7] p-5 rounded-xl border border-[#cbd5e1] space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm text-gray-800">
                  <div className="bg-white p-3 rounded-lg border">
                    <strong className="block text-[#1e3a5f] mb-1">UPI & Net Banking</strong>
                    <span>Credited in 3 to 5 business days</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border">
                    <strong className="block text-[#1e3a5f] mb-1">Credit / Debit Cards</strong>
                    <span>Reflected in 5 to 7 business days</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border">
                    <strong className="block text-[#1e3a5f] mb-1">Digital Wallets</strong>
                    <span>Credited in 24 to 48 hours</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-700 font-medium">
                  <AlertCircle size={14} className="text-[#d4a017]" />
                  <span>Note: Actual credit reflection depends on banking clearance cycles of your card issuer or bank.</span>
                </div>
              </div>
            </div>

            {/* Section 5 */}
            <div id="section-5" className="scroll-mt-28 space-y-4 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-[#1e3a5f]">
                <HelpCircle size={20} />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  5. How to Raise a Refund Request
                </h2>
              </div>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                To request a refund, follow these simple steps:
              </p>
              <ol className="space-y-3 text-sm text-gray-600 list-decimal list-inside">
                <li>Go to your <strong>Employer / Jobseeker Dashboard</strong> and locate the specific project or transaction.</li>
                <li>Click <strong>Request Cancellation / Dispute</strong> and provide a brief explanation.</li>
                <li>Alternatively, send an email to <a href="mailto:winkgetexpress@gmail.com" className="text-[#1e3a5f] font-semibold underline">winkgetexpress@gmail.com</a> with your Payment Reference ID, registered email, and reason for refund.</li>
                <li>Our support team will review the request within <strong>24 to 48 hours</strong> and notify you of the approval status.</li>
              </ol>
            </div>

            {/* Section 6 */}
            <div id="section-6" className="scroll-mt-28 space-y-4 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-[#1e3a5f]">
                <RotateCcw size={20} />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  6. Disputes & Chargeback Protocol
                </h2>
              </div>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                We strongly encourage users to contact our resolution team before filing a chargeback with their bank. Unverified chargebacks on legitimate completed projects will result in temporary profile restriction pending inquiry.
              </p>
            </div>

            {/* Section 7 */}
            <div id="section-7" className="scroll-mt-28 space-y-6 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-[#1e3a5f]">
                <Building2 size={20} />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  7. Merchant Contact Details
                </h2>
              </div>
              
              <div className="bg-[#f8fafc] border border-gray-200 rounded-2xl p-6 space-y-4">
                <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-[#1e3a5f]" />
                  Billing & Refund Desk
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-gray-600">
                  <div>
                    <span className="font-semibold text-gray-900 block">Entity Name:</span>
                    <span>WinkGet / WinkGet Express</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 block">Refund Email:</span>
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
                </div>
              </div>
            </div>

          </section>
        </div>
      </div>
    </main>
  );
}
