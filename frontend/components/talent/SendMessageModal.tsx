"use client";

import { useState, useEffect, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { User, Job } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { jobsApi, messagesApi } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

// ─── StyledSelect (same helper as HireRequestModal) ───────────────────────────

function StyledSelect({
  label, value, onChange, children, disabled,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900",
          "focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent",
          "disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
        )}
      >
        {children}
      </select>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface SendMessageModalProps {
  freelancer: User | null;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SendMessageModal({ freelancer, onClose }: SendMessageModalProps) {
  const { data: session } = useSession();
  const router            = useRouter();
  const { success, error } = useToast();

  const [myJobs,      setMyJobs]      = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState("");
  const [message,     setMessage]     = useState("");
  const [sending,     setSending]     = useState(false);

  const isEmployer = session?.user?.role === "employer";
  const hasSession = !!session;

  // Reset on open
  useEffect(() => {
    if (!freelancer) return;
    setSelectedJob("");
    setMessage("");
  }, [freelancer]);

  // Fetch employer's jobs for the related-job dropdown
  useEffect(() => {
    if (!freelancer || !isEmployer || !session?.user?.accessToken) return;
    setJobsLoading(true);
    jobsApi.getMyJobs(session.user.accessToken)
      .then((res) => {
        const jobs = (res as { data: Job[] }).data ?? [];
        setMyJobs(jobs);
      })
      .catch(() => setMyJobs([]))
      .finally(() => setJobsLoading(false));
  }, [freelancer, isEmployer, session]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim()) { error("Please write a message"); return; }
    if (!session?.user?.accessToken || !freelancer) return;
    setSending(true);
    try {
      // Get or create a conversation, then send the first message
      const convRes = (await messagesApi.getOrCreateConversation(
        session.user.accessToken,
        {
          participantId: freelancer._id,
          jobId:         selectedJob || undefined,
        }
      )) as { success: boolean; data: { _id: string } };

      await messagesApi.sendMessage(
        session.user.accessToken,
        convRes.data._id,
        message.trim()
      );

      success(`Message sent to ${freelancer.name.split(" ")[0]}!`);
      onClose();
      // Navigate to the conversation
      router.push(`/${session.user.role === "employer" ? "employer" : "jobseeker"}/messages?thread=${convRes.data._id}`);
    } catch {
      error("Failed to send message — please try again");
    } finally {
      setSending(false);
    }
  };

  if (!freelancer) return null;

  return (
    <Modal open={!!freelancer} onClose={onClose} title="Send Message" size="sm">
      {/* Not logged in */}
      {!hasSession && (
        <div className="text-center py-4 space-y-3">
          <p className="text-sm text-gray-600">
            Please sign in to send messages.
          </p>
          <Button
            fullWidth
            onClick={() => {
              onClose();
              router.push("/sign-in");
            }}
          >
            Sign In
          </Button>
        </div>
      )}

      {/* Non-employer account */}
      {hasSession && !isEmployer && (
        <div className="text-center py-4 space-y-3">
          <p className="text-sm text-gray-600">
            Please log in with an employer account to message freelancers.
          </p>
          <Button variant="outline" fullWidth onClick={onClose}>
            Close
          </Button>
        </div>
      )}

      {/* Logged in Employer */}
      {hasSession && isEmployer && (
        <form onSubmit={handleSend} className="space-y-4">
          {/* Recipient card */}
          <Card className="p-3 flex items-center gap-3 bg-gray-50 border-gray-200">
            <Avatar name={freelancer.name} src={freelancer.avatar} size="sm" className="flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{freelancer.name}</p>
              <p className="text-xs text-gray-400 truncate">
                {freelancer.title || "Freelancer"}
              </p>
            </div>
          </Card>

          {/* Related job (optional) — only shown to employers */}
          {isEmployer && (
            <StyledSelect
              label="Related Job (optional)"
              value={selectedJob}
              onChange={setSelectedJob}
              disabled={jobsLoading}
            >
              <option value="">No specific job</option>
              {jobsLoading && <option disabled>Loading…</option>}
              {myJobs.map((j) => (
                <option key={j._id} value={j._id}>{j.title}</option>
              ))}
            </StyledSelect>
          )}

          {/* Message textarea */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Message</label>
            <textarea
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Write your message to ${freelancer.name.split(" ")[0]}…`}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-shrink-0">
              Cancel
            </Button>
            <Button type="submit" fullWidth loading={sending}>
              Send Message
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
