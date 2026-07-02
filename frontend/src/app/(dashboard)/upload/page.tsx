"use client";
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, File, X, FileCheck2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setIsUploading(true);
    
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        
        await apiFetch('/api/documents/upload', {
          method: 'POST',
          body: formData,
        });
      }
      toast.success("Files uploaded successfully!");
      setFiles([]);
      router.push('/documents');
    } catch (error: any) {
      toast.error("Upload failed: " + (error.message || "Unknown error"));
      console.error("Upload error", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-8 animate-in zoom-in-95 duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-white">Upload Knowledge</h1>
        <p className="text-zinc-400 text-lg">Add PDF or DOCX files to your intelligent database.</p>
      </div>

      <Card 
        className={`glass-card bg-white/5 border-2 border-dashed transition-all duration-300 relative overflow-hidden ${
          isDragging ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/20 hover:border-white/40'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 mb-6 rounded-full bg-white/5 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping opacity-20" />
            <UploadCloud className={`w-10 h-10 ${isDragging ? 'text-indigo-400' : 'text-zinc-400'}`} />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Drag & Drop files here</h3>
          <p className="text-zinc-400 mb-8 max-w-sm">Support for PDF, DOCX up to 50MB. Files will be automatically processed and chunked.</p>
          <div className="relative">
            <input 
              type="file" 
              multiple 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => e.target.files && setFiles(Array.from(e.target.files))}
              accept=".pdf,.docx"
            />
            <Button size="lg" className="bg-white text-black hover:bg-zinc-200 px-8 relative pointer-events-none">
              Browse Files
            </Button>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-medium text-white">Selected Files ({files.length})</h4>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setFiles([])}
                className="text-zinc-400 hover:text-white"
              >
                Clear all
              </Button>
            </div>
            
            <div className="grid gap-3">
              {files.map((file, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl glass-card border border-white/10 bg-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                      <File className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{file.name}</p>
                      <p className="text-sm text-zinc-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setFiles(files.filter((_, index) => index !== i))} className="text-zinc-500 hover:text-red-400">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                size="lg" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[150px]"
                onClick={handleUpload}
                disabled={isUploading}
              >
                {isUploading ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Uploading...</>
                ) : (
                  <><FileCheck2 className="w-5 h-5 mr-2" /> Start Processing</>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
