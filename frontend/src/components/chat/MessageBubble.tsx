import React from 'react';
import { Message } from '@/types';
import SourceCitation from './SourceCitation';

export default function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  
  // Simple markdown-like formatting for bold and line breaks
  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
        <br/>
      </span>
    ));
  };

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-slideUp`}>
      <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-5 ${
        isUser 
          ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-900/20 rounded-tr-sm' 
          : 'bg-slate-800/80 backdrop-blur-sm border border-slate-700 text-slate-200 rounded-tl-sm'
      }`}>
        
        {!isUser && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">AI Assistant</span>
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
        
        <div className={`text-[10px] mt-2 ${isUser ? 'text-indigo-200 text-right' : 'text-slate-500 text-left'}`}>
          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}
