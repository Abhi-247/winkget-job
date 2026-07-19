"use client";

import { use, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { tasksApi } from "@/lib/api";
import { Task, TaskClaim, User } from "@/types";
import { PageSpinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { ClaimTaskModal } from "@/components/jobseeker/ClaimTaskModal";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, formatRelativeTime, formatDate } from "@/lib/utils";
import {
  MapPin,
  Star,
  ChevronRight,
  Briefcase,
  Clock,
  Users,
  Calendar,
  Building2,
  CheckCircle2,
  Share2,
  Copy,
  ExternalLink,
  ClipboardList,
  DollarSign,
  Timer,
  Hash,
  MessageCircle,
  Link2,
  Tag,
} from "lucide-react";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export default function TaskDetailPage({ params }: Props) {
  const { id } = use(params);
  const { data: session } = useSession();
  const { success } = useToast();

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);

  useEffect(() => {
    setLoading(true);
    tasksApi.getTaskById(id)
      .then((res) => {
        setTask((res as { data: Task }).data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setTask(null);
        setLoading(false);
      });
  }, [id]);

  // Check if current user has already claimed this task
  useEffect(() => {
    if (!session?.user.accessToken || session.user.role !== "jobseeker") return;
    tasksApi.getMyClaims(session.user.accessToken)
      .then((res) => {
        const claims = (res as { data: TaskClaim[] }).data || [];
        setHasClaimed(claims.some(c => {
          const taskObj = typeof c.task === "object" ? c.task : null;
          return taskObj?._id === id;
        }));
      })
      .catch(() => {});
  }, [id, session]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    success("Link copied!");
  };

  if (loading) return <PageSpinner />;
  if (!task) {
    return (
      <div className="py-16 text-center">
        <p className="text-gray-400">Task not found.</p>
        <Link href="/tasks" className="text-[#1e3a5f] hover:underline text-sm mt-2 inline-block">
          Browse all tasks
        </Link>
      </div>
    );
  }

  const employer = typeof task.employer === "object" ? task.employer : null;
  const companyName = task.companyName || employer?.company || employer?.name || "Client";
  const location = task.location || "Remote";
  const role = session?.user?.role;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-xs text-gray-500">
            <Link href="/" className="hover:text-gray-700">Home</Link>
            <ChevronRight size={12} />
            <Link href="/tasks" className="hover:text-gray-700">Find Tasks</Link>
            <ChevronRight size={12} />
            <span className="text-gray-900 font-medium truncate max-w-[200px]">{task.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
          
          {/* Main content */}
          <div className="space-y-5 min-w-0">
            
            {/* Header Card */}
            <div className="relative bg-white rounded-xl border border-gray-200 p-5 sm:p-6 overflow-hidden">
              {/* TASK corner tag */}
              <span className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg tracking-wider">
                TASK
              </span>
              <div className="flex items-start gap-4 mb-4">
                <Avatar name={companyName} src={employer?.avatar} size="xl" className="flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight mb-1">
                    {task.title}
                  </h1>
                  <p className="text-sm text-gray-500 mb-3">
                    {companyName}
                    <span className="inline-flex items-center gap-1 ml-2">
                      <MapPin size={12} />
                      {location}
                    </span>
                  </p>
                  
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-orange-100 text-orange-700 text-xs font-semibold uppercase">
                      {task.taskType}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-[#1e3a5f] text-xs font-semibold">
                      {formatCurrency(task.budget)} Fixed Price
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-gray-950 text-white text-xs font-semibold capitalize">
                      {task.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mobile Actions */}
              <div className="lg:hidden flex flex-col gap-3 mb-4 pt-4 border-t border-gray-100">
                {role === "employer" ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 w-full">
                    <p className="text-xs text-amber-800 font-medium mb-1">
                      Employer accounts cannot claim tasks.
                    </p>
                  </div>
                ) : !session ? (
                  <Link href={`/sign-in?callbackUrl=/tasks/${id}`} className="w-full">
                    <Button className="w-full">Sign in to Claim Task</Button>
                  </Link>
                ) : hasClaimed ? (
                  <div className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-green-50 border border-green-200 text-green-700 font-medium text-sm">
                    <CheckCircle2 size={16} />
                    Claim Proposal Submitted
                  </div>
                ) : (
                  <Button className="w-full bg-[#1e3a5f] hover:bg-[#152a45]" onClick={() => setClaimModalOpen(true)}>
                    <ClipboardList size={15} className="mr-2" />
                    Claim / Apply for Task
                  </Button>
                )}
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-0.5">Budget</p>
                  <p className="text-sm font-bold text-gray-900">{formatCurrency(task.budget)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-0.5">Max Freelancers</p>
                  <p className="text-sm font-semibold text-gray-900">{task.maxClaims}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-0.5">Claims Count</p>
                  <p className="text-sm font-bold text-gray-900">{task.claimCount}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-0.5">Posted</p>
                  <p className="text-sm font-semibold text-gray-900">{formatRelativeTime(task.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Task Description */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Task Instructions & Description</h2>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{task.description}</p>
            </div>

            {/* Deliverables */}
            {task.deliverables && (
              <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Expected Deliverables</h2>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{task.deliverables}</p>
              </div>
            )}

            {/* Required Skills */}
            {task.skills && task.skills.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {task.skills.map(skill => (
                    <span key={skill}
                      className="px-3 py-1 rounded-full bg-[#edf2f7] text-[#152a45] text-sm font-medium border border-[#1e3a5f]/20">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Task Posting Details */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Task Posting Details</h2>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                {[
                  { icon: ClipboardList, label: "Task Title",    value: task.title },
                  { icon: Tag,           label: "Task Type",     value: task.taskType ? task.taskType.charAt(0).toUpperCase() + task.taskType.slice(1).replace(/-/g, " ") : undefined },
                  { icon: Building2,     label: "Category",      value: task.category },
                  { icon: MapPin,        label: "Location",      value: location },
                  { icon: DollarSign,    label: "Fixed Budget",  value: formatCurrency(task.budget) },
                  { icon: Users,         label: "Max Claimants", value: String(task.maxClaims) },
                  { icon: Users,         label: "Claims So Far", value: String(task.claimCount) },
                  { icon: Calendar,      label: "Start Date",    value: task.startDate ? formatDate(task.startDate) : undefined },
                  { icon: Calendar,      label: "End Date",      value: task.endDate ? formatDate(task.endDate) : (task.deadline ? formatDate(task.deadline) : undefined) },
                  { icon: Hash,          label: "Status",        value: task.status ? task.status.charAt(0).toUpperCase() + task.status.slice(1) : undefined },
                  { icon: Building2,     label: "Company",       value: task.companyName },
                  { icon: MapPin,        label: "Company Address", value: task.companyAddress },
                  { icon: Timer,         label: "Posted",        value: formatDate(task.createdAt) },
                ].filter(f => f.value).map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex justify-between items-start py-2.5 border-b border-gray-100 gap-4">
                    <dt className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide pt-0.5">
                      <Icon size={13} className="text-[#1e3a5f] flex-shrink-0" />
                      {label}
                    </dt>
                    <dd className="text-sm font-semibold text-gray-800 text-right break-words max-w-[60%]">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-6 lg:w-[360px] flex-shrink-0 w-full">
            
            {/* Apply Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="mb-4">
                <p className="text-2xl font-bold text-gray-900 leading-tight">
                  {formatCurrency(task.budget)}
                  <span className="text-sm font-normal text-gray-400 ml-1">Fixed Budget</span>
                </p>
                {(task.startDate || task.endDate || task.deadline) && (
                  <p className="text-xs text-amber-700 mt-1 flex items-center gap-1 font-semibold">
                    <Calendar size={13} />
                    {task.startDate ? formatDate(task.startDate) : "—"}
                    {" → "}
                    {task.endDate ? formatDate(task.endDate) : task.deadline ? formatDate(task.deadline) : "—"}
                  </p>
                )}
              </div>

              {role === "employer" ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                  <p className="text-xs text-amber-800 font-medium mb-1">
                    Employer accounts cannot claim tasks.
                  </p>
                </div>
              ) : !session ? (
                <Link href={`/sign-in?callbackUrl=/tasks/${id}`} className="w-full">
                  <Button className="w-full mb-3">Sign in to Claim Task</Button>
                </Link>
              ) : hasClaimed ? (
                <div className="flex items-center justify-center gap-2 w-full mb-3 px-4 py-2.5 rounded-lg bg-green-50 border border-green-200 text-green-700 font-medium text-sm">
                  <CheckCircle2 size={16} />
                  Claim Proposal Submitted
                </div>
              ) : (
                <Button className="w-full mb-3 bg-[#1e3a5f] hover:bg-[#152a45]" onClick={() => setClaimModalOpen(true)}>
                  <ClipboardList size={15} className="mr-2" />
                  Claim / Apply for Task
                </Button>
              )}

              <hr className="border-gray-100 my-4" />

              <ul className="space-y-3 text-sm">
                <li className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-gray-500">
                    <MapPin size={14} className="text-gray-400" />
                    Location
                  </span>
                  <span className="text-gray-800 font-medium text-right truncate max-w-[160px]">{location}</span>
                </li>
                <li className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-gray-500">
                    <ClipboardList size={14} className="text-gray-400" />
                    Category
                  </span>
                  <span className="text-gray-800 font-medium text-right truncate max-w-[160px]">{task.category}</span>
                </li>
                <li className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-gray-500">
                    <Users size={14} className="text-gray-400" />
                    Max Spots
                  </span>
                  <span className="text-gray-800 font-medium">{task.maxClaims} Freelancers</span>
                </li>
                <li className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-gray-500">
                    <Users size={14} className="text-gray-400" />
                    Claims Count
                  </span>
                  <span className="text-gray-800 font-medium">{task.claimCount} claimed</span>
                </li>
              </ul>
            </div>

            {/* About Client */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">About Client</h3>
              <div className="flex items-start gap-3 mb-4">
                <Avatar name={companyName} src={employer?.avatar} size="md" className="flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{companyName}</p>
                  <span className="flex items-center gap-0.5 mt-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={11} className="text-yellow-400 fill-yellow-400" />
                    ))}
                  </span>
                </div>
              </div>
              {employer?.bio && (
                <p className="text-sm text-gray-500 line-clamp-3 mb-4">{employer.bio}</p>
              )}
            </div>

            {/* Share */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
                <Share2 size={14} className="text-[#1e3a5f]" />
                Share This Task
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Check out this task: ${task.title} — ${typeof window !== "undefined" ? window.location.href : ""}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs border-[#1e3a5f]/30 text-[#1e3a5f] hover:bg-[#edf2f7]">
                    <MessageCircle size={13} className="text-[#1e3a5f]" />
                    WhatsApp
                  </Button>
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs border-[#1e3a5f]/30 text-[#1e3a5f] hover:bg-[#edf2f7]">
                    <Share2 size={13} className="text-[#1e3a5f]" />
                    LinkedIn
                  </Button>
                </a>
                <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs border-[#1e3a5f]/30 text-[#1e3a5f] hover:bg-[#edf2f7]" onClick={copyLink}>
                  <Copy size={13} className="text-[#1e3a5f]" />
                  Copy
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Claim Modal */}
      {task && (
        <ClaimTaskModal
          task={task}
          open={claimModalOpen}
          onClose={() => setClaimModalOpen(false)}
          onSuccess={() => {
            setClaimModalOpen(false);
            setHasClaimed(true);
          }}
        />
      )}
    </div>
  );
}
