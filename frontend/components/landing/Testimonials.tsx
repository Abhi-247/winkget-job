"use client";

import { Quote, Star, CheckCircle } from "lucide-react";

const testimonials = [
  {
    quote: "Finding high-quality freelance React developers in India used to take weeks. With WinkGetJob, we connected with an expert and kicked off the project within 48 hours. The escrow system gives us complete peace of mind.",
    author: "Siddharth Sen",
    role: "CTO, OmniScale Systems",
    rating: 5,
    avatarInitials: "SS",
    avatarBg: "bg-[#1e3a5f]",
  },
  {
    quote: "As a freelancer, payment security is always my top concern. The zero-percent platform fee and escrow protection on WinkGetJob are game-changers. I got paid immediately after my milestones were approved.",
    author: "Priya Sharma",
    role: "Independent UI/UX Designer",
    rating: 5,
    avatarInitials: "PS",
    avatarBg: "bg-[#d4a017]",
  },
  {
    quote: "We hired a backend database developer to scale our core APIs. The profile matching and applicant dashboard made shortlisting and interviewing incredibly smooth. Highly recommend it to any startup.",
    author: "Aditya Roy",
    role: "Co-Founder, PayZest",
    rating: 5,
    avatarInitials: "AR",
    avatarBg: "bg-gray-800",
  },
];

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="py-20 bg-[#f8fafc]"
      style={{ fontFamily: "var(--font-poppins), sans-serif" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-1.5 bg-[#fdf8e8] text-[#d4a017] px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-3">
            ★ Success Stories
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight mb-4">
            Trusted by Creators and Startups
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Hear from businesses and freelance professionals who have transformed the way they work together.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between"
            >
              <div className="absolute top-6 right-6 text-gray-200">
                <Quote size={40} className="fill-current" />
              </div>

              <div>
                {/* Rating stars */}
                <div className="flex items-center gap-1 mb-5">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={16} className="fill-[#d4a017] text-[#d4a017]" />
                  ))}
                </div>

                <p className="text-gray-600 italic text-base leading-relaxed mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-3 border-t border-gray-100 pt-5 mt-4">
                <div className={`w-11 h-11 rounded-full ${t.avatarBg} text-white flex items-center justify-center font-bold text-sm`}>
                  {t.avatarInitials}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-gray-900 text-sm">{t.author}</span>
                    <CheckCircle size={14} className="text-[#1e3a5f] fill-[#1e3a5f]/10" />
                  </div>
                  <span className="text-xs text-gray-400 font-semibold">{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
