"use client";
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search as SearchIcon, FileText, ChevronRight, Zap, Filter } from "lucide-react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setHasSearched(true);
    }, 800);
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

      {hasSearched && !isSearching && (
        <div className="max-w-4xl mx-auto mt-12 space-y-6 animate-in slide-in-from-bottom-8 duration-500">
          <div className="py-12 text-center text-zinc-500 border border-white/5 border-dashed rounded-xl bg-white/5">
            <SearchIcon className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p>No results found for your query. (Backend not connected)</p>
          </div>
        </div>
      )}
    </div>
  );
}
