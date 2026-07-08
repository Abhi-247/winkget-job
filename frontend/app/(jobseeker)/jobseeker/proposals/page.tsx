"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { hireRequestsApi } from "@/lib/api";
import { HireRequest, HireRequestStatus } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { formatCurrency, formatRelativeTime, cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { FileText, ExternalLink } from "lucide-react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = "pending" | "accepted" | "rejected" | "withdrawn";

const TABS: { id: TabId; label: string }[] = [
  { id: "pending",   label: "Pending" },
  { id: "accepted",  label: "Accepted" },
  { id: "rejected",  label: "Not Selected" },
  { id: "withdrawn", label: "Withdrawn" },
];

// ─── Stat Counter Card ────────────────────────────────────────────────────────

function StatCounter({
  count, label, active, color, bg, onClick,
}: {
  count: number; label: string; active: boolean;
  color: string; bg: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-xl p-5 text-left transition-all border-2",
        active
          ? `${bg} border-current ${color}`
          : `${bg} border-transparent hover:border-gray-200`
      )}
    >
      <div className={cn("text-3xl font-bold mb-1", active ? color : "text-gray-800")}>
        {count}
      </div>
      <div className={cn("text-sm font-medium", active ? color : "text-gray-500")}>
        {label}
      </div>
    </button>
  );
}

// ─── Proposal Row Card ────────────────────────────────────────────────────────

function ProposalRow({
  req,
  onRespond,
  responding,
}: {
  req: HireRequest;
  onRespond: (id: string, status: "accepted" | "rejected") => void;
  responding: string | null;
}) {
  const employer = typeof req.employer === "object" ? req.employer : null;
  const job      = typeof req.job      === "object" ? req.job      : null;

  const statusLabel =
    req.status === "rejected" ? "Not Selected" :
    req.status.charAt(0).toUpperCase() + req.status.slice(1);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 hover:shadow-sm transition-shadow">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Avatar name={employer?.company || employer?.name || "Co"} size="md" />
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 truncate">
              {job?.title || "—"}
            </h4>
            <p className="text-xs font-medium text-[#1e3a5f] mt-0.5 truncate">
              {employer?.company || employer?.name || "—"}
            </p>
          </div>
        </div>
        <Badge variant={statusBadge(req.status)} className="flex-shrink-0 mt-0.5">
          {statusLabel}
        </Badge>
      </div>

      {/* Meta row */}
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
        <span>
          Offer: <span className="text-gray-700 font-medium">{formatCurrency(req.salary)}/mo</span>
        </span>
        <span className="text-gray-200 hidden sm:inline">·</span>
        <span>
          Received: <span className="text-gray-600 font-medium">{formatRelativeTime(req.createdAt)}</span>
        </span>
        {req.message && (
          <>
            <span className="text-gray-200 hidden sm:inline">·</span>
            <span className="truncate max-w-[200px] italic text-gray-400">
              &ldquo;{req.message}&rdquo;
            </span>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2">
        {req.status === "pending" ? (
          <>
            <Button
              size="sm"
              onClick={() => onRespond(req._id, "accepted")}
              loading={responding === req._id}
            >
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-red-300 text-red-500 hover:bg-red-50"
              onClick={() => onRespond(req._id, "rejected")}
              loading={responding === req._id}
            >
              Decline
            </Button>
          </>
        ) : null}
        {job && (
          <Link href={`/jobs/${job._id}`}>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-[#1e3a5f] hover:text-[#1e3a5f] hover:bg-[#edf2f7]"
            >
              View Job
              <ExternalLink size={12} />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ tab }: { tab: TabId }) {
  const messages: Record<TabId, string> = {
    pending:   "No pending proposals from employers.",
    accepted:  "No accepted proposals yet.",
    rejected:  "No declined proposals.",
    withdrawn: "No withdrawn proposals.",
  };

  return (
    <div className="text-center py-16">
      <div className="w-14 h-14 bg-[#edf2f7] rounded-full flex items-center justify-center mx-auto mb-3">
        <FileText size={22} className="text-blue-300" />
      </div>
      <p className="text-sm font-medium text-gray-600 mb-1">
        {messages[tab]}
      </p>
      <p className="text-xs text-gray-400">
        Employers can invite you to jobs — proposals will appear here.
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProposalsPage() {
  const { data: session, status } = useSession();
  const { success, error } = useToast();

  const [requests, setRequests]     = useState<HireRequest[]>([]);
  const [loading, setLoading]       = useState(true);
  const [activeTab, setActiveTab]   = useState<TabId>("pending");
  const [responding, setResponding] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    if (!session?.user.accessToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = (await hireRequestsApi.getMy(
        session.user.accessToken
      )) as { data: HireRequest[] };
      setRequests(res.data || []);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (status === "loading") return;
    fetchRequests();
  }, [fetchRequests, status]);

  const handleRespond = async (id: string, status: "accepted" | "rejected") => {
    if (!session?.user.accessToken) return;
    setResponding(id);
    try {
      await hireRequestsApi.updateStatus(session.user.accessToken, id, status);
      success(`Proposal ${status}`);
      fetchRequests();
    } catch {
      error("Failed to update proposal");
    } finally {
      setResponding(null);
    }
  };

  // Counts — "withdrawn" = approximation (show 0 for now)
  const counts: Record<TabId, number> = {
    pending:   requests.filter((r) => r.status === "pending").length,
    accepted:  requests.filter((r) => r.status === "accepted").length,
    rejected:  requests.filter((r) => r.status === "rejected").length,
    withdrawn: 0,
  };

  const statCards: { id: TabId; label: string; color: string; bg: string }[] = [
    { id: "pending",   label: "Pending",      color: "text-amber-600",  bg: "bg-amber-50"  },
    { id: "accepted",  label: "Accepted",     color: "text-[#1e3a5f]",  bg: "bg-[#edf2f7]"  },
    { id: "rejected",  label: "Not Selected", color: "text-red-500",    bg: "bg-red-50"    },
    { id: "withdrawn", label: "Withdrawn",    color: "text-gray-500",   bg: "bg-gray-100"  },
  ];

  const filtered: HireRequest[] =
    activeTab === "withdrawn"
      ? []
      : requests.filter((r) => r.status === (activeTab as HireRequestStatus));

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Proposals</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Hire invitations sent to you by employers
          </p>
        </div>
        <Link href="/jobs">
          <Button variant="outline" size="sm" className="self-start sm:self-auto">
            Browse Employers
          </Button>
        </Link>
      </div>

      {/* ── Stat Counter Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <StatCounter
            key={card.id}
            count={counts[card.id]}
            label={card.label}
            active={activeTab === card.id}
            color={card.color}
            bg={card.bg}
            onClick={() => setActiveTab(activeTab === card.id ? "pending" : card.id)}
          />
        ))}
      </div>

      {/* ── Tab row + content ── */}
      <div className="bg-white rounded-xl border border-gray-200">
        {/* Tabs */}
        <div className="px-5 border-b border-gray-100 flex items-center gap-0.5 overflow-x-auto" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap",
                activeTab === tab.id
                  ? "border-blue-600 text-[#1e3a5f]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-xs",
                  activeTab === tab.id
                    ? "bg-blue-100 text-[#1e3a5f]"
                    : "bg-gray-100 text-gray-500"
                )}
              >
                {counts[tab.id]}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState tab={activeTab} />
          ) : (
            filtered.map((req) => (
              <ProposalRow
                key={req._id}
                req={req}
                onRespond={handleRespond}
                responding={responding}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
