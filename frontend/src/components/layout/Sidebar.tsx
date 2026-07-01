'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { getConversations } from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';
import type { Conversation } from '@/types';

const navItems = [
  {
    href: '/',
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
  },
  {
    href: '/chat',
    label: 'Chat',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    href: '/documents',
    label: 'Documents',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    href: '/upload',
    label: 'Upload',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
    ),
  },
  {
    href: '/search',
    label: 'Search',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    getConversations()
      .then((data) => setConversations(data.slice(0, 5)))
      .catch(() => {});
  }, []);

  return (
    <aside className="hidden lg:flex flex-col w-64 h-[calc(100vh-4rem)] border-r border-[var(--glass-border)] bg-[var(--surface-1)]/50">
      {/* New Chat button */}
      <div className="p-4">
        <Link
          href="/chat"
          id="new-chat-btn"
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 text-white text-sm font-medium hover:from-cyan-500 hover:to-emerald-500 shadow-lg shadow-cyan-600/20 transition-all duration-200 active:scale-[0.98]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Chat
        </Link>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              id={`nav-${item.label.toLowerCase()}`}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-cyan-600/20 to-emerald-600/20 text-[var(--text-primary)] border border-cyan-500/20 shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5',
              )}
            >
              <span className={cn(isActive && 'text-cyan-400')}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}

        {/* Recent Conversations */}
        {conversations.length > 0 && (
          <div className="pt-6">
            <h3 className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Recent Chats
            </h3>
            <div className="space-y-0.5">
              {conversations.map((conv) => (
                <Link
                  key={conv.id}
                  href={`/chat/${conv.id}`}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                    pathname === `/chat/${conv.id}`
                      ? 'text-cyan-400 bg-cyan-500/10'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-white/5',
                  )}
                >
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  <span className="truncate flex-1">{conv.title}</span>
                  <span className="text-[10px] text-[var(--text-muted)] shrink-0">
                    {formatRelativeTime(conv.updated_at)}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Bottom branding */}
      <div className="p-4 border-t border-[var(--glass-border)]">
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          DocSense AI v1.0
        </div>
      </div>
    </aside>
  );
}
