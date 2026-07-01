'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import UploadDropzone from '@/components/documents/UploadDropzone';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function UploadPage() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  
  const [sourceType, setSourceType] = useState<'file' | 'url' | 'youtube' | 'github'>('file');
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceTitle, setSourceTitle] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleUpload = async () => {
    setIsUploading(true);
    setUploadError(null);
    
    try {
      if (sourceType === 'file') {
        if (files.length === 0) return;
        // Upload one by one for now
        for (const file of files) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('source_type', 'file');
          
          await apiFetch('/api/documents/upload', {
            method: 'POST',
            body: formData,
          });
        }
      } else {
        if (!sourceUrl) return;
        const formData = new FormData();
        formData.append('source_url', sourceUrl);
        formData.append('source_type', sourceType);
        if (sourceTitle) formData.append('title', sourceTitle);
        
        await apiFetch('/api/documents/upload', {
          method: 'POST',
          body: formData,
        });
      }
      
      router.push('/documents');
    } catch (error: any) {
      console.error('Upload failed:', error);
      setUploadError(error.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Upload Knowledge</h1>
        <p className="text-slate-400 text-sm mt-1">
          Add new knowledge to your personal search engine from multiple sources.
        </p>
      </div>
      
      {uploadError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          {uploadError}
        </div>
      )}

      <div className="flex gap-2 p-1 bg-slate-900/50 rounded-xl border border-slate-800">
        {[
          { id: 'file', label: '📄 Files' },
          { id: 'youtube', label: '▶️ YouTube' },
          { id: 'github', label: '💻 GitHub' },
          { id: 'url', label: '🔗 Website URL' }
        ].map(type => (
          <button
            key={type.id}
            onClick={() => setSourceType(type.id as any)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              sourceType === type.id 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {sourceType === 'file' ? (
        <>
          <UploadDropzone 
            files={files}
            onFilesChange={setFiles}
          />

          {files.length > 0 && (
            <div className="flex justify-end pt-4">
              <Button variant="primary" onClick={handleUpload} loading={isUploading}>
                Upload All Files
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-6">
          <Input
            label={sourceType === 'youtube' ? "YouTube Video URL" : sourceType === 'github' ? "GitHub README URL (Raw)" : "Website URL"}
            placeholder={sourceType === 'youtube' ? "https://youtube.com/watch?v=..." : "https://..."}
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            required
          />
          <Input
            label="Title (Optional)"
            placeholder="Give this source a clear title"
            value={sourceTitle}
            onChange={(e) => setSourceTitle(e.target.value)}
          />
          <div className="flex justify-end pt-2">
            <Button variant="primary" onClick={handleUpload} loading={isUploading} disabled={!sourceUrl}>
              Process URL
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
