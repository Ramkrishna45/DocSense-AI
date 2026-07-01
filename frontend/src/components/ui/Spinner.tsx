'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type SpinnerSize = 'sm' | 'md' | 'lg';

interface SpinnerProps {
  size?: SpinnerSize;
  text?: string;
  className?: string;
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-10 h-10',
};

export default function Spinner({
  size = 'md',
  text,
  className,
}: SpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div className={cn('relative', sizeClasses[size])}>
        <div
          className={cn(
            'absolute inset-0 rounded-full border-2 border-transparent',
            'border-t-cyan-500 border-r-emerald-500',
            'animate-spin',
          )}
        />
        <div
          className={cn(
            'absolute inset-1 rounded-full border-2 border-transparent',
            'border-b-cyan-400/50',
            'animate-spin',
          )}
          style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}
        />
      </div>
      {text && (
        <p className="text-sm text-[var(--text-muted)] animate-pulse-slow">
          {text}
        </p>
      )}
    </div>
  );
}
