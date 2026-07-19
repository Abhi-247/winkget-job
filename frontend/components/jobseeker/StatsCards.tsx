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
    bg: "bg-[#edf2f7]",
    iconBg: "bg-blue-100",
    iconColor: "text-[#1e3a5f]",
    valueColor: "text-[#1e3a5f]",
    format: (v: number) => v.toString(),
    link: "/jobseeker/my-applications?status=accepted",
  },
  {
    key: "earnings" as keyof JobSeekerStats,
    label: "Total Earnings",
    icon: DollarSign,
    bg: "bg-[#edf2f7]",
    iconBg: "bg-blue-100",
    iconColor: "text-[#1e3a5f]",
    valueColor: "text-[#1e3a5f]",
    format: (v: number) => formatCurrency(v),
    link: "/jobseeker/my-applications?status=accepted",
  },
  {
    key: "pendingApplications" as keyof JobSeekerStats,
    label: "Pending Applications",
    icon: Clock,
    bg: "bg-amber-50",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    valueColor: "text-amber-700",
    format: (v: number) => v.toString(),
    link: "/jobseeker/my-applications?status=pending",
  },
  {
    key: "hireRequests" as keyof JobSeekerStats,
    label: "Hire Requests",
    icon: UserCheck,
    bg: "bg-purple-50",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    valueColor: "text-purple-700",
    format: (v: number) => v.toString(),
    link: "/jobseeker/proposals",
  },
  {
    key: "completedJobs" as keyof JobSeekerStats,
    label: "Completed Jobs",
    icon: CheckCircle,
    bg: "bg-teal-50",
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
    valueColor: "text-teal-700",
    format: (v: number) => v.toString(),
    link: "/jobseeker/my-applications?status=completed",
  },
];

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {cardConfig.map((card) => {
        const Icon = card.icon;
        return (
          <Link key={card.key} href={card.link}>
            <div
              className={`${card.bg} rounded-xl p-5 border border-white cursor-pointer hover:shadow-md transition-shadow`}
            >
              <div className={`${card.iconBg} w-9 h-9 rounded-lg flex items-center justify-center mb-3`}>
                <Icon size={18} className={card.iconColor} />
              </div>
              <div className={`text-2xl font-bold ${card.valueColor} mb-1`}>
                {card.format(stats[card.key])}
              </div>
              <div className="text-xs text-gray-500 font-medium">{card.label}</div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
