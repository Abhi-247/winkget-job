"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { workUpdatesApi, applicationsApi, tasksApi, jobsApi } from "@/lib/api";
import { WorkUpdate, Application, TaskClaim } from "@/types";
import { WorkUpdatesDrawer } from "@/components/work/WorkUpdatesDrawer";
import { formatCurrency } from "@/lib/utils";
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ClipboardList,
  Briefcase,
  User,
} from "lucide-react";
import Link from "next/link";

interface ActiveProgressWidgetProps {
  role: "jobseeker" | "employer";
}

interface ActiveItem {
  id: string;
  refType: "application" | "taskClaim" | "hireRequest";
  title: string;
  subtitle: string;
  update?: WorkUpdate | null;
}

export function ActiveProgressWidget({ role }: ActiveProgressWidgetProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [activeItems, setActiveItems] = useState<ActiveItem[]>([]);
  const [selectedDrawerTarget, setSelectedDrawerTarget] = useState<{
    refType: "application" | "taskClaim" | "hireRequest";
    refId: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    if (!session?.user.accessToken) {
      setLoading(false);
      return;
    }

    const fetchActiveProgress = async () => {
      setLoading(true);
      try {
        if (role === "jobseeker") {
          // Fetch jobseeker accepted applications and claims
          const [appsRes, claimsRes] = await Promise.all([
            applicationsApi.getMyApplications(session.user.accessToken).catch(() => ({ data: [] })),
            tasksApi.getMyClaims(session.user.accessToken).catch(() => ({ data: [] })),
          ]);

          const acceptedApps = ((appsRes as any).data || []).filter(
            (a: Application) => a.status === "accepted"
          );
          const approvedClaims = ((claimsRes as any).data || []).filter(
            (c: TaskClaim) => c.status === "approved"
          );

          const items: ActiveItem[] = [];

          // Fetch work updates for up to 3 items
          for (const app of acceptedApps.slice(0, 2)) {
            const job = typeof app.job === "object" ? app.job : null;
            const employer = job && typeof job.employer === "object" ? job.employer : null;
            let update: WorkUpdate | null = null;
            try {
              const res = (await workUpdatesApi.getByRef(
                session.user.accessToken,
                "application",
                app._id
              )) as { data: WorkUpdate[] };
              update = res.data?.find((u) => u.steps && u.steps.length > 0) || res.data?.[0] || null;
            } catch {
              /* ignore */
            }

            items.push({
              id: app._id,
              refType: "application",
              title: job?.title || "Active Job",
              subtitle: employer?.company || employer?.name || "Client Project",
              update,
            });
          }

          for (const claim of approvedClaims.slice(0, 2)) {
            const task = typeof claim.task === "object" ? claim.task : null;
            let update: WorkUpdate | null = null;
            try {
              const res = (await workUpdatesApi.getByRef(
                session.user.accessToken,
                "taskClaim",
                claim._id
              )) as { data: WorkUpdate[] };
              update = res.data?.find((u) => u.steps && u.steps.length > 0) || res.data?.[0] || null;
            } catch {
              /* ignore */
            }

            items.push({
              id: claim._id,
              refType: "taskClaim",
              title: task?.title || "Active Task",
              subtitle: "Task Claim Assignment",
              update,
            });
          }

          setActiveItems(items);
        } else {
          // Employer view: fetch employer jobs and accepted applications
          const myJobsRes = (await jobsApi.getMyJobs(session.user.accessToken).catch(() => ({ data: [] }))) as any;
          const myJobs = myJobsRes.data || [];

          const items: ActiveItem[] = [];

          for (const job of myJobs.slice(0, 3)) {
            try {
              const appsRes = (await applicationsApi.getJobApplications(
                session.user.accessToken,
                job._id
              )) as any;
              const acceptedApps = (appsRes.data || []).filter((a: Application) => a.status === "accepted");

              for (const app of acceptedApps) {
                const applicant = typeof app.applicant === "object" ? app.applicant : null;
                let update: WorkUpdate | null = null;
                try {
                  const res = (await workUpdatesApi.getByRef(
                    session.user.accessToken,
                    "application",
                    app._id
                  )) as { data: WorkUpdate[] };
                  update = res.data?.find((u) => u.steps && u.steps.length > 0) || res.data?.[0] || null;
                } catch {
                  /* ignore */
                }

                items.push({
                  id: app._id,
                  refType: "application",
                  title: job.title || "Contract Assignment",
                  subtitle: applicant?.name ? `Freelancer: ${applicant.name}` : "Assigned Freelancer",
                  update,
                });
              }
            } catch {
              /* ignore */
            }
          }

          setActiveItems(items);
        }
      } catch {
        setActiveItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveProgress();
  }, [session, role]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs animate-pulse">
        <div className="h-5 bg-slate-200 rounded w-1/3 mb-4" />
        <div className="h-20 bg-slate-100 rounded-xl" />
      </div>
    );
  }

  if (activeItems.length === 0) {
    return null; // Don't block dashboard if no active contracts
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs font-[family-name:var(--font-poppins)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp size={18} className="text-[#1e3a5f]" /> Ongoing Project Execution Progress
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live milestones and percentage completion for active assignments
            </p>
          </div>

          <Link
            href={role === "jobseeker" ? "/jobseeker/my-jobs" : "/employer/applications"}
            className="text-xs font-semibold text-[#1e3a5f] hover:underline flex items-center gap-1"
          >
            Manage All <ArrowRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeItems.map((item) => {
            const steps = item.update?.steps || [];
            const overallProgress = item.update?.overallProgress || 0;
            const completedCount = steps.filter((s) => s.completed).length;
            const totalDays = item.update?.totalDays || steps.reduce((acc, s) => acc + (s.estimatedDays || 1), 0);
            const nextStep = steps.find((s) => !s.completed);

            return (
              <div
                key={item.id}
                className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-blue-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h4 className="text-sm font-bold text-slate-900 truncate flex-1">{item.title}</h4>
                    <span className="text-xs font-extrabold text-[#1e3a5f] bg-blue-100/70 px-2.5 py-0.5 rounded-full flex-shrink-0">
                      {overallProgress}%
                    </span>
                  </div>

                  <p className="text-xs font-medium text-slate-500 mb-3 truncate">{item.subtitle}</p>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200/80 rounded-full h-2.5 mb-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#1e3a5f] via-blue-600 to-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, overallProgress))}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock size={11} className="text-slate-400" /> Total Duration: {totalDays} days
                    </span>
                    {steps.length > 0 && (
                      <span className="flex items-center gap-1 text-slate-700 font-semibold">
                        <CheckCircle2 size={11} className="text-emerald-500" /> {completedCount} / {steps.length} steps
                      </span>
                    )}
                  </div>
                </div>

                {/* Next Step Pill or Action */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 text-xs">
                  {nextStep ? (
                    <span className="text-[11px] text-slate-600 truncate flex-1 pr-2 font-medium">
                      Next: <strong className="text-slate-800">{nextStep.title}</strong>
                    </span>
                  ) : steps.length > 0 ? (
                    <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 size={12} /> All Milestones Completed!
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">No execution plan set</span>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedDrawerTarget({
                        refType: item.refType,
                        refId: item.id,
                        title: item.title,
                      })
                    }
                    className="py-1.5 px-3 rounded-xl bg-[#1e3a5f] hover:bg-[#152a45] text-white font-bold text-[11px] flex items-center gap-1 transition-all border-0 cursor-pointer shadow-2xs flex-shrink-0"
                  >
                    <ClipboardList size={12} className="text-amber-300" />
                    <span>View Plan</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Work Updates Drawer */}
      {selectedDrawerTarget && (
        <WorkUpdatesDrawer
          open={!!selectedDrawerTarget}
          onClose={() => setSelectedDrawerTarget(null)}
          refType={selectedDrawerTarget.refType}
          refId={selectedDrawerTarget.refId}
          title={selectedDrawerTarget.title}
          role={role}
        />
      )}
    </>
  );
}
