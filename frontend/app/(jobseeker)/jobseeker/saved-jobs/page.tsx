"use client";

import { useSavedJobs } from "@/lib/hooks";
import { Tag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function SavedJobsPage() {
  const { savedIds, mounted } = useSavedJobs();
  const count = mounted ? savedIds.length : 0;

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Saved Jobs</h2>
          <p className="text-sm text-gray-400 mt-0.5">Jobs you bookmarked while browsing</p>
        </div>
        <Link href="/jobs">
          <Button size="sm" className="gap-1.5">
            Browse Jobs
          </Button>
        </Link>
      </div>

      {/* ── Stat card ── */}
      <div className="w-40">
        <div className="bg-[#edf2f7] rounded-xl p-5 border border-white">
          <div className="text-3xl font-bold text-[#1e3a5f] mb-1">{count}</div>
          <div className="text-sm font-medium text-[#1e3a5f]">Saved Jobs</div>
        </div>
      </div>

      {/* ── Content area ── */}
      {count === 0 ? (
        /* Empty state */
        <div className="bg-white rounded-xl border border-gray-200 p-16 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Tag size={28} className="text-red-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-800 mb-2">
            No saved jobs yet
          </h3>
          <p className="text-sm text-gray-400 max-w-xs mb-1">
            Save jobs while browsing
          </p>
          <p className="text-sm mb-6">
            <Link
              href="/jobs"
              className="text-[#1e3a5f] hover:underline font-medium"
            >
              to find them here later.
            </Link>
          </p>
          <Link href="/jobs">
            <Button className="px-8">Find Work</Button>
          </Link>
        </div>
      ) : (
        /* Saved jobs list — populated once "Save" buttons exist on browse pages */
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">
            You have {count} saved job{count !== 1 ? "s" : ""}.{" "}
            <Link href="/jobs" className="text-[#1e3a5f] hover:underline">
              Browse more
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
