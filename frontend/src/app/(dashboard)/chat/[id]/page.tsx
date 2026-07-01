'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ChatWindow from '@/components/chat/ChatWindow';
import { apiFetch } from '@/lib/api';
import { Message } from '@/types';

export default function ExistingChatPage() {
  const { id } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await apiFetch(`/api/chat/conversations/${id}`);
        setMessages(res || []);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchMessages();
    }
  }, [id]);

  const handleSendMessage = async (messageText: string) => {
    setIsSending(true);
    
    // Optimistic UI update
    const optimisticUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      sources: null,
      confidence: null,
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, optimisticUserMessage]);
    
    try {
      const res = await apiFetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: messageText, conversation_id: id }),
      });
      
      // Update with real response
      setMessages(prev => {
        // Find if we already have the real user message and AI response
        // In a more robust implementation, we'd sync fully with the server
        return [...prev, {
          id: Date.now().toString() + 'ai',
          role: 'assistant',
          content: res.message,
          sources: res.sources,
          confidence: res.confidence,
          created_at: new Date().toISOString()
        }];
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove optimistic message on error or show error state
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] animate-fadeIn">
      <ChatWindow 
        messages={messages} 
        isLoading={isSending || isLoading} 
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
