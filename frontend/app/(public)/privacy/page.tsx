"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Lock,
  Database,
  Eye,
  UserCheck,
  CreditCard,
  FileCheck,
  Server,
  HelpCircle,
  Building2,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  AlertCircle,
} from "lucide-react";

export default function PrivacyPage() {
  const [activeSection, setActiveSection] = useState("section-1");

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const sections = [
    { id: "section-1", title: "1. Scope & Privacy Commitment" },
    { id: "section-2", title: "2. Information We Collect" },
    { id: "section-[#3]", title: "3. Payment Gateway & Financial Data" },
    { id: "section-4", title: "4. Purpose of Data Utilization" },
    { id: "section-5", title: "5. Data Sharing & Third-Party Disclosure" },
    { id: "section-6", title: "6. Data Security & PCI-DSS Standards" },
    { id: "section-7", title: "7. User Rights & Consent Controls" },
    { id: "section-8", title: "8. Cookies & Tracking Technologies" },
    { id: "section-9", title: "9. Data Retention & Erasure Policy" },
    { id: "section-10", title: "10. Children's Data Protection" },
    { id: "section-11", title: "11. Grievance Redressal Officer" },
  ];

  return (
    <main
      className="bg-[#f8fafc] min-h-screen pb-24"
      style={{ fontFamily: "var(--font-poppins), sans-serif" }}
    >
      {/* Hero Header */}
      <section className="relative bg-[#0f172a] text-white py-16 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#1e293b] text-emerald-400 border border-[#334155] rounded-full px-4 py-1.5 text-xs font-medium mb-6 shadow-sm">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>DPDP Act 2023 & PCI-DSS Gateway Compliant</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 text-white">
            Privacy Policy & Data Security
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed mb-6">
            Discover how WinkGetJob protects your personal identity, payment routing credentials, and privacy rights across our platform.
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Sparkles size={12} className="text-emerald-400" /> Effective Date: July 5, 2026
            </span>
            <span>•</span>
            <span>Version: 3.1 (India Privacy Standard)</span>
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
                Privacy Topics
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
                    {activeSection === sec.id && <ChevronRight size={12} className="text-emerald-400" />}
                  </button>
                ))}
              </nav>

              <div className="mt-6 pt-4 border-t border-gray-100 bg-[#f8fafc] rounded-xl p-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-800 mb-1">
                  <Lock size={14} className="text-emerald-600" />
                  <span>Data Protection Support</span>
                </div>
                <p className="text-[11px] text-gray-500 mb-2">
                  Have data access or privacy questions?
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
            
            {/* Regulatory Shield Banner */}
            <div className="bg-[#ecfdf5] border border-[#a7f3d0] rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#047857] text-white flex items-center justify-center font-bold flex-shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#065f46]">Compliant with Indian Data Laws</h4>
                  <p className="text-xs text-[#047857] leading-relaxed">
                    Designed in accordance with the <strong>Digital Personal Data Protection (DPDP) Act 2023</strong> and <strong>Information Technology Act 2000</strong>.
                  </p>
                </div>
              </div>
              <span className="bg-[#d1fae5] text-[#065f46] text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap">
                256-Bit SSL Encrypted
              </span>
            </div>

            {/* Section 1 */}
            <div id="section-1" className="scroll-mt-28 space-y-4">
              <div className="flex items-center gap-2 text-[#1e3a5f]">
                <Eye size={20} />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  1. Scope & Privacy Commitment
                </h2>
              </div>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                At <strong>WinkGetJob</strong> (operated under <strong>WinkGet / WinkGet Express</strong>), we recognize the critical importance of keeping your personal information, professional credentials, and financial transaction records secure and confidential.
              </p>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                This Privacy Policy describes how we collect, store, process, transfer, and protect your information when you visit our portal, register as an Employer or Jobseeker/Freelancer, process payments, or utilize our escrow services.
              </p>
            </div>

            {/* Section 2 */}
            <div id="section-2" className="scroll-mt-28 space-y-4 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-[#1e3a5f]">
                <Database size={20} />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  2. Information We Collect
                </h2>
              </div>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                We collect information directly provided by you, as well as metadata generated during platform interactions:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="bg-[#f8fafc] p-4 rounded-xl border border-gray-200">
                  <span className="font-bold text-gray-900 block mb-1">Identity & Profile Data:</span>
                  <span className="text-gray-600">Full name, email address, mobile phone number, location, profile photo, resume, skill portfolios, educational qualifications, and work history.</span>
                </div>
                <div className="bg-[#f8fafc] p-4 rounded-xl border border-gray-200">
                  <span className="font-bold text-gray-900 block mb-1">Employer Business Information:</span>
                  <span className="text-gray-600">Company name, corporate email address, business location, GSTIN (if applicable), billing details, and job opening descriptions.</span>
                </div>
                <div className="bg-[#f8fafc] p-4 rounded-xl border border-gray-200">
                  <span className="font-bold text-gray-900 block mb-1">Payout Account Details:</span>
                  <span className="text-gray-600">Bank account numbers, IFSC codes, and UPI IDs provided by Freelancers to receive earned milestone escrow disbursements.</span>
                </div>
                <div className="bg-[#f8fafc] p-4 rounded-xl border border-gray-200">
                  <span className="font-bold text-gray-900 block mb-1">Technical & Usage Logs:</span>
                  <span className="text-gray-600">IP address, browser type, operating system, device identifiers, session timestamps, and navigation paths.</span>
                </div>
              </div>
            </div>

            {/* Section 3 - Crucial Payment Gateway Security Clause */}
            <div id="section-[#3]" className="scroll-mt-28 space-y-4 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-[#1e3a5f]">
                <CreditCard size={20} />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  3. Payment Gateway & Financial Data Security
                </h2>
              </div>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                WinkGetJob integrates with authorized PCI-DSS Level 1 compliant payment gateways (including Razorpay, Paytm, Cashfree, and Stripe) to securely process card payments, UPI transfers, and net banking transactions.
              </p>

              <div className="bg-[#edf2f7] p-5 rounded-xl border border-[#cbd5e1] space-y-3">
                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Lock size={16} className="text-emerald-600" />
                  Zero Card Data Retention Policy
                </h4>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                  WinkGetJob <strong>does NOT capture, store, or process raw Credit/Debit Card numbers, CVV codes, or net banking passwords</strong> on our servers. All sensitive financial authorization occurs directly within the encrypted checkout interface provided by our payment gateway partners under TLS 1.3 256-bit encryption.
                </p>
                <div className="flex items-center gap-2 text-xs text-[#1e3a5f] font-semibold pt-1">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  <span>Only masked transaction reference IDs and payment status webhooks are retained for accounting.</span>
                </div>
              </div>
            </div>

            {/* Section 4 */}
            <div id="section-4" className="scroll-mt-28 space-y-4 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-[#1e3a5f]">
                <FileCheck size={20} />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  4. Purpose of Data Utilization
                </h2>
              </div>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                We process your personal information strictly for legitimate operational purposes:
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Service Execution:</strong> Matching jobseekers with appropriate job postings and allowing employers to review job applications.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Escrow Payout Settlement:</strong> Verifying milestone completion and initiating electronic fund transfers to freelancers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Account Alerts & Verification:</strong> Sending OTP notifications, job status changes, work update alerts, and security warnings.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Legal Compliance:</strong> Preventing payment fraud, complying with RBI guidelines, and fulfilling statutory tax obligations.</span>
                </li>
              </ul>
            </div>

            {/* Section 5 */}
            <div id="section-5" className="scroll-mt-28 space-y-4 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-[#1e3a5f]">
                <Server size={20} />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  5. Data Sharing & Third-Party Disclosure
                </h2>
              </div>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                We respect your privacy and <strong>NEVER sell or rent your personal data</strong> to third-party data brokers or advertisers. We only share information under necessary, limited circumstances:
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• <strong>Between Employers & Applicants:</strong> Profiles, resumes, and contact details submitted during job applications are accessible to the posting employer.</li>
                <li>• <strong>With Payment Gateways:</strong> Name, billing email, phone number, and transaction totals are shared with payment gateways to complete checkout.</li>
                <li>• <strong>Service Infrastructure:</strong> Secure cloud hosting, SMS delivery partners, and analytics tools bound by strict non-disclosure agreements.</li>
                <li>• <strong>Legal Mandates:</strong> Disclosure to Indian judicial authorities or law enforcement agencies when compelled by a valid statutory order or court summons.</li>
              </ul>
            </div>

            {/* Section 6 */}
            <div id="section-6" className="scroll-mt-28 space-y-4 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-[#1e3a5f]">
                <ShieldCheck size={20} />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  6. Data Security & Encryption Standards
                </h2>
              </div>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                We implement robust technical and organizational measures to safeguard user data:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-700">
                <div className="bg-[#f8fafc] p-3 rounded-lg border text-center font-semibold">
                  SSL / TLS 256-Bit Encryption in Transit
                </div>
                <div className="bg-[#f8fafc] p-3 rounded-lg border text-center font-semibold">
                  Encrypted Database Storage at Rest
                </div>
                <div className="bg-[#f8fafc] p-3 rounded-lg border text-center font-semibold">
                  Role-Based Admin Access Controls
                </div>
              </div>
            </div>

            {/* Section 7 */}
            <div id="section-7" className="scroll-mt-28 space-y-4 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-[#1e3a5f]">
                <UserCheck size={20} />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  7. User Data Rights & Consent Controls
                </h2>
              </div>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                In compliance with the DPDP Act 2023, users possess full rights regarding their personal data:
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• <strong>Right to Access & Export:</strong> Request a copy of your stored account data and application history.</li>
                <li>• <strong>Right to Rectification:</strong> Edit or update inaccurate profile details at any time from your account settings.</li>
                <li>• <strong>Right to Erasure (Right to be Forgotten):</strong> Request profile deletion, subject to retention of completed escrow transaction logs required for tax compliance.</li>
              </ul>
            </div>

            {/* Section 8 */}
            <div id="section-8" className="scroll-mt-28 space-y-4 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-[#1e3a5f]">
                <Database size={20} />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  8. Cookies & Tracking Technologies
                </h2>
              </div>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                We use essential cookies to maintain logged-in user sessions, preserve security tokens, and analyze aggregate visitor traffic. For complete information, please check our <a href="/cookies" className="text-[#1e3a5f] font-semibold underline">Cookie Policy</a>.
              </p>
            </div>

            {/* Section 9 */}
            <div id="section-9" className="scroll-mt-28 space-y-4 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-[#1e3a5f]">
                <Server size={20} />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  9. Data Retention & Erasure Policy
                </h2>
              </div>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Personal profile data is retained as long as your account remains active. Upon profile deactivation, personal data is purged within 30 days, except financial invoices and escrow payout logs which are stored for 7 years to satisfy Indian Goods and Services Tax (GST) audit mandates.
              </p>
            </div>

            {/* Section 10 */}
            <div id="section-10" className="scroll-mt-28 space-y-4 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-[#1e3a5f]">
                <HelpCircle size={20} />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  10. Children&apos;s Data Protection
                </h2>
              </div>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Our platform is intended strictly for individuals aged 18 and older. We do not knowingly solicit or collect personal information from minors.
              </p>
            </div>

            {/* Section 11 - Grievance Redressal Officer (Mandatory for PG Approval) */}
            <div id="section-11" className="scroll-mt-28 space-y-6 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-[#1e3a5f]">
                <Building2 size={20} />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  11. Grievance Redressal Officer & Contact Info
                </h2>
              </div>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                In accordance with the Information Technology Act 2000 and DPDP Act 2023, the details of the designated Nodal Grievance Officer for WinkGetJob are provided below:
              </p>

              {/* Grievance Box */}
              <div className="bg-[#f8fafc] border border-gray-200 rounded-2xl p-6 space-y-4">
                <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-emerald-600" />
                  Nodal Privacy & Grievance Cell
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-gray-600">
                  <div>
                    <span className="font-semibold text-gray-900 block">Operating Business Entity:</span>
                    <span>WinkGet / WinkGet Express</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 block">Privacy Email:</span>
                    <a href="mailto:winkgetexpress@gmail.com" className="text-[#1e3a5f] hover:underline font-medium">winkgetexpress@gmail.com</a>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 block">Support Phone:</span>
                    <a href="tel:+918175981920" className="text-[#1e3a5f] hover:underline font-medium">+91 8175981920</a>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 block">Grievance SLA:</span>
                    <span>Acknowledgment within 24 hours; resolution within 15 days</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 block">Head Office:</span>
                    <span>806, Aggarwal Corporate Heights, NSP, Pitampura, New Delhi, India</span>
                  </div>
                  <div>
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
