import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Download, Trash2, Calendar, Database, Activity, CheckCircle2 } from "lucide-react";
import Link from 'next/link';

export default function DocumentDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-5xl mx-auto space-y-8 p-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link href="/documents">
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-white/10 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white tracking-tight">Company_Overview_2024.pdf</h1>
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-1 text-xs rounded-full">Processed</span>
          </div>
          <p className="text-zinc-400 mt-1">ID: doc_{params.id}_xyz123</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white">
            <Download className="w-4 h-4 mr-2" /> Download
          </Button>
          <Button variant="destructive" className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30">
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card bg-white/5 border-white/10 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-white">Processing Status</CardTitle>
            <CardDescription className="text-zinc-400">Current state of the document pipeline</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white font-medium">Text Extraction & Chunking</span>
                <span className="text-indigo-400">100%</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 w-full" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-zinc-400 mb-2">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm">Chunks Generated</span>
                </div>
                <div className="text-3xl font-bold text-white">342</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-zinc-400 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm">Vectors Embedded</span>
                </div>
                <div className="text-3xl font-bold text-white">342</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Metadata</CardTitle>
            <CardDescription className="text-zinc-400">File properties</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
                <Database className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-500 font-medium mb-1">File Size</p>
                <p className="text-white">3.2 MB</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-500 font-medium mb-1">Upload Date</p>
                <p className="text-white">October 24, 2024</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-500 font-medium mb-1">File Type</p>
                <p className="text-white">application/pdf</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
