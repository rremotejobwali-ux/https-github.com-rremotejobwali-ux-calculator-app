import React from 'react';

interface CalculatorButtonProps {
  label: string | React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'ghost';
  className?: string;
  doubleWidth?: boolean;
}

export const CalculatorButton: React.FC<CalculatorButtonProps> = ({ 
  label, 
  onClick, 
  variant = 'default',
  className = '',
  doubleWidth = false
}) => {
  
  const baseStyles = "relative overflow-hidden group h-14 sm:h-16 rounded-2xl text-xl sm:text-2xl font-medium transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-opacity-50 select-none shadow-lg";
  
  const variants = {
    default: "bg-slate-800 text-slate-200 hover:bg-slate-700 active:bg-slate-600 shadow-slate-900/20",
    primary: "bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-700 shadow-indigo-900/30",
    secondary: "bg-slate-700 text-slate-200 hover:bg-slate-600 active:bg-slate-500 shadow-slate-900/20",
    accent: "bg-emerald-500 text-white hover:bg-emerald-400 active:bg-emerald-600 shadow-emerald-900/30",
    ghost: "bg-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${doubleWidth ? 'col-span-2' : ''} ${className}`}
      onClick={onClick}
      type="button"
    >
      <span className="relative z-10 flex items-center justify-center w-full h-full">
        {label}
      </span>
      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </button>
  );
};