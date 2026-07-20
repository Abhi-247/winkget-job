import Link from "next/link";
import { Users, Briefcase, Building2, User, ClipboardList, FileText, UserCheck, TrendingUp } from "lucide-react";
import { AdminStats } from "@/types";

interface AdminStatsCardsProps {
  stats: AdminStats;
}

const cards = [
  {
    key: "totalUsers" as keyof AdminStats,
    label: "Total Users",
    icon: Users,
    bg: "bg-[#edf2f7]",
    iconBg: "bg-blue-100",
    iconColor: "text-[#1e3a5f]",
    valueColor: "text-[#1e3a5f]",
    href: "/admin/users",
  },
  {
    key: "activeJobs" as keyof AdminStats,
    label: "Active Jobs",
    icon: Briefcase,
    bg: "bg-[#edf2f7]",
    iconBg: "bg-blue-100",
    iconColor: "text-[#1e3a5f]",
    valueColor: "text-[#1e3a5f]",
    href: "/admin/jobs",
  },
  {
    key: "totalTasks" as keyof AdminStats,
    label: "Total Tasks",
    icon: ClipboardList,
    bg: "bg-purple-50",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    valueColor: "text-purple-700",
    href: "/admin/tasks",
  },
  {
    key: "totalApplications" as keyof AdminStats,
    label: "Applications",
    icon: FileText,
    bg: "bg-amber-50",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    valueColor: "text-amber-700",
    href: "/admin/applications",
  },
  {
    key: "totalHireRequests" as keyof AdminStats,
    label: "Hire Requests",
    icon: UserCheck,
    bg: "bg-orange-50",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    valueColor: "text-orange-700",
    href: "/admin/hire-requests",
  },
  {
    key: "totalEmployers" as keyof AdminStats,
    label: "Employers",
    icon: Building2,
    bg: "bg-teal-50",
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
    valueColor: "text-teal-700",
    href: "/admin/users?role=employer",
  },
  {
    key: "totalJobseekers" as keyof AdminStats,
    label: "Job Seekers",
    icon: User,
    bg: "bg-green-50",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    valueColor: "text-green-700",
    href: "/admin/users?role=jobseeker",
  },
  {
    key: "totalJobs" as keyof AdminStats,
    label: "Total Jobs",
    icon: TrendingUp,
    bg: "bg-sky-50",
    iconBg: "bg-sky-100",
    iconColor: "text-sky-600",
    valueColor: "text-sky-700",
    href: "/admin/jobs",
  },
];

export function AdminStatsCards({ stats }: AdminStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Link key={card.key} href={card.href} className="block group">
            <div className={`${card.bg} rounded-xl p-4 border border-white group-hover:shadow-sm transition-shadow`}>
              <div className={`${card.iconBg} w-8 h-8 rounded-lg flex items-center justify-center mb-3`}>
                <Icon size={16} className={card.iconColor} />
              </div>
              <div className={`text-2xl font-bold ${card.valueColor} mb-0.5`}>
                {stats[card.key] ?? 0}
              </div>
              <div className="text-xs text-gray-500 font-medium leading-tight">{card.label}</div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
