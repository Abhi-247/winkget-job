"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { tasksApi, messagesApi, escrowApi } from "@/lib/api";
import { Task, TaskClaim } from "@/types";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import {
  MapPin,
  Calendar,
  DollarSign,
  ArrowLeft,
  CheckCircle,
  XCircle,
  ExternalLink,
  ClipboardList,
  MessageSquare,
  Star,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Wallet,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { ReviewModal } from "@/components/ui/ReviewModal";
import { WorkUpdatesDrawer } from "@/components/work/WorkUpdatesDrawer";
import { formatCurrency, formatRelativeTime, cn } from "@/lib/utils";

export default function EmployerTaskDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { data: session } = useSession();
  const { success, error } = useToast();

  const [task, setTask] = useState<Task | null>(null);
  const [claims, setClaims] = useState<TaskClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [chattingId, setChattingId] = useState<string | null>(null);
  const [drawerClaim, setDrawerClaim] = useState<TaskClaim | null>(null);
  const [reviewTarget, setReviewTarget] = useState<{
    id: string;
    name: string;
    taskId?: string;
    jobId?: string;
  } | null>(null);

  // Escrow & Bid Acceptance Modal State
  const [selectedClaimForApproval, setSelectedClaimForApproval] =
    useState<TaskClaim | null>(null);
  const [escrowBalance, setEscrowBalance] = useState<number>(0);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [approving, setApproving] = useState(false);

  const fetchTaskAndClaims = useCallback(async () => {
    if (!session?.user.accessToken || !id) return;
    setLoading(true);
    try {
      const [taskRes, claimsRes] = await Promise.all([
        tasksApi.getTaskById(id),
        tasksApi.getTaskClaims(session.user.accessToken, id),
      ]);
      setTask((taskRes as { data: Task }).data);
      setClaims((claimsRes as { data: TaskClaim[] }).data || []);
    } catch (err) {
      error("Failed to load task details");
      router.push("/employer/my-tasks");
    } finally {
      setLoading(false);
    }
  }, [id, session, router, error]);

  useEffect(() => {
    fetchTaskAndClaims();
  }, [fetchTaskAndClaims]);

  const fetchEscrowBalance = async () => {
    if (!session?.user.accessToken) return;
    try {
      const res = (await escrowApi.getSummary(session.user.accessToken)) as {
        data: { escrowBalance: number };
      };
      setEscrowBalance(res.data.escrowBalance || 0);
    } catch {
      setEscrowBalance(0);
    }
  };

  const handleOpenApprovalModal = (claim: TaskClaim) => {
    setSelectedClaimForApproval(claim);
    setDisclaimerAccepted(false);
    fetchEscrowBalance();
  };

  const handleConfirmApproval = async () => {
    if (!selectedClaimForApproval || !session?.user.accessToken) return;
    const bidAmount = selectedClaimForApproval.bidAmount || task?.budget || 0;
    const hasSufficientBalance = escrowBalance >= bidAmount;

    if (!hasSufficientBalance && !disclaimerAccepted) {
      error("Please check the platform disclaimer to proceed without Escrow funding.");
      return;
    }

    setApproving(true);
    try {
      await tasksApi.updateClaimStatus(
        session.user.accessToken,
        selectedClaimForApproval._id,
        "approved"
      );

      if (hasSufficientBalance) {
        success(`Bid accepted! $${bidAmount} locked in Escrow with Platform Guarantee.`);
      } else {
        success(`Bid accepted unfunded. Note: Platform is not responsible for payment guarantee.`);
      }

      setSelectedClaimForApproval(null);
      fetchTaskAndClaims();
    } catch (err) {
      error("Failed to approve bid and assign task");
    } finally {
      setApproving(false);
    }
  };

  const handleStatusChange = async (
    claimId: string,
    status: "rejected" | "completed"
  ) => {
    if (!session?.user.accessToken) return;
    setUpdatingId(claimId);
    try {
      await tasksApi.updateClaimStatus(session.user.accessToken, claimId, status);
      if (status === "completed") {
        success("Task finalized and payment released from Escrow!");
      } else {
        success(`Claim ${status} successfully!`);
      }
      fetchTaskAndClaims();
    } catch (err) {
      error("Failed to update claim status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleChat = async (freelancerId: string) => {
    if (!session?.user.accessToken) return;
    setChattingId(freelancerId);
    try {
      const res = (await messagesApi.getOrCreateConversation(
        session.user.accessToken,
        { participantId: freelancerId }
      )) as { success: boolean; data: { _id: string } };

      router.push(`/employer/messages?thread=${res.data._id}`);
    } catch (err) {
      error("Failed to open chat");
    } finally {
      setChattingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-24" />
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-4 bg-gray-200 rounded w-full" />
        </div>
      </div>
    );
  }

  if (!task) return null;

  const currentBidAmount =
    selectedClaimForApproval?.bidAmount || task.budget || 0;
  const isBalanceSufficient = escrowBalance >= currentBidAmount;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back link */}
      <Link
        href="/employer/my-tasks"
        className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to My Tasks
      </Link>

      {/* Task info card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded text-xs font-semibold uppercase">
                {task.taskType}
              </span>
              <span className="px-2.5 py-0.5 bg-blue-50 text-[#1e3a5f] border border-blue-200 rounded text-xs font-semibold capitalize">
                {task.status}
              </span>

              {/* Escrow Status Badge */}
              {task.escrowStatus === "funded" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded text-xs font-semibold">
                  <ShieldCheck size={13} className="text-purple-600" />
                  Escrow Funded & Guaranteed
                </span>
              )}
              {task.escrowStatus === "unfunded" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-xs font-semibold">
                  <ShieldAlert size={13} className="text-amber-600" />
                  Unfunded Escrow (No Platform Guarantee)
                </span>
              )}
              {task.escrowStatus === "released" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-xs font-semibold">
                  <CheckCircle size={13} className="text-emerald-600" />
                  Escrow Released
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {task.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <MapPin size={15} />
                {task.location}
              </span>
              <span className="flex items-center gap-1 font-semibold text-gray-700">
                <DollarSign size={15} />
                {formatCurrency(task.budget)} Budget
              </span>
              {(task.startDate || task.endDate) && (
                <span className="flex items-center gap-1 text-amber-700 font-medium">
                  <Calendar size={15} />
                  {task.startDate
                    ? new Date(task.startDate).toLocaleDateString()
                    : "—"}
                  {" → "}
                  {task.endDate
                    ? new Date(task.endDate).toLocaleDateString()
                    : task.deadline
                      ? new Date(task.deadline).toLocaleDateString()
                      : "—"}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Link href={`/employer/post-task?edit=${task._id}`}>
              <Button variant="outline" size="sm">
                Edit Task
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-100 pt-6 space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm mb-1.5">
              Task Description
            </h3>
            <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
              {task.description}
            </p>
          </div>

          {task.deliverables && (
            <div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1.5">
                Required Deliverables
              </h3>
              <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                {task.deliverables}
              </p>
            </div>
          )}

          {task.skills.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 text-sm mb-2">
                Required Skills
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {task.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-0.5 rounded-full bg-gray-50 text-gray-600 text-xs border border-gray-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Claimants / Bidders section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">
          Freelancer Bids ({claims.length})
        </h2>

        {claims.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <ClipboardList className="mx-auto mb-3 text-gray-300" size={40} />
            <p className="text-gray-500 text-sm">
              No bids received yet for this task.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              When freelancers pitch bids for this task, they will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {claims.map((claim) => {
              const claimant =
                typeof claim.claimant === "object" ? claim.claimant : null;
              if (!claimant) return null;

              const bidPrice = claim.bidAmount || task.budget;

              return (
                <div
                  key={claim._id}
                  className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4"
                >
                  {/* Claimant head info & Bid badge */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex gap-3">
                      <Avatar
                        name={claimant.name}
                        src={claimant.avatar}
                        size="lg"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {claimant.name}
                          </h3>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold">
                            <DollarSign size={11} />
                            Bid: {formatCurrency(bidPrice)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {claimant.title || "Freelancer"}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                          <MapPin size={11} />
                          {claimant.location || "Remote"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          claim.status === "approved"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : claim.status === "rejected"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : claim.status === "completed"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-yellow-50 text-yellow-700 border-yellow-200"
                        }`}
                      >
                        {claim.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Pitch message */}
                  {claim.message && (
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Freelancer's Proposal Pitch
                      </p>
                      <p className="text-sm text-gray-600">{claim.message}</p>
                    </div>
                  )}

                  {/* Claimant skills */}
                  {claimant.skills && claimant.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {claimant.skills.slice(0, 8).map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col items-stretch gap-3 pt-3 border-t border-gray-100 text-xs sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-gray-400">
                      Pitched {formatRelativeTime(claim.createdAt)}
                    </span>

                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      {claim.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white gap-1.5"
                            onClick={() => handleOpenApprovalModal(claim)}
                            loading={updatingId === claim._id}
                          >
                            <Shield size={13} />
                            Select & Fund Escrow (${bidPrice})
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200 gap-1.5"
                            onClick={() => handleStatusChange(claim._id, "rejected")}
                            loading={updatingId === claim._id}
                          >
                            <XCircle size={13} />
                            Reject
                          </Button>
                        </>
                      )}

                      {claim.status === "approved" && (
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                          onClick={() => handleStatusChange(claim._id, "completed")}
                          loading={updatingId === claim._id}
                        >
                          <CheckCircle size={13} />
                          Finalize Plan & Release Payment
                        </Button>
                      )}

                      {(claim.status === "approved" ||
                        claim.status === "completed") && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5 border-slate-300 text-slate-700 hover:bg-slate-50"
                            onClick={() => setDrawerClaim(claim)}
                          >
                            <ClipboardList size={13} className="text-[#1e3a5f]" />
                            Progress Updates
                          </Button>
                          {claim.status === "completed" && (
                            <Button
                              size="sm"
                              className="bg-[#d4a017] hover:bg-[#c39015] text-white gap-1.5"
                              onClick={() => {
                                setReviewTarget({
                                  id: claimant._id,
                                  name: claimant.name,
                                  taskId: task._id,
                                });
                              }}
                            >
                              <Star size={13} className="fill-white" />
                              Rate & Review
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5 text-blue-600 border-blue-250 hover:bg-blue-50"
                            onClick={() => handleChat(claimant._id)}
                            loading={chattingId === claimant._id}
                          >
                            <MessageSquare size={13} />
                            Chat
                          </Button>
                        </>
                      )}

                      <Link href={`/talent/${claimant._id}`} target="_blank">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="gap-1.5 text-gray-600"
                        >
                          View Profile
                          <ExternalLink size={12} />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Select Bid & Escrow Funding Confirmation Modal */}
      {selectedClaimForApproval && (
        <Modal
          open={!!selectedClaimForApproval}
          onClose={() => setSelectedClaimForApproval(null)}
          title="Select Candidate Bid & Escrow Funding"
          size="md"
          position="right-drawer"
        >
          <div className="space-y-5">
            {/* Candidate & Pricing Summary */}
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">
                  Selected Freelancer
                </span>
                <span className="text-xs bg-purple-200 text-purple-900 rounded-full px-2.5 py-0.5 font-bold">
                  Winning Candidate
                </span>
              </div>
              <p className="font-bold text-gray-900 text-base">
                {typeof selectedClaimForApproval.claimant === "object"
                  ? selectedClaimForApproval.claimant.name
                  : "Freelancer"}
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-purple-200/60 text-xs">
                <div>
                  <span className="text-gray-500 block">Initial Posted Budget:</span>
                  <span className="font-semibold text-gray-700">
                    {formatCurrency(task.budget)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Final Agreed Bid Price:</span>
                  <span className="font-bold text-emerald-700 text-sm">
                    {formatCurrency(currentBidAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Auto-rejection Note */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-800 flex items-start gap-2">
              <AlertTriangle size={15} className="shrink-0 text-blue-600 mt-0.5" />
              <span>
                <strong>Auto-Rejection Notice:</strong> Selecting this candidate will
                automatically notify all other applicant freelancers that their bid was not selected.
              </span>
            </div>

            {/* Escrow Balance Check */}
            <div className="bg-gray-50 rounded-xl p-3.5 sm:p-4 border border-gray-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-sm">
                <span className="font-medium text-gray-700 flex items-center gap-1.5 text-xs sm:text-sm">
                  <Wallet size={15} className="text-purple-600 shrink-0" />
                  Your Escrow Wallet Balance:
                </span>
                <span className="font-bold text-gray-900 text-sm sm:text-base">
                  {formatCurrency(escrowBalance)}
                </span>
              </div>

              {isBalanceSufficient ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-800 flex items-start gap-2">
                  <ShieldCheck size={16} className="shrink-0 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="font-bold">Sufficient Escrow Balance Available</p>
                    <p className="mt-0.5 text-emerald-700 leading-relaxed">
                      {formatCurrency(currentBidAmount)} will be locked in Escrow with
                      full Platform Payment Guarantee until you finalize the completed task.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-3 text-xs">
                  <div className="flex items-start gap-2 text-amber-900">
                    <ShieldAlert size={16} className="shrink-0 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-bold">Insufficient Escrow Balance</p>
                      <p className="mt-0.5 text-amber-800">
                        You have {formatCurrency(escrowBalance)} but need{" "}
                        {formatCurrency(currentBidAmount)}.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href="/employer/escrow" target="_blank">
                      <Button size="sm" variant="outline" className="bg-white border-amber-300 text-amber-800 text-xs">
                        Top-Up Escrow Wallet
                      </Button>
                    </Link>
                  </div>

                  {/* Platform Disclaimer Checkbox */}
                  <div className="pt-2 border-t border-amber-200/80">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={disclaimerAccepted}
                        onChange={(e) => setDisclaimerAccepted(e.target.checked)}
                        className="mt-0.5 rounded border-amber-400 text-purple-600 focus:ring-purple-500 shrink-0"
                      />
                      <span className="text-amber-900 font-medium leading-relaxed">
                        I acknowledge that proceeding without funding Escrow means the Platform is NOT responsible for payment guarantee if issues arise.
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col-reverse sm:flex-row gap-2.5 pt-2">
              <Button
                variant="secondary"
                onClick={() => setSelectedClaimForApproval(null)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                fullWidth
                loading={approving}
                onClick={handleConfirmApproval}
                disabled={!isBalanceSufficient && !disclaimerAccepted}
                className={cn(
                  "whitespace-normal text-xs sm:text-sm py-2.5 h-auto leading-normal",
                  isBalanceSufficient
                    ? "bg-purple-600 hover:bg-purple-700 text-white"
                    : "bg-amber-600 hover:bg-amber-700 text-white"
                )}
              >
                {isBalanceSufficient
                  ? `Confirm & Lock ${formatCurrency(currentBidAmount)} in Escrow`
                  : "Accept Bid Unfunded (With Disclaimer)"}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Review Modal */}
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

      {/* Work Updates Drawer */}
      {drawerClaim && (
        <WorkUpdatesDrawer
          open={!!drawerClaim}
          onClose={() => setDrawerClaim(null)}
          refType="taskClaim"
          refId={drawerClaim._id}
          title={task?.title || "Task Execution"}
          role="employer"
        />
      )}
    </div>
  );
}
