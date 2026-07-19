"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { tasksApi, messagesApi } from "@/lib/api";
import { Task, TaskClaim } from "@/types";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { useToast } from "@/components/ui/Toast";
import {
  MapPin,
  Calendar,
  DollarSign,
  User,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  ClipboardList,
  MessageSquare,
  Star,
} from "lucide-react";
import Link from "next/link";
import { ReviewModal } from "@/components/ui/ReviewModal";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";

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
  const [reviewTarget, setReviewTarget] = useState<{
    id: string;
    name: string;
    taskId?: string;
    jobId?: string;
  } | null>(null);

  const fetchTaskAndClaims = useCallback(async () => {
    if (!session?.user.accessToken || !id) return;
    setLoading(true);
    try {
      const [taskRes, claimsRes] = await Promise.all([
        tasksApi.getTaskById(id),
        tasksApi.getTaskClaims(session.user.accessToken, id)
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

  const handleStatusChange = async (claimId: string, status: "approved" | "rejected" | "completed") => {
    if (!session?.user.accessToken) return;
    setUpdatingId(claimId);
    try {
      await tasksApi.updateClaimStatus(session.user.accessToken, claimId, status);
      success(`Claim ${status} successfully!`);
      // Update locally
      setClaims(prev => prev.map(c => c._id === claimId ? { ...c, status } : c));
      // Re-fetch to update task status if needed
      const taskRes = await tasksApi.getTaskById(id);
      setTask((taskRes as { data: Task }).data);
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

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back link */}
      <Link href="/employer/my-tasks" className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft size={16} />
        Back to My Tasks
      </Link>

      {/* Task info card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded text-xs font-semibold uppercase">
                {task.taskType}
              </span>
              <span className="px-2.5 py-0.5 bg-blue-50 text-[#1e3a5f] border border-blue-200 rounded text-xs font-semibold capitalize">
                {task.status}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{task.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <MapPin size={15} />
                {task.location}
              </span>
              <span className="flex items-center gap-1 font-semibold text-gray-700">
                <DollarSign size={15} />
                {formatCurrency(task.budget)} Fixed Price
              </span>
              {(task.startDate || task.endDate) && (
                <span className="flex items-center gap-1 text-amber-700 font-medium">
                  <Calendar size={15} />
                  {task.startDate ? new Date(task.startDate).toLocaleDateString() : "—"}
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
              <Button variant="outline" size="sm">Edit Task</Button>
            </Link>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-100 pt-6 space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm mb-1.5">Task Description</h3>
            <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{task.description}</p>
          </div>

          {task.deliverables && (
            <div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1.5">Required Deliverables</h3>
              <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{task.deliverables}</p>
            </div>
          )}

          {task.skills.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 text-sm mb-2">Required Skills</h3>
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

      {/* Claimants / Applicants section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Task Claimants ({claims.length})</h2>

        {claims.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <ClipboardList className="mx-auto mb-3 text-gray-300" size={40} />
            <p className="text-gray-500 text-sm">No claims received yet for this task.</p>
            <p className="text-xs text-gray-400 mt-1">When freelancers apply/claim this task, they will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {claims.map((claim) => {
              const claimant = typeof claim.claimant === "object" ? claim.claimant : null;
              if (!claimant) return null;

              return (
                <div key={claim._id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
                  {/* Claimant head info */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex gap-3">
                      <Avatar name={claimant.name} src={claimant.avatar} size="lg" />
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{claimant.name}</h3>
                        <p className="text-xs text-gray-500 truncate">{claimant.title || "Freelancer"}</p>
                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                          <MapPin size={11} />
                          {claimant.location || "Remote"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        claim.status === "approved"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : claim.status === "rejected"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : claim.status === "completed"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-yellow-50 text-yellow-700 border-yellow-200"
                      }`}>
                        {claim.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Pitch message */}
                  {claim.message && (
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Freelancer's Message</p>
                      <p className="text-sm text-gray-600">{claim.message}</p>
                    </div>
                  )}

                  {/* Claimant skills */}
                  {claimant.skills && claimant.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {claimant.skills.slice(0, 8).map(s => (
                        <span key={s} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
                    <span className="text-gray-400">Claimed {formatRelativeTime(claim.createdAt)}</span>

                    <div className="flex items-center gap-2">
                      {claim.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white gap-1.5"
                            onClick={() => handleStatusChange(claim._id, "approved")}
                            loading={updatingId === claim._id}
                          >
                            <CheckCircle size={13} />
                            Approve & Assign
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
                          className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                          onClick={() => handleStatusChange(claim._id, "completed")}
                          loading={updatingId === claim._id}
                        >
                          <CheckCircle size={13} />
                          Mark Completed
                        </Button>
                      )}

                      {(claim.status === "approved" || claim.status === "completed") && (
                        <>
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

                      <Link href={`/freelancers/${claimant._id}`} target="_blank">
                        <Button size="sm" variant="ghost" className="gap-1.5 text-gray-600">
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
    </div>
  );
}
