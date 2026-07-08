"use client";

import { MessageSquare } from "lucide-react";

const mockConversations = [
  { id: "1", name: "Rahul Verma", role: "React Developer", lastMessage: "I can start immediately...", time: "1h ago", unread: 1 },
  { id: "2", name: "Priya Sharma", role: "UI/UX Designer", lastMessage: "Portfolio attached.", time: "2d ago", unread: 0 },
];

export default function EmployerMessagesPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Messages</h2>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100 h-[500px]">
          <div className="overflow-y-auto">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700">Conversations</h3>
            </div>
            {mockConversations.map((conv) => (
              <button key={conv.id} className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-sm font-medium text-gray-900">{conv.name}</span>
                  <span className="text-xs text-gray-400">{conv.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500 truncate">{conv.role} — {conv.lastMessage}</p>
                  {conv.unread > 0 && (
                    <span className="w-4 h-4 bg-[#1e3a5f] rounded-full text-white text-xs flex items-center justify-center flex-shrink-0">{conv.unread}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
          <div className="col-span-2 flex flex-col items-center justify-center text-center p-8">
            <MessageSquare size={40} className="text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm">Select a conversation</p>
            <p className="text-xs text-gray-300 mt-1">Real-time chat coming in Phase 2</p>
          </div>
        </div>
      </div>
    </div>
  );
}
