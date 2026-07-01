'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { apiFetch } from '@/lib/api';
import StatsCard from '@/components/dashboard/StatsCard';
import DocumentCard from '@/components/documents/DocumentCard';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { UserStats, Document, Conversation } from '@/types';

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
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            Welcome back, {user?.name?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-slate-400 mt-1">Here's what's happening with your knowledge base.</p>
        </div>
        <div className="flex gap-4">
          <Link href="/upload">
            <Button variant="secondary">Upload Document</Button>
          </Link>
          <Link href="/chat">
            <Button variant="primary">New Chat</Button>
          </Link>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard 
            label="Total Documents" 
            value={stats.document_count} 
            icon={<span className="text-2xl">📄</span>} 
          />
          <StatsCard 
            label="Conversations" 
            value={stats.conversation_count} 
            icon={<span className="text-2xl">💬</span>} 
          />
          <StatsCard 
            label="Indexed Chunks" 
            value={stats.total_chunks} 
            icon={<span className="text-2xl">🧩</span>} 
          />
          <StatsCard 
            label="Storage Used" 
            value={`${(stats.total_size / (1024 * 1024)).toFixed(1)} MB`} 
            icon={<span className="text-2xl">💾</span>} 
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <h2 className="text-xl font-semibold text-slate-200">Recent Documents</h2>
            <Link href="/documents" className="text-sm text-indigo-400 hover:text-indigo-300">
              View all
            </Link>
          </div>
          
          {recentDocs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentDocs.map(doc => (
                <DocumentCard key={doc.id} document={doc} />
              ))}
            </div>
          ) : (
            <div className="text-center p-8 rounded-xl bg-slate-900/40 border border-dashed border-slate-800">
              <p className="text-slate-400 mb-4">You haven't uploaded any documents yet.</p>
              <Link href="/upload">
                <Button variant="primary">Upload your first document</Button>
              </Link>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <h2 className="text-xl font-semibold text-slate-200">Recent Chats</h2>
            <Link href="/chat" className="text-sm text-indigo-400 hover:text-indigo-300">
              New chat
            </Link>
          </div>
          
          {recentChats.length > 0 ? (
            <div className="space-y-3">
              {recentChats.map(chat => (
                <Link key={chat.id} href={`/chat/${chat.id}`}>
                  <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/60 transition-all cursor-pointer group">
                    <h3 className="font-medium text-slate-300 group-hover:text-indigo-400 transition-colors truncate">
                      {chat.title}
                    </h3>
                    <div className="flex justify-between items-center mt-2 text-xs text-slate-500">
                      <span>{new Date(chat.updated_at || chat.created_at).toLocaleDateString()}</span>
                      <span>{chat.message_count} messages</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center p-6 rounded-xl bg-slate-900/40 border border-slate-800">
              <p className="text-sm text-slate-400">No recent conversations.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
