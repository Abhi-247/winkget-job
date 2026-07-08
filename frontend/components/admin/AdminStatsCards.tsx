import { Users, Briefcase, Building2, User } from "lucide-react";
import { AdminStats } from "@/types";

interface AdminStatsCardsProps {
  stats: AdminStats;
}

export function AdminStatsCards({ stats }: AdminStatsCardsProps) {
  const cards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, bg: "bg-[#edf2f7]", iconBg: "bg-blue-100", iconColor: "text-[#1e3a5f]", valueColor: "text-[#1e3a5f]" },
    { label: "Active Jobs", value: stats.activeJobs, icon: Briefcase, bg: "bg-[#edf2f7]", iconBg: "bg-blue-100", iconColor: "text-[#1e3a5f]", valueColor: "text-[#1e3a5f]" },
    { label: "Total Employers", value: stats.totalEmployers, icon: Building2, bg: "bg-purple-50", iconBg: "bg-purple-100", iconColor: "text-purple-600", valueColor: "text-purple-700" },
    { label: "Total Job Seekers", value: stats.totalJobseekers, icon: User, bg: "bg-amber-50", iconBg: "bg-amber-100", iconColor: "text-amber-600", valueColor: "text-amber-700" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className={`${card.bg} rounded-xl p-5 border border-white`}>
            <div className={`${card.iconBg} w-9 h-9 rounded-lg flex items-center justify-center mb-3`}>
              <Icon size={18} className={card.iconColor} />
            </div>
            <div className={`text-2xl font-bold ${card.valueColor} mb-1`}>{card.value}</div>
            <div className="text-xs text-gray-500 font-medium">{card.label}</div>
          </div>
        );
      })}
    </div>
  );
}
