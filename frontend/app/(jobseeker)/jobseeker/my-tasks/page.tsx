"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { tasksApi, messagesApi, workUpdatesApi } from "@/lib/api";
import { TaskClaim, WorkUpdate } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { TableRowSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { AddUpdateModal } from "@/components/work/AddUpdateModal";
import { WorkUpdatesDrawer } from "@/components/work/WorkUpdatesDrawer";
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
  { id: "pending",   label: "Pending"    },
  { id: "approved",  label: "Assigned"   },
  { id: "completed", label: "Completed"  },
  { id: "rejected",  label: "Rejected"   },
];

// ─── Pitch message modal ──────────────────────────────────────────────────────

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
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{message}</p>
          ) : (
            <p className="text-sm text-gray-400 italic">No message submitted.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Stat counter ─────────────────────────────────────────────────────────────

interface StatCounterProps {
  count: number; label: string; active: boolean;
  color: string; bg: string; activeBg: string; onClick: () => void;
}

function StatCounter({ count, label, active, color, bg, activeBg, onClick }: StatCounterProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-2xl p-4 sm:p-5 text-left transition-all border cursor-pointer",
        active
          ? `${activeBg} border-current ${color} shadow-xs`
          : `${bg} border-slate-200/60 hover:shadow-xs`
      )}
    >
      <div className={cn("text-2xl sm:text-3xl font-extrabold mb-1", active ? color : "text-slate-900")}>{count}</div>
      <div className={cn("text-xs sm:text-sm font-bold", active ? color : "text-slate-600")}>{label}</div>
    </button>
  );
}

// ─── Claim row ────────────────────────────────────────────────────────────────

interface ClaimRowProps {
  claim: TaskClaim;
  updateCount: number;
  onViewMessage: (claim: TaskClaim) => void;
  onChat: (employerId: string) => void;
  chattingId: string | null;
  onLeaveReview: (revieweeId: string, name: string, taskId: string) => void;
  onAddUpdate: (refId: string, title: string) => void;
  onViewUpdates: (refId: string, title: string) => void;
}

