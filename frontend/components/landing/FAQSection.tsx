"use client";

import { useState } from "react";
import { Plus, Minus, HelpCircle, MessageSquare, ArrowRight } from "lucide-react";
import Link from "next/link";

const faqs = [
  {
    question: "How does the zero platform fee model work?",
    answer: "Unlike other platforms that charge 10% to 20% on every payment, WinkGetJob charges ₹0 to freelancers. Employers can post jobs and hire standard talent for free, allowing both parties to keep 100% of the agreed rates.",
  },
  {
    question: "Is my payment safe under the escrow system?",
    answer: "Yes, absolutely. Once a contract is initiated, the client funds the project milestone escrow. These funds are securely held by our platform and are only released to the freelancer after the client reviews and approves the completed work.",
  },
  {
    question: "How are dispute resolutions handled?",
    answer: "In the rare event of a disagreement, either party can initiate a dispute review. Our dedicated support team reviews the milestone agreements, messages, and uploaded deliverables to reach a fair resolution according to our terms.",
  },
  {
    question: "What is the difference between a Job and a Task?",
    answer: "Jobs are standard contracts (hourly or project-based milestones) usually requiring manual screening and hiring. Tasks are quick, micro-jobs with predefined instructions that freelancers can claim and submit immediately for rapid payouts.",
  },
];

export function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggleFAQ = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section
      id="faq"
      className="py-10 bg-[#fafbfc] relative overflow-hidden border-t border-slate-100"
      style={{ fontFamily: "var(--font-poppins), sans-serif" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT: Static Help Card */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-8 text-left">
            <div className="inline-flex items-center gap-1.5 bg-[#edf2f7] text-[#1e3a5f] rounded-full px-4 py-1 text-xs font-bold uppercase tracking-wider">
              <HelpCircle size={13} />
              <span>FAQ Center</span>
            </div>
            <h2 className="text-3.5xl sm:text-4xl font-extrabold text-[#0f172a] leading-tight tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed font-medium">
              Everything you need to know about payment protection, hiring, and working on WinkGetJob.
            </p>

            <div className="bg-[#1e3a5f] text-white rounded-3xl p-6 shadow-xl shadow-slate-900/10 relative overflow-hidden">
              <div className="absolute top-[-10%] right-[-10%] w-24 h-24 bg-[#d4a017]/20 rounded-full blur-[25px]" />
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                <MessageSquare size={18} className="text-[#d4a017]" />
              </div>
              <h4 className="font-bold text-base mb-1">Still have questions?</h4>
              <p className="text-xs text-slate-300 leading-relaxed mb-5">
                Can&apos;t find the answer you are looking for? Send us a message and our support team will help you out.
              </p>
              <Link href="/register?role=jobseeker">
                <button className="flex items-center gap-1.5 bg-white text-[#1e3a5f] hover:bg-[#edf2f7] px-5 py-2.5 rounded-xl text-xs font-extrabold transition-colors cursor-pointer shadow-sm">
                  <span>Contact Support</span>
                  <ArrowRight size={13} />
                </button>
              </Link>
            </div>
          </div>
 
          {/* RIGHT: Accordion */}
          <div className="lg:col-span-7 space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div
                  key={idx}
                  className={`border rounded-2xl transition-all duration-300 ${
                    isOpen
                      ? "border-slate-300 bg-white shadow-md shadow-slate-100/50"
                      : "border-slate-200/80 hover:border-slate-300 bg-white"
                  }`}
                >
                  <button
                    onClick={() => toggleFAQ(idx)}
                    className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
                  >
                    <span className="font-extrabold text-slate-800 text-sm sm:text-base pr-4 leading-snug">
                      {faq.question}
                    </span>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                        isOpen
                          ? "bg-[#1e3a5f] text-white"
                          : "bg-slate-50 text-slate-400 border border-slate-200"
                      }`}
                    >
                      {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                    </div>
                  </button>
 
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      isOpen ? "max-h-[300px] border-t border-slate-100" : "max-h-0"
                    }`}
                  >
                    <p className="p-5 text-slate-500 text-xs sm:text-sm leading-relaxed font-semibold">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
