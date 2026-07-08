"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { applicationsApi } from "@/lib/api";
import { Application, ApplicationStatus } from "@/types";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { TableRowSkeleton } from "@/components/ui/Skeleton";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import {
  FileText,
  X,
  ExternalLink,
  Briefcase,
  Plus,
} from "lucide-react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = "all" | ApplicationStatus;

const TABS: { id: TabId; label: string }[] = [
  { id: "all",      label: "All" },
  { id: "pending",  label: "Pending" },
  { id: "accepted", label: "Accepted" },
  { id: "rejected", label: "Not Selected" },
];

// ─── Cover Letter Modal ───────────────────────────────────────────────────────

function CoverLetterModal({
  letter,
  jobTitle,
  onClose,
}: {
  letter: string;
  jobTitle: string;
  onClose: () => void;
}) {
  // Close on backdrop click
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Cover Letter</h3>
            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[280px]">{jobTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto flex-1">
          {letter ? (
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {letter}
            </p>
          ) : (
            <p className="text-sm text-gray-400 italic">No cover letter submitted.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Stat Counter Card ────────────────────────────────────────────────────────

interface StatCounterProps {
  count: number;
  label: string;
  active: boolean;
  color: string;
  bg: string;
  activeBg: string;
  onClick: () => void;
}

function StatCounter({ count, label, active, color, bg, activeBg, onClick }: StatCounterProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-xl p-5 text-left transition-all border-2",
        active
          ? `${activeBg} border-current ${color}`
          : `${bg} border-transparent hover:border-gray-200`
      )}
    >
      <div className={cn("text-3xl font-bold mb-1", active ? color : "text-gray-800")}>
        {count}
      </div>
      <div className={cn("text-sm font-medium", active ? color : "text-gray-500")}>
        {label}
      </div>
    </button>
  );
}

// ─── Application Row Card ─────────────────────────────────────────────────────

interface AppRowProps {
  app: Application;
  onViewLetter: (app: Application) => void;
}

