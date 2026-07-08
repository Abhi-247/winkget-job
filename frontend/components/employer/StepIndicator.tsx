"use client";

import { useRef, useEffect } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  num: number;
  title: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepNum: number) => void;
}

export function StepIndicator({ steps, currentStep, onStepClick }: StepIndicatorProps) {
  const total = steps.length;
  const current = steps.find((s) => s.num === currentStep);
  const progressPct = Math.round(((currentStep - 1) / (total - 1)) * 100);

  const activeStepRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeStepRef.current) {
      activeStepRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [currentStep]);

  return (
    <>
      {/* ── Mobile: single-line header + progress bar ─────────────────── */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-900">
            Step {currentStep} of {total}
          </span>
          <span className="text-sm text-gray-500">{current?.title}</span>
        </div>
        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1e3a5f] rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        {/* Completed step pills — tap to jump back */}
        {currentStep > 1 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {steps
              .filter((s) => s.num < currentStep)
              .map((s) => (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => onStepClick?.(s.num)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#edf2f7] border border-[#1e3a5f]/20 text-[#1e3a5f] text-xs font-medium hover:bg-[#dce4ef] transition-colors"
                >
                  <Check size={10} strokeWidth={3} />
                  {s.title}
                </button>
              ))}
          </div>
        )}
      </div>

      {/* ── Desktop: full horizontal numbered stepper ─────────────────── */}
      <div 
        ref={containerRef}
        className="hidden lg:flex items-center gap-2 overflow-x-auto no-scrollbar py-2 w-full max-w-full"
      >
        {steps.map((step, index) => {
          const isActive = currentStep === step.num;
          const isCompleted = currentStep > step.num;

          return (
            <div 
              key={step.num} 
              ref={isActive ? activeStepRef : null}
              className="flex items-center gap-2 flex-shrink-0"
            >
              {/* Circle */}
              <button
                type="button"
                disabled={!isCompleted}
                onClick={() => isCompleted && onStepClick?.(step.num)}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 transition-colors",
                  isCompleted
                    ? "bg-[#1e3a5f] text-white cursor-pointer hover:bg-[#1a3354]"
                    : isActive
                    ? "bg-[#1e3a5f] text-white cursor-default"
                    : "bg-gray-200 text-gray-500 cursor-default"
                )}
                aria-label={isCompleted ? `Go back to step ${step.num}: ${step.title}` : undefined}
              >
                {isCompleted ? <Check size={15} strokeWidth={3} /> : step.num}
              </button>

              {/* Title */}
              <span
                className={cn(
                  "text-sm font-medium whitespace-nowrap",
                  isActive ? "text-[#1e3a5f]" : isCompleted ? "text-gray-600" : "text-gray-400"
                )}
              >
                {step.title}
              </span>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "w-8 h-px mx-1 flex-shrink-0",
                    currentStep > step.num ? "bg-[#1e3a5f]" : "bg-gray-200"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
