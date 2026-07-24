"use client";

import {
  Briefcase,
  MapPin,
  ArrowRight,
  Zap,
  Coffee,
  Globe,
  GraduationCap,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Search,
  CheckCircle2,
  X,
  Upload,
  Send,
  Users,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useState, useMemo } from "react";

interface Role {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  description: string;
  requirements: string[];
}

const openRoles: Role[] = [
  {
    id: "sr-fullstack-dev",
    title: "Senior Full-Stack Engineer (Next.js / Node.js)",
    department: "Engineering",
    location: "Remote, India",
    type: "Full-time",
    experience: "4-7 Years",
    description:
      "Architect and scale real-time chat, escrow transaction pipelines, and high-concurrency microservices using Next.js 16, Node.js, and TypeScript.",
    requirements: [
      "Proficient in Next.js App Router, TypeScript, React 19, and Tailwind CSS.",
      "Experience designing RESTful & WebSocket APIs with Node.js and MongoDB/PostgreSQL.",
      "Track record of optimizing web performance and caching strategies.",
    ],
  },
  {
    id: "staff-uiux-designer",
    title: "Staff UI/UX Designer & Design Systems Lead",
    department: "Product & Design",
    location: "Remote, India",
    type: "Full-time",
    experience: "5+ Years",
    description:
      "Craft modern, accessible, and delight-inducing user interfaces for employer dashboards, job seeker work portals, and mobile web clients.",
    requirements: [
      "Expertise in Figma, design tokens, micro-animations, and responsive layout math.",
      "Strong portfolio demonstrating user journey flows, wireframes, and high-fidelity mockups.",
      "Experience conducting user interviews and usability testing sessions.",
    ],
  },
  {
    id: "growth-marketing-lead",
    title: "Growth Marketing & SEO Specialist",
    department: "Growth & Marketing",
    location: "Bengaluru / Hybrid",
    type: "Full-time",
    experience: "3-5 Years",
    description:
      "Lead user acquisition campaigns, organic search optimization, performance marketing, and community engagement initiatives for freelancers across India.",
    requirements: [
      "Proven experience scaling organic traffic and paid user acquisition loops.",
      "Data-driven mindset with hands-on proficiency in Google Analytics, Search Console, and A/B testing.",
      "Excellent copywriting and content strategy skills.",
    ],
  },
  {
    id: "escrow-trust-head",
    title: "Head of Escrow Audit & Dispute Resolution",
    department: "Trust & Escrow Safety",
    location: "New Delhi HQ / Remote",
    type: "Full-time",
    experience: "4+ Years",
    description:
      "Manage dispute mediation protocols, milestone verification workflows, financial risk compliance, and platform trust policies.",
    requirements: [
      "Background in legal compliance, financial risk audit, or customer operations.",
      "Strong analytical approach to conflict mediation and contract clause verification.",
      "Exceptional written communication and dispute handling empathy.",
    ],
  },
  {
    id: "customer-success-spec",
    title: "Customer Success & Support Specialist",
    department: "Customer Success",
    location: "Remote, India",
    type: "Full-time",
    experience: "2-4 Years",
    description:
      "Provide 24/7 technical and account assistance to employers and job seekers, ensuring swift issue resolution and high platform retention.",
    requirements: [
      "Prior experience in tech startup customer support or client operations.",
      "Fluency in English and Hindi (written and verbal).",
      "Familiarity with ticket management systems and user onboarding.",
    ],
  },
  {
    id: "devops-infra-architect",
    title: "DevOps & Infrastructure Architect",
    department: "Engineering",
    location: "Remote, India",
    type: "Full-time",
    experience: "5+ Years",
    description:
      "Build resilient cloud infrastructure, CI/CD deployment pipelines, automated monitoring, and zero-downtime database migrations.",
    requirements: [
      "Hands-on expertise with AWS, Docker, Kubernetes, Terraform, and GitHub Actions.",
      "Focus on system security, DDoS mitigation, and SSL/TLS certificate management.",
      "Experience maintaining 99.99% uptime for high-traffic web applications.",
    ],
  },
];

