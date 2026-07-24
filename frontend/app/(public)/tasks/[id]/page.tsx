"use client";

import { use, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { tasksApi } from "@/lib/api";
import { Task, TaskClaim, User } from "@/types";
import { PageSpinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { ClaimTaskModal } from "@/components/jobseeker/ClaimTaskModal";
import { AutoScrollCarousel } from "@/components/ui/AutoScrollCarousel";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, formatRelativeTime, formatDate, getInitials } from "@/lib/utils";
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
  AlertCircle,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

function FeaturedTaskCard({ task }: { task: Task }) {
  const router = useRouter();
  const employer = typeof task.employer === "object" ? (task.employer as User) : null;
  const companyName = task.companyName || employer?.company || employer?.name || "winkget Client";
  const initials = getInitials(companyName);

  const avatarBgs = ["bg-amber-600", "bg-[#1e3a5f]", "bg-emerald-600", "bg-indigo-600", "bg-purple-600"];
  const avatarBg = avatarBgs[companyName.length % avatarBgs.length];

  return (
    <div
      onClick={() => router.push(`/tasks/${task._id}`)}
      className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-amber-200 transition-all duration-300 w-full flex-shrink-0 flex flex-col justify-between items-center text-center relative group cursor-pointer h-full"
    >
      <div className="w-full">
        {/* Top Avatar */}
        <div className="relative mb-3 mx-auto w-14 h-14">
          {employer?.avatar ? (
            <img
              src={employer.avatar}
              alt={companyName}
              className="w-14 h-14 rounded-2xl object-cover shadow-xs border-2 border-white"
            />
          ) : (
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-base shadow-xs border-2 border-white ${avatarBg}`}
            >
              {initials}
            </div>
          )}
          <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center shadow-xs">
            <CheckCircle2 size={9} className="text-white" />
          </span>
        </div>

        {/* Task Title */}
        <h3 className="font-semibold text-slate-900 text-sm sm:text-base leading-snug truncate group-hover:text-[#1e3a5f] transition-colors px-1">
          {task.title}
        </h3>

        {/* Company Name */}
        <p className="text-xs font-normal text-slate-500 mt-0.5 truncate max-w-[200px] mx-auto">
          {companyName}
        </p>

        {/* High Impact Budget Pill */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60 font-bold text-xs mt-2.5 mb-2">
          ₹{task.budget.toLocaleString("en-IN")} Fixed
        </div>

        {/* Category & Location Badges */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 my-2">
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 capitalize">
            {task.category || "Task"}
          </span>
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 text-blue-600 capitalize">
            {task.location || "Remote"}
          </span>
        </div>
      </div>

      {/* Footer Section */}
      <div className="w-full border-t border-slate-100 pt-3.5 mt-3 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 font-normal">
          <span className="flex items-center gap-1 truncate max-w-[130px]">
            <MapPin size={12} className="flex-shrink-0 text-slate-400" />
            <span className="truncate">{task.location || "Remote"}</span>
          </span>
          <span className="text-slate-400 text-[11px] flex-shrink-0">
            {task.createdAt ? new Date(task.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "Recent"}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/tasks/${task._id}`);
          }}
          className="w-full font-medium text-xs py-2.5 rounded-xl transition-all shadow-xs cursor-pointer border-0 flex items-center justify-center gap-1.5 bg-[#1e3a5f] hover:bg-[#152a45] text-white active:scale-95"
        >
          View Task
        </button>
      </div>
    </div>
  );
}

interface Props {
  params: Promise<{ id: string }>;
}

