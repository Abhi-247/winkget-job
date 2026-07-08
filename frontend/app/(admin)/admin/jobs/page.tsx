"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { adminApi } from "@/lib/api";
import { Job } from "@/types";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TableRowSkeleton } from "@/components/ui/Skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

export default function AdminJobsPage() {
  const { data: session } = useSession();
  const { success, error } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    if (!session?.user.accessToken) return;
    setLoading(true);
    try {
      const res = (await adminApi.getAllJobs(session.user.accessToken)) as { data: Job[] };
      setJobs(res.data || []);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleStatusUpdate = async (id: string, status: string) => {
    if (!session?.user.accessToken) return;
    setUpdating(id);
    try {
      await adminApi.updateJobStatus(session.user.accessToken, id, status);
      success(`Job ${status}`);
      fetchJobs();
    } catch {
      error("Failed to update job");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Job Moderation</h2>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Job</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Employer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Salary</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Posted</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />)
                : jobs.map((job) => {
                    const employer = typeof job.employer === "object" ? job.employer : null;
                    return (
                      <tr key={job._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-3">
                          <p className="font-medium text-gray-900">{job.title}</p>
                          <p className="text-xs text-gray-400">{job.category}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{employer?.company || employer?.name || "—"}</td>
                        <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{formatCurrency(job.salary)}</td>
                        <td className="px-4 py-3">
                          <Badge variant={statusBadge(job.status)}>{job.status.charAt(0).toUpperCase() + job.status.slice(1)}</Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs hidden sm:table-cell">{formatDate(job.createdAt)}</td>
                        <td className="px-4 py-3 text-right">
                          {job.status === "open" ? (
                            <Button size="sm" variant="danger" onClick={() => handleStatusUpdate(job._id, "closed")} loading={updating === job._id}>Close</Button>
                          ) : (
                            <Button size="sm" variant="secondary" onClick={() => handleStatusUpdate(job._id, "open")} loading={updating === job._id}>Activate</Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
          {!loading && jobs.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">No jobs found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
