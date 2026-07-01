'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, FileSpreadsheet, File, X, AlertTriangle } from 'lucide-react';
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

function getFileIcon(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return <FileText className="w-5 h-5 text-rose-400" />;
  if (ext === 'docx' || ext === 'doc') return <FileSpreadsheet className="w-5 h-5 text-blue-400" />;
  return <File className="w-5 h-5 text-slate-400" />;
}

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

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'relative flex flex-col items-center justify-center gap-4 p-10 rounded-2xl border-2 border-dashed cursor-pointer transition-colors duration-300',
          isDragOver
            ? 'border-cyan-400 bg-cyan-500/10'
            : 'border-slate-700/60 bg-[var(--glass-bg)] hover:border-cyan-500/30 hover:bg-[var(--glass-bg-hover)]',
        )}
        animate={{
          scale: isDragOver ? 1.02 : 1,
          boxShadow: isDragOver
            ? '0 0 30px rgba(6, 182, 212, 0.15), 0 0 60px rgba(6, 182, 212, 0.05)'
            : '0 0 0px rgba(6, 182, 212, 0)',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        {/* Animated glow border overlay on drag */}
        <AnimatePresence>
          {isDragOver && (
            <motion.div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                background: 'linear-gradient(135deg, rgba(6,182,212,0.08), rgba(16,185,129,0.08))',
              }}
            />
          )}
        </AnimatePresence>

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
        <motion.div
          className={cn(
            'p-4 rounded-2xl border transition-colors duration-300',
            isDragOver
              ? 'bg-cyan-500/15 border-cyan-500/30'
              : 'bg-white/5 border-transparent',
          )}
          animate={{
            y: isDragOver ? [-4, 4, -4] : [0, -6, 0],
            scale: isDragOver ? 1.1 : 1,
          }}
          transition={{
            y: {
              duration: isDragOver ? 0.6 : 3,
              repeat: Infinity,
              ease: 'easeInOut',
            },
            scale: { type: 'spring', stiffness: 300, damping: 15 },
          }}
        >
          <UploadCloud
            className={cn(
              'w-10 h-10 transition-colors duration-300',
              isDragOver ? 'text-cyan-400' : 'text-slate-400',
            )}
          />
        </motion.div>

        <div className="text-center relative z-10">
          <p className="text-sm font-medium text-[var(--text-primary)]">
            {isDragOver ? (
              <motion.span
                className="text-cyan-400"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              >
                Drop files here
              </motion.span>
            ) : (
              <>
                Drag & drop files here, or{' '}
                <span className="text-cyan-400 hover:text-cyan-300 transition-colors">
                  browse
                </span>
              </>
            )}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            PDF, DOCX, TXT — up to {maxSizeMB}MB each
          </p>
        </div>
      </motion.div>

      {/* Errors */}
      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div
            className="space-y-1"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {errors.map((err, i) => (
              <motion.p
                key={i}
                className="text-xs text-rose-400 flex items-center gap-1.5"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <AlertTriangle className="w-3 h-3 shrink-0" />
                {err}
              </motion.p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* File list */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h4 className="text-sm font-medium text-[var(--text-secondary)]">
              {files.length} file{files.length > 1 ? 's' : ''} selected
            </h4>
            <div className="space-y-1.5">
              {files.map((file, index) => (
                <motion.div
                  key={`${file.name}-${index}`}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl glass border border-slate-700/30 hover:border-cyan-500/20 transition-colors"
                  initial={{ opacity: 0, y: 12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -20, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  layout
                >
                  <div className="shrink-0">{getFileIcon(file.name)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--text-primary)] truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    id={`remove-file-${index}`}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
