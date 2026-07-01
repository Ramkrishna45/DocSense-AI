'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
    return <div className="flex justify-center p-12"><Spinner size="lg" /></div>;
  }

  if (!doc) {
    return <div className="text-center p-12 text-slate-400">Document not found</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      <div className="flex justify-between items-start">
        <div>
          <button onClick={() => router.back()} className="text-sm text-indigo-400 hover:text-indigo-300 mb-2 flex items-center gap-1">
            ← Back to Documents
          </button>
          <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
            {doc.title}
            <Badge variant={doc.status}>{doc.status}</Badge>
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Uploaded {formatDate(doc.created_at)} • Source: {doc.source_type}
            {doc.estimated_reading_time ? ` • ~${doc.estimated_reading_time} min read` : ''}
          </p>
        </div>
        <Button variant="secondary" onClick={() => router.push(`/chat?doc=${doc.id}`)}>
          Chat with Document
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Metadata & AI Summary */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800">
            <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <span className="text-indigo-400">✨</span> AI Summary
            </h2>
            {doc.summary ? (
              <p className="text-slate-300 text-sm leading-relaxed">{doc.summary}</p>
            ) : (
              <p className="text-slate-500 text-sm italic">Summary not available or still processing.</p>
            )}

            {doc.key_topics && doc.key_topics.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Key Topics</h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  {doc.key_topics.map((topic, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-indigo-500 mt-0.5">•</span>
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {doc.keywords && doc.keywords.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {doc.keywords.map((kw, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs border border-slate-700">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800">
            <h2 className="text-lg font-semibold text-slate-200 mb-4">Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">Source Type</span>
                <span className="text-slate-300 font-medium capitalize">{doc.source_type}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">File Size</span>
                <span className="text-slate-300 font-medium">{(doc.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">Indexed Chunks</span>
                <span className="text-slate-300 font-medium">{doc.chunk_count}</span>
              </div>
              {doc.source_url && (
                <div className="flex justify-between pt-2">
                  <span className="text-slate-500">URL</span>
                  <a href={doc.source_url} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline truncate max-w-[200px]">
                    {doc.source_url}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Preview */}
        <div className="lg:col-span-2">
          <div className="h-full min-h-[600px] rounded-2xl bg-slate-900 border border-slate-800 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
              <h2 className="text-sm font-semibold text-slate-300">Document Preview</h2>
              {doc.source_type === 'file' && (
                <a href={`/api/documents/${doc.id}/download`} target="_blank" rel="noreferrer">
                  <Button variant="secondary" className="!py-1 !px-3 text-xs">Download File</Button>
                </a>
              )}
            </div>
            <div className="flex-1 flex items-center justify-center p-8 text-center">
              {/* In a real implementation, you would render react-pdf here or an iframe for URLs */}
              <div className="max-w-md space-y-4">
                <div className="w-16 h-16 mx-auto rounded-xl bg-slate-800 flex items-center justify-center text-3xl">
                  {doc.source_type === 'youtube' ? '▶️' : doc.source_type === 'url' ? '🔗' : '📄'}
                </div>
                <h3 className="text-lg font-medium text-slate-200">Preview not available</h3>
                <p className="text-sm text-slate-400">
                  Full document preview rendering requires a PDF viewer like react-pdf which is beyond this MVP.
                  However, the document text has been fully extracted and is ready for semantic search!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
