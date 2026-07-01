'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, FileSpreadsheet, File, FileCode, Download, Pencil, Trash2 } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import Link from 'next/link';
import { formatFileSize, formatDate, truncateText } from '@/lib/utils';
import type { Document } from '@/types';

interface DocumentCardProps {
  document: Document;
  onRename?: (id: string, newTitle: string) => void;
  onDelete?: (id: string) => void;
  onDownload?: (id: string) => void;
  viewMode?: 'grid' | 'list';
}

function getFileTypeIcon(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf':
      return <FileText className="w-full h-full" />;
    case 'docx':
    case 'doc':
      return <FileSpreadsheet className="w-full h-full" />;
    case 'md':
    case 'mdx':
      return <FileCode className="w-full h-full" />;
    case 'txt':
      return <File className="w-full h-full" />;
    default:
      return <File className="w-full h-full" />;
  }
}

function getFileIconColor(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf':
      return 'text-rose-400 bg-rose-500/15 border-rose-500/20';
    case 'docx':
    case 'doc':
      return 'text-blue-400 bg-blue-500/15 border-blue-500/20';
    case 'md':
    case 'mdx':
      return 'text-purple-400 bg-purple-500/15 border-purple-500/20';
    case 'txt':
      return 'text-slate-400 bg-slate-500/15 border-slate-500/20';
    default:
      return 'text-slate-400 bg-slate-500/15 border-slate-500/20';
  }
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
  const [isHovered, setIsHovered] = useState(false);

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

  const actionButtons = (
    <AnimatePresence>
      {isHovered && (
        <motion.div
          className="flex items-center gap-0.5 z-20"
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {onDownload && (
            <motion.button
              id={`doc-download-${doc.id}`}
              onClick={() => onDownload(doc.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors pointer-events-auto"
              title="Download"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
            >
              <Download className="w-4 h-4" />
            </motion.button>
          )}
          {onRename && (
            <motion.button
              id={`doc-rename-${doc.id}`}
              onClick={() => setIsEditing(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors pointer-events-auto"
              title="Rename"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
            >
              <Pencil className="w-4 h-4" />
            </motion.button>
          )}
          {onDelete && (
            <motion.button
              id={`doc-delete-${doc.id}`}
              onClick={() => onDelete(doc.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors pointer-events-auto"
              title="Delete"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  const statusGlow =
    doc.status === 'completed'
      ? 'shadow-emerald-500/20 shadow-sm'
      : '';

  if (viewMode === 'list') {
    return (
      <motion.div
        className="relative group"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        whileHover={{ y: -2 }}
      >
        {/* Gradient border on hover */}
        <motion.div
          className="absolute -inset-[1px] rounded-[var(--radius-lg)] bg-gradient-to-r from-cyan-500/40 via-emerald-500/40 to-cyan-500/40 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
        <Card hover className="!p-3 relative z-10 glass bg-[var(--surface-1)]">
          <Link href={`/documents/${doc.id}`} className="absolute inset-0 z-0" />
          <div className="flex items-center gap-4 relative z-10">
            {/* File icon */}
            <motion.div
              className={`shrink-0 w-9 h-9 rounded-lg border flex items-center justify-center p-2 ${getFileIconColor(doc.original_filename)}`}
              animate={{ scale: isHovered ? 1.1 : 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              {getFileTypeIcon(doc.original_filename)}
            </motion.div>
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={handleRename}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  className="bg-transparent border-b border-cyan-500 text-sm font-medium text-[var(--text-primary)] outline-none w-full"
                />
              ) : (
                <h3
                  className="text-sm font-medium text-[var(--text-primary)] truncate cursor-pointer group-hover:text-cyan-400 transition-colors relative z-20 pointer-events-auto"
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
            <div className="hidden sm:flex items-center gap-3 text-xs text-[var(--text-muted)] shrink-0">
              <span className="bg-white/5 px-2 py-1 rounded-md">{formatFileSize(doc.size)}</span>
              <span className="bg-white/5 px-2 py-1 rounded-md">{doc.chunk_count} chunks</span>
              <span>{formatDate(doc.created_at)}</span>
            </div>
            <div className={statusGlow}>
              <Badge variant={doc.status} dot size="sm">
                {doc.status}
              </Badge>
            </div>
            <div className="flex items-center gap-1 shrink-0 z-20">
              {actionButtons}
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="relative group"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Gradient border on hover */}
      <motion.div
        className="absolute -inset-[1px] rounded-[var(--radius-xl)] bg-gradient-to-r from-cyan-500/50 via-emerald-500/50 to-cyan-500/50 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
      <Card hover glow className="relative z-10 glass bg-[var(--surface-1)] h-full flex flex-col">
        <Link href={`/documents/${doc.id}`} className="absolute inset-0 z-0" />
        <div className="space-y-4 relative z-10 pointer-events-none flex-1 flex flex-col">
          {/* Icon + Status */}
          <div className="flex items-start justify-between pointer-events-auto">
            <motion.div
              className={`w-12 h-12 rounded-xl border flex items-center justify-center p-2.5 ${getFileIconColor(doc.original_filename)}`}
              animate={{ scale: isHovered ? 1.1 : 1, rotate: isHovered ? 3 : 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            >
              {getFileTypeIcon(doc.original_filename)}
            </motion.div>
            <div className={statusGlow}>
              <Badge variant={doc.status} dot size="sm">
                {doc.status}
              </Badge>
            </div>
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
                className="bg-transparent border-b border-cyan-500 text-sm font-medium text-[var(--text-primary)] outline-none w-full pointer-events-auto"
              />
            ) : (
              <h3
                className="text-base font-semibold text-[var(--text-primary)] cursor-pointer group-hover:text-cyan-400 transition-colors pointer-events-auto leading-snug"
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
            {actionButtons}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
