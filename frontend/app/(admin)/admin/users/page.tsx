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
import { AdminUserDrawer } from "@/components/admin/AdminUserDrawer";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { Search, Eye, Trash2 } from "lucide-react";

const PAGE_LIMIT = 20;

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const { success, error } = useToast();
  const [users, setUsers]         = useState<User[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [toggling, setToggling]   = useState<string | null>(null);
  const [deleting, setDeleting]   = useState<string | null>(null);
  const [drawerUserId, setDrawerUserId] = useState<string | null>(null);
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]           = useState(0);

  const fetchUsers = useCallback(async () => {
    if (!session?.user.accessToken) { setLoading(false); return; }
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: String(PAGE_LIMIT) };
      if (search)     params.search = search;
      if (roleFilter) params.role   = roleFilter;
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
    const t = setTimeout(fetchUsers, 300);
    return () => clearTimeout(t);
  }, [fetchUsers, status]);

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

  const handleDelete = async (userId: string, name: string) => {
    if (!session?.user.accessToken) return;
    if (!confirm(`Delete ${name} and all their data? This cannot be undone.`)) return;
    setDeleting(userId);
    try {
      await adminApi.deleteUser(session.user.accessToken, userId);
      success("User deleted");
      fetchUsers();
    } catch {
      error("Failed to delete user");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Users</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {total > 0 ? `${total} total users` : "Manage all platform users"}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
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
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Title / Company</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Joined</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />)
                : users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={user.name} src={user.avatar} size="sm" />
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{user.name}</p>
                            <p className="text-xs text-gray-400 truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <Badge variant={user.role === "employer" ? "info" : user.role === "admin" ? "danger" : "success"}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell max-w-[160px] truncate">
                        {user.company || user.title || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={user.isActive ? "success" : "danger"}>
                          {user.isActive ? "Active" : "Banned"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-[#1e3a5f] border-[#1e3a5f]/30 hover:bg-[#edf2f7]"
                            onClick={() => setDrawerUserId(user._id)}
                          >
                            <Eye size={13} />
                            <span className="hidden sm:inline">Profile</span>
                          </Button>
                          <Button
                            size="sm"
                            variant={user.isActive ? "danger" : "secondary"}
                            onClick={() => handleToggle(user._id)}
                            loading={toggling === user._id}
                          >
                            {user.isActive ? "Ban" : "Activate"}
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete(user._id, user.name)}
                            loading={deleting === user._id}
                            className="gap-1"
                          >
                            <Trash2 size={13} />
                          </Button>
                        </div>
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
          <Pagination page={page} pages={totalPages} total={total} limit={PAGE_LIMIT} onPageChange={setPage} />
        </div>
      </div>

      <AdminUserDrawer
        userId={drawerUserId}
        onClose={() => setDrawerUserId(null)}
        onUserUpdated={fetchUsers}
      />
    </div>
  );
}
