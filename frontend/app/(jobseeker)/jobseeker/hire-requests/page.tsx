"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { hireRequestsApi } from "@/lib/api";
import { HireRequest } from "@/types";
import { HireRequestsList } from "@/components/jobseeker/HireRequests";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/ui/Pagination";

const PAGE_LIMIT = 10;

export default function HireRequestsPage() {
  const { data: session, status } = useSession();
  const [requests, setRequests] = useState<HireRequest[]>([]);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]           = useState(0);

  const fetchRequests = useCallback(async () => {
    if (!session?.user.accessToken) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = (await hireRequestsApi.getMy(
        session.user.accessToken,
        { page: String(page), limit: String(PAGE_LIMIT) }
      )) as { data: HireRequest[]; pagination: { page: number; pages: number; total: number } };
      setRequests(res.data || []);
      if (res.pagination) {
        setTotalPages(res.pagination.pages);
        setTotal(res.pagination.total);
      }
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [session, page]);

  useEffect(() => {
    if (status === "loading") return;
    fetchRequests();
  }, [fetchRequests, status]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Hire Requests</h2>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : (
          <>
            <HireRequestsList requests={requests} onUpdate={fetchRequests} />
            <Pagination
              page={page}
              pages={totalPages}
              total={total}
              limit={PAGE_LIMIT}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
