"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, User, Mail, Lock, Building } from "lucide-react";
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
        role,
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
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <RoleToggle value={role} onChange={setRole} />

      {/* Grid container for input fields: side-by-side on desktop (md+) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className={role === "employer" ? "" : "md:col-span-2"}>
          <Input
            label="Full Name"
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
            leftIcon={<User size={15} className="text-gray-405" />}
          />
        </div>

        {role === "employer" && (
          <Input
            label="Company Name"
            type="text"
            placeholder="Enter your company name"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
            leftIcon={<Building size={15} className="text-gray-405" />}
          />
        )}

        <div className="md:col-span-2">
          <Input
            label="Email address"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            leftIcon={<Mail size={15} className="text-gray-405" />}
          />
        </div>

        <div>
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            leftIcon={<Lock size={15} className="text-gray-405" />}
            rightIcon={
              <button
                type="button"
                className="text-gray-400 hover:text-gray-650 transition-colors focus:outline-none cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
          />
        </div>

        <div>
          <Input
            label="Confirm Password"
            type={showPassword ? "text" : "password"}
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            leftIcon={<Lock size={15} className="text-gray-405" />}
          />
        </div>
      </div>

      <p className="text-[10px] text-gray-500 leading-relaxed">
        By registering, you agree to our{" "}
        <Link href="/terms" className="text-[#1e3a5f] font-semibold hover:underline">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-[#1e3a5f] font-semibold hover:underline">
          Privacy Policy
        </Link>
        .
      </p>

      <Button 
        type="submit" 
        fullWidth 
        loading={loading}
        className="h-10 rounded-xl font-semibold shadow-md shadow-blue-900/10 transition-all transform active:scale-95 bg-[#1e3a5f] hover:bg-[#152a45] text-sm"
      >
        Create {role === "employer" ? "Employer" : "Freelancer"} Account
      </Button>

      <div className="relative my-2.5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-[9px] uppercase tracking-wider text-gray-400 bg-white px-2.5 font-semibold">
          or continue with
        </div>
      </div>

      <Button
        type="button"
        variant="secondary"
        fullWidth
        loading={googleLoading}
        onClick={handleGoogle}
        className="h-10 rounded-xl gap-2 border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100 shadow-sm transition-all text-xs font-semibold"
      >
        <Google size={16} className="flex-shrink-0" />
        Sign up with Google
      </Button>

      <p className="text-center text-xs text-gray-555 mt-4">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-[#1e3a5f] font-bold hover:text-[#d4a017] hover:underline transition-colors">
          Sign In
        </Link>
      </p>
    </form>
  );
}
