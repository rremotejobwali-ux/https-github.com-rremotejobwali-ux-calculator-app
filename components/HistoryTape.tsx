import React from 'react';
import { HistoryItem } from '../types';

interface HistoryTapeProps {
  history: HistoryItem[];
  onSelect: (result: string) => void;
}

export const HistoryTape: React.FC<HistoryTapeProps> = ({ history, onSelect }) => {
  if (history.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-3 opacity-60">
        <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-600 flex items-center justify-center">
          <span className="text-xl font-bold">?</span>
        </div>
        <p className="text-sm font-medium">No history yet</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
      
      {history.map((item) => (
        <div 
          key={item.id} 
          onClick={() => onSelect(item.result)}
          className="group p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 cursor-pointer border border-transparent hover:border-indigo-500/30 active:scale-[0.98]"
        >
          <div className="text-slate-400 text-sm mb-1 font-mono">{item.expression}</div>
          <div className="text-white text-xl font-medium text-right group-hover:text-indigo-300 transition-colors">
            {item.result}
          </div>
        </div>
      ))}
    </div>
  );
};