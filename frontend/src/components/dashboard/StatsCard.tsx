'use client';

import React from 'react';
import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change?: string;
  accentColor?: string;
}

export default function StatsCard({
  icon,
  label,
  value,
  change,
  accentColor = 'from-violet-500 to-indigo-500',
}: StatsCardProps) {
  return (
    <Card hover glow className="relative overflow-hidden group">
      {/* Top gradient bar */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r opacity-60 group-hover:opacity-100 transition-opacity',
          accentColor,
        )}
      />

      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-[var(--text-muted)]">{label}</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            {value}
          </p>
          {change && (
            <p className="text-xs text-emerald-400 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              {change}
            </p>
          )}
        </div>
        <div className={cn(
          'p-3 rounded-xl bg-gradient-to-br opacity-80',
          accentColor,
        )}>
          {icon}
        </div>
      </div>
    </Card>
  );
}
