"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
            <span className="text-4xl font-black text-[#1e3a5f]">404</span>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Page Not Found</h1>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been
          moved or deleted.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button className="gap-2">
              <Home size={16} />
              Go Home
            </Button>
          </Link>
          <Button variant="secondary" onClick={() => window.history.back()} className="gap-2">
            <ArrowLeft size={16} />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
