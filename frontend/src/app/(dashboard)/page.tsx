"use client";
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Database, Activity, Clock, ArrowRight, Loader2 } from "lucide-react";
import Link from 'next/link';
import { getStats, getDocuments } from '@/lib/api';
import type { UserStats, Document } from '@/types';

export default function DashboardPage() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, docsData] = await Promise.all([
          getStats(),
          getDocuments()
        ]);
        setStats(statsData);
        setDocuments(docsData.slice(0, 5)); // Show top 5
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  return (
    <div className="space-y-8 p-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Overview</h1>
          <p className="text-zinc-400">Welcome back! Here&apos;s what&apos;s happening with your knowledge base.</p>
        </div>
        <div className="flex gap-4">
          <Link href="/upload">
            <Button className="bg-white text-black hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all">
              Upload Document
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Bento Grid layout */}
        <Card className="glass-card md:col-span-2 overflow-hidden relative group border-white/10 bg-white/5">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2 text-white">
              <Database className="w-5 h-5 text-indigo-400" />
              Total Chunks
            </CardTitle>
            <CardDescription className="text-zinc-400">Processed pieces of information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-6xl font-bold text-white tracking-tighter">
              {loading ? <Loader2 className="w-10 h-10 animate-spin text-zinc-500" /> : stats?.total_chunks || 0}
            </div>
            {!loading && (
              <p className="text-sm text-emerald-400 mt-2 flex items-center gap-1">
                <Activity className="w-4 h-4" />
                Updated just now
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card overflow-hidden relative group border-white/10 bg-white/5">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2 text-white">
              <FileText className="w-5 h-5 text-blue-400" />
              Documents
            </CardTitle>
            <CardDescription className="text-zinc-400">Active files in system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-6xl font-bold text-white tracking-tighter">
              {loading ? <Loader2 className="w-10 h-10 animate-spin text-zinc-500" /> : stats?.document_count || 0}
            </div>
            {!loading && (
              <p className="text-sm text-emerald-400 mt-2 flex items-center gap-1">
                <Activity className="w-4 h-4" />
                Total uploaded files
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Documents list */}
        <Card className="glass-card md:col-span-3 border-white/10 bg-white/5">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl text-white">Recent Documents</CardTitle>
              <CardDescription className="text-zinc-400">The latest files added to your knowledge base.</CardDescription>
            </div>
            <Link href="/documents">
              <Button variant="ghost" className="text-zinc-300 hover:text-white">
                View All <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="py-8 text-center flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
                </div>
              ) : documents.length === 0 ? (
                <div className="py-8 text-center text-zinc-500 border border-white/5 border-dashed rounded-xl">
                  <p>No recent documents.</p>
                </div>
              ) : (
                documents.map((doc) => (
                  <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 shrink-0 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-medium text-white group-hover:text-indigo-300 transition-colors truncate">{doc.title}</h4>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500 mt-1">
                          <span className="flex items-center gap-1 whitespace-nowrap"><Database className="w-3 h-3" /> {(doc.size / (1024 * 1024)).toFixed(2)} MB</span>
                          <span className="flex items-center gap-1 whitespace-nowrap"><Clock className="w-3 h-3" /> {new Date(doc.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-3 shrink-0">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        doc.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' :
                        doc.status === 'failed' ? 'bg-red-500/20 text-red-400 border-red-500/20' :
                        'bg-amber-500/20 text-amber-400 border-amber-500/20'
                      }`}>
                        {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                      </span>
                      <Button size="icon" variant="ghost" className="text-zinc-400 group-hover:text-white">
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
