"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, KeyRound, ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { RoleToggle } from "@/components/auth/RoleToggle";
import { useToast } from "@/components/ui/Toast";
import { authApi } from "@/lib/api";
import { UserRole } from "@/types";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { success, error: showError } = useToast();

  const [step, setStep] = useState<"request" | "reset">("request");
  const [role, setRole] = useState<UserRole>("jobseeker");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);

  // Step 1: Request OTP code
  const handleRequestOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) {
      showError("Please enter your registered email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email, role);
      if (res.otpCode) {
        setGeneratedOtp(res.otpCode);
        setToken(res.otpCode); // Pre-fill OTP for testing ease
      }
      success(res.message || "Password reset OTP code generated!");
      setStep("reset");
    } catch (err: any) {
      showError(err.message || "Failed to generate password reset code.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and reset password
  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!token || token.length < 4) {
      showError("Please enter the OTP reset code.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      showError("New password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.resetPassword({
        email,
        role,
        token,
        newPassword,
      });
      success(res.message || "Password reset successfully! Please sign in with your new password.");
      router.push(`/sign-in?email=${encodeURIComponent(email)}&role=${role}`);
    } catch (err: any) {
      showError(err.message || "Failed to reset password. Please check your OTP code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="bg-slate-50/50 min-h-[85vh] py-12 flex items-center justify-center"
      style={{ fontFamily: "var(--font-poppins), sans-serif" }}
    >
      <div className="max-w-md w-full px-4 sm:px-6">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-3xl sm:px-10 border border-slate-100 space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#1e3a5f]/10 border border-[#1e3a5f]/20 flex items-center justify-center mx-auto text-[#1e3a5f]">
              <KeyRound size={22} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {step === "request" ? "Forgot Password?" : "Set New Password"}
            </h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              {step === "request"
                ? "Enter your email address and select your account role to receive a password reset OTP code."
                : "Enter the OTP code sent to your account and choose a new secure password."}
            </p>
          </div>

          {/* Generated OTP Alert Box (For seamless testing & user feedback) */}
          {generatedOtp && step === "reset" && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-emerald-900">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Password Reset OTP Code:</p>
                <p className="text-lg font-black tracking-widest text-emerald-950 mt-0.5">
                  {generatedOtp}
                </p>
                <p className="text-[11px] text-emerald-700 mt-1">
                  We have auto-filled this OTP code for you. Enter your new password below.
                </p>
              </div>
            </div>
          )}

          {step === "request" ? (
            <form onSubmit={handleRequestOtp} className="space-y-5">
              <RoleToggle value={role} onChange={setRole} />

              <Input
                label="Registered Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                leftIcon={<Mail size={16} className="text-slate-400" />}
              />

              <Button
                type="submit"
                loading={loading}
                fullWidth
                className="bg-[#1e3a5f] hover:bg-[#152a45] text-white font-bold py-2.5 rounded-xl shadow-xs"
              >
                Send Reset Code
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <Input
                label="6-Digit Reset OTP Code"
                type="text"
                placeholder="Enter 6-digit OTP code"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
                leftIcon={<ShieldCheck size={16} className="text-slate-400" />}
              />

              <Input
                label="New Password"
                type="password"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                leftIcon={<Lock size={16} className="text-slate-400" />}
              />

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setStep("request")}
                  className="w-1/3 text-xs"
                >
                  Resend OTP
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                  className="w-2/3 bg-[#1e3a5f] hover:bg-[#152a45] text-white font-bold py-2.5 rounded-xl"
                >
                  Reset Password
                </Button>
              </div>
            </form>
          )}

          {/* Footer Back Link */}
          <div className="pt-2 text-center border-t border-slate-100">
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#1e3a5f] transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to Sign In</span>
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}
