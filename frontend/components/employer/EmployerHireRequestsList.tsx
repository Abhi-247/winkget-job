"use client";

import { HireRequest } from "@/types";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { useState } from "react";
import { hireRequestsApi, messagesApi } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MessageSquare, ExternalLink, User, X, ClipboardList } from "lucide-react";
import Link from "next/link";

interface EmployerHireRequestsProps {
  requests: HireRequest[];
  onUpdate?: () => void;
  /** updateCounts keyed by req._id — employer sees how many updates exist */
  updateCounts?: Record<string, number>;
  /** called when employer clicks "View Progress" */
  onViewProgress?: (refId: string, title: string) => void;
}

export function EmployerHireRequestsList({ requests, onUpdate, updateCounts = {}, onViewProgress }: EmployerHireRequestsProps) {
  const { data: session } = useSession();
  const { success, error } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [msgLoading, setMsgLoading] = useState<string | null>(null);

  const handleWithdraw = async (id: string) => {
    if (!session?.user.accessToken) return;
    if (!confirm("Are you sure you want to withdraw this hire request?")) return;

    setLoading(id);
    try {
      await hireRequestsApi.withdraw(session.user.accessToken, id);
      success("Hire request withdrawn");
      onUpdate?.();
    } catch {
      error("Failed to withdraw hire request");
    } finally {
      setLoading(null);
    }
  };

  const handleMessageJobseeker = async (req: HireRequest) => {
    if (!session?.user.accessToken) return;
    const jobseekerId =
      typeof req.jobseeker === "object" ? req.jobseeker._id : req.jobseeker;
    const jobId =
      typeof req.job === "object" ? req.job._id : req.job;

    setMsgLoading(req._id);
    try {
      const res = (await messagesApi.getOrCreateConversation(
        session.user.accessToken,
        { participantId: jobseekerId, jobId }
      )) as { success: boolean; data: { _id: string } };
      router.push(`/employer/messages?thread=${res.data._id}`);
    } catch {
      error("Could not open conversation");
    } finally {
      setMsgLoading(null);
    }
  };

  if (requests.length === 0) {
    return (
      <p className="text-sm text-gray-400 py-4 text-center">
        No hire requests yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((req) => {
        const jobseeker = typeof req.jobseeker === "object" ? req.jobseeker : null;
        const job = typeof req.job === "object" ? req.job : null;
        const isFreelance = req.hireType === "freelance";

        return (
          <div
            key={req._id}
            className="bg-gray-50 rounded-xl p-4 space-y-3"
          >
            {/* Top row: avatar + info + status */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar
                  name={jobseeker?.name || "Jobseeker"}
                  src={jobseeker?.avatar}
                  size="sm"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {jobseeker?.name || "Jobseeker"}
                    {jobseeker?.title && (
                      <span className="text-gray-400 font-normal"> · {jobseeker.title}</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {isFreelance ? req.projectTitle : (job?.title || "Job")} · {formatCurrency(req.salary)}/mo ·{" "}
                    {formatRelativeTime(req.createdAt)}
                    {isFreelance && <span className="ml-1">· Freelance</span>}
                  </p>
                </div>
              </div>
              <Badge variant={statusBadge(req.status)} className="flex-shrink-0">
                {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
              </Badge>
            </div>

            {/* Message preview */}
            {req.message && (
              <p className="text-xs text-gray-500 italic bg-white p-2 rounded-lg border border-gray-100">
                &ldquo;{req.message}&rdquo;
              </p>
            )}

            {/* Freelance skills preview */}
            {isFreelance && req.projectSkills && req.projectSkills.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {req.projectSkills.slice(0, 3).map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full"
                  >
                    {skill}
                  </span>
                ))}
                {req.projectSkills.length > 3 && (
                  <span className="text-xs text-gray-500">+{req.projectSkills.length - 3} more</span>
                )}
              </div>
            )}

            {/* Action row */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/60">
              {/* View Profile */}
              {jobseeker && (
                <Link href={`/talent/${jobseeker._id}`}>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all cursor-pointer">
                    <User size={13} />
                    <span>View Profile</span>
                  </button>
                </Link>
              )}

              {/* View Job - only for job-based hiring */}
              {!isFreelance && job && (
                <Link href={`/jobs/${job._id}`}>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200/70 bg-white text-slate-600 hover:bg-slate-50 transition-all cursor-pointer">
                    <ExternalLink size={13} />
                    <span>View Job</span>
                  </button>
                </Link>
              )}

              {/* Message Jobseeker — always visible */}
              <button
                onClick={() => handleMessageJobseeker(req)}
                disabled={msgLoading === req._id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#edf2f7] text-[#1e3a5f] hover:bg-[#e2e8f0] transition-all cursor-pointer"
              >
                <MessageSquare size={13} />
                <span>{msgLoading === req._id ? "Opening..." : "Message"}</span>
              </button>

              {/* View Progress — accepted requests only */}
              {req.status === "accepted" && onViewProgress && (
                <button
                  onClick={() => {
                    const isFreelance = req.hireType === "freelance";
                    const job = typeof req.job === "object" ? req.job : null;
                    const title = isFreelance
                      ? (req.projectTitle || "Freelance Project")
                      : (job?.title || "Hire Request");
                    onViewProgress(req._id, title);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-all cursor-pointer"
                >
                  <ClipboardList size={13} />
                  <span>{updateCounts[req._id] ? `Progress (${updateCounts[req._id]})` : "View Progress"}</span>
                </button>
              )}

              {/* Withdraw — only for pending */}
              {req.status === "pending" && (
                <button
                  onClick={() => handleWithdraw(req._id)}
                  disabled={loading === req._id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 hover:border-rose-300 transition-all cursor-pointer"
                >
                  <X size={13} />
                  <span>{loading === req._id ? "Withdrawing..." : "Withdraw"}</span>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
