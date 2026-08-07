"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { freelancersApi, jobsApi } from "@/lib/api";
import { User, Job } from "@/types";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import {
  MapPin,
  Building2,
  Globe,
  Mail,
  Phone,
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
  Tag,
  Clock,
  DollarSign,
  Gift,
  Quote,
  Building,
} from "lucide-react";
import { Linkedin } from "@/components/ui/BrandIcons";
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
  const [allEmployerJobs, setAllEmployerJobs] = useState<Job[]>([]);
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
          setAllEmployerJobs(empJobs);
          setActiveJobs(empJobs.filter(j => j.status !== "closed"));
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
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      success("Profile link copied!");
    }
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

  // Dynamic Data Binding with Clean Fallbacks
  const displayCompany = employer.company || employer.name || "Company Profile";
  const displayTagline = employer.tagline || employer.title || "";
  const displayLocation = employer.location || "";
  const displayCompanySize = employer.companySize || "";
  const displayFounded = employer.foundedYear || "";
  const displayIndustry = employer.industry || employer.category || "";
  const displayPhone = employer.phone || "";
  const displayContactEmail = employer.contactEmail || employer.email || "";
  const displayWebsite = employer.socialLinks?.website || "";
  const displayQuote = employer.companyQuote || "";
  const bannerUrl = employer.bannerUrl;

  const memberSince = employer.createdAt
    ? new Date(employer.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "Recently";

  const specialties = (employer.specialties && employer.specialties.length > 0)
    ? employer.specialties
    : (employer.skills && employer.skills.length > 0)
    ? employer.skills
    : [];

  const perksAndBenefits = (employer.perksAndBenefits && employer.perksAndBenefits.length > 0)
    ? employer.perksAndBenefits
    : [];

  const totalHires = employer.totalHires !== undefined ? employer.totalHires : allEmployerJobs.length;
  const avgResponse = employer.avgResponseTime || employer.responseTime || "within 24 hours";
  const repeatHireRate = employer.repeatHireRate !== undefined ? employer.repeatHireRate : 0;
  const onTimePayment = employer.onTimePaymentRate !== undefined ? employer.onTimePaymentRate : 100;
  const hireRate = employer.repeatClientsRate !== undefined ? employer.repeatClientsRate : 0;

  const aboutText = employer.bio || "";

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16">
      {/* ── BREADCRUMB ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link href="/" className="hover:text-slate-800 transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link href="/jobs" className="hover:text-slate-800 transition-colors">Employers</Link>
            <ChevronRight size={12} />
            <span className="text-slate-900 font-semibold truncate max-w-[200px]">{displayCompany}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ── HEADER COVER BANNER & LOGO CARD ───────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
          {/* Cover Banner Image / Dark Slate Gradient */}
          <div
            className="relative h-44 sm:h-52 md:h-60 bg-gradient-to-r from-slate-900 via-[#1e3a5f] to-indigo-950 bg-cover bg-center"
            style={bannerUrl ? { backgroundImage: `url(${bannerUrl})` } : undefined}
          >
            {!bannerUrl && (
              <div className="w-full h-full flex items-center justify-center opacity-15 text-white font-extrabold text-xl tracking-widest uppercase select-none">
                {displayCompany}
              </div>
            )}
          </div>

          {/* Profile Details Block with Overlapping Avatar */}
          <div className="p-6 pt-0 relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 min-w-0">
                {/* Overlapping Company Logo Avatar */}
                <div className="relative -mt-12 sm:-mt-16 flex-shrink-0">
                  {employer.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={employer.avatar}
                      alt={displayCompany}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-4 ring-white shadow-md bg-white"
                    />
                  ) : (
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-[#1e3a5f] to-[#0b192c] text-white font-extrabold text-3xl flex items-center justify-center ring-4 ring-white shadow-md uppercase">
                      {displayCompany.charAt(0)}
                    </div>
                  )}
                  <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 ring-2 ring-white flex items-center justify-center shadow-xs">
                    <CheckCircle2 size={13} className="text-white" />
                  </span>
                </div>

                <div className="min-w-0 flex-1 space-y-1 pt-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                      {displayCompany}
                    </h1>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
                      <ShieldCheck size={12} /> Verified Employer
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-medium text-slate-600 leading-snug">
                    {displayTagline}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pt-1 font-normal">
                    <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200/60">
                      <Users size={12} className="text-slate-400" /> {displayCompanySize}
                    </span>
                    <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200/60">
                      <MapPin size={12} className="text-slate-400" /> {displayLocation}
                    </span>
                    <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200/60">
                      <Calendar size={12} className="text-slate-400" /> Member since {memberSince}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex sm:flex-row md:flex-col items-center gap-2.5 w-full md:w-auto flex-shrink-0">
                <button
                  onClick={() => setFollowing(!following)}
                  className={`w-full sm:w-auto py-2.5 px-5 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border-0 ${
                    following
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-[#1e3a5f] hover:bg-[#152a45] text-white shadow-xs"
                  }`}
                >
                  <Heart size={14} className={following ? "fill-emerald-600 text-emerald-600" : ""} />
                  <span>{following ? "Following" : "Follow"}</span>
                </button>

                <button
                  onClick={copyLink}
                  className="w-full sm:w-auto py-2.5 px-5 rounded-xl font-medium text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer border-0"
                >
                  <Share2 size={14} />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── MAIN CONTENT GRID ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">

          {/* ── LEFT COLUMN ──────────────────────────────────────────────── */}
          <div className="space-y-6 min-w-0">

            {/* About the Company Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <span className="w-1.5 h-4 bg-[#1e3a5f] rounded-full inline-block" /> About the Company
              </div>
              
              {aboutText ? (
                <div className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal whitespace-pre-line space-y-3">
                  {aboutText}
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-slate-400 italic font-normal">
                  No company description provided yet.
                </p>
              )}

              {displayQuote && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-2 mt-4">
                  <Quote size={20} className="text-[#1e3a5f] opacity-40" />
                  <p className="text-xs sm:text-sm font-medium italic text-slate-800 leading-relaxed">
                    “{displayQuote}”
                  </p>
                </div>
              )}
            </div>

            {/* Specialties Section */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3.5">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <span className="w-1.5 h-4 bg-[#1e3a5f] rounded-full inline-block" /> Specialties
              </div>
              {specialties.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No specialties listed yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {specialties.map((spec) => (
                    <span
                      key={spec}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200/60 text-xs font-medium"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Benefits & Perks Section */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3.5">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <span className="w-1.5 h-4 bg-[#1e3a5f] rounded-full inline-block" /> Benefits & Perks
              </div>
              {perksAndBenefits.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No benefits or perks listed yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {perksAndBenefits.map((perk, i) => (
                    <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50/60 border border-slate-200/60 text-xs text-slate-800 font-medium">
                      <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0" />
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Freelancer Reviews Section */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <span className="w-1.5 h-4 bg-[#1e3a5f] rounded-full inline-block" /> Freelancer Reviews
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                  <Star size={14} className="fill-amber-400 text-amber-400" /> 0 (0)
                </div>
              </div>

              <div className="p-6 text-center bg-slate-50/60 rounded-2xl border border-slate-200/60 space-y-1">
                <p className="text-xs sm:text-sm font-semibold text-slate-700">No reviews yet.</p>
                <p className="text-xs text-slate-500 font-normal">Reviews from freelancers who worked here will appear here.</p>
              </div>
            </div>

            {/* Active Job Openings Carousel */}
            {activeJobs.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                <AutoScrollCarousel
                  title={`Open Jobs at ${displayCompany}`}
                  subtitle={`${activeJobs.length} active openings`}
                >
                  {activeJobs.map(j => (
                    <div key={j._id} className="w-72 sm:w-80 flex-shrink-0">
                      <FeaturedJobCard job={j} />
                    </div>
                  ))}
                </AutoScrollCarousel>
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN (SIDEBAR MODULES) ─────────────────────────────── */}
          <aside className="space-y-6 lg:sticky lg:top-6 lg:w-[360px] flex-shrink-0 w-full">

            {/* 1. EMPLOYER STATS CARD */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 pb-1 border-b border-slate-100">
                <span className="w-1.5 h-4 bg-[#1e3a5f] rounded-full inline-block" /> Employer Stats
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <p className="text-xs text-slate-400 font-normal">Jobs Posted</p>
                  <p className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">{allEmployerJobs.length || 4}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <p className="text-xs text-slate-400 font-normal">Active Jobs</p>
                  <p className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">{activeJobs.length || 4}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <p className="text-xs text-slate-400 font-normal">Hire Rate</p>
                  <p className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">{hireRate}%</p>
                </div>
              </div>
            </div>

            {/* 2. COMPANY INFO SIDEBAR CARD */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3.5">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 pb-1 border-b border-slate-100">
                <span className="w-1.5 h-4 bg-[#1e3a5f] rounded-full inline-block" /> Company Info
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span className="flex items-center gap-2 text-slate-400 font-normal"><Tag size={14} /> Industry</span>
                  <span className="font-medium text-slate-800">{displayIndustry}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="flex items-center gap-2 text-slate-400 font-normal"><Users size={14} /> Size</span>
                  <span className="font-medium text-slate-800">{displayCompanySize}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="flex items-center gap-2 text-slate-400 font-normal"><Calendar size={14} /> Founded</span>
                  <span className="font-medium text-slate-800">{displayFounded}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="flex items-center gap-2 text-slate-400 font-normal"><Star size={14} /> Overall Rating</span>
                  <span className="font-medium text-slate-800">No ratings yet</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 italic text-center pt-1 font-normal">Be the first to work with this employer</p>
            </div>

            {/* 3. BUSINESS DETAILS CARD */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3 text-xs">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 pb-1 border-b border-slate-100">
                <span className="w-1.5 h-4 bg-[#1e3a5f] rounded-full inline-block" /> Business Details
              </div>
              
              <div className="space-y-2.5">
                <div>
                  <dt className="text-[11px] text-slate-400 font-normal">Company Name</dt>
                  <dd className="font-medium text-slate-900 text-xs sm:text-sm mt-0.5">{displayCompany || "—"}</dd>
                </div>
                <div>
                  <dt className="text-[11px] text-slate-400 font-normal">Industry</dt>
                  <dd className="font-medium text-slate-800 text-xs mt-0.5">{displayIndustry || "—"}</dd>
                </div>
                <div>
                  <dt className="text-[11px] text-slate-400 font-normal">Company Size</dt>
                  <dd className="font-medium text-slate-800 text-xs mt-0.5">{displayCompanySize || "—"}</dd>
                </div>
                <div>
                  <dt className="text-[11px] text-slate-400 font-normal">Founded</dt>
                  <dd className="font-medium text-slate-800 text-xs mt-0.5">{displayFounded || "—"}</dd>
                </div>
                <div>
                  <dt className="text-[11px] text-slate-400 font-normal">Member Since</dt>
                  <dd className="font-medium text-slate-800 text-xs mt-0.5">{memberSince}</dd>
                </div>
                <div>
                  <dt className="text-[11px] text-slate-400 font-normal">Headquarters</dt>
                  <dd className="font-medium text-slate-800 text-xs mt-0.5">{displayLocation || "—"}</dd>
                </div>
              </div>
            </div>

            {/* 4. CONTACT INFO CARD */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3 text-xs">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 pb-1 border-b border-slate-100">
                <span className="w-1.5 h-4 bg-[#1e3a5f] rounded-full inline-block" /> Contact Info
              </div>
              
              <div className="space-y-2.5">
                <div>
                  <dt className="text-[11px] text-slate-400 font-normal flex items-center gap-1.5"><Globe size={13} /> Website</dt>
                  <dd className="font-medium text-indigo-600 text-xs mt-0.5 truncate">
                    {displayWebsite && displayWebsite !== "—" ? (
                      <a
                        href={displayWebsite.startsWith("http") ? displayWebsite : `https://${displayWebsite}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline text-indigo-600"
                      >
                        {displayWebsite}
                      </a>
                    ) : (
                      "—"
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] text-slate-400 font-normal flex items-center gap-1.5"><Mail size={13} /> Email</dt>
                  <dd className="font-medium text-slate-800 text-xs mt-0.5 truncate">
                    {displayContactEmail && displayContactEmail !== "—" ? (
                      <a
                        href={`mailto:${displayContactEmail}`}
                        className="hover:underline text-[#1e3a5f] hover:text-indigo-600"
                      >
                        {displayContactEmail}
                      </a>
                    ) : (
                      "—"
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] text-slate-400 font-normal flex items-center gap-1.5"><Phone size={13} /> Phone</dt>
                  <dd className="font-medium text-slate-800 text-xs mt-0.5">
                    {displayPhone && displayPhone !== "—" ? (
                      <a
                        href={`tel:${displayPhone.replace(/\s+/g, "")}`}
                        className="hover:underline text-slate-800 hover:text-indigo-600"
                      >
                        {displayPhone}
                      </a>
                    ) : (
                      "—"
                    )}
                  </dd>
                </div>
              </div>
            </div>

            {/* 5. TRACK RECORD CARD */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3 text-xs">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 pb-1 border-b border-slate-100">
                <span className="w-1.5 h-4 bg-[#1e3a5f] rounded-full inline-block" /> Track Record
              </div>
              
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-slate-600">
                  <span className="text-slate-400 font-normal">Total hires</span>
                  <span className="font-medium text-slate-800">{totalHires}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="text-slate-400 font-normal">Avg. response</span>
                  <span className="font-medium text-slate-800">{avgResponse}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="text-slate-400 font-normal">Repeat hire rate</span>
                  <span className="font-medium text-slate-800">{repeatHireRate}%</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="text-slate-400 font-normal">On-time payment</span>
                  <span className="font-medium text-slate-800">{onTimePayment}%</span>
                </div>
              </div>
            </div>

            {/* 6. CONNECT CARD */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <span className="w-1.5 h-4 bg-[#1e3a5f] rounded-full inline-block" /> Connect
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {displayWebsite && (
                  <a
                    href={displayWebsite.startsWith("http") ? displayWebsite : `https://${displayWebsite}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Globe size={13} className="text-indigo-600" /> Website
                  </a>
                )}
                <a
                  href={`https://www.linkedin.com/company/${encodeURIComponent(displayCompany)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Linkedin size={13} className="text-blue-600" /> LinkedIn
                </a>
              </div>
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
}
