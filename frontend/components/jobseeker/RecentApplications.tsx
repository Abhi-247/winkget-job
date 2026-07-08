import Link from "next/link";
import { Application } from "@/types";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { formatRelativeTime, formatCurrency } from "@/lib/utils";

interface RecentApplicationsProps {
  applications: Application[];
}

export function RecentApplications({ applications }: RecentApplicationsProps) {
  if (applications.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        No applications yet.{" "}
        <Link href="/jobs" className="text-[#1e3a5f] hover:underline">
          Browse jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {applications.slice(0, 5).map((app) => {
        const job = typeof app.job === "object" ? app.job : null;
        return (
          <div
            key={app._id}
            className="flex items-center justify-between py-3 gap-4"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {job?.title ?? "Job"}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {job
                  ? `${typeof job.employer === "object" ? job.employer.company || job.employer.name : ""} • ${formatRelativeTime(app.createdAt)}`
                  : formatRelativeTime(app.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {job && (
                <span className="text-sm font-semibold text-gray-700 hidden sm:block">
                  {formatCurrency(job.salary)}
                </span>
              )}
              <Badge variant={statusBadge(app.status)}>
                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
              </Badge>
            </div>
          </div>
        );
      })}
      {applications.length > 5 && (
        <div className="pt-3">
          <Link
            href="/jobseeker/applications"
            className="text-sm text-[#1e3a5f] hover:underline"
          >
            View all {applications.length} applications →
          </Link>
        </div>
      )}
    </div>
  );
}
