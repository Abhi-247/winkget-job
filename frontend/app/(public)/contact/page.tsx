"use client";

import { Mail, Phone, MapPin, Send, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ContactPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <main
      className="bg-white min-h-screen py-16"
      style={{ fontFamily: "var(--font-poppins), sans-serif" }}
    >
      {/* Contact Hero */}
      <section className="relative overflow-hidden mb-16 py-12">
        <div className="absolute inset-0 bg-gradient-to-br from-[#edf2f7] to-[#f8fafc] opacity-60 -z-10" />
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-1.5 bg-[#edf2f7] text-[#1e3a5f] rounded-full px-4 py-1.5 text-xs font-semibold mb-6">
            <HelpCircle size={12} className="text-[#1e3a5f]" />
            <span>We are here to assist you</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 leading-tight">
            Contact <span className="text-[#1e3a5f]">Us</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Got questions? We have got answers. Reach out to our support team or send us a quick message below.
          </p>
        </div>
      </section>

      {/* Main Grid */}
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
    </main>
  );
}
