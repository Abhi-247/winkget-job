"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";

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

// ─── useAccessToken ───────────────────────────────────────────────────────────
// Fetches the backend accessToken from the server-side token store.
// Caches in-memory so repeated renders don't re-fetch.

export function useAccessToken() {
  const { data: session, status } = useSession();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id || fetchedRef.current) return;
    fetchedRef.current = true;

    fetch("/api/token")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.accessToken) setAccessToken(data.accessToken);
      })
      .catch(() => {
        // token unavailable — user may need to re-login
      });
  }, [session, status]);

  return accessToken;
}
