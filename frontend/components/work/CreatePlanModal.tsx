"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { workUpdatesApi } from "@/lib/api";
import { WorkRefType, WorkStep } from "@/types";
import { X, Plus, Sparkles, Clock, Percent, Check, AlertCircle } from "lucide-react";

interface CreatePlanModalProps {
  open: boolean;
  onClose: () => void;
  refType: WorkRefType;
  refId: string;
  title: string;
  initialSteps?: WorkStep[];
  onPlanCreated?: () => void;
}

export function CreatePlanModal({
  open,
  onClose,
  refType,
  refId,
  title,
  initialSteps,
  onPlanCreated,
}: CreatePlanModalProps) {
  const { data: session } = useSession();
  const { success, error } = useToast();

  const [steps, setSteps] = useState<
    Array<{ title: string; estimatedDays: number; percentage: number | string }>
  >([
    { title: "Initial Setup & Discovery", estimatedDays: 1, percentage: "" },
    { title: "Core Implementation", estimatedDays: 3, percentage: "" },
    { title: "Final Review & Handover", estimatedDays: 1, percentage: "" },
  ]);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialSteps && initialSteps.length > 0) {
        setSteps(
          initialSteps.map((s) => ({
            title: s.title,
            estimatedDays: s.estimatedDays || 1,
            percentage: s.percentage || "",
          }))
        );
      } else {
        setSteps([
          { title: "Initial Setup & Discovery", estimatedDays: 1, percentage: "" },
          { title: "Core Implementation", estimatedDays: 3, percentage: "" },
          { title: "Final Review & Handover", estimatedDays: 1, percentage: "" },
        ]);
      }
    }
  }, [open, initialSteps]);

  // Compute stats
  const totalDays = steps.reduce(
    (acc, s) => acc + (Math.max(1, Number(s.estimatedDays)) || 1),
    0
  );

  const calculateExplicitSum = () =>
    steps.reduce((acc, s) => {
      const val = Number(s.percentage);
      return acc + (isNaN(val) ? 0 : val);
    }, 0);

  const handleAutoSplit = () => {
    let explicitSum = 0;
    let unallocatedCount = 0;

    steps.forEach((s) => {
      const val = Number(s.percentage);
      if (val > 0) {
        explicitSum += val;
      } else {
        unallocatedCount++;
      }
    });

    const remaining = Math.max(0, 100 - explicitSum);
    if (unallocatedCount === 0) {
      // Split all steps equally
      const equalShare = Number((100 / steps.length).toFixed(1));
      setSteps((prev) =>
        prev.map((s, idx) => ({
          ...s,
          percentage:
            idx === prev.length - 1
              ? Number((100 - equalShare * (prev.length - 1)).toFixed(1))
              : equalShare,
        }))
      );
      return;
    }

    const share = Number((remaining / unallocatedCount).toFixed(1));
    let allocatedSoFar = explicitSum;
    let unallocatedProcessed = 0;

    setSteps((prev) =>
      prev.map((s) => {
        const val = Number(s.percentage);
        if (val > 0) return s;

        unallocatedProcessed++;
        let p = share;
        if (unallocatedProcessed === unallocatedCount) {
          p = Number((100 - allocatedSoFar).toFixed(1));
        } else {
          allocatedSoFar += share;
        }
        return { ...s, percentage: p };
      })
    );
  };

  const updateStep = (
    idx: number,
    field: "title" | "estimatedDays" | "percentage",
    val: string | number
  ) => {
    setSteps((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: val } : s))
    );
  };

  const addStep = () => {
    setSteps((prev) => [...prev, { title: "", estimatedDays: 1, percentage: "" }]);
  };

  const removeStep = (idx: number) => {
    if (steps.length <= 1) return;
    setSteps((prev) => prev.filter((_, i) => i !== idx));
  };

  const computedTotalPercentage = calculateExplicitSum();
  const isValidPercentage = Math.abs(computedTotalPercentage - 100) < 0.5;

  const handleSubmit = async () => {
    if (!session?.user.accessToken) return;
    if (!steps.every((s) => s.title.trim())) {
      error("All steps must have a title");
      return;
    }

    setSubmitting(true);
    try {
      await workUpdatesApi.createPlan(session.user.accessToken, {
        refType,
        refId,
        steps: steps.map((s) => ({
          title: s.title.trim(),
          estimatedDays: Math.max(1, Number(s.estimatedDays) || 1),
          percentage: Number(s.percentage) || 0,
        })),
      });

      success("Execution plan created successfully!");
      onPlanCreated?.();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create plan";
      error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <div className="space-y-5 font-[family-name:var(--font-poppins)]">
        {/* ── Header ── */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles size={18} className="text-[#d4a017]" /> Create Execution Plan
            </h2>
            {title && <p className="text-xs text-slate-400 mt-0.5 truncate">{title}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Helper Notice & Auto-Split Bar ── */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#1e3a5f]/5 via-blue-50/50 to-transparent border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-600 space-y-0.5">
            <p className="font-bold text-[#1e3a5f]">Plan all milestones at once</p>
            <p className="text-slate-500">
              Set title, estimated days, and weight (%). The percentage total must equal 100%.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAutoSplit}
            className="px-3.5 py-2 rounded-xl bg-[#1e3a5f] hover:bg-[#152a45] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm flex-shrink-0 border-0 cursor-pointer"
          >
            <Sparkles size={13} className="text-amber-300" />
            <span>Auto-Split %</span>
          </button>
        </div>

        {/* ── Steps List Inputs ── */}
        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center gap-3 group hover:border-blue-200 transition-all"
            >
              <span className="w-6 h-6 rounded-full bg-[#1e3a5f] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0">
                {idx + 1}
              </span>

              {/* Title input */}
              <input
                type="text"
                value={step.title}
                onChange={(e) => updateStep(idx, "title", e.target.value)}
                placeholder="Step title (e.g. Database Setup)"
                className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent placeholder:text-slate-400 font-medium"
              />

              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                {/* Days input */}
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700">
                  <Clock size={12} className="text-slate-400" />
                  <input
                    type="number"
                    min="1"
                    value={step.estimatedDays}
                    onChange={(e) => updateStep(idx, "estimatedDays", e.target.value)}
                    className="w-10 text-center font-bold focus:outline-none bg-transparent"
                  />
                  <span className="text-[10px] text-slate-400">days</span>
                </div>

                {/* Percentage input */}
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700">
                  <Percent size={12} className="text-slate-400" />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="%"
                    value={step.percentage}
                    onChange={(e) => updateStep(idx, "percentage", e.target.value)}
                    className="w-12 text-center font-bold focus:outline-none bg-transparent"
                  />
                  <span className="text-[10px] text-slate-400">%</span>
                </div>

                {/* Delete button */}
                {steps.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStep(idx)}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add Step Button */}
        <button
          type="button"
          onClick={addStep}
          className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 hover:border-[#1e3a5f] text-slate-600 hover:text-[#1e3a5f] font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 bg-white cursor-pointer"
        >
          <Plus size={14} /> Add Another Step
        </button>

        {/* ── Summary & Status Bar ── */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <Clock size={13} className="text-[#1e3a5f]" /> Total Duration:{" "}
              <strong className="text-slate-900">{totalDays} days</strong>
            </span>

            <span
              className={`font-bold flex items-center gap-1 px-2.5 py-1 rounded-full ${
                isValidPercentage
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}
            >
              {isValidPercentage ? (
                <Check size={12} className="text-emerald-600" />
              ) : (
                <AlertCircle size={12} className="text-amber-600" />
              )}
              <span>Total Weight: {computedTotalPercentage}%</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={submitting}
              onClick={handleSubmit}
              className="bg-[#1e3a5f] hover:bg-[#152a45] text-white font-bold"
            >
              {submitting ? "Saving Plan..." : "Submit Execution Plan"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
