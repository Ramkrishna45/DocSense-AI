'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, Variants } from 'framer-motion';
import { BrainCircuit, Sparkles, BookOpen, Search, Lightbulb } from 'lucide-react';
import ChatWindow from '@/components/chat/ChatWindow';
import { apiFetch } from '@/lib/api';

const suggestionIcons = [Sparkles, BookOpen, Search] as const;

export default function NewChatPage() {
  const router = useRouter();
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async (message: string) => {
    setIsSending(true);
    try {
      const res = await apiFetch<any>('/api/chat', {
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

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.4 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  const emptyState = (
    <div className="max-w-lg mx-auto text-center space-y-8">
      {/* Grand animated welcome */}
      <motion.div
        className="relative flex flex-col items-center gap-5"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        {/* Glowing background circle */}
        <div className="relative">
          <motion.div
            className="absolute -inset-4 rounded-full bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 blur-2xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-500 flex items-center justify-center shadow-2xl shadow-emerald-500/30"
            animate={{ rotate: [0, 3, -3, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <BrainCircuit className="w-10 h-10 text-white" />
          </motion.div>
          {/* Orbiting accent */}
          <motion.div
            className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 flex items-center justify-center shadow-lg"
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Lightbulb className="w-3 h-3 text-white" />
          </motion.div>
        </div>

        <motion.h2
          className="text-2xl md:text-3xl font-bold text-slate-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          How can I help you{' '}
          <span className="gradient-text-vivid">today?</span>
        </motion.h2>
        <motion.p
          className="text-slate-400 text-sm md:text-base max-w-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.5 }}
        >
          Ask a question and I&apos;ll search your documents to find the answer.
        </motion.p>
      </motion.div>

      {/* Suggestion chips with stagger */}
      <motion.div
        className="grid grid-cols-1 gap-3 pt-2"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {suggestions.map((text, i) => {
          const Icon = suggestionIcons[i];
          return (
            <motion.button
              key={i}
              variants={itemVariants}
              onClick={() => handleSendMessage(text)}
              className="group relative p-4 rounded-xl glass border border-slate-700/50 text-slate-300 text-sm text-left flex items-center gap-3 transition-all duration-300 hover:border-cyan-500/40 hover:text-white"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Hover glow */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative shrink-0 w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500/15 to-emerald-500/15 border border-cyan-500/20 flex items-center justify-center group-hover:border-cyan-500/40 transition-colors duration-300">
                <Icon className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="relative">{text}</span>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );

  return (
    <motion.div
      className="h-[calc(100vh-8rem)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <ChatWindow
        messages={[]}
        isLoading={isSending}
        onSendMessage={handleSendMessage}
        emptyStateContent={emptyState}
      />
    </motion.div>
  );
}
