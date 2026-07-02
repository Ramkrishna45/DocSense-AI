"use client";
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Folder, Plus, Trash2, ChevronRight, Loader2, FileText } from "lucide-react";
import Link from 'next/link';
import { getCollections, createCollection, deleteCollection } from '@/lib/api';
import type { Collection } from '@/types';
import { toast } from "sonner";

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const fetchCollections = async () => {
    try {
      const data = await getCollections();
      setCollections(data);
    } catch (error) {
      console.error("Error fetching collections", error);
      toast.error("Failed to load collections");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    setIsCreating(true);
    try {
      await createCollection(newCollectionName.trim());
      setNewCollectionName("");
      toast.success("Collection created");
      fetchCollections();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create collection");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (!confirm('Are you sure you want to delete this collection? Documents inside will not be deleted.')) return;
    try {
      await deleteCollection(id);
      toast.success('Collection deleted');
      setCollections(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete collection');
    }
  };

  return (
    <div className="space-y-8 p-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Collections</h1>
          <p className="text-zinc-400">Organize your documents into groups or folders.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Input 
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            placeholder="New collection name..." 
            className="bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleCreate(e as any);
              }
            }}
          />
          <Button onClick={handleCreate} disabled={isCreating || !newCollectionName.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0">
            {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
            {isCreating ? "" : "Create"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
          </div>
        ) : collections.length === 0 ? (
          <div className="col-span-full py-12 text-center text-zinc-500 bg-white/5 rounded-xl border border-white/10 border-dashed">
            <Folder className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No collections created yet.</p>
          </div>
        ) : (
          collections.map((col) => (
            <Link key={col.id} href={`/collections/${col.id}`}>
              <Card className="glass-card bg-white/5 border-white/10 group hover:border-indigo-500/50 transition-all duration-300 cursor-pointer overflow-hidden relative h-full flex flex-col">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="p-5 pb-0 flex flex-row items-start justify-between relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center shadow-inner">
                    <Folder className="w-6 h-6 text-indigo-400" />
                  </div>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-full"
                    onClick={(e) => handleDelete(e, col.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="p-5 relative z-10 flex-1 flex flex-col justify-end mt-4">
                  <h3 className="font-semibold text-lg text-white mb-2 group-hover:text-indigo-300 transition-colors line-clamp-1">{col.name}</h3>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <FileText className="w-4 h-4" />
                      <span>{col.document_count || 0} documents</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white text-zinc-400 transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
