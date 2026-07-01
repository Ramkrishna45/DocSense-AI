import React from 'react';

export default function TypingIndicator() {
  return (
    <div className="flex justify-start animate-fadeIn">
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-2">
        <span className="text-xs font-medium text-indigo-400 mr-2">AI is thinking</span>
        <div className="flex space-x-1">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}
