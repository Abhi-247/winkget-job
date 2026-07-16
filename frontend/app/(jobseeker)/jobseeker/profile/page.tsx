"use client";

import { useState, useEffect, useRef, FormEvent, ChangeEvent, KeyboardEvent } from "react";
import { useSession } from "next-auth/react";
import { authApi } from "@/lib/api";
import { User } from "@/types";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
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
import { Linkedin, Github, Twitter } from "@/components/ui/BrandIcons";

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

  // Save changes
  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!session?.user.accessToken) return;
    setSaving(true);
    try {
      await authApi.updateMe(session.user.accessToken, {
        name,
        title,
        location,
        bio,
        skills,
        hourlyRate: hourlyRate ? Number(hourlyRate) : 0,
        yearsOfExperience: yearsOfExp ? Number(yearsOfExp) : 0,
        availability,
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
            href={`/portfolio/${fullUser?._id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold hover:bg-gray-50 text-gray-700 transition-colors"
          >
            View Public <ExternalLink size={13} />
          </a>
        </div>
      </div>

      {/* ── Sub Navigation Top Bar ── */}
      <div className="border-b border-gray-200 print:hidden">
        <nav className="flex space-x-8" aria-label="Tabs">
          {(["overview", "edit", "portfolio"] as SubTabId[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "py-4 px-1 border-b-2 font-medium text-sm transition-all capitalize",
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
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              {/* Banner Mockup */}
              <div
                className="relative h-48 bg-gradient-to-r from-[#152a45] via-[#1e3a5f] to-[#2c5282] bg-cover bg-center"
                style={bannerUrl ? { backgroundImage: `url(${bannerUrl})` } : undefined}
              />
              <div className="px-6 pb-6 relative">
                {/* Avatar Mockup */}
                <div className="absolute -top-12 left-6 w-24 h-24 rounded-full ring-4 ring-white overflow-hidden bg-gray-50">
                  {avatarPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarPreview} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    <Avatar name={displayName} size="xl" className="w-full h-full rounded-full" />
                  )}
                </div>

                <div className="pt-16 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
                    <p className="text-gray-500 font-medium text-sm mt-0.5">{title || "No Title Set"}</p>
                    <div className="flex flex-wrap gap-y-1 gap-x-4 mt-3 text-xs text-gray-400">
                      {location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={13} /> {location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock size={13} /> Available: <span className="text-emerald-600 font-semibold">{availability}</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab("edit")}
                      className="gap-1 text-xs"
                    >
                      <Edit size={13} /> Edit Profile
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-8 mt-8 border-t border-gray-100 pt-6">
                  {/* Left info column */}
                  <div className="space-y-6">
                    {/* About */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 mb-2.5">About Me</h3>
                      <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-wrap">
                        {bio || "Write a brief description of yourself in the Edit tab to showcase your credentials."}
                      </p>
                    </div>

                    {/* Experience List */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 mb-3.5 flex items-center gap-1.5">
                        <Briefcase size={15} className="text-[#1e3a5f]" /> Work Experience
                      </h3>
                      {workExperience.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">No experience added yet.</p>
                      ) : (
                        <div className="space-y-4">
                          {workExperience.map((exp, idx) => (
                            <div key={idx} className="flex gap-3 items-start p-3 bg-gray-50 rounded-xl border border-gray-100">
                              <Building size={16} className="text-gray-400 mt-1 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-2">
                                  <h4 className="text-sm font-semibold text-gray-900 truncate">{exp.position}</h4>
                                  <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-medium flex-shrink-0 flex items-center gap-1">
                                    <Calendar size={10} /> {exp.startYear} - {exp.endYear || "Present"}
                                  </span>
                                </div>
                                <p className="text-xs text-[#1e3a5f] font-medium">{exp.company}</p>
                                {exp.description && (
                                  <p className="text-xs text-gray-400 mt-1 leading-relaxed whitespace-pre-wrap">{exp.description}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Education List */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 mb-3.5 flex items-center gap-1.5">
                        <GraduationCap size={15} className="text-[#1e3a5f]" /> Education
                      </h3>
                      {education.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">No education added yet.</p>
                      ) : (
                        <div className="space-y-4">
                          {education.map((edu, idx) => (
                            <div key={idx} className="flex gap-3 items-start p-3 bg-gray-50 rounded-xl border border-gray-100">
                              <GraduationCap size={16} className="text-gray-400 mt-1 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-2">
                                  <h4 className="text-sm font-semibold text-gray-900 truncate">{edu.degree}</h4>
                                  <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-medium flex-shrink-0 flex items-center gap-1">
                                    <Calendar size={10} /> {edu.startYear} - {edu.endYear}
                                  </span>
                                </div>
                                <p className="text-xs text-[#1e3a5f] font-medium">{edu.school}</p>
                                {edu.fieldOfStudy && (
                                  <p className="text-xs text-gray-400 mt-0.5">Field of Study: {edu.fieldOfStudy}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right metadata column */}
                  <div className="space-y-6 border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-6">
                    {/* Public Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Hourly Rate</span>
                        <span className="text-lg font-black text-[#1e3a5f] mt-1 block">
                          {hourlyRate ? `₹${hourlyRate}/hr` : "N/A"}
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Experience</span>
                        <span className="text-lg font-black text-[#1e3a5f] mt-1 block">
                          {yearsOfExp ? `${yearsOfExp} Years` : "N/A"}
                        </span>
                      </div>
                    </div>

                    {/* Skills */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 mb-2.5">Skills</h3>
                      {skills.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">No skills listed.</p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {skills.map((s) => (
                            <Badge key={s} variant="outline" className="px-2 py-0.5 text-xs font-semibold bg-[#edf2f7] text-[#1e3a5f] border-gray-200">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Achievements */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 mb-2.5 flex items-center gap-1.5">
                        <Award size={14} className="text-[#1e3a5f]" /> Achievements
                      </h3>
                      {achievements.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">No achievements added.</p>
                      ) : (
                        <ul className="space-y-1.5">
                          {achievements.map((ach, idx) => (
                            <li key={idx} className="flex gap-2 items-start text-xs text-gray-500">
                              <span className="text-amber-500 font-bold flex-shrink-0">•</span>
                              <span className="leading-normal">{ach}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Social links */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 mb-2.5">Social Profiles</h3>
                      <div className="space-y-2">
                        {website && (
                          <a href={website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-gray-500 hover:text-[#1e3a5f] transition-colors">
                            <Globe size={14} className="text-gray-400" />
                            <span className="truncate flex-1">{website}</span>
                          </a>
                        )}
                        {linkedin && (
                          <a href={linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-gray-500 hover:text-[#1e3a5f] transition-colors">
                            <Linkedin size={14} className="text-gray-400" />
                            <span className="truncate flex-1">{linkedin}</span>
                          </a>
                        )}
                        {github && (
                          <a href={github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-gray-500 hover:text-[#1e3a5f] transition-colors">
                            <Github size={14} className="text-gray-400" />
                            <span className="truncate flex-1">{github}</span>
                          </a>
                        )}
                        {twitter && (
                          <a href={twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-gray-500 hover:text-[#1e3a5f] transition-colors">
                            <Twitter size={14} className="text-gray-400" />
                            <span className="truncate flex-1">{twitter}</span>
                          </a>
                        )}
                        {!website && !linkedin && !github && !twitter && (
                          <p className="text-xs text-gray-400 italic">No social profiles configured.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab 2: Edit Profile ── */}
        {activeTab === "edit" && (
          <form onSubmit={handleSaveProfile} className="space-y-6 bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm">
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
            {/* Banner Edit */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900 block">Profile Banner</label>
              <div
                className="relative h-32 sm:h-40 rounded-xl overflow-hidden bg-gradient-to-r from-[#152a45] via-[#1e3a5f] to-[#2c5282] bg-cover bg-center"
                style={bannerUrl ? { backgroundImage: `url(${bannerUrl})` } : undefined}
              >
                <button
                  type="button"
                  onClick={() => bannerInputRef.current?.click()}
                  className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/40 hover:bg-black/55 text-white text-xs font-medium transition-colors backdrop-blur-sm shadow"
                >
                  <Camera size={13} />
                  Change Banner
                </button>
                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleBannerChange}
                  aria-label="Upload banner image"
                />
              </div>
            </div>

            {/* Avatar upload */}
            <div className="flex items-center gap-4 border-b border-gray-100 pb-5">
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-50 border-2 border-gray-200">
                  {avatarPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarPreview} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    <Avatar name={displayName} size="xl" className="w-full h-full rounded-full" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center hover:bg-[#152a45] transition-colors shadow"
                  aria-label="Change profile photo"
                >
                  <Camera size={12} />
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={handleAvatarChange}
                  aria-label="Upload profile photo"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Profile Image</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG or WebP · Max 2MB (banner 4MB)</p>
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="text-xs font-bold text-[#1e3a5f] hover:underline mt-2 inline-block"
                >
                  Upload new photo
                </button>
              </div>
            </div>

            {/* Basic Info grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 border-b border-gray-100 pb-5">
              <Input
                label="Full Name*"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Abhishek Verma"
                required
              />
              <Input
                label="Professional Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Full-Stack Engineer"
              />
              <Input
                label="Where are you based? (Location)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Sitapur, Uttar Pradesh"
              />
              <Input
                label="Hourly Rate (₹/hr)"
                type="number"
                min="0"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                placeholder="500"
              />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700 mb-0.5" htmlFor="availability">
                  Availability
                </label>
                <select
                  id="availability"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent transition-shadow"
                >
                  {AVAILABILITY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <Input
                label="Years of Experience"
                type="number"
                min="0"
                max="50"
                value={yearsOfExp}
                onChange={(e) => setYearsOfExp(e.target.value)}
                placeholder="1"
              />
            </div>

            {/* Bio textarea */}
            <div className="flex flex-col gap-1 border-b border-gray-100 pb-5">
              <div className="flex justify-between items-center mb-0.5">
                <label className="text-sm font-semibold text-gray-700" htmlFor="bio">Your Bio</label>
                <span className="text-[10px] text-gray-400">{bio.length} chars</span>
              </div>
              <textarea
                id="bio"
                rows={4}
                placeholder="Tell us about yourself so startups know who you are..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent resize-none transition-shadow"
              />
            </div>

            {/* Skills tag manager */}
            <div className="flex flex-col gap-2 border-b border-gray-100 pb-5">
              <label className="text-sm font-semibold text-gray-700">Your Skills</label>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {skills.map((s) => (
                    <span
                      key={s}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-[#1e3a5f] text-xs font-semibold"
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => removeSkill(s)}
                        className="text-[#1e3a5f] hover:text-[#152a45] transition-colors"
                        aria-label={`Remove ${s}`}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. React, Node.js, Next.js"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKey}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent transition-shadow"
                />
                <Button type="button" variant="outline" size="sm" onClick={addSkill} className="gap-1 shrink-0">
                  <Plus size={14} /> Add
                </Button>
              </div>
              <p className="text-[10px] text-gray-400">Press Enter or click Add to insert skills</p>
            </div>

            {/* Social profiles fields */}
            <div className="space-y-4 border-b border-gray-100 pb-5">
              <label className="text-sm font-semibold text-gray-900 block">Social Profiles</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                    <Globe size={13} /> Website
                  </span>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent transition-shadow"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                    <Linkedin size={13} /> LinkedIn
                  </span>
                  <input
                    type="url"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent transition-shadow"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                    <Github size={13} /> GitHub
                  </span>
                  <input
                    type="url"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="https://github.com/username"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent transition-shadow"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                    <Twitter size={13} /> Twitter
                  </span>
                  <input
                    type="url"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    placeholder="https://twitter.com/username"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent transition-shadow"
                  />
                </div>
              </div>
            </div>

            {/* Education History Manager */}
            <div className="space-y-4 border-b border-gray-100 pb-5">
              <label className="text-sm font-semibold text-gray-900 block">Education History</label>
              
              {/* Existing Education */}
              {education.length > 0 && (
                <div className="space-y-2">
                  {education.map((edu, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{edu.school}</p>
                        <p className="text-xs text-[#1e3a5f] font-medium mt-0.5">
                          {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">{edu.startYear} - {edu.endYear}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeEducation(idx)}
                        className="text-red-600 hover:text-red-700 transition-colors p-1"
                        aria-label="Remove education row"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Education Form block */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="col-span-2">
                  <p className="text-xs font-semibold text-[#1e3a5f] uppercase tracking-wider mb-1">Add Education</p>
                </div>
                <input
                  type="text"
                  placeholder="School / University Name"
                  value={newSchool}
                  onChange={(e) => setNewSchool(e.target.value)}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent transition-shadow text-left"
                />
                <input
                  type="text"
                  placeholder="Degree (e.g. B.Tech, M.S.)"
                  value={newDegree}
                  onChange={(e) => setNewDegree(e.target.value)}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent transition-shadow text-left"
                />
                <input
                  type="text"
                  placeholder="Field of Study (e.g. Computer Science)"
                  value={newField}
                  onChange={(e) => setNewField(e.target.value)}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent transition-shadow text-left"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Start Year"
                    value={newSchoolStart}
                    onChange={(e) => setNewSchoolStart(e.target.value)}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent transition-shadow"
                  />
                  <input
                    type="text"
                    placeholder="End Year"
                    value={newSchoolEnd}
                    onChange={(e) => setNewSchoolEnd(e.target.value)}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent transition-shadow"
                  />
                </div>
                <div className="col-span-2 flex justify-end">
                  <Button type="button" variant="outline" size="sm" onClick={addEducation} className="gap-1 text-xs px-4">
                    <Plus size={13} /> Add Education Item
                  </Button>
                </div>
              </div>
            </div>

            {/* Work Experience History Manager */}
            <div className="space-y-4 border-b border-gray-100 pb-5">
              <label className="text-sm font-semibold text-gray-900 block">Work Experience History</label>

              {/* Existing Experience */}
              {workExperience.length > 0 && (
                <div className="space-y-2">
                  {workExperience.map((exp, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="min-w-0 flex-1 pr-3">
                        <p className="text-sm font-bold text-gray-900">{exp.position}</p>
                        <p className="text-xs text-[#1e3a5f] font-medium mt-0.5">{exp.company}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{exp.startYear} - {exp.endYear || "Present"}</p>
                        {exp.description && (
                          <p className="text-xs text-gray-400 mt-1 truncate">{exp.description}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeWorkExperience(idx)}
                        className="text-red-600 hover:text-red-700 transition-colors p-1"
                        aria-label="Remove work experience row"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Experience block */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="col-span-2">
                  <p className="text-xs font-semibold text-[#1e3a5f] uppercase tracking-wider mb-1">Add Work Experience</p>
                </div>
                <input
                  type="text"
                  placeholder="Company Name"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent transition-shadow"
                />
                <input
                  type="text"
                  placeholder="Job Position (e.g. Frontend Engineer)"
                  value={newPosition}
                  onChange={(e) => setNewPosition(e.target.value)}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent transition-shadow"
                />
                <div className="col-span-2 flex flex-col gap-1">
                  <textarea
                    rows={2}
                    placeholder="Job Description / Key projects and responsibilities..."
                    value={newJobDesc}
                    onChange={(e) => setNewJobDesc(e.target.value)}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent resize-none transition-shadow"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Start Year"
                    value={newJobStart}
                    onChange={(e) => setNewJobStart(e.target.value)}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent transition-shadow"
                  />
                  <input
                    type="text"
                    placeholder="End Year (leave blank for Present)"
                    value={newJobEnd}
                    onChange={(e) => setNewJobEnd(e.target.value)}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent transition-shadow"
                  />
                </div>
                <div className="col-span-2 flex justify-end">
                  <Button type="button" variant="outline" size="sm" onClick={addWorkExperience} className="gap-1 text-xs px-4">
                    <Plus size={13} /> Add Work Item
                  </Button>
                </div>
              </div>
            </div>

            {/* Achievements Manager */}
            <div className="space-y-4 border-b border-gray-100 pb-5">
              <label className="text-sm font-semibold text-gray-900 block">Achievements & Awards</label>

              {achievements.length > 0 && (
                <div className="space-y-2">
                  {achievements.map((ach, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2.5 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-700">
                      <p className="flex-1 pr-3 leading-relaxed">{ach}</p>
                      <button
                        type="button"
                        onClick={() => removeAchievement(idx)}
                        className="text-red-600 hover:text-red-700 transition-colors p-1"
                        aria-label="Remove achievement row"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Winner of Hackathon 2025, Certified AWS Developer"
                  value={newAchievement}
                  onChange={(e) => setNewAchievement(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent transition-shadow"
                />
                <Button type="button" variant="outline" size="sm" onClick={addAchievement} className="gap-1 shrink-0 text-xs">
                  <Plus size={13} /> Add
                </Button>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row justify-between items-center gap-3">
              {hasDraft ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDiscardChanges}
                  className="w-full sm:w-auto px-4 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 hover:bg-red-50 text-xs shrink-0"
                >
                  Discard Changes
                </Button>
              ) : (
                <div />
              )}
              <div className="flex gap-3 w-full sm:w-auto justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab("overview")}
                  className="px-6 flex-1 sm:flex-initial"
                >
                  Cancel
                </Button>
                <Button type="submit" loading={saving} className="px-8 bg-[#1e3a5f] hover:bg-[#152a45] flex-1 sm:flex-initial">
                  Save Profile
                </Button>
              </div>
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
