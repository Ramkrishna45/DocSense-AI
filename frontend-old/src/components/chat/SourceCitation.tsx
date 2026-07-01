'use client';

import React, { useState } from 'react';
import { SourceInfo } from '@/types';

export default function SourceCitation({ source, index }: { source: SourceInfo; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg bg-slate-900/50 border border-slate-700/50 overflow-hidden text-sm transition-all duration-200">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-2 truncate pr-4">
          <span className="flex-shrink-0 w-5 h-5 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
            {index}
          </span>
          <span className="font-medium text-slate-300 truncate">{source.document_title}</span>
          {source.page_number && (
            <span className="text-slate-500 flex-shrink-0 text-[10px] uppercase">Pg {source.page_number}</span>
          )}
          {source.similarity_score !== undefined && (
            <span className={`flex-shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${source.match_type === 'keyword' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
              {source.match_type === 'keyword' ? 'Keyword' : `${Math.round(source.similarity_score * 100)}% Match`}
            </span>
          )}
        </div>
        <svg 
          className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {expanded && (
        <div className="p-3 pt-0 text-slate-400 border-t border-slate-700/30 bg-slate-900/80 italic text-xs leading-relaxed animate-fadeIn">
          "{source.excerpt}"
        </div>
      )}
    </div>
  );
}
