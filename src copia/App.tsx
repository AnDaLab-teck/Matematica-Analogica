import React, { useState } from 'react';
import LineaDel20 from './components/LineaDel20';
import QuadroDel100 from './components/QuadroDel100';
import OperatorSelector, { Operator } from './components/OperatorSelector';
import TestSetupModal from './components/TestSetupModal';
import TestReportModal from './components/TestReportModal';

type View = 'linea' | 'quadro';
export interface TestConfig {
  operators: Operator[];
  helpAllowed: boolean;
}
export interface TestResult {
    num1: number;
    num2: number;
    operator: Operator;
    userAnswer: number;
    correctAnswer: number;
    isCorrect: boolean;
}

interface TabButtonProps {
  view: View;
  label: string;
  activeView: View;
  onClick: (view: View) => void;
  disabled?: boolean;
}

const TabButton: React.FC<TabButtonProps> = ({ view, label, activeView, onClick, disabled }) => (
  <button
    onClick={() => onClick(view)}
    disabled={disabled}
    className={`px-6 py-2.5 rounded-full text-base font-semibold transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
      activeView === view
        ? 'bg-blue-600 text-white shadow-md'
        : 'bg-white text-blue-600 hover:bg-blue-50 border border-slate-300'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    {label}
  </button>
);


const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('linea');
  const [practiceOperators, setPracticeOperators] = useState<Operator[]>(['+']);
  
  // Test Mode State
  const [isTestMode, setIsTestMode] = useState(false);
  const [isTestSetupVisible, setIsTestSetupVisible] = useState(false);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testConfig, setTestConfig] = useState<TestConfig | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [problemKey, setProblemKey] = useState(0); // Used to trigger new problems

  const handleTestModeToggle = (isOn: boolean) => {
    setIsTestMode(isOn);
    if (isOn) {
      setIsTestSetupVisible(true);
    } else {
      // Exit test mode
      setIsTestRunning(false);
      setTestConfig(null);
      setTestResults([]);
    }
  };

  const handleStartTest = (config: TestConfig) => {
    setTestConfig(config);
    setTestResults([]);
    setProblemKey(0);
    setIsTestSetupVisible(false);
    setIsTestRunning(true);
  };

  const handleCancelTestSetup = () => {
    setIsTestSetupVisible(false);
    setIsTestMode(false);
  };
  
  const handleProblemAnswered = (result: Omit<TestResult, 'isCorrect'>) => {
    const isCorrect = result.userAnswer === result.correctAnswer;
    const newResults = [...testResults, { ...result, isCorrect }];
    setTestResults(newResults);

    // Give feedback time before loading next question
    setTimeout(() => {
        if (newResults.length < 10) {
            setProblemKey(k => k + 1);
        } else {
            // Test finished
            setIsTestRunning(false);
        }
    }, 1500);
  };

  const handleCloseReport = () => {
    setTestResults([]);
    setIsTestMode(false);
    setTestConfig(null);
  }
  
  const selectedOperators = isTestRunning ? testConfig!.operators : practiceOperators;

  return (
    <div className="bg-gradient-to-br from-sky-100 to-indigo-200 min-h-screen flex flex-col items-center p-4 sm:p-8 font-sans antialiased">
      {isTestSetupVisible && (
        <TestSetupModal onStartTest={handleStartTest} onCancel={handleCancelTestSetup} />
      )}
      {testResults.length >= 10 && !isTestRunning && (
        <TestReportModal results={testResults} onClose={handleCloseReport} />
      )}

      <header className="text-center mb-6">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-800 tracking-tight">
          Matematica Analogica
        </h1>
      </header>

      <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl shadow-md mb-6 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
        <nav className="flex space-x-4">
          <TabButton view="linea" label="Linea del 20" activeView={activeView} onClick={setActiveView} disabled={isTestRunning}/>
          <TabButton view="quadro" label="Quadro del 100" activeView={activeView} onClick={setActiveView} disabled={isTestRunning}/>
        </nav>
        <div className="h-8 w-px bg-slate-300 hidden sm:block"></div>
        <div className="flex items-center gap-3">
            <label htmlFor="test-mode-toggle" className="text-slate-700 font-semibold cursor-pointer">Modalità Test</label>
            <button
                id="test-mode-toggle"
                role="switch"
                aria-checked={isTestMode}
                onClick={() => handleTestModeToggle(!isTestMode)}
                disabled={isTestRunning}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                isTestMode ? 'bg-teal-500' : 'bg-slate-300'
                }`}
            >
                <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${
                    isTestMode ? 'translate-x-6' : 'translate-x-1'
                }`}
                />
            </button>
        </div>
      </div>


      { !isTestMode ? (
         <OperatorSelector selectedOperators={practiceOperators} onOperatorChange={setPracticeOperators} />
      ) : isTestRunning && (
        <div className="text-center bg-white/80 py-2 px-6 rounded-full shadow-inner mb-6">
            <p className="text-slate-800 font-bold text-lg">
                Domanda {Math.min(10, testResults.length + 1)} di 10
            </p>
        </div>
      )}


      <main className="w-full relative flex-grow flex items-start justify-center">
        <div className={`w-full transition-opacity duration-300 ease-in-out ${activeView === 'linea' ? 'opacity-100' : 'opacity-0 absolute pointer-events-none'}`}>
          <LineaDel20 
            selectedOperators={selectedOperators}
            isTestMode={isTestRunning}
            testConfig={testConfig}
            onProblemAnswered={handleProblemAnswered}
            problemKey={problemKey}
          />
        </div>
        <div className={`w-full transition-opacity duration-300 ease-in-out ${activeView === 'quadro' ? 'opacity-100' : 'opacity-0 absolute pointer-events-none'}`}>
          <QuadroDel100 
            selectedOperators={selectedOperators}
            isTestMode={isTestRunning}
            testConfig={testConfig}
            onProblemAnswered={handleProblemAnswered}
            problemKey={problemKey}
          />
        </div>
      </main>
    </div>
  );
};

export default App;