import { BarChart2, Clock } from "lucide-react";

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Reports & Analytics</h2>
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-[#edf2f7] rounded-full flex items-center justify-center mx-auto mb-4">
          <BarChart2 size={24} className="text-[#d4a017]" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Analytics Dashboard</h3>
        <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-2 text-sm text-amber-700 mb-3">
          <Clock size={14} />
          Coming in Phase 2
        </div>
        <p className="text-sm text-gray-400 max-w-sm mx-auto">
          Comprehensive analytics, revenue reports, and user insights will be available soon.
        </p>
      </div>
    </div>
  );
}
