'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, MessageSquare, Sparkles, FileText, Layers, HardDrive, Link2, Clock, Tag, BookOpen, Video, Globe, Download } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { Document } from '@/types';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { formatDate } from '@/lib/utils';

export default function DocumentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [doc, setDoc] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await apiFetch(`/api/documents/${id}`);
        setDoc(res);
      } catch (error) {
        console.error('Failed to fetch document:', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchDoc();
  }, [id]);

  if (isLoading) {
    return <div className="flex justify-center p-16"><Spinner size="lg" /></div>;
  }

  if (!doc) {
    return (
      <div className="text-center p-16">
        <FileText className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
        <p className="text-[var(--text-secondary)]">Document not found</p>
      </div>
    );
  }

  const sourceIcon = doc.source_type === 'youtube' ? Video : doc.source_type === 'url' ? Globe : FileText;
  const SourceIcon = sourceIcon;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-start"
      >
        <div>
          <button
            onClick={() => router.back()}
            className="text-sm text-[var(--text-secondary)] hover:text-cyan-400 mb-3 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Documents
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/20 flex items-center justify-center">
              <SourceIcon className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[var(--text-primary)] flex items-center gap-3">
                {doc.title}
                <Badge variant={doc.status}>{doc.status}</Badge>
              </h1>
              <p className="text-[var(--text-secondary)] text-sm mt-1 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                Uploaded {formatDate(doc.created_at)} • {doc.source_type}
                {doc.estimated_reading_time ? ` • ~${doc.estimated_reading_time} min read` : ''}
              </p>
            </div>
          </div>
        </div>
        <Button variant="primary" onClick={() => router.push(`/chat?doc=${doc.id}`)}>
          <MessageSquare className="w-4 h-4 mr-2" />
          Chat with Document
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* AI Summary */}
          <div className="p-6 rounded-2xl glass">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              AI Summary
            </h2>
            {doc.summary ? (
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{doc.summary}</p>
            ) : (
              <p className="text-[var(--text-muted)] text-sm italic">Summary not available or still processing.</p>
            )}

            {doc.key_topics && doc.key_topics.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  Key Topics
                </h3>
                <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                  {doc.key_topics.map((topic, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {doc.keywords && doc.keywords.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                  {doc.keywords.map((kw, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 text-xs border border-cyan-500/20">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-6 rounded-2xl glass">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Details</h2>
            <div className="space-y-3 text-sm">
              {[
                { label: 'Source Type', value: doc.source_type, icon: Globe },
                { label: 'File Size', value: `${(doc.size / 1024 / 1024).toFixed(2)} MB`, icon: HardDrive },
                { label: 'Indexed Chunks', value: doc.chunk_count, icon: Layers },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-[var(--glass-border)]">
                  <span className="text-[var(--text-muted)] flex items-center gap-2">
                    <item.icon className="w-3.5 h-3.5" />
                    {item.label}
                  </span>
                  <span className="text-[var(--text-primary)] font-medium capitalize">{item.value}</span>
                </div>
              ))}
              {doc.source_url && (
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[var(--text-muted)] flex items-center gap-2">
                    <Link2 className="w-3.5 h-3.5" />
                    URL
                  </span>
                  <a href={doc.source_url} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline truncate max-w-[200px]">
                    {doc.source_url}
                  </a>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Right Column: Preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="h-full min-h-[600px] rounded-2xl glass flex flex-col overflow-hidden">
            <div className="p-4 border-b border-[var(--glass-border)] flex justify-between items-center">
              <h2 className="text-sm font-semibold text-[var(--text-secondary)]">Document Preview</h2>
              {doc.source_type === 'file' && (
                <a href={`/api/documents/${doc.id}/download`} target="_blank" rel="noreferrer">
                  <Button variant="secondary" className="!py-1.5 !px-3 text-xs">
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    Download
                  </Button>
                </a>
              )}
            </div>
            <div className="flex-1 flex items-center justify-center p-8 text-center">
              <div className="max-w-md space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 border border-cyan-500/15 flex items-center justify-center">
                  <SourceIcon className="w-7 h-7 text-cyan-400" />
                </div>
                <h3 className="text-lg font-medium text-[var(--text-primary)]">Document Indexed Successfully</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  The document has been fully processed and indexed into {doc.chunk_count} searchable chunks.
                  Use the &ldquo;Chat with Document&rdquo; button to ask AI questions about its contents.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
