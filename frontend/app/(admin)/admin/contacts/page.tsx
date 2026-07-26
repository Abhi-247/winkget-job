"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { contactApi } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { TableRowSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import {
  Mail,
  Phone,
  MessageSquare,
  RefreshCw,
  Search,
  X,
  Check,
  Clock,
  Trash2,
  ChevronRight,
  CheckCircle2,
  Inbox,
  XCircle,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

interface ContactRequest {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  inquiryType: string;
  subject: string;
  message: string;
  status: "new" | "in-progress" | "resolved" | "closed";
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

const PAGE_LIMIT = 15;

const STATUS_MAP: Record<string, { label: string; variant: "info" | "warning" | "success" | "danger"; icon: React.ElementType }> = {
  new:           { label: "New",         variant: "info",    icon: Inbox },
  "in-progress": { label: "In Progress", variant: "warning", icon: Clock },
  resolved:      { label: "Resolved",    variant: "success", icon: CheckCircle2 },
  closed:        { label: "Closed",      variant: "danger",  icon: XCircle },
};

export default function AdminContactPage() {
  const { data: session } = useSession();
  const { success, error } = useToast();

  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Drawer state
  const [selected, setSelected] = useState<ContactRequest | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchRequests = useCallback(async () => {
    if (!session?.user.accessToken) return;
    setLoading(true);
    try {
      const res = (await contactApi.getAll(session.user.accessToken, {
        status: statusFilter,
        page: String(page),
        limit: String(PAGE_LIMIT),
      })) as { data: ContactRequest[]; pagination?: { total: number; pages: number } };
      setRequests(res.data || []);
      setTotal(res.pagination?.total ?? (res.data?.length || 0));
      setTotalPages(res.pagination?.pages ?? 1);
    } catch {
      error("Failed to load contact requests");
    } finally {
      setLoading(false);
    }
  }, [session, statusFilter, page]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    if (!session?.user.accessToken) return;
    setUpdatingStatus(true);
    try {
      const res = (await contactApi.update(session.user.accessToken, id, {
        status: newStatus,
        adminNote: adminNote.trim() || undefined,
      })) as { data: ContactRequest };
      success(`Status updated to "${newStatus}"`);
      setSelected(res.data);
      fetchRequests();
    } catch {
      error("Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!session?.user.accessToken || !confirm("Delete this contact request permanently?")) return;
    try {
      await contactApi.delete(session.user.accessToken, id);
      success("Contact request deleted");
      setSelected(null);
      fetchRequests();
    } catch {
      error("Failed to delete request");
    }
  };

  const filteredRequests = search.trim()
    ? requests.filter(
        (r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.email.toLowerCase().includes(search.toLowerCase()) ||
          r.subject.toLowerCase().includes(search.toLowerCase())
      )
    : requests;

  const isDrawerOpen = !!selected;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Contact Requests</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Review and respond to messages submitted from the Contact Us page.
          </p>
        </div>
        <button
          onClick={fetchRequests}
          className="flex items-center gap-1.5 text-xs text-gray-600 bg-white border border-gray-200 px-3.5 py-2 rounded-xl hover:bg-gray-50 transition-all shadow-xs cursor-pointer"
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex w-full sm:w-fit gap-1 p-1 bg-gray-100 rounded-xl">
          {["all", "new", "in-progress", "resolved", "closed"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={cn(
                "flex-1 sm:flex-initial px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all text-center whitespace-nowrap",
                statusFilter === st
                  ? "bg-[#1e3a5f] text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {st === "in-progress" ? "In Progress" : st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, subject..."
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 font-medium"
          />
        </div>
      </div>

      {/* Table & Mobile List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {/* Mobile View */}
        <div className="sm:hidden divide-y divide-gray-100">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 h-24 animate-pulse bg-gray-50" />
            ))
          ) : filteredRequests.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <Inbox size={32} className="mx-auto text-gray-300" />
              <p className="text-sm font-semibold text-gray-700">No contact requests found</p>
            </div>
          ) : (
            filteredRequests.map((req) => {
              const st = STATUS_MAP[req.status] || STATUS_MAP.new;
              return (
                <div
                  key={req._id}
                  onClick={() => {
                    setSelected(req);
                    setAdminNote(req.adminNote || "");
                  }}
                  className="p-4 space-y-2 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-gray-900 truncate">{req.name}</p>
                      <p className="text-xs text-gray-400 truncate">{req.email}</p>
                    </div>
                    <Badge variant={st.variant} className="capitalize text-[10px] font-bold gap-1 flex-shrink-0">
                      <st.icon size={10} /> {st.label}
                    </Badge>
                  </div>
                  
                  <p className="text-xs font-semibold text-slate-700 truncate">{req.subject}</p>
                  
                  <div className="flex items-center justify-between gap-2 pt-1 text-[11px] text-gray-400">
                    <span className="font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full truncate max-w-[180px]">
                      {req.inquiryType}
                    </span>
                    <span>{formatDate(req.createdAt)}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-slate-50/70 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-3.5">Sender</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Subject</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-6 py-3.5 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-6 py-4"><TableRowSkeleton /></td>
                  </tr>
                ))
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center space-y-2">
                    <Inbox size={36} className="mx-auto text-gray-300" />
                    <p className="text-sm font-semibold text-gray-700">No contact requests found</p>
                    <p className="text-xs text-gray-400">Messages from the Contact Us page will appear here.</p>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const st = STATUS_MAP[req.status] || STATUS_MAP.new;
                  return (
                    <tr
                      key={req._id}
                      onClick={() => {
                        setSelected(req);
                        setAdminNote(req.adminNote || "");
                      }}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-bold text-gray-900">{req.name}</p>
                          <p className="text-xs text-gray-400">{req.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full whitespace-nowrap">
                          {req.inquiryType}
                        </span>
                      </td>
                      <td className="px-4 py-4 max-w-[200px] truncate font-medium text-slate-700">
                        {req.subject}
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={st.variant} className="capitalize text-[11px] font-bold gap-1">
                          <st.icon size={11} /> {st.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-slate-500">
                        {formatDate(req.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <ChevronRight size={16} className="text-gray-400 ml-auto" />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-100">
          <Pagination page={page} pages={totalPages} total={total} limit={PAGE_LIMIT} onPageChange={setPage} />
        </div>
      </div>

      {/* ─── Detail Drawer ───────────────────────────────────────────────── */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-opacity duration-200",
          isDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setSelected(null)}
      />

      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-white shadow-2xl flex flex-col",
          "transform transition-transform duration-300 ease-in-out",
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <span className="text-sm font-bold text-gray-700">Contact Request Details</span>
          <button
            onClick={() => setSelected(null)}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Body */}
        {selected && (
          <div className="flex-1 overflow-y-auto p-6 space-y-5 pb-36">
            {/* Sender Info */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200/60 p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {selected.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{selected.name}</p>
                  <p className="text-xs text-gray-400">{selected.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/60">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Mail size={13} className="text-slate-400" />
                  <span className="truncate">{selected.email}</span>
                </div>
                {selected.phone && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Phone size={13} className="text-slate-400" />
                    <span>{selected.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Clock size={13} className="text-slate-400" />
                  <span>{formatDate(selected.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <MessageSquare size={13} className="text-slate-400" />
                  <span className="truncate">{selected.inquiryType}</span>
                </div>
              </div>
            </div>

            {/* Subject & Message */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Subject</h4>
              <p className="text-sm font-semibold text-gray-900">{selected.subject}</p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Message</h4>
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                {selected.message}
              </div>
            </div>

            {/* Admin Note */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Admin Note</h4>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={3}
                placeholder="Add an internal note (optional)..."
                className="w-full text-xs border border-gray-200 rounded-xl p-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 font-medium resize-none"
              />
            </div>

            {/* Status Update Buttons */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Update Status</h4>
              <div className="grid grid-cols-2 gap-2">
                {(["new", "in-progress", "resolved", "closed"] as const).map((st) => {
                  const meta = STATUS_MAP[st];
                  const Icon = meta.icon;
                  const isActive = selected.status === st;
                  return (
                    <button
                      key={st}
                      disabled={isActive || updatingStatus}
                      onClick={() => handleStatusUpdate(selected._id, st)}
                      className={cn(
                        "flex items-center justify-center gap-1.5 text-xs font-semibold py-2.5 rounded-xl border transition-all cursor-pointer",
                        isActive
                          ? "bg-[#1e3a5f] text-white border-[#1e3a5f] cursor-default"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-slate-50"
                      )}
                    >
                      <Icon size={13} />
                      {meta.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Drawer Footer */}
        {selected && (
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between gap-3 z-10">
            <Button
              size="sm"
              variant="danger"
              onClick={() => handleDelete(selected._id)}
              className="gap-1.5"
            >
              <Trash2 size={13} /> Delete
            </Button>

            <Button
              size="sm"
              onClick={() => handleStatusUpdate(selected._id, "resolved")}
              loading={updatingStatus}
              disabled={selected.status === "resolved"}
              className="bg-emerald-600 hover:bg-emerald-700 gap-1.5 px-5"
            >
              <Check size={14} /> Mark Resolved
            </Button>
          </div>
        )}
      </aside>
    </div>
  );
}
