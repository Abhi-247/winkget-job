"use client";

import { useState, FormEvent, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Shield, Mail, Lock } from "lucide-react";
import { Google } from "@/components/ui/BrandIcons";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { RoleToggle } from "./RoleToggle";
import { useToast } from "@/components/ui/Toast";
import { UserRole } from "@/types";
import { cn } from "@/lib/utils";
import Link from "next/link";

const buttonLabel: Record<UserRole, string> = {
  jobseeker: "Sign In as Freelancer",
  employer:  "Sign In as Employer",
  admin:     "Sign In as Admin",
};

function SignInFormContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { error: showError } = useToast();

  // Pre-select role from ?role= query param (e.g. /sign-in?role=admin)
  const roleParam = searchParams.get("role") as UserRole | null;
  const initialRole: UserRole =
    roleParam === "employer" || roleParam === "admin" ? roleParam : "jobseeker";

  const [role,         setRole]         = useState<UserRole>(initialRole);
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // If URL param changes, sync it
  useEffect(() => {
    if (roleParam === "employer" || roleParam === "admin" || roleParam === "jobseeker") {
      setRole(roleParam);
    }
  }, [roleParam]);

  // Whether to show the Admin tab in the toggle
  const showAdminTab = role === "admin" || roleParam === "admin";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        role,
        redirect: false,
      });

      if (result?.error) {
        showError("Invalid email or password");
      } else {
        // Fetch session to get the actual role back from the server
        const res     = await fetch("/api/auth/session");
        const session = await res.json();
        const userRole = session?.user?.role || role;
        router.push(`/${userRole}/dashboard`);
        router.refresh();
      }
    } catch {
      showError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: `/${role}/dashboard` });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Admin mode banner */}
      {role === "admin" && (
        <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-xs text-red-700">
          <Shield size={16} className="flex-shrink-0 mt-0.5" />
          <span>
            <span className="font-bold">Admin Portal Access.</span>{" "}
            Restricted access. Authorized personnel only.
          </span>
        </div>
      )}

      <RoleToggle value={role} onChange={setRole} showAdmin={showAdminTab} />

      <div className="space-y-4">
        <Input
          label="Email address"
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          leftIcon={<Mail size={16} className="text-gray-400" />}
        />

        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          leftIcon={<Lock size={16} className="text-gray-400" />}
          rightIcon={
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
        />
      </div>

      <div className="flex items-center justify-between text-xs">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input 
            type="checkbox" 
            className="rounded border-gray-300 text-[#1e3a5f] focus:ring-[#1e3a5f] transition-all cursor-pointer w-4 h-4" 
          />
          <span className="text-gray-655 group-hover:text-gray-900 transition-colors select-none font-medium">
            Remember me
          </span>
        </label>
        <Link 
          href="/forgot-password" 
          className="text-[#1e3a5f] hover:text-[#d4a017] font-semibold transition-colors"
        >
          Forgot password?
        </Link>
      </div>

      <Button
        type="submit"
        fullWidth
        loading={loading}
        className={cn(
          "h-11 rounded-xl font-semibold transition-all transform active:scale-95 shadow-md shadow-blue-900/10",
          role === "admin" ? "bg-red-600 hover:bg-red-700" : "bg-[#1e3a5f] hover:bg-[#152a45]"
        )}
      >
        {buttonLabel[role]}
      </Button>

      {/* Hide Google OAuth on admin sign-in */}
      {role !== "admin" && (
        <>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-wider text-gray-400 bg-white px-3 font-semibold">
              or continue with
            </div>
          </div>

          <Button
            type="button"
            variant="secondary"
            fullWidth
            loading={googleLoading}
            onClick={handleGoogle}
            className="h-11 rounded-xl gap-2.5 border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100 shadow-sm transition-all text-xs font-semibold"
          >
            <Google size={18} className="flex-shrink-0" />
            Sign in with Google
          </Button>
        </>
      )}

      {role !== "admin" && (
        <p className="text-center text-xs text-gray-550 mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href={`/register?role=${role}`}
            className="text-[#1e3a5f] font-bold hover:text-[#d4a017] hover:underline transition-colors"
          >
            Create one
          </Link>
        </p>
      )}
    </form>
  );
}

export function SignInForm() {
  return (
    <Suspense fallback={<div className="h-48 flex items-center justify-center text-gray-450 text-xs">Loading form...</div>}>
      <SignInFormContent />
    </Suspense>
  );
}
