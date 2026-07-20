import { Briefcase, DollarSign, Clock, UserCheck, CheckCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { JobSeekerStats } from "@/types";
import Link from "next/link";

interface StatsCardsProps {
  stats: JobSeekerStats;
}

const cardConfig = [
  {
    key: "activeJobs" as keyof JobSeekerStats,
    label: "Active Jobs",
    icon: Briefcase,
    bg: "bg-gradient-to-br from-blue-50/70 via-slate-50/60 to-white",
    border: "border-blue-100/80",
    iconBg: "bg-[#1e3a5f]/10",
    iconColor: "text-[#1e3a5f]",
    valueColor: "text-[#1e3a5f]",
    format: (v: number) => v.toString(),
    link: "/jobseeker/my-applications?status=accepted",
  },
  {
    key: "earnings" as keyof JobSeekerStats,
    label: "Total Earnings",
    icon: DollarSign,
    bg: "bg-gradient-to-br from-emerald-50/70 via-slate-50/60 to-white",
    border: "border-emerald-100/80",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600",
    valueColor: "text-emerald-700",
    format: (v: number) => formatCurrency(v),
    link: "/jobseeker/my-applications?status=accepted",
  },
  {
    key: "pendingApplications" as keyof JobSeekerStats,
    label: "Pending Applications",
    icon: Clock,
    bg: "bg-gradient-to-br from-amber-50/70 via-slate-50/60 to-white",
    border: "border-amber-100/80",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-600",
    valueColor: "text-amber-700",
    format: (v: number) => v.toString(),
    link: "/jobseeker/my-applications?status=pending",
  },
  {
    key: "hireRequests" as keyof JobSeekerStats,
    label: "Hire Requests",
    icon: UserCheck,
    bg: "bg-gradient-to-br from-purple-50/70 via-slate-50/60 to-white",
    border: "border-purple-100/80",
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-600",
    valueColor: "text-purple-700",
    format: (v: number) => v.toString(),
    link: "/jobseeker/proposals",
  },
  {
    key: "completedJobs" as keyof JobSeekerStats,
    label: "Completed Jobs",
    icon: CheckCircle,
    bg: "bg-gradient-to-br from-teal-50/70 via-slate-50/60 to-white",
    border: "border-teal-100/80",
    iconBg: "bg-teal-500/10",
    iconColor: "text-teal-600",
    valueColor: "text-teal-700",
    format: (v: number) => v.toString(),
    link: "/jobseeker/my-applications?status=completed",
  },
];

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
      {cardConfig.map((card) => {
        const Icon = card.icon;
        return (
          <Link key={card.key} href={card.link}>
            <div
              className={`${card.bg} ${card.border} border rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 h-full flex flex-col justify-between`}
            >
              <div className={`${card.iconBg} w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center mb-3 flex-shrink-0`}>
                <Icon size={18} className={card.iconColor} />
              </div>
              <div>
                <div className={`text-xl sm:text-2xl md:text-3xl font-extrabold ${card.valueColor} tracking-tight mb-1`}>
                  {card.format(stats[card.key])}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-600 leading-snug">{card.label}</div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
