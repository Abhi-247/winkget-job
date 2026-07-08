"use client";

import { useState, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { useToast } from "@/components/ui/Toast";
import { authApi } from "@/lib/api";

export default function EmployerSettings() {
  const { data: session, update } = useSession();
  const { success, error } = useToast();
  const user = session?.user;

  const [name, setName] = useState(user?.name || "");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);

  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);

  const handleProfileSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!session?.user.accessToken) return;
    setLoading(true);
    try {
      await authApi.updateMe(session.user.accessToken, { name, company, location, bio });
      await update({ name });
      success("Profile updated");
    } catch {
      error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

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
      <h2 className="text-xl font-bold text-gray-900">Settings</h2>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-6">Company Profile</h3>
        <div className="flex items-center gap-4 mb-6">
          <Avatar name={user?.name || "User"} src={user?.image} size="xl" />
          <div>
            <p className="text-sm font-medium text-gray-700">{user?.name}</p>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>
        </div>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <Input label="Contact Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Company Name" placeholder="Acme Corp" value={company} onChange={(e) => setCompany(e.target.value)} />
          <Input label="Location" placeholder="Bengaluru, India" value={location} onChange={(e) => setLocation(e.target.value)} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Company Bio</label>
            <textarea rows={3} placeholder="Tell freelancers about your company..." value={bio} onChange={(e) => setBio(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] resize-none" />
          </div>
          <Button type="submit" loading={loading}>Save Profile</Button>
        </form>
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
