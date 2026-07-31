"use client";

import { useState } from "react";
import { Plus, Minus, HelpCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

const faqs = [
  {
    question: "How does the zero platform fee model work?",
    answer:
      "Unlike traditional platforms that deduct 10% to 20% from your earnings, WinkGetJob charges 0% commission to freelancers. Employers can post jobs and hire talent seamlessly.",
  },
  {
    question: "Is my payment safe under the escrow system?",
    answer:
      "Yes, 100%. Funds for each project or milestone are deposited into escrow before work begins. Payments are released to the freelancer only after client approval.",
  },
  {
    question: "What is the difference between a Job and a Task?",
    answer:
      "Jobs are milestone-based or hourly contracts for long-term projects. Tasks are quick micro-gigs with set instructions that freelancers can complete and get paid for quickly.",
  },
  {
    question: "How do I get started as a freelancer?",
    answer:
      "Simply create your account, complete your profile verification, list your skills, and start applying to open jobs or claiming instant tasks.",
  },
  {
    question: "Can I cancel a project and get a refund?",
    answer:
      "If a project is cancelled before work commences or due to non-delivery, the escrow funds can be refunded following our transparent dispute resolution process.",
  },
];

export function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggleFAQ = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-14 sm:py-20 bg-[#faf8f5] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-start">
          
          {/* LEFT: Section Header & Contact Support Button */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-semibold tracking-wider uppercase mb-2">
                <HelpCircle size={14} />
                <span>FAQ CENTER</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0f172a] tracking-tight mb-2">
                Frequently Asked Questions
              </h2>
              <p className="text-slate-500 text-sm sm:text-base font-medium">
                Quick answers to the most common questions.
              </p>
            </div>

            <Link href="/register?role=jobseeker">
              <button className="px-5 py-2.5 rounded-full border border-slate-200/90 bg-white text-slate-700 hover:text-slate-900 hover:border-slate-300 font-semibold text-xs sm:text-sm inline-flex items-center gap-2 shadow-2xs hover:shadow-xs transition-all cursor-pointer">
                <span>Still have questions?</span>
                <span className="text-indigo-600 font-bold">Contact support</span>
                <ArrowRight size={15} className="text-indigo-600" />
              </button>
            </Link>
          </div>

          {/* RIGHT: Clean Accordion Stack */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/70 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.03)] divide-y divide-slate-100 overflow-hidden">
            {faqs.map((faq, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div key={idx} className="transition-colors">
                  <button
                    onClick={() => toggleFAQ(idx)}
                    className="w-full flex items-center justify-between p-5 sm:p-6 text-left focus:outline-none hover:bg-slate-50/50 transition-colors"
                  >
                    <span className="font-semibold text-slate-800 text-sm sm:text-base pr-4 leading-snug">
                      {faq.question}
                    </span>
                    <div className="w-7 h-7 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center shrink-0 border border-slate-200/60">
                      {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 pt-0 text-slate-500 text-xs sm:text-sm font-normal leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
