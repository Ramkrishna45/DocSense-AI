'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change?: string;
  accentColor?: string;
}

const accentBorderMap: Record<string, string> = {
  'from-cyan-500 to-emerald-500': 'border-l-cyan-400',
  'from-cyan-500 to-blue-500': 'border-l-cyan-400',
  'from-blue-500 to-indigo-500': 'border-l-blue-400',
  'from-purple-500 to-pink-500': 'border-l-purple-400',
  'from-emerald-500 to-teal-500': 'border-l-emerald-400',
};

export default function StatsCard({
  icon,
  label,
  value,
  change,
  accentColor = 'from-cyan-500 to-emerald-500',
}: StatsCardProps) {
  const borderClass = accentBorderMap[accentColor] || 'border-l-cyan-400';

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(
        'relative overflow-hidden rounded-2xl group cursor-pointer',
        'bg-white/[0.03] backdrop-blur-2xl',
        'border border-white/[0.06] border-l-[3px]',
        borderClass,
        'p-5 transition-all duration-300',
        'hover:bg-white/[0.06] hover:border-white/[0.1]',
        'hover:shadow-[0_8px_40px_rgba(6,182,212,0.08)]',
      )}
    >
      {/* Shimmer overlay on hover */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/[0.04] to-transparent pointer-events-none" />

      {/* Subtle gradient glow at top */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 h-px bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500',
          accentColor,
        )}
      />

      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-2 flex-1 min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400/80">
            {label}
          </p>
          <p className="text-3xl font-bold text-white tracking-tight">
            {value}
          </p>
          {change && (
            <p className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3 h-3" />
              {change}
            </p>
          )}
        </div>

        {/* Icon in gradient pill */}
        <div
          className={cn(
            'flex items-center justify-center w-12 h-12 rounded-xl',
            'bg-gradient-to-br shadow-lg',
            accentColor,
            'opacity-80 group-hover:opacity-100 transition-opacity duration-300',
            'group-hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]',
          )}
        >
          <div className="text-white [&>svg]:w-5 [&>svg]:h-5 [&>span]:text-lg">
            {icon}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
