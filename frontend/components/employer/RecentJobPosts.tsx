import Link from "next/link";
import { Job } from "@/types";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { formatCurrency, formatRelativeTime, salaryLabel } from "@/lib/utils";
import { Users } from "lucide-react";

interface RecentJobPostsProps {
  jobs: Job[];
}

export function RecentJobPosts({ jobs }: RecentJobPostsProps) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        No jobs posted yet.{" "}
        <Link href="/employer/post-job" className="text-[#1e3a5f] hover:underline">
          Post your first job
        </Link>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {jobs.slice(0, 5).map((job) => (
        <div key={job._id} className="flex items-center justify-between py-3 gap-4">
          <div className="flex-1 min-w-0">
            <Link
              href={`/employer/my-jobs/${job._id}`}
              className="text-sm font-medium text-gray-900 truncate hover:text-[#1e3a5f] transition-colors block"
            >
              {job.title}
            </Link>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-xs text-gray-400">
                {formatRelativeTime(job.createdAt)}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Users size={11} />
                {job.applicantCount} applicants
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-sm font-semibold text-gray-700 hidden sm:block">
              {formatCurrency(job.salary)}{salaryLabel(job.salaryType)}
            </span>
            <Badge variant={statusBadge(job.status)}>
              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
            </Badge>
          </div>
        </div>
      ))}
      {jobs.length > 5 && (
        <div className="pt-3">
          <Link
            href="/employer/my-jobs"
            className="text-sm text-[#1e3a5f] hover:underline"
          >
            View all {jobs.length} jobs →
          </Link>
        </div>
      )}
    </div>
  );
}
