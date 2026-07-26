"use client";


import React from "react";
import { User } from "@/types";
import { Button } from "@/components/ui/Button";
import {
  MapPin,
  Clock,
  Briefcase,
  GraduationCap,
  Globe,
  Award,
  CheckCircle2,
  Tag,
  MessageSquare,
  Folder,
  Send,
  Camera,
  Edit,
  ExternalLink,
  Copy,
  Sparkles,
  Check,
} from "lucide-react";
import { Linkedin } from "@/components/ui/BrandIcons";
import { useToast } from "@/components/ui/Toast";

interface TalentProfileOverviewProps {
  user: User;
  isOwner?: boolean;
  isEmployer?: boolean;
  onEditProfile?: () => void;
  onHire?: () => void;
  onMessage?: () => void;
  hireRequestSent?: boolean;
  bannerUrl?: string | null;
  onBannerChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  avatarPreview?: string | null;
  publicViewUrl?: string;
}

export function TalentProfileOverview({
  user,
  isOwner = false,
  isEmployer = false,
  onEditProfile,
  onHire,
  onMessage,
  hireRequestSent = false,
  bannerUrl,
  onBannerChange,
  avatarPreview,
  publicViewUrl,
}: TalentProfileOverviewProps) {
  const { success } = useToast();

  const displayName = user.name || "Freelancer";
  const avatarSrc = avatarPreview || user.avatar;
  const ratingAvg = user.ratingAvg ? user.ratingAvg.toFixed(1) : "5.0";
  const ratingCount = user.ratingCount || 0;
  const languagesStr = user.languages && user.languages.length > 0 ? user.languages.join(", ") : "English";

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "Jul 2026";

  const copyToClipboard = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      success("Profile link copied to clipboard!");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
      {/* ── LEFT COLUMN (Banner + Profile Info + Main Content + Education) ───── */}
      <div className="space-y-6 min-w-0">
        {/* Cover Banner & Profile Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
          {/* Cover Banner Image / Gradient */}
          <div
            className="relative h-40 sm:h-48 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 bg-cover bg-center"
            style={bannerUrl ? { backgroundImage: `url(${bannerUrl})` } : undefined}
          >
            {!bannerUrl && (
              <div className="w-full h-full flex items-center justify-center opacity-15 text-white font-bold text-lg tracking-widest uppercase select-none">
                WINKGETJOB TALENT
              </div>
            )}

            {isOwner && onBannerChange && (
              <label
                htmlFor="banner-upload-overview"
                className="absolute bottom-3 right-3 p-2 bg-black/50 hover:bg-black/75 backdrop-blur-md rounded-xl text-white text-xs font-medium cursor-pointer flex items-center gap-1.5 transition-all opacity-90 sm:opacity-0 hover:opacity-100 shadow-sm"
              >
                <Camera size={14} /> Change Banner
                <input
                  id="banner-upload-overview"
                  type="file"
                  accept="image/*"
                  onChange={onBannerChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Profile Header Info Block */}
          <div className="p-6 pt-0 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-end gap-4">
                {/* Overlapping Avatar */}
                <div className="relative -mt-10 sm:-mt-14 flex-shrink-0">
                  {avatarSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarSrc}
                      alt={displayName}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-white shadow-sm bg-white"
                    />
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#1e3a5f] to-[#0b192c] text-white font-bold text-2xl flex items-center justify-center ring-4 ring-white shadow-sm uppercase">
                      {displayName.charAt(0)}
                    </div>
                  )}
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-600 ring-2 ring-white flex items-center justify-center text-white shadow-sm">
                    <Check size={11} />
                  </span>
                </div>

                {/* Title & Info */}
                <div className="min-w-0 pt-2">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h1 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-1.5">
                      {displayName}
                      <CheckCircle2 size={16} className="text-blue-600 fill-blue-50" />
                    </h1>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                      • Available
                    </span>
                  </div>

                  <p className="text-xs font-medium text-slate-500">
                    {user.title || user.category || "Freelancer"}{user.yearsOfExperience ? ` · ${user.yearsOfExperience} years exp` : ""}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1.5 font-medium">
                    <span className="flex items-center gap-1 text-amber-600 font-semibold">
                      ★ {ratingAvg} <span className="text-slate-400 font-normal">({ratingCount} reviews)</span>
                    </span>
                    {user.location && (
                      <span className="flex items-center gap-1 text-slate-500">
                        <MapPin size={12} className="text-slate-400" /> {user.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-Stats Strip */}
            <div className="grid grid-cols-3 gap-4 pt-4 text-left">
              <div>
                <span className="text-[11px] text-slate-400 font-normal block">Jobs Done</span>
                <span className="text-sm font-bold text-slate-900">{user.jobsDoneCount || 0}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-normal block">Success</span>
                <span className="text-sm font-bold text-slate-900">{user.jobSuccessRate || 100}%</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-normal block">Response</span>
                <span className="text-sm font-bold text-slate-900">{user.responseTime || "within 1 hour"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* About Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3.5">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <span className="w-1.5 h-4 bg-[#1e3a5f] rounded-full inline-block" /> About
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-wrap font-normal">
            {user.bio || (isOwner ? "No bio added yet. Click 'Edit Profile' to add your professional summary." : "No professional summary provided yet.")}
          </p>
        </div>

        {/* Skills Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3.5">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <span className="w-1.5 h-4 bg-[#1e3a5f] rounded-full inline-block" /> Skills
          </div>
          {!user.skills || user.skills.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No skills added yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {user.skills.map((s) => (
                <span key={s} className="px-3.5 py-1 rounded-full bg-indigo-50/70 text-indigo-700 border border-indigo-100/80 text-xs font-medium">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Portfolio Highlights Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3.5">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <span className="w-1.5 h-4 bg-[#1e3a5f] rounded-full inline-block" /> Portfolio Highlights
          </div>
          {!user.portfolio || user.portfolio.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No portfolio projects added yet.</p>
          ) : (
            <div className="space-y-3">
              {user.portfolio.map((item, idx) => (
                <div key={idx} className="flex gap-3.5 items-start p-3.5 bg-slate-50/60 rounded-xl border border-slate-200/60">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Folder size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">{item.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.description}</p>
                    {item.link && (
                      <a href={item.link} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 font-medium hover:underline mt-1 inline-block">
                        View Project →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Work Experience Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3.5">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <span className="w-1.5 h-4 bg-[#1e3a5f] rounded-full inline-block" /> Work Experience
          </div>
          {!user.workExperience || user.workExperience.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No work experience history added yet.</p>
          ) : (
            <div className="space-y-3">
              {user.workExperience.map((exp, idx) => (
                <div key={idx} className="flex gap-3 items-start p-3.5 bg-slate-50/60 rounded-xl border border-slate-200/60">
                  <div className="w-2 h-2 rounded-full bg-[#1e3a5f] mt-1.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{exp.position}</h4>
                      <span className="text-[11px] text-slate-400 font-normal flex-shrink-0">
                        {exp.startYear} - {exp.endYear || "Present"}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-indigo-600 mt-0.5">{exp.company}</p>
                    {exp.description && (
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed whitespace-pre-wrap font-normal">{exp.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Education Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3.5">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <span className="w-1.5 h-4 bg-[#1e3a5f] rounded-full inline-block" /> Education
          </div>
          {!user.education || user.education.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No education history added yet.</p>
          ) : (
            <div className="space-y-2.5">
              {user.education.map((edu, idx) => (
                <div key={idx} className="flex gap-3 items-center p-3.5 bg-indigo-50/40 rounded-xl border border-indigo-100/70 text-xs">
                  <div className="w-8 h-8 rounded-lg bg-[#1e3a5f] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                    <GraduationCap size={16} />
                  </div>
                  <div>
                    <p className="font-bold text-xs sm:text-sm text-slate-900">{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{edu.school}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Certifications Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3.5">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <span className="w-1.5 h-4 bg-[#1e3a5f] rounded-full inline-block" /> Certifications
          </div>
          {!user.certifications || user.certifications.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No certifications added yet.</p>
          ) : (
            <div className="space-y-2">
              {user.certifications.map((cert, idx) => (
                <div key={idx} className="flex gap-3 items-center p-3 bg-slate-50/60 rounded-xl border border-slate-200/60 text-xs text-slate-800">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                    <Award size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900">{cert.name}</p>
                    {cert.issuer && <p className="text-[11px] font-normal text-slate-400">{cert.issuer} {cert.year ? `· ${cert.year}` : ""}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Client Reviews Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3.5">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <span className="w-1.5 h-4 bg-[#1e3a5f] rounded-full inline-block" /> Client Reviews
          </div>
          <p className="text-xs text-slate-400 italic">No client reviews yet.</p>
        </div>
      </div>

      {/* ── RIGHT COLUMN: FIXED SIDEBAR WITH CENTERED NAVY RATE BG & REDUCED BOLDNESS ───── */}
      <div className="space-y-6 lg:sticky lg:top-6 flex-shrink-0 w-full">
        {/* Main Sidebar Card with Navy Background Header */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Highlighted Navy Background Header Box (Centered) */}
          <div className="bg-gradient-to-br from-[#1e3a5f] via-[#162d4a] to-[#0f172a] text-white p-5 text-center flex flex-col items-center justify-center space-y-4">
            <div className="text-center space-y-1.5 flex flex-col items-center">
              <div className="text-3xl font-bold text-white tracking-tight flex items-baseline justify-center gap-1">
                ₹{user.hourlyRate || 0}<span className="text-xs font-normal text-slate-300">/Hr</span>
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
                • Available for new projects
              </div>
            </div>

            <div className="space-y-2 pt-1 w-full">
              {isOwner ? (
                <>
                  <Button
                    type="button"
                    onClick={onEditProfile}
                    className="w-full py-2.5 rounded-xl font-semibold text-xs bg-white hover:bg-slate-100 text-[#1e3a5f] shadow-xs transition-all border-0 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Edit size={14} /> Edit Profile Fields
                  </Button>
                  {publicViewUrl && (
                    <a href={publicViewUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full py-2 rounded-xl font-medium text-xs border-white/20 text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                      >
                        <ExternalLink size={13} /> View Public View
                      </Button>
                    </a>
                  )}
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    disabled={hireRequestSent}
                    onClick={onHire}
                    className={`w-full py-2.5 rounded-xl font-semibold text-xs shadow-xs transition-all flex items-center justify-center gap-2 border-0 cursor-pointer ${
                      hireRequestSent
                        ? "bg-emerald-600 text-white"
                        : "bg-white hover:bg-slate-100 text-[#1e3a5f]"
                    }`}
                  >
                    <Sparkles size={14} /> {hireRequestSent ? "Hire Request Sent" : "Hire Talent"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onMessage}
                    className="w-full py-2 rounded-xl font-medium text-xs border-white/20 text-white hover:bg-white/10 flex items-center justify-center gap-2"
                  >
                    <Send size={13} /> Message Candidate
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Meta Items List (Lightened Font Weight for Clean Aesthetic) */}
          <div className="p-5 space-y-3 text-xs">
            <div className="flex justify-between items-center text-slate-600">
              <span className="flex items-center gap-2 text-slate-400 font-normal"><Award size={14} /> Experience</span>
              <span className="font-medium text-slate-800">{user.experienceLevel || (user.yearsOfExperience ? `${user.yearsOfExperience} years` : "Intermediate")}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span className="flex items-center gap-2 text-slate-400 font-normal"><Tag size={14} /> Category</span>
              <span className="font-medium text-slate-800">{user.category || user.title || "Full stack Developer"}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span className="flex items-center gap-2 text-slate-400 font-normal"><MapPin size={14} /> Location</span>
              <span className="font-medium text-slate-800">{user.location || "Mumbai"}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span className="flex items-center gap-2 text-slate-400 font-normal"><Clock size={14} /> Response</span>
              <span className="font-medium text-slate-800">{user.responseTime || "within 1 hour"}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span className="flex items-center gap-2 text-slate-400 font-normal"><Clock size={14} /> Availability</span>
              <span className="font-medium text-slate-800">{user.weeklyAvailability || user.availability || "40 hrs/week"}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span className="flex items-center gap-2 text-slate-400 font-normal"><Globe size={14} /> Timezone</span>
              <span className="font-medium text-slate-800">{user.timezone || "IST (UTC+5:30)"}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span className="flex items-center gap-2 text-slate-400 font-normal"><MessageSquare size={14} /> Languages</span>
              <span className="font-medium text-slate-800">{languagesStr}</span>
            </div>
          </div>
        </div>

        {/* Highlights Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <span className="w-1.5 h-4 bg-[#1e3a5f] rounded-full inline-block" /> Highlights
          </div>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-normal">On-time delivery</span>
              <span className="font-medium text-slate-800">{user.onTimeDeliveryRate || 100}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-normal">Repeat clients</span>
              <span className="font-medium text-slate-800">{user.repeatClientsRate || 0}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-normal">Member since</span>
              <span className="font-medium text-slate-800">{memberSince}</span>
            </div>
          </div>
        </div>

        {/* Share Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <span className="w-1.5 h-4 bg-[#1e3a5f] rounded-full inline-block" /> Share Profile
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`, "_blank")}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Linkedin size={13} className="text-blue-600" /> LinkedIn
            </button>
            <button
              type="button"
              onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out ${displayName}'s profile: ${typeof window !== "undefined" ? window.location.href : ""}`)}`, "_blank")}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Send size={13} className="text-emerald-600" /> WhatsApp
            </button>
            <button
              type="button"
              onClick={copyToClipboard}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Copy size={13} /> Copy Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
