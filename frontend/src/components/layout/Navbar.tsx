'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  Search,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Home,
  FileText,
  Bell,
  Sparkles,
  LayoutDashboard,
  MessageSquare,
  Upload,
} from 'lucide-react';

const dropdownVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.92,
    y: -8,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.25, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    y: -8,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
};

const mobileMenuVariants: Variants = {
  hidden: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.25, ease: 'easeIn' },
  },
  visible: {
    height: 'auto',
    opacity: 1,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

const mobileNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/chat', label: 'Chat', icon: MessageSquare },
  { href: '/documents', label: 'Documents', icon: FileText },
  { href: '/upload', label: 'Upload', icon: Upload },
  { href: '/search', label: 'Search', icon: Search },
];

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
    <nav className="sticky top-0 z-40 w-full border-b border-white/[0.06] bg-[#0a0e1a]/70 backdrop-blur-2xl">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left: mobile menu + brand */}
        <div className="flex items-center gap-3">
          <motion.button
            id="mobile-menu-toggle"
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            whileTap={{ scale: 0.9 }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-5 h-5" strokeWidth={2} />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="w-5 h-5" strokeWidth={2} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          <Link href="/dashboard" className="flex items-center gap-2.5 group" id="brand-link">
            <motion.div
              className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/20"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              <Sparkles className="w-4 h-4 text-white" strokeWidth={2.5} />
              <motion.div
                className="absolute inset-0 rounded-lg"
                animate={{
                  boxShadow: [
                    '0 0 0px rgba(6,182,212,0)',
                    '0 0 15px rgba(6,182,212,0.3)',
                    '0 0 0px rgba(6,182,212,0)',
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
            </motion.div>
            <span className="text-lg font-bold bg-gradient-to-r from-cyan-300 via-teal-200 to-emerald-300 bg-clip-text text-transparent hidden sm:block tracking-tight">
              DocSense AI
            </span>
          </Link>
        </div>

        {/* Center: search (desktop) */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <Link
            href="/search"
            id="navbar-search"
            className="group w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-slate-500 text-sm hover:border-cyan-500/20 hover:bg-white/[0.05] transition-all duration-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.06)]"
          >
            <motion.div
              whileHover={{ rotate: 15 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Search className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors duration-300" strokeWidth={2} />
            </motion.div>
            <span className="group-hover:text-slate-400 transition-colors">
              Search your knowledge base…
            </span>
            <kbd className="ml-auto hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono rounded-md border border-white/[0.08] bg-white/[0.03] text-slate-500">
              ⌘K
            </kbd>
          </Link>
        </div>

        {/* Right: notification + user menu */}
        <div className="flex items-center gap-2">
          {/* Mobile search */}
          <Link
            href="/search"
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            id="mobile-search-link"
          >
            <Search className="w-5 h-5" strokeWidth={2} />
          </Link>

          {/* Notification bell (decorative) */}
          <motion.button
            className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bell className="w-[18px] h-[18px]" strokeWidth={1.8} />
            {/* Decorative unread dot */}
            <motion.span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 border-2 border-[#0a0e1a]"
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.button>

          {/* User menu */}
          <div className="relative" ref={menuRef}>
            <motion.button
              id="user-menu-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              className="group flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-white/[0.04] transition-colors"
              whileTap={{ scale: 0.97 }}
            >
              {/* Avatar with glow ring */}
              <div className="relative">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
                  {initials}
                </div>
                <motion.div
                  className="absolute -inset-[2px] rounded-[10px] border border-transparent group-hover:border-cyan-400/30 transition-all duration-300"
                  whileHover={{
                    boxShadow: '0 0 12px rgba(6,182,212,0.25)',
                  }}
                />
              </div>
              <span className="hidden sm:block text-sm text-slate-300 max-w-[120px] truncate font-medium">
                {user?.name}
              </span>
              <motion.div
                animate={{ rotate: menuOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:block" strokeWidth={2} />
              </motion.div>
            </motion.button>

            {/* Dropdown */}
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute right-0 mt-2 w-60 py-1.5 rounded-xl bg-[#111827]/95 backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-black/40 origin-top-right"
                >
                  {/* User info header */}
                  <div className="px-4 py-3 border-b border-white/[0.06]">
                    <p className="text-sm font-semibold text-white truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {user?.email}
                    </p>
                  </div>

                  {/* Menu items */}
                  <div className="py-1">
                    <Link
                      href="/dashboard"
                      id="menu-dashboard"
                      className="group flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/[0.05] transition-all duration-200"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Home className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" strokeWidth={1.8} />
                      Dashboard
                    </Link>
                    <Link
                      href="/documents"
                      id="menu-documents"
                      className="group flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/[0.05] transition-all duration-200"
                      onClick={() => setMenuOpen(false)}
                    >
                      <FileText className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" strokeWidth={1.8} />
                      Documents
                    </Link>
                  </div>

                  <div className="border-t border-white/[0.06] my-1" />

                  <button
                    id="menu-logout"
                    onClick={handleLogout}
                    className="group w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/[0.08] transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4 text-rose-500/70 group-hover:text-rose-400 transition-colors" strokeWidth={1.8} />
                    Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile nav links */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="lg:hidden border-t border-white/[0.06] bg-[#0a0e1a]/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="p-4 space-y-1">
              {mobileNavItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.href}
                    initial={{ x: -15, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.05 * index, duration: 0.3 }}
                  >
                    <Link
                      href={item.href}
                      className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all duration-200"
                      onClick={() => setMobileOpen(false)}
                    >
                      <Icon
                        className="w-[18px] h-[18px] text-slate-500 group-hover:text-cyan-400 transition-colors"
                        strokeWidth={1.8}
                      />
                      {item.label}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
