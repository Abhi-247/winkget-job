"use client";

import { Bookmark } from "lucide-react";

export default function ShortlistPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Shortlist</h2>
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Bookmark size={24} className="text-amber-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          No shortlisted candidates
        </h3>
        <p className="text-sm text-gray-400 max-w-xs mx-auto">
          Review applications and shortlist promising candidates to send hire requests.
        </p>
      </div>
    </div>
  );
}
