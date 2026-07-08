"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { AlertCircle, Home, RotateCw } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
            <AlertCircle size={40} className="text-red-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Something Went Wrong</h1>
        <p className="text-gray-500 mb-2">
          We encountered an unexpected error. Don&apos;t worry, our team has been notified.
        </p>
        {error.message && (
          <p className="text-xs text-gray-400 font-mono bg-gray-100 rounded px-3 py-2 mb-6 break-words">
            {error.message}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} className="gap-2">
            <RotateCw size={16} />
            Try Again
          </Button>
          <Link href="/">
            <Button variant="secondary" className="gap-2">
              <Home size={16} />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
