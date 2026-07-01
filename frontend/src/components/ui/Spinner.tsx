'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type SpinnerSize = 'sm' | 'md' | 'lg';

interface SpinnerProps {
  size?: SpinnerSize;
  text?: string;
  className?: string;
}

const sizeClasses: Record<SpinnerSize, { ring: string; glow: string }> = {
  sm: { ring: 'w-5 h-5', glow: 'w-8 h-8' },
  md: { ring: 'w-8 h-8', glow: 'w-12 h-12' },
  lg: { ring: 'w-12 h-12', glow: 'w-16 h-16' },
};

const borderSize: Record<SpinnerSize, string> = {
  sm: 'border-2',
  md: 'border-[3px]',
  lg: 'border-4',
};

export default function Spinner({
  size = 'md',
  text,
  className,
}: SpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div className="relative flex items-center justify-center">
        {/* Glow backdrop */}
        <div
          className={cn(
            'absolute rounded-full bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 blur-xl animate-pulse',
            sizeClasses[size].glow,
          )}
        />

        {/* Outer spinning ring */}
        <motion.div
          className={cn(
            'rounded-full',
            borderSize[size],
            'border-transparent border-t-cyan-400 border-r-emerald-400',
            sizeClasses[size].ring,
          )}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, ease: 'linear', repeat: Infinity }}
        />

        {/* Inner reverse ring */}
        <motion.div
          className={cn(
            'absolute rounded-full',
            size === 'sm' ? 'inset-[3px] border' : size === 'md' ? 'inset-1 border-2' : 'inset-1.5 border-2',
            'border-transparent border-b-cyan-300/40 border-l-emerald-300/30',
          )}
          animate={{ rotate: -360 }}
          transition={{ duration: 0.75, ease: 'linear', repeat: Infinity }}
        />
      </div>

      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="text-sm text-slate-400 font-medium"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}
