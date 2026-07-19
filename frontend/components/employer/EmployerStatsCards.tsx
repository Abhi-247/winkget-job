import { Briefcase, Users, UserCheck, FileText, ClipboardList } from "lucide-react";
import { EmployerStats } from "@/types";
import Link from "next/link";

interface EmployerStatsCardsProps {
  stats: EmployerStats;
}

const cardConfig = [
  {
    key: "totalPosted" as keyof EmployerStats,
    label: "Total Jobs Posted",
    subtitle: "All time",
    icon: Briefcase,
    bg: "bg-[#edf2f7]",
    iconBg: "bg-blue-100",
    iconColor: "text-[#1e3a5f]",
    valueColor: "text-[#1e3a5f]",
    link: "/employer/my-jobs",
  },
  {
    key: "totalReceived" as keyof EmployerStats,
    label: "Applications Received",
    subtitle: "All jobs",
    icon: FileText,
    bg: "bg-[#edf2f7]",
    iconBg: "bg-blue-100",
    iconColor: "text-[#1e3a5f]",
    valueColor: "text-[#1e3a5f]",
    link: "/employer/applications",
  },
  {
    key: "acceptedApplicants" as keyof EmployerStats,
    label: "Accepted Applicants",
    subtitle: "Hired freelancers",
    icon: UserCheck,
    bg: "bg-amber-50",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    valueColor: "text-amber-700",
    link: "/employer/applications?status=accepted",
  },
  {
    key: "activeContracts" as keyof EmployerStats,
    label: "Active Contracts",
    subtitle: "In progress",
    icon: Users,
    bg: "bg-purple-50",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    valueColor: "text-purple-700",
    link: "/employer/my-jobs?status=open",
  },
  {
    key: "activeTasks" as keyof EmployerStats,
    label: "Active Tasks",
    subtitle: "Micro-jobs",
    icon: ClipboardList,
    bg: "bg-emerald-50",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    valueColor: "text-emerald-700",
    link: "/employer/my-tasks",
  },
];

export function EmployerStatsCards({ stats }: EmployerStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {cardConfig.map((card) => {
        const Icon = card.icon;
        return (
          <Link key={card.key} href={card.link}>
            <div
              className={`${card.bg} rounded-xl p-3.5 sm:p-4 border border-white/40 shadow-sm cursor-pointer hover:shadow-md transition-shadow`}
            >
              <div className={`${card.iconBg} w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center mb-2`}>
                <Icon size={14} className={card.iconColor} />
              </div>
              <div className={`text-lg sm:text-2xl font-bold ${card.valueColor} mb-0.5`}>
                {stats[card.key]}
              </div>
              <div className="text-xs sm:text-sm font-medium text-gray-700 leading-tight">
                {card.label}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
