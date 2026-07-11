"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Application, ApplicationStatus, User } from "@/types";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { usersApi, hireRequestsApi, messagesApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import {
  X,
  MapPin,
  Calendar,
  Briefcase,
  CheckCircle2,
  XCircle,
  Star as StarIcon,
  Send,
  MessageSquare,
} from "lucide-react";

interface ApplicantProfileDrawerProps {
  application: Application | null;
  onClose: () => void;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
}

function DrawerSkeleton() {
  return (
    <div className="animate-pulse p-6 space-y-5">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gray-200 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gray-200 rounded w-2/3" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
      {[80, 100, 70, 90, 60].map((w) => (
        <div key={w} className="h-4 bg-gray-200 rounded" style={{ width: `${w}%` }} />
      ))}
    </div>
  );
}

export function ApplicantProfileDrawer({
  application,
  onClose,
  onStatusChange,
}: ApplicantProfileDrawerProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<User | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [messagingLoading, setMessagingLoading] = useState(false);

  // Hire-request inline form state
  const [hireFormOpen, setHireFormOpen] = useState(false);
  const [hireSalary, setHireSalary] = useState("");
  const [hireMessage, setHireMessage] = useState("");
  const [hireLoading, setHireLoading] = useState(false);

  // Fetch full profile whenever the drawer opens for a new applicant
  useEffect(() => {
    if (!application || !session?.user.accessToken) return;
    const applicantId =
      typeof application.applicant === "object"
        ? application.applicant._id
        : application.applicant;

    setProfile(null);
    setHireFormOpen(false);
    setProfileLoading(true);

    (usersApi.getUserById(session.user.accessToken, applicantId) as Promise<{ data: User }>)
      .then((res) => setProfile(res.data))
      .catch(() => setProfile(null))
      .finally(() => setProfileLoading(false));
  }, [application, session]);

  const handleHireRequest = async () => {
    if (!session?.user.accessToken || !application) return;
    const applicantId =
      typeof application.applicant === "object"
        ? application.applicant._id
        : application.applicant;
    const jobId =
      typeof application.job === "object"
        ? application.job._id
        : application.job;

    setHireLoading(true);
    try {
      await hireRequestsApi.create(session.user.accessToken, {
        jobseekerId: applicantId,
        jobId,
        salary: Number(hireSalary),
        message: hireMessage,
      });
      setHireFormOpen(false);
      setHireSalary("");
      setHireMessage("");
    } finally {
      setHireLoading(false);
    }
  };

  const handleMessage = async () => {
    if (!session?.user.accessToken || !application) return;
    const applicantId =
      typeof application.applicant === "object"
        ? application.applicant._id
        : application.applicant;
    const jobId =
      typeof application.job === "object"
        ? application.job._id
        : application.job;

    setMessagingLoading(true);
    try {
      const res = (await messagesApi.getOrCreateConversation(
        session.user.accessToken,
        { participantId: applicantId, jobId }
      )) as { success: boolean; data: { _id: string } };
      onClose();
      router.push(`/employer/messages?thread=${res.data._id}`);
    } catch {
      // navigation failed silently
    } finally {
      setMessagingLoading(false);
    }
  };

  const isOpen = !!application;
  const applicant =
    typeof application?.applicant === "object" ? application.applicant : null;
  const job =
    typeof application?.job === "object" ? application.job : null;
  const displayProfile = profile ?? applicant;
  const status = application?.status;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-white shadow-2xl flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* ── Header ───────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <span className="text-sm font-semibold text-gray-700">Applicant Profile</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Scrollable body ──────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto pb-32">
          {profileLoading ? (
            <DrawerSkeleton />
          ) : !displayProfile ? (
            <div className="p-6 text-center text-gray-400 text-sm">
              Failed to load profile.
            </div>
          ) : (
            <>
              {/* Profile hero */}
              <div className="bg-gradient-to-br from-gray-50 to-white px-6 py-6 border-b border-gray-100">
                <div className="flex items-start gap-4">
                  <Avatar
                    name={displayProfile.name}
                    src={displayProfile.avatar}
                    size="xl"
                    className="flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h2 className="text-lg font-bold text-gray-900">
                        {displayProfile.name}
                      </h2>
                      {status && (
                        <Badge variant={statusBadge(status)}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Badge>
                      )}
                    </div>
                    {displayProfile.title && (
                      <p className="text-sm text-gray-500 mb-1.5">{displayProfile.title}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                      {displayProfile.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={11} /> {displayProfile.location}
                        </span>
                      )}
                      {displayProfile.plan && (
                        <span className={`px-2 py-0.5 rounded-full font-medium text-xs ${
                          displayProfile.plan === "pro"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          {displayProfile.plan === "pro" ? "⭐ Pro" : "Free Plan"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-5 space-y-6">
                {/* Application meta */}
                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-gray-400" />
                    Applied {application ? formatDate(application.createdAt) : "—"}
                  </span>
                  {job && (
                    <span className="flex items-center gap-1.5">
                      <Briefcase size={13} className="text-gray-400" />
                      {job.title}
                    </span>
                  )}
                </div>

                {/* About / Bio */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    About
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {displayProfile.bio || "No bio provided."}
                  </p>
                </div>

                {/* Skills */}
                {displayProfile.skills && displayProfile.skills.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                      Skills
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {displayProfile.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-0.5 rounded-full bg-[#edf2f7] text-[#1e3a5f] text-xs border border-[#1e3a5f]/20"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cover Letter */}
                {application?.coverLetter && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                      Cover Letter
                    </h3>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p className="text-sm text-gray-700 leading-relaxed italic">
                        "{application.coverLetter}"
                      </p>
                    </div>
                  </div>
                )}

                {/* Hire Request inline form */}
                {hireFormOpen && (
                  <div className="bg-[#edf2f7] border border-[#1e3a5f]/20 rounded-xl p-4 space-y-3">
                    <p className="text-sm font-semibold text-blue-900">Send Hire Request</p>
                    <div>
                      <label className="text-xs text-[#1e3a5f] font-medium block mb-1">
                        Offer Salary (₹/mo)
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 50000"
                        value={hireSalary}
                        onChange={(e) => setHireSalary(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-[#1e3a5f]/20 rounded-lg focus:ring-2 focus:ring-blue-400 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#1e3a5f] font-medium block mb-1">
                        Message (optional)
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Tell them why you'd like to hire them…"
                        value={hireMessage}
                        onChange={(e) => setHireMessage(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-[#1e3a5f]/20 rounded-lg focus:ring-2 focus:ring-blue-400 bg-white resize-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleHireRequest}
                        loading={hireLoading}
                        disabled={!hireSalary}
                        className="gap-1.5"
                      >
                        <Send size={13} />
                        Send Request
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setHireFormOpen(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Sticky action bar ─────────────────────────────────────── */}
        {application && !profileLoading && (
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 flex flex-wrap gap-2">
            <Button
              size="sm"
              disabled={status === "accepted"}
              onClick={() => onStatusChange(application._id, "accepted")}
              className="gap-1.5 flex-1 sm:flex-none"
            >
              <CheckCircle2 size={14} />
              Accept
            </Button>
            <Button
              size="sm"
              variant="danger"
              disabled={status === "rejected"}
              onClick={() => onStatusChange(application._id, "rejected")}
              className="gap-1.5 flex-1 sm:flex-none"
            >
              <XCircle size={14} />
              Reject
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={status === "shortlisted"}
              onClick={() => onStatusChange(application._id, "shortlisted")}
              className="text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 gap-1.5 flex-1 sm:flex-none"
            >
              <StarIcon size={13} />
              Shortlist
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setHireFormOpen(!hireFormOpen)}
              className="gap-1.5 flex-1 sm:flex-none"
            >
              <Send size={13} />
              Hire Request
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleMessage}
              loading={messagingLoading}
              className="gap-1.5 flex-1 sm:flex-none border-[#1e3a5f]/30 text-[#1e3a5f] hover:bg-[#edf2f7]"
            >
              <MessageSquare size={13} />
              Message
            </Button>
          </div>
        )}
      </aside>
    </>
  );
}
