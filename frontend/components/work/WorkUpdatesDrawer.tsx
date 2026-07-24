"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { WorkUpdate, WorkRefType, WorkStep } from "@/types";
import { workUpdatesApi } from "@/lib/api";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { CreatePlanModal } from "@/components/work/CreatePlanModal";
import { useToast } from "@/components/ui/Toast";
import { formatRelativeTime, cn } from "@/lib/utils";
import {
  X,
  ClipboardList,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  Percent,
  TrendingUp,
  Edit,
} from "lucide-react";

interface WorkUpdatesDrawerProps {
  open: boolean;
  onClose: () => void;
  refType: WorkRefType;
  refId: string;
  title: string;
  role: "jobseeker" | "employer";
}

export function WorkUpdatesDrawer({
  open,
  onClose,
  refType,
  refId,
  title,
  role,
}: WorkUpdatesDrawerProps) {
  const { data: session } = useSession();
  const { success, error } = useToast();

  const [updates, setUpdates] = useState<WorkUpdate[]>([]);
  const [loading, setLoading] = useState(false);
  const [createPlanOpen, setCreatePlanOpen] = useState(false);
  const [togglingStepId, setTogglingStepId] = useState<string | null>(null);

  const fetchUpdates = useCallback(async () => {
    if (!session?.user.accessToken || !refId) return;
    setLoading(true);
    try {
      const res = (await workUpdatesApi.getByRef(
        session.user.accessToken,
        refType,
        refId
      )) as { data: WorkUpdate[] };
      setUpdates(res.data ?? []);
    } catch {
      setUpdates([]);
    } finally {
      setLoading(false);
    }
  }, [session, refType, refId]);

  useEffect(() => {
    if (!open || !refId) return;
    fetchUpdates();
    if (role === "employer" && session?.user.accessToken) {
      workUpdatesApi.markAllSeen(session.user.accessToken, refId).catch(() => {});
    }
  }, [open, refId, role, session, fetchUpdates]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Find latest active plan update if exists
  const activePlanUpdate = updates.find(
    (u) => u.steps && u.steps.length > 0
  ) || updates[0];

  const steps = activePlanUpdate?.steps || [];
  const overallProgress = activePlanUpdate?.overallProgress || 0;
  const totalDays = activePlanUpdate?.totalDays || steps.reduce((acc, s) => acc + (s.estimatedDays || 1), 0);

  const completedSteps = steps.filter((s) => s.completed);
  const completedDays = completedSteps.reduce((acc, s) => acc + (s.estimatedDays || 1), 0);

  const handleToggleStep = async (stepId: string) => {
    if (role !== "jobseeker" || !session?.user.accessToken || !stepId) return;
    setTogglingStepId(stepId);
    try {
      await workUpdatesApi.toggleStep(session.user.accessToken, {
        refType,
        refId,
        stepId,
      });
      fetchUpdates();
      success("Step status updated!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to toggle step";
      error(msg);
    } finally {
      setTogglingStepId(null);
    }
  };

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ── Slide panel ── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Work progress updates"
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex flex-col bg-slate-50 shadow-2xl",
          "w-full sm:w-[480px]",
          "transition-transform duration-300 ease-in-out font-[family-name:var(--font-poppins)]",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* ── Drawer Header ── */}
        <div className="flex items-start justify-between gap-3 px-5 py-4 bg-white border-b border-slate-200/80 flex-shrink-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <ClipboardList size={18} className="text-[#1e3a5f] flex-shrink-0" />
              <h2 className="text-base font-bold text-slate-900 truncate">Project Execution & Progress</h2>
              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-slate-100 text-slate-600">
                {role === "jobseeker" ? "Talent Workspace" : "Employer Monitor"}
              </span>
            </div>
            {title && <p className="text-xs text-slate-500 truncate">{title}</p>}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            aria-label="Close panel"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Drawer Body Content ── */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
          ) : (
            <>
              {/* ── OVERALL PROGRESS BAR CARD ──────────────────────────────────── */}
              <div className="bg-gradient-to-br from-[#0b192c] via-[#1e3a5f] to-[#0f172a] text-white rounded-2xl p-5 shadow-lg border border-white/10 relative overflow-hidden">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-amber-400" />
                    <span className="text-xs font-bold text-white/90 uppercase tracking-wider">
                      Overall Progress
                    </span>
                  </div>
                  <span className="text-2xl font-extrabold text-white tracking-tight">
                    {overallProgress}%
                  </span>
                </div>

                {/* Animated Progress Bar */}
                <div className="w-full bg-white/15 rounded-full h-3 mb-4 p-0.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${Math.min(100, Math.max(0, overallProgress))}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10 text-xs">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-blue-300" />
                    <div>
                      <p className="text-[10px] text-white/60">Duration</p>
                      <p className="font-bold text-white">{completedDays} / {totalDays} Days</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 justify-end text-right">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <div>
                      <p className="text-[10px] text-white/60">Completed Steps</p>
                      <p className="font-bold text-white">{completedSteps.length} / {steps.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── EXECUTION STEPS SECTION ───────────────────────────────────── */}
              {steps.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Sparkles size={15} className="text-[#1e3a5f]" /> Execution Milestones & Steps
                    </h3>
                    {role === "jobseeker" && (
                      <button
                        type="button"
                        onClick={() => setCreatePlanOpen(true)}
                        className="text-xs text-[#1e3a5f] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Edit size={12} /> Edit Plan
                      </button>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    {steps.map((step, idx) => {
                      const isToggling = togglingStepId === step._id;
                      return (
                        <div
                          key={step._id || idx}
                          className={cn(
                            "p-4 rounded-2xl border transition-all flex items-start justify-between gap-3",
                            step.completed
                              ? "bg-emerald-50/60 border-emerald-200/80"
                              : "bg-white border-slate-200/80 hover:border-slate-300"
                          )}
                        >
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            {role === "jobseeker" ? (
                              <button
                                type="button"
                                disabled={isToggling}
                                onClick={() => step._id && handleToggleStep(step._id)}
                                className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer flex-shrink-0"
                              >
                                {step.completed ? (
                                  <CheckCircle2 size={20} className="text-emerald-600 fill-emerald-100" />
                                ) : (
                                  <Circle size={20} />
                                )}
                              </button>
                            ) : (
                              <div className="mt-0.5 flex-shrink-0">
                                {step.completed ? (
                                  <CheckCircle2 size={20} className="text-emerald-600 fill-emerald-100" />
                                ) : (
                                  <Circle size={20} className="text-slate-300" />
                                )}
                              </div>
                            )}

                            <div className="min-w-0 flex-1">
                              <p
                                className={cn(
                                  "text-xs font-bold leading-snug truncate",
                                  step.completed ? "text-emerald-950 line-through opacity-80" : "text-slate-900"
                                )}
                              >
                                {step.title}
                              </p>
                              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500">
                                <span className="flex items-center gap-1">
                                  <Clock size={11} /> {step.estimatedDays} {step.estimatedDays === 1 ? "day" : "days"}
                                </span>
                                <span className="flex items-center gap-1 font-semibold text-slate-700">
                                  <Percent size={11} className="text-amber-500" /> {step.percentage}% weight
                                </span>
                              </div>
                            </div>
                          </div>

                          <span
                            className={cn(
                              "text-[10px] font-bold px-2.5 py-0.5 rounded-full flex-shrink-0 border",
                              step.completed
                                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            )}
                          >
                            {step.completed ? "Completed" : "Pending"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Empty state when no plan created yet */
                <div className="py-10 text-center bg-white rounded-2xl border border-dashed border-slate-200 p-6">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
                    <Sparkles size={28} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">No Execution Plan Created</h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto mb-4">
                    {role === "jobseeker"
                      ? "Define all milestones, estimated days, and percentage weight for your project."
                      : "The freelancer has not submitted an execution plan for this assignment yet."}
                  </p>

                  {role === "jobseeker" && (
                    <button
                      type="button"
                      onClick={() => setCreatePlanOpen(true)}
                      className="py-2.5 px-5 rounded-xl font-bold text-xs bg-gradient-to-r from-[#d4a017] via-[#e6b800] to-[#b8860b] text-slate-950 shadow-md flex items-center justify-center gap-1.5 mx-auto border-0 cursor-pointer"
                    >
                      <Sparkles size={14} /> Create Execution Plan
                    </button>
                  )}
                </div>
              )}

              {/* Legacy Bullet Points rendering if present */}
              {activePlanUpdate?.points && activePlanUpdate.points.length > 0 && (
                <div className="mt-4 p-4 rounded-2xl bg-white border border-slate-200/80">
                  <p className="text-xs font-bold text-slate-800 mb-2">Logged Progress Notes:</p>
                  <ul className="space-y-1">
                    {activePlanUpdate.points.map((pt, i) => (
                      <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                        <span className="text-[#1e3a5f] font-bold">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Persistent Footer Button for Jobseekers ── */}
        {role === "jobseeker" && !loading && (
          <div className="flex-shrink-0 px-5 py-4 bg-white border-t border-slate-200/80">
            <button
              type="button"
              onClick={() => setCreatePlanOpen(true)}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-[#1e3a5f] hover:bg-[#152a45] text-white transition-all flex items-center justify-center gap-2 border-0 cursor-pointer shadow-md"
            >
              <Sparkles size={14} className="text-amber-300" />
              <span>{steps.length > 0 ? "Edit Execution Plan" : "Create Execution Plan"}</span>
            </button>
          </div>
        )}
      </div>

      {/* ── CreatePlanModal (jobseeker only) ── */}
      {role === "jobseeker" && (
        <CreatePlanModal
          open={createPlanOpen}
          onClose={() => setCreatePlanOpen(false)}
          refType={refType}
          refId={refId}
          title={title}
          initialSteps={steps}
          onPlanCreated={() => {
            setCreatePlanOpen(false);
            fetchUpdates();
          }}
        />
      )}
    </>
  );
}
