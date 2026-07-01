'use client';

import React, { useState } from 'react';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import Link from 'next/link';
import { formatFileSize, formatDate, getFileIcon, truncateText } from '@/lib/utils';
import type { Document } from '@/types';

interface DocumentCardProps {
  document: Document;
  onRename?: (id: string, newTitle: string) => void;
  onDelete?: (id: string) => void;
  onDownload?: (id: string) => void;
  viewMode?: 'grid' | 'list';
}

export default function DocumentCard({
  document: doc,
  onRename,
  onDelete,
  onDownload,
  viewMode = 'grid',
}: DocumentCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(doc.title);

  const handleRename = () => {
    if (editTitle.trim() && editTitle !== doc.title && onRename) {
      onRename(doc.id, editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleRename();
    if (e.key === 'Escape') {
      setEditTitle(doc.title);
      setIsEditing(false);
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="relative group hover-lift animate-fadeIn">
        <div className="absolute inset-0 rounded-[var(--radius-lg)] gradient-border opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <Card hover className="!p-3 relative z-10 glass bg-[var(--surface-1)]">
          <Link href={`/documents/${doc.id}`} className="absolute inset-0 z-0" />
          <div className="flex items-center gap-4 relative z-10">
            <span className="text-2xl shrink-0 group-hover:scale-110 transition-transform duration-300">{getFileIcon(doc.original_filename)}</span>
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={handleRename}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  className="bg-transparent border-b border-[var(--color-primary)] text-sm font-medium text-[var(--text-primary)] outline-none w-full"
                />
              ) : (
                <h3
                  className="text-sm font-medium text-[var(--text-primary)] truncate cursor-pointer group-hover:text-[var(--color-primary)] transition-colors relative z-20 pointer-events-auto"
                  onDoubleClick={() => setIsEditing(true)}
                  title="Double-click to rename"
                >
                  {doc.title}
                </h3>
              )}
              <p className="text-xs text-[var(--text-muted)] truncate mt-0.5 group-hover:text-[var(--text-secondary)] transition-colors">
                {doc.original_filename}
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-xs text-[var(--text-muted)] shrink-0">
              <span className="bg-white/5 px-2 py-1 rounded-md">{formatFileSize(doc.size)}</span>
              <span className="bg-white/5 px-2 py-1 rounded-md">{doc.chunk_count} chunks</span>
              <span>{formatDate(doc.created_at)}</span>
            </div>
            <Badge variant={doc.status} dot size="sm">
              {doc.status}
            </Badge>
            <div className="flex items-center gap-1 shrink-0 z-20">
              {onDownload && (
                <button
                  id={`doc-download-${doc.id}`}
                  onClick={() => onDownload(doc.id)}
                  className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors pointer-events-auto"
                  title="Download"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
              )}
              {onRename && (
                <button
                  id={`doc-rename-${doc.id}`}
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors pointer-events-auto"
                  title="Rename"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
              {onDelete && (
                <button
                  id={`doc-delete-${doc.id}`}
                  onClick={() => onDelete(doc.id)}
                  className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors pointer-events-auto"
                  title="Delete"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative group hover-lift animate-fadeIn">
      <div className="absolute inset-0 rounded-[var(--radius-xl)] gradient-border opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <Card hover glow className="relative z-10 glass bg-[var(--surface-1)] h-full flex flex-col">
        <Link href={`/documents/${doc.id}`} className="absolute inset-0 z-0" />
        <div className="space-y-4 relative z-10 pointer-events-none flex-1 flex flex-col">
          {/* Icon + Status */}
          <div className="flex items-start justify-between pointer-events-auto">
            <span className="text-4xl group-hover:scale-110 transition-transform duration-300 drop-shadow-md">{getFileIcon(doc.original_filename)}</span>
            <Badge variant={doc.status} dot size="sm">
              {doc.status}
            </Badge>
          </div>

          {/* Title */}
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleRename}
                onKeyDown={handleKeyDown}
                autoFocus
                className="bg-transparent border-b border-[var(--color-primary)] text-sm font-medium text-[var(--text-primary)] outline-none w-full"
              />
            ) : (
              <h3
                className="text-base font-semibold text-[var(--text-primary)] cursor-pointer group-hover:text-[var(--color-primary)] transition-colors pointer-events-auto leading-snug"
                onDoubleClick={() => setIsEditing(true)}
                title="Double-click to rename"
              >
                {truncateText(doc.title, 40)}
              </h3>
            )}
            
            <p className="text-xs text-[var(--text-muted)] mt-1.5 group-hover:text-[var(--text-secondary)] transition-colors truncate">
              {doc.original_filename}
            </p>
          </div>

          {/* Meta Tags */}
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] font-medium">
            <span className="bg-white/5 border border-white/5 px-2.5 py-1 rounded-md">{formatFileSize(doc.size)}</span>
            <span className="bg-white/5 border border-white/5 px-2.5 py-1 rounded-md">{doc.chunk_count} chunks</span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-[var(--glass-border)] pointer-events-auto mt-auto">
            <span className="text-xs text-[var(--text-muted)] font-medium">
              {formatDate(doc.created_at)}
            </span>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
              {onDownload && (
                <button
                  id={`doc-grid-download-${doc.id}`}
                  onClick={() => onDownload(doc.id)}
                  className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors"
                  title="Download"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
              )}
              {onRename && (
                <button
                  id={`doc-grid-rename-${doc.id}`}
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors"
                  title="Rename"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
              {onDelete && (
                <button
                  id={`doc-grid-delete-${doc.id}`}
                  onClick={() => onDelete(doc.id)}
                  className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Delete"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
