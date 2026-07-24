"use client";

import { use, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { freelancersApi, reviewsApi, applicationsApi, hireRequestsApi } from "@/lib/api";
import { User } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { StarRating } from "@/components/ui/StarRating";
import { useToast } from "@/components/ui/Toast";
import { HireRequestModal } from "@/components/talent/HireRequestModal";
import { SendMessageModal } from "@/components/talent/SendMessageModal";
import { useSavedJobs } from "@/lib/hooks";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import Link from "next/link";
import {
  MapPin,
  ChevronRight,
  Briefcase,
  Clock,
  Bookmark,
  Share2,
  CheckCircle2,
  Star,
  GraduationCap,
  Award,
  Building,
  Calendar,
  Globe,
  Sparkles,
  ShieldCheck,
  Zap,
  TrendingUp,
  MessageSquare,
  ArrowRight,
  Heart,
  Send,
} from "lucide-react";
import { Linkedin, Github, Twitter } from "@/components/ui/BrandIcons";

interface Props {
  params: Promise<{ id: string }>;
}

export default function FreelancerProfilePage({ params }: Props) {
  const { id } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const { isSaved, toggleSave } = useSavedJobs();

  const [freelancer, setFreelancer] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hireTarget, setHireTarget] = useState<User | null>(null);
  const [messageTarget, setMessageTarget] = useState<User | null>(null);
  const [activeJobsCount, setActiveJobsCount] = useState(0);
  const [hireRequestSent, setHireRequestSent] = useState(false);

  const [reviewsData, setReviewsData] = useState<{
    reviews: any[];
    averageRating: number;
    totalReviews: number;
  }>({ reviews: [], averageRating: 0, totalReviews: 0 });
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    freelancersApi.getById(id)
      .then((res) => {
        const data = (res as { success: boolean; data: User }).data;
        setFreelancer(data);
      })
      .catch(() => setFreelancer(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    setReviewsLoading(true);
    reviewsApi.getUserReviews(id)
      .then((res: any) => {
        if (res.success && res.data) {
          setReviewsData(res.data);
        }
      })
      .catch((err) => console.error("Error fetching reviews:", err))
      .finally(() => setReviewsLoading(false));
  }, [id]);

  useEffect(() => {
    if (!freelancer) return;
    applicationsApi.getMyApplications(session?.user?.accessToken || "")
      .then((res: any) => {
        if (res.success && res.data) {
          const activeApps = res.data.filter((app: any) =>
            app.applicant._id === id && app.status === "accepted"
          );
          setActiveJobsCount(activeApps.length);
        }
      })
      .catch(() => setActiveJobsCount(0));
  }, [freelancer, id, session]);

  useEffect(() => {
    if (!freelancer || !session?.user?.accessToken || session?.user?.role !== "employer") return;
    hireRequestsApi.getEmployerRequests(session.user.accessToken)
      .then((res: any) => {
        if (res.success && res.data) {
          const hasRequest = res.data.some((req: any) =>
            req.jobseeker._id === id
          );
          setHireRequestSent(hasRequest);
        }
      })
      .catch(() => setHireRequestSent(false));
  }, [freelancer, id, session]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    success("Profile link copied!");
  };

  const handleHireRequestSent = () => {
    setHireRequestSent(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#1e3a5f] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading User Profile...</p>
        </div>
      </div>
    );
  }

  if (!freelancer) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="text-center bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-md">
          <Sparkles size={40} className="mx-auto text-slate-400 mb-3" />
          <h2 className="text-lg font-bold text-slate-900 mb-1">User Not Found</h2>
          <p className="text-sm text-slate-500 mb-4">The profile you are looking for does not exist.</p>
          <Link href="/talent">
            <Button variant="outline" size="sm">Browse Talent</Button>
          </Link>
        </div>
      </div>
    );
  }

  const saved = isSaved(freelancer._id);
  const isAvailable = freelancer.availability === "Immediately" || !freelancer.availability;
  const ratingAvg = freelancer.ratingAvg || reviewsData.averageRating || 5.0;
  const ratingCount = freelancer.ratingCount || reviewsData.totalReviews || 0;
  const displayTitle = freelancer.title || "Independent Professional Specialist";
  const displayLocation = freelancer.location || "India";

  const memberSince = freelancer.createdAt
    ? new Date(freelancer.createdAt).toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      })
    : "Recently Joined";

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16">
      {/* ── BREADCRUMB ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/" className="hover:text-slate-800 transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link href="/talent" className="hover:text-slate-800 transition-colors">Talent Pool</Link>
            <ChevronRight size={12} />
            <span className="text-slate-900 font-medium truncate max-w-[200px]">{freelancer.name}</span>
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
                {freelancer.avatar ? (
                  <img
                    src={freelancer.avatar}
                    alt={freelancer.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-[#d4a017]/60 shadow-lg"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#1e3a5f] to-[#0b192c] text-white font-extrabold text-3xl flex items-center justify-center ring-4 ring-[#d4a017]/60 shadow-lg">
                    {freelancer.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 ring-2 ring-[#0b192c] flex items-center justify-center shadow-md">
                  <CheckCircle2 size={13} className="text-white" />
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap mb-1">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                    {freelancer.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300 bg-amber-400/20 border border-amber-400/30 px-2.5 py-0.5 rounded-full backdrop-blur-md">
                    <ShieldCheck size={12} /> Verified Talent
                  </span>
                </div>

                <p className="text-sm text-white/80 font-medium leading-relaxed mb-1">
                  {displayTitle}
                </p>

                {/* Sub-strip Real Meta Pills */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-white/80 mt-2.5">
                  <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                    <MapPin size={13} className="text-blue-400" /> {displayLocation}
                  </span>
                  {freelancer.hourlyRate && (
                    <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                      <Briefcase size={13} className="text-amber-400" /> ₹{freelancer.hourlyRate.toLocaleString("en-IN")}/hr
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                    <Calendar size={13} className="text-emerald-400" /> Member since {memberSince}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons — Responsive Row/Column */}
            <div className="flex flex-col sm:flex-row md:flex-col items-center gap-3 w-full md:w-auto flex-shrink-0">
              {session?.user?.role === "employer" ? (
                <button
                  disabled={hireRequestSent}
                  onClick={() => setHireTarget(freelancer)}
                  className={`w-full sm:w-auto py-3 px-6 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border-0 ${
                    hireRequestSent
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                      : "bg-gradient-to-r from-[#d4a017] via-[#e6b800] to-[#b8860b] hover:from-[#b8860b] hover:to-[#966d09] text-slate-950 shadow-lg shadow-[#d4a017]/25"
                  }`}
                >
                  <Sparkles size={15} />
                  <span>{hireRequestSent ? "Hire Request Sent" : "Hire Talent"}</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (!session) {
                      router.push(`/sign-in?callbackUrl=/talent/${id}`);
                      return;
                    }
                    toastError("Please log in as an employer to hire talent");
                  }}
                  className="w-full sm:w-auto py-3 px-6 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-[#d4a017] via-[#e6b800] to-[#b8860b] hover:from-[#b8860b] hover:to-[#966d09] text-slate-950 shadow-lg shadow-[#d4a017]/25 transition-all flex items-center justify-center gap-2 cursor-pointer border-0"
                >
                  <Sparkles size={15} />
                  <span>Hire Talent</span>
                </button>
              )}

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    if (!session) {
                      router.push(`/sign-in?callbackUrl=/talent/${id}`);
                      return;
                    }
                    setMessageTarget(freelancer);
                  }}
                  className="flex-1 py-3 px-5 rounded-xl font-semibold text-xs text-white/90 bg-white/10 hover:bg-white/20 border border-white/15 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send size={13} />
                  <span>Message</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="py-3 px-4 rounded-xl font-semibold text-xs text-white/90 bg-white/10 hover:bg-white/20 border border-white/15 transition-all flex items-center justify-center cursor-pointer"
                >
                  <Share2 size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── KEY METRICS DASHBOARD BAR ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 shadow-xs flex items-center gap-3 sm:gap-4 group hover:border-amber-200 transition-all">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Star size={20} className="fill-amber-500 text-amber-500 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight truncate">
                ★ {ratingAvg.toFixed(1)}
              </p>
              <p className="text-[11px] sm:text-xs font-medium text-slate-500 leading-tight">Rating ({ratingCount} reviews)</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 shadow-xs flex items-center gap-3 sm:gap-4 group hover:border-blue-200 transition-all">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Briefcase size={20} className="sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight truncate">
                {freelancer.yearsOfExperience || 3}+ Yrs
              </p>
              <p className="text-[11px] sm:text-xs font-medium text-slate-500 leading-tight">Work Experience</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 shadow-xs flex items-center gap-3 sm:gap-4 group hover:border-emerald-200 transition-all">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <TrendingUp size={20} className="sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight truncate">98%</p>
              <p className="text-[11px] sm:text-xs font-medium text-slate-500 leading-tight">Job Success Rate</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 shadow-xs flex items-center gap-3 sm:gap-4 group hover:border-indigo-200 transition-all">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Zap size={20} className="sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight truncate">&lt; 1 hr</p>
              <p className="text-[11px] sm:text-xs font-medium text-slate-500 leading-tight">Response Status</p>
            </div>
          </div>
        </div>

        {/* ── MAIN 2-COLUMN LAYOUT ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
          {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
          <div className="space-y-6 min-w-0">
            {/* About & Bio */}
            {freelancer.bio && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs">
                <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Sparkles size={18} className="text-[#d4a017]" /> About {freelancer.name}
                </h2>
                
                <div className="text-sm text-slate-600 leading-relaxed space-y-3 font-normal whitespace-pre-wrap">
                  <p>{freelancer.bio}</p>
                </div>

                {/* Golden Quote Spotlight */}
                <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border-l-4 border-[#d4a017]">
                  <p className="text-xs font-bold text-[#b8860b] uppercase tracking-wider mb-1">Professional Approach</p>
                  <p className="text-sm italic font-medium text-slate-800 leading-relaxed">
                    &ldquo;Focused on delivering high-quality, scalable solutions with clear communication and fast turnaround times.&rdquo;
                  </p>
                </div>
              </div>
            )}

            {/* Skills & Expertise */}
            {freelancer.skills && freelancer.skills.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs">
                <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Award size={18} className="text-[#1e3a5f]" /> Skills & Tech Stack
                </h2>
                <div className="flex flex-wrap gap-2">
                  {freelancer.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3.5 py-1.5 rounded-full bg-blue-50 text-[#1e3a5f] text-xs font-semibold border border-blue-100"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Work Experience */}
            {freelancer.workExperience && freelancer.workExperience.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs">
                <h2 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2">
                  <Briefcase size={18} className="text-[#1e3a5f]" /> Work Experience
                </h2>
                <div className="space-y-4">
                  {freelancer.workExperience.map((exp, idx) => (
                    <div
                      key={idx}
                      className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-slate-200 transition-all flex items-start gap-4"
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-100/70 text-[#1e3a5f] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Building size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                          <h4 className="text-sm font-bold text-slate-900">{exp.position}</h4>
                          <span className="text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <Calendar size={10} /> {exp.startYear} – {exp.endYear || "Present"}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-[#1e3a5f] mb-2">{exp.company}</p>
                        {exp.description && (
                          <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap font-normal">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {freelancer.education && freelancer.education.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs">
                <h2 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2">
                  <GraduationCap size={18} className="text-[#1e3a5f]" /> Education & Qualifications
                </h2>
                <div className="space-y-4">
                  {freelancer.education.map((edu, idx) => (
                    <div
                      key={idx}
                      className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-start gap-4"
                    >
                      <div className="w-10 h-10 rounded-xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <GraduationCap size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                          <h4 className="text-sm font-bold text-slate-900">{edu.degree} in {edu.fieldOfStudy}</h4>
                          <span className="text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 px-2.5 py-0.5 rounded-full">
                            {edu.startYear} – {edu.endYear}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-700">{edu.school}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Star size={18} className="text-amber-500 fill-amber-500" /> Client Reviews & Testimonials
                </h2>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                  ★ {ratingAvg.toFixed(1)} ({ratingCount} reviews)
                </span>
              </div>

              {reviewsData.reviews && reviewsData.reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviewsData.reviews.map((r: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">{r.reviewer?.name || "Verified Client"}</span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={11}
                              className={s <= r.rating ? "text-amber-400 fill-amber-400" : "text-slate-300"}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-normal">{r.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <MessageSquare size={28} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-semibold text-slate-700 mb-1">No reviews yet</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Reviews from clients and employers who have hired {freelancer.name} will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT COLUMN (STICKY SIDEBAR) ──────────────────────────── */}
          <div className="space-y-6 lg:sticky lg:top-6 flex-shrink-0 w-full">
            {/* Hire Callout Box */}
            <div className="bg-gradient-to-br from-[#0b192c] via-[#1e3a5f] to-[#0f172a] text-white rounded-2xl p-6 shadow-xl border border-white/15 relative overflow-hidden group">
              <div className="relative z-10 space-y-3">
                <p className="text-xs font-bold text-[#d4a017] uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={13} /> Available for Work
                </p>
                <p className="text-2xl font-extrabold text-white">
                  {freelancer.hourlyRate ? `₹${freelancer.hourlyRate.toLocaleString("en-IN")}/hr` : "Negotiable"}
                </p>
                <p className="text-xs text-white/80 leading-relaxed">
                  Ready to collaborate on full-time roles, contract gigs, or micro-tasks.
                </p>

                {session?.user?.role === "employer" ? (
                  <button
                    disabled={hireRequestSent}
                    onClick={() => setHireTarget(freelancer)}
                    className={`w-full py-3 px-4 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border-0 ${
                      hireRequestSent
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                        : "bg-gradient-to-r from-[#d4a017] via-[#e6b800] to-[#b8860b] hover:from-[#b8860b] hover:to-[#966d09] text-slate-950 shadow-md"
                    }`}
                  >
                    <span>{hireRequestSent ? "Hire Request Sent" : "Send Hire Offer"}</span>
                    <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (!session) {
                        router.push(`/sign-in?callbackUrl=/talent/${id}`);
                        return;
                      }
                      toastError("Please log in as an employer to send hire offers");
                    }}
                    className="w-full py-3 px-4 rounded-xl font-extrabold text-xs bg-gradient-to-r from-[#d4a017] via-[#e6b800] to-[#b8860b] hover:from-[#b8860b] hover:to-[#966d09] text-slate-950 transition-all flex items-center justify-center gap-2 cursor-pointer border-0"
                  >
                    <span>Send Hire Offer</span>
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Profile Overview Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#1e3a5f]" /> Profile Summary
              </h3>
              <dl className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-1">
                  <dt className="text-slate-500 font-medium">Location</dt>
                  <dd className="font-semibold text-slate-800 text-right">{displayLocation}</dd>
                </div>
                <div className="flex justify-between items-center py-1">
                  <dt className="text-slate-500 font-medium">Hourly Rate</dt>
                  <dd className="font-semibold text-slate-800 text-right">
                    {freelancer.hourlyRate ? `₹${freelancer.hourlyRate}/hr` : "Negotiable"}
                  </dd>
                </div>
                <div className="flex justify-between items-center py-1">
                  <dt className="text-slate-500 font-medium">Experience</dt>
                  <dd className="font-semibold text-slate-800 text-right">
                    {freelancer.yearsOfExperience !== undefined ? `${freelancer.yearsOfExperience} years` : "3+ years"}
                  </dd>
                </div>
                <div className="flex justify-between items-center py-1">
                  <dt className="text-slate-500 font-medium">Availability</dt>
                  <dd className="font-semibold text-emerald-600 text-right">{freelancer.availability || "Immediately"}</dd>
                </div>
                <div className="flex justify-between items-center py-1">
                  <dt className="text-slate-500 font-medium">Member Since</dt>
                  <dd className="font-semibold text-slate-800 text-right">{memberSince}</dd>
                </div>
              </dl>
            </div>

            {/* Social Links */}
            {freelancer.socialLinks && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs text-center">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Portfolio & Social Links</h3>
                <div className="flex items-center justify-center gap-2.5">
                  {freelancer.socialLinks.website && (
                    <a
                      href={freelancer.socialLinks.website.startsWith("http") ? freelancer.socialLinks.website : `https://${freelancer.socialLinks.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-[#1e3a5f] hover:text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
                    >
                      <Globe size={13} /> Website
                    </a>
                  )}
                  {freelancer.socialLinks.github && (
                    <a
                      href={freelancer.socialLinks.github.startsWith("http") ? freelancer.socialLinks.github : `https://${freelancer.socialLinks.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-900 hover:text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
                    >
                      <Github size={13} /> GitHub
                    </a>
                  )}
                  {freelancer.socialLinks.linkedin && (
                    <a
                      href={freelancer.socialLinks.linkedin.startsWith("http") ? freelancer.socialLinks.linkedin : `https://${freelancer.socialLinks.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-[#0077b5] hover:text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
                    >
                      <Linkedin size={13} /> LinkedIn
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {hireTarget && (
        <HireRequestModal
          freelancer={hireTarget}
          onClose={() => setHireTarget(null)}
          onSuccess={handleHireRequestSent}
        />
      )}

      {messageTarget && (
        <SendMessageModal
          freelancer={messageTarget}
          onClose={() => setMessageTarget(null)}
        />
      )}
    </div>
  );
}