function ClaimRow({
  claim, updateCount, onViewMessage, onChat, chattingId,
  onLeaveReview, onAddUpdate, onViewUpdates,
}: ClaimRowProps) {
  const task = typeof claim.task === "object" ? claim.task : null;
  const employer = task && typeof task.employer === "object" ? task.employer : null;
  const clientName = task?.companyName || employer?.company || employer?.name || "Client";
  const taskTitle = task?.title || "Task";

  const badgeVariant =
    claim.status === "approved"  ? "success" :
    claim.status === "rejected"  ? "danger"  :
    claim.status === "completed" ? "info"    : "warning";

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 hover:shadow-sm transition-all duration-200">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">

        {/* Left */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Avatar name={clientName} size="md" className="flex-shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm sm:text-base font-bold text-slate-900 truncate">{taskTitle}</h4>
              <Badge variant={badgeVariant} className="capitalize flex-shrink-0 font-bold">
                {claim.status}
              </Badge>
            </div>
            <p className="text-xs font-semibold text-[#1e3a5f] mt-0.5 truncate">{clientName}</p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-xs text-slate-500">
              {task && (
                <span className="flex items-center gap-1 font-medium">
                  <ClipboardList size={12} className="text-slate-400" />
                  Budget:{" "}
                  <span className="text-slate-900 font-bold">{formatCurrency(task.budget)}</span>
                </span>
              )}
              {task?.deadline && (
                <span className="flex items-center gap-1 font-medium">
                  <Calendar size={12} className="text-slate-400" />
                  Deadline:{" "}
                  <span className="text-slate-800 font-semibold">
                    {new Date(task.deadline).toLocaleDateString()}
                  </span>
                </span>
              )}
              <span className="font-medium">
                Claimed: <span className="text-slate-800 font-semibold">{formatDate(claim.createdAt)}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: action buttons */}
        <div className="flex items-center gap-2 flex-wrap flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <button
            onClick={() => onViewMessage(claim)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
          >
            <FileText size={13} />
            <span>View Pitch</span>
          </button>

          {(claim.status === "approved" || claim.status === "completed") && employer && (
            <button
              onClick={() => onChat(employer._id)}
              disabled={chattingId === employer._id}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#edf2f7] text-[#1e3a5f] hover:bg-[#e2e8f0] transition-all cursor-pointer"
            >
              <MessageSquare size={13} />
              <span>{chattingId === employer._id ? "Opening..." : "Chat"}</span>
            </button>
          )}

          {/* Progress update buttons — approved claims only */}
          {claim.status === "approved" && (
            <>
              <button
                onClick={() => onAddUpdate(claim._id, taskTitle)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#edf2f7] text-[#1e3a5f] hover:bg-[#e2e8f0] transition-all cursor-pointer"
              >
                <Plus size={13} />
                <span>Add Update</span>
              </button>

              {updateCount > 0 && (
                <button
                  onClick={() => onViewUpdates(claim._id, taskTitle)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  <ClipboardList size={13} />
                  <span>Updates ({updateCount})</span>
                </button>
              )}
            </>
          )}

          {claim.status === "completed" && employer && task && (
            <button
              onClick={() => onLeaveReview(employer._id, clientName, task._id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#d4a017] hover:bg-[#c39015] text-white transition-all cursor-pointer shadow-xs"
            >
              <Star size={13} className="fill-white" />
              <span>Rate Client</span>
            </button>
          )}

          {task && (
            <Link href={`/tasks/${task._id}`}>
              <button className="flex items-center justify-center p-1.5 rounded-xl text-[#1e3a5f] hover:bg-[#edf2f7] border border-slate-200/60 transition-all cursor-pointer">
                <ExternalLink size={14} />
              </button>
            </Link>
          )}
        </div>

      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MyTasksClaimsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { error } = useToast();

  const [claims, setClaims]           = useState<TaskClaim[]>([]);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState<TabId>("all");
  const [modalClaim, setModalClaim]   = useState<TaskClaim | null>(null);
  const [chattingId, setChattingId]   = useState<string | null>(null);
  const [reviewTarget, setReviewTarget] = useState<{
    id: string; name: string; taskId?: string; jobId?: string;
  } | null>(null);
  const [updateCounts, setUpdateCounts] = useState<Record<string, number>>({});

  // Progress modal/drawer state
  const [updateTarget, setUpdateTarget] = useState<{ refId: string; title: string } | null>(null);
  const [drawerTarget, setDrawerTarget] = useState<{ refId: string; title: string } | null>(null);

  const fetchClaims = useCallback(async () => {
    if (!session?.user.accessToken) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = (await tasksApi.getMyClaims(session.user.accessToken)) as { data: TaskClaim[] };
      const data = res.data || [];
      setClaims(data);

      // Batch-fetch update counts for approved claims
      const approved = data.filter((c) => c.status === "approved");
      const countMap: Record<string, number> = {};
      await Promise.allSettled(
        approved.map(async (c) => {
          try {
            const r = (await workUpdatesApi.getByRef(
              session.user.accessToken!,
              "taskClaim",
              c._id
            )) as { data: WorkUpdate[] };
            countMap[c._id] = r.data?.length ?? 0;
          } catch {
            countMap[c._id] = 0;
          }
        })
      );
      setUpdateCounts(countMap);
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
    } catch {
      error("Failed to open chat");
    } finally {
      setChattingId(null);
    }
  };

  const handlePosted = (refId: string) => {
    setUpdateCounts((prev) => ({ ...prev, [refId]: (prev[refId] ?? 0) + 1 }));
  };

  const counts = {
    all:       claims.length,
    pending:   claims.filter((c) => c.status === "pending").length,
    approved:  claims.filter((c) => c.status === "approved").length,
    completed: claims.filter((c) => c.status === "completed").length,
    rejected:  claims.filter((c) => c.status === "rejected").length,
  };

  const filtered = activeTab === "all" ? claims : claims.filter((c) => c.status === activeTab);

  const statCards = [
    { id: "pending"  as TabId, label: "Pending",   count: counts.pending,   color: "text-amber-600", bg: "bg-amber-50/70",   activeBg: "bg-amber-50"   },
    { id: "approved" as TabId, label: "Assigned",  count: counts.approved,  color: "text-[#1e3a5f]", bg: "bg-slate-100/70",  activeBg: "bg-[#edf2f7]"  },
    { id: "completed"as TabId, label: "Completed", count: counts.completed, color: "text-emerald-600", bg: "bg-emerald-50/70", activeBg: "bg-emerald-50" },
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

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
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
        {/* Tab bar */}
        <div className="px-4 sm:px-5 border-b border-gray-100 flex items-center gap-0.5 overflow-x-auto no-scrollbar scrollbar-none flex-nowrap" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-3 text-xs font-bold border-b-2 transition-all -mb-px whitespace-nowrap flex-shrink-0 cursor-pointer",
                activeTab === tab.id
                  ? "border-[#1e3a5f] text-[#1e3a5f]"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-xs font-bold",
                  activeTab === tab.id ? "bg-[#edf2f7] text-[#1e3a5f]" : "bg-slate-100 text-slate-500"
                )}
              >
                {counts[tab.id]}
              </span>
            </button>
          ))}
        </div>

        <div className="p-5">
          {loading ? (
            <table className="w-full">
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={1} />)}
              </tbody>
            </table>
          ) : filtered.length === 0 ? (
            <div className="text-center py-14">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <ClipboardList size={22} className="text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">No claims found</p>
              <p className="text-xs text-gray-400 mb-5">
                {activeTab === "all" ? "You haven't claimed any tasks yet." : `No ${activeTab} claims.`}
              </p>
              <Link href="/tasks">
                <Button size="sm">Browse Tasks</Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filtered.map((claim) => (
                <ClaimRow
                  key={claim._id}
                  claim={claim}
                  updateCount={updateCounts[claim._id] ?? 0}
                  onViewMessage={setModalClaim}
                  onChat={handleChat}
                  chattingId={chattingId}
                  onLeaveReview={(revieweeId, name, taskId) =>
                    setReviewTarget({ id: revieweeId, name, taskId })
                  }
                  onAddUpdate={(refId, title) => setUpdateTarget({ refId, title })}
                  onViewUpdates={(refId, title) => setDrawerTarget({ refId, title })}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pitch message modal */}
      {modalClaim && (
        <PitchMessageModal
          message={modalClaim.message}
          taskTitle={typeof modalClaim.task === "object" ? modalClaim.task.title : "Task"}
          onClose={() => setModalClaim(null)}
        />
      )}

      {/* Review modal */}
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

      {/* ── Add Update Modal ── */}
      <AddUpdateModal
        open={!!updateTarget}
        onClose={() => setUpdateTarget(null)}
        refType="taskClaim"
        refId={updateTarget?.refId ?? ""}
        title={updateTarget?.title ?? ""}
        onPosted={() => {
          if (updateTarget) handlePosted(updateTarget.refId);
          setUpdateTarget(null);
        }}
      />

      {/* ── Updates Drawer ── */}
      <WorkUpdatesDrawer
        open={!!drawerTarget}
        onClose={() => setDrawerTarget(null)}
        refType="taskClaim"
        refId={drawerTarget?.refId ?? ""}
        title={drawerTarget?.title ?? ""}
        role="jobseeker"
      />
    </div>
  );
}
