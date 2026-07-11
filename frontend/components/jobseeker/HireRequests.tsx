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
import { MessageSquare } from "lucide-react";

interface HireRequestsProps {
  requests: HireRequest[];
  onUpdate?: () => void;
}

export function HireRequestsList({ requests, onUpdate }: HireRequestsProps) {
  const { data: session } = useSession();
  const { success, error } = useToast();
  const router = useRouter();
  const [loading, setLoading]         = useState<string | null>(null);
  const [msgLoading, setMsgLoading]   = useState<string | null>(null);

  const respond = async (id: string, status: "accepted" | "rejected") => {
    if (!session?.user.accessToken) return;
    setLoading(id);
    try {
      await hireRequestsApi.updateStatus(session.user.accessToken, id, status);
      success(`Hire request ${status}`);
      onUpdate?.();
    } catch {
      error("Failed to update hire request");
    } finally {
      setLoading(null);
    }
  };

  const handleMessageEmployer = async (req: HireRequest) => {
    if (!session?.user.accessToken) return;
    const employerId =
      typeof req.employer === "object" ? req.employer._id : req.employer;
    const jobId =
      typeof req.job === "object" ? req.job._id : req.job;

    setMsgLoading(req._id);
    try {
      const res = (await messagesApi.getOrCreateConversation(
        session.user.accessToken,
        { participantId: employerId, jobId }
      )) as { success: boolean; data: { _id: string } };
      router.push(`/jobseeker/messages?thread=${res.data._id}`);
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
        const employer = typeof req.employer === "object" ? req.employer : null;
        const job      = typeof req.job      === "object" ? req.job      : null;

        return (
          <div
            key={req._id}
            className="bg-gray-50 rounded-xl p-4 space-y-3"
          >
            {/* Top row: avatar + info + status */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar
                  name={employer?.name || "Employer"}
                  src={employer?.avatar}
                  size="sm"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {employer?.company || employer?.name || "Employer"}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {job?.title || "Job"} · {formatCurrency(req.salary)}/mo ·{" "}
                    {formatRelativeTime(req.createdAt)}
                  </p>
                </div>
              </div>
              <Badge variant={statusBadge(req.status)} className="flex-shrink-0">
                {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
              </Badge>
            </div>

            {/* Action row */}
            <div className="flex items-center gap-2 flex-wrap">
              {req.status === "pending" && (
                <>
                  <Button
                    size="sm"
                    onClick={() => respond(req._id, "accepted")}
                    loading={loading === req._id}
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => respond(req._id, "rejected")}
                    loading={loading === req._id}
                  >
                    Decline
                  </Button>
                </>
              )}
              {/* Message Employer — always visible */}
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleMessageEmployer(req)}
                loading={msgLoading === req._id}
                className="gap-1.5 border-[#1e3a5f]/30 text-[#1e3a5f] hover:bg-[#edf2f7] ml-auto"
              >
                <MessageSquare size={13} />
                Message Employer
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
