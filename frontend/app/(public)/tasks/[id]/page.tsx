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
  Send,
  Globe,
  Building,
} from "lucide-react";
import { Linkedin } from "@/components/ui/BrandIcons";
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
      className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs hover:shadow-sm hover:border-slate-300 transition-all duration-300 w-full flex-shrink-0 flex flex-col justify-between items-center text-center relative group cursor-pointer h-full"
    >
      <div className="w-full">
        <div className="relative mb-2.5 mx-auto w-12 h-12">
          {employer?.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={employer.avatar}
              alt={companyName}
              className="w-12 h-12 rounded-2xl object-cover shadow-xs border-2 border-white"
            />
          ) : (
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-xs border-2 border-white ${avatarBg}`}
            >
              {initials}
            </div>
          )}
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center shadow-xs">
            <CheckCircle2 size={8} className="text-white" />
          </span>
        </div>

        <h3 className="font-semibold text-slate-900 text-xs sm:text-sm leading-snug truncate group-hover:text-[#1e3a5f] transition-colors px-1">
          {task.title}
        </h3>

        <p className="text-xs font-normal text-slate-400 mt-0.5 truncate max-w-[180px] mx-auto">
          {companyName}
        </p>

        <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60 font-bold text-[11px] mt-2 mb-1.5">
          ₹{task.budget.toLocaleString("en-IN")} Fixed
        </div>
      </div>

      <div className="w-full border-t border-slate-100 pt-2.5 mt-2.5 space-y-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/tasks/${task._id}`);
          }}
          className="w-full font-semibold text-xs py-2 rounded-xl transition-all shadow-xs cursor-pointer border-0 flex items-center justify-center gap-1 bg-[#1e3a5f] hover:bg-[#152a45] text-white"
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

  const [activeTab, setActiveTab] = useState<"instructions" | "deliverables" | "skills" | "details">("instructions");
  const [checkedSkills, setCheckedSkills] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setLoading(true);
    tasksApi.getTaskById(id)
      .then(async (res) => {
        const t = (res as { data: Task }).data;
        setTask(t);
        setLoading(false);

        try {
          const categoryRes = t?.category
            ? (await tasksApi.getTasks({ category: t.category }) as { data: Task[] })
            : { data: [] };
          const categoryTasks = (categoryRes.data || []).filter(r => r._id !== t._id);

          if (categoryTasks.length >= 4) {
            setRelatedTasks(categoryTasks.slice(0, 12));
          } else {
            const allRes = (await tasksApi.getTasks({}) as { data: Task[] });
            const allTasks = (allRes.data || []).filter(r => r._id !== t._id);
            const combined = Array.from(
              new Map([...categoryTasks, ...allTasks].map(item => [item._id, item])).values()
            );
            setRelatedTasks(combined.slice(0, 12));
          }
        } catch {}
      })
      .catch((err) => {
        console.error(err);
        setTask(null);
        setLoading(false);
      });
  }, [id]);

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
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      success("Task link copied to clipboard!");
    }
  };

  const scrollToSection = (sectionId: "instructions" | "deliverables" | "skills" | "details") => {
    setActiveTab(sectionId);
    const el = document.getElementById(`section-${sectionId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (loading) return <PageSpinner />;
  if (!task) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-8">
        <div className="text-center bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-md">
          <Sparkles size={36} className="mx-auto text-slate-400 mb-3" />
          <h2 className="text-base font-semibold text-slate-900 mb-1">Task Not Found</h2>
          <p className="text-xs text-slate-500 mb-4 font-normal">The task listing you are looking for does not exist or has been closed.</p>
          <Link href="/tasks">
            <Button variant="outline" size="sm">Browse Tasks</Button>
          </Link>
        </div>
      </div>
    );
  }

  const employer = typeof task.employer === "object" ? (task.employer as User) : null;
  const companyName = task.companyName || employer?.company || employer?.name || "winkget Client";
  const employerId = employer?._id;
  const location = task.location || employer?.location || "Remote";
  const role = session?.user?.role;

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16">
      {/* ── BREADCRUMB ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link href="/" className="hover:text-slate-800 transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link href="/tasks" className="hover:text-slate-800 transition-colors">Tasks Pool</Link>
            <ChevronRight size={12} />
            <span className="text-slate-900 font-semibold truncate max-w-[200px]">{task.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">

          {/* ── LEFT MAIN COLUMN ───────────────────────────────────────────── */}
          <div className="space-y-6 min-w-0">

            {/* Top Header Card */}
            <div className="relative bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs overflow-hidden">
              <span className="absolute top-0 right-0 bg-amber-50 text-amber-700 border-b border-l border-amber-200/60 text-[10px] font-semibold px-3 py-1 rounded-bl-xl tracking-wider uppercase">
                MICRO TASK
              </span>

              <div className="flex items-start gap-4 mb-4">
                <Avatar name={companyName} src={employer?.avatar} size="xl" className="flex-shrink-0" />
                <div className="flex-1 min-w-0 pr-12">
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight mb-1">
                    {task.title}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mb-2 font-medium flex items-center gap-2">
                    <span>{companyName}</span>
                    <span className="inline-flex items-center gap-1 text-slate-400 font-normal">
                      <MapPin size={12} />
                      {location}
                    </span>
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-1">
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium capitalize border border-slate-200/60">
                      {task.taskType || "Micro Task"}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200/60">
                      {formatCurrency(task.budget)} Fixed Budget
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium capitalize border border-slate-200/60">
                      {task.status || "Active"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sub-Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-xs text-slate-600 font-medium">
                <div className="text-left sm:text-center">
                  <p className="text-[11px] text-slate-400 font-normal">Fixed Budget</p>
                  <p className="text-xs sm:text-sm font-bold text-slate-900">{formatCurrency(task.budget)}</p>
                </div>
                <div className="text-left sm:text-center">
                  <p className="text-[11px] text-slate-400 font-normal">Max Claims</p>
                  <p className="text-xs sm:text-sm font-semibold text-slate-900">{task.maxClaims || 1}</p>
                </div>
                <div className="text-left sm:text-center">
                  <p className="text-[11px] text-slate-400 font-normal">Claims Count</p>
                  <p className="text-xs sm:text-sm font-bold text-slate-900">{task.claimCount || 0}</p>
                </div>
                <div className="text-left sm:text-center">
                  <p className="text-[11px] text-slate-400 font-normal">Posted Date</p>
                  <p className="text-xs sm:text-sm font-semibold text-slate-900">{formatDate(task.createdAt)}</p>
                </div>
              </div>

              {/* Mobile View Action Buttons right below Header Card */}
              <div className="lg:hidden flex flex-col gap-2.5 pt-4 mt-4 border-t border-slate-100">
                {role === "employer" ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center w-full">
                    <p className="text-xs text-slate-600 font-medium">Employer accounts cannot claim tasks.</p>
                  </div>
                ) : !session ? (
                  <Link href={`/sign-in?callbackUrl=/tasks/${id}`} className="w-full">
                    <button className="w-full py-2.5 px-5 bg-[#1e3a5f] hover:bg-[#152a45] text-white font-semibold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer border-0 transition-colors">
                      <span>Sign in to Claim Task</span>
                      <ArrowRight size={14} />
                    </button>
                  </Link>
                ) : hasClaimed ? (
                  <div className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold text-xs">
                    <CheckCircle2 size={16} />
                    Claim Proposal Submitted
                  </div>
                ) : (
                  <Button
                    onClick={() => setClaimModalOpen(true)}
                    className="w-full py-2.5 bg-[#1e3a5f] hover:bg-[#152a45] text-white font-semibold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer border-0 transition-colors"
                  >
                    <ClipboardList size={15} /> Claim / Apply for Task
                  </Button>
                )}
              </div>
            </div>

            {/* Quick Section Anchor Tab Navigation */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-1.5 flex flex-wrap gap-1 shadow-xs sticky top-4 z-20">
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
                    onClick={() => scrollToSection(tab.id as any)}
                    className={`flex-1 min-w-[100px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      active
                        ? "bg-[#1e3a5f] text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Icon size={14} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* SECTION 1: Instructions & Description */}
            <div id="section-instructions" className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <span className="w-1.5 h-4 bg-[#1e3a5f] rounded-full inline-block" /> Description
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal whitespace-pre-line">
                {task.description}
              </p>
            </div>

            {/* SECTION 2: Deliverables */}
            <div id="section-deliverables" className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <span className="w-1.5 h-4 bg-[#1e3a5f] rounded-full inline-block" /> Deliverables
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal whitespace-pre-line">
                {task.deliverables || "Follow standard instructions provided by employer upon claim."}
              </p>
            </div>

            {/* SECTION 3: Required Skills & Interactive Matcher */}
            <div id="section-skills" className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <span className="w-1.5 h-4 bg-[#1e3a5f] rounded-full inline-block" /> Required Skills & Matcher
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 font-normal">Select skills you possess to evaluate your readiness for this gig</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-[#1e3a5f]">
                    {task.skills && task.skills.length > 0
                      ? Math.round((Object.values(checkedSkills).filter(Boolean).length / task.skills.length) * 100)
                      : 100}%
                  </span>
                  <span className="text-[11px] text-slate-400 block font-normal">Match Score</span>
                </div>
              </div>

              {task.skills && task.skills.length > 0 && (
                <div className="w-full bg-slate-100 rounded-full h-2">
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
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                          checked
                            ? "bg-[#1e3a5f] text-white border-[#1e3a5f] shadow-xs"
                            : "bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100"
                        }`}
                      >
                        <CheckCircle2 size={13} className={checked ? "text-emerald-300" : "text-slate-400"} />
                        <span>{skill}</span>
                      </button>
                    );
                  })
                ) : (
                  <span className="text-xs text-slate-400 italic font-normal">No specific skills required for this task.</span>
                )}
              </div>
            </div>

            {/* SECTION 4: Task Specifications */}
            <div id="section-details" className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <span className="w-1.5 h-4 bg-[#1e3a5f] rounded-full inline-block" /> Specifications
              </div>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                {[
                  { icon: ClipboardList, label: "Task Title",      value: task.title },
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
                  { icon: MapPin,        label: "Address", value: task.companyAddress },
                  { icon: Timer,         label: "Posted Date",   value: formatDate(task.createdAt) },
                ].filter((f): f is NonNullable<typeof f> & { value: string } => Boolean(f && f.value)).map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex justify-between items-start py-2.5 border-b border-slate-100 gap-4">
                    <dt className="flex items-center gap-1.5 text-xs font-normal text-slate-500 uppercase tracking-wide pt-0.5">
                      <Icon size={13} className="text-slate-400 flex-shrink-0" />
                      {label}
                    </dt>
                    <dd className="text-xs sm:text-sm font-medium text-slate-800 text-right break-words max-w-[60%]">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Related Tasks Carousel */}
            {relatedTasks.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
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

          {/* ── RIGHT FIXED SIDEBAR (Centered Navy Header Box + White Claim Button) ───────── */}
          <aside className="space-y-6 lg:sticky lg:top-6 lg:w-[360px] flex-shrink-0 w-full">
            
            {/* 1. CENTERED NAVY HIGHLIGHTED CLAIM SIDEBAR CARD */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="bg-gradient-to-br from-[#1e3a5f] via-[#162d4a] to-[#0f172a] text-white p-5 text-center flex flex-col items-center justify-center space-y-4">
                <div className="text-center space-y-1.5 flex flex-col items-center">
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[11px] font-semibold uppercase tracking-wider">
                    <DollarSign size={13} className="text-amber-400" /> Fixed Task Budget
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight pt-1">
                    {formatCurrency(task.budget)}
                  </div>
                </div>

                {/* Claim Button */}
                <div className="space-y-2 pt-1 w-full">
                  {role === "employer" ? (
                    <div className="bg-white/10 border border-white/20 rounded-xl p-3 text-center">
                      <p className="text-xs text-slate-200 font-medium">Employer accounts cannot claim tasks.</p>
                    </div>
                  ) : !session ? (
                    <Link href={`/sign-in?callbackUrl=/tasks/${id}`} className="block w-full">
                      <button className="w-full py-2.5 px-5 bg-white hover:bg-slate-100 text-[#1e3a5f] font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer border-0 transition-colors">
                        <span>Sign in to Claim Task</span>
                        <ArrowRight size={14} />
                      </button>
                    </Link>
                  ) : hasClaimed ? (
                    <div className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs">
                      <CheckCircle2 size={16} />
                      Claim Proposal Submitted
                    </div>
                  ) : (
                    <Button
                      onClick={() => setClaimModalOpen(true)}
                      className="w-full py-2.5 bg-white hover:bg-slate-100 text-[#1e3a5f] font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer border-0 transition-colors"
                    >
                      <ClipboardList size={15} /> Claim / Apply for Task
                    </Button>
                  )}
                </div>
              </div>

              {/* 2. TASK OVERVIEW SUMMARY LIST IN SIDEBAR */}
              <div className="p-5 space-y-3 text-xs">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 pb-1 border-b border-slate-100 uppercase tracking-wider">
                  <span className="w-1.5 h-3.5 bg-[#1e3a5f] rounded-full inline-block" /> Overview
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="flex items-center gap-2 text-slate-400 font-normal"><Tag size={14} /> Category</span>
                  <span className="font-semibold text-slate-900">{task.category || "General"}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="flex items-center gap-2 text-slate-400 font-normal"><MapPin size={14} /> Location</span>
                  <span className="font-semibold text-slate-900">{location}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="flex items-center gap-2 text-slate-400 font-normal"><Users size={14} /> Max Claims</span>
                  <span className="font-semibold text-slate-900">{task.maxClaims || 1}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="flex items-center gap-2 text-slate-400 font-normal"><Users size={14} /> Claims Count</span>
                  <span className="font-semibold text-slate-900">{task.claimCount || 0}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="flex items-center gap-2 text-slate-400 font-normal"><Calendar size={14} /> Posted Date</span>
                  <span className="font-semibold text-slate-900">{formatDate(task.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* 3. EMPLOYER PROFILE CARD IN SIDEBAR */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3.5">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <span className="w-1.5 h-4 bg-[#1e3a5f] rounded-full inline-block" /> Employer Profile
              </div>
              <div className="flex items-start gap-3">
                <Avatar name={companyName} src={employer?.avatar} size="lg" className="flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{companyName}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 font-normal">{employer?.bio || "Verified employer listing task gigs on winkget."}</p>
                  <div className="flex items-center gap-2 mt-1.5 text-xs">
                    <span className="text-amber-500 font-semibold">★ 5.0</span>
                    <span className="text-slate-400 font-normal">• {employer?.location || location}</span>
                  </div>
                </div>
              </div>
              {employerId ? (
                <Link href={`/employer-profile/${employerId}`} className="block w-full">
                  <Button variant="outline" className="w-full py-2 text-xs font-medium rounded-xl border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-1.5">
                    <Building size={13} /> View Employer Profile
                  </Button>
                </Link>
              ) : (
                <Button variant="outline" disabled className="w-full py-2 text-xs font-medium rounded-xl border-slate-200 text-slate-400">
                  <Building size={13} /> Employer Profile Verified
                </Button>
              )}
            </div>

            {/* 4. SHARE TASK CARD */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <span className="w-1.5 h-4 bg-[#1e3a5f] rounded-full inline-block" /> Share Task
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`, "_blank")}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Linkedin size={13} className="text-blue-600" /> LinkedIn
                </button>
                <button
                  type="button"
                  onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this micro-task gig: ${typeof window !== "undefined" ? window.location.href : ""}`)}`, "_blank")}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Send size={13} className="text-emerald-600" /> WhatsApp
                </button>
                <button
                  type="button"
                  onClick={copyLink}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Copy size={13} /> Copy Link
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Claim Modal */}
      {claimModalOpen && (
        <ClaimTaskModal
          open={claimModalOpen}
          task={task}
          onClose={() => setClaimModalOpen(false)}
          onSuccess={() => {
            setHasClaimed(true);
            setClaimModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
