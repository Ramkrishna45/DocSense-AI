"use client";
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Search, Filter, MoreVertical, Clock, Database, ChevronRight, Loader2 } from "lucide-react";
import Link from 'next/link';
import { getDocuments } from '@/lib/api';
import type { Document } from '@/types';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Download, Trash2, FolderPlus, Folder } from "lucide-react";
import { deleteDocument, getCollections, addDocumentToCollection } from '@/lib/api';
import { toast } from "sonner";
import type { Collection } from '@/types';

// Custom DocumentCard component
const DocumentCard = ({ doc, onDelete, collections }: { doc: Document; onDelete: (id: string) => void; collections: Collection[] }) => {
  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault(); // Stop link navigation
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/documents/${doc.id}/download`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.original_filename || doc.title || 'document';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error(error);
      toast.error('Failed to download document');
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await deleteDocument(doc.id);
      toast.success('Document deleted');
      onDelete(doc.id);
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete document');
    }
  };

  const handleAddToCollection = async (e: React.MouseEvent, collectionId: string) => {
    e.preventDefault();
    try {
      await addDocumentToCollection(collectionId, doc.id);
      toast.success('Document added to collection');
    } catch (error) {
      console.error(error);
      toast.error('Failed to add document to collection');
    }
  };

  return (
    <Link href={`/documents/${doc.id}`}>
      <Card className="glass-card bg-white/5 border-white/10 group hover:border-indigo-500/50 transition-all duration-300 cursor-pointer overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardHeader className="p-5 pb-0 flex flex-row items-start justify-between relative z-10">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center shadow-inner">
            <FileText className="w-6 h-6 text-indigo-400" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger 
              className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full flex items-center justify-center outline-none"
              onClick={(e) => e.preventDefault()}
            >
              <MoreVertical className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-zinc-900 border-zinc-800 text-zinc-300">
              <DropdownMenuItem onClick={handleDownload} className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800">
                <Download className="mr-2 h-4 w-4" />
                <span>Download</span>
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800">
                  <FolderPlus className="mr-2 h-4 w-4" />
                  <span>Add to Collection</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                  {collections.length === 0 ? (
                    <DropdownMenuItem disabled className="text-zinc-500">No collections</DropdownMenuItem>
                  ) : (
                    collections.map(col => (
                      <DropdownMenuItem key={col.id} onClick={(e) => handleAddToCollection(e, col.id)} className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800">
                        <Folder className="mr-2 h-4 w-4" />
                        <span>{col.name}</span>
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator className="bg-zinc-800" />
              <DropdownMenuItem onClick={handleDelete} className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-400/10 focus:bg-red-400/10 focus:text-red-300">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="p-5 relative z-10 mt-2">
          <h3 className="font-semibold text-lg text-white mb-1 line-clamp-1 group-hover:text-indigo-300 transition-colors">{doc.title}</h3>
          <div className="flex flex-col gap-2 mt-4">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Database className="w-3.5 h-3.5" />
              <span>{(doc.size / (1024 * 1024)).toFixed(2)} MB</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{new Date(doc.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-6">
            <span className={`px-3 py-1 text-xs rounded-full border ${
              doc.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 
              doc.status === 'failed' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
              'bg-amber-500/20 text-amber-400 border-amber-500/30'
            }`}>
              {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
            </span>
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white text-zinc-400 transition-all">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [docsData, colsData] = await Promise.all([
        getDocuments(),
        getCollections()
      ]);
      setDocuments(docsData);
      setCollections(colsData);
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteDoc = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  return (
    <div className="space-y-8 p-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Document Library</h1>
          <p className="text-zinc-400">Manage and browse your uploaded knowledge base documents.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input 
              placeholder="Search documents..." 
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500"
            />
          </div>
          <Button variant="outline" size="icon" className="border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white shrink-0">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-full py-12 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
            </div>
          ) : documents.length === 0 ? (
            <div className="col-span-full py-12 text-center text-zinc-500 bg-white/5 rounded-xl border border-white/10 border-dashed">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No documents uploaded yet.</p>
            </div>
          ) : (
            documents.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} onDelete={handleDeleteDoc} collections={collections} />
            ))
          )}
        </div>
    </div>
  );
}
