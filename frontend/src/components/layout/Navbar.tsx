'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-[var(--glass-border)] bg-[var(--surface-1)]/80 backdrop-blur-xl">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left: mobile menu + brand */}
        <div className="flex items-center gap-3">
          <button
            id="mobile-menu-toggle"
            className="lg:hidden p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          <Link href="/dashboard" className="flex items-center gap-2.5 group" id="brand-link">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <span className="text-lg font-bold gradient-text hidden sm:block">
              DocSense AI
            </span>
          </Link>
        </div>

        {/* Center: search (desktop) */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <Link
            href="/search"
            id="navbar-search"
            className="w-full flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--glass-border)] text-[var(--text-muted)] text-sm hover:border-[var(--glass-border-hover)] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search your knowledge base…
            <kbd className="ml-auto hidden lg:inline-flex px-1.5 py-0.5 text-[10px] font-mono rounded border border-white/10 bg-white/5 text-[var(--text-muted)]">
              ⌘K
            </kbd>
          </Link>
        </div>

        {/* Right: user menu */}
        <div className="flex items-center gap-3">
          <Link
            href="/search"
            className="md:hidden p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-colors"
            id="mobile-search-link"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Link>

          <div className="relative" ref={menuRef}>
            <button
              id="user-menu-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/5 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                {initials}
              </div>
              <span className="hidden sm:block text-sm text-[var(--text-secondary)] max-w-[120px] truncate">
                {user?.name}
              </span>
              <svg className="w-4 h-4 text-[var(--text-muted)] hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 py-1 rounded-xl bg-[var(--surface-2)] border border-[var(--glass-border)] shadow-xl animate-scaleIn origin-top-right">
                <div className="px-4 py-3 border-b border-[var(--glass-border)]">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] truncate">
                    {user?.email}
                  </p>
                </div>
                <Link
                  href="/dashboard"
                  id="menu-dashboard"
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Dashboard
                </Link>
                <Link
                  href="/documents"
                  id="menu-documents"
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Documents
                </Link>
                <div className="border-t border-[var(--glass-border)] my-1" />
                <button
                  id="menu-logout"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile nav links */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[var(--glass-border)] bg-[var(--surface-1)] animate-fadeInDown">
          <div className="p-4 space-y-1">
            {[
              { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
              { href: '/chat', label: 'Chat', icon: '💬' },
              { href: '/documents', label: 'Documents', icon: '📄' },
              { href: '/upload', label: 'Upload', icon: '📤' },
              { href: '/search', label: 'Search', icon: '🔍' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
