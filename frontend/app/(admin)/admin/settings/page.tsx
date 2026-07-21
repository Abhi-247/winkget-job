"use client";

import { useState, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { authApi } from "@/lib/api";
import { KeyRound } from "lucide-react";

export default function AdminSettings() {
  const { data: session } = useSession();
  const { success, error } = useToast();

  const [currentPwd, setCurrentPwd]   = useState("");
  const [newPwd, setNewPwd]           = useState("");
  const [confirmPwd, setConfirmPwd]   = useState("");
  const [pwdLoading, setPwdLoading]   = useState(false);

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    if (newPwd !== confirmPwd) { error("Passwords do not match"); return; }
    if (newPwd.length < 6) { error("New password must be at least 6 characters"); return; }
    if (!session?.user.accessToken) return;
    setPwdLoading(true);
    try {
      await authApi.changePassword(session.user.accessToken, currentPwd, newPwd);
      success("Password changed successfully");
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
    } catch {
      error("Failed to change password. Check your current password.");
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Manage your admin account security and platform configuration.
        </p>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <KeyRound size={16} className="text-[#1e3a5f]" />
          <h3 className="font-semibold text-gray-900">Change Password</h3>
        </div>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={currentPwd}
            onChange={(e) => setCurrentPwd(e.target.value)}
            required
          />
          <Input
            label="New Password"
            type="password"
            value={newPwd}
            onChange={(e) => setNewPwd(e.target.value)}
            hint="Minimum 6 characters"
            required
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPwd}
            onChange={(e) => setConfirmPwd(e.target.value)}
            required
          />
          <Button type="submit" loading={pwdLoading}>
            Change Password
          </Button>
        </form>
      </div>
    </div>
  );
}
