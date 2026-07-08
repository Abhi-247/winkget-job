"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Shield } from "lucide-react";
import { Google } from "@/components/ui/BrandIcons";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { RoleToggle } from "./RoleToggle";
import { useToast } from "@/components/ui/Toast";
import { UserRole } from "@/types";
import Link from "next/link";



const buttonLabel: Record<UserRole, string> = {
  jobseeker: "Sign In as Job Seeker",
  employer:  "Sign In as Employer",
  admin:     "Sign In as Admin",
};

export function SignInForm() {
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

  // If URL param changes (e.g. user navigates here again), sync it
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
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Admin mode banner */}
      {role === "admin" && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          <Shield size={15} className="flex-shrink-0" />
          <span>
            <span className="font-semibold">Admin login.</span>{" "}
            Restricted access — authorised personnel only.
          </span>
        </div>
      )}

      <RoleToggle value={role} onChange={setRole} showAdmin={showAdminTab} />



      <Input
        label="Email address"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
      />

      <Input
        label="Password"
        type={showPassword ? "text" : "password"}
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="current-password"
        rightIcon={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
      />

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="rounded text-[#1e3a5f]" />
          <span className="text-gray-600">Remember me</span>
        </label>
        <Link href="/forgot-password" className="text-[#1e3a5f] hover:underline">
          Forgot password?
        </Link>
      </div>

      <Button
        type="submit"
        fullWidth
        loading={loading}
        className={role === "admin" ? "bg-red-600 hover:bg-red-700" : ""}
      >
        {buttonLabel[role]}
      </Button>

      {/* Hide Google OAuth on admin sign-in — admins always use credentials */}
      {role !== "admin" && (
        <>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs text-gray-400 bg-white px-2">
              or continue with
            </div>
          </div>

          <Button
            type="button"
            variant="secondary"
            fullWidth
            loading={googleLoading}
            onClick={handleGoogle}
            className="gap-2.5 border border-gray-250 bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100 hover:text-gray-900 shadow-sm"
          >
            <Google size={18} className="flex-shrink-0" />
            Sign in with Google
          </Button>
        </>
      )}

      {role !== "admin" && (
        <p className="text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link
            href={`/register?role=${role}`}
            className="text-[#1e3a5f] font-medium hover:underline"
          >
            Create one
          </Link>
        </p>
      )}
    </form>
  );
}
