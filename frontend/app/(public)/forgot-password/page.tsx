"use client";

import { useState, FormEvent } from "react";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate sending recovery email / contact admin
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  };

  return (
    <main
      className="bg-white min-h-screen py-16 flex items-center justify-center"
      style={{ fontFamily: "var(--font-poppins), sans-serif" }}
    >
      <div className="max-w-md w-full px-6">
        {/* Back Link */}
        <Link
          href="/sign-in"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#1e3a5f] mb-8 group transition-colors"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Login
        </Link>

        {submitted ? (
          /* Success State */
          <div className="bg-gray-50 border border-gray-150 rounded-3xl p-8 shadow-sm text-center">
            <div className="w-16 h-16 bg-green-50 border border-green-200 rounded-2xl flex items-center justify-center mx-auto mb-6 text-green-600">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-3">
              Request Sent
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              If an account is associated with <span className="font-semibold text-gray-800">{email}</span>, you will receive reset instructions shortly.
            </p>
            <div className="pt-4 border-t border-gray-200 text-xs text-gray-500">
              <p>Did not receive an email?</p>
              <p className="mt-1">
                Please contact support at{" "}
                <a
                  href="mailto:winkgetexpress@gmail.com"
                  className="font-medium text-[#1e3a5f] hover:underline"
                >
                  winkgetexpress@gmail.com
                </a>{" "}
                or call{" "}
                <a
                  href="tel:+918175981920"
                  className="font-medium text-[#1e3a5f] hover:underline"
                >
                  +91 8175981920
                </a>
              </p>
            </div>
          </div>
        ) : (
          /* Form State */
          <div className="bg-gray-50 border border-gray-100 rounded-3xl p-8 shadow-sm">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-black text-gray-900 leading-tight mb-2">
                Forgot <span className="text-[#1e3a5f]">Password?</span>
              </h1>
              <p className="text-sm text-gray-500">
                Enter your email address and we'll send you recovery details.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                loading={loading}
                className="w-full bg-[#1e3a5f] hover:bg-[#152a45] py-3 rounded-xl"
              >
                Send Instructions
              </Button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
