'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { User, BrainCircuit } from 'lucide-react';
import { Message } from '@/types';
import SourceCitation from './SourceCitation';

export default function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  const confidenceColor =
    message.confidence !== null && message.confidence !== undefined
      ? message.confidence > 0.8
        ? 'ring-emerald-400/60 bg-emerald-500/15 text-emerald-400'
        : message.confidence > 0.5
        ? 'ring-amber-400/60 bg-amber-500/15 text-amber-400'
        : 'ring-rose-400/60 bg-rose-500/15 text-rose-400'
      : '';

  return (
    <motion.div
      className={`flex gap-3 md:gap-4 w-full ${isUser ? 'flex-row-reverse' : ''} group`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Avatar */}
      <motion.div
        className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
          isUser
            ? 'bg-gradient-to-tr from-emerald-500 to-emerald-400 shadow-lg shadow-emerald-500/25'
            : 'glass-strong border border-cyan-500/30 text-cyan-400 shadow-lg shadow-cyan-500/10'
        }`}
        whileHover={{ scale: 1.1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <BrainCircuit className="w-4 h-4" />
        )}
      </motion.div>

      {/* Message Content */}
      <div
        className={`flex-1 max-w-[85%] sm:max-w-[75%] ${
          isUser ? 'items-end' : 'items-start'
        } flex flex-col gap-2`}
      >
        <motion.div
          className={`relative p-4 md:p-5 text-[15px] leading-relaxed shadow-sm ${
            isUser
              ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-[22px] rounded-tr-md shadow-emerald-500/20'
              : 'glass bg-slate-800/60 backdrop-blur-xl text-slate-100 rounded-[22px] rounded-tl-md border-l-2 border-cyan-500/40 border border-slate-700/50 group-hover:border-cyan-500/30 transition-colors duration-300'
          }`}
          whileHover={{ scale: 1.005 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          {/* AI header with confidence */}
          {!isUser && (
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold uppercase tracking-wider gradient-text-vivid">
                AI Assistant
              </span>
              {message.confidence !== null && message.confidence !== undefined && (
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full ring-1 font-semibold ${confidenceColor}`}
                >
                  {Math.round(message.confidence * 100)}% Confidence
                </span>
              )}
            </div>
          )}

          {/* Message body */}
          <div
            className="text-sm md:text-base leading-relaxed prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{
              __html: message.content
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\n/g, '<br/>'),
            }}
          />

          {/* Sources */}
          {!isUser && message.sources && message.sources.length > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-700/40">
              <h4 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">
                Sources
              </h4>
              <div className="space-y-2">
                {message.sources.map((source, idx) => (
                  <SourceCitation key={idx} source={source} index={idx + 1} />
                ))}
              </div>
            </div>
          )}

          {/* Timestamp */}
          <div
            className={`text-[10px] mt-2.5 opacity-50 group-hover:opacity-80 transition-opacity duration-300 ${
              isUser ? 'text-emerald-100 text-right' : 'text-slate-400 text-left'
            }`}
          >
            {new Date(message.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
