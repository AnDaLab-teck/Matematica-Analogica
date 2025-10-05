import React, { useState, useEffect, useCallback, useRef } from 'react';
import MathProblem from './Calculator';
import { Operator } from './OperatorSelector';
import { TestConfig, TestResult } from '../App';

type AnswerStatus = 'idle' | 'correct' | 'incorrect';
type HintStatus = 'step' | 'final' | 'solution';

interface HintHighlight {
  status: HintStatus;
  label: string;
}

interface QuadroDel100Props {
  selectedOperators: Operator[];
  isTestMode: boolean;
  testConfig: TestConfig | null;
  onProblemAnswered?: (result: Omit<TestResult, 'isCorrect'>) => void;
  problemKey?: number;
}

const QuadroDel100: React.FC<QuadroDel100Props> = ({ selectedOperators, isTestMode, testConfig, onProblemAnswered, problemKey }) => {
  const [lastAttempt, setLastAttempt] = useState<number | null>(null);
  const [answerStatus, setAnswerStatus] = useState<AnswerStatus>('idle');
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [operator, setOperator] = useState<Operator>('+');
  const [message, setMessage] = useState('');
  const [isHintAnimating, setIsHintAnimating] = useState(false);
  const [isHintOn, setIsHintOn] = useState(false);
  const [hintHighlights, setHintHighlights] = useState<{[key: number]: HintHighlight}>({});
  const lastProblemRef = useRef<{num1: number, num2: number, operator: Operator} | null>(null);


  const numbers = Array.from({ length: 100 }, (_, i) => i + 1);
  
  const generateProblem = useCallback(() => {
    setMessage('');
    setAnswerStatus('idle');
    setLastAttempt(null);
    setHintHighlights({});

    if (selectedOperators.length === 0) return;

    let op: Operator;
    let n1 = 0, n2 = 0;
    const maxResult = 100;

    // Retry loop to ensure valid, non-trivial problems that are different from the last one
    for (let i = 0; i < 20; i++) {
        op = selectedOperators[Math.floor(Math.random() * selectedOperators.length)];
        switch (op) {
          case '+':
            // Ensure sum is between 2 and 100, and operands are > 0
            const sum = Math.floor(Math.random() * (maxResult - 1)) + 2;
            n1 = Math.floor(Math.random() * (sum - 1)) + 1;
            n2 = sum - n1;
            break;
          case '-':
            // Ensure n1 > n2 and result > 0
            n1 = Math.floor(Math.random() * (maxResult - 1)) + 2;
            n2 = Math.floor(Math.random() * (n1 - 1)) + 1;
            break;
          case '*':
            // Ensure operands are > 1 to be non-trivial
            const factor1 = Math.floor(Math.random() * 9) + 2; // 2-10
            const factor2 = Math.floor(Math.random() * (Math.floor(maxResult / factor1) -1) ) + 2; // at least 2
            n1 = factor1;
            n2 = factor2;
            break;
          case '/': {
            const divisor = Math.floor(Math.random() * 9) + 2; // 2-10
            const quotient = Math.floor(Math.random() * (Math.floor(maxResult / divisor) -1)) + 2; // at least 2
            n1 = divisor * quotient;
            n2 = divisor;
            break;
          }
        }
        // Check if the problem is different from the last one
        if (n1 !== lastProblemRef.current?.num1 || n2 !== lastProblemRef.current?.num2 || op !== lastProblemRef.current?.operator) {
            break;
        }
    }
    
    // op will be defined if selectedOperators is not empty
    lastProblemRef.current = { num1: n1, num2: n2, operator: op! };
    setNum1(n1);
    setNum2(n2);
    setOperator(op!);
  }, [selectedOperators]);

  useEffect(() => {
    if (selectedOperators.length > 0) {
      generateProblem();
    }
  }, [generateProblem, selectedOperators, problemKey]);

  let correctAnswer = 0;
  switch (operator) {
      case '+': correctAnswer = num1 + num2; break;
      case '-': correctAnswer = num1 - num2; break;
      case '*': correctAnswer = num1 * num2; break;
      case '/': correctAnswer = num2 !== 0 ? num1 / num2 : 0; break;
  }

  const handleHintToggle = (isOn: boolean) => {
    setIsHintOn(isOn);
    if (!isOn) {
      setHintHighlights({});
    }
  };

  useEffect(() => {
    const animationTimers: ReturnType<typeof setTimeout>[] = [];

    if (!isHintOn) {
      setHintHighlights({});
      return;
    }

    if (isHintAnimating) return;
    setIsHintAnimating(true);
    setHintHighlights({});

    const path: number[] = [];
    switch(operator) {
      case '+':
        for (let i=1; i<=num2; i++) path.push(num1 + i);
        break;
      case '-':
        for (let i=1; i<=num2; i++) path.push(num1 - i);
        break;
      case '*':
        for (let i=1; i<=num2; i++) path.push(num1 * i);
        break;
      case '/':
        if (num2 > 0) {
            for (let i=1; i<=num1/num2; i++) path.push(num2 * i);
        }
        break;
    }
    
    if (path.length === 0) {
      setIsHintAnimating(false);
      return;
    }

    path.forEach((num, index) => {
      const timer = setTimeout(() => {
        setHintHighlights(prev => ({
          ...prev,
          [num]: {
            status: index === path.length - 1 ? 'final' : 'step',
            label: operator === '/' ? String(index + 1) : ''
          }
        }));
      }, (index + 1) * 400);
      animationTimers.push(timer);
    });

    const animationDuration = path.length * 400;

    // Set the final green highlight after the animation
    const finalHighlightTimer = setTimeout(() => {
      const finalNumberToHighlight = correctAnswer; // BUG FIX: Always highlight the correct answer
      setHintHighlights(prev => ({
        ...prev,
        [finalNumberToHighlight]: {
          status: 'solution',
          label: prev[finalNumberToHighlight]?.label || ''
        }
      }));
    }, animationDuration + 50); // Small delay to happen after the last step
    animationTimers.push(finalHighlightTimer);

    const animationEndTimer = setTimeout(() => {
      setIsHintAnimating(false);
    }, animationDuration);
    animationTimers.push(animationEndTimer);

    return () => {
      animationTimers.forEach(clearTimeout);
      setIsHintAnimating(false);
    };
  }, [isHintOn, num1, num2, operator, correctAnswer]);


  const handleNumberClick = (num: number) => {
    // Block clicks when answer is already correct or hint is animating
    if (answerStatus === 'correct' || isHintAnimating) return;

    setLastAttempt(num);
    const isCorrect = num === correctAnswer;

    if (isTestMode) {
      // TEST MODE: Single attempt logic
      setAnswerStatus(isCorrect ? 'correct' : 'incorrect');
      setMessage(isCorrect ? 'Corretto! 🎉' : 'Errato.');
      if (onProblemAnswered) {
        onProblemAnswered({ num1, num2, operator, userAnswer: num, correctAnswer });
      }
    } else {
      // PRACTICE MODE: Allow retries
      if (isCorrect) {
        setAnswerStatus('correct');
        setMessage('Corretto! 🎉');
        // On correct, move to next problem after a delay
        setTimeout(() => {
            generateProblem();
        }, 1500);
      } else {
        setAnswerStatus('incorrect');
        setMessage('Riprova! 🤔');
        // The relaxed guard at the top allows another attempt immediately.
      }
    }
  };

  const getButtonColorClasses = (num: number): string => {
    const hint = hintHighlights[num];
    if (hint) {
        if (hint.status === 'solution') {
          return 'bg-green-500 border-green-700 text-white pulse-animation';
        }
        return hint.status === 'final' 
            ? 'bg-orange-500 border-orange-700 text-white scale-110' 
            : 'bg-yellow-400 border-yellow-600 text-white scale-110';
    }

    if (answerStatus !== 'idle' && num === lastAttempt) {
      return answerStatus === 'correct'
        ? 'bg-green-500 border-green-700 scale-110 shadow-lg text-white'
        : 'bg-red-500 border-red-700 scale-110 shadow-lg text-white';
    }
    
    const group = Math.floor((num - 1) / 5);
    if (group % 2 === 0) {
      return 'bg-blue-600 border-blue-800 text-white';
    } else {
      return 'bg-red-600 border-red-800 text-white';
    }
  };
  
  const isComponentActive = selectedOperators.length > 0;

  return (
    <div className={`bg-white/90 backdrop-blur-sm p-4 sm:p-8 rounded-2xl shadow-xl border border-white/50 w-full flex flex-col items-center ${!isComponentActive ? 'pointer-events-none opacity-50' : ''}`}>
      <h2 className="text-2xl sm:text-3xl font-bold text-center text-slate-700">Il Quadro del 100</h2>
      
      <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-3 md:gap-8 items-center mt-8">
        
        {/* Main content: Grid of numbers (takes 2/3 of space on lg screens) */}
        <div className="md:col-span-2 w-full mx-auto max-w-xl">
          <div className="grid grid-cols-10 gap-1.5 sm:gap-2">
            {numbers.map(num => {
              const hint = hintHighlights[num];
              return (
                <div
                  key={num}
                  onClick={() => handleNumberClick(num)}
                  className="relative flex flex-col items-center cursor-pointer group aspect-square"
                >
                  <div className={`
                    flex items-center justify-center w-full h-full rounded-full font-bold text-sm sm:text-base transition-all duration-300 border-4
                    hover:scale-105
                    ${getButtonColorClasses(num)}
                  `}>
                    {num}
                  </div>
                  {hint && hint.label && (
                    <div className="absolute top-0 right-0 pointer-events-none">
                      <span className="absolute top-0 right-1 sm:top-0.5 sm:right-1.5 text-slate-900 text-base sm:text-lg font-bold [text-shadow:_-1px_-1px_0_#fff,_1px_-1px_0_#fff,_-1px_1px_0_#fff,_1px_1px_0_#fff]">
                        {hint.label}
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Sidebar: Problem (takes 1/3 of space on lg screens) */}
        <div className="w-full mt-8 pt-8 border-t border-slate-200 md:mt-0 md:pt-0 md:border-t-0">
          {isComponentActive ? (
            <MathProblem
              num1={num1}
              num2={num2}
              operator={operator}
              message={message}
              lastAttempt={lastAttempt}
              answerStatus={answerStatus}
              onHintToggle={handleHintToggle}
              isHintDisabled={isHintAnimating}
              isHintOn={isHintOn}
              isHintFeatureEnabled={isTestMode ? testConfig?.helpAllowed ?? false : true}
            />
          ) : (
            <div className="text-center text-slate-600">Seleziona un operatore per iniziare.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuadroDel100;
