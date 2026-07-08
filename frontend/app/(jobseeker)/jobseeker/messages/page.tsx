"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { hireRequestsApi } from "@/lib/api";
import { HireRequest } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { cn, formatCurrency } from "@/lib/utils";
import { Search, Send, MessageSquare, ArrowLeft, Info } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  senderId: string;   // employerId or "me"
  text: string;
  timestamp: string;  // ISO string
}

interface Conversation {
  employerId: string;
  employerName: string;
  employerCompany: string;
  jobTitle: string;
  salary: number;
  lastMessage: string;
  lastTime: string;
  hireRequestId: string;
}

// ─── localStorage helpers ─────────────────────────────────────────────────────

const MESSAGES_PREFIX = "winkgetjob_msgs_";

function loadMessages(employerId: string): ChatMessage[] {
  try {
    const raw = localStorage.getItem(`${MESSAGES_PREFIX}${employerId}`);
    return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
  } catch {
    return [];
  }
}

function saveMessages(employerId: string, messages: ChatMessage[]) {
  try {
    localStorage.setItem(
      `${MESSAGES_PREFIX}${employerId}`,
      JSON.stringify(messages)
    );
  } catch {
    // ignore quota errors
  }
}

function seedOpeningMessage(
  employerId: string,
  employerName: string,
  jobTitle: string
): ChatMessage[] {
  const existing = loadMessages(employerId);
  if (existing.length > 0) return existing;

  const opening: ChatMessage = {
    id: `seed_${employerId}`,
    senderId: employerId,
    text: `Hello! I came across your profile and I'm interested in having you work on "${jobTitle}". Are you available to discuss further?`,
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 min ago
  };
  const seeded = [opening];
  saveMessages(employerId, seeded);
  return seeded;
}

// ─── Time formatter ───────────────────────────────────────────────────────────

function formatMessageTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ConversationRow({
  conv,
  active,
  onClick,
}: {
  conv: Conversation;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-3.5 flex items-start gap-3 transition-colors border-l-2",
        active
          ? "bg-[#edf2f7] border-[#d4a017]"
          : "border-transparent hover:bg-gray-50"
      )}
    >
      <Avatar
        name={conv.employerCompany || conv.employerName}
        size="sm"
        className="flex-shrink-0 mt-0.5"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <span className="text-sm font-semibold text-gray-900 truncate">
            {conv.employerName}
          </span>
          <span className="text-[11px] text-gray-400 flex-shrink-0">
            {conv.lastTime}
          </span>
        </div>
        <p className="text-xs text-gray-400 truncate">{conv.jobTitle}</p>
        <p className="text-xs text-gray-400 truncate mt-0.5">{conv.lastMessage}</p>
      </div>
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const initialThread = searchParams.get("thread");

  const [hireRequests, setHireRequests]         = useState<HireRequest[]>([]);
  const [loading, setLoading]                   = useState(true);
  const [conversations, setConversations]       = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId]         = useState<string | null>(null);
  const [messages, setMessages]                 = useState<ChatMessage[]>([]);
  const [inputText, setInputText]               = useState("");
  const [search, setSearch]                     = useState("");
  const [mobileShowThread, setMobileShowThread] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Fetch hire requests ──
  const fetchRequests = useCallback(async () => {
    if (!session?.user.accessToken) return;
    setLoading(true);
    try {
      const res = (await hireRequestsApi.getMy(
        session.user.accessToken
      )) as { data: HireRequest[] };
      setHireRequests(res.data || []);
    } catch {
      setHireRequests([]);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // ── Build conversations from hire requests ──
  useEffect(() => {
    if (!hireRequests.length) return;

    // Group by employer id, keep most recent request per employer
    const byEmployer = new Map<string, HireRequest>();
    for (const req of hireRequests) {
      const emp = typeof req.employer === "object" ? req.employer : null;
      if (!emp) continue;
      const existing = byEmployer.get(emp._id);
      if (!existing || new Date(req.createdAt) > new Date(existing.createdAt)) {
        byEmployer.set(emp._id, req);
      }
    }

    const convs: Conversation[] = [];
    byEmployer.forEach((req, empId) => {
      const employer = typeof req.employer === "object" ? req.employer : null;
      const job      = typeof req.job      === "object" ? req.job      : null;
      if (!employer) return;

      const empName    = employer.name    || "Employer";
      const empCompany = employer.company || empName;
      const jobTitle   = job?.title       || "Job Opportunity";

      // Seed opening message if first time
      const msgs = seedOpeningMessage(empId, empCompany, jobTitle);
      const last = msgs[msgs.length - 1];

      convs.push({
        employerId:     empId,
        employerName:   empName,
        employerCompany: empCompany,
        jobTitle,
        salary:         req.salary,
        lastMessage:    last?.text?.slice(0, 60) + (last?.text?.length > 60 ? "…" : "") || "",
        lastTime:       formatMessageTime(last?.timestamp || req.createdAt),
        hireRequestId:  req._id,
      });
    });

    setConversations(convs);

    // Auto-select: ?thread= param, or first conversation
    if (convs.length > 0) {
      const threadId = initialThread && convs.find((c) => c.employerId === initialThread)
        ? initialThread
        : convs[0].employerId;
      setActiveConvId(threadId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hireRequests]);

  // ── Load messages when active conversation changes ──
  useEffect(() => {
    if (!activeConvId) return;
    const msgs = loadMessages(activeConvId);
    setMessages(msgs);
  }, [activeConvId]);

  // ── Scroll to bottom on new messages ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Select conversation ──
  const selectConversation = (empId: string) => {
    setActiveConvId(empId);
    setMobileShowThread(true);
    const msgs = loadMessages(empId);
    setMessages(msgs);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // ── Send message ──
  const sendMessage = () => {
    if (!inputText.trim() || !activeConvId) return;

    const newMsg: ChatMessage = {
      id:         `msg_${Date.now()}`,
      senderId:   "me",
      text:       inputText.trim(),
      timestamp:  new Date().toISOString(),
    };

    const updated = [...messages, newMsg];
    setMessages(updated);
    saveMessages(activeConvId, updated);

    // Update last message preview in conversation list
    setConversations((prev) =>
      prev.map((c) =>
        c.employerId === activeConvId
          ? {
              ...c,
              lastMessage: newMsg.text.slice(0, 60) + (newMsg.text.length > 60 ? "…" : ""),
              lastTime:    formatMessageTime(newMsg.timestamp),
            }
          : c
      )
    );

    setInputText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Active conversation data ──
  const activeConv = conversations.find((c) => c.employerId === activeConvId);

  // ── Filtered conversation list ──
  const filteredConvs = search.trim()
    ? conversations.filter(
        (c) =>
          c.employerName.toLowerCase().includes(search.toLowerCase()) ||
          c.jobTitle.toLowerCase().includes(search.toLowerCase())
      )
    : conversations;

  // ── My user id ──
  const myId = session?.user?.id || "me";

  return (
    <div className="space-y-4">
      {/* ── Header ── */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Messages</h2>
        <p className="text-sm text-gray-400 mt-0.5">Conversations with employers</p>
      </div>

      {/* ── Local-only info banner ── */}
      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-xs text-amber-700">
        <Info size={13} className="flex-shrink-0 mt-0.5" />
        <span>
          Messages are stored locally in your browser — real-time sync coming soon.
        </span>
      </div>

      {/* ── Split pane ── */}
      <div
        className="bg-white rounded-xl border border-gray-200 overflow-hidden"
        style={{ height: "calc(100vh - 220px)", minHeight: "480px" }}
      >
        <div className="flex h-full">

          {/* ════ Left panel: conversation list ════ */}
          <div
            className={cn(
              "flex flex-col w-full md:w-72 lg:w-80 flex-shrink-0 border-r border-gray-100",
              // On mobile, hide list when thread is open
              mobileShowThread ? "hidden md:flex" : "flex"
            )}
          >
            {/* Search */}
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
              {loading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex gap-3 animate-pulse">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-3/4" />
                        <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredConvs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <MessageSquare size={32} className="text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400">
                    {search ? "No conversations match." : "No conversations yet."}
                  </p>
                  <p className="text-xs text-gray-300 mt-1">
                    Conversations appear when employers send hire requests.
                  </p>
                </div>
              ) : (
                filteredConvs.map((conv) => (
                  <ConversationRow
                    key={conv.employerId}
                    conv={conv}
                    active={activeConvId === conv.employerId}
                    onClick={() => selectConversation(conv.employerId)}
                  />
                ))
              )}
            </div>
          </div>

          {/* ════ Right panel: chat thread ════ */}
          <div
            className={cn(
              "flex-1 flex flex-col min-w-0",
              !mobileShowThread ? "hidden md:flex" : "flex"
            )}
          >
            {activeConv ? (
              <>
                {/* Thread header */}
                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                  {/* Mobile back button */}
                  <button
                    className="md:hidden p-1.5 -ml-1 rounded-lg text-gray-400 hover:bg-gray-100"
                    onClick={() => setMobileShowThread(false)}
                    aria-label="Back to conversations"
                  >
                    <ArrowLeft size={18} />
                  </button>

                  <Avatar
                    name={activeConv.employerCompany || activeConv.employerName}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {activeConv.employerName}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      Re: {activeConv.jobTitle}
                      {activeConv.salary > 0
                        ? ` · ${formatCurrency(activeConv.salary)}/mo`
                        : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="w-2 h-2 bg-[#edf2f7]0 rounded-full" />
                    <span className="text-xs text-gray-400">Online</span>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <MessageSquare size={36} className="text-gray-200 mb-2" />
                      <p className="text-sm text-gray-400">No messages yet.</p>
                      <p className="text-xs text-gray-300 mt-1">
                        Say hello to start the conversation!
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.senderId === "me" || msg.senderId === myId;
                      return (
                        <div
                          key={msg.id}
                          className={cn(
                            "flex items-end gap-2",
                            isMe ? "flex-row-reverse" : "flex-row"
                          )}
                        >
                          {/* Employer avatar on left */}
                          {!isMe && (
                            <Avatar
                              name={activeConv.employerCompany || activeConv.employerName}
                              size="xs"
                              className="flex-shrink-0 mb-1"
                            />
                          )}

                          <div
                            className={cn(
                              "max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                              isMe
                                ? "bg-[#1e3a5f] text-white rounded-br-sm"
                                : "bg-gray-100 text-gray-800 rounded-bl-sm"
                            )}
                          >
                            <p>{msg.text}</p>
                            <p
                              className={cn(
                                "text-[10px] mt-1",
                                isMe ? "text-[#d4a017]/70 text-right" : "text-gray-400"
                              )}
                            >
                              {formatMessageTime(msg.timestamp)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input bar */}
                <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Type a message..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!inputText.trim()}
                    aria-label="Send message"
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-colors flex-shrink-0",
                      inputText.trim()
                        ? "bg-[#1e3a5f] text-white hover:bg-[#152a45]"
                        : "bg-gray-100 text-gray-300 cursor-not-allowed"
                    )}
                  >
                    <Send size={16} />
                  </button>
                </div>
              </>
            ) : (
              /* No conversation selected */
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare size={28} className="text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {loading
                    ? "Loading conversations…"
                    : conversations.length === 0
                    ? "No conversations yet"
                    : "Select a conversation"}
                </p>
                <p className="text-xs text-gray-400 max-w-xs">
                  {conversations.length === 0 && !loading
                    ? "Conversations are created when employers send you hire requests."
                    : "Choose a conversation from the left to start chatting."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
