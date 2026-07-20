"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { hireRequestsApi, jobsApi, workUpdatesApi } from "@/lib/api";
import { HireRequest, HireRequestStatus, Job, WorkUpdate } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import { AddUpdateModal } from "@/components/work/AddUpdateModal";
import { WorkUpdatesDrawer } from "@/components/work/WorkUpdatesDrawer";
import { formatCurrency, formatRelativeTime, cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { FileText, ExternalLink, X, MapPin, DollarSign, Briefcase, Plus, ClipboardList } from "lucide-react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = "pending" | "accepted" | "rejected" | "withdrawn";

const TABS: { id: TabId; label: string }[] = [
  { id: "pending",   label: "Pending"      },
  { id: "accepted",  label: "Accepted"     },
  { id: "rejected",  label: "Not Selected" },
  { id: "withdrawn", label: "Withdrawn"    },
];

// ─── Stat Counter Card ────────────────────────────────────────────────────────

function StatCounter({
  count, label, active, color, bg, onClick,
}: {
  count: number; label: string; active: boolean;
  color: string; bg: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-2xl p-4 sm:p-5 text-left transition-all border cursor-pointer",
        active
          ? `${bg} border-current ${color} shadow-xs`
          : `${bg} border-slate-200/60 hover:shadow-xs`
      )}
    >
      <div className={cn("text-2xl sm:text-3xl font-extrabold mb-1", active ? color : "text-slate-900")}>
        {count}
      </div>
      <div className={cn("text-xs sm:text-sm font-bold", active ? color : "text-slate-600")}>
        {label}
      </div>
    </button>
  );
}

// ─── Job Details Modal ─────────────────────────────────────────────────────────

