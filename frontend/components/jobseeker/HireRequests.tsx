"use client";

import { HireRequest } from "@/types";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { useState } from "react";
import { hireRequestsApi } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { useSession } from "next-auth/react";

interface HireRequestsProps {
  requests: HireRequest[];
  onUpdate?: () => void;
}

export function HireRequestsList({ requests, onUpdate }: HireRequestsProps) {
  const { data: session } = useSession();
  const { success, error } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

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

  if (requests.length === 0) {
    return (
      <p className="text-sm text-gray-400 py-4 text-center">
        No hire requests yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {requests.slice(0, 4).map((req) => {
        const employer =
          typeof req.employer === "object" ? req.employer : null;
        const job = typeof req.job === "object" ? req.job : null;

        return (
          <div
            key={req._id}
            className="flex items-center justify-between bg-gray-50 rounded-xl p-4 gap-4"
          >
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
                  {job?.title || "Job"} • {formatCurrency(req.salary)} •{" "}
                  {formatRelativeTime(req.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {req.status === "pending" ? (
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
              ) : (
                <Badge variant={statusBadge(req.status)}>
                  {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                </Badge>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
