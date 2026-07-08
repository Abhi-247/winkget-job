"use client";

import { useState } from "react";
import { Plus, Minus, HelpCircle } from "lucide-react";

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
      className="py-20 bg-white"
      style={{ fontFamily: "var(--font-poppins), sans-serif" }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-1.5 bg-[#fdf8e8] text-[#d4a017] px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-3">
            <HelpCircle size={12} />
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight mb-4">
            Have Questions? We Have Answers
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Everything you need to know about payment protection, hiring, and working on WinkGetJob.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className={`border rounded-2xl transition-all duration-300 ${
                  isOpen
                    ? "border-[#1e3a5f] bg-[#edf2f7]/30 shadow-sm"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <button
                  onClick={() => toggleFAQ(idx)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                >
                  <span className="font-bold text-gray-900 text-base sm:text-lg pr-4">
                    {faq.question}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isOpen
                        ? "bg-[#1e3a5f] text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                  </div>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? "max-h-48 border-t border-gray-100" : "max-h-0"
                  }`}
                >
                  <p className="p-6 text-gray-600 text-base leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
