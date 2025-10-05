import React from 'react';

type AnswerStatus = 'idle' | 'correct' | 'incorrect';
type Operator = '+' | '-' | '*' | '/';

interface MathProblemProps {
  num1: number;
  num2: number;
  operator: Operator;
  message: string;
  lastAttempt: number | null;
  answerStatus: AnswerStatus;
  isHintOn: boolean;
  onHintToggle: (isOn: boolean) => void;
  isHintDisabled: boolean;
  isHintFeatureEnabled: boolean;
}

const operatorSymbols: { [key in Operator]: string } = {
  '+': '+',
  '-': '-',
  '*': '×',
  '/': '÷',
};


const MathProblem: React.FC<MathProblemProps> = ({ num1, num2, operator, message, lastAttempt, answerStatus, isHintOn, onHintToggle, isHintDisabled, isHintFeatureEnabled }) => {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex flex-col items-center gap-4">
        <h3 className="text-xl sm:text-2xl font-bold text-slate-700">Risolvi il Problema</h3>
        
        <div className="p-4 bg-slate-100 rounded-lg w-full text-center">
          <span className="text-3xl font-bold text-slate-800 tracking-wider">
            {num1} {operatorSymbols[operator]} {num2} ={' '}
            {answerStatus !== 'idle' && lastAttempt !== null && (
              <span className={answerStatus === 'correct' ? 'text-green-600' : 'text-red-600'}>
                {lastAttempt}
              </span>
            )}
          </span>
        </div>

        {isHintFeatureEnabled && (
            <div className="flex items-center justify-center gap-3 mt-2">
                <label htmlFor="hint-toggle" className="text-slate-600 font-medium cursor-pointer">Aiuto</label>
                <button
                    id="hint-toggle"
                    role="switch"
                    aria-checked={isHintOn}
                    onClick={() => onHintToggle(!isHintOn)}
                    disabled={isHintDisabled}
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isHintOn ? 'bg-amber-500' : 'bg-slate-300'
                    }`}
                >
                    <span
                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${
                        isHintOn ? 'translate-x-6' : 'translate-x-1'
                    }`}
                    />
                </button>
            </div>
        )}

        {message && (
          <div className={`mt-4 p-3 rounded-lg w-full text-center text-lg font-semibold ${
            message.includes('Corretto') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default MathProblem;