"use client";

import { useState, useEffect, useCallback } from "react";

const SAVED_JOBS_KEY = "winkgetjob_saved_jobs";

// ─── useSavedJobs ─────────────────────────────────────────────────────────────
// Persists a set of saved job IDs to localStorage.
// Safe for SSR — reads localStorage only after mount.

export function useSavedJobs() {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage after mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVED_JOBS_KEY);
      setSavedIds(raw ? (JSON.parse(raw) as string[]) : []);
    } catch {
      setSavedIds([]);
    }
    setMounted(true);
  }, []);

  const toggleSave = useCallback((jobId: string) => {
    setSavedIds((prev) => {
      const next = prev.includes(jobId)
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId];
      try {
        localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(next));
      } catch {
        // localStorage unavailable — ignore
      }
      return next;
    });
  }, []);

  const isSaved = useCallback(
    (jobId: string) => savedIds.includes(jobId),
    [savedIds]
  );

  return { savedIds, toggleSave, isSaved, mounted };
}
