"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, Bookmark, Star, CheckCircle2 } from "lucide-react";
import { User } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { StarRating } from "@/components/ui/StarRating";
import { formatCurrency, cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/Toast";

interface FreelancerCardProps {
  freelancer: User;
  onHire: (f: User) => void;
  saved?: boolean;
  onToggleSave?: (id: string) => void;
}

export function FreelancerCard({
  freelancer,
  onHire,
  saved = false,
  onToggleSave,
}: FreelancerCardProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { error: toastError } = useToast();

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a")) return;
    router.push(`/talent/${freelancer._id}`);
  };

  const isAvailable = freelancer.availability === "Immediately";
  const ratingAvg = freelancer.ratingAvg || 4.8;
  const ratingCount = freelancer.ratingCount || 12;

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-5 hover:shadow-md hover:border-blue-200 transition-all duration-200 flex flex-col justify-between w-full h-full flex-1 overflow-hidden cursor-pointer"
    >
      <div className="flex-1 flex flex-col">
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <Avatar
              name={freelancer.name}
              src={freelancer.avatar}
              size="md"
              className="flex-shrink-0 rounded-xl"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Link href={`/talent/${freelancer._id}`}>
                  <h3 className="font-semibold text-[#0f172a] text-sm sm:text-base leading-snug group-hover:text-[#1e3a5f] transition-colors truncate">
                    {freelancer.name}
                  </h3>
                </Link>
                {isAvailable && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium text-[10px]">
                    Available
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-normal truncate mt-0.5">
                {freelancer.title || "Freelancer"} {freelancer.location ? `· ${freelancer.location}` : ""}
              </p>
            </div>
          </div>

          {/* Rate Pill */}
          <div className="flex-shrink-0">
            <span className="px-2.5 py-1 rounded-xl bg-[#eef2ff] text-[#1e3a5f] font-semibold text-xs tracking-tight whitespace-nowrap block">
              {freelancer.hourlyRate ? `${formatCurrency(freelancer.hourlyRate)}/hr` : "Rate on request"}
            </span>
          </div>
        </div>

        {/* Rating and badges summary */}
        <div className="flex items-center gap-2.5 mt-2.5 flex-wrap text-xs text-slate-500 font-normal">
          <StarRating rating={ratingAvg} count={ratingCount} size="sm" />
          <span className="text-slate-300">·</span>
          <span className="text-emerald-600 font-medium text-xs flex items-center gap-1">
            <CheckCircle2 size={12} /> Verified
          </span>
        </div>

        {/* Bio summary */}
        <p className="text-xs text-slate-600 font-normal line-clamp-2 mt-2.5 mb-3 leading-relaxed flex-1">
          {freelancer.bio || "Available for freelance projects, custom development, and contract assignments."}
        </p>

        {/* Skills Pills */}
        {freelancer.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {freelancer.skills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium"
              >
                {skill}
              </span>
            ))}
            {freelancer.skills.length > 4 && (
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[11px] font-medium">
                +{freelancer.skills.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer / Actions */}
      <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
        <span className="text-xs text-slate-500 font-normal">
          100% Job Success
        </span>

        <div className="flex items-center gap-2 flex-shrink-0">
          {onToggleSave && (
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (session?.user?.role === "jobseeker") {
                  toastError("Please login as an employer first to shortlist freelancers");
                  return;
                }
                onToggleSave(freelancer._id);
              }}
              aria-label={saved ? "Remove from saved" : "Save freelancer"}
              className={cn("h-8 w-8 p-0 rounded-xl flex items-center justify-center", saved && "text-amber-600")}
            >
              <Bookmark size={14} className={cn(saved && "fill-amber-500 text-amber-500")} />
            </Button>
          )}
          <Button
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (session?.user?.role === "jobseeker") {
                toastError("Please login as an employer first to hire freelancers");
                return;
              }
              onHire(freelancer);
            }}
            className="bg-[#1e3a5f] hover:bg-[#152a45] text-white text-xs px-3.5 py-1.5 font-medium rounded-xl transition-colors"
          >
            Hire Now
          </Button>
        </div>
      </div>
    </div>
  );
}
