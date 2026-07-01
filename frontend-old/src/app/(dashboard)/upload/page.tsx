'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileUp, Video, Code, Globe, AlertCircle } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import UploadDropzone from '@/components/documents/UploadDropzone';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const sourceTypes = [
  { id: 'file', label: 'Files', icon: FileUp },
  { id: 'youtube', label: 'YouTube', icon: Video },
  { id: 'github', label: 'GitHub', icon: Code },
  { id: 'url', label: 'Website', icon: Globe },
] as const;

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
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/20 flex items-center justify-center">
            <Upload className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Upload Knowledge</h1>
            <p className="text-[var(--text-secondary)] text-sm">
              Add new knowledge from multiple sources
            </p>
          </div>
        </div>
      </motion.div>
      
      {/* Error */}
      <AnimatePresence>
        {uploadError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            {uploadError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Source Type Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex gap-2 p-1.5 glass rounded-2xl"
      >
        {sourceTypes.map((type) => {
          const Icon = type.icon;
          const isActive = sourceType === type.id;
          return (
            <motion.button
              key={type.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSourceType(type.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-300 border border-cyan-500/25 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/3'
              }`}
            >
              <Icon className="w-4 h-4" />
              {type.label}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {sourceType === 'file' ? (
          <motion.div
            key="file"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
          >
            <UploadDropzone 
              files={files}
              onFilesChange={setFiles}
            />

            {files.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-end pt-6"
              >
                <Button variant="primary" onClick={handleUpload} loading={isUploading}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload {files.length} {files.length === 1 ? 'File' : 'Files'}
                </Button>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="url"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="p-6 rounded-2xl glass space-y-6"
          >
            <Input
              label={sourceType === 'youtube' ? "YouTube Video URL" : sourceType === 'github' ? "GitHub README URL" : "Website URL"}
              placeholder={sourceType === 'youtube' ? "https://youtube.com/watch?v=..." : "https://..."}
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              required
              icon={<Globe className="w-4 h-4" />}
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
