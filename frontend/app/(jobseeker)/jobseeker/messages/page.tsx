"use client";

import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useMessages } from "@/lib/hooks/useMessages";
import { ChatLayout } from "@/components/messages/ChatLayout";

export default function JobSeekerMessagesPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const threadParam  = searchParams.get("thread"); // pre-selected conversation _id

  const token = session?.user?.accessToken ?? "";

  const {
    conversations,
    messages,
    activeConvId,
    loading,
    sendingMessage,
    selectConversation,
    sendMessage,
  } = useMessages({
    token,
    initialConvId: threadParam,
  });

  if (status === "loading") return null;

  return (
    <ChatLayout
      conversations={conversations}
      messages={messages}
      activeConvId={activeConvId}
      currentUserId={session?.user?.id ?? ""}
      loading={loading}
      sendingMessage={sendingMessage}
      pageTitle="Messages"
      pageSubtitle="Conversations with employers"
      onSelectConversation={selectConversation}
      onSendMessage={sendMessage}
    />
  );
}
