"use client";

import Link from "next/link";
import { MapPin, Bookmark } from "lucide-react";
import { User } from "@/types";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
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
  const { data: session } = useSession();
  const { error: toastError } = useToast();
  const isAvailable = freelancer.availability === "Immediately";

  return (
    <Card hover className="flex flex-col overflow-hidden">
      <Link
        href={`/talent/${freelancer._id}`}
        className="flex flex-col flex-1 p-5"
        tabIndex={-1}
        aria-label={`View ${freelancer.name}'s profile`}
      >
        {/* ── Top badge row ── */}
        <div className="flex items-center gap-1.5 flex-wrap mb-4">
          <Badge variant="warning">★ Top Rated</Badge>
          <Badge variant="success">✓ Verified</Badge>
          {isAvailable && (
            <Badge variant="success" className="ml-auto bg-green-100 text-green-700">
              Available
            </Badge>
          )}
        </div>

        {/* ── Profile row ── */}
        <div className="flex items-start gap-3 mb-3">
          <Avatar name={freelancer.name} src={freelancer.avatar} size="md" className="flex-shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 truncate leading-tight">
              {freelancer.name}
            </p>
            <p className="text-xs text-gray-500 truncate mt-0.5">
              {freelancer.title || "Freelancer"}
            </p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <StarRating rating={freelancer.ratingAvg || 0} count={freelancer.ratingCount || 0} size="sm" />
              {freelancer.location && (
                <span className="flex items-center gap-0.5 text-xs text-gray-400">
                  <MapPin size={10} />
                  {freelancer.location}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Bio ── */}
        <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed flex-1">
          {freelancer.bio || "No bio provided."}
        </p>

        {/* ── Skills ── */}
        {freelancer.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {freelancer.skills.slice(0, 3).map((skill) => (
              <Badge key={skill} variant="outline" className="text-[11px]">
                {skill}
              </Badge>
            ))}
            {freelancer.skills.length > 3 && (
              <Badge variant="default" className="text-[11px]">
                +{freelancer.skills.length - 3}
              </Badge>
            )}
          </div>
        )}
      </Link>

      {/* ── Footer ── */}
      <div className="px-5 pb-5 pt-0 flex items-center justify-between gap-3 border-t border-gray-100 mt-auto pt-4">
        <div>
          <span className="text-sm font-bold text-gray-900">
            {freelancer.hourlyRate
              ? `${formatCurrency(freelancer.hourlyRate)}/hr`
              : "Rate on request"}
          </span>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {freelancer.ratingCount || 0} reviews · 100% success
          </p>
        </div>
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
              className={cn(saved && "text-amber-600")}
            >
              <Bookmark size={13} className={cn(saved && "fill-amber-500 text-amber-500")} />
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
          >
            Hire Now
          </Button>
        </div>
      </div>
    </Card>
  );
}
