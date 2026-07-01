'use client';

import React, { type InputHTMLAttributes, type TextareaHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface InputBaseProps {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
  iconRight?: ReactNode;
}

interface InputFieldProps
  extends InputBaseProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  multiline?: false;
}

interface TextareaFieldProps
  extends InputBaseProps,
    Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  multiline: true;
}

type InputProps = InputFieldProps | TextareaFieldProps;

export default function Input(props: InputProps) {
  const { label, error, helperText, icon, iconRight, multiline, className, id, ...rest } = props;

  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  const baseClasses = cn(
    'w-full bg-[var(--surface-2)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
    'border border-[var(--glass-border)] rounded-xl',
    'transition-all duration-200',
    'focus:outline-none focus:border-[var(--color-primary)]/50 focus:ring-2 focus:ring-[var(--color-primary)]/20',
    'hover:border-[var(--glass-border-hover)]',
    error && 'border-rose-500/50 focus:border-rose-500/50 focus:ring-rose-500/20',
    icon ? 'pl-10' : 'pl-4',
    iconRight ? 'pr-10' : 'pr-4',
    multiline ? 'py-3 min-h-[100px] resize-y' : 'py-2.5',
    'text-sm',
    className,
  );

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-[var(--text-secondary)]"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
            {icon}
          </span>
        )}
        {multiline ? (
          <textarea
            id={inputId}
            className={baseClasses}
            {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            id={inputId}
            className={baseClasses}
            {...(rest as InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
        {iconRight && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
            {iconRight}
          </span>
        )}
      </div>
      {error && (
        <p className="text-xs text-rose-400 flex items-center gap-1">
          <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-xs text-[var(--text-muted)]">{helperText}</p>
      )}
    </div>
  );
}
