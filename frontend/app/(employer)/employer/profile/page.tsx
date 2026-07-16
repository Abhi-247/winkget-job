"use client";

import { useState, useEffect, useRef, FormEvent, ChangeEvent } from "react";
import { useSession } from "next-auth/react";
import { authApi } from "@/lib/api";
import { User } from "@/types";
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
  Globe,
  Edit,
  ExternalLink,
  Mail,
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
  const [loading, setLoading] = useState(true);

  // Profile Edit States
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  
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
          
          setLinkedinLink(u.socialLinks?.linkedin || "");
          setTwitterLink(u.socialLinks?.twitter || "");
          setWebsiteLink(u.socialLinks?.website || "");
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

  // Save draft to localStorage whenever fields change
  useEffect(() => {
    if (loading || !fullUser) return;
    
    const isModified = 
      name !== (fullUser.name || "") ||
      title !== (fullUser.title || "") ||
      company !== (fullUser.company || "") ||
      location !== (fullUser.location || "") ||
      bio !== (fullUser.bio || "") ||
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
      await authApi.updateMe(session.user.accessToken, {
        name,
        title,
        company,
        location,
        bio,
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

  const displayCompany = company || "Your Company";
  const displayContact = name || session?.user?.name || "Contact Person";

  return (
    <div className="space-y-6 font-[family-name:var(--font-poppins)] relative">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Manage Profile</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Configure your public company presence, team contacts, and social handles.
          </p>
        </div>
      </div>

      {/* Sub Navigation Top Bar */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          {(["overview", "edit"] as SubTabId[]).map((tab) => (
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
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              {/* Banner Mockup */}
              <div
                className="relative h-48 bg-gradient-to-r from-[#152a45] via-[#1e3a5f] to-[#2c5282] bg-cover bg-center"
                style={bannerUrl ? { backgroundImage: `url(${bannerUrl})` } : undefined}
              />
              <div className="px-6 pb-6 relative">
                {/* Avatar Mockup */}
                <div className="absolute -top-12 left-6 w-24 h-24 rounded-full ring-4 ring-white overflow-hidden bg-white shadow flex items-center justify-center">
                  {avatarPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarPreview} alt={displayCompany} className="w-full h-full object-cover" />
                  ) : (
                    <Avatar name={displayCompany} size="xl" className="w-full h-full rounded-full" />
                  )}
                </div>

                <div className="pt-16 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{displayCompany}</h1>
                    <p className="text-gray-500 font-medium text-sm mt-0.5">
                      {title ? `${title} — ${displayContact}` : displayContact}
                    </p>
                    <div className="flex flex-wrap gap-y-1 gap-x-4 mt-3 text-xs text-gray-400">
                      {location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={13} /> {location}
                        </span>
                      )}
                      {websiteLink && (
                        <a
                          href={websiteLink.startsWith("http") ? websiteLink : `https://${websiteLink}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:text-[#1e3a5f] transition-colors"
                        >
                          <Globe size={13} /> {websiteLink}
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab("edit")}
                      className="gap-1.5 text-xs"
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
                      <h3 className="text-sm font-bold text-gray-900 mb-2.5">About Us</h3>
                      <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-wrap">
                        {bio || "Write a brief description of your company in the Edit tab to show candidates your mission."}
                      </p>
                    </div>
                  </div>

                  {/* Right metadata column */}
                  <div className="space-y-6 border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-6">
                    <div>
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                        Contact Info
                      </h3>
                      <ul className="space-y-3">
                        <li className="flex items-center gap-2 text-sm text-gray-600">
                          <UserIcon size={15} className="text-gray-400" />
                          <div>
                            <p className="font-semibold text-gray-900 leading-none">{displayContact}</p>
                            <p className="text-[10px] text-gray-400 mt-1">{title || "Representative"}</p>
                          </div>
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail size={15} className="text-gray-400" />
                          <span className="truncate">{fullUser?.email}</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                        Social Handles
                      </h3>
                      <div className="flex gap-2.5">
                        {linkedinLink ? (
                          <a
                            href={linkedinLink.startsWith("http") ? linkedinLink : `https://${linkedinLink}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-450 hover:text-[#0077b5] hover:bg-blue-50 transition-colors"
                          >
                            <Linkedin size={15} />
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400 italic">No LinkedIn linked</span>
                        )}
                        {twitterLink && (
                          <a
                            href={twitterLink.startsWith("http") ? twitterLink : `https://${twitterLink}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-450 hover:text-[#1da1f2] hover:bg-blue-50 transition-colors"
                          >
                            <Twitter size={15} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
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
                    className="text-xs h-9 bg-gray-100 text-gray-650 hover:bg-gray-200"
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
                  className="bg-gray-100 text-gray-650 hover:bg-gray-200 rounded-xl"
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
