'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Document } from '@/types';
import DocumentCard from '@/components/documents/DocumentCard';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
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
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Document Library</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your uploaded knowledge</p>
        </div>
        <Link href="/upload">
          <Button variant="primary">Upload Document</Button>
        </Link>
      </div>

      <div className="w-full max-w-md">
        <Input
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Spinner size="lg" />
        </div>
      ) : filteredDocs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDocs.map(doc => (
            <DocumentCard key={doc.id} document={doc} onDelete={handleDelete} onRename={handleRename} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 px-4 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800">
          <div className="text-4xl mb-4">📄</div>
          <h3 className="text-xl font-medium text-slate-200 mb-2">No documents found</h3>
          <p className="text-slate-400 max-w-sm mx-auto mb-6">
            {searchQuery 
              ? "No documents match your search query."
              : "Upload your first document to start building your personal knowledge engine."}
          </p>
          {!searchQuery && (
            <Link href="/upload">
              <Button variant="primary">Upload Now</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