function ApplicationRow({ app, onViewLetter }: AppRowProps) {
  const job      = typeof app.job      === "object" ? app.job      : null;
  const employer = job && typeof job.employer === "object" ? job.employer : null;

  const statusLabel =
    app.status === "rejected"
      ? "Not Selected"
      : app.status.charAt(0).toUpperCase() + app.status.slice(1);

  const badgeVariant = statusBadge(app.status);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 hover:shadow-sm transition-shadow">
      {/* Top row: avatar + title + status */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Avatar
            name={employer?.company || employer?.name || "Co"}
            size="md"
          />
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 truncate">
              {job?.title || "—"}
            </h4>
            <p className="text-xs font-medium text-[#1e3a5f] mt-0.5 truncate">
              {employer?.company || employer?.name || "—"}
            </p>
          </div>
        </div>
        <Badge variant={badgeVariant} className="flex-shrink-0 mt-0.5">
          {statusLabel}
        </Badge>
      </div>

      {/* Meta row */}
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
        {job && (
          <span className="flex items-center gap-1">
            <Briefcase size={11} className="text-gray-300" />
            Job budget: <span className="text-gray-600 font-medium ml-0.5">{formatCurrency(job.salary)}</span>
          </span>
        )}
        <span className="text-gray-200 hidden sm:inline">·</span>
        <span>
          Availability: <span className="text-gray-600 font-medium">Immediately</span>
        </span>
        <span className="text-gray-200 hidden sm:inline">·</span>
        <span>
          Submitted: <span className="text-gray-600 font-medium">{formatDate(app.createdAt)}</span>
        </span>
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => onViewLetter(app)}
        >
          <FileText size={13} />
          View Letter
        </Button>
        {job && (
          <Link href={`/jobs/${job._id}`}>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-[#1e3a5f] hover:text-[#1e3a5f] hover:bg-[#edf2f7]"
            >
              Details
              <ExternalLink size={12} />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ApplicationsPage() {
  const { data: session, status } = useSession();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading]           = useState(true);
  const [activeTab, setActiveTab]       = useState<TabId>("all");
  const [modalApp, setModalApp]         = useState<Application | null>(null);

  const fetchApplications = useCallback(async () => {
    if (!session?.user.accessToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = (await applicationsApi.getMyApplications(
        session.user.accessToken
      )) as { data: Application[] };
      setApplications(res.data || []);
    } catch {
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (status === "loading") return;
    fetchApplications();
  }, [fetchApplications, status]);

  // Counts
  const counts = {
    all:      applications.length,
    pending:  applications.filter((a) => a.status === "pending").length,
    accepted: applications.filter((a) => a.status === "accepted").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  // Filtered list
  const filtered =
    activeTab === "all"
      ? applications
      : applications.filter((a) => a.status === activeTab);

  // Stat counter cards config
  const statCards = [
    {
      id: "pending"  as TabId,
      label: "Pending",
      count: counts.pending,
      color: "text-amber-600",
      bg: "bg-amber-50",
      activeBg: "bg-amber-50",
    },
    {
      id: "accepted" as TabId,
      label: "Accepted",
      count: counts.accepted,
      color: "text-[#1e3a5f]",
      bg: "bg-[#edf2f7]",
      activeBg: "bg-[#edf2f7]",
    },
    {
      id: "rejected" as TabId,
      label: "Not Selected",
      count: counts.rejected,
      color: "text-red-500",
      bg: "bg-red-50",
      activeBg: "bg-red-50",
    },
  ];

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">My Applications</h2>
          <p className="text-sm text-gray-400 mt-0.5">Track all the jobs you&apos;ve applied to</p>
        </div>
        <Link href="/jobs">
          <Button size="sm" className="gap-1.5 self-start sm:self-auto">
            <Plus size={14} />
            Browse Jobs
          </Button>
        </Link>
      </div>

      {/* ── Stat Counter Cards ── */}
      <div className="grid grid-cols-3 gap-4">
        {statCards.map((card) => (
          <StatCounter
            key={card.id}
            count={card.count}
            label={card.label}
            active={activeTab === card.id}
            color={card.color}
            bg={card.bg}
            activeBg={card.activeBg}
            onClick={() => setActiveTab(activeTab === card.id ? "all" : card.id)}
          />
        ))}
      </div>

      {/* ── Tab row ── */}
      <div className="bg-white rounded-xl border border-gray-200">
        {/* Tabs */}
        <div className="px-5 border-b border-gray-100 flex items-center gap-0.5 overflow-x-auto" role="tablist">
          {TABS.map((tab) => {
            const count = tab.id === "rejected" ? counts.rejected : counts[tab.id as keyof typeof counts];
            const label = tab.id === "rejected" ? "Not Selected" : tab.label;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap",
                  activeTab === tab.id
                    ? "border-blue-600 text-[#1e3a5f]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                {label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-xs",
                    activeTab === tab.id
                      ? "bg-blue-100 text-[#1e3a5f]"
                      : "bg-gray-100 text-gray-500"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Application list */}
        <div className="p-5 space-y-3">
          {loading ? (
            <table className="w-full">
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRowSkeleton key={i} cols={1} />
                ))}
              </tbody>
            </table>
          ) : filtered.length === 0 ? (
            <div className="text-center py-14">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText size={22} className="text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">No applications found</p>
              <p className="text-xs text-gray-400 mb-5">
                {activeTab === "all"
                  ? "You haven't applied to any jobs yet."
                  : `No ${activeTab === "rejected" ? "not selected" : activeTab} applications.`}
              </p>
              <Link href="/jobs">
                <Button size="sm">Browse Jobs</Button>
              </Link>
            </div>
          ) : (
            filtered.map((app) => (
              <ApplicationRow
                key={app._id}
                app={app}
                onViewLetter={setModalApp}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Cover Letter Modal ── */}
      {modalApp && (
        <CoverLetterModal
          letter={modalApp.coverLetter}
          jobTitle={
            typeof modalApp.job === "object" ? modalApp.job.title : "Job"
          }
          onClose={() => setModalApp(null)}
        />
      )}
    </div>
  );
}
