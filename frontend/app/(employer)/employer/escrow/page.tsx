"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Shield,
  PlusCircle,
  ShieldCheck,
  ShieldAlert,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Search,
} from "lucide-react";
import { EscrowSummary } from "@/components/employer/EscrowSummary";
import { escrowApi } from "@/lib/api";
import { EscrowTransaction } from "@/types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import Link from "next/link";

import { useRazorpay } from "@/hooks/useRazorpay";

export default function EscrowPage() {
  const { data: session } = useSession();
  const { success, error } = useToast();
  const { isLoaded: isRazorpayLoaded } = useRazorpay();

  const [transactions, setTransactions] = useState<EscrowTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Deposit Modal State
  const [depositOpen, setDepositOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number | string>(500);
  const [depositing, setDepositing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Filter tab State
  const [filter, setFilter] = useState<"all" | "funded" | "released" | "unfunded">("all");
  const [search, setSearch] = useState("");

  const fetchTransactions = useCallback(async () => {
    if (!session?.user.accessToken) return;
    setLoading(true);
    try {
      const res = (await escrowApi.getTransactions(
        session.user.accessToken
      )) as { data: EscrowTransaction[] };
      setTransactions(res.data || []);
    } catch {
      error("Failed to load escrow transaction logs");
    } finally {
      setLoading(false);
    }
  }, [session, error]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions, refreshTrigger]);

  const handleRazorpayDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user.accessToken) return;
    const amount = Number(depositAmount);
    if (!amount || amount <= 0) {
      error("Please enter a valid deposit amount");
      return;
    }

    setDepositing(true);
    try {
      const orderRes = await escrowApi.createRazorpayOrder(
        session.user.accessToken,
        amount,
        "INR"
      );

      const orderData = orderRes.data;

      if (typeof window === "undefined" || !(window as any).Razorpay) {
        error("Razorpay SDK is not loaded yet. Please refresh the page and try again.");
        setDepositing(false);
        return;
      }

      const options = {
        key: orderData.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_dummy",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "WinkGetJob Escrow Protection",
        description: `Top-Up Escrow Balance (${formatCurrency(amount)})`,
        order_id: orderData.orderId,
        handler: async function (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) {
          try {
            const verifyRes = await escrowApi.verifyRazorpayPayment(
              session.user.accessToken,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount,
              }
            );
            success(verifyRes.message || "Payment verified & balance updated!");
            setDepositOpen(false);
            setRefreshTrigger((prev) => prev + 1);
          } catch (verifyErr) {
            error(
              verifyErr instanceof Error
                ? verifyErr.message
                : "Payment verification failed"
            );
          } finally {
            setDepositing(false);
          }
        },
        prefill: {
          name: session.user?.name || "",
          email: session.user?.email || "",
        },
        theme: {
          color: "#7c3aed",
        },
        modal: {
          ondismiss: function () {
            setDepositing(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      error(err instanceof Error ? err.message : "Razorpay deposit failed");
      setDepositing(false);
    }
  };




  const filteredTransactions = transactions.filter((t) => {
    if (filter !== "all") {
      if (filter === "funded" && t.status !== "funded" && (t as any).transactionType !== "deposit") return false;
      if (filter === "released" && t.status !== "released") return false;
      if (filter === "unfunded" && t.status !== "unfunded" && t.status !== "unfunded_completed")
        return false;
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      const taskTitle = typeof t.task === "object" ? t.task.title.toLowerCase() : "";
      const freelancerName = typeof t.freelancer === "object" ? t.freelancer.name.toLowerCase() : "";
      const paymentId = (t as any).paymentId ? String((t as any).paymentId).toLowerCase() : "";
      return taskTitle.includes(q) || freelancerName.includes(q) || paymentId.includes(q);
    }

    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Shield className="text-purple-600" size={26} />
            Escrow Wallet & Payment Contracts
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage task budget locks, pre-funded escrow balances, and release payments safely upon task plan finalization.
          </p>
        </div>

        <Button
          onClick={() => setDepositOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white gap-2 shadow-sm shrink-0"
        >
          <PlusCircle size={16} />
          Top-Up Escrow Balance
        </Button>
      </div>

      {/* Escrow Summary Banner */}
      <EscrowSummary
        onDepositClick={() => setDepositOpen(true)}
        refreshTrigger={refreshTrigger}
      />

      {/* Transactions Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden space-y-4 p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Escrow Contracts & Transactions Log
            </h2>
            <p className="text-xs text-gray-500">
              History of all task bids, escrow locks, and release settlements.
            </p>
          </div>

          {/* Search & Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Search tasks or freelancers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 w-48 sm:w-60"
              />
            </div>

            <div className="flex bg-gray-100 p-1 rounded-lg text-xs font-semibold">
              {(["all", "funded", "released", "unfunded"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-3 py-1 rounded-md transition-all capitalize ${
                    filter === tab
                      ? "bg-white text-purple-700 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        {loading ? (
          <div className="py-12 text-center text-gray-400 text-sm animate-pulse">
            Loading Escrow transactions...
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <Shield className="mx-auto text-gray-300 mb-2" size={36} />
            <p className="text-sm font-semibold text-gray-700">No Escrow Transactions Found</p>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              When you select freelancer bids on your posted tasks, escrow contracts and payment status updates will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Task & Freelancer</th>
                  <th className="py-3 px-4">Initial Budget</th>
                  <th className="py-3 px-4">Final Bid Amount</th>
                  <th className="py-3 px-4">Escrow Status</th>
                  <th className="py-3 px-4">Guarantee Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTransactions.map((tx) => {
                  const taskObj = typeof tx.task === "object" ? tx.task : null;
                  const freelancerObj = typeof tx.freelancer === "object" ? tx.freelancer : null;

                  return (
                    <tr key={tx._id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Task & Freelancer */}
                      <td className="py-3.5 px-4 min-w-[200px]">
                        <p className="font-semibold text-gray-900 truncate">
                          {(tx as any).transactionType === "deposit"
                            ? "Razorpay Wallet Top-Up"
                            : taskObj?.title || "Task"}
                        </p>
                        <p className="text-gray-500 text-[11px] mt-0.5">
                          {(tx as any).transactionType === "deposit"
                            ? `Payment Ref: ${(tx as any).paymentId || "Razorpay Gateway"}`
                            : `Freelancer: ${freelancerObj?.name || "Jobseeker"}`}
                        </p>
                      </td>

                      {/* Initial Budget */}
                      <td className="py-3.5 px-4 font-medium text-gray-600">
                        {formatCurrency(tx.initialBudget)}
                      </td>

                      {/* Final Bid Amount */}
                      <td className="py-3.5 px-4 font-bold text-gray-900 text-sm">
                        {formatCurrency(tx.finalBidAmount)}
                      </td>

                      {/* Escrow Status Badge */}
                      <td className="py-3.5 px-4">
                        {(tx as any).transactionType === "deposit" || tx.status === ("deposit_success" as any) ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold">
                            <CheckCircle size={12} />
                            Top-Up Completed
                          </span>
                        ) : tx.status === "funded" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full font-bold">
                            <ShieldCheck size={12} />
                            Funded in Escrow
                          </span>
                        ) : tx.status === "released" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold">
                            <CheckCircle size={12} />
                            Released to Wallet
                          </span>
                        ) : tx.status === "unfunded" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-bold">
                            <Clock size={12} />
                            Unfunded Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 border border-gray-200 rounded-full font-bold">
                            Unfunded Completed
                          </span>
                        )}
                      </td>

                      {/* Guarantee */}
                      <td className="py-3.5 px-4">
                        {tx.platformGuarantee ? (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <ShieldCheck size={13} />
                            Active Guarantee
                          </span>
                        ) : (
                          <span className="text-amber-700 font-semibold flex items-center gap-1">
                            <ShieldAlert size={13} />
                            No Guarantee (Exempt)
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">
                        {formatRelativeTime(tx.createdAt)}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        {taskObj && (
                          <Link href={`/employer/my-tasks/${taskObj._id}`}>
                            <Button size="sm" variant="ghost" className="text-purple-600 hover:text-purple-800 text-xs">
                              View Task
                            </Button>
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Top-Up Escrow Balance Modal */}
      {depositOpen && (
        <Modal
          open={depositOpen}
          onClose={() => setDepositOpen(false)}
          title="Top-Up Escrow Wallet Balance"
          size="md"
          position="right-drawer"
        >
          <form onSubmit={handleRazorpayDeposit} className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-purple-800 font-semibold">
                <ShieldCheck size={16} className="text-purple-600 shrink-0" />
                <span>Razorpay Gateway (Test Mode)</span>
              </div>
              <span className="px-2 py-0.5 bg-purple-200 text-purple-900 rounded font-bold text-[10px] uppercase">
                Sandbox Mode
              </span>
            </div>

            <p className="text-xs text-gray-500">
              Add funds to your Escrow wallet to lock payment for freelancer bids with Platform Payment Protection.
            </p>

            {/* Presets */}
            <div className="grid grid-cols-4 gap-2">
              {[100, 500, 1000, 5000].map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setDepositAmount(preset)}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                    Number(depositAmount) === preset
                      ? "bg-purple-50 border-purple-600 text-purple-700"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  +${preset}
                </button>
              ))}
            </div>

            {/* Custom Amount */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-700">
                Deposit Amount ($ / ₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">
                  $
                </span>
                <input
                  type="number"
                  min={1}
                  step="any"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 pl-7 pr-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Button
                type="submit"
                fullWidth
                loading={depositing}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold gap-2 py-2.5"
              >
                <DollarSign size={16} />
                Pay ${depositAmount || 0} via Razorpay (Test Mode)
              </Button>

            </div>
          </form>

        </Modal>
      )}
    </div>
  );
}
