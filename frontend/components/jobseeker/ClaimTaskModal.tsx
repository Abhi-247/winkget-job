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
  const [bidAmount, setBidAmount] = useState<number | string>(task.budget || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!session?.user.accessToken) {
      router.push(`/sign-in?callbackUrl=/tasks/${task._id}`);
      return;
    }
    const numBid = Number(bidAmount);
    if (!numBid || numBid <= 0) {
      error("Please enter a valid bid amount greater than 0");
      return;
    }

    setLoading(true);
    try {
      await tasksApi.claimTask(session.user.accessToken, task._id, message, numBid);
      success("Claim & Bid submitted successfully!");
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
    <Modal open={open} onClose={onClose} title="Claim / Pitch Bid for Task" size="md">
      {/* Task summary */}
      <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-1">
        <p className="font-semibold text-gray-900">{task.title}</p>
        <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-1">
          <span className="flex items-center gap-1 font-semibold text-gray-700">
            <DollarSign size={12} />
            Initial Posted Budget: {formatCurrency(task.budget)}
          </span>
          <span className="flex items-center gap-1">
            <MapPin size={12} />
            {task.location}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Custom Bid Amount */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 flex items-center justify-between">
            <span>Your Bid Amount ($) *</span>
            <span className="text-xs text-gray-400 font-normal">
              Posted: ${task.budget}
            </span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
              $
            </span>
            <input
              type="number"
              min={1}
              step="any"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder="Enter your proposed total price"
              className="w-full rounded-lg border border-gray-300 pl-7 pr-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
              required
            />
          </div>
          <p className="text-xs text-gray-500">
            If selected, the employer's updated task budget will set to your bid amount.
          </p>
        </div>

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
