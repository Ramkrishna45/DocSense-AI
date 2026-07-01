export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSecs < 10) return 'just now';
  if (diffSecs < 60) return `${diffSecs}s ago`;
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 5) return `${diffWeeks}w ago`;
  return `${diffMonths}mo ago`;
}

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function getFileIcon(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const iconMap: Record<string, string> = {
    pdf: '📄',
    docx: '📝',
    doc: '📝',
    txt: '📃',
    md: '📋',
    csv: '📊',
    xlsx: '📊',
    xls: '📊',
    pptx: '📽️',
    ppt: '📽️',
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️',
    gif: '🖼️',
    svg: '🎨',
    json: '🔧',
    xml: '🔧',
    html: '🌐',
    css: '🎨',
    js: '⚡',
    ts: '⚡',
    py: '🐍',
    zip: '📦',
    rar: '📦',
  };
  return iconMap[ext] || '📄';
}

export function getStatusColor(
  status: 'pending' | 'processing' | 'indexed' | 'error',
): string {
  const colorMap: Record<string, string> = {
    pending: 'text-amber-400',
    processing: 'text-blue-400',
    indexed: 'text-emerald-400',
    error: 'text-rose-400',
  };
  return colorMap[status] || 'text-gray-400';
}

export function getStatusBgColor(
  status: 'pending' | 'processing' | 'indexed' | 'error',
): string {
  const colorMap: Record<string, string> = {
    pending: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
    processing: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
    indexed: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
    error: 'bg-rose-400/10 text-rose-400 border-rose-400/20',
  };
  return colorMap[status] || 'bg-gray-400/10 text-gray-400 border-gray-400/20';
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}

export function cn(...inputs: (ClassValue | ((...args: unknown[]) => unknown))[]) {
  return twMerge(clsx(inputs as ClassValue[]))
}
