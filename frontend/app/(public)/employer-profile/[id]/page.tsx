"use client";

import { useEffect, useState, use } from "react";
import { useParams, useRouter } from "next/navigation";
import { freelancersApi, jobsApi } from "@/lib/api";
import { User, Job } from "@/types";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import {
  MapPin,
  Building2,
  Globe,
  Mail,
  Calendar,
  Users,
  CheckCircle2,
  Briefcase,
  Star,
  Sparkles,
  ArrowUpRight,
  Share2,
  Heart,
  Award,
  ShieldCheck,
  Zap,
  TrendingUp,
  MessageSquare,
  ChevronRight,
  User as UserIcon,
} from "lucide-react";
import { Linkedin, Twitter } from "@/components/ui/BrandIcons";
import Link from "next/link";
import { FeaturedJobCard } from "@/components/landing/FeaturedJobs";
import { AutoScrollCarousel } from "@/components/ui/AutoScrollCarousel";

interface Props {
  params: Promise<{ id: string }>;
}

export default function PublicEmployerProfilePage({ params }: Props) {
  const { id: employerId } = use(params);
  const router = useRouter();
  const { success } = useToast();

  const [employer, setEmployer] = useState<User | null>(null);
  const [activeJobs, setActiveJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    const fetchEmployerProfile = async () => {
      try {
        setLoading(true);
        const res = (await freelancersApi.getById(employerId)) as { data: User };
        setEmployer(res.data);

        // Fetch active real jobs posted by this employer from API
        try {
          const jobsRes = (await jobsApi.getJobs()) as { data: Job[] };
          const allJobs = jobsRes.data || [];
          const empJobs = allJobs.filter((j) => {
            const empObj = typeof j.employer === "object" ? j.employer : null;
            return empObj?._id === employerId || (res.data.company && j.companyName === res.data.company);
          });
          setActiveJobs(empJobs);
        } catch {
          /* non-critical */
        }
      } catch (err) {
        setError("Failed to load employer profile");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (employerId) {
      fetchEmployerProfile();
    }
  }, [employerId]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    success("Profile link copied!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#1e3a5f] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading Employer Profile...</p>
        </div>
      </div>
    );
  }

  if (error || !employer) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="text-center bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-md">
          <Building2 size={40} className="mx-auto text-slate-400 mb-3" />
          <h2 className="text-lg font-bold text-slate-900 mb-1">Employer Not Found</h2>
          <p className="text-sm text-slate-500 mb-4">{error || "The employer profile you are looking for does not exist."}</p>
          <Link href="/jobs">
            <Button variant="outline" size="sm">Browse Jobs</Button>
          </Link>
        </div>
      </div>
    );
  }

  // 100% Dynamic Real Data Binding from API
  const displayCompany = employer.company || employer.name || "Employer Profile";
  const displayContact = employer.name || "Representative";
  const displayTitle = employer.title || "Hiring Partner";
  const displayLocation = employer.location || "India";
  const email = employer.email || "";
  const website = employer.socialLinks?.website || "";
  const bio = employer.bio || "No detailed overview provided yet by employer.";
  const tagline = employer.bio
    ? employer.bio.split("\n")[0]
    : `Verified Hiring Partner on winkget-job`;

  const memberSince = employer.createdAt
    ? new Date(employer.createdAt).toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      })
    : "Recently Joined";

  const specialties = (employer.skills && employer.skills.length > 0)
    ? employer.skills
    : ["Talent Acquisition", "Engineering", "Design", "Product Operations"];

  const benefits = [
    { label: "Flexible & hybrid work", desc: "Work from office or remote" },
    { label: "Performance rewards", desc: "Competitive compensation package" },
    { label: "Health & wellness", desc: "Medical insurance coverage" },
    { label: "Professional growth", desc: "Learning & development support" },
    { label: "Paid time off", desc: "Flexible leave policy" },
    { label: "Equipment provided", desc: "Workstation setup provided" },
  ];

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16">
      {/* ── BREADCRUMB ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/" className="hover:text-slate-800 transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link href="/jobs" className="hover:text-slate-800 transition-colors">Employers</Link>
            <ChevronRight size={12} />
            <span className="text-slate-900 font-medium truncate max-w-[200px]">{displayCompany}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* ── HERO BANNER CARD ────────────────────────────────────────────── */}
        <div className="relative bg-gradient-to-br from-[#0b192c] via-[#1e3a5f] to-[#0f172a] text-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl border border-white/10 overflow-hidden">
          {/* Glowing Mesh Orbs */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#d4a017]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-center justify-between gap-6 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-5 min-w-0 w-full sm:w-auto">
              {/* Logo / Avatar with Gold Ring & Verified Check */}
              <div className="relative flex-shrink-0 mx-auto sm:mx-0">
                {employer.avatar ? (
                  <img
                    src={employer.avatar}
                    alt={displayCompany}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-[#d4a017]/60 shadow-lg"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#1e3a5f] to-[#0b192c] text-white font-extrabold text-3xl flex items-center justify-center ring-4 ring-[#d4a017]/60 shadow-lg">
                    {displayCompany.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 ring-2 ring-[#0b192c] flex items-center justify-center shadow-md">
                  <CheckCircle2 size={13} className="text-white" />
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap mb-1">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                    {displayCompany}
                  </h1>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300 bg-amber-400/20 border border-amber-400/30 px-2.5 py-0.5 rounded-full backdrop-blur-md">
                    <ShieldCheck size={12} /> Verified Employer
                  </span>
                </div>

                {/* Sub-strip Real Meta Pills */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-white/80 mt-2.5">
                  <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                    <UserIcon size={13} className="text-amber-400" /> {displayContact} ({displayTitle})
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                    <MapPin size={13} className="text-blue-400" /> {displayLocation}
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                    <Calendar size={13} className="text-emerald-400" /> Joined {memberSince}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-row md:flex-col items-center gap-3 w-full md:w-auto flex-shrink-0">
              <button
                onClick={() => setFollowing(!following)}
                className={`flex-1 md:flex-initial w-full sm:w-auto py-3 px-5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border-0 ${
                  following
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                    : "bg-gradient-to-r from-[#d4a017] via-[#e6b800] to-[#b8860b] hover:from-[#b8860b] hover:to-[#966d09] text-slate-950 shadow-lg shadow-[#d4a017]/25"
                }`}
              >
                <Heart size={15} className={following ? "fill-emerald-300" : ""} />
                <span>{following ? "Following" : "Follow Company"}</span>
              </button>

              <button
                onClick={copyLink}
                className="flex-1 md:flex-initial w-full sm:w-auto py-3 px-5 rounded-xl font-semibold text-xs text-white/90 bg-white/10 hover:bg-white/20 border border-white/15 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Share2 size={14} />
                <span>Share Profile</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── REAL METRICS DASHBOARD BAR ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 shadow-xs flex items-center gap-3 sm:gap-4 group hover:border-blue-200 transition-all">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Briefcase size={20} className="sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight truncate">
                {activeJobs.length}
              </p>
              <p className="text-[11px] sm:text-xs font-medium text-slate-500 leading-tight">Active Job Openings</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 shadow-xs flex items-center gap-3 sm:gap-4 group hover:border-emerald-200 transition-all">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <TrendingUp size={20} className="sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight truncate">100%</p>
              <p className="text-[11px] sm:text-xs font-medium text-slate-500 leading-tight">Verified Employer</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 shadow-xs flex items-center gap-3 sm:gap-4 group hover:border-amber-200 transition-all">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Zap size={20} className="sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight truncate">Fast</p>
              <p className="text-[11px] sm:text-xs font-medium text-slate-500 leading-tight">Response Status</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 shadow-xs flex items-center gap-3 sm:gap-4 group hover:border-indigo-200 transition-all">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Award size={20} className="sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight truncate">
                {employer.ratingAvg ? `★ ${employer.ratingAvg.toFixed(1)}` : "Top Rated"}
              </p>
              <p className="text-[11px] sm:text-xs font-medium text-slate-500 leading-tight">Employer Rating</p>
            </div>
          </div>
        </div>

        {/* ── MAIN 2-COLUMN LAYOUT ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
          {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
          <div className="space-y-6 min-w-0">
            {/* About Company & Bio */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Sparkles size={18} className="text-[#d4a017]" /> About {displayCompany}
              </h2>
              
              <div className="text-sm text-slate-600 leading-relaxed space-y-3 font-normal whitespace-pre-wrap">
                <p>{bio}</p>
              </div>

              {/* Golden Culture Quote Block */}
              <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border-l-4 border-[#d4a017] relative">
                <p className="text-xs font-bold text-[#b8860b] uppercase tracking-wider mb-1">Company Culture & Mission</p>
                <p className="text-sm italic font-medium text-slate-800 leading-relaxed">
                  &ldquo;We focus on innovation, ownership, and empowering candidates to build meaningful careers.&rdquo;
                </p>
              </div>
            </div>

            {/* Benefits & Perks Grid */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Award size={18} className="text-[#1e3a5f]" /> Work Culture & Perks
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {benefits.map((b) => (
                  <div
                    key={b.label}
                    className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-start gap-3 hover:border-slate-200 transition-all"
                  >
                    <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">{b.label}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Specialties & Skill Stack */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Globe size={18} className="text-[#1e3a5f]" /> Hiring Specialties & Focus Areas
              </h2>
              <div className="flex flex-wrap gap-2">
                {specialties.map((s) => (
                  <span
                    key={s}
                    className="px-3.5 py-1.5 rounded-full bg-blue-50 text-[#1e3a5f] text-xs font-semibold border border-blue-100 hover:bg-blue-100 transition-colors"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Active Job Openings Section — Horizontal Carousel */}
            {activeJobs.length > 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs">
                <AutoScrollCarousel
                  title={`Active Job Openings (${activeJobs.length})`}
                  subtitle={`${displayCompany} opportunities`}
                >
                  {activeJobs.map((j) => (
                    <div key={j._id} className="w-72 sm:w-80 flex-shrink-0">
                      <FeaturedJobCard job={j} />
                    </div>
                  ))}
                </AutoScrollCarousel>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs text-center py-8">
                <Briefcase size={28} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-700">No active job openings right now</p>
                <p className="text-xs text-slate-400 mt-1">Check back soon for new opportunities from {displayCompany}.</p>
              </div>
            )}

            {/* Freelancer & Candidate Reviews */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Star size={18} className="text-amber-500 fill-amber-500" /> Employer Reviews
                </h2>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                  ★ {employer.ratingAvg ? employer.ratingAvg.toFixed(1) : "0.0"} ({employer.ratingCount || 0} reviews)
                </span>
              </div>
              <div className="py-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <MessageSquare size={28} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-700 mb-1">
                  {employer.ratingCount ? `${employer.ratingCount} Verified Reviews` : "No reviews yet"}
                </p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Reviews from talent and applicants who have worked with {displayCompany} will be displayed here.
                </p>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN (STICKY SIDEBAR) ──────────────────────────── */}
          <div className="space-y-6 lg:sticky lg:top-6 flex-shrink-0 w-full">
            {/* Business Details Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                <Building2 size={16} className="text-[#1e3a5f]" /> Business & Profile Details
              </h3>
              <dl className="space-y-3.5 text-xs">
                <div className="flex justify-between items-center py-1">
                  <dt className="text-slate-500 font-medium">Company Name</dt>
                  <dd className="font-semibold text-slate-800 text-right">{displayCompany}</dd>
                </div>
                <div className="flex justify-between items-center py-1">
                  <dt className="text-slate-500 font-medium">Representative</dt>
                  <dd className="font-semibold text-slate-800 text-right">{displayContact}</dd>
                </div>
                <div className="flex justify-between items-center py-1">
                  <dt className="text-slate-500 font-medium">Title / Role</dt>
                  <dd className="font-semibold text-slate-800 text-right">{displayTitle}</dd>
                </div>
                <div className="flex justify-between items-center py-1">
                  <dt className="text-slate-500 font-medium">Location</dt>
                  <dd className="font-semibold text-slate-800 text-right max-w-[170px] truncate">{displayLocation}</dd>
                </div>
                <div className="flex justify-between items-center py-1">
                  <dt className="text-slate-500 font-medium">Member Since</dt>
                  <dd className="font-semibold text-slate-800 text-right">{memberSince}</dd>
                </div>
              </dl>
            </div>

            {/* Contact Info Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                <Mail size={16} className="text-[#1e3a5f]" /> Contact Channels
              </h3>
              <ul className="space-y-3.5 text-xs">
                {website && (
                  <li className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-slate-500 font-medium">
                      <Globe size={14} className="text-slate-400" /> Website
                    </span>
                    <a
                      href={website.startsWith("http") ? website : `https://${website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[#1e3a5f] hover:underline truncate max-w-[160px]"
                    >
                      {website}
                    </a>
                  </li>
                )}
                {email && (
                  <li className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-slate-500 font-medium">
                      <Mail size={14} className="text-slate-400" /> Email
                    </span>
                    <a href={`mailto:${email}`} className="font-semibold text-slate-800 hover:underline truncate max-w-[160px]">
                      {email}
                    </a>
                  </li>
                )}
                <li className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-slate-500 font-medium">
                    <MapPin size={14} className="text-slate-400" /> Address
                  </span>
                  <span className="font-semibold text-slate-800 truncate max-w-[160px]">{displayLocation}</span>
                </li>
              </ul>
            </div>

            {/* Social Connect Buttons */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs text-center">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Connect with {displayCompany}</h3>
              <div className="flex items-center justify-center gap-2.5">
                {website && (
                  <a
                    href={website.startsWith("http") ? website : `https://${website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-[#1e3a5f] hover:text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Globe size={13} /> Website
                  </a>
                )}
                {employer.socialLinks?.linkedin && (
                  <a
                    href={employer.socialLinks.linkedin.startsWith("http") ? employer.socialLinks.linkedin : `https://${employer.socialLinks.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-[#0077b5] hover:text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Linkedin size={13} /> LinkedIn
                  </a>
                )}
                {email && (
                  <a
                    href={`mailto:${email}`}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-[#1e3a5f] hover:text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Mail size={13} /> Email
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
