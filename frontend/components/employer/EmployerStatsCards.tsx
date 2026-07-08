import { Briefcase, Users, UserCheck, FileText } from "lucide-react";
import { EmployerStats } from "@/types";

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
  },
];

export function EmployerStatsCards({ stats }: EmployerStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cardConfig.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.key}
            className={`${card.bg} rounded-xl p-5 border border-white`}
          >
            <div className={`${card.iconBg} w-9 h-9 rounded-lg flex items-center justify-center mb-3`}>
              <Icon size={18} className={card.iconColor} />
            </div>
            <div className={`text-2xl font-bold ${card.valueColor} mb-0.5`}>
              {stats[card.key]}
            </div>
            <div className="text-sm font-medium text-gray-700">
              {card.label}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">{card.subtitle}</div>
          </div>
        );
      })}
    </div>
  );
}
