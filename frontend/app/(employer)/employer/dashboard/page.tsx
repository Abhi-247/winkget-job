"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { EmployerStatsCards } from "@/components/employer/EmployerStatsCards";
import { RecentJobPosts } from "@/components/employer/RecentJobPosts";
import { EscrowSummary } from "@/components/employer/EscrowSummary";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { jobsApi } from "@/lib/api";
import { Job, EmployerStats } from "@/types";
import { getGreeting } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";

export default function EmployerDashboard() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);

  const fetchData = useCallback(async () => {
    if (!session?.user.accessToken) return;
    setLoading(true);
    try {
      const res = (await jobsApi.getMyJobs(session.user.accessToken)) as {
        data: Job[];
      };
      setJobs(res.data || []);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stats: EmployerStats = {
    totalPosted: jobs.length,
    totalReceived: jobs.reduce((sum, j) => sum + j.applicantCount, 0),
    acceptedApplicants: 0,
    activeContracts: jobs.filter((j) => j.status === "open").length,
  };

  const greeting = getGreeting();
  const firstName = session?.user.name?.split(" ")[0] || "there";

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {greeting}, {firstName}! 👋
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage your job postings and applicants
          </p>
        </div>
        <Link href="/employer/post-job" className="flex-shrink-0">
          <Button size="sm" className="gap-1.5">
            <Plus size={14} />
            Post a Job
          </Button>
        </Link>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <EmployerStatsCards stats={stats} />
      )}

      {/* Content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent job posts */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Job Posts</h3>
            <Link
              href="/employer/my-jobs"
              className="text-xs text-[#1e3a5f] hover:underline"
            >
              View all
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <RecentJobPosts jobs={jobs} />
          )}
        </div>

        {/* Escrow */}
        <div>
          <EscrowSummary />
        </div>
      </div>
    </div>
  );
}
