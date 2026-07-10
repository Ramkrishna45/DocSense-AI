"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Loader2, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Setup PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface DocumentViewerProps {
  pdfUrl: string;
  initialPage?: number;
  searchText?: string;
}

export default function DocumentViewer({ pdfUrl, initialPage = 1, searchText = '' }: DocumentViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(initialPage);
  const [scale, setScale] = useState<number>(1.0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialPage) {
      setPageNumber(initialPage);
    }
  }, [initialPage]);

  // Adjust scale automatically for mobile screens on load
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setScale(0.6); // smaller scale for mobile
      } else {
        setScale(1.2);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const textRenderer = React.useCallback(
    ({ str }: { str: string }) => {
      if (!searchText) return str;
      const words = searchText.match(/\b\w{5,}\b/g) || [];
      if (words.length === 0) return str;
      
      const pattern = new RegExp(`(${words.join('|')})`, 'gi');
      const split = str.split(pattern);
      if (split.length <= 1) return str;
      
      return (
        <React.Fragment>
          {split.map((part, index) => 
            index % 2 === 1 ? <mark key={index} className="bg-yellow-400/50 text-transparent rounded px-0.5" title="Highlighted match">{part}</mark> : part
          )}
        </React.Fragment>
      );
    },
    [searchText]
  );

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => {
      const newPage = prevPageNumber + offset;
      if (numPages && newPage > numPages) return numPages;
      if (newPage < 1) return 1;
      return newPage;
    });
  };

  const changeScale = (offset: number) => {
    setScale(prevScale => Math.max(0.4, Math.min(prevScale + offset, 3.0)));
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900 rounded-xl overflow-hidden border border-white/10" ref={containerRef}>
      <div className="flex items-center justify-between p-3 bg-black/40 border-b border-white/10 z-10 shrink-0 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => changePage(-1)} 
            disabled={pageNumber <= 1}
            className="text-zinc-400 hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <span className="text-zinc-300 text-sm font-medium w-24 text-center">
            Page {pageNumber} of {numPages || '--'}
          </span>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => changePage(1)} 
            disabled={numPages === null || pageNumber >= numPages}
            className="text-zinc-400 hover:text-white"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => changeScale(-0.2)} 
            className="text-zinc-400 hover:text-white"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-zinc-400 text-xs w-12 text-center">{Math.round(scale * 100)}%</span>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => changeScale(0.2)} 
            className="text-zinc-400 hover:text-white"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setScale(window.innerWidth < 640 ? 0.6 : 1.2)} 
            className="text-zinc-400 hover:text-white hidden sm:flex"
            title="Reset Zoom"
          >
            <Maximize className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-zinc-950 p-4 custom-scrollbar text-center relative">
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex flex-col items-center justify-center h-64 gap-4 w-full max-w-2xl mx-auto">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <p className="text-zinc-400 text-sm">Loading PDF securely...</p>
            </div>
          }
          error={
            <div className="flex flex-col items-center justify-center h-64 gap-2 text-red-400">
              <p>Failed to load PDF.</p>
            </div>
          }
          className="inline-block text-left"
        >
          <div className="bg-white rounded shadow-xl overflow-hidden transition-transform mx-auto w-fit">
            <Page 
              pageNumber={pageNumber} 
              scale={scale} 
              loading={
                <div className="flex justify-center items-center h-96 w-64">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                </div>
              }
              renderTextLayer={true}
              renderAnnotationLayer={true}
              {/* @ts-expect-error react-pdf typing for customTextRenderer is incomplete in some versions */}
              customTextRenderer={textRenderer as any}
            />
          </div>
        </Document>
      </div>
    </div>
  );
}
