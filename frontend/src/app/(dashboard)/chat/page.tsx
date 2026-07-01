"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Sparkles, CornerDownLeft, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { sendChatMessage } from '@/lib/api';
import type { SourceInfo } from '@/types';

type ChatMessage = {
  id: number;
  text: string;
  isBot: boolean;
  sources?: SourceInfo[];
};

const TypingIndicator = () => (
  <div className="flex items-center gap-1.5 px-2 py-1">
    <motion.div className="w-2 h-2 rounded-full bg-indigo-400" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
    <motion.div className="w-2 h-2 rounded-full bg-indigo-400" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
    <motion.div className="w-2 h-2 rounded-full bg-indigo-400" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
  </div>
);

const MessageBubble = ({ message, isBot, sources }: { message: string, isBot: boolean, sources?: SourceInfo[] }) => {
  const [expandedSource, setExpandedSource] = useState<number | null>(null);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex w-full ${isBot ? 'justify-start' : 'justify-end'} mb-6`}
    >
      <div className={`flex max-w-[85%] ${isBot ? 'flex-row' : 'flex-row-reverse'} items-end gap-3`}>
        <div className={`w-8 h-8 rounded-full border border-white/10 shrink-0 flex items-center justify-center ${isBot ? 'bg-indigo-600 text-white' : 'bg-white text-black'}`}>
          {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
        </div>
        
        <div className="flex flex-col gap-2 w-full">
          <div className={`px-5 py-3.5 rounded-2xl inline-block w-fit ${
            isBot 
              ? 'bg-white/5 border border-white/10 text-zinc-100 rounded-bl-none shadow-sm backdrop-blur-sm' 
              : 'bg-indigo-600 text-white rounded-br-none shadow-md ml-auto'
          }`}>
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message}</p>
          </div>

          {sources && sources.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {sources.map((source, idx) => (
                <div key={idx} className="relative">
                  <button 
                    onClick={() => setExpandedSource(expandedSource === idx ? null : idx)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] rounded-full border transition-all ${
                      expandedSource === idx 
                        ? 'bg-indigo-500/20 text-indigo-200 border-indigo-500/40' 
                        : 'bg-white/5 text-zinc-400 border-white/10 hover:bg-white/10 hover:text-zinc-300'
                    }`}
                  >
                    <FileText className="w-3 h-3" />
                    <span className="max-w-[150px] truncate">{source.document_title}</span>
                    {source.page_number && <span className="opacity-70">Pg {source.page_number}</span>}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Expanded Source Details */}
          <AnimatePresence>
            {expandedSource !== null && sources && sources[expandedSource] && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-2 p-4 rounded-xl bg-black/40 border border-white/10 text-sm text-zinc-300 relative">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-l-xl"></div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-white text-xs uppercase tracking-wider opacity-60">Source Excerpt</span>
                  </div>
                  <p className="italic leading-relaxed">"{sources[expandedSource].excerpt}"</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, text: "Hello! I'm your AI assistant. I have access to all your uploaded documents. What would you like to know?", isBot: true }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = input;
    setMessages(prev => [...prev, { id: Date.now(), text: userMessage, isBot: false }]);
    setInput("");
    setIsTyping(true);
    
    try {
      const response = await sendChatMessage(userMessage);
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: response.message, 
        isBot: true,
        sources: response.sources
      }]);
    } catch (error: any) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: "Sorry, I encountered an error communicating with the server.", 
        isBot: true 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current;
      scrollElement.scrollTop = scrollElement.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col items-center justify-center p-4 animate-in fade-in duration-500">
      <Card className="glass-card bg-white/5 w-full max-w-4xl h-full flex flex-col overflow-hidden border-white/10">
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white">AI Assistant</h2>
              <p className="text-xs text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 block animate-pulse"></span> Online
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scroll-smooth" ref={scrollRef}>
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg.text} isBot={msg.isBot} sources={msg.sources} />
          ))}
          {isTyping && (
            <div className="flex w-full justify-start mb-6">
              <div className="flex max-w-[80%] flex-row items-end gap-3">
                <div className="w-8 h-8 rounded-full border border-white/10 shrink-0 flex items-center justify-center bg-indigo-600 text-white">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="px-5 py-4 rounded-2xl bg-white/5 border border-white/10 rounded-bl-none backdrop-blur-sm">
                  <TypingIndicator />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-black/20 border-t border-white/10">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="relative flex items-center"
          >
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your documents..." 
              className="w-full pl-4 pr-14 py-6 bg-white/5 border-white/10 text-white rounded-2xl focus-visible:ring-1 focus-visible:ring-indigo-500 placeholder:text-zinc-500 text-base shadow-inner"
            />
            <Button 
              type="submit" 
              size="icon"
              disabled={!input.trim()} 
              className="absolute right-2 w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition-all"
            >
              <CornerDownLeft className="w-4 h-4" />
            </Button>
          </form>
          <p className="text-center text-[11px] text-zinc-500 mt-3">
            AI can make mistakes. Verify important information from source documents.
          </p>
        </div>
      </Card>
    </div>
  );
}
