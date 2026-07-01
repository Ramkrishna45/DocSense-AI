"use client";
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Download, Trash2, Calendar, Database, Activity, CheckCircle2, Loader2 } from "lucide-react";
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { getDocument, deleteDocument, downloadDocument } from '@/lib/api';
import type { Document } from '@/types';
import { toast } from 'sonner';

export default function DocumentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchDoc = async () => {
      try {
        const data = await getDocument(id);
        setDoc(data);
      } catch (error) {
        toast.error("Failed to load document details");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    setIsDeleting(true);
    try {
      await deleteDocument(id);
      toast.success("Document deleted successfully");
      router.push('/documents');
    } catch (error) {
      toast.error("Failed to delete document");
      setIsDeleting(false);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const blob = await downloadDocument(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc?.original_filename || 'document.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast.error("Failed to download document");
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 p-8 flex justify-center items-center h-[50vh]">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 p-8 flex flex-col items-center">
        <h2 className="text-2xl text-white">Document not found</h2>
        <Link href="/documents"><Button>Return to Library</Button></Link>
      </div>
    );
  }

  const isCompleted = doc.status === 'completed';
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
            <h1 className="text-3xl font-bold text-white tracking-tight">{doc.title}</h1>
            <span className={`px-2 py-1 text-xs rounded-full border ${
              isCompleted ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 
              doc.status === 'failed' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
              'bg-amber-500/20 text-amber-400 border-amber-500/30'
            }`}>
              {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
            </span>
          </div>
          <p className="text-zinc-400 mt-1">ID: {doc.id}</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleDownload} disabled={isDownloading || !isCompleted} variant="outline" className="border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white">
            {isDownloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />} Download
          </Button>
          <Button onClick={handleDelete} disabled={isDeleting} variant="destructive" className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30">
            {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />} Delete
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
                <span className="text-indigo-400">{isCompleted ? '100%' : doc.status === 'failed' ? 'Failed' : 'Processing...'}</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className={`h-full ${doc.status === 'failed' ? 'bg-red-500' : 'bg-indigo-500'} ${!isCompleted && doc.status !== 'failed' ? 'animate-pulse w-1/2' : 'w-full'}`} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-zinc-400 mb-2">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm">Chunks Generated</span>
                </div>
                <div className="text-3xl font-bold text-white">{doc.chunk_count}</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-zinc-400 mb-2">
                  <CheckCircle2 className={`w-4 h-4 ${isCompleted ? 'text-emerald-400' : 'text-zinc-500'}`} />
                  <span className="text-sm">Vectors Embedded</span>
                </div>
                <div className="text-3xl font-bold text-white">{isCompleted ? doc.chunk_count : 0}</div>
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
                <p className="text-white">{(doc.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-500 font-medium mb-1">Upload Date</p>
                <p className="text-white">{new Date(doc.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-500 font-medium mb-1">File Type</p>
                <p className="text-white">{doc.original_filename.split('.').pop()?.toUpperCase() || 'UNKNOWN'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
