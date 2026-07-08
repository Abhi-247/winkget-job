"use client";

import { useState, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { applicationsApi } from "@/lib/api";
import { Job } from "@/types";
import { formatCurrency, salaryLabel } from "@/lib/utils";
import { MapPin, DollarSign } from "lucide-react";

interface ApplyModalProps {
  job: Job;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ApplyModal({ job, open, onClose, onSuccess }: ApplyModalProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { success, error } = useToast();
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!session?.user.accessToken) {
      router.push(`/sign-in?callbackUrl=/jobs/${job._id}`);
      return;
    }
    setLoading(true);
    try {
      await applicationsApi.apply(session.user.accessToken, job._id, coverLetter);
      success("Application submitted successfully!");
      setCoverLetter("");
      onSuccess?.();
      onClose();
    } catch (err) {
      error(err instanceof Error ? err.message : "Failed to submit application");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Apply for this Job" size="md">
      {/* Job summary */}
      <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-1">
        <p className="font-semibold text-gray-900">{job.title}</p>
        <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-1">
          <span className="flex items-center gap-1">
            <DollarSign size={12} />
            {formatCurrency(job.salary)}{salaryLabel(job.salaryType)}
          </span>
          <span className="flex items-center gap-1">
            <MapPin size={12} />
            {job.location}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            Cover Letter{" "}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            rows={5}
            placeholder="Introduce yourself and explain why you're a great fit for this role..."
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent resize-none"
          />
          <p className="text-xs text-gray-400">
            A personalised cover letter significantly improves your chances.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" fullWidth loading={loading}>
            Submit Application
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
