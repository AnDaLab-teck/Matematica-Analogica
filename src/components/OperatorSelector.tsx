import React from 'react';

export type Operator = '+' | '-' | '*' | '/';

interface OperatorSelectorProps {
  selectedOperators: Operator[];
  onOperatorChange: (operators: Operator[]) => void;
}

const operators: Operator[] = ['+', '-', '*', '/'];
const operatorSymbols: { [key in Operator]: string } = {
  '+': '+',
  '-': '-',
  '*': '×',
  '/': '÷',
};

const OperatorSelector: React.FC<OperatorSelectorProps> = ({ selectedOperators, onOperatorChange }) => {
  const handleToggle = (op: Operator) => {
    const newSelection = selectedOperators.includes(op)
      ? selectedOperators.filter(o => o !== op)
      : [...selectedOperators, op];
    
    if (newSelection.length > 0) {
      onOperatorChange(newSelection);
    }
  };

  return (
    <div className="flex justify-center items-center space-x-2 sm:space-x-4 mb-8">
      <p className="text-slate-700 font-semibold mr-2 hidden sm:block">Scegli le operazioni:</p>
      {operators.map(op => (
        <button
          key={op}
          onClick={() => handleToggle(op)}
          className={`
            flex items-center justify-center h-12 w-12 rounded-full text-2xl font-bold transition-all duration-300 ease-in-out 
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
            ${selectedOperators.includes(op)
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-blue-600 hover:bg-blue-50 border border-slate-300'}
          `}
        >
          {operatorSymbols[op]}
        </button>
      ))}
    </div>
  );
};

export default OperatorSelector;
