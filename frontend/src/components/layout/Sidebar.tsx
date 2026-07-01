'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Upload,
  Search,
  Plus,
  MessagesSquare,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getConversations } from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';
import type { Conversation } from '@/types';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/chat', label: 'Chat', icon: MessageSquare },
  { href: '/documents', label: 'Documents', icon: FileText },
  { href: '/upload', label: 'Upload', icon: Upload },
  { href: '/search', label: 'Search', icon: Search },
];

const sidebarVariants: Variants = {
  hidden: { x: -20, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const navItemVariants: Variants = {
  hidden: { x: -12, opacity: 0 },
  visible: (i: number) => ({
    x: 0,
    opacity: 1,
    transition: { delay: 0.15 + i * 0.06, duration: 0.4, ease: 'easeOut' },
  }),
};

const chatItemVariants: Variants = {
  hidden: { x: -10, opacity: 0 },
  visible: (i: number) => ({
    x: 0,
    opacity: 1,
    transition: { delay: 0.05 * i, duration: 0.35, ease: 'easeOut' },
  }),
  exit: { x: -10, opacity: 0, transition: { duration: 0.2 } },
};

export default function Sidebar() {
  const pathname = usePathname();
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    getConversations()
      .then((data) => setConversations(data.slice(0, 5)))
      .catch(() => {});
  }, []);

  return (
    <motion.aside
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
      className="hidden lg:flex flex-col w-[260px] h-[calc(100vh-4rem)] border-r border-white/[0.06] bg-[#0a0e1a]/80 backdrop-blur-2xl relative overflow-hidden"
    >
      {/* Subtle sidebar gradient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/[0.04] rounded-full blur-3xl" />
        <div className="absolute bottom-0 -right-16 w-40 h-40 bg-emerald-500/[0.03] rounded-full blur-3xl" />
      </div>

      {/* Brand + New Chat */}
      <div className="relative z-10 p-5 pb-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5 mb-5">
          <motion.div
            className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/20"
            whileHover={{ scale: 1.08, rotate: 3 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            <Sparkles className="w-4.5 h-4.5 text-white" strokeWidth={2.2} />
            {/* Animated glow ring */}
            <motion.div
              className="absolute inset-0 rounded-xl border border-cyan-400/40"
              animate={{
                boxShadow: [
                  '0 0 0px rgba(6,182,212,0.0)',
                  '0 0 12px rgba(6,182,212,0.3)',
                  '0 0 0px rgba(6,182,212,0.0)',
                ],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
          <div className="flex items-center gap-1.5">
            <span className="text-[15px] font-bold bg-gradient-to-r from-cyan-300 via-teal-200 to-emerald-300 bg-clip-text text-transparent tracking-tight">
              DocSense AI
            </span>
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-cyan-400"
              animate={{
                opacity: [1, 0.3, 1],
                scale: [1, 0.8, 1],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </div>

        {/* New Chat Button */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
          <Link
            href="/chat"
            id="new-chat-btn"
            className="group flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 text-white text-sm font-semibold shadow-lg shadow-cyan-600/20 transition-all duration-300 hover:shadow-cyan-500/30 hover:shadow-xl relative overflow-hidden"
          >
            {/* Shimmer overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <Plus className="w-4 h-4 relative z-10" strokeWidth={2.5} />
            <span className="relative z-10">New Chat</span>
          </Link>
        </motion.div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto relative z-10 scrollbar-thin">
        <div className="px-2 pb-2 pt-1">
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            Navigation
          </span>
        </div>
        {navItems.map((item, index) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <motion.div
              key={item.href}
              custom={index}
              variants={navItemVariants}
              initial="hidden"
              animate="visible"
            >
              <Link
                href={item.href}
                id={`nav-${item.label.toLowerCase()}`}
                className={cn(
                  'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200',
                  isActive
                    ? 'text-white bg-white/[0.06]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                )}
              >
                {/* Active left accent bar */}
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[2.5px] h-5 rounded-full bg-gradient-to-b from-cyan-400 to-emerald-400 shadow-[0_0_8px_rgba(6,182,212,0.5)]"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}

                {/* Subtle glow behind active icon */}
                {isActive && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/[0.06] to-emerald-500/[0.04]" />
                )}

                <Icon
                  className={cn(
                    'w-[18px] h-[18px] relative z-10 transition-colors duration-200',
                    isActive
                      ? 'text-cyan-400'
                      : 'text-slate-500 group-hover:text-slate-300'
                  )}
                  strokeWidth={1.8}
                />
                <span className="relative z-10">{item.label}</span>

                {/* Hover glow */}
                {!isActive && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/0 to-emerald-500/0 group-hover:from-cyan-500/[0.03] group-hover:to-emerald-500/[0.02] transition-all duration-300" />
                )}
              </Link>
            </motion.div>
          );
        })}

        {/* Recent Conversations */}
        <AnimatePresence>
          {conversations.length > 0 && (
            <motion.div
              className="pt-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <div className="flex items-center gap-2 px-3 mb-2.5">
                <MessagesSquare className="w-3 h-3 text-slate-600" strokeWidth={2} />
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Recent Chats
                </span>
              </div>
              <div className="space-y-0.5">
                {conversations.map((conv, index) => (
                  <motion.div
                    key={conv.id}
                    custom={index}
                    variants={chatItemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <Link
                      href={`/chat/${conv.id}`}
                      className={cn(
                        'group flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12.5px] transition-all duration-200 relative',
                        pathname === `/chat/${conv.id}`
                          ? 'text-cyan-300 bg-cyan-500/[0.08]'
                          : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]'
                      )}
                    >
                      <MessageSquare
                        className={cn(
                          'w-3.5 h-3.5 shrink-0 transition-colors',
                          pathname === `/chat/${conv.id}`
                            ? 'text-cyan-400'
                            : 'text-slate-600 group-hover:text-slate-400'
                        )}
                        strokeWidth={1.8}
                      />
                      <span className="truncate flex-1">{conv.title}</span>
                      <span className="text-[10px] text-slate-600 shrink-0 tabular-nums">
                        {formatRelativeTime(conv.updated_at)}
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Bottom: version + status */}
      <motion.div
        className="relative z-10 p-4 border-t border-white/[0.05]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <motion.div
              className="w-2 h-2 rounded-full bg-emerald-400"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [1, 0.6, 1],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400/30 animate-ping" />
          </div>
          <span className="text-[11px] text-slate-500 font-medium tracking-wide">
            DocSense AI{' '}
            <span className="text-slate-600">v1.0</span>
          </span>
          <div className="ml-auto flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/[0.08] border border-emerald-500/10">
            <span className="text-[9px] font-semibold text-emerald-400 uppercase tracking-wider">
              Online
            </span>
          </div>
        </div>
      </motion.div>
    </motion.aside>
  );
}
