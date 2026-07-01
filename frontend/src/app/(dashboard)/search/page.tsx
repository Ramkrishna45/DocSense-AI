'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Brain, Sparkles, Type, Zap, FileText, BookOpen } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { SearchResult } from '@/types';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';

const searchModes = [
  { id: 'semantic', label: 'Semantic', desc: 'By meaning', icon: Brain },
  { id: 'keyword', label: 'Keyword', desc: 'Exact match', icon: Type },
  { id: 'hybrid', label: 'Hybrid', desc: 'Best of both', icon: Zap },
] as const;

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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/20 mb-2">
          <Search className="w-7 h-7 text-cyan-400" />
        </div>
        <h1 className="text-4xl font-bold gradient-text">
          Knowledge Search
        </h1>
        <p className="text-[var(--text-secondary)] max-w-lg mx-auto text-lg">
          Search across all your documents with AI-powered understanding
        </p>

        {/* Mode Selector */}
        <div className="flex justify-center gap-2 pt-2">
          {searchModes.map((mode) => {
            const Icon = mode.icon;
            const isActive = searchMode === mode.id;
            return (
              <motion.button
                key={mode.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSearchMode(mode.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                    : 'glass text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--glass-border-hover)]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{mode.label}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Search Form */}
      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSearch}
        className="relative"
      >
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] group-focus-within:text-cyan-400 transition-colors z-10" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., Explain the difference between TCP and UDP..."
                required
                className="w-full bg-[var(--surface-2)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] border border-[var(--glass-border)] rounded-2xl py-4 pl-12 pr-4 text-base focus:outline-none focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/10 hover:border-[var(--glass-border-hover)] transition-all duration-200"
              />
            </div>
          </div>
          <Button type="submit" variant="primary" loading={isSearching} className="h-[56px] px-8 rounded-2xl">
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
      </motion.form>

      {/* Results */}
      <AnimatePresence mode="wait">
        {isSearching ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center py-16"
          >
            <Spinner size="lg" />
          </motion.div>
        ) : hasSearched && results.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 px-4 rounded-2xl glass border border-dashed border-[var(--glass-border)]"
          >
            <BookOpen className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
            <p className="text-[var(--text-secondary)] text-lg">No matching results found</p>
            <p className="text-[var(--text-muted)] text-sm mt-1">Try different keywords or switch search modes</p>
          </motion.div>
        ) : (
          <motion.div key="results" className="space-y-3">
            {results.map((result, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group p-5 rounded-2xl glass hover:border-[var(--glass-border-hover)] transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      result.match_type === 'keyword'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {result.match_type === 'keyword' ? (
                        <><Type className="w-3 h-3" /> Exact</>
                      ) : (
                        <><Sparkles className="w-3 h-3" /> {Math.round(result.similarity_score * 100)}%</>
                      )}
                    </span>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-cyan-400" />
                      <h3 className="font-semibold text-[var(--text-primary)]">{result.document_title}</h3>
                    </div>
                  </div>
                  {result.page_number && (
                    <span className="text-xs text-[var(--text-muted)] bg-white/5 px-2 py-1 rounded-md">
                      Page {result.page_number}
                    </span>
                  )}
                </div>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed border-l-2 border-cyan-500/30 pl-4 py-1">
                  &ldquo;{result.content}&rdquo;
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
