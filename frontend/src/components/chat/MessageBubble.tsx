import React from 'react';
import { Message } from '@/types';
import SourceCitation from './SourceCitation';

export default function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  

  return (
    <div
      className={`flex gap-4 w-full ${isUser ? 'flex-row-reverse' : ''} animate-fadeInUp group`}
    >
      {/* Avatar */}
      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser 
          ? 'bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-secondary)] shadow-lg shadow-[var(--color-primary)]/20' 
          : 'glass-strong border border-[var(--color-accent)]/30 text-[var(--color-accent)] shadow-[var(--shadow-glow)]'
      }`}>
        {isUser ? (
          <span className="text-sm font-bold text-white">U</span>
        ) : (
          <span className="text-sm font-bold">AI</span>
        )}
      </div>

      {/* Message Content */}
      <div
        className={`flex-1 max-w-[85%] sm:max-w-[75%] ${
          isUser ? 'items-end' : 'items-start'
        } flex flex-col gap-2`}
      >
        <div
          className={`relative p-4 md:p-5 text-[15px] leading-relaxed shadow-sm ${
            isUser
              ? 'bg-gradient-to-br from-[#10b981] to-[#059669] text-white rounded-[24px] rounded-tr-sm shadow-emerald-500/20'
              : 'glass bg-[var(--surface-2)]/80 text-[var(--text-primary)] rounded-[24px] rounded-tl-sm border border-[var(--glass-border)] group-hover:border-[var(--color-accent)]/30 transition-colors duration-300'
          }`}
        >
        
        {!isUser && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">AI Assistant</span>
            {message.confidence !== null && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                message.confidence > 0.8 ? 'bg-emerald-500/20 text-emerald-400' :
                message.confidence > 0.5 ? 'bg-amber-500/20 text-amber-400' :
                'bg-rose-500/20 text-rose-400'
              }`}>
                {Math.round(message.confidence * 100)}% Confidence
              </span>
            )}
          </div>
        )}
        
        <div className="text-sm md:text-base leading-relaxed prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: message.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
        
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-700/50">
            <h4 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Sources</h4>
            <div className="space-y-2">
              {message.sources.map((source, idx) => (
                <SourceCitation key={idx} source={source} index={idx + 1} />
              ))}
            </div>
          </div>
        )}
        
        <div className={`text-[10px] mt-2 ${isUser ? 'text-emerald-200 text-right' : 'text-[var(--text-muted)] text-left'}`}>
          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        </div>
      </div>
    </div>
  );
}