const perks = [
  {
    icon: Globe,
    title: "Remote-First Freedom",
    desc: "Work from any city in India. We support flexible schedules tailored around your peak productivity hours.",
  },
  {
    icon: GraduationCap,
    title: "₹50,000 Annual Upskilling",
    desc: "Dedicated annual budget for books, online courses, technical certifications, and global industry conferences.",
  },
  {
    icon: Coffee,
    title: "₹35,000 Home Office Setup",
    desc: "Allowance to set up an ergonomic desk, high-speed Wi-Fi, monitor arms, and comfortable seating.",
  },
  {
    icon: HeartHandshake,
    title: "Comprehensive Health Cover",
    desc: "Premium medical insurance for you and your family, covering OPD visits, dental, and wellness benefits.",
  },
  {
    icon: Zap,
    title: "Performance & Equity Stock",
    desc: "Competitive base compensation paired with annual performance bonuses and stock options for long-term ownership.",
  },
  {
    icon: ShieldCheck,
    title: "Unlimited Flexible PTO",
    desc: "Generous paid time off, mental health recharge days, and paid parental leave to keep you refreshed.",
  },
];

const hiringSteps = [
  {
    step: "01",
    title: "Online Application",
    desc: "Submit your resume, GitHub/portfolio link, and a brief note on why WinkGetJob excites you.",
  },
  {
    step: "02",
    title: "Culture & Team Call",
    desc: "A 30-minute informal conversation to align on values, mutual expectations, and role scope.",
  },
  {
    step: "03",
    title: "Technical / Portfolio Deep Dive",
    desc: "A practical 45-minute discussion reviewing your real work, code samples, or case studies.",
  },
  {
    step: "04",
    title: "Official Offer & Welcome",
    desc: "Receive your competitive offer letter, home office setup budget, and onboarding kit!",
  },
];

