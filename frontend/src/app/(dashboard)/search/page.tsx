"use client";
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search as SearchIcon, FileText, ChevronRight, Zap, Filter, Loader2 } from "lucide-react";
import { searchDocuments } from '@/lib/api';
import type { SearchResult } from '@/types';

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchTime, setSearchTime] = useState<number>(0);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsSearching(true);
    setHasSearched(false);
    const startTime = performance.now();
    try {
      const data = await searchDocuments(query);
      setResults(data);
    } catch (error) {
      console.error("Search failed", error);
      setResults([]);
    } finally {
      setIsSearching(false);
      setHasSearched(true);
      setSearchTime((performance.now() - startTime) / 1000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-8 animate-in fade-in duration-500">
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/10 mb-2">
          <Zap className="w-8 h-8 text-indigo-400" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">Semantic Search</h1>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
          Find exact context and concepts across all your documents instantly using vector-based similarity search.
        </p>
      </div>

      <form onSubmit={handleSearch} className="relative max-w-3xl mx-auto">
        <div className="relative flex items-center">
          <SearchIcon className="absolute left-6 w-6 h-6 text-zinc-400" />
          <Input 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for concepts, facts, or ideas..."
            className="w-full pl-16 pr-32 py-8 bg-white/5 border-white/10 rounded-full text-lg text-white shadow-[0_0_40px_rgba(79,70,229,0.1)] focus-visible:ring-indigo-500 focus-visible:border-indigo-500 transition-all placeholder:text-zinc-500"
          />
          <div className="absolute right-3 flex items-center gap-2">
            <Button type="button" variant="ghost" size="icon" className="text-zinc-400 hover:text-white rounded-full">
              <Filter className="w-5 h-5" />
            </Button>
            <Button type="submit" disabled={isSearching || !query.trim()} className="rounded-full bg-indigo-600 hover:bg-indigo-700 px-6 text-white h-12">
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </div>
      </form>

      {isSearching && (
        <div className="max-w-4xl mx-auto mt-12 py-12 flex justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        </div>
      )}

      {hasSearched && !isSearching && (
        <div className="max-w-4xl mx-auto mt-12 space-y-6 animate-in slide-in-from-bottom-8 duration-500">
          <div className="flex items-center justify-between text-sm text-zinc-400 pb-2 border-b border-white/10">
            <span>Found {results.length} highly relevant snippets</span>
            <span>Search took {searchTime.toFixed(2)}s</span>
          </div>

          {results.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 border border-white/5 border-dashed rounded-xl bg-white/5">
              <SearchIcon className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p>No results found for your query.</p>
            </div>
          ) : (
            results.map((item, index) => (
              <Card key={index} className="glass-card bg-white/5 border-white/10 hover:border-indigo-500/30 transition-all duration-300 group cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white/5">
                        <FileText className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white group-hover:text-indigo-300 transition-colors">{item.document_title}</h4>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {item.page_number !== null ? `Page ${item.page_number}` : `Chunk ${item.chunk_number}`}
                        </p>
                      </div>
                    </div>
                    <span className="border border-indigo-500/30 text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded text-xs">
                      {(item.similarity_score * 100).toFixed(1)}% match
                    </span>
                  </div>
                  
                  <p className="text-zinc-300 text-sm leading-relaxed mb-4">
                    {item.content}
                  </p>
                  
                  <div className="flex items-center text-xs font-medium text-indigo-400 group-hover:text-indigo-300 transition-colors">
                    View in Document <ChevronRight className="w-3 h-3 ml-1" />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
