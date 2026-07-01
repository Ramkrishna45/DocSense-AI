'use client';

import React, { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { SearchResult } from '@/types';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchMode, setSearchMode] = useState<'semantic' | 'keyword' | 'hybrid'>('hybrid');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    
    try {
      const res = await apiFetch('/api/search', {
        method: 'POST',
        body: JSON.stringify({ query: query.trim(), limit: 10, search_mode: searchMode }),
      });
      setResults(res.results || []);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
          Global Search
        </h1>
        <p className="text-slate-400 max-w-lg mx-auto">
          Search across all your uploaded knowledge instantly.
        </p>
        
        <div className="flex justify-center gap-2 pt-2">
          {[
            { id: 'semantic', label: '🧠 Semantic (Meaning)' },
            { id: 'keyword', label: '🔤 Keyword (Exact)' },
            { id: 'hybrid', label: '🌟 Hybrid (Best)' }
          ].map(mode => (
            <button
              key={mode.id}
              onClick={() => setSearchMode(mode.id as any)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                searchMode === mode.id 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex gap-4">
        <div className="flex-1">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., Explain the difference between TCP and UDP..."
            required
          />
        </div>
        <Button 
          type="submit" 
          variant="primary" 
          loading={isSearching}
          className="h-[52px] mt-6" 
        >
          Search
        </Button>
      </form>

      {isSearching ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : hasSearched && results.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-xl bg-slate-900/40 border border-dashed border-slate-800">
          <p className="text-slate-400">No matching concepts found in your documents.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((result, idx) => (
            <div key={idx} className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition-colors animate-slideUp" style={{ animationDelay: `${idx * 50}ms` }}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${result.match_type === 'keyword' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                    {result.match_type === 'keyword' ? 'Exact Match' : `${Math.round(result.similarity_score * 100)}% Match`}
                  </span>
                  <h3 className="font-semibold text-slate-200">{result.document_title}</h3>
                </div>
                {result.page_number && (
                  <span className="text-sm text-slate-500">Page {result.page_number}</span>
                )}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed italic border-l-2 border-slate-700 pl-4 py-1">
                "{result.content}"
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
