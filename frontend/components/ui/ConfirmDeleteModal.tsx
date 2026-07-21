"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { AlertTriangle } from "lucide-react";

interface ConfirmDeleteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  /** Bold subject line, e.g. "Delete Bhanu?" */
  title: string;
  /** Descriptive warning shown below the title */
  description?: string;
  /** Text the user must type to unlock the confirm button (optional) */
  confirmPhrase?: string;
  /** Label for the confirm button (default: "Delete") */
  confirmLabel?: string;
  loading?: boolean;
}

export function ConfirmDeleteModal({
  open,
  onClose,
  onConfirm,
  title,
  description = "This action cannot be undone. All associated data will be permanently removed.",
  confirmPhrase,
  confirmLabel = "Delete",
  loading = false,
}: ConfirmDeleteModalProps) {
  const [typed, setTyped]     = useState("");
  const [running, setRunning] = useState(false);

  const needsPhrase = !!confirmPhrase;
  const unlocked    = !needsPhrase || typed.trim() === confirmPhrase;

  const handleConfirm = async () => {
    if (!unlocked) return;
    setRunning(true);
    try {
      await onConfirm();
    } finally {
      setRunning(false);
      setTyped("");
    }
  };

  const handleClose = () => {
    if (running) return;
    setTyped("");
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} size="sm">
      <div className="space-y-4">
        {/* Icon + title */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={18} className="text-red-500" />
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className="text-base font-bold text-gray-900 leading-snug">{title}</h3>
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">{description}</p>
          </div>
        </div>

        {/* Optional type-to-confirm */}
        {needsPhrase && (
          <div>
            <p className="text-xs text-gray-500 mb-1.5">
              Type <span className="font-semibold text-gray-700">{confirmPhrase}</span> to confirm
            </p>
            <input
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={confirmPhrase}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400"
              autoComplete="off"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleClose}
            disabled={running || loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleConfirm}
            loading={running || loading}
            disabled={!unlocked || running || loading}
            className="flex-1"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
