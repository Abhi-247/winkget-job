import { Wallet, Clock } from "lucide-react";

export default function EarningsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Earnings & Wallet</h2>
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wallet size={24} className="text-purple-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Earnings & Wallet
        </h3>
        <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-2 text-sm text-amber-700">
          <Clock size={14} />
          Coming in Phase 2
        </div>
        <p className="text-sm text-gray-400 mt-4 max-w-sm mx-auto">
          Earnings tracking, wallet management, and payment history will be
          available in the next release.
        </p>
      </div>
    </div>
  );
}