export default function CareersPage() {
  const [selectedDept, setSelectedDept] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeRoleModal, setActiveRoleModal] = useState<Role | null>(null);
  const [applySubmitted, setApplySubmitted] = useState(false);

  const [applicantForm, setApplicantForm] = useState({
    name: "",
    email: "",
    phone: "",
    portfolioUrl: "",
    coverNote: "",
  });

  const departments = [
    "All",
    "Engineering",
    "Product & Design",
    "Growth & Marketing",
    "Trust & Escrow Safety",
    "Customer Success",
  ];

  const filteredRoles = useMemo(() => {
    return openRoles.filter((role) => {
      const matchesDept = selectedDept === "All" || role.department === selectedDept;
      const matchesSearch =
        searchQuery.trim() === "" ||
        role.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDept && matchesSearch;
    });
  }, [selectedDept, searchQuery]);

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (applicantForm.name && applicantForm.email) {
      setApplySubmitted(true);
    }
  };

  return (
    <main
      className="bg-white min-h-screen relative"
      style={{ fontFamily: "var(--font-poppins), sans-serif" }}
    >
      {/* Hero Section */}
      <div className="bg-[#1e3a5f] text-white py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full blur-xl pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-6 text-center sm:text-left">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-5 text-white/70 justify-center sm:justify-start">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>›</span>
            <span className="text-white font-medium">Careers</span>
          </div>
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold mb-6">
            <Sparkles size={14} className="text-[#d4a017]" />
            <span>We Are Hiring Top Talent Across India</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight mb-4 max-w-3xl">
            Build the Future of Independent Work at <span className="text-[#d4a017]">WinkGetJob</span>
          </h1>
          <p className="text-white/80 text-base sm:text-lg max-w-2xl leading-relaxed mb-8">
            Join a mission-driven, remote-first team building India’s premier freelance ecosystem. Solve challenging engineering, product, and growth problems with complete autonomy.
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
            <a
              href="#openings"
              className="bg-[#d4a017] hover:bg-[#c29213] text-[#1e3a5f] font-bold px-6 py-3.5 rounded-xl transition-all shadow-lg flex items-center gap-2 text-sm"
            >
              View Open Roles ({openRoles.length})
              <ArrowRight size={16} />
            </a>
            <a
              href="#perks"
              className="bg-white/10 hover:bg-white/20 text-white font-medium border border-white/20 px-6 py-3.5 rounded-xl transition-all text-sm"
            >
              Perks &amp; Benefits
            </a>
          </div>
        </div>
      </div>

      <div className="py-16 space-y-24">
        {/* Culture & Values Callout */}
        <section className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Our Core Culture</h2>
            <p className="text-gray-500 text-sm">
              We value outcome over hours, ownership over micro-management, and clarity in everything we do.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Autonomous & Async",
                desc: "We trust you to manage your schedule. Clear documentation and video updates replace endless meetings.",
                color: "bg-blue-50 text-blue-600 border-blue-100",
              },
              {
                title: "Radical Transparency",
                desc: "Roadmaps, metrics, and key decisions are shared openly across the team so everyone has context.",
                color: "bg-amber-50 text-amber-600 border-amber-100",
              },
              {
                title: "User Empathy",
                desc: "Every line of code and design decision is focused on empowering real freelancers and business owners.",
                color: "bg-purple-50 text-purple-600 border-purple-100",
              },
              {
                title: "Continuous Growth",
                desc: "We encourage experimentation. Fail fast, learn constantly, and share insights generously.",
                color: "bg-emerald-50 text-emerald-600 border-emerald-100",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`rounded-2xl border p-6 shadow-sm hover:shadow-md transition-shadow bg-white ${item.color}`}
              >
                <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center font-bold text-xs mb-4">
                  0{idx + 1}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Perks & Benefits Section */}
        <section id="perks" className="max-w-6xl mx-auto px-6">
          <div className="bg-gray-50 border border-gray-200 rounded-3xl p-8 sm:p-12">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold text-[#1e3a5f] bg-blue-100 px-3 py-1 rounded-full uppercase tracking-wider">
                Why Work With Us
              </span>
              <h2 className="text-3xl font-bold text-gray-900 mt-3 mb-3">
                Perks &amp; Employee Benefits
              </h2>
              <p className="text-gray-500 text-sm">
                Designed to support your health, continuous learning, and remote work lifestyle.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {perks.map((p, idx) => {
                const Icon = p.icon;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#1e3a5f] text-white flex items-center justify-center mb-4 shadow-md">
                      <Icon size={22} />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{p.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{p.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Open Positions Filter & Grid */}
        <section id="openings" className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Open Positions</h2>
              <p className="text-sm text-gray-500">
                Explore available engineering, product, growth, and operations roles.
              </p>
            </div>

            {/* Department Pills & Search */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Filter position..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3 py-2 text-xs text-gray-800 outline-none focus:border-[#1e3a5f] transition-colors"
                />
              </div>

              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full sm:w-auto bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs font-bold text-gray-800 outline-none focus:border-[#1e3a5f]"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept === "All" ? "All Departments" : dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredRoles.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 border border-gray-200 rounded-3xl">
              <Briefcase size={40} className="mx-auto text-gray-400 mb-3" />
              <h4 className="text-lg font-bold text-gray-800">No matching positions found</h4>
              <p className="text-sm text-gray-500 mt-1">
                Try searching for another keyword or change your department filter.
              </p>
              <button
                onClick={() => {
                  setSelectedDept("All");
                  setSearchQuery("");
                }}
                className="mt-4 bg-[#1e3a5f] text-white text-xs font-bold px-5 py-2.5 rounded-xl"
              >
                Reset Search
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRoles.map((role) => (
                <div
                  key={role.id}
                  className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[#1e3a5f]/40"
                >
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-blue-50 text-[#1e3a5f] text-[11px] font-bold px-3 py-0.5 rounded-full border border-blue-100">
                        {role.department}
                      </span>
                      <span className="bg-amber-50 text-amber-800 text-[11px] font-bold px-3 py-0.5 rounded-full border border-amber-100">
                        {role.experience}
                      </span>
                    </div>

                    <h3 className="font-bold text-gray-900 text-xl">{role.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {role.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 pt-1">
                      <span className="flex items-center gap-1.5 font-medium text-gray-600">
                        <MapPin size={13} className="text-[#1e3a5f]" />
                        {role.location}
                      </span>
                      <span>•</span>
                      <span className="font-medium text-gray-600">{role.type}</span>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <Button
                      onClick={() => {
                        setActiveRoleModal(role);
                        setApplySubmitted(false);
                      }}
                      className="bg-[#1e3a5f] hover:bg-[#152a45] text-white gap-2 font-bold py-3 px-6 rounded-xl text-xs w-full md:w-auto cursor-pointer"
                    >
                      Apply for Position
                      <ArrowRight size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Step-by-Step Hiring Process */}
        <section className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Our Hiring Process</h2>
            <p className="text-gray-500 text-sm">
              Simple, transparent, and fast — we respect your time at every step.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {hiringSteps.map((s, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative"
              >
                <span className="text-3xl font-extrabold text-[#1e3a5f]/15 absolute top-4 right-4">
                  {s.step}
                </span>
                <div className="w-8 h-8 rounded-full bg-[#1e3a5f] text-white font-bold text-xs flex items-center justify-center mb-4 shadow-sm">
                  {idx + 1}
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-base">{s.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Role Application Modal */}
      {activeRoleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative border border-gray-100">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 sm:px-8 py-5 flex items-center justify-between z-10">
              <div>
                <span className="text-xs font-bold text-[#1e3a5f] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                  {activeRoleModal.department}
                </span>
                <h3 className="text-xl font-bold text-gray-900 mt-1">
                  Apply for {activeRoleModal.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveRoleModal(null)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 sm:p-8 space-y-6">
              {applySubmitted ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-4">
                  <div className="w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 size={30} />
                  </div>
                  <h4 className="text-xl font-bold text-emerald-950">Application Received!</h4>
                  <p className="text-xs text-emerald-800 leading-relaxed max-w-md mx-auto">
                    Thank you for applying for <span className="font-semibold">{activeRoleModal.title}</span>. Our engineering &amp; hiring team will review your application and respond to <span className="font-semibold">{applicantForm.email}</span> within 48 hours.
                  </p>
                  <button
                    onClick={() => setActiveRoleModal(null)}
                    className="bg-[#1e3a5f] text-white text-xs font-bold px-6 py-2.5 rounded-xl hover:bg-[#152a45] transition-colors cursor-pointer"
                  >
                    Close &amp; Return to Careers
                  </button>
                </div>
              ) : (
                <>
                  {/* Role Requirements Box */}
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-3">
                    <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                      Key Requirements
                    </h4>
                    <ul className="space-y-2 text-xs text-gray-600">
                      {activeRoleModal.requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 size={14} className="text-[#1e3a5f] flex-shrink-0 mt-0.5" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Application Form */}
                  <form onSubmit={handleApplySubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Vikramaditya Singh"
                          value={applicantForm.name}
                          onChange={(e) => setApplicantForm({ ...applicantForm, name: e.target.value })}
                          required
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 outline-none focus:border-[#1e3a5f]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          placeholder="you@domain.com"
                          value={applicantForm.email}
                          onChange={(e) => setApplicantForm({ ...applicantForm, email: e.target.value })}
                          required
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 outline-none focus:border-[#1e3a5f]"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                          Phone / WhatsApp
                        </label>
                        <input
                          type="tel"
                          placeholder="+91 98765 43210"
                          value={applicantForm.phone}
                          onChange={(e) => setApplicantForm({ ...applicantForm, phone: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 outline-none focus:border-[#1e3a5f]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                          LinkedIn / Portfolio URL *
                        </label>
                        <input
                          type="url"
                          placeholder="https://linkedin.com/in/username"
                          value={applicantForm.portfolioUrl}
                          onChange={(e) => setApplicantForm({ ...applicantForm, portfolioUrl: e.target.value })}
                          required
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 outline-none focus:border-[#1e3a5f]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Brief Cover Note / Why WinkGetJob?
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Tell us about a recent project you built or why this role fits your career..."
                        value={applicantForm.coverNote}
                        onChange={(e) => setApplicantForm({ ...applicantForm, coverNote: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 outline-none focus:border-[#1e3a5f] resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-[#1e3a5f] hover:bg-[#152a45] text-white font-bold py-3 rounded-xl text-xs gap-2 cursor-pointer uppercase tracking-wider shadow-md"
                    >
                      Submit Application
                      <Send size={14} />
                    </Button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
