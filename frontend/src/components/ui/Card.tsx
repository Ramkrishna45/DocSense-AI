'use client';

import React, { type ReactNode, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: CardPadding;
  hover?: boolean;
  gradientBorder?: boolean;
  glow?: boolean;
}

const paddingClasses: Record<CardPadding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-7',
};

export default function Card({
  children,
  padding = 'md',
  hover = false,
  gradientBorder = false,
  glow = false,
  className,
  onClick,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl glass transition-all duration-300',
        paddingClasses[padding],
        hover && 'hover-lift cursor-pointer glass-hover',
        gradientBorder && 'gradient-border',
        glow && 'hover:shadow-[0_0_30px_rgba(124,58,237,0.15)]',
        onClick && 'cursor-pointer',
        className,
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}
