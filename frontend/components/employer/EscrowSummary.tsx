"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Shield, TrendingUp, Clock, Wallet, PlusCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { escrowApi } from "@/lib/api";
import { EscrowSummaryData } from "@/types";
import { Button } from "@/components/ui/Button";

interface EscrowSummaryProps {
  onDepositClick?: () => void;
  refreshTrigger?: number;
}

export function EscrowSummary({ onDepositClick, refreshTrigger }: EscrowSummaryProps) {
  const { data: session } = useSession();
  const [summary, setSummary] = useState<EscrowSummaryData>({
    escrowBalance: 0,
    walletBalance: 0,
    locked: 0,
    released: 0,
    pending: 0,
    totalEscrows: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchSummary = useCallback(async () => {
    if (!session?.user.accessToken) return;
    setLoading(true);
    try {
      const res = (await escrowApi.getSummary(session.user.accessToken)) as {
        data: EscrowSummaryData;
      };
      setSummary(res.data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary, refreshTrigger]);

  return (
    <div className="bg-gradient-to-br from-purple-700 via-purple-800 to-indigo-900 rounded-2xl p-5 sm:p-6 text-white overflow-hidden shadow-lg border border-purple-500/20">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <Shield size={18} className="text-purple-200" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">
              Escrow Protection Overview
            </h3>
            <p className="text-purple-200 text-xs">Live Wallet & Escrow Stats</p>
          </div>
        </div>

        {onDepositClick && (
          <Button
            size="sm"
            onClick={onDepositClick}
            className="bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs gap-1.5 shrink-0"
          >
            <PlusCircle size={14} />
            Top-Up Wallet
          </Button>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-5">
        {/* Available Escrow Balance */}
        <div className="bg-white/10 rounded-xl p-3.5 border border-white/10">
          <div className="flex items-center gap-1.5 text-xs text-purple-200 mb-1">
            <Wallet size={14} className="text-purple-300" />
            Available Escrow Balance
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {loading ? "..." : formatCurrency(summary.escrowBalance)}
          </div>
          <p className="text-xs text-purple-300 mt-1">Ready for task locking</p>
        </div>

        {/* Locked in Escrow */}
        <div className="bg-white/10 rounded-xl p-3.5 border border-white/10">
          <div className="flex items-center gap-1.5 text-xs text-purple-200 mb-1">
            <Shield size={14} className="text-purple-300" />
            Currently Locked in Escrow
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-300">
            {loading ? "..." : formatCurrency(summary.locked)}
          </div>
          <p className="text-xs text-purple-300 mt-1">Held for active tasks</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 rounded-xl p-3 border border-white/5">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp size={13} className="text-emerald-400 shrink-0" />
            <span className="text-xs text-purple-200 truncate">Total Released</span>
          </div>
          <div className="text-base sm:text-lg font-bold text-white truncate">
            {loading ? "..." : formatCurrency(summary.released)}
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-3 border border-white/5">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock size={13} className="text-amber-400 shrink-0" />
            <span className="text-xs text-purple-200 truncate">Unfunded Pending</span>
          </div>
          <div className="text-base sm:text-lg font-bold text-white truncate">
            {loading ? "..." : formatCurrency(summary.pending)}
          </div>
        </div>
      </div>
    </div>
  );
}
