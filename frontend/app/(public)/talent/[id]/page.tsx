"use client";

import { use, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { freelancersApi, reviewsApi, hireRequestsApi } from "@/lib/api";
import { User } from "@/types";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { HireRequestModal } from "@/components/talent/HireRequestModal";
import { SendMessageModal } from "@/components/talent/SendMessageModal";
import { TalentProfileOverview } from "@/components/talent/TalentProfileOverview";
import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default function FreelancerProfilePage({ params }: Props) {
  const { id } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const { error: toastError } = useToast();

  const [freelancer, setFreelancer] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hireTarget, setHireTarget] = useState<User | null>(null);
  const [messageTarget, setMessageTarget] = useState<User | null>(null);
  const [hireRequestSent, setHireRequestSent] = useState(false);

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

  useEffect(() => {
    if (!freelancer || !session?.user?.accessToken || session?.user?.role !== "employer") return;
    hireRequestsApi.getEmployerRequests(session.user.accessToken)
      .then((res: any) => {
        if (res.success && res.data) {
          const hasRequest = res.data.some((req: any) =>
            req.jobseeker._id === id
          );
          setHireRequestSent(hasRequest);
        }
      })
      .catch(() => setHireRequestSent(false));
  }, [freelancer, id, session]);

  const handleHireRequestSent = () => {
    setHireRequestSent(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#1e3a5f] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading User Profile...</p>
        </div>
      </div>
    );
  }

  if (!freelancer) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="text-center bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-md">
          <Sparkles size={40} className="mx-auto text-slate-400 mb-3" />
          <h2 className="text-lg font-bold text-slate-900 mb-1">User Not Found</h2>
          <p className="text-sm text-slate-500 mb-4">The profile you are looking for does not exist.</p>
          <Link href="/talent">
            <Button variant="outline" size="sm">Browse Talent</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16">
      {/* ── BREADCRUMB ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/" className="hover:text-slate-800 transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link href="/talent" className="hover:text-slate-800 transition-colors">Talent Pool</Link>
            <ChevronRight size={12} />
            <span className="text-slate-900 font-medium truncate max-w-[200px]">{freelancer.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <TalentProfileOverview
          user={freelancer}
          isOwner={session?.user?.id === freelancer._id}
          isEmployer={session?.user?.role === "employer"}
          onHire={() => {
            if (!session) {
              router.push(`/sign-in?callbackUrl=/talent/${id}`);
              return;
            }
            if (session.user.role !== "employer") {
              toastError("Please log in as an employer to hire talent");
              return;
            }
            setHireTarget(freelancer);
          }}
          onMessage={() => {
            if (!session) {
              router.push(`/sign-in?callbackUrl=/talent/${id}`);
              return;
            }
            setMessageTarget(freelancer);
          }}
          hireRequestSent={hireRequestSent}
        />
      </div>

      {/* Modals */}
      {hireTarget && (
        <HireRequestModal
          freelancer={hireTarget}
          onClose={() => setHireTarget(null)}
          onSuccess={handleHireRequestSent}
        />
      )}

      {messageTarget && (
        <SendMessageModal
          freelancer={messageTarget}
          onClose={() => setMessageTarget(null)}
        />
      )}
    </div>
  );
}
