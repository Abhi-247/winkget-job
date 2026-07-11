"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Conversation, Message } from "@/types";
import { messagesApi } from "@/lib/api";
import { getSocket, disconnectSocket } from "@/lib/socket";

interface UseMessagesOptions {
  token: string;
  initialConvId?: string | null;
}

export function useMessages({ token, initialConvId }: UseMessagesOptions) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages]           = useState<Message[]>([]);
  const [activeConvId, setActiveConvId]   = useState<string | null>(null);
  const [loading, setLoading]             = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Keep activeConvId accessible in socket callbacks without stale closure
  const activeConvIdRef = useRef<string | null>(null);
  activeConvIdRef.current = activeConvId;

  // ── load conversation list ─────────────────────────────────────────────────
  const fetchConversations = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = (await messagesApi.getConversations(token)) as {
        success: boolean;
        data: Conversation[];
      };
      setConversations(res.data ?? []);
      return res.data ?? [];
    } catch {
      return [];
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ── select a conversation ──────────────────────────────────────────────────
  const selectConversation = useCallback(
    async (convId: string) => {
      if (!token) return;
      setActiveConvId(convId);

      // Mark unread → 0 in local list immediately
      setConversations((prev) =>
        prev.map((c) => (c._id === convId ? { ...c, unreadCount: 0 } : c))
      );

      try {
        const [msgRes] = await Promise.all([
          messagesApi.getMessages(token, convId) as Promise<{
            success: boolean;
            data: { messages: Message[]; conversationId: string };
          }>,
          messagesApi.markRead(token, convId),
        ]);
        setMessages(msgRes.data.messages ?? []);
      } catch {
        setMessages([]);
      }
    },
    [token]
  );

  // ── send a message ─────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (text: string) => {
      if (!token || !activeConvIdRef.current || !text.trim()) return;
      const convId = activeConvIdRef.current;
      setSendingMessage(true);
      try {
        const res = (await messagesApi.sendMessage(token, convId, text)) as {
          success: boolean;
          data: Message;
        };
        // Optimistically append (socket echo from server also fires but we dedupe by _id)
        setMessages((prev) => {
          if (prev.some((m) => m._id === res.data._id)) return prev;
          return [...prev, res.data];
        });
      } catch {
        // message failed — could show toast here
      } finally {
        setSendingMessage(false);
      }
    },
    [token]
  );

  // ── get or create a conversation, then select it ───────────────────────────
  const startConversation = useCallback(
    async (participantId: string, jobId?: string): Promise<string | null> => {
      if (!token) return null;
      try {
        const res = (await messagesApi.getOrCreateConversation(token, {
          participantId,
          jobId,
        })) as { success: boolean; data: Conversation };
        const conv = res.data;
        // Add to list if not already present
        setConversations((prev) => {
          if (prev.some((c) => c._id === conv._id)) return prev;
          return [conv, ...prev];
        });
        await selectConversation(conv._id);
        return conv._id;
      } catch {
        return null;
      }
    },
    [token, selectConversation]
  );

  // ── Socket.IO real-time setup ──────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;

    const socket = getSocket(token);

    socket.on(
      "new_message",
      (payload: { conversationId: string; message: Message }) => {
        const { conversationId, message } = payload;

        // If the message is in the active conversation → append
        if (conversationId === activeConvIdRef.current) {
          setMessages((prev) => {
            if (prev.some((m) => m._id === message._id)) return prev;
            return [...prev, message];
          });
          // Auto-mark read since the user is looking at it
          messagesApi.markRead(token, conversationId).catch(() => {});
        } else {
          // Otherwise increment unread badge on that conversation
          setConversations((prev) =>
            prev.map((c) =>
              c._id === conversationId
                ? { ...c, unreadCount: (c.unreadCount ?? 0) + 1 }
                : c
            )
          );
        }
      }
    );

    socket.on("conversation_updated", (updatedConv: Conversation) => {
      setConversations((prev) => {
        const exists = prev.some((c) => c._id === updatedConv._id);
        if (!exists) return [updatedConv, ...prev];
        return prev
          .map((c) =>
            c._id === updatedConv._id
              ? {
                  ...updatedConv,
                  // preserve local unreadCount if this is the active conv
                  unreadCount:
                    c._id === activeConvIdRef.current
                      ? 0
                      : updatedConv.unreadCount ?? c.unreadCount,
                }
              : c
          )
          .sort(
            (a, b) =>
              new Date(b.lastActivity).getTime() -
              new Date(a.lastActivity).getTime()
          );
      });
    });

    return () => {
      socket.off("new_message");
      socket.off("conversation_updated");
      disconnectSocket();
    };
  }, [token]);

  // ── initial load + optional deep-link selection ────────────────────────────
  useEffect(() => {
    if (!token) return;
    fetchConversations().then((convs) => {
      if (!convs || convs.length === 0) return;
      const target = initialConvId && convs.some((c) => c._id === initialConvId)
        ? initialConvId
        : null;
      if (target) selectConversation(target);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return {
    conversations,
    messages,
    activeConvId,
    loading,
    sendingMessage,
    selectConversation,
    sendMessage,
    startConversation,
  };
}
