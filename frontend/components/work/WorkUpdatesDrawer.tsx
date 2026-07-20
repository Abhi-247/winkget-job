"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { WorkUpdate, WorkRefType } from "@/types";
import { workUpdatesApi } from "@/lib/api";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { AddUpdateModal } from "@/components/work/AddUpdateModal";
import { formatRelativeTime, cn } from "@/lib/utils";
import { X, ClipboardList, Plus } from "lucide-react";

// ─── Props ────────────────────────────────────────────────────────────────────

interface WorkUpdatesDrawerProps {
  open: boolean;
  onClose: () => void;
  refType: WorkRefType;
  refId: string;
  title: string;
  role: "jobseeker" | "employer";
}

// ─── Single update card ───────────────────────────────────────────────────────

function UpdateCard({ update }: { update: WorkUpdate }) {
  const jobseeker = typeof update.jobseeker === "object" ? update.jobseeker : null;
  const name = jobseeker?.name ?? "Freelancer";

  return (
    <div className="bg-white rounded-xl border border-gray-100 border-l-4 border-l-[#1e3a5f] shadow-sm p-4">
      {/* Header row */}
      <div className="flex items-center gap-2 mb-3 min-w-0">
        <Avatar name={name} src={jobseeker?.avatar} size="xs" />
        <div className="min-w-0">
          <span className="text-xs font-semibold text-gray-800 truncate block">{name}</span>
          <span className="text-xs text-gray-400">{formatRelativeTime(update.createdAt)}</span>
        </div>
      </div>

      {/* Bullet points */}
      <ul className="ml-1 space-y-1">
        {update.points.map((pt, i) => (
          <li key={i} className="flex gap-2 text-sm text-gray-700">
            <span className="text-[#1e3a5f] mt-0.5 flex-shrink-0">•</span>
            <span>{pt}</span>
          </li>
        ))}
      </ul>

      {/* Optional note */}
      {update.note && (
        <blockquote className="mt-3 pl-3 border-l-2 border-gray-200 text-sm text-gray-500 italic">
          {update.note}
        </blockquote>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function WorkUpdatesDrawer({
  open,
  onClose,
  refType,
  refId,
  title,
  role,
}: WorkUpdatesDrawerProps) {
  const { data: session } = useSession();
  const [updates, setUpdates] = useState<WorkUpdate[]>([]);
  const [loading, setLoading] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

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

  // On open: fetch updates; if employer, also mark all seen
  useEffect(() => {
    if (!open || !refId) return;
    fetchUpdates();
    if (role === "employer" && session?.user.accessToken) {
      workUpdatesApi.markAllSeen(session.user.accessToken, refId).catch(() => {});
    }
  }, [open, refId, role, session, fetchUpdates]);

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

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
          "fixed inset-y-0 right-0 z-50 flex flex-col bg-gray-50 shadow-2xl",
          "w-full sm:w-[460px]",
          "transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* ── Drawer header ── */}
        <div className="flex items-start justify-between gap-3 px-5 py-4 bg-white border-b border-gray-100 flex-shrink-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <ClipboardList size={16} className="text-[#1e3a5f] flex-shrink-0" />
              <h2 className="text-sm font-semibold text-gray-900 truncate">Progress Updates</h2>
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 flex-shrink-0">
                {role === "jobseeker" ? "Your Updates" : "Freelancer Updates"}
              </span>
            </div>
            {title && (
              <p className="text-xs text-gray-400 mt-0.5 truncate">{title}</p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {role === "jobseeker" && (
              <Button
                size="sm"
                className="gap-1 bg-green-600 hover:bg-green-700 text-white"
                onClick={() => setAddModalOpen(true)}
              >
                <Plus size={13} />
                Add Update
              </Button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              aria-label="Close panel"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Scrollable timeline ── */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
          ) : updates.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center px-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ClipboardList size={28} className="text-gray-300" />
              </div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">No updates yet</h3>
              <p className="text-xs text-gray-400 max-w-[220px]">
                {role === "jobseeker"
                  ? "Post your first progress update to keep the client informed."
                  : "Updates will appear here once the freelancer posts progress."}
              </p>
              {role === "jobseeker" && (
                <Button
                  size="sm"
                  className="mt-4 gap-1 bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => setAddModalOpen(true)}
                >
                  <Plus size={13} />
                  Post First Update
                </Button>
              )}
            </div>
          ) : (
            <>
              {updates.map((u) => (
                <UpdateCard key={u._id} update={u} />
              ))}
              <div className="h-4" />
            </>
          )}
        </div>

        {/* ── Persistent footer for jobseeker (when updates exist) ── */}
        {role === "jobseeker" && updates.length > 0 && !loading && (
          <div className="flex-shrink-0 px-4 py-3 bg-white border-t border-gray-100">
            <Button
              size="sm"
              className="w-full gap-1.5 bg-green-600 hover:bg-green-700 text-white"
              onClick={() => setAddModalOpen(true)}
            >
              <Plus size={14} />
              Add Another Update
            </Button>
          </div>
        )}
      </div>

      {/* ── Nested AddUpdateModal (jobseeker only) ── */}
      {role === "jobseeker" && (
        <AddUpdateModal
          open={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          refType={refType}
          refId={refId}
          title={title}
          onPosted={() => {
            setAddModalOpen(false);
            fetchUpdates();
          }}
        />
      )}
    </>
  );
}
