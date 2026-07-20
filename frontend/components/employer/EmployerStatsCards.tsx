import { Briefcase, Users, FileText, ClipboardList } from "lucide-react";
import { EmployerStats } from "@/types";
import Link from "next/link";

interface EmployerStatsCardsProps {
  stats: EmployerStats;
}

const cardConfig = [
  {
    key: "totalPosted" as keyof EmployerStats,
    label: "Total Jobs Posted",
    icon: Briefcase,
    bg: "bg-gradient-to-br from-blue-50/70 via-slate-50/60 to-white",
    border: "border-blue-100/80",
    iconBg: "bg-[#1e3a5f]/10",
    iconColor: "text-[#1e3a5f]",
    valueColor: "text-[#1e3a5f]",
    link: "/employer/my-jobs",
  },
  {
    key: "totalReceived" as keyof EmployerStats,
    label: "Applications Received",
    icon: FileText,
    bg: "bg-gradient-to-br from-sky-50/70 via-slate-50/60 to-white",
    border: "border-sky-100/80",
    iconBg: "bg-sky-500/10",
    iconColor: "text-sky-700",
    valueColor: "text-[#1e3a5f]",
    link: "/employer/applications",
  },
  {
    key: "activeContracts" as keyof EmployerStats,
    label: "Active Contracts",
    icon: Users,
    bg: "bg-gradient-to-br from-purple-50/70 via-slate-50/60 to-white",
    border: "border-purple-100/80",
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-600",
    valueColor: "text-purple-700",
    link: "/employer/my-jobs?status=open",
  },
  {
    key: "activeTasks" as keyof EmployerStats,
    label: "Active Tasks",
    icon: ClipboardList,
    bg: "bg-gradient-to-br from-emerald-50/70 via-slate-50/60 to-white",
    border: "border-emerald-100/80",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600",
    valueColor: "text-emerald-700",
    link: "/employer/my-tasks",
  },
];

export function EmployerStatsCards({ stats }: EmployerStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
      {cardConfig.map((card) => {
        const Icon = card.icon;
        return (
          <Link key={card.key} href={card.link} className="block h-full">
            <div
              className={`${card.bg} ${card.border} border rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 h-full flex flex-col justify-between`}
            >
              <div className={`${card.iconBg} w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center mb-3 flex-shrink-0`}>
                <Icon size={18} className={card.iconColor} />
              </div>
              <div>
                <div className={`text-xl sm:text-2xl md:text-3xl font-extrabold ${card.valueColor} tracking-tight mb-1`}>
                  {stats[card.key]}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-600 leading-snug">
                  {card.label}
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