export default function TaskDetailPage({ params }: Props) {
  const { id } = use(params);
  const { data: session } = useSession();
  const { success } = useToast();

  const [task, setTask] = useState<Task | null>(null);
  const [relatedTasks, setRelatedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);

  // Interactive states
  const [activeTab, setActiveTab] = useState<"instructions" | "deliverables" | "skills" | "details" | "all">("instructions");
  const [checkedSkills, setCheckedSkills] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setLoading(true);
    tasksApi.getTaskById(id)
      .then(async (res) => {
        const t = (res as { data: Task }).data;
        setTask(t);
        setLoading(false);

        // Fetch real related tasks matching category or fallback to all active tasks
        try {
          const categoryRes = t?.category
            ? (await tasksApi.getTasks({ category: t.category }) as { data: Task[] })
            : { data: [] };
          const categoryTasks = (categoryRes.data || []).filter(r => r._id !== t._id);

          if (categoryTasks.length >= 4) {
            setRelatedTasks(categoryTasks.slice(0, 12));
          } else {
            // Combine category tasks with other real database tasks
            const allRes = (await tasksApi.getTasks({}) as { data: Task[] });
            const allTasks = (allRes.data || []).filter(r => r._id !== t._id);
            const combined = Array.from(
              new Map([...categoryTasks, ...allTasks].map(item => [item._id, item])).values()
            );
            setRelatedTasks(combined.slice(0, 12));
          }
        } catch {
          // non-critical
        }
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
                {employer?._id ? (
                  <Link href={`/employer-profile/${employer._id}`}>
                    <Avatar name={companyName} src={employer?.avatar} size="xl" className="flex-shrink-0 hover:opacity-80 transition-opacity cursor-pointer" />
                  </Link>
                ) : (
                  <Avatar name={companyName} src={employer?.avatar} size="xl" className="flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight mb-1">
                    {task.title}
                  </h1>
                  <p className="text-sm text-gray-500 mb-3">
                    {employer?._id ? (
                      <Link href={`/employer-profile/${employer._id}`} className="hover:text-[#1e3a5f] hover:underline font-semibold text-slate-800 transition-colors">
                        {companyName}
                      </Link>
                    ) : (
                      companyName
                    )}
                    <span className="inline-flex items-center gap-1 ml-2 text-slate-500 font-normal">
                      <MapPin size={12} />
                      {location}
                    </span>
                  </p>
                  
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium uppercase border border-slate-200">
                      {task.taskType}
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-[#edf2f7] text-[#1e3a5f] text-xs font-semibold border border-[#1e3a5f]/10">
                      {formatCurrency(task.budget)} Fixed Price
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-slate-800 text-white text-xs font-medium capitalize">
                      {task.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mobile Actions */}
              <div className="lg:hidden flex flex-col gap-3 mb-4 pt-4 border-t border-gray-100">
                {role === "employer" ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 w-full">
                    <p className="text-xs text-slate-700 font-medium mb-1">
                      Employer accounts cannot claim tasks.
                    </p>
                  </div>
                ) : !session ? (
                  <Link href={`/sign-in?callbackUrl=/tasks/${id}`} className="w-full">
                    <Button className="w-full bg-[#1e3a5f] hover:bg-[#152a45]">Sign in to Claim Task</Button>
                  </Link>
                ) : hasClaimed ? (
                  <div className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium text-sm">
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

            {/* Interactive Tab Headers */}
            <div className="bg-white rounded-xl border border-gray-200 p-2 flex flex-wrap gap-1 sm:gap-2">
              {[
                { id: "instructions", label: "Instructions", icon: ClipboardList },
                { id: "deliverables", label: "Deliverables", icon: CheckCircle2 },
                { id: "skills", label: "Skills", icon: Tag },
                { id: "details", label: "Details", icon: Building2 },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 min-w-[110px] flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      active
                        ? "bg-[#1e3a5f] text-white shadow-xs"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <Icon size={14} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: Instructions */}
            {(activeTab === "instructions" || activeTab === "all") && (
              <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ClipboardList size={16} className="text-[#1e3a5f]" /> Description
                </h2>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{task.description}</p>
              </div>
            )}

            {/* TAB 2: Deliverables */}
            {(activeTab === "deliverables" || activeTab === "all") && (
              <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#1e3a5f]" /> Deliverables
                </h2>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {task.deliverables || "Follow standard instructions provided by employer upon claim."}
                </p>
              </div>
            )}

            {/* TAB 3: Interactive Skills Matcher */}
            {(activeTab === "skills" || activeTab === "all") && (
              <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">Skill Matcher</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Click skills you possess to check your readiness for this gig</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-[#1e3a5f]">
                      {task.skills && task.skills.length > 0
                        ? Math.round((Object.values(checkedSkills).filter(Boolean).length / task.skills.length) * 100)
                        : 100}%
                    </span>
                    <span className="text-xs text-gray-400 block">Match Score</span>
                  </div>
                </div>

                {/* Progress Bar */}
                {task.skills && task.skills.length > 0 && (
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-[#1e3a5f] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(Object.values(checkedSkills).filter(Boolean).length / task.skills.length) * 100}%` }}
                    />
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-1">
                  {task.skills && task.skills.length > 0 ? (
                    task.skills.map((skill) => {
                      const checked = !!checkedSkills[skill];
                      return (
                        <button
                          key={skill}
                          onClick={() =>
                            setCheckedSkills((prev) => ({ ...prev, [skill]: !prev[skill] }))
                          }
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                            checked
                              ? "bg-[#1e3a5f] text-white border-[#1e3a5f] shadow-xs"
                              : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          <CheckCircle2 size={13} className={checked ? "text-emerald-300" : "text-gray-400"} />
                          <span>{skill}</span>
                        </button>
                      );
                    })
                  ) : (
                    <span className="text-xs text-gray-400">No specific skills required for this task.</span>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: Task Details */}
            {(activeTab === "details" || activeTab === "all") && (
              <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Building2 size={16} className="text-[#1e3a5f]" /> Specifications
                </h2>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                  {[
                    { icon: ClipboardList, label: "Title",         value: task.title },
                    { icon: Tag,           label: "Type",          value: task.taskType ? task.taskType.charAt(0).toUpperCase() + task.taskType.slice(1).replace(/-/g, " ") : undefined },
                    { icon: Building2,     label: "Category",      value: task.category },
                    { icon: MapPin,        label: "Location",      value: location },
                    { icon: DollarSign,    label: "Fixed Budget",  value: formatCurrency(task.budget) },
                    { icon: Users,         label: "Max Claimants", value: String(task.maxClaims) },
                    { icon: Users,         label: "Claims So Far", value: String(task.claimCount) },
                    { icon: task.durationType === "hours" ? Clock : Calendar,
                      label: task.durationType === "hours" ? "Duration" : "Start Date",
                      value: task.durationType === "hours" && task.durationHours ? `${task.durationHours} Hours (Quick Task)` : (task.startDate ? formatDate(task.startDate) : undefined) },
                    task.durationType !== "hours" ? { icon: Calendar, label: "End Date", value: task.endDate ? formatDate(task.endDate) : (task.deadline ? formatDate(task.deadline) : undefined) } : null,
                    { icon: Hash,          label: "Status",        value: task.status ? task.status.charAt(0).toUpperCase() + task.status.slice(1) : undefined },
                    { icon: Building2,     label: "Company",       value: task.companyName },
                    { icon: MapPin,        label: "Company Address", value: task.companyAddress },
                    { icon: Timer,         label: "Posted",        value: formatDate(task.createdAt) },
                  ].filter((f): f is NonNullable<typeof f> & { value: string } => Boolean(f && f.value)).map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex justify-between items-start py-2.5 border-b border-gray-100 gap-4">
                      <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500 uppercase tracking-wide pt-0.5">
                        <Icon size={13} className="text-[#1e3a5f] flex-shrink-0" />
                        {label}
                      </dt>
                      <dd className="text-sm font-medium text-slate-700 text-right break-words max-w-[60%]">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Related Tasks Carousel */}
            {relatedTasks.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
                <AutoScrollCarousel
                  title="Related Tasks & Micro-Gigs"
                  subtitle={`${relatedTasks.length} tasks`}
                >
                  {relatedTasks.map(t => (
                    <div key={t._id} className="w-64 sm:w-72 flex-shrink-0">
                      <FeaturedTaskCard task={t} />
                    </div>
                  ))}
                </AutoScrollCarousel>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-6 lg:w-[360px] flex-shrink-0 w-full">
            
            {/* Apply Card — Hidden on mobile, visible on desktop */}
            <div className="hidden lg:flex bg-gradient-to-br from-[#1e3a5f] via-[#162d4a] to-[#0f172a] text-white rounded-2xl p-6 sm:p-7 shadow-xl border border-white/10 text-center flex-col items-center">
              {/* Centered Budget Title Badge */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-400 text-[11px] font-bold uppercase tracking-wider mb-3">
                <DollarSign size={13} className="text-amber-400" /> Fixed Task Budget
              </span>

              {/* Centered Budget Amount */}
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-none mb-3">
                {formatCurrency(task.budget)}
              </h2>

              {/* Centered Time Pill */}
              {task.durationType === "hours" && task.durationHours ? (
                <div className="inline-flex items-center gap-1.5 text-xs text-slate-200 bg-white/10 border border-white/15 px-3.5 py-1 rounded-full mb-5">
                  <Clock size={13} className="text-amber-400" />
                  <span>{task.durationHours} {task.durationHours === 1 ? "Hour" : "Hours"} Task</span>
                </div>
              ) : (task.startDate || task.endDate || task.deadline) ? (
                <div className="inline-flex items-center gap-1.5 text-xs text-slate-200 bg-white/10 border border-white/15 px-3.5 py-1 rounded-full mb-5">
                  <Calendar size={13} className="text-amber-400" />
                  <span>
                    {task.startDate ? formatDate(task.startDate) : "—"} → {task.endDate ? formatDate(task.endDate) : task.deadline ? formatDate(task.deadline) : "—"}
                  </span>
                </div>
              ) : null}

              {/* Divider */}
              <div className="w-full border-t border-white/10 mb-5" />

              {/* Action Buttons */}
              <div className="w-full space-y-3">
                {role === "employer" ? (
                  <div className="bg-white/10 border border-white/15 rounded-xl p-3.5 text-center">
                    <p className="text-xs text-slate-200 font-medium mb-1">
                      Employer accounts cannot claim tasks.
                    </p>
                  </div>
                ) : !session ? (
                  <Link href={`/sign-in?callbackUrl=/tasks/${id}`} className="block">
                    <button className="w-full py-3.5 px-6 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white font-bold text-sm rounded-xl shadow-lg shadow-amber-500/25 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer border-0">
                      <span>Sign in to Claim Task</span>
                      <ArrowRight size={16} />
                    </button>
                  </Link>
                ) : hasClaimed ? (
                  <div className="flex items-center justify-center gap-2 w-full px-4 py-3.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-bold text-sm">
                    <CheckCircle2 size={18} />
                    Claim Proposal Submitted
                  </div>
                ) : (
                  <button
                    onClick={() => setClaimModalOpen(true)}
                    className="w-full py-3.5 px-6 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white font-bold text-sm rounded-xl shadow-lg shadow-amber-500/25 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer border-0"
                  >
                    <ClipboardList size={16} />
                    <span>Claim / Apply for Task</span>
                  </button>
                )}
              </div>
            </div>

            {/* Task Meta Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Overview</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-gray-500 text-xs">
                    <MapPin size={14} className="text-gray-400" />
                    Location
                  </span>
                  <span className="text-gray-700 font-medium text-xs text-right truncate max-w-[160px]">{location}</span>
                </li>
                <li className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-gray-500 text-xs">
                    <ClipboardList size={14} className="text-gray-400" />
                    Category
                  </span>
                  <span className="text-gray-700 font-medium text-xs text-right truncate max-w-[160px]">{task.category}</span>
                </li>
                <li className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-gray-500 text-xs">
                    <Users size={14} className="text-gray-400" />
                    Max Spots
                  </span>
                  <span className="text-gray-700 font-medium text-xs">{task.maxClaims} Freelancers</span>
                </li>
                <li className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-gray-500 text-xs">
                    <Users size={14} className="text-gray-400" />
                    Claims Count
                  </span>
                  <span className="text-gray-700 font-medium text-xs">{task.claimCount} claimed</span>
                </li>
              </ul>
            </div>

            {/* About Client */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">About Client</h3>
              <div className="flex items-start gap-3 mb-4">
                {employer?._id ? (
                  <Link href={`/employer-profile/${employer._id}`}>
                    <Avatar name={companyName} src={employer?.avatar} size="md" className="flex-shrink-0 hover:opacity-80 transition-opacity cursor-pointer" />
                  </Link>
                ) : (
                  <Avatar name={companyName} src={employer?.avatar} size="md" className="flex-shrink-0" />
                )}
                <div className="min-w-0">
                  {employer?._id ? (
                    <Link href={`/employer-profile/${employer._id}`} className="font-semibold text-gray-900 hover:text-[#1e3a5f] hover:underline truncate block">
                      {companyName}
                    </Link>
                  ) : (
                    <p className="font-semibold text-gray-900 truncate">{companyName}</p>
                  )}
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
              {employer?._id && (
                <Link href={`/employer-profile/${employer._id}`} className="w-full block">
                  <Button variant="outline" size="sm" className="w-full text-xs gap-1 border-[#1e3a5f]/20 text-[#1e3a5f] hover:bg-slate-50">
                    <span>View Employer Profile</span>
                    <ArrowRight size={13} />
                  </Button>
                </Link>
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
