"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { tasksApi, messagesApi } from "@/lib/api";
import { TaskClaim } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { TableRowSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import {
  FileText,
  X,
  ExternalLink,
  ClipboardList,
  Plus,
  Calendar,
  MessageSquare,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReviewModal } from "@/components/ui/ReviewModal";

type TabId = "all" | "pending" | "approved" | "completed" | "rejected";

const TABS: { id: TabId; label: string }[] = [
  { id: "all",       label: "All Claims" },
  { id: "pending",   label: "Pending" },
  { id: "approved",  label: "Assigned" },
  { id: "completed", label: "Completed" },
  { id: "rejected",  label: "Rejected" },
];

function PitchMessageModal({
  message,
  taskTitle,
  onClose,
}: {
  message: string;
  taskTitle: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Your Proposal Message</h3>
            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[280px]">{taskTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto flex-1">
          {message ? (
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {message}
            </p>
          ) : (
            <p className="text-sm text-gray-400 italic">No message submitted.</p>
          )}
        </div>
      </div>
    </div>
  );
}

interface StatCounterProps {
  count: number;
  label: string;
  active: boolean;
  color: string;
  bg: string;
  activeBg: string;
  onClick: () => void;
}

function StatCounter({ count, label, active, color, bg, activeBg, onClick }: StatCounterProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-xl p-5 text-left transition-all border-2",
        active
          ? `${activeBg} border-current ${color}`
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

interface ClaimRowProps {
  claim: TaskClaim;
  onViewMessage: (claim: TaskClaim) => void;
  onChat: (employerId: string) => void;
  chattingId: string | null;
  onLeaveReview: (revieweeId: string, name: string, taskId: string) => void;
}

function ClaimRow({ claim, onViewMessage, onChat, chattingId, onLeaveReview }: ClaimRowProps) {
  const task = typeof claim.task === "object" ? claim.task : null;
  const employer = task && typeof task.employer === "object" ? task.employer : null;
  const clientName = task?.companyName || employer?.company || employer?.name || "Client";

  const badgeVariant =
    claim.status === "approved"
      ? "success"
      : claim.status === "rejected"
      ? "danger"
      : claim.status === "completed"
      ? "info"
      : "warning";

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Avatar
            name={clientName}
            size="md"
          />
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 truncate">
              {task?.title || "—"}
            </h4>
            <p className="text-xs font-medium text-[#1e3a5f] mt-0.5 truncate">
              {clientName}
            </p>
          </div>
        </div>
        <Badge variant={badgeVariant} className="flex-shrink-0 mt-0.5 capitalize">
          {claim.status}
        </Badge>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
        {task && (
          <span className="flex items-center gap-1">
            <ClipboardList size={11} className="text-gray-300" />
            Task budget: <span className="text-gray-600 font-medium ml-0.5">{formatCurrency(task.budget)}</span>
          </span>
        )}
        <span className="text-gray-200 hidden sm:inline">·</span>
        {task?.deadline && (
          <span className="flex items-center gap-1">
            <Calendar size={11} className="text-gray-300" />
            Deadline: <span className="text-gray-600 font-medium ml-0.5">{new Date(task.deadline).toLocaleDateString()}</span>
          </span>
        )}
        <span className="text-gray-200 hidden sm:inline">·</span>
        <span>
          Claimed: <span className="text-gray-600 font-medium">{formatDate(claim.createdAt)}</span>
        </span>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => onViewMessage(claim)}
        >
          <FileText size={13} />
          View Pitch Message
        </Button>

        {(claim.status === "approved" || claim.status === "completed") && employer && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-blue-600 border-blue-200 hover:bg-blue-50"
            onClick={() => onChat(employer._id)}
            loading={chattingId === employer._id}
          >
            <MessageSquare size={13} />
            Chat with Client
          </Button>
        )}

        {claim.status === "completed" && employer && task && (
          <Button
            size="sm"
            className="gap-1.5 bg-[#d4a017] hover:bg-[#c39015] text-white"
            onClick={() => onLeaveReview(employer._id, clientName, task._id)}
          >
            <Star size={13} className="fill-white" />
            Rate Client
          </Button>
        )}

        {task && (
          <Link href={`/tasks/${task._id}`}>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-[#1e3a5f] hover:text-[#1e3a5f] hover:bg-[#edf2f7]"
            >
              Task Details
              <ExternalLink size={12} />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

export default function MyTasksClaimsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { error } = useToast();
  const [claims, setClaims] = useState<TaskClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [modalClaim, setModalClaim] = useState<TaskClaim | null>(null);
  const [chattingId, setChattingId] = useState<string | null>(null);
  const [reviewTarget, setReviewTarget] = useState<{
    id: string;
    name: string;
    taskId?: string;
    jobId?: string;
  } | null>(null);

  const fetchClaims = useCallback(async () => {
    if (!session?.user.accessToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = (await tasksApi.getMyClaims(session.user.accessToken)) as { data: TaskClaim[] };
      setClaims(res.data || []);
    } catch {
      setClaims([]);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (status === "loading") return;
    fetchClaims();
  }, [fetchClaims, status]);

  const handleChat = async (employerId: string) => {
    if (!session?.user.accessToken) return;
    setChattingId(employerId);
    try {
      const res = (await messagesApi.getOrCreateConversation(
        session.user.accessToken,
        { participantId: employerId }
      )) as { success: boolean; data: { _id: string } };
      
      router.push(`/jobseeker/messages?thread=${res.data._id}`);
    } catch (err) {
      error("Failed to open chat");
    } finally {
      setChattingId(null);
    }
  };

  const counts = {
    all:       claims.length,
    pending:   claims.filter((c) => c.status === "pending").length,
    approved:  claims.filter((c) => c.status === "approved").length,
    completed: claims.filter((c) => c.status === "completed").length,
    rejected:  claims.filter((c) => c.status === "rejected").length,
  };

  const filtered =
    activeTab === "all"
      ? claims
      : claims.filter((c) => c.status === activeTab);

  const statCards = [
    {
      id: "pending" as TabId,
      label: "Pending",
      count: counts.pending,
      color: "text-amber-600",
      bg: "bg-amber-50",
      activeBg: "bg-amber-50",
    },
    {
      id: "approved" as TabId,
      label: "Assigned",
      count: counts.approved,
      color: "text-[#1e3a5f]",
      bg: "bg-[#edf2f7]",
      activeBg: "bg-[#edf2f7]",
    },
    {
      id: "completed" as TabId,
      label: "Completed",
      count: counts.completed,
      color: "text-green-600",
      bg: "bg-green-50",
      activeBg: "bg-green-50",
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">My Claimed Tasks</h2>
          <p className="text-sm text-gray-400 mt-0.5">Track status and assignment of your micro-job claims</p>
        </div>
        <Link href="/tasks">
          <Button size="sm" className="gap-1.5 self-start sm:self-auto">
            <Plus size={14} />
            Browse Tasks
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {statCards.map((card) => (
          <StatCounter
            key={card.id}
            count={card.count}
            label={card.label}
            active={activeTab === card.id}
            color={card.color}
            bg={card.bg}
            activeBg={card.activeBg}
            onClick={() => setActiveTab(activeTab === card.id ? "all" : card.id)}
          />
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
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

        <div className="p-5 space-y-3">
          {loading ? (
            <table className="w-full">
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRowSkeleton key={i} cols={1} />
                ))}
              </tbody>
            </table>
          ) : filtered.length === 0 ? (
            <div className="text-center py-14">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <ClipboardList size={22} className="text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">No claims found</p>
              <p className="text-xs text-gray-400 mb-5">
                {activeTab === "all"
                  ? "You haven't claimed any tasks yet."
                  : `No ${activeTab} claims.`}
              </p>
              <Link href="/tasks">
                <Button size="sm">Browse Tasks</Button>
              </Link>
            </div>
          ) : (
            filtered.map((claim) => (
              <ClaimRow
                key={claim._id}
                claim={claim}
                onViewMessage={setModalClaim}
                onChat={handleChat}
                chattingId={chattingId}
                onLeaveReview={(revieweeId, name, taskId) => {
                  setReviewTarget({ id: revieweeId, name, taskId });
                }}
              />
            ))
          )}
        </div>
      </div>

      {modalClaim && (
        <PitchMessageModal
          message={modalClaim.message}
          taskTitle={
            typeof modalClaim.task === "object" ? modalClaim.task.title : "Task"
          }
          onClose={() => setModalClaim(null)}
        />
      )}

      {reviewTarget && (
        <ReviewModal
          isOpen={!!reviewTarget}
          onClose={() => setReviewTarget(null)}
          revieweeId={reviewTarget.id}
          revieweeName={reviewTarget.name}
          taskId={reviewTarget.taskId}
          jobId={reviewTarget.jobId}
        />
      )}
    </div>
  );
}
