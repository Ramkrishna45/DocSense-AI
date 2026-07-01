'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ChatWindow from '@/components/chat/ChatWindow';
import { apiFetch } from '@/lib/api';

export default function NewChatPage() {
  const router = useRouter();
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async (message: string) => {
    setIsSending(true);
    try {
      const res = await apiFetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message }),
      });
      // Redirect to the new conversation
      if (res.conversation_id) {
        router.push(`/chat/${res.conversation_id}`);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsSending(false);
    }
  };

  const suggestions = [
    "Summarize my latest document",
    "What are the key topics in my notes?",
    "Compare concepts from different documents"
  ];

  const emptyState = (
    <div className="max-w-md mx-auto text-center space-y-6">
      <div className="w-16 h-16 bg-gradient-to-tr from-violet-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20 mb-4">
        <span className="text-2xl text-white">✨</span>
      </div>
      <h2 className="text-2xl font-semibold text-slate-100">How can I help you today?</h2>
      <p className="text-slate-400">Ask a question and I'll search your documents to find the answer.</p>
      
      <div className="grid grid-cols-1 gap-2 pt-4">
        {suggestions.map((text, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(text)}
            className="p-3 rounded-xl border border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-indigo-500/50 transition-all text-sm text-left"
          >
            → {text}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-8rem)] animate-fadeIn">
      <ChatWindow 
        messages={[]} 
        isLoading={isSending} 
        onSendMessage={handleSendMessage}
        emptyStateContent={emptyState}
      />
    </div>
  );
}
