'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  FileText,
  MessageSquare,
  Layers,
  HardDrive,
  Upload,
  MessageCirclePlus,
  ArrowRight,
  FolderOpen,
  MessagesSquare,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { apiFetch } from '@/lib/api';
import StatsCard from '@/components/dashboard/StatsCard';
import DocumentCard from '@/components/documents/DocumentCard';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { UserStats, Document, Conversation } from '@/types';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const statsContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const statsItemVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentDocs, setRecentDocs] = useState<Document[]>([]);
  const [recentChats, setRecentChats] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, docsRes, chatsRes] = await Promise.all([
          apiFetch('/api/documents/stats'),
          apiFetch('/api/documents?limit=6'),
          apiFetch('/api/chat/conversations?limit=5')
        ]);
        
        setStats(statsRes);
        // Assuming docsRes is DocumentListResponse { documents, total }
        setRecentDocs(docsRes.documents?.slice(0, 6) || []);
        setRecentChats(chatsRes.slice(0, 5) || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" text="Loading your workspace..." />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-10"
    >
      {/* Welcome section */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex items-center gap-3 mb-2"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Sparkles className="w-8 h-8 text-cyan-400" />
            </motion.div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-300 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Welcome back, {user?.name?.split(' ')[0] || 'User'}
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-slate-400 text-base ml-11"
          >
            Here&apos;s what&apos;s happening with your knowledge base.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex gap-3"
        >
          <Link href="/upload">
            <Button variant="secondary">
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </Link>
          <Link href="/chat">
            <Button variant="primary">
              <MessageCirclePlus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Stats grid */}
      {stats && (
        <motion.div
          variants={statsContainerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <motion.div variants={statsItemVariants}>
            <StatsCard 
              label="Total Documents" 
              value={stats.document_count} 
              icon={<FileText />}
              accentColor="from-cyan-500 to-emerald-500"
            />
          </motion.div>
          <motion.div variants={statsItemVariants}>
            <StatsCard 
              label="Conversations" 
              value={stats.conversation_count} 
              icon={<MessageSquare />}
              accentColor="from-emerald-500 to-teal-500"
            />
          </motion.div>
          <motion.div variants={statsItemVariants}>
            <StatsCard 
              label="Indexed Chunks" 
              value={stats.total_chunks} 
              icon={<Layers />}
              accentColor="from-blue-500 to-indigo-500"
            />
          </motion.div>
          <motion.div variants={statsItemVariants}>
            <StatsCard 
              label="Storage Used" 
              value={`${(stats.total_size / (1024 * 1024)).toFixed(1)} MB`} 
              icon={<HardDrive />}
              accentColor="from-purple-500 to-pink-500"
            />
          </motion.div>
        </motion.div>
      )}

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Documents */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="w-1 h-6 rounded-full bg-gradient-to-b from-cyan-400 to-emerald-400" />
              <h2 className="text-xl font-semibold text-white">Recent Documents</h2>
            </div>
            <Link
              href="/documents"
              className="text-sm text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1 group"
            >
              View all
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          
          {recentDocs.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {recentDocs.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  variants={itemVariants}
                  custom={index}
                >
                  <DocumentCard document={doc} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-12 px-8 rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-dashed border-white/[0.08] relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.03] to-emerald-500/[0.03]" />
              <div className="relative z-10">
                <motion.div
                  animate={{ y: [-4, 4, -4] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 border border-white/[0.06] mb-4"
                >
                  <FolderOpen className="w-8 h-8 text-cyan-400/60" />
                </motion.div>
                <p className="text-slate-400 mb-5 text-sm">You haven&apos;t uploaded any documents yet.</p>
                <Link href="/upload">
                  <Button variant="primary">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload your first document
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Recent Chats */}
        <motion.div variants={itemVariants} className="space-y-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="w-1 h-6 rounded-full bg-gradient-to-b from-emerald-400 to-cyan-400" />
              <h2 className="text-xl font-semibold text-white">Recent Chats</h2>
            </div>
            <Link
              href="/chat"
              className="text-sm text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1 group"
            >
              New chat
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          
          {recentChats.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-3"
            >
              {recentChats.map((chat, index) => (
                <motion.div key={chat.id} variants={itemVariants} custom={index}>
                  <Link href={`/chat/${chat.id}`}>
                    <motion.div
                      whileHover={{ x: 4 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      className="p-4 rounded-xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] hover:border-emerald-500/30 hover:bg-white/[0.05] transition-all cursor-pointer group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/[0.03] group-hover:to-transparent transition-all duration-500" />
                      <div className="relative z-10">
                        <div className="flex items-center gap-2.5 mb-2">
                          <MessageSquare className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors flex-shrink-0" />
                          <h3 className="font-medium text-slate-300 group-hover:text-white transition-colors truncate text-sm">
                            {chat.title}
                          </h3>
                        </div>
                        <div className="flex justify-between items-center text-xs text-slate-500 ml-[26px]">
                          <span>{new Date(chat.updated_at || chat.created_at).toLocaleDateString()}</span>
                          <span className="px-2 py-0.5 rounded-full bg-white/[0.04] text-slate-400">
                            {chat.message_count} messages
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-10 px-6 rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-dashed border-white/[0.08] relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] to-cyan-500/[0.03]" />
              <div className="relative z-10">
                <motion.div
                  animate={{ y: [-4, 4, -4] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-white/[0.06] mb-3"
                >
                  <MessagesSquare className="w-7 h-7 text-emerald-400/60" />
                </motion.div>
                <p className="text-sm text-slate-400">No recent conversations.</p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
