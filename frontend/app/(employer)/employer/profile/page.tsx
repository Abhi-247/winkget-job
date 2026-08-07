"use client";

import { useState, useEffect, useRef, FormEvent, ChangeEvent } from "react";
import { useSession } from "next-auth/react";
import { authApi, jobsApi } from "@/lib/api";
import { User, Job } from "@/types";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { useToast } from "@/components/ui/Toast";
import { cn, compressImage } from "@/lib/utils";
import {
  User as UserIcon,
  Camera,
  MapPin,
  Building,
  Building2,
  Globe,
  Edit,
  ExternalLink,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Briefcase,
  TrendingUp,
  Zap,
  Award,
  Star,
  MessageSquare,
  Calendar,
  Users,
  Quote,
  Tag,
  Gift,
} from "lucide-react";
import { Linkedin, Twitter } from "@/components/ui/BrandIcons";
import Link from "next/link";

type SubTabId = "overview" | "edit";

const BANNER_KEY = "winkgetjob_employer_profile_banner";
const DRAFT_KEY = "winkgetjob_employer_profile_edit_draft";

export default function EmployerProfile() {
  const { data: session, update } = useSession();
  const { success, error, info } = useToast();

  const [activeTab, setActiveTab] = useState<SubTabId>("overview");
  const [fullUser, setFullUser] = useState<User | null>(null);
  const [activeJobsCount, setActiveJobsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Profile Edit States
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [tagline, setTagline] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [foundedYear, setFoundedYear] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [bio, setBio] = useState("");
  const [companyQuote, setCompanyQuote] = useState("");
  const [specialtiesInput, setSpecialtiesInput] = useState("");
  const [perksInput, setPerksInput] = useState("");

  // Social Links States
  const [linkedinLink, setLinkedinLink] = useState("");
  const [twitterLink, setTwitterLink] = useState("");
  const [websiteLink, setWebsiteLink] = useState("");

  const [saving, setSaving] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  // Avatar & Banner Preview States
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Fetch full user data on mount
  const fetchUserData = async () => {
    if (!session?.user.accessToken) return;
    try {
      const res = (await authApi.getMe(session.user.accessToken)) as {
        success: boolean;
        user: User;
      };
      if (res.success && res.user) {
        const u = res.user;
        setFullUser(u);
        
        let draft: any = null;
        try {
          const savedDraft = localStorage.getItem(DRAFT_KEY);
          if (savedDraft) {
            draft = JSON.parse(savedDraft);
          }
        } catch { /* ignore */ }

        if (draft) {
          setName(draft.name ?? u.name ?? "");
          setTitle(draft.title ?? u.title ?? "");
          setCompany(draft.company ?? u.company ?? "");
          setTagline(draft.tagline ?? u.tagline ?? "");
          setIndustry(draft.industry ?? u.industry ?? u.category ?? "");
          setCompanySize(draft.companySize ?? u.companySize ?? "");
          setFoundedYear(draft.foundedYear ?? u.foundedYear ?? "");
          setLocation(draft.location ?? u.location ?? "");
          setPhone(draft.phone ?? u.phone ?? "");
          setContactEmail(draft.contactEmail ?? u.contactEmail ?? u.email ?? "");
          setBio(draft.bio ?? u.bio ?? "");
          setCompanyQuote(draft.companyQuote ?? u.companyQuote ?? "");
          setSpecialtiesInput(draft.specialties ? (Array.isArray(draft.specialties) ? draft.specialties.join(", ") : draft.specialties) : (u.specialties || u.skills || []).join(", "));
          setPerksInput(draft.perksAndBenefits ? (Array.isArray(draft.perksAndBenefits) ? draft.perksAndBenefits.join(", ") : draft.perksAndBenefits) : (u.perksAndBenefits || []).join(", "));
          
          setLinkedinLink(draft.linkedin ?? u.socialLinks?.linkedin ?? "");
          setTwitterLink(draft.twitter ?? u.socialLinks?.twitter ?? "");
          setWebsiteLink(draft.website ?? u.socialLinks?.website ?? "");
          setHasDraft(true);
        } else {
          setName(u.name || "");
          setTitle(u.title || "");
          setCompany(u.company || "");
          setTagline(u.tagline || "");
          setIndustry(u.industry || u.category || "");
          setCompanySize(u.companySize || "");
          setFoundedYear(u.foundedYear || "");
          setLocation(u.location || "");
          setPhone(u.phone || "");
          setContactEmail(u.contactEmail || u.email || "");
          setBio(u.bio || "");
          setCompanyQuote(u.companyQuote || "");
          setSpecialtiesInput((u.specialties && u.specialties.length > 0 ? u.specialties : (u.skills && u.skills.length > 0 ? u.skills : [])).join(", "));
          setPerksInput((u.perksAndBenefits && u.perksAndBenefits.length > 0 ? u.perksAndBenefits : []).join(", "));
          
          setLinkedinLink(u.socialLinks?.linkedin || "");
          setTwitterLink(u.socialLinks?.twitter || "");
          setWebsiteLink(u.socialLinks?.website || "");
          setHasDraft(false);
        }
        setAvatarPreview(u.avatar || null);
        setBannerUrl(u.bannerUrl || null);

        // Fetch count of active jobs for stats
        try {
          const jobsRes = (await jobsApi.getJobs()) as { data: Job[] };
          const jobs = jobsRes.data || [];
          const count = jobs.filter((j) => {
            const empObj = typeof j.employer === "object" ? j.employer : null;
            return empObj?._id === u._id || (u.company && j.companyName === u.company);
          }).length;
          setActiveJobsCount(count);
        } catch {
          /* non-critical */
        }
      }
    } catch (err) {
      error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [session]);

  // Handle Banner Upload
  const handleBannerChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      error("Banner must be under 4MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        const compressedBase64 = await compressImage(base64, 800, 300, 0.7);
        setBannerUrl(compressedBase64);
        if (session?.user.accessToken) {
          await authApi.updateMe(session.user.accessToken, { bannerUrl: compressedBase64 });
        }
        success("Cover banner updated successfully");
        fetchUserData();
      } catch {
        error("Failed to upload banner");
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Handle Avatar Upload
  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      error("Photo must be under 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        const compressedBase64 = await compressImage(base64, 150, 150, 0.7);
        setAvatarPreview(compressedBase64);
        if (!session?.user.accessToken) return;
        await authApi.updateMe(session.user.accessToken, { avatar: compressedBase64 });
        success("Company logo updated successfully");
        fetchUserData();
      } catch (err) {
        error("Failed to upload photo");
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleDiscardChanges = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch { /* ignore */ }
    setHasDraft(false);
    fetchUserData();
    info("Unsaved edits discarded");
  };

  // Save changes to Backend API
  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!session?.user.accessToken) return;
    setSaving(true);
    try {
      const specialtiesArray = specialtiesInput
        ? specialtiesInput.split(",").map(s => s.trim()).filter(Boolean)
        : [];
      const perksArray = perksInput
        ? perksInput.split(",").map(s => s.trim()).filter(Boolean)
        : [];

      await authApi.updateMe(session.user.accessToken, {
        name,
        title,
        company,
        tagline,
        industry,
        companySize,
        foundedYear,
        location,
        phone,
        contactEmail,
        bio,
        companyQuote,
        specialties: specialtiesArray,
        perksAndBenefits: perksArray,
        skills: specialtiesArray,
        socialLinks: {
          linkedin: linkedinLink,
          twitter: twitterLink,
          website: websiteLink,
        },
        ...(bannerUrl && { bannerUrl }),
      });
      
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch { /* ignore */ }
      setHasDraft(false);

      await update({ name });
      success("Company profile updated successfully");
      fetchUserData();
      setActiveTab("overview");
    } catch (err) {
      error("Failed to update company profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1e3a5f]"></div>
      </div>
    );
  }

  const displayCompany = company || fullUser?.company || fullUser?.name || "Company Profile";
  const displayTagline = tagline || fullUser?.tagline || fullUser?.title || "";
  const displayLocation = location || fullUser?.location || "";
  const displayCompanySize = companySize || fullUser?.companySize || "";
  const displayFounded = foundedYear || fullUser?.foundedYear || "";
  const displayIndustry = industry || fullUser?.industry || fullUser?.category || "";
  const memberSince = fullUser?.createdAt
    ? new Date(fullUser.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "Recently";

  const specialtiesList = specialtiesInput
    ? specialtiesInput.split(",").map((s) => s.trim()).filter(Boolean)
    : fullUser?.specialties && fullUser.specialties.length > 0
    ? fullUser.specialties
    : fullUser?.skills && fullUser.skills.length > 0
    ? fullUser.skills
    : [];

  const perksList = perksInput
    ? perksInput.split(",").map((s) => s.trim()).filter(Boolean)
    : fullUser?.perksAndBenefits && fullUser.perksAndBenefits.length > 0
    ? fullUser.perksAndBenefits
    : [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage your company details, cover banner, brand presence, culture quote, and contact info.
          </p>
        </div>
        <nav className="flex space-x-4">
          {(["overview", "edit"] as SubTabId[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "pb-2 text-sm font-medium capitalize border-b-2 transition-colors cursor-pointer",
                activeTab === tab
                  ? "border-[#1e3a5f] text-[#1e3a5f] font-semibold"
                  : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300"
              )}
            >
              {tab === "edit" ? "Edit Profile" : "View Overview"}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content Panel */}
      <div>
        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Header Cover Banner & Logo Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
              {/* Cover Banner Image / Gradient */}
              <div
                className="relative h-44 sm:h-52 bg-gradient-to-r from-slate-900 via-[#1e3a5f] to-indigo-950 bg-cover bg-center"
                style={bannerUrl ? { backgroundImage: `url(${bannerUrl})` } : undefined}
              >
                {!bannerUrl && (
                  <div className="w-full h-full flex items-center justify-center opacity-15 text-white font-extrabold text-xl tracking-widest uppercase select-none">
                    {displayCompany}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => bannerInputRef.current?.click()}
                  className="absolute bottom-3 right-3 p-2 bg-black/50 hover:bg-black/75 backdrop-blur-md rounded-xl text-white text-xs font-medium cursor-pointer flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Camera size={14} /> Change Cover Banner
                </button>
                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBannerChange}
                  className="hidden"
                />
              </div>

              {/* Profile Details Block with Overlapping Avatar */}
              <div className="p-6 pt-0 relative">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 min-w-0">
                    {/* Overlapping Company Logo Avatar */}
                    <div className="relative -mt-12 sm:-mt-16 flex-shrink-0">
                      {avatarPreview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={avatarPreview}
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

                  <div className="flex flex-row items-center gap-1.5 sm:gap-2 flex-shrink-0">
                    <Button
                      onClick={() => setActiveTab("edit")}
                      className="bg-[#1e3a5f] hover:bg-[#152a45] text-white text-[11px] sm:text-xs font-semibold rounded-xl px-2.5 sm:px-3.5 py-2 flex items-center gap-1 sm:gap-1.5 whitespace-nowrap"
                    >
                      <Edit size={13} className="flex-shrink-0" /> Edit Details
                    </Button>
                    {fullUser && (
                      <Link href={`/employer-profile/${fullUser._id}`} target="_blank" className="flex-shrink-0">
                        <Button variant="outline" className="text-[11px] sm:text-xs font-medium rounded-xl px-2.5 sm:px-3 py-2 flex items-center gap-1 sm:gap-1.5 whitespace-nowrap">
                          <ExternalLink size={12} className="flex-shrink-0" /> Public Profile
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Overview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
              {/* Left Details */}
              <div className="space-y-6 min-w-0">
                {/* About Company */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <span className="w-1.5 h-4 bg-[#1e3a5f] rounded-full inline-block" /> About the Company
                  </div>
                  {bio ? (
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal whitespace-pre-line">
                      {bio}
                    </p>
                  ) : (
                    <p className="text-xs sm:text-sm text-slate-400 italic font-normal">
                      No company description added yet. Click &apos;Edit Details&apos; to add information about your company.
                    </p>
                  )}
                  {companyQuote && (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-2 mt-4">
                      <Quote size={20} className="text-[#1e3a5f] opacity-40" />
                      <p className="text-xs sm:text-sm font-medium italic text-slate-800 leading-relaxed">
                        “{companyQuote}”
                      </p>
                    </div>
                  )}
                </div>

                {/* Specialties */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3.5">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <span className="w-1.5 h-4 bg-[#1e3a5f] rounded-full inline-block" /> Specialties
                  </div>
                  {specialtiesList.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No specialties added yet.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {specialtiesList.map((spec) => (
                        <span key={spec} className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200/60 text-xs font-medium">
                          {spec}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Benefits */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3.5">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <span className="w-1.5 h-4 bg-[#1e3a5f] rounded-full inline-block" /> Benefits & Perks
                  </div>
                  {perksList.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No benefits or perks added yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {perksList.map((perk, i) => (
                        <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50/60 border border-slate-200/60 text-xs text-slate-800 font-medium">
                          <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0" />
                          <span>{perk}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Sidebar Info */}
              <aside className="space-y-6 flex-shrink-0 w-full">
                {/* Stats */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900 pb-1 border-b border-slate-100">
                    <span className="w-1.5 h-4 bg-[#1e3a5f] rounded-full inline-block" /> Employer Stats
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                      <p className="text-xs text-slate-400 font-normal">Jobs Posted</p>
                      <p className="text-base font-bold text-slate-900 mt-0.5">{activeJobsCount}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                      <p className="text-xs text-slate-400 font-normal">Active Jobs</p>
                      <p className="text-base font-bold text-slate-900 mt-0.5">{activeJobsCount}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                      <p className="text-xs text-slate-400 font-normal">Hire Rate</p>
                      <p className="text-base font-bold text-slate-900 mt-0.5">{fullUser?.repeatHireRate ? `${fullUser.repeatHireRate}%` : "100%"}</p>
                    </div>
                  </div>
                </div>

                {/* Business Details */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900 pb-1 border-b border-slate-100">
                    <span className="w-1.5 h-4 bg-[#1e3a5f] rounded-full inline-block" /> Business Details
                  </div>
                  
                  <div className="space-y-2.5">
                    <div>
                      <dt className="text-[11px] text-slate-400 font-normal">Company Name</dt>
                      <dd className="font-medium text-slate-900 mt-0.5">{displayCompany || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] text-slate-400 font-normal">Industry</dt>
                      <dd className="font-medium text-slate-800 mt-0.5">{displayIndustry || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] text-slate-400 font-normal">Company Size</dt>
                      <dd className="font-medium text-slate-800 mt-0.5">{displayCompanySize || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] text-slate-400 font-normal">Founded</dt>
                      <dd className="font-medium text-slate-800 mt-0.5">{displayFounded || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] text-slate-400 font-normal">Headquarters</dt>
                      <dd className="font-medium text-slate-800 mt-0.5">{displayLocation || "—"}</dd>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900 pb-1 border-b border-slate-100">
                    <span className="w-1.5 h-4 bg-[#1e3a5f] rounded-full inline-block" /> Contact Info
                  </div>
                  
                  <div className="space-y-2.5">
                    <div>
                      <dt className="text-[11px] text-slate-400 font-normal flex items-center gap-1.5"><Globe size={13} /> Website</dt>
                      <dd className="font-medium text-indigo-600 mt-0.5 truncate">
                        {websiteLink && websiteLink !== "—" ? (
                          <a
                            href={websiteLink.startsWith("http") ? websiteLink : `https://${websiteLink}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline text-indigo-600"
                          >
                            {websiteLink}
                          </a>
                        ) : (
                          "—"
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] text-slate-400 font-normal flex items-center gap-1.5"><Mail size={13} /> Email</dt>
                      <dd className="font-medium text-slate-800 mt-0.5 truncate">
                        {(contactEmail || fullUser?.email) && (contactEmail || fullUser?.email) !== "—" ? (
                          <a
                            href={`mailto:${contactEmail || fullUser?.email}`}
                            className="hover:underline text-[#1e3a5f] hover:text-indigo-600"
                          >
                            {contactEmail || fullUser?.email}
                          </a>
                        ) : (
                          "—"
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] text-slate-400 font-normal flex items-center gap-1.5"><Phone size={13} /> Phone</dt>
                      <dd className="font-medium text-slate-800 mt-0.5">
                        {phone && phone !== "—" ? (
                          <a
                            href={`tel:${phone.replace(/\s+/g, "")}`}
                            className="hover:underline text-slate-800 hover:text-indigo-600"
                          >
                            {phone}
                          </a>
                        ) : (
                          "—"
                        )}
                      </dd>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        )}

        {/* Tab 2: Edit Form */}
        {activeTab === "edit" && (
          <form onSubmit={handleSaveProfile} className="space-y-6 bg-white border border-gray-200 rounded-2xl p-5 sm:p-7 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Edit Company Profile</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  All updates saved here will dynamically reflect on your public employer profile page.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {hasDraft && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleDiscardChanges}
                    className="text-xs h-9 bg-gray-100 text-gray-600 hover:bg-gray-200"
                  >
                    Discard Edits
                  </Button>
                )}
                <Button type="submit" size="sm" loading={saving} className="text-xs h-9 bg-[#1e3a5f] hover:bg-[#152a45]">
                  Save Changes
                </Button>
              </div>
            </div>

            {/* Avatar & Banner Upload */}
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700">Cover & Logo Upload</label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Logo Upload Card */}
                <div className="border border-gray-200/80 rounded-xl p-4 flex items-center gap-4 bg-gray-50/50">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-white shadow-sm border border-gray-150 flex items-center justify-center group flex-shrink-0">
                    {avatarPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarPreview} alt={displayCompany} className="w-full h-full object-cover" />
                    ) : (
                      <Avatar name={displayCompany} size="lg" className="w-full h-full rounded-full" />
                    )}
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Camera size={16} className="text-white" />
                    </button>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Company Logo</h4>
                    <p className="text-[10px] text-gray-400 mt-1">Recommended: 256x256 PNG or JPG under 2MB.</p>
                    <input
                      type="file"
                      ref={avatarInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => avatarInputRef.current?.click()}
                      className="mt-2 text-[10px] h-7"
                    >
                      Choose Logo
                    </Button>
                  </div>
                </div>

                {/* Banner Upload Card */}
                <div className="border border-gray-200/80 rounded-xl p-4 flex items-center gap-4 bg-gray-50/50">
                  <div className="relative w-24 h-14 rounded-lg overflow-hidden bg-gradient-to-tr from-[#152a45] to-[#2c5282] border border-gray-150 flex-shrink-0 flex items-center justify-center group">
                    {bannerUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={bannerUrl} alt="Banner preview" className="w-full h-full object-cover" />
                    ) : (
                      <Building size={20} className="text-white/40" />
                    )}
                    <button
                      type="button"
                      onClick={() => bannerInputRef.current?.click()}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Camera size={16} className="text-white" />
                    </button>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Cover Banner</h4>
                    <p className="text-[10px] text-gray-400 mt-1">Horizontal cover photo. Recommended: under 4MB.</p>
                    <input
                      type="file"
                      ref={bannerInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleBannerChange}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => bannerInputRef.current?.click()}
                      className="mt-2 text-[10px] h-7"
                    >
                      Choose Banner
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Inputs grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Company Name"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Acme Corporation"
                required
                leftIcon={<Building size={16} className="text-gray-400" />}
              />

              <Input
                label="Company Tagline / Headline"
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Empowering businesses through innovative digital solutions"
                leftIcon={<Sparkles size={16} className="text-gray-400" />}
              />

              <Input
                label="Industry"
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. Technology & Software"
                leftIcon={<Tag size={16} className="text-gray-400" />}
              />

              <Input
                label="Company Size"
                type="text"
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                placeholder="e.g. 51–200 employees"
                leftIcon={<Users size={16} className="text-gray-400" />}
              />

              <Input
                label="Founded Year"
                type="text"
                value={foundedYear}
                onChange={(e) => setFoundedYear(e.target.value)}
                placeholder="e.g. 2021"
                leftIcon={<Calendar size={16} className="text-gray-400" />}
              />

              <Input
                label="Headquarters / Location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Mumbai, Maharashtra, India"
                leftIcon={<MapPin size={16} className="text-gray-400" />}
              />

              <Input
                label="Contact Phone Number"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                leftIcon={<Phone size={16} className="text-gray-400" />}
              />

              <Input
                label="Careers / Contact Email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="e.g. careers@company.com"
                leftIcon={<Mail size={16} className="text-gray-400" />}
              />

              <Input
                label="Representative Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                required
                leftIcon={<UserIcon size={16} className="text-gray-400" />}
              />

              <Input
                label="Representative Job Title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Head of Talent & HR"
                leftIcon={<Building2 size={16} className="text-gray-400" />}
              />
            </div>

            {/* About us / Bio */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">About the Company (Detailed Description)</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Describe your company's mission, tools, products, and team culture..."
                rows={5}
                className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] bg-[#f8fafc] placeholder-gray-400/80 transition-all font-medium min-h-[100px]"
              />
            </div>

            {/* Culture Quote */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">Company Culture Quote</label>
              <textarea
                value={companyQuote}
                onChange={(e) => setCompanyQuote(e.target.value)}
                placeholder="e.g. We value ownership, curiosity, and kindness. You'll work with people who care deeply about their craft..."
                rows={2}
                className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] bg-[#f8fafc] placeholder-gray-400/80 transition-all font-medium"
              />
            </div>

            {/* Specialties & Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Specialties (Comma-separated)"
                type="text"
                value={specialtiesInput}
                onChange={(e) => setSpecialtiesInput(e.target.value)}
                placeholder="e.g. Web Development, UI/UX Design, Cloud Infrastructure"
                leftIcon={<Tag size={16} className="text-gray-400" />}
              />

              <Input
                label="Benefits & Perks (Comma-separated)"
                type="text"
                value={perksInput}
                onChange={(e) => setPerksInput(e.target.value)}
                placeholder="e.g. Flexible & hybrid work, Health insurance, Annual learning budget"
                leftIcon={<Gift size={16} className="text-gray-400" />}
              />
            </div>

            {/* Web & Social Presence */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Web & Social Presence</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Website Link"
                  type="text"
                  value={websiteLink}
                  onChange={(e) => setWebsiteLink(e.target.value)}
                  placeholder="e.g. https://www.yourcompany.com"
                  leftIcon={<Globe size={16} className="text-gray-400" />}
                />

                <Input
                  label="LinkedIn URL"
                  type="text"
                  value={linkedinLink}
                  onChange={(e) => setLinkedinLink(e.target.value)}
                  placeholder="e.g. https://linkedin.com/company/yourcompany"
                  leftIcon={<Linkedin size={16} className="text-gray-400" />}
                />

                <Input
                  label="Twitter / X URL"
                  type="text"
                  value={twitterLink}
                  onChange={(e) => setTwitterLink(e.target.value)}
                  placeholder="e.g. https://x.com/yourcompany"
                  leftIcon={<Twitter size={16} className="text-gray-400" />}
                />
              </div>
            </div>

            {/* Submit Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
              {hasDraft && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleDiscardChanges}
                  className="bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-xl"
                >
                  Discard Edits
                </Button>
              )}
              <Button type="submit" loading={saving} className="bg-[#1e3a5f] hover:bg-[#152a45] rounded-xl px-6">
                Save Profile
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
