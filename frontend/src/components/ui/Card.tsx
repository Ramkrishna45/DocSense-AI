'use client';

import React, { type ReactNode, type HTMLAttributes } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      whileHover={hover ? { y: -4, transition: { duration: 0.25 } } : undefined}
      className={cn(
        'rounded-2xl border border-white/[0.06] transition-all duration-300',
        'bg-white/[0.03] backdrop-blur-2xl',
        'shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
        paddingClasses[padding],
        hover && 'cursor-pointer hover:border-white/[0.12] hover:bg-white/[0.06]',
        gradientBorder && 'gradient-border',
        glow &&
          'hover:shadow-[0_0_40px_rgba(6,182,212,0.12),0_0_80px_rgba(16,185,129,0.06)]',
        onClick && 'cursor-pointer',
        className,
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
}
