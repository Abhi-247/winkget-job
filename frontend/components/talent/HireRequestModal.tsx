"use client";

import { useState, useEffect, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { User, Job } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { hireRequestsApi, jobsApi } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ProjectType = "hourly" | "fixed";

const DURATIONS = ["< 1 week", "1–2 weeks", "1 month", "2–3 months", "3–6 months", "6+ months"];

// ─── Props ────────────────────────────────────────────────────────────────────

interface HireRequestModalProps {
  freelancer: User | null;
  onClose: () => void;
  onSuccess?: () => void;
}

// ─── Sub: custom select ───────────────────────────────────────────────────────

function StyledSelect({
  label, value, onChange, children, disabled,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const inputCls = cn(
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900",
    "focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent",
    "disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
  );
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={inputCls}
      >
        {children}
      </select>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function HireRequestModal({ freelancer, onClose, onSuccess }: HireRequestModalProps) {
  const { data: session } = useSession();
  const router            = useRouter();
  const { success, error } = useToast();

  const [step,         setStep]         = useState<1 | 2>(1);
  const [myJobs,       setMyJobs]       = useState<Job[]>([]);
  const [jobsLoading,  setJobsLoading]  = useState(false);
  const [selectedJob,  setSelectedJob]  = useState("");
  const [projectType,  setProjectType]  = useState<ProjectType>("fixed");
  const [hours,        setHours]        = useState("");
  const [budget,       setBudget]       = useState("");
  const [duration,     setDuration]     = useState(DURATIONS[2]);
  const [message,      setMessage]      = useState("");
  const [submitting,   setSubmitting]   = useState(false);

  const isEmployer  = session?.user?.role === "employer";
  const hasSession  = !!session;

  // Reset state when modal opens for a new freelancer
  useEffect(() => {
    if (!freelancer) return;
    setStep(1);
    setSelectedJob("");
    setProjectType("fixed");
    setHours("");
    setBudget("");
    setDuration(DURATIONS[2]);
    setMessage("");
  }, [freelancer]);

  // Fetch employer's jobs
  useEffect(() => {
    if (!freelancer || !isEmployer || !session?.user?.accessToken) return;
    setJobsLoading(true);
    jobsApi.getMyJobs(session.user.accessToken)
      .then((res) => {
        const jobs = (res as { data: Job[] }).data ?? [];
        setMyJobs(jobs);
        if (jobs.length > 0) setSelectedJob(jobs[0]._id);
      })
      .catch(() => setMyJobs([]))
      .finally(() => setJobsLoading(false));
  }, [freelancer, isEmployer, session]);

  const computedSalary = projectType === "hourly"
    ? (Number(hours) || 0) * (freelancer?.hourlyRate || 0)
    : Number(budget) || 0;

  const handleContinue = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedJob) { error("Please select a job post"); return; }
    if (computedSalary <= 0) { error("Please enter a valid budget or hours"); return; }
    setStep(2);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!session?.user?.accessToken || !freelancer) return;
    setSubmitting(true);
    try {
      await hireRequestsApi.create(session.user.accessToken, {
        jobseekerId: freelancer._id,
        jobId:       selectedJob,
        salary:      computedSalary,
        message:     message.trim() || undefined,
      });
      success("Hire request sent!");
      onSuccess?.();
      onClose();
    } catch {
      error("Failed to send hire request — please try again");
    } finally {
      setSubmitting(false);
    }
  };

  if (!freelancer) return null;

  return (
    <Modal open={!!freelancer} onClose={onClose} size="sm">
      {/* Custom header */}
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100 -mt-1">
        <Avatar name={freelancer.name} src={freelancer.avatar} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="text-xs text-gray-400 leading-tight">Sending hire request to</p>
          <p className="text-sm font-semibold text-gray-900 truncate">{freelancer.name}</p>
          {freelancer.title && (
            <p className="text-xs text-gray-500 truncate">{freelancer.title}</p>
          )}
        </div>
        {freelancer.hourlyRate && (
          <Badge variant="info" className="flex-shrink-0 text-xs">
            {formatCurrency(freelancer.hourlyRate)}/hr
          </Badge>
        )}
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-5">
        {[1, 2].map((n) => (
          <div key={n} className="flex items-center gap-2">
            {n > 1 && <div className="w-8 h-px bg-gray-200 flex-shrink-0" />}
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
              step === n
                ? "bg-[#1e3a5f] text-white"
                : step > n
                ? "bg-green-500 text-white"
                : "bg-gray-100 text-gray-400"
            )}>
              {n}
            </div>
            <span className={cn(
              "text-xs font-medium",
              step === n ? "text-gray-900" : "text-gray-400"
            )}>
              {n === 1 ? "Project details" : "Message"}
            </span>
          </div>
        ))}
      </div>

      {/* Non-employer prompt */}
      {!hasSession && (
        <div className="text-center py-4">
          <Badge variant="warning" className="mb-3">Sign in required</Badge>
          <p className="text-sm text-gray-600 mb-4">
            Please sign in as an employer to send hire requests.
          </p>
          <Button fullWidth onClick={() => { onClose(); router.push("/sign-in?role=employer"); }}>
            Sign In as Employer
          </Button>
        </div>
      )}

      {hasSession && !isEmployer && (
        <div className="text-center py-4">
          <Badge variant="warning" className="mb-3">Employer account required</Badge>
          <p className="text-sm text-gray-600 mb-4">
            Only employers can send hire requests.
          </p>
          <Button variant="outline" fullWidth onClick={onClose}>Close</Button>
        </div>
      )}

      {/* Step 1 */}
      {hasSession && isEmployer && step === 1 && (
        <form onSubmit={handleContinue} className="space-y-4">
          <StyledSelect
            label="Select Job Post"
            value={selectedJob}
            onChange={setSelectedJob}
            disabled={jobsLoading}
          >
            {jobsLoading && <option value="">Loading jobs…</option>}
            {!jobsLoading && myJobs.length === 0 && (
              <option value="">No active job posts</option>
            )}
            {myJobs.map((j) => (
              <option key={j._id} value={j._id}>{j.title}</option>
            ))}
          </StyledSelect>

          {/* Project type toggle */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Project Type</label>
            <div className="flex gap-2">
              {(["fixed", "hourly"] as ProjectType[]).map((t) => (
                <Button
                  key={t}
                  type="button"
                  size="sm"
                  variant={projectType === t ? "primary" : "secondary"}
                  className="flex-1 capitalize"
                  onClick={() => setProjectType(t)}
                >
                  {t === "fixed" ? "Fixed Price" : "Hourly Rate"}
                </Button>
              ))}
            </div>
          </div>

          {/* Budget / hours input */}
          {projectType === "hourly" ? (
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Hours / Week"
                type="number"
                min="1"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="20"
              />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Estimated Total</label>
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 font-medium">
                  {computedSalary > 0 ? formatCurrency(computedSalary) : "—"}
                </div>
              </div>
            </div>
          ) : (
            <Input
              label="Total Budget (₹)"
              type="number"
              min="1"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="50000"
            />
          )}

          {/* Project duration */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Project Duration</label>
            <div className="flex flex-wrap gap-2">
              {DURATIONS.map((d) => (
                <Button
                  key={d}
                  type="button"
                  size="sm"
                  variant={duration === d ? "primary" : "secondary"}
                  className="text-xs"
                  onClick={() => setDuration(d)}
                >
                  {d}
                </Button>
              ))}
            </div>
          </div>

          <Button type="submit" fullWidth className="gap-2 mt-2">
            Continue <ChevronRight size={15} />
          </Button>
        </form>
      )}

      {/* Step 2 */}
      {hasSession && isEmployer && step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Summary */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-1.5 border border-gray-200 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Job post</span>
              <span className="font-medium text-gray-800 truncate max-w-[60%] text-right">
                {myJobs.find((j) => j._id === selectedJob)?.title ?? "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Type</span>
              <span className="font-medium text-gray-800 capitalize">{projectType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Budget</span>
              <span className="font-medium text-gray-800">{formatCurrency(computedSalary)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Duration</span>
              <span className="font-medium text-gray-800">{duration}</span>
            </div>
          </div>

          {/* Message */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Message to {freelancer.name.split(" ")[0]}
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Hi ${freelancer.name.split(" ")[0]}, I'd like to hire you for...`}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent resize-none"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setStep(1)}
              className="flex-shrink-0"
            >
              Back
            </Button>
            <Button type="submit" fullWidth loading={submitting}>
              Send Hire Request
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
