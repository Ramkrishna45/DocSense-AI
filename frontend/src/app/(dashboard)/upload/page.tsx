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

  const handleUpload = async () => {
    setIsUploading(true);
    
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
    } catch (error) {
      console.error('Upload failed:', error);
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
            onFilesAdded={(newFiles) => setFiles(prev => [...prev, ...newFiles])} 
          />

          {files.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium text-slate-200">Selected Files ({files.length})</h3>
              <ul className="space-y-2">
                {files.map((file, i) => (
                  <li key={i} className="flex justify-between items-center p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                    <span className="truncate flex-1 text-sm text-slate-300">{file.name}</span>
                    <span className="text-xs text-slate-500 ml-4">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                    <button 
                      onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                      className="ml-4 text-rose-400 hover:text-rose-300"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
              
              <div className="flex justify-end pt-4">
                <Button variant="primary" onClick={handleUpload} isLoading={isUploading}>
                  Upload All Files
                </Button>
              </div>
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
            <Button variant="primary" onClick={handleUpload} isLoading={isUploading} disabled={!sourceUrl}>
              Process URL
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
