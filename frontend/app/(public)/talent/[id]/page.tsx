"use client";

import { use, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { freelancersApi } from "@/lib/api";
import { User } from "@/types";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StarRating } from "@/components/ui/StarRating";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { HireRequestModal } from "@/components/talent/HireRequestModal";
import { SendMessageModal } from "@/components/talent/SendMessageModal";
import { useSavedJobs } from "@/lib/hooks";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import Link from "next/link";
import {
  MapPin, ChevronRight, Briefcase, Clock,
  Languages, Bookmark, Share2, Copy,
  CheckCircle, ExternalLink, Star,
} from "lucide-react";

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <Card>
            <div className="h-28 bg-gray-200 rounded-t-xl animate-pulse" />
            <CardBody className="pt-12 space-y-3">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-64" />
            </CardBody>
          </Card>
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardBody className="space-y-2">
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
                <Skeleton className="h-3 w-3/5" />
              </CardBody>
            </Card>
          ))}
        </div>
        <div className="w-full lg:w-72 space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardBody className="space-y-3">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Meta row ─────────────────────────────────────────────────────────────────

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-400 font-medium">{label}</span>
      <span className="text-sm text-gray-800 font-medium text-right max-w-[60%] truncate">
        {value}
      </span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface Props { params: Promise<{ id: string }> }

