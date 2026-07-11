"use client";

import {
  useState, useEffect, useRef,
  FormEvent, KeyboardEvent, ChangeEvent,
} from "react";
import { useSession } from "next-auth/react";
import { authApi } from "@/lib/api";
import { User } from "@/types";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { formatDate, cn } from "@/lib/utils";
import {
  User as UserIcon, Settings, Bell, CreditCard,
  Camera, X, Plus, Eye, EyeOff, CheckCircle,
  Shield, Trash2, ChevronRight, Check,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = "profile" | "account" | "notifications" | "billing";

interface NotifPrefs {
  emailHireRequests: boolean;
  emailAppUpdates: boolean;
  browserNotifications: boolean;
  jobMatchAlerts: boolean;
  weeklyDigest: boolean;
}

const DEFAULT_NOTIF_PREFS: NotifPrefs = {
  emailHireRequests: true,
  emailAppUpdates: true,
  browserNotifications: false,
  jobMatchAlerts: true,
  weeklyDigest: false,
};

const AVAILABILITY_OPTIONS = [
  "Immediately", "1 week", "2 weeks", "1 month", "Not available",
];

const BANNER_KEY  = "winkgetjob_profile_banner";
const NOTIF_KEY   = "winkgetjob_notification_prefs";

// ─── Toggle Switch ────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, id }: { checked: boolean; onChange: (v: boolean) => void; id: string }) {
  return (
    <button
      role="switch"
      id={id}
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent",
        "transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a5f]",
        checked ? "bg-[#1e3a5f]" : "bg-gray-200"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow",
          "transform transition duration-200",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}

// ─── Section Heading ──────────────────────────────────────────────────────────

function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-5">
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      {description && <p className="text-sm text-gray-400 mt-0.5">{description}</p>}
    </div>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────

function Divider() {
  return <hr className="border-gray-100 my-6" />;
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────

function ProfileTab({ fullUser }: { fullUser: User | null }) {
  const { data: session, update } = useSession();
  const { success, error } = useToast();

  // Banner
  const [bannerUrl, setBannerUrl]       = useState<string | null>(null);
  const bannerInputRef                  = useRef<HTMLInputElement>(null);

  // Avatar
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef                    = useRef<HTMLInputElement>(null);

  // Form fields
  const [name, setName]                       = useState("");
  const [title, setTitle]                     = useState("");
  const [location, setLocation]               = useState("");
  const [hourlyRate, setHourlyRate]           = useState("");
  const [availability, setAvailability]       = useState("Immediately");
  const [yearsOfExp, setYearsOfExp]           = useState("");
  const [bio, setBio]                         = useState("");
  const [skills, setSkills]                   = useState<string[]>([]);
  const [skillInput, setSkillInput]           = useState("");
  const [saving, setSaving]                   = useState(false);

  // Pre-fill from getMe data
  useEffect(() => {
    // Restore banner from localStorage
    try {
      const saved = localStorage.getItem(BANNER_KEY);
      if (saved) setBannerUrl(saved);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!fullUser) return;
    setName(fullUser.name || "");
    setTitle(fullUser.title || "");
    setLocation(fullUser.location || "");
    setHourlyRate(fullUser.hourlyRate ? String(fullUser.hourlyRate) : "");
    setAvailability(fullUser.availability || "Immediately");
    setYearsOfExp(fullUser.yearsOfExperience ? String(fullUser.yearsOfExperience) : "");
    setBio(fullUser.bio || "");
    setSkills(fullUser.skills || []);
    if (fullUser.avatar) setAvatarPreview(fullUser.avatar);
  }, [fullUser]);

  // Banner upload
  const handleBannerChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) { error("Banner must be under 4MB"); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setBannerUrl(base64);
      try { localStorage.setItem(BANNER_KEY, base64); } catch { /* ignore */ }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Avatar upload
  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { error("Photo must be under 2MB"); return; }
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setAvatarPreview(base64);
      if (!session?.user.accessToken) return;
      try {
        await authApi.updateMe(session.user.accessToken, { avatar: base64 });
        success("Photo updated");
      } catch { error("Failed to upload photo"); }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Skills tag input
  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills((prev) => [...prev, s]);
    setSkillInput("");
  };
  const handleSkillKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); addSkill(); }
  };
  const removeSkill = (s: string) => setSkills((prev) => prev.filter((x) => x !== s));

  // Save profile
  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!session?.user.accessToken) return;
    setSaving(true);
    try {
      await authApi.updateMe(session.user.accessToken, {
        name, title, location, bio, skills,
        hourlyRate: hourlyRate ? Number(hourlyRate) : 0,
        yearsOfExperience: yearsOfExp ? Number(yearsOfExp) : 0,
        availability,
      });
      await update({ name });
      success("Profile saved successfully");
    } catch { error("Failed to save profile"); }
    finally { setSaving(false); }
  };

  const displayName = name || session?.user?.name || "User";

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* ── Banner ── */}
      <div
        className="relative h-32 sm:h-40"
        style={
          bannerUrl
            ? { backgroundImage: `url(${bannerUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
            : undefined
        }
      >
        {!bannerUrl && (
          <div className="absolute inset-0 bg-gradient-to-r from-[#152a45] via-[#1e3a5f] to-[#2c5282]" />
        )}
        {/* Change Banner button */}
        <button
          onClick={() => bannerInputRef.current?.click()}
          className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/40 hover:bg-black/55 text-white text-xs font-medium transition-colors backdrop-blur-sm"
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

      <div className="px-5 sm:px-6 pb-6">
        {/* ── Avatar row ── */}
        <div className="flex items-end gap-4 -mt-8 mb-5">
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-full ring-4 ring-white overflow-hidden">
              {avatarPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarPreview} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <Avatar name={displayName} size="xl" className="w-full h-full rounded-full" />
              )}
            </div>
            <button
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
          <div className="pb-1">
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="text-sm font-medium text-[#1e3a5f] hover:underline"
            >
              Upload photo
            </button>
            <p className="text-xs text-gray-400 mt-0.5">JPG, PNG or WebP · Max 2MB (banner 4MB)</p>
          </div>
        </div>

        <SectionHeading title="Public Profile" description="This information is visible to employers" />

        {/* ── Profile form ── */}
        <form onSubmit={handleSave} className="space-y-4">
          {/* 2-col grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Amit Verma"
              required
            />
            <Input
              label="Professional Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Full Stack Developer"
            />
            <Input
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Mumbai, India"
            />
            <Input
              label="Hourly Rate (₹/hr)"
              type="number"
              min="0"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              placeholder="500"
            />
            {/* Availability select */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700" htmlFor="availability">
                Availability
              </label>
              <select
                id="availability"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
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
              placeholder="3"
            />
          </div>

          {/* Bio */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700" htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              rows={4}
              placeholder="Tell employers about yourself, your experience, and what makes you stand out..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent resize-none"
            />
          </div>

          {/* Skills tag input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Skills</label>
            {/* Tag chips */}
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-1">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#edf2f7] border border-[#1e3a5f]/20 text-[#1e3a5f] text-xs font-medium"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => removeSkill(s)}
                      className="ml-0.5 text-[#1e3a5f] hover:text-[#1e3a5f] transition-colors"
                      aria-label={`Remove ${s}`}
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            {/* Input + Add button */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. React, Node.js, TypeScript"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKey}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
              />
              <Button type="button" variant="outline" size="sm" onClick={addSkill} className="gap-1">
                <Plus size={14} /> Add
              </Button>
            </div>
            <p className="text-xs text-gray-400">Press Enter or click Add to insert a skill</p>
          </div>

          <div className="pt-2">
            <Button type="submit" loading={saving} className="px-8">
              Save Profile
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Account Tab ──────────────────────────────────────────────────────────────

function AccountTab({ fullUser }: { fullUser: User | null }) {
  const { data: session } = useSession();
  const { success, error } = useToast();

  const [currentPwd, setCurrentPwd]   = useState("");
  const [newPwd, setNewPwd]           = useState("");
  const [confirmPwd, setConfirmPwd]   = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [pwdLoading, setPwdLoading]   = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    if (newPwd !== confirmPwd) { error("New passwords do not match"); return; }
    if (newPwd.length < 8)    { error("Password must be at least 8 characters"); return; }
    if (!session?.user.accessToken) return;
    setPwdLoading(true);
    try {
      await authApi.changePassword(session.user.accessToken, currentPwd, newPwd);
      success("Password changed successfully");
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
    } catch { error("Failed to change password — check your current password"); }
    finally { setPwdLoading(false); }
  };

  const userEmail = fullUser?.email || session?.user?.email || "";

  return (
    <div className="space-y-5">
      {/* Email */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
        <SectionHeading title="Email Address" description="Your login email — cannot be changed here" />
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <input
              type="email"
              value={userEmail}
              readOnly
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-500 cursor-not-allowed"
            />
          </div>
          <Badge variant="success" className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5">
            <CheckCircle size={11} /> Verified
          </Badge>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
        <SectionHeading title="Change Password" description="Use a strong password with at least 8 characters" />
        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700" htmlFor="currentPwd">Current Password</label>
            <div className="relative">
              <input
                id="currentPwd"
                type={showCurrent ? "text" : "password"}
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-10 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
              />
              <button type="button" onClick={() => setShowCurrent((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label="Toggle password visibility">
                {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700" htmlFor="newPwd">New Password</label>
            <div className="relative">
              <input
                id="newPwd"
                type={showNew ? "text" : "password"}
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                required
                placeholder="At least 8 characters"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-10 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
              />
              <button type="button" onClick={() => setShowNew((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label="Toggle password visibility">
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPwd}
            onChange={(e) => setConfirmPwd(e.target.value)}
            required
            error={confirmPwd && confirmPwd !== newPwd ? "Passwords do not match" : undefined}
          />
          <Button type="submit" loading={pwdLoading}>
            Change Password
          </Button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl border border-red-200 p-5 sm:p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
            <Shield size={15} className="text-red-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Danger Zone</h3>
            <p className="text-xs text-gray-400 mt-0.5">Irreversible actions for your account</p>
          </div>
        </div>
        <div className="flex items-center justify-between p-4 rounded-lg border border-red-100 bg-red-50">
          <div>
            <p className="text-sm font-medium text-gray-900">Delete Account</p>
            <p className="text-xs text-gray-400 mt-0.5">Permanently remove your account and all data</p>
          </div>
          <Button variant="danger" size="sm" className="gap-1.5" onClick={() => setDeleteModal(true)}>
            <Trash2 size={13} /> Delete
          </Button>
        </div>
      </div>

      {/* Delete confirmation modal */}
      <Modal open={deleteModal} onClose={() => setDeleteModal(false)} title="Delete Account" size="sm">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
            <Shield size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800 font-medium">
              This is irreversible. All your data, applications, and messages will be permanently deleted.
            </p>
          </div>
          <p className="text-sm text-gray-600">
            To delete your account, please contact our support team directly.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setDeleteModal(false)} fullWidth>
              Cancel
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={() => {
                setDeleteModal(false);
                alert("Please contact support@winkget.com to delete your account.");
              }}
            >
              Contact Support
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Notifications Tab ────────────────────────────────────────────────────────

const NOTIF_ROWS: { key: keyof NotifPrefs; label: string; description: string }[] = [
  { key: "emailHireRequests",  label: "New hire requests",     description: "Email me when an employer sends a hire request" },
  { key: "emailAppUpdates",    label: "Application updates",   description: "Email me when my application status changes" },
  { key: "browserNotifications", label: "Browser notifications", description: "Show desktop notifications when the app is open" },
  { key: "jobMatchAlerts",     label: "Job match alerts",      description: "Get notified about jobs matching your skills" },
  { key: "weeklyDigest",       label: "Weekly digest",         description: "A weekly summary of new jobs and activity" },
];

function NotificationsTab() {
  const { success } = useToast();
  const [prefs, setPrefs] = useState<NotifPrefs>(DEFAULT_NOTIF_PREFS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(NOTIF_KEY);
      if (raw) setPrefs({ ...DEFAULT_NOTIF_PREFS, ...JSON.parse(raw) });
    } catch { /* ignore */ }
  }, []);

  const handleToggle = (key: keyof NotifPrefs, value: boolean) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    try { localStorage.setItem(NOTIF_KEY, JSON.stringify(next)); } catch { /* ignore */ }
    success(value ? "Notification enabled" : "Notification disabled");
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
      <SectionHeading
        title="Notification Preferences"
        description="Choose how and when you want to be notified"
      />
      <div className="divide-y divide-gray-100">
        {NOTIF_ROWS.map(({ key, label, description }) => (
          <div key={key} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
            <div className="min-w-0">
              <label htmlFor={`toggle-${key}`} className="text-sm font-medium text-gray-900 cursor-pointer">
                {label}
              </label>
              <p className="text-xs text-gray-400 mt-0.5">{description}</p>
            </div>
            <Toggle
              id={`toggle-${key}`}
              checked={prefs[key]}
              onChange={(v) => handleToggle(key, v)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Billing Tab ──────────────────────────────────────────────────────────────

const FREE_FEATURES = [
  "Up to 5 job applications / month",
  "Basic public profile",
  "Browse all job listings",
  "Email support",
];

const PRO_FEATURES = [
  "Unlimited job applications",
  "Featured profile badge",
  "Priority in employer searches",
  "Advanced analytics & insights",
  "Direct message employers",
  "Priority email & chat support",
];

function BillingTab({ fullUser }: { fullUser: User | null }) {
  const { info } = useToast();
  const plan      = fullUser?.plan || "free";
  const isPro     = plan === "pro";

  return (
    <div className="space-y-5">
      {/* Current plan */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
        <SectionHeading title="Current Plan" />
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            {isPro ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-[#1e3a5f] to-[#1e3a5f] text-white shadow-sm">
                ✦ Pro Plan
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-700">
                Free Plan
              </span>
            )}
            {fullUser?.createdAt && (
              <p className="text-xs text-gray-400 mt-2">
                Member since {formatDate(fullUser.createdAt)}
              </p>
            )}
          </div>
        </div>
        <ul className="space-y-2">
          {FREE_FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
              <Check size={14} className="text-[#1e3a5f] flex-shrink-0" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      {/* Upgrade CTA */}
      {!isPro && (
        <div className="bg-white rounded-xl border-2 border-[#1e3a5f]/20 p-5 sm:p-6 relative overflow-hidden">
          {/* Background accent */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#edf2f7] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg font-bold text-gray-900">Upgrade to Pro</span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-700">
                Recommended
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Unlock unlimited applications and get noticed by top employers.
            </p>
            <ul className="space-y-2 mb-5">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                  <Check size={14} className="text-[#1e3a5f] flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              className="gap-2"
              onClick={() => info("Pro plan coming soon — stay tuned!")}
            >
              Upgrade Now
              <ChevronRight size={15} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sidebar nav config ───────────────────────────────────────────────────────

const TABS: { id: TabId; label: string; icon: typeof Settings }[] = [
  { id: "account",       label: "Account",       icon: Settings   },
  { id: "notifications", label: "Notifications", icon: Bell       },
  { id: "billing",       label: "Billing",       icon: CreditCard },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function JobSeekerSettings() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<TabId>("account");
  const [fullUser, setFullUser]   = useState<User | null>(null);

  // Pre-fill all form data from getMe on mount
  useEffect(() => {
    if (!session?.user.accessToken) return;
    authApi.getMe(session.user.accessToken)
      .then((res) => {
        const data = res as { success: boolean; user: User };
        if (data.user) setFullUser(data.user);
      })
      .catch(() => { /* non-critical — form still works from session */ });
  }, [session]);

  return (
    <div className="space-y-6 font-[family-name:var(--font-poppins)]">
      {/* Page header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-400 mt-0.5">
          Manage your{" "}
          <span className="text-[#1e3a5f] font-medium">account preferences</span>
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 items-start">

        {/* ── Left sidebar ── */}
        <nav className="bg-white rounded-xl border border-gray-200 p-2" aria-label="Settings navigation">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left",
                activeTab === id
                  ? "text-[#1e3a5f] bg-[#edf2f7]"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
              aria-current={activeTab === id ? "page" : undefined}
            >
              <Icon
                size={16}
                className={activeTab === id ? "text-[#1e3a5f]" : "text-gray-400"}
              />
              {label}
            </button>
          ))}
        </nav>

        {/* ── Right panel ── */}
        <div>
          {activeTab === "account"       && <AccountTab       fullUser={fullUser} />}
          {activeTab === "notifications" && <NotificationsTab />}
          {activeTab === "billing"       && <BillingTab       fullUser={fullUser} />}
        </div>
      </div>
    </div>
  );
}
