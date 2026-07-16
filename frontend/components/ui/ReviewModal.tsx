"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Star, X } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { reviewsApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  revieweeId: string;
  revieweeName: string;
  taskId?: string;
  jobId?: string;
  onSubmitSuccess?: () => void;
}

export function ReviewModal({
  isOpen,
  onClose,
  revieweeId,
  revieweeName,
  taskId,
  jobId,
  onSubmitSuccess,
}: ReviewModalProps) {
  const { data: session } = useSession();
  const { success: toastSuccess, error: toastError } = useToast();
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = session?.user?.accessToken;
    if (!token) {
      toastError("You must be logged in to leave a review.");
      return;
    }
    if (rating === 0) {
      toastError("Please select a rating of at least 1 star.");
      return;
    }
    if (!comment.trim()) {
      toastError("Please enter a short comment.");
      return;
    }

    setLoading(true);
    try {
      const res = (await reviewsApi.create(token, {
        revieweeId,
        rating,
        comment,
        taskId,
        jobId,
      })) as { success: boolean; message?: string };

      if (res.success) {
        toastSuccess("Review submitted successfully! Thank you.");
        setRating(0);
        setComment("");
        if (onSubmitSuccess) onSubmitSuccess();
        onClose();
      } else {
        toastError(res.message || "Failed to submit review");
      }
    } catch (err: any) {
      console.error(err);
      toastError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs font-[family-name:var(--font-poppins)]">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-base font-bold text-gray-900">Write a Review</h3>
          <p className="text-xs text-gray-500 mt-1">
            Share your experience working with <span className="font-semibold text-gray-800">{revieweeName}</span>.
          </p>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Star selector */}
          <div className="flex flex-col items-center justify-center space-y-2 py-3 bg-gray-50 rounded-xl">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Overall Rating
            </span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => {
                const isGold = hoverRating ? n <= hoverRating : n <= rating;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHoverRating(n)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 focus:outline-none transition-transform hover:scale-110 duration-150"
                  >
                    <Star
                      size={28}
                      className={
                        isGold
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300 fill-transparent"
                      }
                      strokeWidth={1.5}
                    />
                  </button>
                );
              })}
            </div>
            {rating > 0 && (
              <span className="text-xs font-medium text-[#1e3a5f]">
                {rating === 5
                  ? "Excellent! Outstanding experience"
                  : rating === 4
                  ? "Very Good! High quality work"
                  : rating === 3
                  ? "Good! Met expectations"
                  : rating === 2
                  ? "Fair! Could be improved"
                  : "Poor! Unsatisfactory experience"}
              </span>
            )}
          </div>

          {/* Comment text area */}
          <div className="space-y-1.5">
            <label htmlFor="review-comment" className="block text-xs font-bold text-gray-700">
              Comment
            </label>
            <textarea
              id="review-comment"
              rows={4}
              required
              placeholder="Tell others what it was like working together..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full text-sm p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/25 focus:border-[#1e3a5f] transition-all"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
