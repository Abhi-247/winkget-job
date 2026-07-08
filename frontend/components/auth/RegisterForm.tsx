"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";
import { Google } from "@/components/ui/BrandIcons";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { RoleToggle } from "./RoleToggle";
import { useToast } from "@/components/ui/Toast";
import { UserRole } from "@/types";
import { authApi } from "@/lib/api";
import Link from "next/link";

interface RegisterFormProps {
  defaultRole?: UserRole;
}

export function RegisterForm({ defaultRole = "jobseeker" }: RegisterFormProps) {
  const router = useRouter();
  const { error: showError, success } = useToast();

  const [role, setRole] = useState<UserRole>(defaultRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      showError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      await authApi.register({ name, email, password, role, company });
      success("Account created! Signing you in...");

      // Auto sign-in after registration
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        showError("Registration succeeded but auto sign-in failed. Please sign in.");
        router.push("/sign-in");
      } else {
        router.push(`/${role}/dashboard`);
        router.refresh();
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: `/${role}/dashboard` });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <RoleToggle value={role} onChange={setRole} />

      <Input
        label="Full Name"
        type="text"
        placeholder="John Doe"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        autoComplete="name"
      />

      {role === "employer" && (
        <Input
          label="Company Name"
          type="text"
          placeholder="Acme Corp"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          required
        />
      )}

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
        placeholder="At least 8 characters"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="new-password"
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

      <Input
        label="Confirm Password"
        type={showPassword ? "text" : "password"}
        placeholder="Repeat your password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        autoComplete="new-password"
      />

      <p className="text-xs text-gray-500">
        By registering you agree to our{" "}
        <Link href="/terms" className="text-[#1e3a5f] hover:underline">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-[#1e3a5f] hover:underline">
          Privacy Policy
        </Link>
        .
      </p>

      <Button type="submit" fullWidth loading={loading}>
        Create {role === "employer" ? "Employer" : "Freelancer"} Account
      </Button>

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
        Sign up with Google
      </Button>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-[#1e3a5f] font-medium hover:underline">
          Sign In
        </Link>
      </p>
    </form>
  );
}
