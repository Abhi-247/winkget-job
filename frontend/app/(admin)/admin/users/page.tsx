"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { adminApi } from "@/lib/api";
import { User } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TableRowSkeleton } from "@/components/ui/Skeleton";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { Search } from "lucide-react";

const PAGE_LIMIT = 20;

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const { success, error } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [toggling, setToggling] = useState<string | null>(null);
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]           = useState(0);

  const fetchUsers = useCallback(async () => {
    if (!session?.user.accessToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: String(PAGE_LIMIT) };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const res = (await adminApi.getUsers(session.user.accessToken, params)) as {
        data: User[];
        pagination: { page: number; pages: number; total: number };
      };
      setUsers(res.data || []);
      if (res.pagination) {
        setTotalPages(res.pagination.pages);
        setTotal(res.pagination.total);
      }
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [session, search, roleFilter, page]);

  useEffect(() => {
    if (status === "loading") return;
    const debounce = setTimeout(fetchUsers, 300);
    return () => clearTimeout(debounce);
  }, [fetchUsers, status]);

  // Reset to page 1 on filter change
  useEffect(() => { setPage(1); }, [search, roleFilter]);

  const handleToggle = async (userId: string) => {
    if (!session?.user.accessToken) return;
    setToggling(userId);
    try {
      await adminApi.toggleUserStatus(session.user.accessToken, userId);
      success("User status updated");
      fetchUsers();
    } catch {
      error("Failed to update user");
    } finally {
      setToggling(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-900">Users</h2>
        <div className="flex gap-2">
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search size={15} />}
            className="w-48"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
          >
            <option value="">All Roles</option>
            <option value="jobseeker">Job Seekers</option>
            <option value="employer">Employers</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Joined</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} cols={5} />)
                : users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={user.name} size="sm" />
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <Badge variant={user.role === "employer" ? "info" : user.role === "admin" ? "danger" : "success"}>{user.role}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={user.isActive ? "success" : "danger"}>{user.isActive ? "Active" : "Banned"}</Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs hidden md:table-cell">{formatDate(user.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant={user.isActive ? "danger" : "secondary"}
                          onClick={() => handleToggle(user._id)}
                          loading={toggling === user._id}
                        >
                          {user.isActive ? "Ban" : "Activate"}
                        </Button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
          {!loading && users.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">No users found.</div>
          )}
        </div>
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
    </div>
  );
}
