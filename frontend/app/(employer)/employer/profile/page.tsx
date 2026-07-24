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
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  
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
          setLocation(draft.location ?? u.location ?? "");
          setBio(draft.bio ?? u.bio ?? "");
          setSkillsInput(draft.skills ? (Array.isArray(draft.skills) ? draft.skills.join(", ") : draft.skills) : (u.skills || []).join(", "));
          
          setLinkedinLink(draft.linkedin ?? u.socialLinks?.linkedin ?? "");
          setTwitterLink(draft.twitter ?? u.socialLinks?.twitter ?? "");
          setWebsiteLink(draft.website ?? u.socialLinks?.website ?? "");
          setHasDraft(true);
        } else {
          setName(u.name || "");
          setTitle(u.title || "");
          setCompany(u.company || "");
          setLocation(u.location || "");
          setBio(u.bio || "");
          setSkillsInput((u.skills || []).join(", "));
          
          setLinkedinLink(u.socialLinks?.linkedin || "");
          setTwitterLink(u.socialLinks?.twitter || "");
          setWebsiteLink(u.socialLinks?.website || "");
          setHasDraft(false);
        }
        setAvatarPreview(u.avatar || null);

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
    
    // Restore banner from localStorage
    try {
      const saved = localStorage.getItem(BANNER_KEY);
      if (saved) setBannerUrl(saved);
    } catch { /* ignore */ }
  }, [session]);

  // Save draft to localStorage whenever fields change
  useEffect(() => {
    if (loading || !fullUser) return;
    
    const isModified = 
      name !== (fullUser.name || "") ||
      title !== (fullUser.title || "") ||
      company !== (fullUser.company || "") ||
      location !== (fullUser.location || "") ||
      bio !== (fullUser.bio || "") ||
      skillsInput !== ((fullUser.skills || []).join(", ")) ||
      linkedinLink !== (fullUser.socialLinks?.linkedin || "") ||
      twitterLink !== (fullUser.socialLinks?.twitter || "") ||
      websiteLink !== (fullUser.socialLinks?.website || "");

    if (isModified) {
      const draft = {
        name,
        title,
        company,
        location,
        bio,
        skills: skillsInput,
        linkedin: linkedinLink,
        twitter: twitterLink,
        website: websiteLink,
      };
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        setHasDraft(true);
      } catch { /* ignore */ }
    } else {
      try {
        localStorage.removeItem(DRAFT_KEY);
        setHasDraft(false);
      } catch { /* ignore */ }
    }
  }, [
    loading,
    fullUser,
    name,
    title,
    company,
    location,
    bio,
    skillsInput,
    linkedinLink,
    twitterLink,
    websiteLink,
  ]);

  // Handle Banner Upload
  const handleBannerChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      error("Banner must be under 4MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setBannerUrl(base64);
      try {
        localStorage.setItem(BANNER_KEY, base64);
      } catch { /* ignore */ }
      success("Banner updated");
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
    
    if (fullUser) {
      const u = fullUser;
      setName(u.name || "");
      setTitle(u.title || "");
      setCompany(u.company || "");
      setLocation(u.location || "");
      setBio(u.bio || "");
      setSkillsInput((u.skills || []).join(", "));
      setLinkedinLink(u.socialLinks?.linkedin || "");
      setTwitterLink(u.socialLinks?.twitter || "");
      setWebsiteLink(u.socialLinks?.website || "");
    }
    info("Unsaved edits discarded");
  };

  // Save changes
  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!session?.user.accessToken) return;
    setSaving(true);
    try {
      const skillsArray = skillsInput
        ? skillsInput.split(",").map(s => s.trim()).filter(Boolean)
        : [];
      await authApi.updateMe(session.user.accessToken, {
        name,
        title,
        company,
        location,
        bio,
        skills: skillsArray,
        socialLinks: {
          linkedin: linkedinLink,
          twitter: twitterLink,
          website: websiteLink,
        },
      });
      
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch { /* ignore */ }
      setHasDraft(false);

      await update({ name });
      success("Profile updated successfully");
      fetchUserData();
      setActiveTab("overview");
    } catch (err) {
      error("Failed to update profile");
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

  const displayCompany = company || fullUser?.company || fullUser?.name || "Company";
  const displayContact = name || fullUser?.name || "Contact Person";
  const displayLocation = location || fullUser?.location || "India";
  const memberSince = fullUser?.createdAt
    ? new Date(fullUser.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
    : "Recently Joined";

  const specialtiesList = skillsInput
    ? skillsInput.split(",").map((s) => s.trim()).filter(Boolean)
    : fullUser?.skills && fullUser.skills.length > 0
    ? fullUser.skills
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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Profile</h1>
          <p className="text-xs text-gray-500 mt-1">
            Configure your public company presence, team contacts, and social handles.
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
              {tab === "edit" ? "Edit Profile" : tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content Panel */}
      <div>
        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* ── HERO BANNER CARD ────────────────────────────────────────────── */}
            <div className="relative bg-gradient-to-br from-[#0b192c] via-[#1e3a5f] to-[#0f172a] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-white/10 overflow-hidden">
              {/* Glowing Mesh Orbs */}
              <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#d4a017]/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 min-w-0">
                  {/* Logo / Avatar with Gold Ring & Verified Check */}
                  <div className="relative flex-shrink-0">
                    {avatarPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatarPreview}
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

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                        {displayCompany}
                      </h1>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300 bg-amber-400/20 border border-amber-400/30 px-2.5 py-0.5 rounded-full backdrop-blur-md">
                        <ShieldCheck size={12} /> Verified Employer
                      </span>
                    </div>

                    {/* Sub-strip Real Meta Pills */}
                    <div className="flex flex-wrap items-center gap-2.5 text-xs text-white/80 mt-2.5">
                      <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                        <UserIcon size={13} className="text-amber-400" /> {displayContact} ({title || "Hiring Partner"})
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
                <div className="flex flex-row md:flex-col items-center gap-3 flex-shrink-0">
                  {fullUser?._id && (
                    <Link href={`/employer-profile/${fullUser._id}`} target="_blank" className="w-full sm:w-auto">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all flex items-center justify-center gap-1.5"
                      >
                        <ExternalLink size={14} /> View Public Profile
                      </Button>
                    </Link>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setActiveTab("edit")}
                    className="w-full sm:w-auto py-2.5 px-5 rounded-xl font-bold text-xs bg-gradient-to-r from-[#d4a017] via-[#e6b800] to-[#b8860b] hover:from-[#b8860b] hover:to-[#966d09] text-slate-950 transition-all flex items-center justify-center gap-1.5 border-0 shadow-md"
                  >
                    <Edit size={14} /> Edit Profile
                  </Button>
                </div>
              </div>
            </div>

            {/* ── KEY METRICS BAR ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <Briefcase size={20} />
                </div>
                <div>
                  <p className="text-xl font-extrabold text-slate-900 leading-tight">{activeJobsCount}</p>
                  <p className="text-[11px] font-medium text-slate-500">Active Job Openings</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <p className="text-xl font-extrabold text-slate-900 leading-tight">100%</p>
                  <p className="text-[11px] font-medium text-slate-500">Verified Employer</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <Zap size={20} />
                </div>
                <div>
                  <p className="text-xl font-extrabold text-slate-900 leading-tight">Fast</p>
                  <p className="text-[11px] font-medium text-slate-500">Response Status</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                  <Award size={20} />
                </div>
                <div>
                  <p className="text-xl font-extrabold text-slate-900 leading-tight">
                    {fullUser?.ratingAvg ? `★ ${fullUser.ratingAvg.toFixed(1)}` : "Top Rated"}
                  </p>
                  <p className="text-[11px] font-medium text-slate-500">Employer Rating</p>
                </div>
              </div>
            </div>

            {/* ── 2-COLUMN LAYOUT ───────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
              {/* Left Main Content */}
              <div className="space-y-6 min-w-0">
                {/* About Company */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                  <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Sparkles size={16} className="text-[#d4a017]" /> About {displayCompany}
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal whitespace-pre-wrap">
                    {bio || "Write a brief description of your company in the Edit tab to show candidates your mission, products, and team culture."}
                  </p>

                  {/* Culture Quote Block */}
                  <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border-l-4 border-[#d4a017]">
                    <p className="text-[10px] font-bold text-[#b8860b] uppercase tracking-wider mb-0.5">Company Culture & Mission</p>
                    <p className="text-xs italic font-medium text-slate-800 leading-relaxed">
                      &ldquo;We focus on innovation, ownership, and empowering candidates to build meaningful careers.&rdquo;
                    </p>
                  </div>
                </div>

                {/* Benefits & Perks */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                  <h2 className="text-sm font-bold text-slate-900 mb-3.5 flex items-center gap-2">
                    <Award size={16} className="text-[#1e3a5f]" /> Work Culture & Benefits
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {benefits.map((b) => (
                      <div
                        key={b.label}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5"
                      >
                        <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-slate-800">{b.label}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{b.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Specialties */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                  <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Globe size={16} className="text-[#1e3a5f]" /> Hiring Specialties & Skill Focus
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {specialtiesList.map((s) => (
                      <span
                        key={s}
                        className="px-3 py-1 rounded-full bg-blue-50 text-[#1e3a5f] text-xs font-semibold border border-blue-100"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Sidebar Details */}
              <div className="space-y-6 flex-shrink-0 w-full">
                {/* Business Details Card */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                  <h3 className="text-xs font-bold text-slate-900 mb-3.5 pb-2.5 border-b border-slate-100 flex items-center gap-2">
                    <Building2 size={15} className="text-[#1e3a5f]" /> Profile Details
                  </h3>
                  <dl className="space-y-3 text-xs">
                    <div className="flex justify-between items-center">
                      <dt className="text-slate-500 font-medium">Company Name</dt>
                      <dd className="font-semibold text-slate-800 text-right">{displayCompany}</dd>
                    </div>
                    <div className="flex justify-between items-center">
                      <dt className="text-slate-500 font-medium">Representative</dt>
                      <dd className="font-semibold text-slate-800 text-right">{displayContact}</dd>
                    </div>
                    <div className="flex justify-between items-center">
                      <dt className="text-slate-500 font-medium">Title / Role</dt>
                      <dd className="font-semibold text-slate-800 text-right">{title || "Hiring Partner"}</dd>
                    </div>
                    <div className="flex justify-between items-center">
                      <dt className="text-slate-500 font-medium">Location</dt>
                      <dd className="font-semibold text-slate-800 text-right max-w-[150px] truncate">{displayLocation}</dd>
                    </div>
                    <div className="flex justify-between items-center">
                      <dt className="text-slate-500 font-medium">Member Since</dt>
                      <dd className="font-semibold text-slate-800 text-right">{memberSince}</dd>
                    </div>
                  </dl>
                </div>

                {/* Contact Channels Card */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                  <h3 className="text-xs font-bold text-slate-900 mb-3.5 pb-2.5 border-b border-slate-100 flex items-center gap-2">
                    <Mail size={15} className="text-[#1e3a5f]" /> Contact Details
                  </h3>
                  <ul className="space-y-3 text-xs">
                    {websiteLink && (
                      <li className="flex items-center justify-between gap-2">
                        <span className="text-slate-500 font-medium flex items-center gap-1.5">
                          <Globe size={13} className="text-slate-400" /> Website
                        </span>
                        <a
                          href={websiteLink.startsWith("http") ? websiteLink : `https://${websiteLink}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-[#1e3a5f] hover:underline truncate max-w-[150px]"
                        >
                          {websiteLink}
                        </a>
                      </li>
                    )}
                    {fullUser?.email && (
                      <li className="flex items-center justify-between gap-2">
                        <span className="text-slate-500 font-medium flex items-center gap-1.5">
                          <Mail size={13} className="text-slate-400" /> Email
                        </span>
                        <span className="font-semibold text-slate-800 truncate max-w-[150px]">{fullUser.email}</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Edit */}
        {activeTab === "edit" && (
          <form onSubmit={handleSaveProfile} className="space-y-6 bg-white border border-gray-200 rounded-2xl p-5 sm:p-7 shadow-sm">
            {/* Form actions banner */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Profile Details</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Update your contact card, avatar logos, and corporate links.
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

            {/* Avatar & Banner upload */}
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700">Cover & Logo</label>
              
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
                      Choose Image
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
                      Choose Image
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
                placeholder="Enter company name"
                required
                leftIcon={<Building size={16} className="text-gray-400" />}
              />

              <Input
                label="HQ Location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Bangalore, Karnataka"
                leftIcon={<MapPin size={16} className="text-gray-400" />}
              />

              <Input
                label="Contact Representative Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter contact name"
                required
                leftIcon={<UserIcon size={16} className="text-gray-400" />}
              />

              <Input
                label="Representative Job Title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Talent Acquisition Lead"
                leftIcon={<Building size={16} className="text-gray-400" />}
              />

              <div className="md:col-span-2">
                <Input
                  label="Company Specialties & Skill Focus Areas (Comma-separated)"
                  type="text"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  placeholder="e.g. E-commerce, Logistics, Product Design, Growth Marketing"
                  leftIcon={<Globe size={16} className="text-gray-400" />}
                />
              </div>
            </div>

            {/* About us / Bio */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">About Us / Description</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Describe your company, core industry focus, culture, and what you build..."
                rows={5}
                className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] bg-[#f8fafc] placeholder-gray-400/80 transition-all font-medium min-h-[100px]"
              />
            </div>

            {/* Social details */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Web & Social Presence</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Website Link"
                  type="text"
                  value={websiteLink}
                  onChange={(e) => setWebsiteLink(e.target.value)}
                  placeholder="e.g. www.acme.corp"
                  leftIcon={<Globe size={16} className="text-gray-400" />}
                />

                <Input
                  label="LinkedIn URL"
                  type="text"
                  value={linkedinLink}
                  onChange={(e) => setLinkedinLink(e.target.value)}
                  placeholder="e.g. linkedin.com/company/acme"
                  leftIcon={<Linkedin size={16} className="text-gray-400" />}
                />

                <Input
                  label="Twitter / X URL"
                  type="text"
                  value={twitterLink}
                  onChange={(e) => setTwitterLink(e.target.value)}
                  placeholder="e.g. x.com/acme"
                  leftIcon={<Twitter size={16} className="text-gray-400" />}
                />
              </div>
            </div>

            {/* Discard & Save Actions */}
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
