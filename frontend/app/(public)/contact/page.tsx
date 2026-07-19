"use client";

import { Mail, Phone, MapPin, Send, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function ContactPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

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
            <span className="text-white font-medium">Contact</span>
          </div>
          <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold mb-5">
            <HelpCircle size={12} className="text-[#d4a017]" />
            <span>We are here to assist you</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-3">
            Contact <span className="text-[#d4a017]">Us</span>
          </h1>
          <p className="text-white/70 text-sm mt-1.5 flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#d4a017]" />
            Got questions? Reach our support team — we reply within 24 hours
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="py-12">
        <section className="max-w-5xl mx-auto px-6 mb-12">
          <div className="grid md:grid-cols-5 gap-12">
            {/* Contact Details */}
            <div className="md:col-span-2 space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
                <p className="text-gray-500 leading-relaxed mb-6">
                  Feel free to contact us via email, phone call, or visit our headquarters office. We usually reply within 24 hours.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#edf2f7] text-[#1e3a5f] flex items-center justify-center flex-shrink-0">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Email Address</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      <a href="mailto:winkgetexpress@gmail.com" className="hover:text-[#1e3a5f] transition-colors">winkgetexpress@gmail.com</a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#edf2f7] text-[#1e3a5f] flex items-center justify-center flex-shrink-0">
                    <Phone size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Phone Number</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      <a href="tel:+918175981920" className="hover:text-[#1e3a5f] transition-colors">+91 8175981920</a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#edf2f7] text-[#1e3a5f] flex items-center justify-center flex-shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Head Office</h4>
                    <p className="text-sm text-gray-500 mt-1">806, Aggarwal Corporate Heights, NSP, Pitampura, New Delhi</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#edf2f7] text-[#1e3a5f] flex items-center justify-center flex-shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Branch Office</h4>
                    <p className="text-sm text-gray-500 mt-1">6A Swastik Trade Center, Gandhi Gali, Gorakhpur, UP 273001</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="md:col-span-3 bg-gray-50 border border-gray-100 rounded-3xl p-8 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Send us a Message</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#d4a017] transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#d4a017] transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Message</label>
                  <textarea
                    rows={4}
                    placeholder="Write your message here..."
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#d4a017] transition-colors resize-none"
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-[#1e3a5f] hover:bg-[#152a45] gap-2 py-3 rounded-xl">
                  Send Message
                  <Send size={16} />
                </Button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
