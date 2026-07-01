'use client';

import React, { useState, useRef, useCallback } from 'react';
import { cn, formatFileSize } from '@/lib/utils';

interface UploadDropzoneProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxSizeMB?: number;
  acceptedTypes?: string[];
}

const ACCEPTED_EXTENSIONS = ['.pdf', '.docx', '.txt'];
const ACCEPTED_MIMES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

export default function UploadDropzone({
  files,
  onFilesChange,
  maxSizeMB = 50,
  acceptedTypes = ACCEPTED_EXTENSIONS,
}: UploadDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const validateFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const valid: File[] = [];
      const errs: string[] = [];

      Array.from(newFiles).forEach((file) => {
        const ext = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!ACCEPTED_MIMES.includes(file.type) && !acceptedTypes.includes(ext)) {
          errs.push(`${file.name}: unsupported file type`);
          return;
        }
        if (file.size > maxSizeBytes) {
          errs.push(`${file.name}: exceeds ${maxSizeMB}MB limit`);
          return;
        }
        // Check for duplicates
        if (files.some((f) => f.name === file.name && f.size === file.size)) {
          errs.push(`${file.name}: already added`);
          return;
        }
        valid.push(file);
      });

      setErrors(errs);
      if (valid.length > 0) {
        onFilesChange([...files, ...valid]);
      }
    },
    [files, onFilesChange, maxSizeBytes, maxSizeMB, acceptedTypes],
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      validateFiles(e.dataTransfer.files);
    }
  };

  const handleBrowse = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateFiles(e.target.files);
    }
    // Reset so same file can be selected again
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return '📄';
    if (ext === 'docx' || ext === 'doc') return '📝';
    return '📃';
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'relative flex flex-col items-center justify-center gap-4 p-10 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300',
          isDragOver
            ? 'border-cyan-500 bg-cyan-500/10 scale-[1.02]'
            : 'border-[var(--glass-border)] bg-[var(--glass-bg)] hover:border-cyan-500/30 hover:bg-[var(--glass-bg-hover)]',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleBrowse}
          className="hidden"
          id="file-upload-input"
        />

        {/* Animated icon */}
        <div
          className={cn(
            'p-4 rounded-2xl transition-all duration-300',
            isDragOver
              ? 'bg-cyan-500/20 scale-110'
              : 'bg-white/5',
          )}
        >
          <svg
            className={cn(
              'w-10 h-10 transition-colors duration-300',
              isDragOver ? 'text-cyan-400' : 'text-[var(--text-muted)]',
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>

        <div className="text-center">
          <p className="text-sm font-medium text-[var(--text-primary)]">
            {isDragOver ? (
              <span className="text-cyan-400">Drop files here</span>
            ) : (
              <>
                Drag & drop files here, or{' '}
                <span className="text-cyan-400 hover:text-cyan-300">
                  browse
                </span>
              </>
            )}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            PDF, DOCX, TXT — up to {maxSizeMB}MB each
          </p>
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((err, i) => (
            <p key={i} className="text-xs text-rose-400 flex items-center gap-1.5">
              <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {err}
            </p>
          ))}
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-[var(--text-secondary)]">
            {files.length} file{files.length > 1 ? 's' : ''} selected
          </h4>
          <div className="space-y-1.5">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl glass animate-fadeInUp"
              >
                <span className="text-xl">{getFileIcon(file.name)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--text-primary)] truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="p-1 rounded-lg text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  id={`remove-file-${index}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
