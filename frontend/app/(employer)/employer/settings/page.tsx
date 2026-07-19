"use client";

import { useState, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { authApi } from "@/lib/api";
import Link from "next/link";

export default function EmployerSettings() {
  const { data: session } = useSession();
  const { success, error } = useToast();

  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    if (newPwd !== confirmPwd) { error("Passwords do not match"); return; }
    if (!session?.user.accessToken) return;
    setPwdLoading(true);
    try {
      await authApi.changePassword(session.user.accessToken, currentPwd, newPwd);
      success("Password changed");
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
    } catch {
      error("Failed to change password");
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500 mt-1">
          Manage your password and account security.{" "}
          <Link
            href="/employer/profile"
            className="text-[#1e3a5f] font-medium hover:underline"
          >
            To update your company profile, visit the Profile page →
          </Link>
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-6">Change Password</h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <Input label="Current Password" type="password" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} required />
          <Input label="New Password" type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} required />
          <Input label="Confirm New Password" type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} required />
          <Button type="submit" variant="secondary" loading={pwdLoading}>Change Password</Button>
        </form>
      </div>
    </div>
  );
}
