"use client";

import {
  Mail,
  Phone,
  MapPin,
  Send,
  HelpCircle,
  Clock,
  MessageSquare,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Building,
  Navigation,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { contactApi } from "@/lib/api";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    inquiryType: "General Inquiry",
    subject: "",
    message: "",
  });

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [selectedOffice, setSelectedOffice] = useState<"delhi" | "gorakhpur">("delhi");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      await contactApi.submit({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        inquiryType: formData.inquiryType,
        subject: formData.subject || formData.inquiryType,
        message: formData.message,
      });
      setFormSubmitted(true);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const faqs = [
    {
      q: "How does the milestone escrow payment process work?",
      a: "When an employer hires a freelancer, the milestone funds are deposited into a secure WinkGetJob escrow account. The freelancer completes the deliverable, submits work through the portal, and once the client reviews and approves it, the funds are instantly released.",
    },
    {
      q: "What are the fees for employers to post jobs and hire?",
      a: "Posting jobs and reviewing proposals on WinkGetJob is completely free. We charge a transparent 3% processing fee only upon milestone release to cover secure escrow and payment gateway costs.",
    },
    {
      q: "How quickly can freelancers withdraw earnings to bank accounts?",
      a: "Withdrawals via instant UPI and IMPS bank transfers are processed in real-time (usually within 15 minutes). Standard NEFT transfers take 2-4 business hours.",
    },
    {
      q: "How do I get the 'Verified Talent' badge on my profile?",
      a: "Complete your profile information, add at least 3 verifiable portfolio projects, link your GitHub/LinkedIn, and pass our quick skill verification check in your dashboard.",
    },
    {
      q: "What happens if there is a dispute over project scope?",
      a: "Our dedicated 24/7 Trust & Dispute Resolution team steps in to review contract terms, chat history, and submitted work updates to ensure fair outcome for both parties.",
    },
  ];

  return (
    <main
      className="bg-white min-h-screen"
      style={{ fontFamily: "var(--font-poppins), sans-serif" }}
    >
      {/* HERO SECTION - Light Soft Purple Theme */}
      <section className="bg-[#f8fafc]/90 border-b border-slate-200/60 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

            {/* LEFT COLUMN: Text + Badges + Highlights + Stats */}
            <div className="lg:col-span-6 z-10">

              {/* Tag / Category Indicator */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 text-purple-700 font-semibold text-xs border border-purple-200/60 mb-3 shadow-2xs">
                <MessageSquare size={14} className="text-purple-600" />
                <span className="uppercase tracking-wider font-extrabold text-[10px]">24/7 DEDICATED SUPPORT</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-2xl sm:text-4xl lg:text-[2.25rem] xl:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.18] mb-2.5">
                We&apos;re Always Here to <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Support Your Journey</span>
              </h1>

              {/* Subtitle */}
              <p className="text-slate-600 text-xs sm:text-sm font-normal max-w-lg mb-4 leading-relaxed">
                Have questions about escrow protection, milestone verification, or job posting? Connect with our India-based customer support team anytime.
              </p>

              {/* Feature Highlights Cards */}
              <div className="grid grid-cols-3 gap-1.5 sm:flex sm:items-center sm:gap-2.5 mb-4">
                <div className="flex items-center justify-center gap-1 sm:gap-2 bg-white px-1.5 sm:px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
                  <span className="p-0.5 sm:p-1 rounded-md sm:rounded-lg bg-pink-50 text-pink-600 border border-pink-200/50 shrink-0">
                    <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </span>
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-800 truncate">24/7 Live</span>
                </div>
                <div className="flex items-center justify-center gap-1 sm:gap-2 bg-white px-1.5 sm:px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
                  <span className="p-0.5 sm:p-1 rounded-md sm:rounded-lg bg-purple-50 text-purple-600 border border-purple-200/50 shrink-0">
                    <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </span>
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-800 truncate">100% Escrow</span>
                </div>
                <div className="flex items-center justify-center gap-1 sm:gap-2 bg-white px-1.5 sm:px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
                  <span className="p-0.5 sm:p-1 rounded-md sm:rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200/50 shrink-0">
                    <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </span>
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-800 truncate">Fast Reply</span>
                </div>
              </div>

              {/* Quick Stats Row (Centered layout) */}
              <div className="grid grid-cols-3 gap-1 pt-3 border-t border-slate-200/70 w-full max-w-md">
                <div className="text-center flex flex-col items-center">
                  <p className="text-base sm:text-lg font-extrabold text-slate-900 leading-none">&lt; 15 min</p>
                  <p className="text-[9px] sm:text-[11px] text-slate-500 font-medium mt-1 whitespace-nowrap">Response Time</p>
                </div>
                <div className="text-center flex flex-col items-center">
                  <p className="text-base sm:text-lg font-extrabold text-slate-900 leading-none">24/7</p>
                  <p className="text-[9px] sm:text-[11px] text-slate-500 font-medium mt-1 whitespace-nowrap">Live Help</p>
                </div>
                <div className="text-center flex flex-col items-center">
                  <p className="text-base sm:text-lg font-extrabold text-slate-900 leading-none">99.8%</p>
                  <p className="text-[9px] sm:text-[11px] text-slate-500 font-medium mt-1 whitespace-nowrap">Resolved Rate</p>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Custom Generated Image + Organic Soft Blob + Floating Cards */}
            <div className="hidden lg:flex lg:col-span-6 relative items-center justify-end min-h-[320px] xl:min-h-[360px] lg:pr-2 xl:pr-6">
              {/* Organic Soft Purple Blob Background */}
              <div className="absolute w-[360px] xl:w-[420px] h-[300px] xl:h-[340px] bg-[#f0edff] rounded-[65%_35%_60%_40%/50%_60%_40%_50%] pointer-events-none -z-0 right-0 xl:right-4" />

              {/* Custom Generated Image */}
              <div className="relative z-10 w-[360px] xl:w-[430px] h-auto flex items-center justify-end">
                <Image
                  src="/contact-hero.png"
                  alt="Contact WinkGetJob Custom Illustration"
                  width={520}
                  height={520}
                  priority
                  className="object-contain drop-shadow-md w-full h-auto rounded-2xl"
                />
              </div>

              {/* Floating Card 1: Top Left */}
              <div className="absolute top-4 left-0 xl:left-4 z-20 bg-white/95 backdrop-blur-md rounded-xl p-2.5 shadow-lg border border-slate-100/80 w-36 transition-transform duration-300 hover:scale-105">
                <p className="text-[10px] font-medium text-slate-500 mb-0.5">Headquarters</p>
                <p className="text-xs font-extrabold text-slate-900">New Delhi, India</p>
              </div>

              {/* Floating Card 2: Bottom Right */}
              <div className="absolute bottom-2 right-2 xl:right-6 z-20 bg-white/95 backdrop-blur-md rounded-xl px-3 py-2 shadow-lg border border-slate-100/80 flex items-center gap-2 transition-transform duration-300 hover:scale-105">
                <div className="w-7 h-7 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center shrink-0">
                  <MessageSquare size={15} />
                </div>
                <div>
                  <p className="text-[11px] font-extrabold text-slate-900 leading-tight">Live Chat</p>
                  <p className="text-[9px] text-slate-500 font-medium">Online now</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <div className="py-16 space-y-20">
        {/* Contact Information Cards */}
        <section className="max-w-6xl mx-auto px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-50 border border-gray-200 rounded-3xl p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-[#1e3a5f] text-white flex items-center justify-center mb-4 shadow-md">
                <Mail size={22} />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Email Support</h3>
              <p className="text-xs text-gray-500 mb-3">For general inquiries &amp; help</p>
              <a
                href="mailto:winkgetexpress@gmail.com"
                className="text-xs font-bold text-[#1e3a5f] hover:underline block break-all"
              >
                winkgetexpress@gmail.com
              </a>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-3xl p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center mb-4 shadow-md">
                <Phone size={22} />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Phone &amp; WhatsApp</h3>
              <p className="text-xs text-gray-500 mb-3">Mon-Sat from 9am to 8pm IST</p>
              <a
                href="tel:+918175981920"
                className="text-xs font-bold text-[#1e3a5f] hover:underline block"
              >
                +91 8175981920
              </a>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-3xl p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-4 shadow-md">
                <Building size={22} />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Headquarters (Delhi)</h3>
              <p className="text-xs text-gray-500 mb-3">806, Aggarwal Corporate Heights</p>
              <span className="text-xs font-medium text-gray-700 block">NSP, Pitampura, New Delhi</span>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-3xl p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-4 shadow-md">
                <MapPin size={22} />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Branch Office (UP)</h3>
              <p className="text-xs text-gray-500 mb-3">6A Swastik Trade Center</p>
              <span className="text-xs font-medium text-gray-700 block">Gorakhpur, UP 273001</span>
            </div>
          </div>
        </section>

        {/* Main Grid: Form + Office Location Guide */}
        <section className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-5 gap-12 items-start">
            {/* Contact Form */}
            <div className="lg:col-span-3 bg-white border border-gray-200 rounded-3xl p-8 sm:p-10 shadow-lg">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Send Us a Direct Message</h3>
                <p className="text-xs text-gray-500">
                  Fill out the details below and our customer success manager will respond shortly.
                </p>
              </div>

              {formSubmitted ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-4">
                  <div className="w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 size={30} />
                  </div>
                  <h4 className="text-xl font-bold text-emerald-950">Message Sent Successfully!</h4>
                  <p className="text-xs text-emerald-800 leading-relaxed max-w-md mx-auto">
                    Your inquiry has been submitted successfully. We will get back to you at <span className="font-semibold">{formData.email}</span> within 2 hours.
                  </p>
                  <button
                    onClick={() => {
                      setFormSubmitted(false);
                      setFormData({
                        name: "",
                        email: "",
                        phone: "",
                        inquiryType: "General Inquiry",
                        subject: "",
                        message: "",
                      });
                    }}
                    className="bg-[#1e3a5f] text-white text-xs font-bold px-6 py-2.5 rounded-xl hover:bg-[#152a45] transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Inquiry Category
                      </label>
                      <select
                        name="inquiryType"
                        value={formData.inquiryType}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-800 outline-none focus:border-[#1e3a5f] transition-colors font-medium"
                      >
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Employer Hiring">Employer Hiring</option>
                        <option value="Freelancer Payment & Escrow">Freelancer Payment &amp; Escrow</option>
                        <option value="Technical Issue">Technical Issue</option>
                        <option value="Enterprise Partnership">Enterprise Partnership</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-[#1e3a5f] transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="you@domain.com"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-[#1e3a5f] transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Phone / Mobile
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+91 98765 43210"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-[#1e3a5f] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="Brief summary of your question"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-[#1e3a5f] transition-colors"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Message *
                      </label>
                      <span className="text-[10px] text-gray-400">
                        {formData.message.length} / 1000 chars
                      </span>
                    </div>
                    <textarea
                      name="message"
                      rows={5}
                      maxLength={1000}
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Write your detailed query or project details here..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-[#1e3a5f] transition-colors resize-none"
                      required
                    />
                  </div>

                  {submitError && (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-xs text-rose-700 font-medium">
                      {submitError}
                    </div>
                  )}

                  <Button
                    type="submit"
                    loading={submitting}
                    className="w-full bg-[#1e3a5f] hover:bg-[#152a45] text-white gap-2 py-3.5 rounded-xl font-bold shadow-md cursor-pointer text-xs uppercase tracking-wider"
                  >
                    Submit Ticket
                    <Send size={15} />
                  </Button>
                </form>
              )}
            </div>

            {/* Office Locations & Direct Map Guide */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gray-50 border border-gray-200 rounded-3xl p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Our Offices</h3>
                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 text-xs">
                    <button
                      onClick={() => setSelectedOffice("delhi")}
                      className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        selectedOffice === "delhi"
                          ? "bg-[#1e3a5f] text-white shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Delhi HQ
                    </button>
                    <button
                      onClick={() => setSelectedOffice("gorakhpur")}
                      className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        selectedOffice === "gorakhpur"
                          ? "bg-[#1e3a5f] text-white shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Gorakhpur
                    </button>
                  </div>
                </div>

                {selectedOffice === "delhi" ? (
                  <div className="space-y-4">
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#1e3a5f]">
                        <Building size={16} />
                        Headquarters Office
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        806, Aggarwal Corporate Heights, Netaji Subhash Place (NSP), Pitampura, New Delhi, Delhi 110034
                      </p>
                      <div className="text-[11px] text-gray-500 space-y-1 pt-2 border-t border-gray-100">
                        <div>
                          <span className="font-semibold text-gray-700">Nearest Metro:</span> Netaji Subhash Place (Red / Pink Line)
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Operating Hours:</span> Mon - Sat (9:30 AM - 7:00 PM IST)
                        </div>
                      </div>
                    </div>

                    <a
                      href="https://maps.google.com/?q=Aggarwal+Corporate+Heights+NSP+Pitampura+New+Delhi"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-bold text-[#1e3a5f] bg-blue-50 border border-blue-200 px-4 py-2.5 rounded-xl hover:bg-blue-100 transition-colors w-full justify-center"
                    >
                      <Navigation size={14} />
                      Open Location in Google Maps
                    </a>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#1e3a5f]">
                        <MapPin size={16} />
                        Regional Branch Office
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        6A Swastik Trade Center, Gandhi Gali, Golghar, Gorakhpur, Uttar Pradesh 273001
                      </p>
                      <div className="text-[11px] text-gray-500 space-y-1 pt-2 border-t border-gray-100">
                        <div>
                          <span className="font-semibold text-gray-700">Landmark:</span> Near Town Hall Chowk
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Operating Hours:</span> Mon - Sat (10:00 AM - 6:30 PM IST)
                        </div>
                      </div>
                    </div>

                    <a
                      href="https://maps.google.com/?q=Swastik+Trade+Center+Gorakhpur+UP"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-bold text-[#1e3a5f] bg-blue-50 border border-blue-200 px-4 py-2.5 rounded-xl hover:bg-blue-100 transition-colors w-full justify-center"
                    >
                      <Navigation size={14} />
                      Open Location in Google Maps
                    </a>
                  </div>
                )}
              </div>

              {/* Trust & Safety Box */}
              <div className="bg-gradient-to-br from-[#1e3a5f] to-[#152a45] text-white rounded-3xl p-6 sm:p-8 space-y-3 shadow-md">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-2">
                  <ShieldCheck className="text-[#d4a017]" size={20} />
                </div>
                <h4 className="font-bold text-base">Escrow &amp; Account Protection</h4>
                <p className="text-xs text-white/80 leading-relaxed">
                  Need immediate help with a live transaction or active milestone issue? Our Escrow Safety officers review priority support requests within 30 minutes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive FAQ Accordion */}
        <section className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-500 text-sm">
              Quick answers to the most common questions from freelancers and employers.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm transition-all"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-bold text-sm text-gray-900 hover:text-[#1e3a5f] cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp size={18} className="text-[#1e3a5f] flex-shrink-0" />
                    ) : (
                      <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-xs text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
