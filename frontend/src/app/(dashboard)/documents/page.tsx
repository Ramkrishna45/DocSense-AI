'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, Upload, FolderOpen } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { Document } from '@/types';
import DocumentCard from '@/components/documents/DocumentCard';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Link from 'next/link';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch('/api/documents');
      setDocuments(res.documents || []);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiFetch(`/api/documents/${id}`, { method: 'DELETE' });
      await fetchDocuments();
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  const handleRename = async (id: string, newTitle: string) => {
    try {
      await apiFetch(`/api/documents/${id}/rename`, {
        method: 'PATCH',
        body: JSON.stringify({ title: newTitle })
      });
      await fetchDocuments();
    } catch (error) {
      console.error('Failed to rename document:', error);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const filteredDocs = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    doc.original_filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/20 flex items-center justify-center">
            <FolderOpen className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Document Library</h1>
            <p className="text-[var(--text-secondary)] text-sm">Manage your uploaded knowledge</p>
          </div>
        </div>
        <Link href="/upload">
          <Button variant="primary">
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        </Link>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="w-full max-w-md"
      >
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-cyan-400 transition-colors" />
          <input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--surface-2)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] border border-[var(--glass-border)] rounded-xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/10 hover:border-[var(--glass-border-hover)] transition-all duration-200"
          />
        </div>
      </motion.div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center p-16">
          <Spinner size="lg" />
        </div>
      ) : filteredDocs.length > 0 ? (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.05 } }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {filteredDocs.map(doc => (
            <motion.div
              key={doc.id}
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <DocumentCard document={doc} onDelete={handleDelete} onRename={handleRename} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 px-4 rounded-2xl glass border border-dashed border-[var(--glass-border)]"
        >
          <FileText className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
          <h3 className="text-xl font-medium text-[var(--text-primary)] mb-2">No documents found</h3>
          <p className="text-[var(--text-secondary)] max-w-sm mx-auto mb-6">
            {searchQuery 
              ? "No documents match your search query."
              : "Upload your first document to start building your personal knowledge engine."}
          </p>
          {!searchQuery && (
            <Link href="/upload">
              <Button variant="primary">
                <Upload className="w-4 h-4 mr-2" />
                Upload Now
              </Button>
            </Link>
          )}
        </motion.div>
      )}
    </div>
  );
}
