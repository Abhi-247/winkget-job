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
import {
  Search,
  Eye,
  Trash2,
  Users,
  Briefcase,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";

const PAGE_LIMIT = 20;

type RoleTab = "all" | "jobseeker" | "employer";

const ROLE_TABS: { key: RoleTab; label: string; icon: React.ElementType }[] = [
  { key: "all", label: "All Users", icon: LayoutGrid },
  { key: "jobseeker", label: "Job Seekers", icon: Users },
  { key: "employer", label: "Employers", icon: Briefcase },
];

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const { success, error } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<RoleTab>("all");
  const [toggling, setToggling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [drawerUserId, setDrawerUserId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Derive the role filter from the active tab
  const roleFilter = activeTab === "all" ? "" : activeTab;

  const fetchUsers = useCallback(async () => {
    if (!session?.user.accessToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: String(page),
        limit: String(PAGE_LIMIT),
      };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const res = (await adminApi.getUsers(
        session.user.accessToken,
        params,
      )) as {
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

  useEffect(() => {
    setPage(1);
  }, [search, activeTab]);

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

  const handleDelete = async (userId: string) => {
    if (!session?.user.accessToken) return;
    setDeleting(userId);
    try {
      await adminApi.deleteUser(session.user.accessToken, userId);
      success("User deleted");
      setDeleteTarget(null);
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
            {total > 0
              ? `${total} ${activeTab === "all" ? "total users" : activeTab === "jobseeker" ? "job seekers" : "employers"}`
              : "Manage all platform users"}
          </p>
        </div>
        <Input
          placeholder={`Search ${activeTab === "employer" ? "employers" : "users"}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search size={15} />}
          className="w-full sm:w-52"
        />
      </div>

      {/* Role Tabs */}
      <div className="flex w-full gap-1 overflow-x-auto p-1 bg-gray-100 rounded-xl sm:w-fit">
        {ROLE_TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex min-w-max items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                activeTab === tab.key
                  ? "bg-white text-[#1e3a5f] shadow-sm"
                  : "text-gray-500 hover:text-gray-700",
              )}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="sm:hidden divide-y divide-gray-100">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse bg-gray-50" />
              ))
            : users.map((user) => (
                <div key={user._id} className="space-y-3 p-4">
                  <div className="flex items-start gap-3">
                    <Avatar name={user.name} src={user.avatar} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-gray-900">
                        {user.name}
                      </p>
                      <p className="truncate text-xs text-gray-400">
                        {user.email}
                      </p>
                      <p className="mt-1 text-xs capitalize text-gray-500">
                        {user.company || user.title || user.role}
                      </p>
                    </div>
                    <Badge variant={user.isActive ? "success" : "danger"}>
                      {user.isActive ? "Active" : "Banned"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 text-[#1e3a5f]"
                      onClick={() => setDrawerUserId(user._id)}
                    >
                      <Eye size={13} /> Profile
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
                      onClick={() =>
                        setDeleteTarget({ id: user._id, name: user.name })
                      }
                      loading={deleting === user._id}
                      aria-label={`Delete ${user.name}`}
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </div>
              ))}
          {!loading && users.length === 0 && (
            <div className="p-8 text-center text-sm text-gray-400">
              No users found.
            </div>
          )}
        </div>
        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  User
                </th>
                {activeTab === "all" && (
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">
                    Role
                  </th>
                )}
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">
                  {activeTab === "employer" ? "Company" : "Title / Company"}
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">
                  Joined
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <TableRowSkeleton
                      key={i}
                      cols={activeTab === "all" ? 6 : 5}
                    />
                  ))
                : users.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={user.name}
                            src={user.avatar}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {user.name}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      {activeTab === "all" && (
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <Badge
                            variant={
                              user.role === "employer"
                                ? "info"
                                : user.role === "admin"
                                  ? "danger"
                                  : "success"
                            }
                          >
                            {user.role}
                          </Badge>
                        </td>
                      )}
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
                            onClick={() =>
                              setDeleteTarget({ id: user._id, name: user.name })
                            }
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
            <div className="text-center py-12 text-gray-400 text-sm">
              {activeTab === "employer"
                ? "No employers found."
                : activeTab === "jobseeker"
                  ? "No job seekers found."
                  : "No users found."}
            </div>
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

      <AdminUserDrawer
        userId={drawerUserId}
        onClose={() => setDrawerUserId(null)}
        onUserUpdated={fetchUsers}
      />

      <ConfirmDeleteModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) await handleDelete(deleteTarget.id);
        }}
        title={`Delete ${deleteTarget?.name ?? "user"}?`}
        description="This will permanently delete the user and all their jobs, applications, and data. This cannot be undone."
        confirmPhrase="delete"
        loading={!!deleting}
      />
    </div>
  );
}
