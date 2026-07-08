"use client";

import { Users, Award, ShieldCheck, Heart, Sparkles } from "lucide-react";

export default function AboutPage() {
  return (
    <main
      className="bg-white min-h-screen py-16"
      style={{ fontFamily: "var(--font-poppins), sans-serif" }}
    >
      {/* Hero Section */}
      <section className="relative overflow-hidden mb-16 py-12">
        <div className="absolute inset-0 bg-gradient-to-br from-[#edf2f7] to-[#f8fafc] opacity-60 -z-10" />
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-1.5 bg-[#edf2f7] text-[#1e3a5f] rounded-full px-4 py-1.5 text-xs font-semibold mb-6">
            <Sparkles size={12} className="fill-[#d4a017] text-[#1e3a5f]" />
            <span>Empowering India's Independent Workforce</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
            About Wink<span className="text-[#1e3a5f]">Get</span>Job
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            We are India's premier freelance network, bridging the gap between exceptional local talent and visionary businesses. Our mission is to make work flexible, secure, and rewarding.
          </p>
        </div>
      </section>

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
    </main>
  );
}
