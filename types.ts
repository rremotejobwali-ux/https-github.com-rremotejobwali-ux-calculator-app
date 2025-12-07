export enum CalculatorAction {
  ADD = '+',
  SUBTRACT = '-',
  MULTIPLY = '×',
  DIVIDE = '÷',
  EQUALS = '=',
  CLEAR = 'C',
  CLEAR_ENTRY = 'CE',
  DECIMAL = '.',
  PERCENT = '%',
  TOGGLE_SIGN = '±',
  BACKSPACE = '⌫'
}

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

export type Operator = CalculatorAction.ADD | CalculatorAction.SUBTRACT | CalculatorAction.MULTIPLY | CalculatorAction.DIVIDE;