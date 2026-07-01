'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, BrainCircuit, Sparkles, Zap, Stars, Atom } from 'lucide-react';
import { Message } from '@/types';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (msg: string) => void;
  emptyStateContent?: React.ReactNode;
}

/* Floating particle icon for the empty state */
function FloatingParticle({ icon: Icon, delay, x, y, duration }: { icon: React.ElementType; delay: number; x: number; y: number; duration: number }) {
  return (
    <motion.div
      className="absolute text-cyan-500/20"
      initial={{ opacity: 0, x, y, scale: 0 }}
      animate={{
        opacity: [0, 0.6, 0],
        y: [y, y - 60, y - 120],
        x: [x, x + (Math.random() > 0.5 ? 15 : -15), x],
        scale: [0, 1, 0.5],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <Icon className="w-4 h-4" />
    </motion.div>
  );
}

export default function ChatWindow({ messages, isLoading, onSendMessage, emptyStateContent }: ChatWindowProps) {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const hasInput = input.trim().length > 0;

  const defaultEmptyState = (
    <motion.div
      className="flex flex-col items-center justify-center gap-4 select-none"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Animated AI icon with floating particles */}
      <div className="relative w-28 h-28 flex items-center justify-center">
        {/* Particles */}
        <FloatingParticle icon={Sparkles} delay={0} x={-20} y={10} duration={3} />
        <FloatingParticle icon={Zap} delay={0.8} x={25} y={5} duration={3.5} />
        <FloatingParticle icon={Stars} delay={1.5} x={-30} y={-5} duration={4} />
        <FloatingParticle icon={Atom} delay={2} x={30} y={-10} duration={3.2} />
        <FloatingParticle icon={Sparkles} delay={0.5} x={0} y={20} duration={3.8} />
        <FloatingParticle icon={Zap} delay={1.2} x={-15} y={15} duration={3.3} />

        {/* Glow ring */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 blur-xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Core icon */}
        <motion.div
          className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/25"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <BrainCircuit className="w-8 h-8 text-white" />
        </motion.div>
      </div>

      <p className="text-slate-400 text-sm font-medium">Start a conversation...</p>
    </motion.div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-900/40 rounded-2xl border border-slate-800 overflow-hidden relative">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            {emptyStateContent || defaultEmptyState}
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={msg.id || i}
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <MessageBubble message={msg} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TypingIndicator />
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Premium input area */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/80 backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          {/* Glass input wrapper */}
          <motion.div
            className="relative w-full"
            animate={{ scale: isFocused ? 1.01 : 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* Focus glow behind input */}
            <motion.div
              className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-cyan-500/30 to-emerald-500/30 blur-sm pointer-events-none"
              animate={{ opacity: isFocused ? 0.6 : 0 }}
              transition={{ duration: 0.3 }}
            />
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about your documents..."
              className="w-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 focus:border-cyan-500/50 rounded-xl py-3 pl-4 pr-14 text-slate-200 resize-none h-14 focus:outline-none transition-all custom-scrollbar placeholder:text-slate-500 relative z-10"
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
          </motion.div>

          {/* Animated send button */}
          <div className="absolute right-2 z-20">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
            >
              {/* Gradient pulsing border */}
              <AnimatePresence>
                {hasInput && !isLoading && (
                  <motion.div
                    className="absolute -inset-1 rounded-xl bg-gradient-to-r from-cyan-500 via-emerald-500 to-cyan-500 bg-[length:200%_100%]"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: [0.5, 0.8, 0.5],
                      scale: 1,
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{
                      opacity: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                      backgroundPosition: { duration: 3, repeat: Infinity, ease: 'linear' },
                      scale: { duration: 0.2 },
                    }}
                    style={{ filter: 'blur(3px)' }}
                  />
                )}
              </AnimatePresence>
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="relative p-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-emerald-600 text-white disabled:opacity-40 disabled:from-slate-700 disabled:to-slate-700 transition-all duration-200 shadow-lg shadow-emerald-500/20"
              >
                <Send className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        </form>
      </div>
    </div>
  );
}
