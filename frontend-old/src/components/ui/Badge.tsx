'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'pending' | 'processing' | 'indexed' | 'completed' | 'error' | 'failed' | 'default';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  pending: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
  processing: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
  indexed: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
  completed: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
  error: 'bg-rose-400/10 text-rose-400 border-rose-400/20',
  failed: 'bg-rose-400/10 text-rose-400 border-rose-400/20',
  default: 'bg-white/5 text-[var(--text-secondary)] border-white/10',
};

const dotColors: Record<BadgeVariant, string> = {
  pending: 'bg-amber-400',
  processing: 'bg-blue-400 animate-pulse',
  indexed: 'bg-emerald-400',
  completed: 'bg-emerald-400',
  error: 'bg-rose-400',
  failed: 'bg-rose-400',
  default: 'bg-gray-400',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
};

export default function Badge({
  variant = 'default',
  size = 'sm',
  dot = false,
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium border rounded-full whitespace-nowrap',
        variantClasses[variant],
        sizeClasses[size],
        variant === 'processing' && 'animate-pulse-slow',
        className,
      )}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant])} />
      )}
      {children}
    </span>
  );
}
