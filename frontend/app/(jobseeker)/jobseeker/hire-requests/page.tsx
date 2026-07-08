"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { hireRequestsApi } from "@/lib/api";
import { HireRequest } from "@/types";
import { HireRequestsList } from "@/components/jobseeker/HireRequests";
import { CardSkeleton } from "@/components/ui/Skeleton";

export default function HireRequestsPage() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState<HireRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    if (!session?.user.accessToken) return;
    setLoading(true);
    try {
      const res = (await hireRequestsApi.getMy(session.user.accessToken)) as {
        data: HireRequest[];
      };
      setRequests(res.data || []);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Hire Requests</h2>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : (
          <HireRequestsList requests={requests} onUpdate={fetchRequests} />
        )}
      </div>
    </div>
  );
}
