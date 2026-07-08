"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSavedJobs } from "@/lib/hooks";
import { Tag, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { JobCard } from "@/components/jobseeker/JobCard";
import { ApplyModal } from "@/components/jobseeker/ApplyModal";
import { jobsApi, applicationsApi } from "@/lib/api";
import { Job, Application } from "@/types";
import Link from "next/link";

export default function SavedJobsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { savedIds, toggleSave, isSaved, mounted } = useSavedJobs();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [applyJob, setApplyJob] = useState<Job | null>(null);

  // Fetch jobs
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = (await jobsApi.getJobs({})) as { data: Job[] };
      setJobs(res.data || []);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user's existing applications to mark "Applied" status
  const fetchApplied = useCallback(async () => {
    if (!session?.user.accessToken || session.user.role !== "jobseeker") return;
    try {
      const res = (await applicationsApi.getMyApplications(
        session.user.accessToken
      )) as { data: Application[] };
      const ids = new Set(
        (res.data || [])
          .map((a) => {
            const job = typeof a.job === "object" ? a.job : null;
            return job?._id ?? "";
          })
          .filter(Boolean)
      );
      setAppliedIds(ids);
    } catch {
      // non-critical — ignore
    }
  }, [session]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    fetchApplied();
  }, [fetchApplied]);

  // Filter jobs based on savedIds
  const savedJobs = useMemo(() => {
    if (!mounted) return [];
    return jobs.filter((job) => savedIds.includes(job._id));
  }, [jobs, savedIds, mounted]);

  const count = mounted ? savedJobs.length : 0;

  // Handle apply click
  const handleApply = (job: Job) => {
    if (!session) {
      router.push(`/sign-in?callbackUrl=/jobseeker/saved-jobs`);
      return;
    }
    if (session.user.role === "employer") return;
    setApplyJob(job);
  };

  // Called on successful application
  const handleApplySuccess = (jobId: string) => {
    setAppliedIds((prev) => new Set([...prev, jobId]));
    setApplyJob(null);
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Saved Jobs</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Jobs you bookmarked while browsing
          </p>
        </div>
        <Link href="/jobs">
          <Button size="sm" className="gap-1.5">
            Browse Jobs
          </Button>
        </Link>
      </div>

      {/* ── Stat card ── */}
      <div className="w-40">
        <div className="bg-[#edf2f7] rounded-xl p-5 border border-white">
          <div className="text-3xl font-bold text-[#1e3a5f] mb-1">
            {mounted ? count : "..."}
          </div>
          <div className="text-sm font-medium text-[#1e3a5f]">Saved Jobs</div>
        </div>
      </div>

      {/* ── Content area ── */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse"
            >
              <div className="flex gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2" />
              <div className="h-3 bg-gray-200 rounded w-4/5" />
            </div>
          ))}
        </div>
      ) : count === 0 ? (
        /* Empty state */
        <div className="bg-white rounded-xl border border-gray-200 p-16 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Tag size={28} className="text-red-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-800 mb-2">
            No saved jobs yet
          </h3>
          <p className="text-sm text-gray-400 max-w-xs mb-1">
            Save jobs while browsing
          </p>
          <p className="text-sm mb-6">
            <Link
              href="/jobs"
              className="text-[#1e3a5f] hover:underline font-medium"
            >
              to find them here later.
            </Link>
          </p>
          <Link href="/jobs">
            <Button className="px-8">Find Work</Button>
          </Link>
        </div>
      ) : (
        /* Saved jobs list */
        <div className="space-y-4">
          {savedJobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              applied={appliedIds.has(job._id)}
              saved={isSaved(job._id)}
              onApply={handleApply}
              onToggleSave={toggleSave}
              userRole={session?.user.role}
            />
          ))}
        </div>
      )}

      {/* Apply modal */}
      {applyJob && (
        <ApplyModal
          job={applyJob}
          open={!!applyJob}
          onClose={() => setApplyJob(null)}
          onSuccess={() => handleApplySuccess(applyJob._id)}
        />
      )}
    </div>
  );
}
