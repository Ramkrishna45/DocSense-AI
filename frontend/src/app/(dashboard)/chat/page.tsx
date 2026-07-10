"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Sparkles, CornerDownLeft, FileText, MessageSquare, Plus, Loader2, Clock, Layers, Database, X, Check, ExternalLink, ChevronRight } from "lucide-react";
import Link from 'next/link';
import { motion, AnimatePresence } from "framer-motion";
import { sendChatMessage, getConversations, getConversationMessages, getCollections, getDocuments } from '@/lib/api';
import type { SourceInfo, Conversation, Collection, Document } from '@/types';

type ChatMessage = {
  id: number | string;
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
            <div className="grid gap-2 mt-1">
              {sources.map((source, i) => {
                const snippet = encodeURIComponent(source.excerpt.substring(0, 50));
                return (
                  <div key={i} className={`p-3 rounded-lg border text-sm ${
                    !isBot 
                      ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-100'
                      : 'bg-white/5 border-white/10 text-zinc-300'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-3 h-3 text-indigo-400" />
                      <span className="font-medium text-white">{source.document_title}</span>
                      {source.page_number && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                          Page {source.page_number}
                        </span>
                      )}
                    </div>
                    <p className="opacity-80 italic line-clamp-2">"{source.excerpt}"</p>
                    
                    {source.page_number != null && (
                      <Link 
                        href={`/documents/${source.document_id}?page=${source.page_number || 1}&search=${snippet}`}
                        className="inline-flex items-center mt-2 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        View in Document <ChevronRight className="w-3 h-3 ml-1" />
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  
  const initialMessage: ChatMessage = { 
    id: 'initial', 
    text: "Hello! I'm your AI assistant. I have access to all your uploaded documents. What would you like to know?", 
    isBot: true 
  };
  
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [collections, setCollections] = useState<Collection[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showContextSelector, setShowContextSelector] = useState(false);
  const [contextMode, setContextMode] = useState<'all' | 'collection' | 'documents'>('all');
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("");
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);
  
  useEffect(() => {
    fetchConversations();
    fetchContextData();
  }, []);

  const fetchContextData = async () => {
    try {
      const [colData, docData] = await Promise.all([getCollections(), getDocuments()]);
      setCollections(colData);
      setDocuments(docData || []);
    } catch (error) {
      console.error("Failed to load context data", error);
    }
  };

  const fetchConversations = async () => {
    try {
      const data = await getConversations();
      setConversations(data);
    } catch (error) {
      console.error("Failed to load conversations", error);
    }
  };

  const handleNewChat = () => {
    setActiveConversationId(null);
    setMessages([initialMessage]);
  };

  const handleSelectConversation = async (id: string) => {
    setActiveConversationId(id);
    setIsLoadingHistory(true);
    try {
      const history = await getConversationMessages(id);
      if (history.length === 0) {
        setMessages([initialMessage]);
      } else {
        setMessages(history.map(msg => ({
          id: msg.id,
          text: msg.content,
          isBot: msg.role === 'assistant',
          sources: msg.sources || []
        })));
      }
    } catch (error) {
      console.error("Failed to load history", error);
      setMessages([{ id: Date.now(), text: "Failed to load conversation history.", isBot: true }]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = input;
    setMessages(prev => [...prev, { id: Date.now(), text: userMessage, isBot: false }]);
    setInput("");
    setIsTyping(true);
    
    try {
      const collectionIdToPass = contextMode === 'collection' && selectedCollectionId ? selectedCollectionId : null;
      const documentIdsToPass = contextMode === 'documents' && selectedDocumentIds.length > 0 ? selectedDocumentIds : null;

      const response = await sendChatMessage(
        userMessage, 
        activeConversationId || undefined,
        collectionIdToPass,
        documentIdsToPass
      );
      
      // If this was a new chat, the backend created a conversation for us. Set it as active.
      if (!activeConversationId && response.conversation_id) {
        setActiveConversationId(response.conversation_id);
        fetchConversations(); // refresh sidebar
      }

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
  }, [messages, isTyping, isLoadingHistory]);

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6 p-6 animate-in fade-in duration-500 max-w-7xl mx-auto w-full">
      {/* Sidebar for History */}
      <div className="hidden md:flex flex-col w-72 shrink-0 space-y-4">
        <Button 
          onClick={handleNewChat}
          className="w-full justify-start bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-12 shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-5 h-5 mr-2" /> New Chat
        </Button>

        <Card className="glass-card bg-white/5 border-white/10 flex-1 overflow-hidden flex flex-col rounded-2xl">
          <div className="p-4 border-b border-white/10">
            <h3 className="font-medium text-white flex items-center gap-2 text-sm">
              <MessageSquare className="w-4 h-4 text-indigo-400" /> Recent Chats
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {conversations.length === 0 ? (
              <div className="text-center p-4 text-zinc-500 text-sm">No recent conversations</div>
            ) : (
              conversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all flex flex-col gap-1 ${
                    activeConversationId === conv.id 
                      ? 'bg-indigo-500/20 border border-indigo-500/30' 
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <span className={`text-sm font-medium truncate w-full ${activeConversationId === conv.id ? 'text-indigo-300' : 'text-zinc-300'}`}>
                    {conv.title}
                  </span>
                  <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(conv.created_at).toLocaleDateString()}
                  </span>
                </button>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Main Chat Area */}
      <Card className="glass-card bg-white/5 w-full h-full flex flex-col overflow-hidden border-white/10 rounded-2xl shadow-2xl">
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

        <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth custom-scrollbar" ref={scrollRef}>
          {isLoadingHistory ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>

        <div className="p-4 bg-black/20 border-t border-white/10 relative">
          
          <AnimatePresence>
            {showContextSelector && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-full left-4 mb-2 w-80 max-h-[400px] bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-50"
              >
                <div className="p-3 border-b border-white/10 bg-black/40 flex items-center justify-between">
                  <h4 className="text-sm font-medium text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-indigo-400" />
                    Chat Context
                  </h4>
                  <button onClick={() => setShowContextSelector(false)} className="text-zinc-500 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="p-2 space-y-1">
                  <button 
                    onClick={() => setContextMode('all')}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${contextMode === 'all' ? 'bg-indigo-500/20 text-indigo-300' : 'hover:bg-white/5 text-zinc-300'}`}
                  >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${contextMode === 'all' ? 'border-indigo-400 bg-indigo-500' : 'border-zinc-500'}`}>
                      {contextMode === 'all' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                    All Documents
                  </button>

                  <button 
                    onClick={() => setContextMode('collection')}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${contextMode === 'collection' ? 'bg-indigo-500/20 text-indigo-300' : 'hover:bg-white/5 text-zinc-300'}`}
                  >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${contextMode === 'collection' ? 'border-indigo-400 bg-indigo-500' : 'border-zinc-500'}`}>
                      {contextMode === 'collection' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                    Specific Collection
                  </button>

                  {contextMode === 'collection' && (
                    <div className="pl-9 pr-3 py-1">
                      <select 
                        value={selectedCollectionId}
                        onChange={(e) => setSelectedCollectionId(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 text-white text-sm rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 outline-none"
                      >
                        <option value="" disabled>Select a collection...</option>
                        {collections.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <button 
                    onClick={() => setContextMode('documents')}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${contextMode === 'documents' ? 'bg-indigo-500/20 text-indigo-300' : 'hover:bg-white/5 text-zinc-300'}`}
                  >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${contextMode === 'documents' ? 'border-indigo-400 bg-indigo-500' : 'border-zinc-500'}`}>
                      {contextMode === 'documents' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                    Specific Documents
                  </button>

                  {contextMode === 'documents' && (
                    <div className="pl-9 pr-2 py-1 max-h-[150px] overflow-y-auto custom-scrollbar space-y-1">
                      {documents.length === 0 ? (
                        <p className="text-xs text-zinc-500 py-1">No documents available.</p>
                      ) : (
                        documents.map(doc => {
                          const isSelected = selectedDocumentIds.includes(doc.id);
                          return (
                            <label key={doc.id} className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-1.5 rounded-lg group">
                              <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-zinc-500 group-hover:border-zinc-400'}`}>
                                {isSelected && <Check className="w-3 h-3 text-white" />}
                              </div>
                              <input 
                                type="checkbox" 
                                className="hidden"
                                checked={isSelected}
                                onChange={() => {
                                  if (isSelected) {
                                    setSelectedDocumentIds(prev => prev.filter(id => id !== doc.id));
                                  } else {
                                    setSelectedDocumentIds(prev => [...prev, doc.id]);
                                  }
                                }}
                              />
                              <span className="text-xs text-zinc-300 truncate select-none">{doc.title}</span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="relative flex items-center gap-2"
          >
            <button
              type="button"
              onClick={() => setShowContextSelector(!showContextSelector)}
              className={`shrink-0 w-12 h-12 flex items-center justify-center rounded-2xl border transition-all ${
                contextMode !== 'all' 
                  ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' 
                  : 'bg-white/5 text-zinc-400 border-white/10 hover:bg-white/10'
              }`}
              title="Chat Context"
            >
              <Layers className="w-5 h-5" />
            </button>

            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your documents..." 
              className="w-full pl-5 pr-14 py-6 h-12 bg-white/5 border-white/10 text-white rounded-2xl focus-visible:ring-1 focus-visible:ring-indigo-500 placeholder:text-zinc-500 text-base shadow-inner"
            />
            <Button 
              type="submit" 
              size="icon"
              disabled={!input.trim() || isTyping} 
              className="absolute right-2 top-1 bottom-1 w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition-all"
            >
              <CornerDownLeft className="w-5 h-5" />
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
