import React, { useState, useEffect, useCallback } from 'react';
import { CalculatorAction, Operator, HistoryItem } from '../types';
import { CalculatorButton } from './CalculatorButton';
import { Display } from './Display';
import { HistoryTape } from './HistoryTape';
import { CalculatorIcon, Delete } from 'lucide-react';

const MAX_DIGITS = 16;

export const Calculator: React.FC = () => {
  const [currentValue, setCurrentValue] = useState<string>('0');
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [lastActionWasEquals, setLastActionWasEquals] = useState<boolean>(false);

  // Helper to fix floating point precision errors
  // e.g. 0.1 + 0.2 = 0.30000000000000004 -> 0.3
  const safeMath = (a: number, b: number, op: Operator): number => {
    // Convert to integers to avoid floating point issues for common cases if possible, 
    // but simplified precision fixing is usually enough for a basic calc.
    let result = 0;
    switch (op) {
      case CalculatorAction.ADD: result = a + b; break;
      case CalculatorAction.SUBTRACT: result = a - b; break;
      case CalculatorAction.MULTIPLY: result = a * b; break;
      case CalculatorAction.DIVIDE: 
        if (b === 0) throw new Error("Divide by zero");
        result = a / b; 
        break;
    }
    return parseFloat(result.toPrecision(12));
  };

  const handleClear = useCallback(() => {
    setCurrentValue('0');
    setPreviousValue(null);
    setOperator(null);
    setWaitingForNewValue(false);
    setLastActionWasEquals(false);
  }, []);

  const handleClearEntry = useCallback(() => {
    setCurrentValue('0');
    setLastActionWasEquals(false);
  }, []);

  const handleNumber = useCallback((num: string) => {
    if (lastActionWasEquals) {
      setCurrentValue(num);
      setLastActionWasEquals(false);
      return;
    }

    if (waitingForNewValue) {
      setCurrentValue(num);
      setWaitingForNewValue(false);
    } else {
      setCurrentValue(prev => {
        if (prev === '0') return num;
        if (prev.length >= MAX_DIGITS) return prev;
        return prev + num;
      });
    }
  }, [waitingForNewValue, lastActionWasEquals]);

  const handleDecimal = useCallback(() => {
    if (waitingForNewValue || lastActionWasEquals) {
      setCurrentValue('0.');
      setWaitingForNewValue(false);
      setLastActionWasEquals(false);
      return;
    }
    if (!currentValue.includes('.')) {
      setCurrentValue(prev => prev + '.');
    }
  }, [waitingForNewValue, currentValue, lastActionWasEquals]);

  const handleOperator = useCallback((op: Operator) => {
    const current = parseFloat(currentValue);

    if (operator && !waitingForNewValue && previousValue) {
      // Chaining operations (e.g., 1 + 2 + ...)
      // Calculate the pending operation first
      const prev = parseFloat(previousValue);
      try {
        const result = safeMath(prev, current, operator);
        setPreviousValue(result.toString());
        setCurrentValue(result.toString());
      } catch (e) {
        setCurrentValue("Error");
        setPreviousValue(null);
        setOperator(null);
        return;
      }
    } else {
      setPreviousValue(currentValue);
    }

    setOperator(op);
    setWaitingForNewValue(true);
    setLastActionWasEquals(false);
  }, [currentValue, operator, previousValue, waitingForNewValue]);

  const handleEquals = useCallback(() => {
    if (!operator || !previousValue) return;

    const current = parseFloat(currentValue);
    const prev = parseFloat(previousValue);

    try {
      const result = safeMath(prev, current, operator);
      const resultStr = result.toString();

      // Add to history
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        expression: `${prev} ${operator} ${current} =`,
        result: resultStr,
        timestamp: Date.now()
      };
      setHistory(prevHist => [newHistoryItem, ...prevHist].slice(0, 50)); // Keep last 50

      setCurrentValue(resultStr);
      setPreviousValue(null);
      setOperator(null);
      setWaitingForNewValue(true);
      setLastActionWasEquals(true);
    } catch (e) {
      setCurrentValue("Error");
      setPreviousValue(null);
      setOperator(null);
      setWaitingForNewValue(true);
    }
  }, [currentValue, operator, previousValue]);

  const handleBackspace = useCallback(() => {
    if (waitingForNewValue || lastActionWasEquals || currentValue === 'Error') return;

    setCurrentValue(prev => {
      if (prev.length === 1) return '0';
      return prev.slice(0, -1);
    });
  }, [waitingForNewValue, lastActionWasEquals, currentValue]);

  const handleToggleSign = useCallback(() => {
    if (currentValue === '0' || currentValue === 'Error') return;
    setCurrentValue(prev => (parseFloat(prev) * -1).toString());
  }, [currentValue]);

  const handlePercent = useCallback(() => {
    if (currentValue === 'Error') return;
    const val = parseFloat(currentValue);
    setCurrentValue((val / 100).toString());
    setLastActionWasEquals(true); // Treat as a result
  }, [currentValue]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;

      if (/[0-9]/.test(key)) handleNumber(key);
      if (key === '.') handleDecimal();
      if (key === '+' || key === '-' || key === '*' || key === '/') {
        let op = key;
        if (key === '*') op = CalculatorAction.MULTIPLY;
        if (key === '/') op = CalculatorAction.DIVIDE;
        if (key === '+') op = CalculatorAction.ADD;
        if (key === '-') op = CalculatorAction.SUBTRACT;
        handleOperator(op as Operator);
      }
      if (key === 'Enter' || key === '=') {
        e.preventDefault();
        handleEquals();
      }
      if (key === 'Backspace') handleBackspace();
      if (key === 'Escape') handleClear();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNumber, handleDecimal, handleOperator, handleEquals, handleBackspace, handleClear]);


  // Construct display expression string
  const getDisplayExpression = () => {
    if (operator && previousValue) {
      return `${previousValue} ${operator}`;
    }
    return '';
  };

  const handleHistorySelect = (result: string) => {
    setCurrentValue(result);
    setWaitingForNewValue(false);
    setLastActionWasEquals(false);
    setIsHistoryOpen(false); // Close mobile history on select
  };

  return (
    <div className="flex flex-col sm:flex-row gap-6 items-start relative z-10">
      
      {/* Main Calculator Body */}
      <div className="w-full sm:w-[360px] bg-slate-900/80 backdrop-blur-2xl p-5 rounded-[2.5rem] shadow-2xl border border-white/10 ring-1 ring-black/5">
        
        <Display 
          value={currentValue} 
          expression={getDisplayExpression()} 
          isHistoryOpen={isHistoryOpen}
          toggleHistory={() => setIsHistoryOpen(!isHistoryOpen)}
        />

        <div className="grid grid-cols-4 gap-3 sm:gap-4">
          <CalculatorButton 
            label="AC" 
            onClick={handleClear} 
            variant="secondary"
            className="text-red-300"
          />
          <CalculatorButton 
            label={<Delete size={20} />} 
            onClick={handleBackspace} 
            variant="secondary"
          />
          <CalculatorButton 
            label="%" 
            onClick={handlePercent} 
            variant="secondary" 
          />
          <CalculatorButton 
            label={CalculatorAction.DIVIDE} 
            onClick={() => handleOperator(CalculatorAction.DIVIDE)} 
            variant="primary" 
          />

          <CalculatorButton label="7" onClick={() => handleNumber('7')} />
          <CalculatorButton label="8" onClick={() => handleNumber('8')} />
          <CalculatorButton label="9" onClick={() => handleNumber('9')} />
          <CalculatorButton 
            label={CalculatorAction.MULTIPLY} 
            onClick={() => handleOperator(CalculatorAction.MULTIPLY)} 
            variant="primary" 
          />

          <CalculatorButton label="4" onClick={() => handleNumber('4')} />
          <CalculatorButton label="5" onClick={() => handleNumber('5')} />
          <CalculatorButton label="6" onClick={() => handleNumber('6')} />
          <CalculatorButton 
            label={CalculatorAction.SUBTRACT} 
            onClick={() => handleOperator(CalculatorAction.SUBTRACT)} 
            variant="primary" 
          />

          <CalculatorButton label="1" onClick={() => handleNumber('1')} />
          <CalculatorButton label="2" onClick={() => handleNumber('2')} />
          <CalculatorButton label="3" onClick={() => handleNumber('3')} />
          <CalculatorButton 
            label={CalculatorAction.ADD} 
            onClick={() => handleOperator(CalculatorAction.ADD)} 
            variant="primary" 
          />

          <CalculatorButton label="0" onClick={() => handleNumber('0')} doubleWidth className="rounded-l-2xl" />
          <CalculatorButton label="." onClick={handleDecimal} />
          <CalculatorButton 
            label={CalculatorAction.EQUALS} 
            onClick={handleEquals} 
            variant="accent" 
          />
        </div>
      </div>

      {/* History Tape Sidebar (Responsive) */}
      <div className={`
        fixed sm:static inset-y-0 left-0 w-80 bg-slate-900/95 sm:bg-slate-900/60 backdrop-blur-xl sm:backdrop-blur-lg sm:rounded-[2rem] border-r sm:border border-white/10 shadow-2xl transform transition-transform duration-300 ease-in-out z-20 sm:z-auto sm:translate-x-0 p-4 flex flex-col
        ${isHistoryOpen ? 'translate-x-0' : '-translate-x-full sm:hidden'}
      `}>
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
          <h2 className="text-white font-medium flex items-center gap-2">
            <CalculatorIcon size={18} className="text-indigo-400" />
            History Tape
          </h2>
          <button 
            onClick={() => setIsHistoryOpen(false)} 
            className="sm:hidden text-slate-400 hover:text-white p-2"
          >
            ✕
          </button>
          {history.length > 0 && (
             <button 
             onClick={() => setHistory([])} 
             className="text-xs text-red-400 hover:text-red-300 font-medium px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 transition-colors"
           >
             Clear
           </button>
          )}
        </div>

        <HistoryTape history={history} onSelect={handleHistorySelect} />
      </div>

      {/* Backdrop for mobile history */}
      {isHistoryOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-10 sm:hidden"
          onClick={() => setIsHistoryOpen(false)}
        />
      )}

    </div>
  );
};