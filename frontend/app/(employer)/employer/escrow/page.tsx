import { Shield, Clock } from "lucide-react";
import { EscrowSummary } from "@/components/employer/EscrowSummary";

export default function EscrowPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Escrow & Payments</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <EscrowSummary />
        <div className="bg-white rounded-xl border border-gray-200 p-8 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center mb-4">
            <Shield size={24} className="text-purple-400" />
          </div>
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-2 text-sm text-amber-700 mb-3">
            <Clock size={14} />
            Full feature coming in Phase 2
          </div>
          <p className="text-sm text-gray-400 max-w-xs">
            Full escrow management, fund releases, and payment history will be available soon.
          </p>
        </div>
      </div>
    </div>
  );
}
