"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { adminApi } from "@/lib/api";
import { User } from "@/types";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { TableRowSkeleton } from "@/components/ui/Skeleton";
import { AdminUserDrawer } from "@/components/admin/AdminUserDrawer";
import { useToast } from "@/components/ui/Toast";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Search,
  Check,
  Eye,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

const PAGE_LIMIT = 10;

export default function AdminVerificationsPage() {
  const { data: session } = useSession();
  const { success, error } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Drawer review state
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const fetchVerifications = useCallback(async () => {
    if (!session?.user.accessToken) return;
    setLoading(true);
    try {
      const res = (await adminApi.getVerifications(session.user.accessToken, {
        status: statusFilter,
        page: String(page),
        limit: String(PAGE_LIMIT),
      })) as {
        data: User[];
        pagination?: { total: number; pages: number };
      };
      setUsers(res.data || []);
      setTotal(res.pagination?.total ?? (res.data?.length || 0));
      setTotalPages(res.pagination?.pages ?? 1);
    } catch (err) {
      error("Failed to load verification requests");
    } finally {
      setLoading(false);
    }
  }, [session, statusFilter, page]);

  useEffect(() => {
    fetchVerifications();
  }, [fetchVerifications]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, search]);

  const handleRevokeBadge = async (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!session?.user.accessToken) return;
    try {
      await adminApi.updateUserVerification(session.user.accessToken, userId, {
        isVerified: false,
        verificationStatus: "none",
        verificationNote: "Badge revoked by Admin",
      });
      success("Badge revoked");
      fetchVerifications();
    } catch (err) {
      error("Failed to revoke badge");
    }
  };

  const filteredUsers = search.trim()
    ? users.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          (u.company && u.company.toLowerCase().includes(search.toLowerCase())) ||
          u.email.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Badge & Verification Approvals</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Review business credentials in a 2-step audit drawer to assign "Verified Employer" or "Verified Freelancer" badges.
          </p>
        </div>
        <button
          onClick={fetchVerifications}
          className="flex items-center gap-1.5 text-xs text-gray-600 bg-white border border-gray-200 px-3.5 py-2 rounded-xl hover:bg-gray-50 transition-all shadow-xs cursor-pointer"
        >
          <RefreshCw size={13} /> Refresh List
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex w-full sm:w-fit gap-1 p-1 bg-gray-100 rounded-xl">
          {["all", "pending", "approved", "rejected"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={cn(
                "flex-1 sm:flex-initial px-2.5 sm:px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all text-center whitespace-nowrap",
                statusFilter === st
                  ? "bg-[#1e3a5f] text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, company, email..."
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 font-medium"
          />
        </div>
      </div>

      {/* Table List Container */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-slate-50/70 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-3.5">User / Company</th>
                <th className="px-4 py-3.5">Account Type</th>
                <th className="px-4 py-3.5">Title / Role</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Joined Date</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-6 py-4">
                      <TableRowSkeleton />
                    </td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center space-y-2">
                    <ShieldCheck size={36} className="mx-auto text-gray-300" />
                    <p className="text-sm font-semibold text-gray-700">No verification requests found</p>
                    <p className="text-xs text-gray-400">Users requesting badge approvals will appear here.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const displayName = user.company || user.name;
                  return (
                    <tr
                      key={user._id}
                      onClick={() => setSelectedUserId(user._id)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      {/* User / Company */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={displayName} src={user.avatar} size="sm" />
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                              {displayName}
                            </p>
                            <p className="text-xs text-gray-400 truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Account Type */}
                      <td className="px-4 py-4">
                        <Badge
                          variant={
                            user.role === "employer"
                              ? "info"
                              : user.role === "admin"
                              ? "danger"
                              : "success"
                          }
                          className="capitalize font-semibold text-[11px]"
                        >
                          {user.role}
                        </Badge>
                      </td>

                      {/* Title */}
                      <td className="px-4 py-4 font-medium text-slate-700 max-w-[180px] truncate">
                        {user.title || "—"}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        {user.isVerified ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full">
                            <CheckCircle2 size={12} /> Verified
                          </span>
                        ) : user.verificationStatus === "rejected" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200/80 px-2.5 py-1 rounded-full">
                            <XCircle size={12} /> Rejected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-full">
                            <Clock size={12} /> Pending
                          </span>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="px-4 py-4 text-slate-500 font-normal">
                        {user.createdAt ? formatDate(user.createdAt) : "—"}
                      </td>

                      {/* Step 1 Actions */}
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          {!user.isVerified ? (
                            <Button
                              size="sm"
                              onClick={() => setSelectedUserId(user._id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-xs py-1.5 px-3 rounded-xl gap-1.5 font-semibold shadow-2xs"
                            >
                              <Eye size={13} /> Grant Badge (Review)
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => handleRevokeBadge(user._id, e)}
                              className="text-xs text-rose-600 hover:bg-rose-50 border-rose-200 rounded-xl"
                            >
                              Revoke Badge
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-gray-100">
          <Pagination
            page={page}
            pages={totalPages}
            total={total}
            limit={PAGE_LIMIT}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* Step 2: Audit & Confirm Drawer */}
      <AdminUserDrawer
        userId={selectedUserId}
        onClose={() => setSelectedUserId(null)}
        onUserUpdated={fetchVerifications}
      />
    </div>
  );
}
