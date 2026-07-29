"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bookmark, CheckCircle2, MapPin, Clock } from "lucide-react";
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
      className="group relative bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-5 hover:shadow-md hover:border-blue-200 transition-all duration-200 flex flex-col justify-between w-full overflow-hidden cursor-pointer"
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
              {/* Name + availability badge */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <Link href={`/talent/${freelancer._id}`}>
                  <h3 className="font-semibold text-[#0f172a] text-sm sm:text-base leading-snug group-hover:text-[#1e3a5f] transition-colors">
                    {freelancer.name}
                  </h3>
                </Link>
                {isAvailable && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium text-[10px]">
                    Available
                  </span>
                )}
              </div>
              {/* Title + location */}
              <p className="text-xs text-slate-500 font-normal truncate mt-0.5">
                {freelancer.title || "Freelancer"}
                {freelancer.location ? (
                  <span className="inline-flex items-center gap-0.5 ml-1">
                    <MapPin size={10} className="inline" />
                    {freelancer.location}
                  </span>
                ) : null}
              </p>
              {/* Rating */}
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <StarRating rating={ratingAvg} count={ratingCount} size="sm" />
                <span className="text-slate-300">·</span>
                <span className="text-emerald-600 font-medium text-xs flex items-center gap-1">
                  <CheckCircle2 size={12} /> Verified
                </span>
              </div>
            </div>
          </div>

          {/* Rate Pill */}
          <div className="flex-shrink-0">
            <span className="px-2.5 py-1 rounded-xl bg-[#eef2ff] text-[#1e3a5f] font-semibold text-xs tracking-tight whitespace-nowrap block">
              {freelancer.hourlyRate
                ? `${formatCurrency(freelancer.hourlyRate)}/hr`
                : "Rate on request"}
            </span>
          </div>
        </div>

        {/* Bio */}
        <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed mt-3 mb-3.5 line-clamp-2">
          {freelancer.bio ||
            "Available for freelance projects, custom development, and contract assignments."}
        </p>

        {/* Skills Pills */}
        {freelancer.skills?.length > 0 && (
          <div className="mb-1">
            {/* Mobile: single row, first 3 pills + overflow count */}
            <div className="flex sm:hidden items-center gap-1.5 flex-nowrap overflow-hidden">
              {freelancer.skills.slice(0, 3).map((skill) => (
                <span key={skill} className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-normal text-xs whitespace-nowrap flex-shrink-0">
                  {skill}
                </span>
              ))}
              {freelancer.skills.length > 3 && (
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-normal text-xs whitespace-nowrap flex-shrink-0">
                  +{freelancer.skills.length - 3}
                </span>
              )}
            </div>
            {/* Desktop: show all skills, wrapping freely */}
            <div className="hidden sm:flex flex-wrap items-center gap-1.5">
              {freelancer.skills.map((skill) => (
                <span key={skill} className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-normal text-xs">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer / Actions */}
      <div className="mt-auto pt-3">
        <div className="border-t border-slate-100 mb-3" />
        <div className="flex flex-col gap-2.5">
          {/* Badges row */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex flex-wrap items-center gap-1.5">
              {freelancer.title && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#eef2ff] text-[#1e3a5f] text-xs font-medium">
                  {freelancer.title}
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-full border border-blue-200 text-[#1e3a5f] text-xs font-medium">
                Freelancer
              </span>

            </div>
          </div>

          {/* Bottom: success rate + actions */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-slate-400 font-normal">
              100% Job Success
            </span>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              {onToggleSave && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (session?.user?.role === "jobseeker") {
                      toastError(
                        "Please login as an employer first to shortlist freelancers"
                      );
                      return;
                    }
                    onToggleSave(freelancer._id);
                  }}
                  aria-label={saved ? "Remove from saved" : "Save freelancer"}
                  className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-amber-500 hover:border-amber-200 transition-colors flex items-center justify-center flex-shrink-0"
                >
                  <Bookmark
                    size={16}
                    className={cn(saved && "fill-amber-500 text-amber-500")}
                  />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (session?.user?.role === "jobseeker") {
                    toastError(
                      "Please login as an employer first to hire freelancers"
                    );
                    return;
                  }
                  onHire(freelancer);
                }}
                className="px-4 py-1.5 rounded-xl bg-[#1e3a5f] hover:bg-[#152a45] active:scale-[0.98] text-white text-xs sm:text-sm font-medium transition-all shadow-xs"
              >
                Hire Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
