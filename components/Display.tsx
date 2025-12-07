import React, { useEffect, useRef } from 'react';

interface DisplayProps {
  value: string;
  expression: string;
  isHistoryOpen: boolean;
  toggleHistory: () => void;
}

export const Display: React.FC<DisplayProps> = ({ value, expression, isHistoryOpen, toggleHistory }) => {
  const valueRef = useRef<HTMLDivElement>(null);

  // Auto-scale font size based on length
  useEffect(() => {
    const node = valueRef.current;
    if (node) {
      const length = value.length;
      if (length > 12) node.style.fontSize = '2rem';
      else if (length > 9) node.style.fontSize = '2.5rem';
      else node.style.fontSize = '3.5rem';
    }
  }, [value]);

  return (
    <div className="relative w-full mb-4 p-6 bg-slate-950/50 rounded-3xl border border-white/5 shadow-inner flex flex-col items-end justify-end h-40 sm:h-48 overflow-hidden transition-all duration-300">
      
      {/* History Toggle Button */}
      <button 
        onClick={toggleHistory}
        className={`absolute top-4 left-4 p-2 rounded-full transition-colors duration-200 ${isHistoryOpen ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}
        title="View History"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/>
        </svg>
      </button>

      {/* Previous Expression */}
      <div className="text-slate-400 text-sm sm:text-base font-medium h-6 mb-1 tracking-wide opacity-80 truncate w-full text-right">
        {expression}
      </div>

      {/* Main Value */}
      <div 
        ref={valueRef}
        className="text-white font-light tracking-tight w-full text-right break-words leading-none transition-all duration-200"
        style={{ fontSize: '3.5rem' }}
      >
        {value}
      </div>
    </div>
  );
};