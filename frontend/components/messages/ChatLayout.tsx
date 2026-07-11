"use client";

import { useEffect, useRef, useState, KeyboardEvent } from "react";
import { Conversation, Message } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Search,
  Send,
  MessageSquare,
  ArrowLeft,
  Loader2,
} from "lucide-react";

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatMsgTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function formatListTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffH = (now.getTime() - d.getTime()) / 3600000;
  if (diffH < 24) return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  if (diffH < 168) return d.toLocaleDateString("en-IN", { weekday: "short" });
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function dateSeparatorLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const msgDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (msgDay.getTime() === today.getTime()) return "Today";
  if (msgDay.getTime() === yesterday.getTime()) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// ─── props ────────────────────────────────────────────────────────────────────

export interface ChatLayoutProps {
  conversations: Conversation[];
  messages: Message[];
  activeConvId: string | null;
  currentUserId: string;
  loading: boolean;
  sendingMessage: boolean;
  pageTitle?: string;
  pageSubtitle?: string;
  onSelectConversation: (id: string) => void;
  onSendMessage: (text: string) => void;
}

// ─── ConversationRow ──────────────────────────────────────────────────────────

function ConversationRow({
  conv,
  currentUserId,
  active,
  onClick,
}: {
  conv: Conversation;
  currentUserId: string;
  active: boolean;
  onClick: () => void;
}) {
  const other = conv.participants.find((p) => p._id !== currentUserId);
  const displayName = other?.company || other?.name || "Unknown";
  const lastMsg = conv.lastMessage;
  const preview = lastMsg
    ? (typeof lastMsg.sender === "object" && lastMsg.sender._id === currentUserId
        ? "You: "
        : "") + lastMsg.text.slice(0, 55) + (lastMsg.text.length > 55 ? "…" : "")
    : "No messages yet";

  return (
    <div
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-3.5 flex items-start gap-3 transition-colors border-l-2 hover:bg-gray-50 cursor-pointer",
        active ? "bg-gray-50 border-[#1e3a5f]" : "border-transparent"
      )}
    >
      {other?._id ? (
        <Link
          href={`/portfolio/${other._id}`}
          onClick={(e) => e.stopPropagation()}
          className="relative flex-shrink-0 mt-0.5 hover:opacity-80 transition-opacity z-10"
        >
          <Avatar name={displayName} src={other?.avatar} size="sm" />
        </Link>
      ) : (
        <div className="relative flex-shrink-0 mt-0.5">
          <Avatar name={displayName} src={other?.avatar} size="sm" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          {other?._id ? (
            <Link
              href={`/portfolio/${other._id}`}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "text-sm truncate hover:underline hover:text-[#1e3a5f] z-10",
                active ? "font-semibold text-[#1e3a5f]" : "font-medium text-gray-900"
              )}
            >
              {displayName}
            </Link>
          ) : (
            <span className={cn("text-sm truncate", active ? "font-semibold text-[#1e3a5f]" : "font-medium text-gray-900")}>
              {displayName}
            </span>
          )}
          <span className="text-[10px] text-gray-400 flex-shrink-0">
            {lastMsg ? formatListTime(lastMsg.createdAt) : formatListTime(conv.createdAt)}
          </span>
        </div>
        {conv.jobContext && (
          <p className="text-[11px] text-gray-400 truncate mb-0.5">
            Re: {conv.jobContext.title}
          </p>
        )}
        <div className="flex items-center justify-between gap-1">
          <p className="text-xs text-gray-400 truncate flex-1">{preview}</p>
          {conv.unreadCount > 0 && (
            <span className="flex-shrink-0 min-w-[18px] h-[18px] bg-[#1e3a5f] rounded-full text-white text-[10px] font-bold flex items-center justify-center px-1">
              {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── DateSeparator ────────────────────────────────────────────────────────────

function DateSeparator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-3">
      <div className="flex-1 h-px bg-gray-100" />
      <span className="text-[11px] text-gray-400 font-medium px-2">{label}</span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

// ─── MessageBubble ────────────────────────────────────────────────────────────

function MessageBubble({
  msg,
  isMe,
  showAvatar,
  otherName,
  otherAvatar,
}: {
  msg: Message;
  isMe: boolean;
  showAvatar: boolean;
  otherName: string;
  otherAvatar?: string;
}) {
  return (
    <div className={cn("flex items-end gap-2", isMe ? "flex-row-reverse" : "flex-row")}>
      {/* Other-side avatar placeholder for alignment */}
      {!isMe && (
        <div className="w-7 flex-shrink-0">
          {showAvatar && (
            <Avatar name={otherName} src={otherAvatar} size="xs" />
          )}
        </div>
      )}

      <div
        className={cn(
          "max-w-[68%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words",
          isMe
            ? "bg-[#1e3a5f] text-white rounded-br-sm"
            : "bg-gray-100 text-gray-800 rounded-bl-sm"
        )}
      >
        <p>{msg.text}</p>
        <p className={cn("text-[10px] mt-1 select-none", isMe ? "text-white/50 text-right" : "text-gray-400")}>
          {formatMsgTime(msg.createdAt)}
        </p>
      </div>
    </div>
  );
}

// ─── ChatLayout ───────────────────────────────────────────────────────────────

export function ChatLayout({
  conversations,
  messages,
  activeConvId,
  currentUserId,
  loading,
  sendingMessage,
  pageTitle = "Messages",
  pageSubtitle = "Real-time conversations",
  onSelectConversation,
  onSendMessage,
}: ChatLayoutProps) {
  const [search, setSearch] = useState("");
  const [inputText, setInputText] = useState("");
  const [mobileShowThread, setMobileShowThread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeConv = conversations.find((c) => c._id === activeConvId) ?? null;
  const other = activeConv
    ? activeConv.participants.find((p) => p._id !== currentUserId)
    : null;
  const otherName = other?.company || other?.name || "User";

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when conversation changes
  useEffect(() => {
    if (activeConvId) setTimeout(() => inputRef.current?.focus(), 80);
  }, [activeConvId]);

  const handleSelect = (id: string) => {
    onSelectConversation(id);
    setMobileShowThread(true);
  };

  const handleSend = () => {
    const text = inputText.trim();
    if (!text || sendingMessage) return;
    onSendMessage(text);
    setInputText("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // Date-separator logic
  let lastDateLabel = "";

  const filteredConvs = search.trim()
    ? conversations.filter((c) => {
        const p = c.participants.find((p) => p._id !== currentUserId);
        const name = (p?.company || p?.name || "").toLowerCase();
        const job = (c.jobContext?.title || "").toLowerCase();
        const q = search.toLowerCase();
        return name.includes(q) || job.includes(q);
      })
    : conversations;

  return (
    <div className="space-y-4 font-[family-name:var(--font-poppins)]">
      {/* Page header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">{pageTitle}</h2>
        <p className="text-sm text-gray-400 mt-0.5">{pageSubtitle}</p>
      </div>

      {/* Split-pane shell */}
      <div
        className="w-full bg-white rounded-xl border border-gray-200 overflow-hidden flex"
        style={{ height: "calc(100vh - 200px)", minHeight: "500px" }}
      >
        {/* ══ LEFT PANEL ══════════════════════════════════════════════════════ */}
        <div
          className={cn(
            "flex flex-col w-full md:w-72 lg:w-80 flex-shrink-0 border-r border-gray-100",
            mobileShowThread ? "hidden md:flex" : "flex"
          )}
        >
          {/* Search */}
          <div className="p-3 border-b border-gray-100 flex-shrink-0">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search conversations…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/40 focus:border-[#1e3a5f]"
              />
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2 pt-1">
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
                {!search && (
                  <p className="text-xs text-gray-300 mt-1">
                    Start a conversation from an application or hire request.
                  </p>
                )}
              </div>
            ) : (
              filteredConvs.map((conv) => (
                <ConversationRow
                  key={conv._id}
                  conv={conv}
                  currentUserId={currentUserId}
                  active={activeConvId === conv._id}
                  onClick={() => handleSelect(conv._id)}
                />
              ))
            )}
          </div>
        </div>

        {/* ══ RIGHT PANEL ═════════════════════════════════════════════════════ */}
        <div
          className={cn(
            "flex-1 flex flex-col min-w-0",
            !mobileShowThread ? "hidden md:flex" : "flex"
          )}
        >
          {activeConv && other ? (
            <>
              {/* Thread header */}
              <div className="flex-shrink-0 px-4 py-3 border-b border-gray-100 flex items-center gap-3 bg-white">
                <button
                  className="md:hidden p-1.5 -ml-1 rounded-lg text-gray-400 hover:bg-gray-100"
                  onClick={() => setMobileShowThread(false)}
                  aria-label="Back"
                >
                  <ArrowLeft size={18} />
                </button>
                <Link
                  href={`/portfolio/${other._id}`}
                  className="flex items-center gap-3 hover:opacity-85 transition-opacity min-w-0 flex-1"
                >
                  <Avatar name={otherName} src={other.avatar} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{otherName}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {activeConv.jobContext
                        ? `Re: ${activeConv.jobContext.title}`
                        : other.title || other.role || ""}
                    </p>
                  </div>
                </Link>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-xs text-gray-400">Online</span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageSquare size={36} className="text-gray-200 mb-2" />
                    <p className="text-sm text-gray-400">No messages yet.</p>
                    <p className="text-xs text-gray-300 mt-1">Say hello to start the conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {messages.map((msg, idx) => {
                      const isMe = msg.sender._id === currentUserId;
                      const label = dateSeparatorLabel(msg.createdAt);
                      const showSep = label !== lastDateLabel;
                      if (showSep) lastDateLabel = label;

                      // Show avatar for first message in a run from the other person
                      const prevMsg = messages[idx - 1];
                      const showAvatar =
                        !isMe &&
                        (!prevMsg || prevMsg.sender._id !== msg.sender._id || showSep);

                      return (
                        <div key={msg._id}>
                          {showSep && <DateSeparator label={label} />}
                          <MessageBubble
                            msg={msg}
                            isMe={isMe}
                            showAvatar={showAvatar}
                            otherName={otherName}
                            otherAvatar={other.avatar}
                          />
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Input bar */}
              <div className="flex-shrink-0 px-4 py-3 border-t border-gray-100 flex items-center gap-2 bg-white">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Type a message…"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={sendingMessage}
                  className="flex-1 min-w-0 px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/40 focus:border-[#1e3a5f] disabled:opacity-60"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim() || sendingMessage}
                  aria-label="Send message"
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                    inputText.trim() && !sendingMessage
                      ? "bg-[#1e3a5f] text-white hover:bg-[#162d4a] active:scale-95"
                      : "bg-gray-100 text-gray-300 cursor-not-allowed"
                  )}
                >
                  {sendingMessage
                    ? <Loader2 size={16} className="animate-spin" />
                    : <Send size={16} />}
                </button>
              </div>
            </>
          ) : (
            /* Nothing selected */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <MessageSquare size={28} className="text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                {loading ? "Loading…" : conversations.length === 0 ? "No conversations yet" : "Select a conversation"}
              </p>
              <p className="text-xs text-gray-400 max-w-xs">
                {!loading && conversations.length === 0
                  ? "Start a conversation from an application or hire request."
                  : "Pick a conversation on the left to start chatting."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
