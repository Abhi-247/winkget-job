import { Shield, TrendingUp, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export function EscrowSummary() {
  const mockEscrow = {
    locked: 45000,
    released: 120000,
    pending: 18000,
  };

  return (
    <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6 text-white">
      <div className="flex items-center gap-2 mb-4">
        <Shield size={18} className="text-purple-200" />
        <h3 className="font-semibold text-purple-100 text-sm">
          Escrow Summary
        </h3>
        <span className="ml-auto text-xs bg-white/20 rounded-full px-2 py-0.5">
          Mock — Phase 2
        </span>
      </div>

      <div className="text-3xl font-black mb-1">
        {formatCurrency(mockEscrow.locked)}
      </div>
      <p className="text-purple-200 text-sm mb-6">Currently in escrow</p>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/10 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp size={13} className="text-purple-300" />
            <span className="text-xs text-purple-200">Released</span>
          </div>
          <div className="text-lg font-bold">
            {formatCurrency(mockEscrow.released)}
          </div>
        </div>
        <div className="bg-white/10 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock size={13} className="text-purple-300" />
            <span className="text-xs text-purple-200">Pending</span>
          </div>
          <div className="text-lg font-bold">
            {formatCurrency(mockEscrow.pending)}
          </div>
        </div>
      </div>
    </div>
  );
}
