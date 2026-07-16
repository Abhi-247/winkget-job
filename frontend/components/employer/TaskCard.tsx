"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Task } from "@/types";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { Edit3, Users, MapPin, ClipboardList, RefreshCw, Calendar } from "lucide-react";

interface TaskCardProps {
  task: Task;
  onClose: (id: string) => void;
  onReopen: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskCard({ task, onClose, onReopen, onDelete }: TaskCardProps) {
  const router = useRouter();

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a")) {
      return;
    }
    router.push(`/employer/my-tasks/${task._id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-[#1e3a5f]/20 transition-all cursor-pointer"
    >
      {/* Title, status, claimant vacancy */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold text-gray-900">{task.title}</h3>
          <Badge variant={statusBadge(task.status)}>
            {task.status === "open" ? "Active" : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
          </Badge>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border border-purple-300 text-purple-700 bg-purple-50">
            Claims {task.claimCount}/{task.maxClaims}
          </span>
        </div>

        {/* Claims count */}
        <div className="flex-shrink-0 text-right">
          <p className="text-2xl font-bold text-gray-900 leading-none">
            {task.claimCount}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Claims</p>
        </div>
      </div>

      {/* Meta info */}
      <div className="flex flex-wrap items-center gap-2 mb-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <ClipboardList size={12} />
          <span className="capitalize">{task.taskType}</span>
        </span>
        {task.location && (
          <span className="flex items-center gap-1">
            <MapPin size={12} />
            {task.location}
          </span>
        )}
        <span className="font-semibold text-gray-700">
          ₹{formatCurrency(task.budget)} Fixed Price
        </span>
        {task.deadline && (
          <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-0.5 rounded font-medium">
            <Calendar size={12} />
            Ends {new Date(task.deadline).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Skills */}
      {task.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {task.skills.slice(0, 5).map((skill) => (
            <span
              key={skill}
              className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs border border-gray-200"
            >
              {skill}
            </span>
          ))}
          {task.skills.length > 5 && (
            <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-400 text-xs border border-gray-200">
              +{task.skills.length - 5} more
            </span>
          )}
        </div>
      )}

      {/* Posted Date + Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          Posted {formatRelativeTime(task.createdAt)}
        </p>

        <div className="flex flex-wrap items-center gap-2" onClick={stop}>
          <Link href={`/employer/my-tasks/${task._id}`} onClick={stop}>
            <Button size="sm" variant="outline" className="gap-1.5">
              <Users size={13} />
              Manage Claims ({task.claimCount})
            </Button>
          </Link>

          {task.status === "open" ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => { stop(e); onClose(task._id); }}
              className="text-yellow-700 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200"
            >
              Close Task
            </Button>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => { stop(e); onReopen(task._id); }}
              className="text-[#1e3a5f] bg-[#edf2f7] hover:bg-[#dce4ef] border border-[#1e3a5f]/20 gap-1"
            >
              <RefreshCw size={12} />
              Reopen
            </Button>
          )}

          <Link href={`/employer/post-task?edit=${task._id}`} onClick={stop}>
            <Button size="sm" variant="ghost" className="gap-1.5 text-gray-600">
              <Edit3 size={13} />
              Edit
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
