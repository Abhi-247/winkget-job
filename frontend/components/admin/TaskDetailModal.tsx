"use client";

import { Task } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import {
  MapPin, Calendar, Briefcase, Users, Clock,
  ClipboardList, DollarSign, Tag, AlignLeft, CheckSquare,
} from "lucide-react";

const taskTypeLabels: Record<string, string> = {
  "quick-fix":       "Quick Fix",
  "data-entry":      "Data Entry",
  "content-writing": "Content Writing",
  design:            "Design",
  testing:           "Testing",
  research:          "Research",
  other:             "Other",
};

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
}

function InfoChip({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start gap-2.5 p-3 bg-gray-50 rounded-lg border border-gray-100", className)}>
      <Icon size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-gray-800 truncate">{value}</p>
      </div>
    </div>
  );
}

export function TaskDetailModal({ task, onClose }: TaskDetailModalProps) {
  if (!task) return null;

  const employer = typeof task.employer === "object" ? task.employer : null;

  return (
    <Modal open={!!task} onClose={onClose} size="lg">
      <div className="space-y-5 -mt-1">

        {/* ── Hero ── */}
        <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
          <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center flex-shrink-0">
            <ClipboardList size={20} className="text-purple-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-lg font-bold text-gray-900 leading-snug">{task.title}</h2>
              <Badge variant={statusBadge(task.status)} className="capitalize">{task.status}</Badge>
            </div>
            {employer && (
              <div className="flex items-center gap-1.5 text-sm text-[#1e3a5f] font-semibold">
                <Avatar name={employer.company || employer.name} size="xs" />
                {employer.company || employer.name}
              </div>
            )}
            <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-400">
              {task.location && (
                <span className="flex items-center gap-1"><MapPin size={11} />{task.location}</span>
              )}
              <span className="flex items-center gap-1">
                <Calendar size={11} /> Posted {formatDate(task.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <Users size={11} /> {task.claimCount}/{task.maxClaims} claims
              </span>
            </div>
          </div>
        </div>

        {/* ── Key details grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <InfoChip icon={DollarSign} label="Budget"    value={formatCurrency(task.budget)} />
          <InfoChip icon={Tag}        label="Type"      value={taskTypeLabels[task.taskType] ?? task.taskType} />
          <InfoChip icon={Briefcase}  label="Category"  value={task.category} />
          {task.startDate && (
            <InfoChip icon={Calendar} label="Start Date" value={formatDate(task.startDate)} />
          )}
          {task.endDate && (
            <InfoChip icon={Clock}    label="Deadline"  value={formatDate(task.endDate)} />
          )}
          {task.durationType === "hours" && task.durationHours && (
            <InfoChip icon={Clock}    label="Duration"  value={`${task.durationHours} hours`} />
          )}
          {task.maxClaims && (
            <InfoChip icon={Users}    label="Max Claims" value={String(task.maxClaims)} />
          )}
          {task.companyName && (
            <InfoChip icon={Briefcase} label="Company"  value={task.companyName} />
          )}
        </div>

        {/* ── Skills ── */}
        {task.skills && task.skills.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Required Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {task.skills.map((s) => (
                <span
                  key={s}
                  className="px-2.5 py-0.5 rounded-full bg-[#edf2f7] text-[#1e3a5f] text-xs border border-[#1e3a5f]/20 font-medium"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Description ── */}
        {task.description && (
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <AlignLeft size={11} /> Description
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{task.description}</p>
          </div>
        )}

        {/* ── Deliverables ── */}
        {task.deliverables && (
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <CheckSquare size={11} /> Deliverables
            </h3>
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{task.deliverables}</p>
            </div>
          </div>
        )}

        {/* ── Company address ── */}
        {task.companyAddress && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <MapPin size={14} className="text-blue-400 flex-shrink-0" />
            <p className="text-sm text-blue-700">{task.companyAddress}</p>
          </div>
        )}

      </div>
    </Modal>
  );
}
