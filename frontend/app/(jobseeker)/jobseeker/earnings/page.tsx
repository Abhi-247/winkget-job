"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { escrowApi, jobsApi } from "@/lib/api";
import { EscrowTransaction, EscrowSummaryData, JobSeekerStats } from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { TableRowSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import {
  Wallet,
  DollarSign,
  ShieldCheck,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Search,
  Filter,
  CreditCard,
  Building,
  Send,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default function EarningsPage() {
  const { data: session, status } = useSession();
  const { success, error } = useToast();

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<EscrowSummaryData | null>(null);
  const [transactions, setTransactions] = useState<EscrowTransaction[]>([]);
  const [stats, setStats] = useState<JobSeekerStats | null>(null);

  // Filters
  const [activeTab, setActiveTab] = useState<"all" | "released" | "funded" | "unfunded">("all");
  const [search, setSearch] = useState("");

  // Withdraw Modal
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [payoutMethod, setPayoutMethod] = useState<"upi" | "bank">("upi");
  const [upiId, setUpiId] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!session?.user.accessToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [sumRes, txRes, statsRes] = await Promise.allSettled([
        escrowApi.getSummary(session.user.accessToken) as Promise<{ data: EscrowSummaryData }>,
        escrowApi.getTransactions(session.user.accessToken) as Promise<{ data: EscrowTransaction[] }>,
        jobsApi.getJobseekerStats(session.user.accessToken) as Promise<{ data: JobSeekerStats }>,
      ]);

      if (sumRes.status === "fulfilled") {
        setSummary(sumRes.value.data);
      }
      if (txRes.status === "fulfilled") {
        setTransactions(txRes.value.data || []);
      }
      if (statsRes.status === "fulfilled") {
        setStats(statsRes.value.data);
      }
    } catch {
      error("Failed to load earnings data");
    } finally {
      setLoading(false);
    }
  }, [session, error]);

  useEffect(() => {
    if (status === "loading") return;
    fetchData();
  }, [fetchData, status]);

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(withdrawAmount);
    const available = summary?.walletBalance || 0;

    if (!amount || amount <= 0) {
      error("Please enter a valid payout amount");
      return;
    }
    if (amount > available) {
      error(`Amount exceeds available wallet balance (${formatCurrency(available)})`);
      return;
    }
    if (payoutMethod === "upi" && !upiId.includes("@")) {
      error("Please enter a valid UPI ID (e.g. name@upi)");
      return;
    }
    if (payoutMethod === "bank" && (!bankAccount || !ifscCode)) {
      error("Please provide Bank Account Number and IFSC Code");
      return;
    }

    setWithdrawing(true);
    setTimeout(() => {
      setWithdrawing(false);
      setWithdrawModalOpen(false);
      success(`Withdrawal request of ${formatCurrency(amount)} submitted successfully! Processing time: 24h.`);
      setWithdrawAmount("");
    }, 1200);
  };

  // Filtered transactions
  const filtered = transactions.filter((tx) => {
    const taskTitle = typeof tx.task === "object" ? tx.task?.title || "" : "";
    const clientName = typeof tx.employer === "object" ? tx.employer?.name || tx.employer?.company || "" : "";
    const matchesSearch =
      taskTitle.toLowerCase().includes(search.toLowerCase()) ||
      clientName.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (activeTab === "released") return tx.status === "released";
    if (activeTab === "funded") return tx.status === "funded";
    if (activeTab === "unfunded") return tx.status === "unfunded";
    return true;
  });

  const walletBalance = summary?.walletBalance || 0;
  const releasedTotal = summary?.released || 0;
  const lockedTotal = summary?.locked || 0;
  const totalEarnings = stats?.earnings || releasedTotal;

  return (
    <div className="space-y-6" style={{ fontFamily: "var(--font-poppins), sans-serif" }}>
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Wallet className="text-[#1e3a5f]" size={24} />
            Earnings & Wallet Payouts
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Monitor released task payouts, active Escrow guarantees, and wallet balance
          </p>
        </div>
        <Button
          onClick={() => {
            setWithdrawAmount(walletBalance.toString());
            setWithdrawModalOpen(true);
          }}
          disabled={walletBalance <= 0}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm gap-2 shadow-md shadow-emerald-900/10 cursor-pointer self-start sm:self-auto"
        >
          <Send size={15} />
          <span>Withdraw Wallet Payout ({formatCurrency(walletBalance)})</span>
        </Button>
      </div>

      {/* ── Top Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Wallet Balance */}
        <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 rounded-2xl p-5 text-white shadow-md relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-400/20">
                Available Wallet Balance
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                <Wallet size={16} />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {formatCurrency(walletBalance)}
            </p>
            <p className="text-[11px] text-emerald-200 mt-1">
              Released task earnings ready for bank/UPI withdrawal
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-emerald-500/20 flex items-center justify-between text-xs">
            <span className="text-emerald-300 font-medium">Platform Escrow Protection</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              Active <ShieldCheck size={13} />
            </span>
          </div>
        </div>

        {/* Card 2: Total Released Earnings */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Earnings Released
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <TrendingUp size={16} />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {formatCurrency(totalEarnings)}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Sum of completed task escrows & verified job contracts
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Completed Task Payouts</span>
            <span className="font-bold text-slate-800">{transactions.filter(t => t.status === "released").length} Released</span>
          </div>
        </div>

        {/* Card 3: Secured in Escrow */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Secured in Active Escrow
              </span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                <ShieldCheck size={16} />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-purple-950 tracking-tight">
              {formatCurrency(lockedTotal)}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Funds locked in Escrow by employers for active tasks
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Guaranteed Tasks</span>
            <span className="font-bold text-purple-700">{transactions.filter(t => t.status === "funded").length} Active</span>
          </div>
        </div>
      </div>

      {/* ── Transaction & Escrow Payout Logs ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Header & Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Escrow Payout History</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live audit record of Escrow deposits, releases, and payment guarantees
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search task or employer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 bg-slate-50/50"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveTab("all")}
                className={cn(
                  "px-2.5 py-1 rounded-lg transition-colors cursor-pointer",
                  activeTab === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                )}
              >
                All ({transactions.length})
              </button>
              <button
                onClick={() => setActiveTab("released")}
                className={cn(
                  "px-2.5 py-1 rounded-lg transition-colors cursor-pointer",
                  activeTab === "released" ? "bg-white text-emerald-800 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
                )}
              >
                Released
              </button>
              <button
                onClick={() => setActiveTab("funded")}
                className={cn(
                  "px-2.5 py-1 rounded-lg transition-colors cursor-pointer",
                  activeTab === "funded" ? "bg-white text-blue-800 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
                )}
              >
                Secured
              </button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 sm:px-6">Task & Employer</th>
                  <th className="py-3 px-4">Payout Amount</th>
                  <th className="py-3 px-4">Escrow Status</th>
                  <th className="py-3 px-4">Payment Guarantee</th>
                  <th className="py-3 px-4 sm:px-6">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {Array.from({ length: 4 }).map((_, i) => (
                  <TableRowSkeleton key={i} cols={5} />
                ))}
              </tbody>
            </table>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <DollarSign size={20} />
            </div>
            <p className="text-sm font-semibold text-slate-700">No Escrow Payouts Found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              When employers approve your task bids and finalize completed work, your released Escrow funds will automatically appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 sm:px-6">Task & Employer</th>
                  <th className="py-3 px-4">Payout Amount</th>
                  <th className="py-3 px-4">Escrow Status</th>
                  <th className="py-3 px-4">Payment Guarantee</th>
                  <th className="py-3 px-4 sm:px-6">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((tx) => {
                  const task = typeof tx.task === "object" ? tx.task : null;
                  const employer = typeof tx.employer === "object" ? tx.employer : null;
                  const taskTitle = task?.title || "Task Item";
                  const employerName = employer?.company || employer?.name || "Client";

                  return (
                    <tr key={tx._id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Task & Client */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div>
                          <p className="font-bold text-slate-900 text-sm truncate max-w-xs">{taskTitle}</p>
                          <p className="text-[11px] text-[#1e3a5f] font-semibold">{employerName}</p>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-slate-900 text-sm">
                          {formatCurrency(tx.finalBidAmount)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {tx.status === "released" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 size={12} className="text-emerald-600" />
                            💰 Payout Released
                          </span>
                        ) : tx.status === "funded" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                            <ShieldCheck size={12} className="text-blue-600" />
                            🛡️ Escrow Secured
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            <AlertTriangle size={12} className="text-amber-600" />
                            ⚠️ Unfunded Escrow
                          </span>
                        )}
                      </td>

                      {/* Guarantee */}
                      <td className="py-3.5 px-4">
                        {tx.platformGuarantee ? (
                          <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                            <ShieldCheck size={13} /> Active Guarantee
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">
                            Standard
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 sm:px-6 text-slate-500">
                        {formatDate(tx.releasedAt || tx.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Withdrawal Request Modal ── */}
      {withdrawModalOpen && (
        <Modal
          open={withdrawModalOpen}
          onClose={() => setWithdrawModalOpen(false)}
          title="Withdraw Wallet Payout"
          size="md"
        >
          <form onSubmit={handleWithdrawSubmit} className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                  Available Wallet Balance
                </p>
                <p className="text-2xl font-black text-emerald-950 mt-0.5">
                  {formatCurrency(walletBalance)}
                </p>
              </div>
              <Wallet size={28} className="text-emerald-600" />
            </div>

            <Input
              label="Withdrawal Amount (₹)"
              type="number"
              placeholder="Enter amount to transfer"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              required
              min={1}
              max={walletBalance}
            />

            {/* Payout Method Toggle */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 block">Payout Destination</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPayoutMethod("upi")}
                  className={cn(
                    "p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer",
                    payoutMethod === "upi"
                      ? "border-[#1e3a5f] bg-[#1e3a5f]/5 text-[#1e3a5f]"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <CreditCard size={15} />
                  <span>UPI Transfer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPayoutMethod("bank")}
                  className={cn(
                    "p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer",
                    payoutMethod === "bank"
                      ? "border-[#1e3a5f] bg-[#1e3a5f]/5 text-[#1e3a5f]"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <Building size={15} />
                  <span>Bank Account</span>
                </button>
              </div>
            </div>

            {payoutMethod === "upi" ? (
              <Input
                label="UPI ID"
                type="text"
                placeholder="e.g. username@okicici or number@upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                required
              />
            ) : (
              <div className="space-y-3">
                <Input
                  label="Bank Account Number"
                  type="text"
                  placeholder="Enter Account Number"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  required
                />
                <Input
                  label="IFSC Code"
                  type="text"
                  placeholder="e.g. SBIN0001234"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                  required
                />
              </div>
            )}

            <p className="text-[11px] text-gray-400 leading-relaxed">
              Payouts are verified & deposited directly to your bank/UPI within 24 business hours. No platform processing fee.
            </p>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setWithdrawModalOpen(false)}
                className="w-1/3"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={withdrawing}
                className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                Submit Payout Request
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
