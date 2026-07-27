"use client";

import { useState, useEffect, useRef, FormEvent, ChangeEvent, KeyboardEvent } from "react";
import { useSession } from "next-auth/react";
import { authApi } from "@/lib/api";
import { User } from "@/types";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { TalentProfileOverview } from "@/components/talent/TalentProfileOverview";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { cn, compressImage } from "@/lib/utils";
import {
  User as UserIcon,
  Camera,
  X,
  Plus,
  Mail,
  MapPin,
  Clock,
  Briefcase,
  GraduationCap,
  Globe,
  FileText,
  Copy,
  ExternalLink,
  Check,
  Edit,
  Award,
  Calendar,
  Building,
} from "lucide-react";

type SubTabId = "overview" | "edit" | "portfolio";

const AVAILABILITY_OPTIONS = [
  "Immediately",
  "1 week",
  "2 weeks",
  "1 month",
  "Not available",
];

const BANNER_KEY = "winkgetjob_profile_banner";

export default function JobSeekerProfile() {
  const { data: session, update } = useSession();
  const { success, error, info } = useToast();

  const [activeTab, setActiveTab] = useState<SubTabId>("overview");
  const [fullUser, setFullUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Profile Edit States
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [availability, setAvailability] = useState("Immediately");
  const [yearsOfExp, setYearsOfExp] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [saving, setSaving] = useState(false);

  // Extended Metadata States
  const [category, setCategory] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [responseTime, setResponseTime] = useState("within 1 hour");
  const [weeklyAvailability, setWeeklyAvailability] = useState("40 hrs/week");
  const [timezone, setTimezone] = useState("IST (UTC+5:30)");
  const [languagesStr, setLanguagesStr] = useState("");

  // Extended Portfolio States
  const [portfolio, setPortfolio] = useState<Array<{ title: string; description: string; link?: string }>>([]);
  const [newPortTitle, setNewPortTitle] = useState("");
  const [newPortDesc, setNewPortDesc] = useState("");
  const [newPortLink, setNewPortLink] = useState("");

  // Extended Certifications States
  const [certifications, setCertifications] = useState<Array<{ name: string; issuer?: string; year?: string }>>([]);
  const [newCertName, setNewCertName] = useState("");
  const [newCertIssuer, setNewCertIssuer] = useState("");

  // Stats States
  const [jobsDoneCount, setJobsDoneCount] = useState("0");
  const [jobSuccessRate, setJobSuccessRate] = useState("100");
  const [onTimeDeliveryRate, setOnTimeDeliveryRate] = useState("100");
  const [repeatClientsRate, setRepeatClientsRate] = useState("0");

  // Social Links States
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [twitter, setTwitter] = useState("");
  const [website, setWebsite] = useState("");

  // Education States
  const [education, setEducation] = useState<Array<{
    school: string;
    degree: string;
    fieldOfStudy: string;
    startYear: string;
    endYear: string;
  }>>([]);
  const [newSchool, setNewSchool] = useState("");
  const [newDegree, setNewDegree] = useState("");
  const [newField, setNewField] = useState("");
  const [newSchoolStart, setNewSchoolStart] = useState("");
  const [newSchoolEnd, setNewSchoolEnd] = useState("");

  // Work Experience States
  const [workExperience, setWorkExperience] = useState<Array<{
    company: string;
    position: string;
    description: string;
    startYear: string;
    endYear: string;
  }>>([]);
  const [newCompany, setNewCompany] = useState("");
  const [newPosition, setNewPosition] = useState("");
  const [newJobDesc, setNewJobDesc] = useState("");
  const [newJobStart, setNewJobStart] = useState("");
  const [newJobEnd, setNewJobEnd] = useState("");

  // Achievements States
  const [achievements, setAchievements] = useState<string[]>([]);
  const [newAchievement, setNewAchievement] = useState("");

  // Avatar & Banner Preview States
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Link copy state
  const [copied, setCopied] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  const DRAFT_KEY = "winkgetjob_profile_edit_draft";

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
          setLocation(draft.location ?? u.location ?? "");
          setHourlyRate(draft.hourlyRate ?? (u.hourlyRate ? String(u.hourlyRate) : ""));
          setAvailability(draft.availability ?? u.availability ?? "Immediately");
          setYearsOfExp(draft.yearsOfExp ?? (u.yearsOfExperience ? String(u.yearsOfExperience) : ""));
          setBio(draft.bio ?? u.bio ?? "");
          setSkills(draft.skills ?? u.skills ?? []);
          setCategory(draft.category ?? u.category ?? "");
          setExperienceLevel(draft.experienceLevel ?? u.experienceLevel ?? "");
          setResponseTime(draft.responseTime ?? u.responseTime ?? "within 1 hour");
          setWeeklyAvailability(draft.weeklyAvailability ?? u.weeklyAvailability ?? "40 hrs/week");
          setTimezone(draft.timezone ?? u.timezone ?? "IST (UTC+5:30)");
          setLanguagesStr(draft.languagesStr ?? (u.languages && u.languages.length > 0 ? u.languages.join(", ") : ""));
          setPortfolio(draft.portfolio ?? u.portfolio ?? []);
          setCertifications(draft.certifications ?? u.certifications ?? []);
          setJobsDoneCount(draft.jobsDoneCount ?? (u.jobsDoneCount !== undefined ? String(u.jobsDoneCount) : "0"));
          setJobSuccessRate(draft.jobSuccessRate ?? (u.jobSuccessRate !== undefined ? String(u.jobSuccessRate) : "100"));
          setOnTimeDeliveryRate(draft.onTimeDeliveryRate ?? (u.onTimeDeliveryRate !== undefined ? String(u.onTimeDeliveryRate) : "100"));
          setRepeatClientsRate(draft.repeatClientsRate ?? (u.repeatClientsRate !== undefined ? String(u.repeatClientsRate) : "0"));

          setGithub(draft.github ?? u.socialLinks?.github ?? "");
          setLinkedin(draft.linkedin ?? u.socialLinks?.linkedin ?? "");
          setTwitter(draft.twitter ?? u.socialLinks?.twitter ?? "");
          setWebsite(draft.website ?? u.socialLinks?.website ?? "");

          setEducation(draft.education ?? u.education ?? []);
          setWorkExperience(draft.workExperience ?? u.workExperience ?? []);
          setAchievements(draft.achievements ?? u.achievements ?? []);
          setHasDraft(true);
        } else {
          setName(u.name || "");
          setTitle(u.title || "");
          setLocation(u.location || "");
          setHourlyRate(u.hourlyRate ? String(u.hourlyRate) : "");
          setAvailability(u.availability || "Immediately");
          setYearsOfExp(u.yearsOfExperience ? String(u.yearsOfExperience) : "");
          setBio(u.bio || "");
          setSkills(u.skills || []);
          setCategory(u.category || "");
          setExperienceLevel(u.experienceLevel || "");
          setResponseTime(u.responseTime || "within 1 hour");
          setWeeklyAvailability(u.weeklyAvailability || "40 hrs/week");
          setTimezone(u.timezone || "IST (UTC+5:30)");
          setLanguagesStr(u.languages && u.languages.length > 0 ? u.languages.join(", ") : "");
          setPortfolio(u.portfolio || []);
          setCertifications(u.certifications || []);
          setJobsDoneCount(u.jobsDoneCount !== undefined ? String(u.jobsDoneCount) : "0");
          setJobSuccessRate(u.jobSuccessRate !== undefined ? String(u.jobSuccessRate) : "100");
          setOnTimeDeliveryRate(u.onTimeDeliveryRate !== undefined ? String(u.onTimeDeliveryRate) : "100");
          setRepeatClientsRate(u.repeatClientsRate !== undefined ? String(u.repeatClientsRate) : "0");

          setGithub(u.socialLinks?.github || "");
          setLinkedin(u.socialLinks?.linkedin || "");
          setTwitter(u.socialLinks?.twitter || "");
          setWebsite(u.socialLinks?.website || "");

          setEducation(u.education || []);
          setWorkExperience(u.workExperience || []);
          setAchievements(u.achievements || []);
          setHasDraft(false);
        }
        setAvatarPreview(u.avatar || null);
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

  // Save draft to localStorage whenever fields change (excluding initial load and initial user values)
  useEffect(() => {
    if (loading || !fullUser) return;
    
    const isModified = 
      name !== (fullUser.name || "") ||
      title !== (fullUser.title || "") ||
      location !== (fullUser.location || "") ||
      hourlyRate !== (fullUser.hourlyRate ? String(fullUser.hourlyRate) : "") ||
      availability !== (fullUser.availability || "Immediately") ||
      yearsOfExp !== (fullUser.yearsOfExperience ? String(fullUser.yearsOfExperience) : "") ||
      bio !== (fullUser.bio || "") ||
      JSON.stringify(skills) !== JSON.stringify(fullUser.skills || []) ||
      github !== (fullUser.socialLinks?.github || "") ||
      linkedin !== (fullUser.socialLinks?.linkedin || "") ||
      twitter !== (fullUser.socialLinks?.twitter || "") ||
      website !== (fullUser.socialLinks?.website || "") ||
      JSON.stringify(education) !== JSON.stringify(fullUser.education || []) ||
      JSON.stringify(workExperience) !== JSON.stringify(fullUser.workExperience || []) ||
      JSON.stringify(achievements) !== JSON.stringify(fullUser.achievements || []);

    if (isModified) {
      const draft = {
        name,
        title,
        location,
        hourlyRate,
        availability,
        yearsOfExp,
        bio,
        skills,
        github,
        linkedin,
        twitter,
        website,
        education,
        workExperience,
        achievements,
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
    location,
    hourlyRate,
    availability,
    yearsOfExp,
    bio,
    skills,
    github,
    linkedin,
    twitter,
    website,
    education,
    workExperience,
    achievements,
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
        success("Photo updated successfully");
        fetchUserData();
      } catch (err) {
        error("Failed to upload photo");
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Skill Tags
  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) {
      setSkills((prev) => [...prev, s]);
    }
    setSkillInput("");
  };

  const handleSkillKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const removeSkill = (s: string) => {
    setSkills((prev) => prev.filter((x) => x !== s));
  };

  // Education list managers
  const addEducation = () => {
    if (!newSchool.trim() || !newDegree.trim()) {
      info("School and Degree are required");
      return;
    }
    const eduItem = {
      school: newSchool.trim(),
      degree: newDegree.trim(),
      fieldOfStudy: newField.trim(),
      startYear: newSchoolStart.trim(),
      endYear: newSchoolEnd.trim(),
    };
    setEducation((prev) => [...prev, eduItem]);
    setNewSchool("");
    setNewDegree("");
    setNewField("");
    setNewSchoolStart("");
    setNewSchoolEnd("");
  };

  const removeEducation = (index: number) => {
    setEducation((prev) => prev.filter((_, i) => i !== index));
  };

  // Experience list managers
  const addWorkExperience = () => {
    if (!newCompany.trim() || !newPosition.trim()) {
      info("Company and Position are required");
      return;
    }
    const expItem = {
      company: newCompany.trim(),
      position: newPosition.trim(),
      description: newJobDesc.trim(),
      startYear: newJobStart.trim(),
      endYear: newJobEnd.trim(),
    };
    setWorkExperience((prev) => [...prev, expItem]);
    setNewCompany("");
    setNewPosition("");
    setNewJobDesc("");
    setNewJobStart("");
    setNewJobEnd("");
  };

  const removeWorkExperience = (index: number) => {
    setWorkExperience((prev) => prev.filter((_, i) => i !== index));
  };

  // Achievement list managers
  const addAchievement = () => {
    const ach = newAchievement.trim();
    if (ach && !achievements.includes(ach)) {
      setAchievements((prev) => [...prev, ach]);
    }
    setNewAchievement("");
  };

  const removeAchievement = (index: number) => {
    setAchievements((prev) => prev.filter((_, i) => i !== index));
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
      setLocation(u.location || "");
      setHourlyRate(u.hourlyRate ? String(u.hourlyRate) : "");
      setAvailability(u.availability || "Immediately");
      setYearsOfExp(u.yearsOfExperience ? String(u.yearsOfExperience) : "");
      setBio(u.bio || "");
      setSkills(u.skills || []);
      setGithub(u.socialLinks?.github || "");
      setLinkedin(u.socialLinks?.linkedin || "");
      setTwitter(u.socialLinks?.twitter || "");
      setWebsite(u.socialLinks?.website || "");
      setEducation(u.education || []);
      setWorkExperience(u.workExperience || []);
      setAchievements(u.achievements || []);
    }
    info("Unsaved edits discarded");
  };

  // Portfolio list managers
  const addPortfolioItem = () => {
    if (!newPortTitle.trim()) {
      info("Project title is required");
      return;
    }
    setPortfolio((prev) => [
      ...prev,
      { title: newPortTitle.trim(), description: newPortDesc.trim(), link: newPortLink.trim() },
    ]);
    setNewPortTitle("");
    setNewPortDesc("");
    setNewPortLink("");
  };

  const removePortfolioItem = (index: number) => {
    setPortfolio((prev) => prev.filter((_, i) => i !== index));
  };

  // Certification list managers
  const addCertificationItem = () => {
    if (!newCertName.trim()) {
      info("Certificate name is required");
      return;
    }
    setCertifications((prev) => [
      ...prev,
      { name: newCertName.trim(), issuer: newCertIssuer.trim() },
    ]);
    setNewCertName("");
    setNewCertIssuer("");
  };

  const removeCertificationItem = (index: number) => {
    setCertifications((prev) => prev.filter((_, i) => i !== index));
  };

  // Save changes
  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!session?.user.accessToken) return;
    setSaving(true);
    try {
      const langs = languagesStr.split(",").map((l) => l.trim()).filter(Boolean);
      await authApi.updateMe(session.user.accessToken, {
        name,
        title,
        location,
        bio,
        skills,
        hourlyRate: hourlyRate ? Number(hourlyRate) : 0,
        yearsOfExperience: yearsOfExp ? Number(yearsOfExp) : 0,
        availability,
        category,
        experienceLevel,
        responseTime,
        weeklyAvailability,
        timezone,
        languages: langs,
        portfolio,
        certifications,
        jobsDoneCount: jobsDoneCount ? Number(jobsDoneCount) : 38,
        jobSuccessRate: jobSuccessRate ? Number(jobSuccessRate) : 96,
        onTimeDeliveryRate: onTimeDeliveryRate ? Number(onTimeDeliveryRate) : 98,
        repeatClientsRate: repeatClientsRate ? Number(repeatClientsRate) : 62,
        socialLinks: {
          github,
          linkedin,
          twitter,
          website,
        },
        education,
        workExperience,
        achievements,
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

  const getPublicLink = () => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/portfolio/${fullUser?._id || ""}`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getPublicLink());
    setCopied(true);
    success("Portfolio link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const triggerPrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1e3a5f]"></div>
      </div>
    );
  }

  const displayName = name || session?.user?.name || "User";

  return (
    <div className="space-y-6 font-[family-name:var(--font-poppins)] relative">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Profile</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Manage your public presentation, portfolio, and resume downloads.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            className="flex items-center gap-1.5"
          >
            {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
            Copy Link
          </Button>
          <a
            href={`/talent/${fullUser?._id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold hover:bg-gray-50 text-gray-700 transition-colors"
          >
            View Public <ExternalLink size={13} />
          </a>
        </div>
      </div>

      {/* ── Sub Navigation Top Bar ── */}
      <div className="border-b border-gray-200 print:hidden overflow-x-auto scrollbar-hide no-scrollbar">
        <nav className="flex gap-2 sm:gap-8 min-w-full" aria-label="Tabs">
          {(["overview", "edit", "portfolio"] as SubTabId[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm transition-all capitalize whitespace-nowrap flex-1 sm:flex-initial text-center",
                activeTab === tab
                  ? "border-[#1e3a5f] text-[#1e3a5f] font-semibold"
                  : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300"
              )}
            >
              {tab === "portfolio" ? "Portfolio & Resume" : tab === "edit" ? "Edit Profile" : tab}
            </button>
          ))}
        </nav>
      </div>

      {/* ── Tab Content Panel ── */}
      <div className="print:hidden">
        {/* ── Tab 1: Overview ── */}
        {activeTab === "overview" && (
          <TalentProfileOverview
            user={fullUser || ({
              _id: session?.user?.id || "",
              name: displayName,
              email: session?.user?.email || "",
              role: "jobseeker",
              avatar: avatarPreview,
              bannerUrl: bannerUrl,
              title: title,
              category: category,
              bio: bio,
              hourlyRate: hourlyRate,
              yearsOfExperience: yearsOfExp,
              skills: skills,
              portfolio: portfolio,
              workExperience: workExperience,
              education: education,
              certifications: certifications,
              location: location,
              availability: availability,
              weeklyAvailability: weeklyAvailability,
              responseTime: responseTime,
              timezone: timezone,
              languages: languagesStr ? languagesStr.split(",").map((s) => s.trim()) : ["English"],
              onTimeDeliveryRate: onTimeDeliveryRate,
              repeatClientsRate: repeatClientsRate,
              jobsDoneCount: jobsDoneCount,
              jobSuccessRate: jobSuccessRate,
              plan: "free",
              isActive: true,
            } as any)}
            isOwner={true}
            onEditProfile={() => setActiveTab("edit")}
            bannerUrl={bannerUrl}
            onBannerChange={handleBannerChange}
            avatarPreview={avatarPreview}
            publicViewUrl={fullUser?._id ? `/talent/${fullUser._id}` : undefined}
          />
        )}

        {/* ── Tab 2: Edit Profile ── */}
        {activeTab === "edit" && (
          <form onSubmit={handleSaveProfile} className="space-y-6 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm">
            {hasDraft && (
              <div className="flex items-center justify-between p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                <div className="flex items-center gap-2">
                  <span className="font-bold">⚠️ Unsaved edits:</span>
                  <span>We restored your unsaved changes. Discard them if you want to reset.</span>
                </div>
                <button
                  type="button"
                  onClick={handleDiscardChanges}
                  className="font-bold underline hover:text-amber-900 shrink-0 ml-4 cursor-pointer"
                >
                  Discard Changes
                </button>
              </div>
            )}

            {/* Avatar & Banner */}
            <div className="space-y-4 border-b border-gray-100 pb-5">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-indigo-600">Profile Images</h3>
              <div className="flex flex-col sm:flex-row gap-6 items-center">
                <div className="flex flex-col items-center gap-2">
                  <Avatar name={displayName} src={avatarPreview || session?.user?.image || fullUser?.avatar} size="xl" />
                  <label className="cursor-pointer text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center">
                    <Camera size={14} className="mr-1" /> Change Avatar
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </label>
                </div>
                <div className="flex-1 w-full flex flex-col items-start gap-2">
                  <div className="w-full h-24 bg-gray-100 rounded-xl overflow-hidden relative border border-gray-200">
                    {bannerUrl || fullUser?.bannerUrl ? (
                      <img src={bannerUrl || fullUser?.bannerUrl || ""} alt="Banner" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Banner</div>
                    )}
                  </div>
                  <label className="cursor-pointer text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center">
                    <Camera size={14} className="mr-1" /> Change Banner
                    <input type="file" accept="image/*" onChange={handleBannerChange} className="hidden" />
                  </label>
                </div>
              </div>
            </div>

            {/* Section 1: Basic Information */}
            <div className="space-y-4 border-b border-gray-100 pb-5">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-indigo-600">Basic Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Full Name*" value={name} onChange={(e) => setName(e.target.value)} placeholder="Aarav Sharma" required />
                <Input label="Professional Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Full-Stack Developer" />
                <Input label="Category / Primary Role" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Full-Stack Developer" />
                <Input label="Experience Level" value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} placeholder="Senior Level" />
                <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Remote / Mumbai, India" />
                <Input label="Hourly Rate (₹/hr)" type="number" min="0" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} placeholder="800" />
                <Input label="Years of Experience" type="number" min="0" max="50" value={yearsOfExp} onChange={(e) => setYearsOfExp(e.target.value)} placeholder="5" />
                <Input label="Weekly Availability (e.g. 40 hrs/week)" value={weeklyAvailability} onChange={(e) => setWeeklyAvailability(e.target.value)} placeholder="40 hrs/week" />
                <Input label="Timezone (e.g. IST (UTC+5:30))" value={timezone} onChange={(e) => setTimezone(e.target.value)} placeholder="IST (UTC+5:30)" />
                <Input label="Languages (comma separated)" value={languagesStr} onChange={(e) => setLanguagesStr(e.target.value)} placeholder="English, Hindi" />
                <Input label="Response Time" value={responseTime} onChange={(e) => setResponseTime(e.target.value)} placeholder="within 2 hours" />
                <Input label="Jobs Done Count" type="number" min="0" value={jobsDoneCount} onChange={(e) => setJobsDoneCount(e.target.value)} placeholder="38" />
                <Input label="Job Success Rate (%)" type="number" min="0" max="100" value={jobSuccessRate} onChange={(e) => setJobSuccessRate(e.target.value)} placeholder="96" />
                <Input label="On-time Delivery Rate (%)" type="number" min="0" max="100" value={onTimeDeliveryRate} onChange={(e) => setOnTimeDeliveryRate(e.target.value)} placeholder="98" />
                <Input label="Repeat Clients Rate (%)" type="number" min="0" max="100" value={repeatClientsRate} onChange={(e) => setRepeatClientsRate(e.target.value)} placeholder="62" />
              </div>
            </div>

            {/* Bio textarea */}
            <div className="flex flex-col gap-1 border-b border-gray-100 pb-5">
              <label className="text-sm font-semibold text-gray-700" htmlFor="bio">Your Bio / About Me</label>
              <textarea
                id="bio"
                rows={4}
                placeholder="I'm a full-stack engineer who loves turning fuzzy product ideas into fast, reliable web apps..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 resize-none transition-shadow"
              />
            </div>

            {/* Skills manager */}
            <div className="flex flex-col gap-2 border-b border-gray-100 pb-5">
              <label className="text-sm font-semibold text-gray-700">Skills Tags</label>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {skills.map((s) => (
                    <span key={s} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
                      {s}
                      <button type="button" onClick={() => removeSkill(s)} className="text-indigo-700 hover:text-indigo-900">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-2 min-w-0 w-full">
                <input
                  type="text"
                  placeholder="e.g. React, Next.js, Node.js, MongoDB"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKey}
                  className="flex-1 min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
                <Button type="button" variant="outline" size="sm" onClick={addSkill} className="gap-1 shrink-0">
                  <Plus size={14} /> Add Skill
                </Button>
              </div>
            </div>

            {/* Education Manager */}
            <div className="space-y-4 border-b border-gray-100 pb-5">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-indigo-600">Education</h3>
              {education.length > 0 && (
                <div className="space-y-2">
                  {education.map((edu, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{edu.degree} in {edu.fieldOfStudy}</p>
                        <p className="text-slate-500">{edu.school} ({edu.startYear} - {edu.endYear})</p>
                      </div>
                      <Button type="button" variant="outline" size="sm" onClick={() => removeEducation(idx)} className="text-red-600 border-red-200 hover:bg-red-50 text-xs px-2.5 py-1">
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <input type="text" placeholder="Degree (e.g. B.Tech)" value={newDegree} onChange={(e) => setNewDegree(e.target.value)} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900" />
                <input type="text" placeholder="Field of Study" value={newField} onChange={(e) => setNewField(e.target.value)} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900" />
                <input type="text" placeholder="School / University" value={newSchool} onChange={(e) => setNewSchool(e.target.value)} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 sm:col-span-2" />
                <input type="text" placeholder="Start Year (e.g. 2018)" value={newSchoolStart} onChange={(e) => setNewSchoolStart(e.target.value)} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900" />
                <input type="text" placeholder="End Year (e.g. 2022)" value={newSchoolEnd} onChange={(e) => setNewSchoolEnd(e.target.value)} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900" />
                <div className="sm:col-span-2 flex justify-end">
                  <Button type="button" variant="outline" size="sm" onClick={addEducation} className="gap-1 text-xs">
                    <Plus size={13} /> Add Education
                  </Button>
                </div>
              </div>
            </div>

            {/* Work Experience Manager */}
            <div className="space-y-4 border-b border-gray-100 pb-5">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-indigo-600">Work Experience</h3>
              {workExperience.length > 0 && (
                <div className="space-y-2">
                  {workExperience.map((exp, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{exp.position} at {exp.company}</p>
                        <p className="text-slate-500">{exp.startYear} - {exp.endYear || "Present"}</p>
                      </div>
                      <Button type="button" variant="outline" size="sm" onClick={() => removeWorkExperience(idx)} className="text-red-600 border-red-200 hover:bg-red-50 text-xs px-2.5 py-1">
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <input type="text" placeholder="Job Title / Position" value={newPosition} onChange={(e) => setNewPosition(e.target.value)} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900" />
                <input type="text" placeholder="Company Name" value={newCompany} onChange={(e) => setNewCompany(e.target.value)} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900" />
                <input type="text" placeholder="Start Date (e.g. Jan 2020)" value={newJobStart} onChange={(e) => setNewJobStart(e.target.value)} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900" />
                <input type="text" placeholder="End Date (e.g. Present)" value={newJobEnd} onChange={(e) => setNewJobEnd(e.target.value)} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900" />
                <textarea rows={2} placeholder="Job Description" value={newJobDesc} onChange={(e) => setNewJobDesc(e.target.value)} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 sm:col-span-2 resize-none" />
                <div className="sm:col-span-2 flex justify-end">
                  <Button type="button" variant="outline" size="sm" onClick={addWorkExperience} className="gap-1 text-xs">
                    <Plus size={13} /> Add Experience
                  </Button>
                </div>
              </div>
            </div>

            {/* Portfolio Highlights Manager */}
            <div className="space-y-4 border-b border-gray-100 pb-5">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-indigo-600">Portfolio Highlights</h3>
              {portfolio.length > 0 && (
                <div className="space-y-2">
                  {portfolio.map((p, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{p.title}</p>
                        <p className="text-slate-500">{p.description}</p>
                      </div>
                      <Button type="button" variant="outline" size="sm" onClick={() => removePortfolioItem(idx)} className="text-red-600 border-red-200 hover:bg-red-50 text-xs px-2.5 py-1">
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <input type="text" placeholder="Project Title" value={newPortTitle} onChange={(e) => setNewPortTitle(e.target.value)} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900" />
                <input type="text" placeholder="Project Description" value={newPortDesc} onChange={(e) => setNewPortDesc(e.target.value)} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900" />
                <div className="sm:col-span-2 flex justify-end">
                  <Button type="button" variant="outline" size="sm" onClick={addPortfolioItem} className="gap-1 text-xs">
                    <Plus size={13} /> Add Portfolio Project
                  </Button>
                </div>
              </div>
            </div>

            {/* Certifications Manager */}
            <div className="space-y-4 border-b border-gray-100 pb-5">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-indigo-600">Certifications</h3>
              {certifications.length > 0 && (
                <div className="space-y-2">
                  {certifications.map((c, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{c.name}</p>
                        <p className="text-slate-500">{c.issuer}</p>
                      </div>
                      <Button type="button" variant="outline" size="sm" onClick={() => removeCertificationItem(idx)} className="text-red-600 border-red-200 hover:bg-red-50 text-xs px-2.5 py-1">
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <input type="text" placeholder="Certificate Name (e.g. AWS Certified Developer)" value={newCertName} onChange={(e) => setNewCertName(e.target.value)} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900" />
                <input type="text" placeholder="Issuer (e.g. Amazon Web Services)" value={newCertIssuer} onChange={(e) => setNewCertIssuer(e.target.value)} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900" />
                <div className="sm:col-span-2 flex justify-end">
                  <Button type="button" variant="outline" size="sm" onClick={addCertificationItem} className="gap-1 text-xs">
                    <Plus size={13} /> Add Certificate
                  </Button>
                </div>
              </div>
            </div>

            {/* Save Buttons */}
            <div className="flex justify-end gap-3 pt-3">
              <Button type="button" variant="outline" onClick={() => setActiveTab("overview")}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6">
                {saving ? "Saving Changes..." : "Save Profile Changes"}
              </Button>
            </div>
          </form>
        )}

        {/* ── Tab 3: Portfolio & Resume Controls ── */}
        {activeTab === "portfolio" && (
          <div className="space-y-6">
            {/* Share Link Banner */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-2">Public Portfolio Sharing</h3>
              <p className="text-xs text-gray-400 mb-5 leading-normal">
                Your portfolio contains your bio, experience history, education details, and resume download widget. It is fully public and can be shared with recruiters or on social platforms.
              </p>

              <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl max-w-2xl">
                <Globe size={16} className="text-gray-400 shrink-0" />
                <span className="text-xs text-gray-500 font-medium truncate flex-1 leading-none select-all pt-0.5">
                  {getPublicLink()}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="gap-1.5 text-xs py-1 px-3.5 shrink-0 bg-white hover:bg-gray-50"
                >
                  {copied ? (
                    <>
                      <Check size={13} className="text-green-600" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy size={13} /> Copy Link
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* PDF Resume download widget */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-2">Resume PDF Document</h3>
              <p className="text-xs text-gray-400 mb-5 leading-normal">
                Download a clean, structured print layout containing your profile summary, experience history, qualifications, and core developer tools. Click to trigger your system print layout.
              </p>

              <div className="flex items-start gap-4 p-4 rounded-xl border border-[#1e3a5f]/20 bg-[#1e3a5f]/5 max-w-2xl">
                <div className="w-10 h-10 rounded-lg bg-[#1e3a5f]/15 flex items-center justify-center shrink-0">
                  <FileText size={18} className="text-[#1e3a5f]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Vector-Perfect Printable CV</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Designed using CSS `@media print` specs, optimized for standard A4 format margins. Clean text vectors look professional and support text selection when printed to PDF.
                  </p>
                  <div className="mt-4">
                    <Button onClick={triggerPrint} className="gap-1.5 text-xs bg-[#1e3a5f] hover:bg-[#152a45]">
                      <FileText size={14} /> Download Resume (PDF)
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Resume Preview */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 max-w-4xl shadow-inner">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Resume Document Preview</p>
              <div className="bg-white rounded-lg border border-gray-300 p-8 shadow-md">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="text-center pb-5 border-b border-gray-300">
                    <h2 className="text-2xl font-black text-gray-900">{displayName}</h2>
                    <p className="text-sm text-gray-600 font-medium mt-1 uppercase tracking-wide">{title || "Developer"}</p>
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-gray-500 mt-3 font-medium">
                      {location && <span>Location: {location}</span>}
                      <span>Email: {fullUser?.email}</span>
                      {website && <span>Website: {website}</span>}
                    </div>
                  </div>

                  {/* Summary */}
                  {bio && (
                    <div className="space-y-1.5">
                      <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-1">Professional Summary</h3>
                      <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">{bio}</p>
                    </div>
                  )}

                  {/* Experience */}
                  {workExperience.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-1">Work History</h3>
                      <div className="space-y-3">
                        {workExperience.map((exp, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between items-baseline text-xs font-bold text-gray-800">
                              <span>{exp.position} — <span className="font-semibold text-gray-600">{exp.company}</span></span>
                              <span className="font-medium text-gray-500">{exp.startYear} - {exp.endYear || "Present"}</span>
                            </div>
                            {exp.description && (
                              <p className="text-xs text-gray-500 leading-relaxed whitespace-pre-wrap pl-2 border-l border-gray-200">
                                {exp.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {education.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-1">Education</h3>
                      <div className="space-y-2">
                        {education.map((edu, idx) => (
                          <div key={idx} className="flex justify-between items-baseline text-xs text-gray-800">
                            <div>
                              <span className="font-bold">{edu.degree}</span> {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}
                              <p className="text-[11px] text-gray-600 mt-0.5">{edu.school}</p>
                            </div>
                            <span className="text-xs font-medium text-gray-500">{edu.startYear} - {edu.endYear}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  {skills.length > 0 && (
                    <div className="space-y-1.5">
                      <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-1">Technical Skills</h3>
                      <p className="text-xs text-gray-600 leading-relaxed font-semibold">
                        {skills.join(" • ")}
                      </p>
                    </div>
                  )}

                  {/* Achievements */}
                  {achievements.length > 0 && (
                    <div className="space-y-1.5">
                      <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-1">Achievements & Certifications</h3>
                      <ul className="list-disc pl-4 space-y-1">
                        {achievements.map((ach, idx) => (
                          <li key={idx} className="text-xs text-gray-600 leading-relaxed">
                            {ach}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── High-Fidelity Printable Resume Layout (ONLY Visible on Print/Print-Preview) ── */}
      <div id="printable-resume-container" className="hidden print:block bg-white text-black p-10 font-serif leading-relaxed max-w-[21cm] mx-auto">
        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #printable-resume-container, #printable-resume-container * {
              visibility: visible;
            }
            #printable-resume-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 0;
              margin: 0;
            }
            @page {
              size: A4 portrait;
              margin: 1.5cm 2cm;
            }
          }
        `}</style>

        <div className="space-y-5 text-xs text-gray-800">
          {/* Main header block */}
          <div className="text-center border-b-2 border-gray-800 pb-4">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">{displayName}</h1>
            <p className="text-sm font-semibold tracking-wide text-gray-700 uppercase mt-0.5">{title || "Developer"}</p>
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-[11px] text-gray-500 mt-2 font-medium">
              {location && <span>📍 {location}</span>}
              <span>✉️ {fullUser?.email}</span>
              {website && <span>🌐 {website}</span>}
              {linkedin && <span>💼 {linkedin}</span>}
              {github && <span>💻 {github}</span>}
            </div>
          </div>

          {/* Bio block */}
          {bio && (
            <div className="space-y-1">
              <h2 className="text-[11px] font-bold text-gray-900 uppercase tracking-widest border-b border-gray-300 pb-0.5">Professional Summary</h2>
              <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">{bio}</p>
            </div>
          )}

          {/* Experience block */}
          {workExperience.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-[11px] font-bold text-gray-900 uppercase tracking-widest border-b border-gray-300 pb-0.5">Work History</h2>
              <div className="space-y-3.5">
                {workExperience.map((exp, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between items-baseline font-bold text-gray-900">
                      <span>{exp.position} — <span className="font-semibold text-gray-700">{exp.company}</span></span>
                      <span className="font-medium text-gray-500 text-[10px]">{exp.startYear} - {exp.endYear || "Present"}</span>
                    </div>
                    {exp.description && (
                      <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap pl-2.5 border-l border-gray-200">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education block */}
          {education.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-[11px] font-bold text-gray-900 uppercase tracking-widest border-b border-gray-300 pb-0.5">Education</h2>
              <div className="space-y-2">
                {education.map((edu, idx) => (
                  <div key={idx} className="flex justify-between items-baseline text-gray-900">
                    <div>
                      <span className="font-bold">{edu.degree}</span> {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}
                      <p className="text-[10px] text-gray-500 font-medium mt-0.5">{edu.school}</p>
                    </div>
                    <span className="text-[10px] font-semibold text-gray-500">{edu.startYear} - {edu.endYear}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills block */}
          {skills.length > 0 && (
            <div className="space-y-1">
              <h2 className="text-[11px] font-bold text-gray-900 uppercase tracking-widest border-b border-gray-300 pb-0.5">Technical & Professional Skills</h2>
              <p className="text-xs text-gray-700 leading-relaxed font-semibold">
                {skills.join("  •  ")}
              </p>
            </div>
          )}

          {/* Achievements block */}
          {achievements.length > 0 && (
            <div className="space-y-1">
              <h2 className="text-[11px] font-bold text-gray-900 uppercase tracking-widest border-b border-gray-300 pb-0.5">Key Achievements</h2>
              <ul className="list-disc pl-4 space-y-1 text-xs text-gray-700">
                {achievements.map((ach, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {ach}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
