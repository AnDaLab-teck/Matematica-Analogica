import React, { useState } from 'react';
import OperatorSelector, { Operator } from './OperatorSelector';
import { TestConfig } from '../App';

interface TestSetupModalProps {
  onStartTest: (config: TestConfig) => void;
  onCancel: () => void;
}

const TestSetupModal: React.FC<TestSetupModalProps> = ({ onStartTest, onCancel }) => {
  const [selectedOperators, setSelectedOperators] = useState<Operator[]>(['+']);
  const [isHelpAllowed, setIsHelpAllowed] = useState(true);

  const handleStart = () => {
    if (selectedOperators.length > 0) {
      onStartTest({ operators: selectedOperators, helpAllowed: isHelpAllowed });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full flex flex-col gap-6 animate-fade-in-up">
        <h2 className="text-3xl font-bold text-slate-800 text-center">Configura il Test</h2>
        
        <div>
            <h3 className="text-lg font-semibold text-slate-700 mb-3 text-center">1. Scegli le operazioni</h3>
            <OperatorSelector selectedOperators={selectedOperators} onOperatorChange={setSelectedOperators} />
        </div>

        <div className="border-t border-slate-200"></div>

        <div>
            <h3 className="text-lg font-semibold text-slate-700 mb-3 text-center">2. Opzioni</h3>
            <div className="flex items-center justify-center gap-3">
                <label htmlFor="help-allowed-toggle" className="text-slate-600 font-medium cursor-pointer">Consenti Aiuto Visivo</label>
                <button
                    id="help-allowed-toggle"
                    role="switch"
                    aria-checked={isHelpAllowed}
                    onClick={() => setIsHelpAllowed(!isHelpAllowed)}
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 ${
                    isHelpAllowed ? 'bg-amber-500' : 'bg-slate-300'
                    }`}
                >
                    <span
                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${
                        isHelpAllowed ? 'translate-x-6' : 'translate-x-1'
                    }`}
                    />
                </button>
            </div>
        </div>

        <div className="border-t border-slate-200"></div>

        <div className="flex justify-center items-center gap-4 mt-4">
          <button
            onClick={onCancel}
            className="px-8 py-3 rounded-full text-base font-semibold transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            Annulla
          </button>
          <button
            onClick={handleStart}
            disabled={selectedOperators.length === 0}
            className="px-8 py-3 rounded-full text-base font-semibold transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 bg-teal-500 text-white hover:bg-teal-600 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Inizia Test
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default TestSetupModal;