function JobDetailsModal({
  job, isOpen, onClose, freelanceData,
}: {
  job: Job | null; isOpen: boolean; onClose: () => void;
  freelanceData?: { projectTitle?: string; projectDescription?: string; projectSkills?: string[] };
}) {
  if (!job && !freelanceData) return null;
  const employer = typeof job?.employer === "object" ? job.employer : null;
  const isFreelance = !!freelanceData;

  return (
    <Modal open={isOpen} onClose={onClose} size="lg">
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">
              {isFreelance ? freelanceData!.projectTitle : job?.title}
            </h3>
            <p className="text-xs sm:text-sm text-[#1e3a5f] mt-1 truncate">
              {isFreelance ? "Freelance Project" : (employer?.company || employer?.name || "—")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {isFreelance && (
          <>
            {freelanceData!.projectSkills && freelanceData!.projectSkills.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Required Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {freelanceData!.projectSkills.map((s, i) => (
                    <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">{s}</span>
                  ))}
                </div>
              </div>
            )}
            {freelanceData!.projectDescription && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Project Description</h4>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{freelanceData!.projectDescription}</p>
              </div>
            )}
          </>
        )}

        {!isFreelance && job && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                  <DollarSign size={14} /><span>Salary</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 break-words">
                  {job.salaryMin && job.salaryMax
                    ? `${formatCurrency(job.salaryMin)} - ${formatCurrency(job.salaryMax)}`
                    : formatCurrency(job.salary)}
                </p>
                {job.salaryType && <p className="text-xs text-gray-500 capitalize">{job.salaryType}</p>}
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                  <MapPin size={14} /><span>Location</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 break-words">{job.location}</p>
                {job.jobType && <p className="text-xs text-gray-500 capitalize">{job.jobType}</p>}
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                  <Briefcase size={14} /><span>Type</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 capitalize break-words">
                  {job.employmentType || "Not specified"}
                </p>
              </div>
            </div>
            {job.description && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{job.description}</p>
              </div>
            )}
            {job.skills && job.skills.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Required Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((s, i) => (
                    <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Proposal Row ─────────────────────────────────────────────────────────────

function ProposalRow({
  req, onRespond, responding, onViewDetails, updateCount, onAddUpdate, onViewUpdates,
}: {
  req: HireRequest;
  onRespond: (id: string, status: "accepted" | "rejected") => void;
  responding: string | null;
  onViewDetails: (req: HireRequest) => void;
  updateCount: number;
  onAddUpdate: (refId: string, title: string) => void;
  onViewUpdates: (refId: string, title: string) => void;
}) {
  const employer = typeof req.employer === "object" ? req.employer : null;
  const job      = typeof req.job      === "object" ? req.job      : null;
  const isFreelance = req.hireType === "freelance";
  const displayTitle = isFreelance ? (req.projectTitle || "Freelance Project") : (job?.title || "—");

  const statusLabel =
    req.status === "rejected" ? "Not Selected" :
    req.status.charAt(0).toUpperCase() + req.status.slice(1);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 hover:shadow-sm transition-all duration-200">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Avatar name={employer?.company || employer?.name || "Co"} size="md" />
          <div className="min-w-0">
            <h4 className="text-sm sm:text-base font-bold text-slate-900 truncate">{displayTitle}</h4>
            <p className="text-xs font-semibold text-[#1e3a5f] mt-0.5 truncate">
              {employer?.company || employer?.name || "—"}
              {isFreelance && <span className="ml-1 text-slate-400">· Freelance Project</span>}
            </p>
          </div>
        </div>
        <Badge variant={statusBadge(req.status)} className="flex-shrink-0 mt-0.5 font-bold">
          {statusLabel}
        </Badge>
      </div>

      {/* Meta */}
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
        <span>Offer: <span className="text-slate-900 font-bold">{formatCurrency(req.salary)}/mo</span></span>
        <span className="text-slate-300 hidden sm:inline">·</span>
        <span>Received: <span className="text-slate-700 font-semibold">{formatRelativeTime(req.createdAt)}</span></span>
        {req.message && (
          <>
            <span className="text-slate-300 hidden sm:inline">·</span>
            <span className="truncate max-w-[200px] italic text-slate-500">&ldquo;{req.message}&rdquo;</span>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 pt-2 border-t border-slate-100 flex items-center gap-2 flex-wrap">
        {req.status === "pending" && (
          <>
            <button
              onClick={() => onRespond(req._id, "accepted")}
              disabled={responding === req._id}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#111c2c] text-white hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
            >
              <span>{responding === req._id ? "Accepting..." : "Accept"}</span>
            </button>
            <button
              onClick={() => onRespond(req._id, "rejected")}
              disabled={responding === req._id}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 transition-all cursor-pointer"
            >
              <span>{responding === req._id ? "Declining..." : "Decline"}</span>
            </button>
          </>
        )}

        <button
          onClick={() => onViewDetails(req)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
        >
          <span>View Details</span>
        </button>

        {!isFreelance && job && (
          <Link href={`/jobs/${job._id}`}>
            <button className="flex items-center justify-center p-1.5 rounded-xl text-[#1e3a5f] hover:bg-[#edf2f7] border border-slate-200/60 transition-all cursor-pointer">
              <ExternalLink size={14} />
            </button>
          </Link>
        )}

        {/* Progress buttons — accepted only */}
        {req.status === "accepted" && (
          <>
            <button
              onClick={() => onAddUpdate(req._id, displayTitle)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#edf2f7] text-[#1e3a5f] hover:bg-[#e2e8f0] transition-all cursor-pointer"
            >
              <Plus size={13} />
              <span>Add Update</span>
            </button>

            {updateCount > 0 && (
              <button
                onClick={() => onViewUpdates(req._id, displayTitle)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
              >
                <ClipboardList size={13} />
                <span>Updates ({updateCount})</span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ tab }: { tab: TabId }) {
  const messages: Record<TabId, string> = {
    pending:   "No pending proposals from employers.",
    accepted:  "No accepted proposals yet.",
    rejected:  "No declined proposals.",
    withdrawn: "No withdrawn proposals.",
  };
  return (
    <div className="text-center py-16">
      <div className="w-14 h-14 bg-[#edf2f7] rounded-full flex items-center justify-center mx-auto mb-3">
        <FileText size={22} className="text-blue-300" />
      </div>
      <p className="text-sm font-medium text-gray-600 mb-1">{messages[tab]}</p>
      <p className="text-xs text-gray-400">Employers can invite you to jobs — proposals will appear here.</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProposalsPage() {
  const { data: session, status } = useSession();
  const { success, error } = useToast();

  const [requests, setRequests]         = useState<HireRequest[]>([]);
  const [loading, setLoading]           = useState(true);
  const [activeTab, setActiveTab]       = useState<TabId>("pending");
  const [responding, setResponding]     = useState<string | null>(null);
  const [selectedJob, setSelectedJob]   = useState<Job | null>(null);
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [loadingJob, setLoadingJob]     = useState(false);
  const [freelanceData, setFreelanceData] = useState<{
    projectTitle?: string; projectDescription?: string; projectSkills?: string[];
  } | null>(null);
  const [updateCounts, setUpdateCounts] = useState<Record<string, number>>({});

  // Progress modal/drawer state
  const [updateTarget, setUpdateTarget] = useState<{ refId: string; title: string } | null>(null);
  const [drawerTarget, setDrawerTarget] = useState<{ refId: string; title: string } | null>(null);

  const fetchRequests = useCallback(async () => {
    if (!session?.user.accessToken) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = (await hireRequestsApi.getMy(session.user.accessToken)) as { data: HireRequest[] };
      const data = res.data || [];
      setRequests(data);

      // Batch-fetch update counts for accepted hire requests
      const accepted = data.filter((r) => r.status === "accepted");
      const countMap: Record<string, number> = {};
      await Promise.allSettled(
        accepted.map(async (r) => {
          try {
            const res2 = (await workUpdatesApi.getByRef(
              session.user.accessToken!,
              "hireRequest",
              r._id
            )) as { data: WorkUpdate[] };
            countMap[r._id] = res2.data?.length ?? 0;
          } catch {
            countMap[r._id] = 0;
          }
        })
      );
      setUpdateCounts(countMap);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (status === "loading") return;
    fetchRequests();
  }, [fetchRequests, status]);

  const handleRespond = async (id: string, newStatus: "accepted" | "rejected") => {
    if (!session?.user.accessToken) return;
    setResponding(id);
    try {
      await hireRequestsApi.updateStatus(session.user.accessToken, id, newStatus);
      success(`Proposal ${newStatus}`);
      fetchRequests();
    } catch {
      error("Failed to update proposal");
    } finally {
      setResponding(null);
    }
  };

  const handleViewDetails = async (req: HireRequest) => {
    if (!session?.user.accessToken) return;
    if (req.hireType === "freelance") {
      setFreelanceData({
        projectTitle: req.projectTitle,
        projectDescription: req.projectDescription,
        projectSkills: req.projectSkills,
      });
      setSelectedJob(null);
      setJobModalOpen(true);
    } else if (req.job) {
      const jobId = typeof req.job === "object" ? req.job._id : req.job;
      setLoadingJob(true);
      try {
        const res = await jobsApi.getJobById(jobId) as { data: Job };
        setSelectedJob(res.data);
        setFreelanceData(null);
        setJobModalOpen(true);
      } catch {
        error("Failed to load job details");
      } finally {
        setLoadingJob(false);
      }
    }
  };

  const handlePosted = (refId: string) => {
    setUpdateCounts((prev) => ({ ...prev, [refId]: (prev[refId] ?? 0) + 1 }));
  };

  const counts: Record<TabId, number> = {
    pending:   requests.filter((r) => r.status === "pending").length,
    accepted:  requests.filter((r) => r.status === "accepted").length,
    rejected:  requests.filter((r) => r.status === "rejected").length,
    withdrawn: 0,
  };

  const statCards: { id: TabId; label: string; color: string; bg: string }[] = [
    { id: "pending",   label: "Pending",      color: "text-amber-600", bg: "bg-amber-50/70"  },
    { id: "accepted",  label: "Accepted",     color: "text-[#1e3a5f]", bg: "bg-slate-100/70" },
    { id: "rejected",  label: "Not Selected", color: "text-[#111c2c]",  bg: "bg-blue-50/50"   },
    { id: "withdrawn", label: "Withdrawn",    color: "text-slate-500", bg: "bg-slate-100/50" },
  ];

  const filtered: HireRequest[] =
    activeTab === "withdrawn"
      ? []
      : requests.filter((r) => r.status === (activeTab as HireRequestStatus));

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Proposals</h2>
          <p className="text-sm text-gray-400 mt-0.5">Hire invitations sent to you by employers</p>
        </div>
        <Link href="/jobs">
          <Button variant="outline" size="sm" className="self-start sm:self-auto">
            Browse Employers
          </Button>
        </Link>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((card) => (
          <StatCounter
            key={card.id}
            count={counts[card.id]}
            label={card.label}
            active={activeTab === card.id}
            color={card.color}
            bg={card.bg}
            onClick={() => setActiveTab(activeTab === card.id ? "pending" : card.id)}
          />
        ))}
      </div>

      {/* ── Tab row + content ── */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-4 sm:px-5 border-b border-gray-100 flex items-center gap-0.5 overflow-x-auto no-scrollbar scrollbar-none flex-nowrap" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-3 text-xs font-bold border-b-2 transition-all -mb-px whitespace-nowrap flex-shrink-0 cursor-pointer",
                activeTab === tab.id
                  ? "border-[#1e3a5f] text-[#1e3a5f]"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-xs font-bold",
                  activeTab === tab.id ? "bg-[#edf2f7] text-[#1e3a5f]" : "bg-slate-100 text-slate-500"
                )}
              >
                {counts[tab.id]}
              </span>
            </button>
          ))}
        </div>

        <div className="p-5 space-y-3">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState tab={activeTab} />
          ) : (
            filtered.map((req) => (
              <ProposalRow
                key={req._id}
                req={req}
                onRespond={handleRespond}
                responding={responding}
                onViewDetails={handleViewDetails}
                updateCount={updateCounts[req._id] ?? 0}
                onAddUpdate={(refId, title) => setUpdateTarget({ refId, title })}
                onViewUpdates={(refId, title) => setDrawerTarget({ refId, title })}
              />
            ))
          )}
        </div>
      </div>

      {/* Job Details Modal */}
      <JobDetailsModal
        job={selectedJob}
        isOpen={jobModalOpen}
        onClose={() => setJobModalOpen(false)}
        freelanceData={freelanceData ?? undefined}
      />

      {/* ── Add Update Modal ── */}
      <AddUpdateModal
        open={!!updateTarget}
        onClose={() => setUpdateTarget(null)}
        refType="hireRequest"
        refId={updateTarget?.refId ?? ""}
        title={updateTarget?.title ?? ""}
        onPosted={() => {
          if (updateTarget) handlePosted(updateTarget.refId);
          setUpdateTarget(null);
        }}
      />

      {/* ── Updates Drawer ── */}
      <WorkUpdatesDrawer
        open={!!drawerTarget}
        onClose={() => setDrawerTarget(null)}
        refType="hireRequest"
        refId={drawerTarget?.refId ?? ""}
        title={drawerTarget?.title ?? ""}
        role="jobseeker"
      />
    </div>
  );
}
