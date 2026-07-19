"use client";

import { Users, Award, ShieldCheck, Heart, Sparkles } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <main
      className="bg-white min-h-screen"
      style={{ fontFamily: "var(--font-poppins), sans-serif" }}
    >
      {/* Hero Section */}
      <div className="bg-[#1e3a5f] text-white py-16 sm:py-20 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/5 rounded-full pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-white/5 rounded-full pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-5 text-white/70">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>›</span>
            <span className="text-white font-medium">About Us</span>
          </div>
          <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold mb-5">
            <Sparkles size={12} className="text-[#d4a017]" />
            <span>Empowering India's Independent Workforce</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-3">
            About Wink<span className="text-[#d4a017]">Get</span>Job
          </h1>
          <p className="text-white/70 text-sm mt-1.5 flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#d4a017]" />
            India's premier freelance network — bridging talent and businesses
          </p>
        </div>
      </div>

      <div className="py-16">

      {/* Mission & Vision */}
      <section className="max-w-5xl mx-auto px-6 mb-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="bg-gradient-to-br from-[#1e3a5f] to-[#152a45] text-white rounded-3xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="leading-relaxed text-blue-50 text-base">
              To empower professionals to build sustainable independent careers while enabling businesses of all sizes to scale dynamically by accessing top-tier vetted talent instantly.
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h2>
            <p className="leading-relaxed text-gray-600 text-base">
              To define the future of work in India by creating an ecosystem built on absolute trust, smart matching technology, secure escrow payments, and zero barrier entry for all.
            </p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="max-w-5xl mx-auto px-6 mb-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Our Core Values
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: ShieldCheck,
              title: "Absolute Security",
              desc: "From profile verification to secure escrow payments, safety is our foundation.",
              color: "bg-[#edf2f7] text-[#1e3a5f]",
            },
            {
              icon: Users,
              title: "Community First",
              desc: "We support both freelancers and clients to foster collaborative, long-term success.",
              color: "bg-purple-50 text-purple-600",
            },
            {
              icon: Award,
              title: "Commitment to Quality",
              desc: "Curating and showcasing only the best verified skills and professionals.",
              color: "bg-amber-50 text-amber-600",
            },
            {
              icon: Heart,
              title: "Zero Friction",
              desc: "With transparent pricing and 24/7 support, we ensure a seamless experience.",
              color: "bg-red-50 text-red-600",
            },
          ].map((val, idx) => {
            const Icon = val.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${val.color}`}
                >
                  <Icon size={22} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{val.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{val.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Stats Board */}
      <section className="max-w-5xl mx-auto px-6 mb-8 text-center bg-gray-50 rounded-3xl py-12 border border-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="text-4xl font-extrabold text-[#1e3a5f] mb-2">12+</div>
            <div className="text-sm font-semibold text-gray-500">Years Experience</div>
          </div>
          <div>
            <div className="text-4xl font-extrabold text-[#1e3a5f] mb-2">200+</div>
            <div className="text-sm font-semibold text-gray-500">Skills Catalogued</div>
          </div>
          <div>
            <div className="text-4xl font-extrabold text-[#1e3a5f] mb-2">₹0</div>
            <div className="text-sm font-semibold text-gray-500">Platform Fee</div>
          </div>
          <div>
            <div className="text-4xl font-extrabold text-[#1e3a5f] mb-2">4.9★</div>
            <div className="text-sm font-semibold text-gray-500">Average Rating</div>
          </div>
        </div>
      </section>
    </div>
    </main>
  );
}
