"use client";
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, File, X, FileCheck2, Loader2, Link as LinkIcon, PlaySquare, Code, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

export default function UploadPage() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const [sourceUrl, setSourceUrl] = useState("");
  const [activeTab, setActiveTab] = useState("file");

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
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

  const handleFileUpload = async () => {
    if (files.length === 0) return;
    setIsUploading(true);
    
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('source_type', 'file');
        
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

  const handleUrlUpload = async () => {
    if (!sourceUrl.trim()) {
      toast.error("Please enter a valid URL");
      return;
    }
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('source_url', sourceUrl.trim());
      formData.append('source_type', activeTab);
      
      await apiFetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });
      
      toast.success("Source added successfully!");
      setSourceUrl("");
      router.push('/documents');
    } catch (error: any) {
      toast.error("Upload failed: " + (error.message || "Unknown error"));
      console.error("Upload error", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-8 animate-in zoom-in-95 duration-500">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-white">Ingest Knowledge</h1>
        <p className="text-zinc-400 text-lg">Add files, websites, or repositories to your intelligent database.</p>
      </div>

      <Tabs defaultValue="file" className="w-full flex flex-col" onValueChange={(v) => { setActiveTab(v); setSourceUrl(""); }}>
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-white/5 border border-white/10 mb-8 h-auto p-1 gap-1">
          <TabsTrigger value="file" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300 transition-all py-2">
            <UploadCloud className="w-4 h-4 mr-1 sm:mr-2 shrink-0" /> <span className="truncate text-xs sm:text-sm">Documents</span>
          </TabsTrigger>
          <TabsTrigger value="url" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 transition-all py-2">
            <Globe className="w-4 h-4 mr-1 sm:mr-2 shrink-0" /> <span className="truncate text-xs sm:text-sm">Web URL</span>
          </TabsTrigger>
          <TabsTrigger value="youtube" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-300 transition-all py-2">
            <PlaySquare className="w-4 h-4 mr-1 sm:mr-2 shrink-0" /> <span className="truncate text-xs sm:text-sm">YouTube</span>
          </TabsTrigger>
          <TabsTrigger value="github" className="data-[state=active]:bg-zinc-700/50 data-[state=active]:text-zinc-300 transition-all py-2">
            <Code className="w-4 h-4 mr-1 sm:mr-2 shrink-0" /> <span className="truncate text-xs sm:text-sm">GitHub</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="file" className="space-y-4">
          <div className={`grid gap-6 ${files.length > 0 ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
            <Card 
              className={`glass-card bg-white/5 border-2 border-dashed transition-all duration-300 relative overflow-hidden h-full min-h-[300px] ${
                isDragging ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/20 hover:border-white/40'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <CardContent className="flex flex-col items-center justify-center h-full py-12 text-center">
                <div className="w-20 h-20 mb-6 rounded-full bg-white/5 flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping opacity-20" />
                  <UploadCloud className={`w-10 h-10 ${isDragging ? 'text-indigo-400' : 'text-zinc-400'}`} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Drag & Drop files here</h3>
                <p className="text-zinc-400 mb-8 max-w-sm px-4">Support for PDF, DOCX, TXT, MD up to 50MB. Files will be automatically processed.</p>
                <div className="relative">
                  <input 
                    type="file" 
                    multiple 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => e.target.files && setFiles(Array.from(e.target.files))}
                    accept=".pdf,.docx,.txt,.md"
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
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col space-y-4 h-fit"
                >
                  <Card className="glass-card bg-white/5 border border-white/10 flex flex-col overflow-hidden h-fit">
                    <CardContent className="p-6 flex flex-col">
                      <div className="flex items-center justify-between mb-4">
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
                      
                      <div className="grid gap-3 overflow-y-auto pr-2 max-h-[300px]">
                        {files.map((file, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 shrink-0">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
                                <File className="w-5 h-5 text-indigo-400" />
                              </div>
                              <div className="overflow-hidden">
                                <p className="text-white font-medium truncate">{file.name}</p>
                                <p className="text-sm text-zinc-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setFiles(files.filter((_, index) => index !== i))} className="text-zinc-500 hover:text-red-400 shrink-0">
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      <div className="pt-6">
                        <Button 
                          size="lg" 
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                          onClick={handleFileUpload}
                          disabled={isUploading}
                        >
                          {isUploading ? (
                            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</>
                          ) : (
                            <><FileCheck2 className="w-5 h-5 mr-2" /> Start Processing {files.length} {files.length === 1 ? 'file' : 'files'}</>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </TabsContent>

        {['url', 'youtube', 'github'].map((tab) => (
          <TabsContent key={tab} value={tab}>
            <Card className="glass-card bg-white/5 border border-white/10 relative overflow-hidden">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  tab === 'url' ? 'bg-blue-500/20 text-blue-400' : 
                  tab === 'youtube' ? 'bg-red-500/20 text-red-400' : 'bg-zinc-700/50 text-zinc-300'
                }`}>
                  {tab === 'url' && <Globe className="w-8 h-8" />}
                  {tab === 'youtube' && <PlaySquare className="w-8 h-8" />}
                  {tab === 'github' && <Code className="w-8 h-8" />}
                </div>
                
                <div className="space-y-2 w-full max-w-lg">
                  <h3 className="text-xl font-semibold text-white">
                    {tab === 'url' ? 'Ingest Webpage' : tab === 'youtube' ? 'Ingest YouTube Transcript' : 'Ingest GitHub Repository'}
                  </h3>
                  <p className="text-zinc-400 text-sm">
                    {tab === 'url' ? 'Enter any public URL to extract and learn its text content.' : 
                     tab === 'youtube' ? 'Enter a YouTube video URL to extract and process its captions.' : 
                     'Enter a raw GitHub file URL or repository README link.'}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row w-full max-w-lg gap-3 sm:gap-2 px-4 sm:px-0">
                  <Input 
                    type="url" 
                    placeholder={`https://${tab === 'youtube' ? 'youtube.com/watch?v=...' : tab === 'github' ? 'raw.githubusercontent.com/...' : 'example.com/article'}`} 
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    className="bg-black/40 border-white/10 text-white placeholder:text-zinc-600 h-12"
                    onKeyDown={(e) => e.key === 'Enter' && handleUrlUpload()}
                  />
                  <Button 
                    size="lg" 
                    className={`${
                      tab === 'url' ? 'bg-blue-600 hover:bg-blue-700' : 
                      tab === 'youtube' ? 'bg-red-600 hover:bg-red-700' : 'bg-zinc-100 text-black hover:bg-zinc-300'
                    } h-12 px-6`}
                    onClick={handleUrlUpload}
                    disabled={isUploading || !sourceUrl.trim()}
                  >
                    {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LinkIcon className="w-5 h-5 mr-2" />}
                    {isUploading ? 'Extracting...' : 'Ingest'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
