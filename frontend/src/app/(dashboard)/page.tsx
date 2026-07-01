import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Database, Activity, Clock, ArrowRight } from "lucide-react";
import Link from 'next/link';

export default function DashboardPage() {
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
              24,592
            </div>
            <p className="text-sm text-emerald-400 mt-2 flex items-center gap-1">
              <Activity className="w-4 h-4" />
              +1,204 this week
            </p>
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
              142
            </div>
            <p className="text-sm text-emerald-400 mt-2 flex items-center gap-1">
              <Activity className="w-4 h-4" />
              +12 this week
            </p>
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
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white group-hover:text-indigo-300 transition-colors">Q2_Financial_Report_2024.pdf</h4>
                      <div className="flex items-center gap-3 text-sm text-zinc-500">
                        <span className="flex items-center gap-1"><Database className="w-3 h-3" /> 2.4 MB</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 2 hours ago</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
                      Processed
                    </span>
                    <Button size="icon" variant="ghost" className="text-zinc-400 group-hover:text-white">
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
