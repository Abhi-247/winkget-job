"use client";

import { useState, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { tasksApi } from "@/lib/api";
import { Task } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { MapPin, DollarSign } from "lucide-react";

interface ClaimTaskModalProps {
  task: Task;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ClaimTaskModal({ task, open, onClose, onSuccess }: ClaimTaskModalProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { success, error } = useToast();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!session?.user.accessToken) {
      router.push(`/sign-in?callbackUrl=/tasks/${task._id}`);
      return;
    }
    setLoading(true);
    try {
      await tasksApi.claimTask(session.user.accessToken, task._id, message);
      success("Claim submitted successfully!");
      setMessage("");
      onSuccess?.();
      onClose();
    } catch (err) {
      error(err instanceof Error ? err.message : "Failed to submit claim");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Claim / Apply for Task" size="md">
      {/* Task summary */}
      <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-1">
        <p className="font-semibold text-gray-900">{task.title}</p>
        <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-1">
          <span className="flex items-center gap-1 font-semibold text-gray-700">
            <DollarSign size={12} />
            {formatCurrency(task.budget)} Fixed Price
          </span>
          <span className="flex items-center gap-1">
            <MapPin size={12} />
            {task.location}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            Brief Pitch / Message *
          </label>
          <textarea
            rows={4}
            placeholder="Explain why you are the best fit for this quick task and list relevant experience..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent resize-none"
            required
          />
          <p className="text-xs text-gray-450">
            Let the employer know how and when you can complete the work.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" fullWidth loading={loading}>
            Claim Task
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