export default function FreelancerProfilePage({ params }: Props) {
  const { id }         = use(params);
  const { data: session } = useSession();
  const router         = useRouter();
  const { success, error: toastError } = useToast();
  const { isSaved, toggleSave } = useSavedJobs();

  const [freelancer,      setFreelancer]      = useState<User | null>(null);
  const [loading,         setLoading]         = useState(true);
  const [hireTarget,      setHireTarget]      = useState<User | null>(null);
  const [messageTarget,   setMessageTarget]   = useState<User | null>(null);

  useEffect(() => {
    setLoading(true);
    freelancersApi.getById(id)
      .then((res) => {
        const data = (res as { success: boolean; data: User }).data;
        setFreelancer(data);
      })
      .catch(() => setFreelancer(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    success("Profile link copied!");
  };

  if (loading)   return <ProfileSkeleton />;
  if (!freelancer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
        <p className="text-gray-400 mb-4">Freelancer not found.</p>
        <Link href="/talent">
          <Button variant="outline">Back to Talent</Button>
        </Link>
      </div>
    );
  }

  const isAvailable = freelancer.availability === "Immediately";
  const saved       = isSaved(freelancer._id);

  return (
    <div className="min-h-screen bg-gray-50 font-[family-name:var(--font-poppins)]">

      {/* ── Breadcrumb bar ── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-1.5 text-xs text-gray-500 flex-wrap">
            <Link href="/"       className="hover:text-gray-700">Home</Link>
            <ChevronRight size={11} className="opacity-40" />
            <Link href="/talent" className="hover:text-gray-700">Hire Talent</Link>
            <ChevronRight size={11} className="opacity-40" />
            <span className="text-gray-800 font-medium truncate max-w-[180px]">
              {freelancer.name}
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ══ LEFT PANEL ══════════════════════════════════════════════════ */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* Profile card */}
            <Card className="overflow-hidden">
              {/* Banner */}
              <div className="h-28 sm:h-36 bg-gradient-to-r from-[#1e3a5f] via-[#1e4a7a] to-[#2d5282] relative" />

              <CardBody className="pt-0 -mt-10 relative">
                {/* Avatar overlapping banner */}
                <div className="flex items-end justify-between mb-4">
                  <div className="ring-4 ring-white rounded-full">
                    <Avatar name={freelancer.name} src={freelancer.avatar} size="xl" />
                  </div>
                  <div className="flex items-center gap-2 pb-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        if (session?.user?.role === "jobseeker") {
                          toastError("Please login as an employer first to shortlist freelancers");
                          return;
                        }
                        toggleSave(freelancer._id);
                      }}
                      className={cn(saved && "text-amber-600")}
                    >
                      <Bookmark size={13} className={cn("mr-1", saved && "fill-amber-500 text-amber-500")} />
                      {saved ? "Saved" : "Save"}
                    </Button>
                    <Button size="sm" variant="secondary" onClick={handleCopyLink}>
                      <Share2 size={13} className="mr-1" /> Share
                    </Button>
                  </div>
                </div>

                {/* Name + badges */}
                <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 leading-tight">
                      {freelancer.name}
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {freelancer.title || "Freelancer"}
                    </p>
                  </div>
                  {isAvailable && (
                    <Badge variant="success" className="flex-shrink-0 flex items-center gap-1">
                      <CheckCircle size={11} /> Available
                    </Badge>
                  )}
                </div>

                {/* Rating + location */}
                <div className="flex items-center gap-4 flex-wrap mb-4">
                  <StarRating rating={0} count={0} size="md" />
                  {freelancer.location && (
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <MapPin size={13} /> {freelancer.location}
                    </span>
                  )}
                  {freelancer.yearsOfExperience !== undefined && (
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <Briefcase size={13} />
                      {freelancer.yearsOfExperience} yr{freelancer.yearsOfExperience !== 1 ? "s" : ""} exp
                    </span>
                  )}
                </div>

                {/* Stats strip */}
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
                  {[
                    { label: "Jobs Done",   value: "0"    },
                    { label: "Success Rate", value: "100%" },
                    { label: "Response",    value: "< 1h" },
                  ].map(({ label, value }) => (
                    <div key={label} className="text-center">
                      <p className="text-lg font-bold text-[#1e3a5f]">{value}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* About */}
            {freelancer.bio && (
              <Card>
                <CardHeader>
                  <h2 className="text-base font-semibold text-gray-900">About</h2>
                </CardHeader>
                <CardBody>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {freelancer.bio}
                  </p>
                </CardBody>
              </Card>
            )}

            {/* Skills */}
            {freelancer.skills?.length > 0 && (
              <Card>
                <CardHeader>
                  <h2 className="text-base font-semibold text-gray-900">Skills</h2>
                </CardHeader>
                <CardBody>
                  <div className="flex flex-wrap gap-2">
                    {freelancer.skills.map((skill) => (
                      <Badge key={skill} variant="outline" className="px-3 py-1 text-sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Portfolio */}
            <Card>
              <CardHeader className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">Portfolio Highlights</h2>
                <span className="text-xs text-gray-400">Coming soon</span>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-24 bg-gray-100 rounded-xl flex items-center justify-center text-gray-300 text-xs border border-gray-200 border-dashed"
                    >
                      Portfolio item {i}
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">Client Reviews</h2>
                <StarRating rating={5} count={1} size="sm" />
              </CardHeader>
              <CardBody>
                <div className="flex items-start gap-3">
                  <Avatar name="Employer" size="sm" className="flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">Sample Employer</span>
                      <StarRating rating={5} size="sm" />
                    </div>
                    <p className="text-xs text-gray-400 mb-1.5">Web Development · 1 month ago</p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      "Excellent work delivered on time. Very professional and communicative throughout the project."
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* ══ RIGHT SIDEBAR ════════════════════════════════════════════════ */}
          <div className="w-full lg:w-72 flex-shrink-0 space-y-4 lg:sticky lg:top-6">

            {/* Rate + CTA card */}
            <Card>
              <CardBody className="space-y-3">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {freelancer.hourlyRate
                      ? `${formatCurrency(freelancer.hourlyRate)}/hr`
                      : "Rate on request"}
                  </p>
                  {isAvailable && (
                    <p className="flex items-center gap-1.5 text-sm text-green-600 mt-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full inline-block" />
                      Available for new projects
                    </p>
                  )}
                </div>

                <Button
                  fullWidth
                  onClick={() => {
                    if (session?.user?.role === "jobseeker") {
                      toastError("Please login as an employer first to hire freelancers");
                      return;
                    }
                    setHireTarget(freelancer);
                  }}
                >
                  Hire Me
                </Button>
                <Button
                  fullWidth
                  variant="outline"
                  onClick={() => {
                    if (!session) {
                      router.push(`/sign-in?callbackUrl=/talent/${id}`);
                      return;
                    }
                    if (session.user.role === "jobseeker") {
                      toastError("Please login as an employer first to message freelancers");
                      return;
                    }
                    setMessageTarget(freelancer);
                  }}
                >
                  Send Message
                </Button>
                <Button
                  fullWidth
                  variant="ghost"
                  onClick={() => {
                    if (session?.user?.role === "jobseeker") {
                      toastError("Please login as an employer first to shortlist freelancers");
                      return;
                    }
                    toggleSave(freelancer._id);
                  }}
                  className={cn(saved && "text-amber-600 hover:bg-amber-50")}
                >
                  <Bookmark
                    size={15}
                    className={cn("mr-1.5", saved && "fill-amber-500 text-amber-500")}
                  />
                  {saved ? "Saved to Shortlist" : "Save to Shortlist"}
                </Button>
              </CardBody>
            </Card>

            {/* Meta info card */}
            <Card>
              <CardBody className="py-3">
                <MetaRow
                  label="Experience"
                  value={
                    freelancer.yearsOfExperience !== undefined
                      ? `${freelancer.yearsOfExperience} year${freelancer.yearsOfExperience !== 1 ? "s" : ""}`
                      : "Not specified"
                  }
                />
                <MetaRow
                  label="Availability"
                  value={freelancer.availability || "Not specified"}
                />
                <MetaRow
                  label="Location"
                  value={freelancer.location || "Remote"}
                />
                <MetaRow label="Response Time" value="< 1 hour" />
                <MetaRow label="Languages"     value="English, Hindi" />
                <MetaRow
                  label="Member Since"
                  value={formatDate(freelancer.createdAt)}
                />
              </CardBody>
            </Card>

            {/* Share card */}
            <Card>
              <CardHeader>
                <h3 className="text-sm font-semibold text-gray-900">Share Profile</h3>
              </CardHeader>
              <CardBody className="pt-2 flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 flex-1"
                  onClick={() => {
                    window.open(
                      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
                      "_blank"
                    );
                  }}
                >
                  <ExternalLink size={12} /> LinkedIn
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 flex-1"
                  onClick={() => {
                    window.open(
                      `https://wa.me/?text=${encodeURIComponent(`Check out this freelancer: ${window.location.href}`)}`,
                      "_blank"
                    );
                  }}
                >
                  <Share2 size={12} /> WhatsApp
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 w-full"
                  onClick={handleCopyLink}
                >
                  <Copy size={12} /> Copy Link
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <HireRequestModal
        freelancer={hireTarget}
        onClose={() => setHireTarget(null)}
      />
      <SendMessageModal
        freelancer={messageTarget}
        onClose={() => setMessageTarget(null)}
      />
    </div>
  );
}
