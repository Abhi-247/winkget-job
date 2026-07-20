"use client";

import { useRef, useEffect, useState, KeyboardEvent } from "react";
import { useSession } from "next-auth/react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { workUpdatesApi } from "@/lib/api";
import { WorkRefType } from "@/types";
import { X, Plus, ChevronDown, ChevronUp } from "lucide-react";

// ─── Props ────────────────────────────────────────────────────────────────────

interface AddUpdateModalProps {
  open: boolean;
  onClose: () => void;
  refType: WorkRefType;
  refId: string;
  title: string;
  /** Called after a successful post so parent can refresh counts */
  onPosted?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AddUpdateModal({
  open,
  onClose,
  refType,
  refId,
  title,
  onPosted,
}: AddUpdateModalProps) {
  const { data: session } = useSession();
  const { success, error } = useToast();

  const [points, setPoints] = useState<string[]>([""]);
  const [note, setNote] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setPoints([""]);
      setNote("");
      setNoteOpen(false);
    }
  }, [open]);

  // Keep refs array in sync with points length
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, points.length);
  }, [points.length]);

  const updatePoint = (idx: number, val: string) => {
    setPoints((prev) => prev.map((p, i) => (i === idx ? val : p)));
  };

  const removePoint = (idx: number) => {
    setPoints((prev) => prev.filter((_, i) => i !== idx));
  };

  const addPoint = () => {
    if (points.length >= 10) return;
    setPoints((prev) => [...prev, ""]);
    setTimeout(() => {
      inputRefs.current[points.length]?.focus();
    }, 30);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (idx < points.length - 1) {
        inputRefs.current[idx + 1]?.focus();
      } else {
        addPoint();
      }
    }
  };

  const canSubmit = points.some((p) => p.trim().length > 0);

  const handleSubmit = async () => {
    if (!session?.user.accessToken || !canSubmit) return;
    setSubmitting(true);
    try {
      await workUpdatesApi.post(session.user.accessToken, {
        refType,
        refId,
        points: points.filter((p) => p.trim()),
        note: note.trim() || undefined,
      });
      success("Progress update posted!");
      onPosted?.();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to post update";
      error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} size="md">
      <div className="space-y-5">
        {/* ── Header ── */}
        <div>
          <h2 className="text-base font-semibold text-gray-900">Post Progress Update</h2>
          {title && (
            <p className="text-xs text-gray-400 mt-0.5 truncate">{title}</p>
          )}
        </div>

        {/* ── Bullet points ── */}
        <div>
          <p className="text-xs font-medium text-gray-600 mb-2">
            What did you complete?{" "}
            <span className="text-gray-400 font-normal">({points.length}/10)</span>
          </p>
          <div className="space-y-2">
            {points.map((pt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-[#1e3a5f] font-bold text-sm flex-shrink-0 w-3">•</span>
                <input
                  ref={(el) => { inputRefs.current[idx] = el; }}
                  type="text"
                  value={pt}
                  onChange={(e) => updatePoint(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  placeholder="What did you complete..."
                  className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent placeholder:text-gray-300"
                />
                {points.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePoint(idx)}
                    className="p-1 rounded-md text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors flex-shrink-0"
                    aria-label="Remove point"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {points.length < 10 && (
            <button
              type="button"
              onClick={addPoint}
              className="mt-2 flex items-center gap-1 text-xs text-[#1e3a5f] hover:underline font-medium"
            >
              <Plus size={13} />
              Add Point
            </button>
          )}
        </div>

        {/* ── Optional note (collapsible) ── */}
        <div>
          <button
            type="button"
            onClick={() => setNoteOpen((v) => !v)}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            {noteOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {noteOpen ? "Hide note" : "▾ Add a note"}
          </button>
          {noteOpen && (
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any additional context for the client..."
              className="mt-2 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent resize-none placeholder:text-gray-300"
            />
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-end gap-2 pt-1 border-t border-gray-100">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={submitting}
            disabled={!canSubmit || submitting}
          >
            Post Update
          </Button>
        </div>
      </div>
    </Modal>
  );
}
