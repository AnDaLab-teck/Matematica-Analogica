import React, { useState, useEffect, useCallback, useRef } from 'react';
import MathProblem from './Calculator';
import { Operator } from './OperatorSelector';
import { TestConfig, TestResult } from '../App';

type AnswerStatus = 'idle' | 'correct' | 'incorrect';

// Types from QuadroDel100 for mobile hint system
type HintStatus = 'step' | 'final' | 'solution';
interface HintHighlight {
  status: HintStatus;
  label: string;
}


interface LineaDel20Props {
  selectedOperators: Operator[];
  isTestMode: boolean;
  testConfig: TestConfig | null;
  onProblemAnswered?: (result: Omit<TestResult, 'isCorrect'>) => void;
  problemKey?: number;
}

interface Arc {
  id: number;
  path: string;
  length: number;
  label: string;
  textX: number;
  textY: number;
}

type LayoutType = 'grid5' | 'grid2x10' | 'line';

const getLayoutType = (): LayoutType => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Desktop: large screens
    if (width >= 1280) {
        return 'line';
    }

    // Tablet Landscape: specific request
    if (width >= 1024 && width > height) {
        return 'grid2x10';
    }
    
    // Mobile and Tablet Portrait: catch-all for smaller screens
    return 'grid5';
};


const VisualAidOverlay: React.FC<{ arcs: Arc[] }> = ({ arcs }) => (
  <svg className="absolute top-0 left-0 w-full h-full overflow-visible pointer-events-none">
    <style>
      {`
        @keyframes draw {
          to {
            stroke-dashoffset: 0;
          }
        }
        .drawing-arc {
          animation: draw 0.5s ease-out forwards;
        }
        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }
      `}
    </style>
    {arcs.map((arc, index) => (
      <g key={arc.id}>
        <path
          d={arc.path}
          fill="none"
          stroke="orange"
          strokeWidth="4"
          strokeDasharray={arc.length}
          strokeDashoffset={arc.length}
          className="drawing-arc"
          style={{ animationDelay: `${index * 0.5}s` }}
          strokeLinecap="round"
        />
        <text
          x={arc.textX}
          y={arc.textY}
          fill="orange"
          fontSize="20"
          fontWeight="bold"
          textAnchor="middle"
          stroke="white"
          strokeWidth="3"
          paintOrder="stroke"
          style={{
            opacity: 0,
            animation: `fadeIn 0.5s ease-out forwards`,
            animationDelay: `${index * 0.5 + 0.25}s`
          }}
        >
          {arc.label}
        </text>
      </g>
    ))}
  </svg>
);


const LineaDel20: React.FC<LineaDel20Props> = ({ selectedOperators, isTestMode, testConfig, onProblemAnswered, problemKey }) => {
  const [lastAttempt, setLastAttempt] = useState<number | null>(null);
  const [answerStatus, setAnswerStatus] = useState<AnswerStatus>('idle');
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [operator, setOperator] = useState<Operator>('+');
  const [message, setMessage] = useState('');
  const [isHintAnimating, setIsHintAnimating] = useState(false);
  const [isHintOn, setIsHintOn] = useState(false);
  const lastProblemRef = useRef<{num1: number, num2: number, operator: Operator} | null>(null);

  // Responsive state
  const [layout, setLayout] = useState<LayoutType>(getLayoutType);

  // Desktop hint state (arcs)
  const [arcs, setArcs] = useState<Arc[]>([]);

  // Mobile hint state (highlights)
  const [hintHighlights, setHintHighlights] = useState<{[key: number]: HintHighlight}>({});
  
  const numberRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => setLayout(getLayoutType());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isGridView = layout !== 'line';

  const numbers = Array.from({ length: 20 }, (_, i) => i + 1);
  
  const generateProblem = useCallback(() => {
    setMessage('');
    setAnswerStatus('idle');
    setLastAttempt(null);
    setArcs([]);
    setHintHighlights({}); // Clear highlights

    if (selectedOperators.length === 0) return;
    
    let op: Operator;
    let n1 = 0, n2 = 0;
    const maxResult = 20;

    // Retry loop to ensure valid, non-trivial problems that are different from the last one
    for (let i = 0; i < 20; i++) {
      op = selectedOperators[Math.floor(Math.random() * selectedOperators.length)];
      switch (op) {
        case '+': {
          const sum = Math.floor(Math.random() * (maxResult - 1)) + 2; // sum from 2 to 20
          n1 = Math.floor(Math.random() * (sum - 1)) + 1; // n1 from 1 to sum-1
          n2 = sum - n1;
          break;
        }
        case '-': {
          n1 = Math.floor(Math.random() * (maxResult -1)) + 2; // n1 from 2 to 20
          n2 = Math.floor(Math.random() * (n1 - 1)) + 1; // n2 from 1 to n1-1
          break;
        }
        case '*': {
          const validPairs = [
            [2,2],[2,3],[2,4],[2,5],[2,6],[2,7],[2,8],[2,9],[2,10],
            [3,2],[3,3],[3,4],[3,5],[3,6],
            [4,2],[4,3],[4,4],[4,5],
            [5,2],[5,3],[5,4],
            [6,2],[6,3],
            [7,2], [8,2], [9,2], [10,2]
          ];
          const pair = validPairs[Math.floor(Math.random() * validPairs.length)];
          n1 = pair[0];
          n2 = pair[1];
          break;
        }
        case '/': {
          const validPairs = [
            [4,2],[6,2],[8,2],[10,2],[12,2],[14,2],[16,2],[18,2],[20,2],
            [6,3],[9,3],[12,3],[15,3],[18,3],
            [8,4],[12,4],[16,4],[20,4],
            [10,5],[15,5],[20,5],
            [12,6],[18,6],
            [14,7], [16,8], [18,9], [20,10]
          ];
           const pair = validPairs[Math.floor(Math.random() * validPairs.length)];
           n1 = pair[0]; // dividend
           n2 = pair[1]; // divisor
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
      setArcs([]);
      setHintHighlights({});
    }
  };

  useEffect(() => {
    const animationTimers: ReturnType<typeof setTimeout>[] = [];

    if (!isHintOn) {
      setArcs([]);
      setHintHighlights({});
      return;
    }

    if (isHintAnimating) return;
    
    // Reset state for new animation
    setArcs([]);
    setHintHighlights({});
    setIsHintAnimating(true);

    if (isGridView) {
      // Mobile/Tablet Hint Logic
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
      
      const validPath = path.filter(p => p > 0 && p <= 20);
      if (validPath.length === 0) {
        setIsHintAnimating(false);
        return;
      }

      validPath.forEach((num, index) => {
        const timer = setTimeout(() => {
          setHintHighlights(prev => ({
            ...prev,
            [num]: {
              status: index === validPath.length - 1 ? 'final' : 'step',
              label: operator === '/' ? String(index + 1) : ''
            }
          }));
        }, (index + 1) * 400);
        animationTimers.push(timer);
      });

      const animationDuration = validPath.length * 400;

      const finalHighlightTimer = setTimeout(() => {
        const finalNumberToHighlight = correctAnswer; // BUG FIX: Always highlight the correct answer
        if (finalNumberToHighlight > 0 && finalNumberToHighlight <= 20) {
            setHintHighlights(prev => ({
                ...prev,
                [finalNumberToHighlight]: {
                status: 'solution',
                label: prev[finalNumberToHighlight]?.label || ''
                }
            }));
        }
      }, animationDuration + 50);
      animationTimers.push(finalHighlightTimer);

      const animationEndTimer = setTimeout(() => {
        setIsHintAnimating(false);
      }, animationDuration);
      animationTimers.push(animationEndTimer);

    } else {
      // Desktop Hint Logic (Arcs)
      const container = containerRef.current;
      if (!container) {
          setIsHintAnimating(false);
          return;
      }

      const newArcs: Arc[] = [];

      const getCenter = (num: number): { x: number; y: number } => {
        const refIndex = num === 0 ? 20 : num - 1;
        const elem = numberRefs.current[refIndex];
        if (!elem) return { x: 0, y: 0 };
        const containerRect = container.getBoundingClientRect();
        const rect = elem.getBoundingClientRect();
        return {
          x: rect.left + rect.width / 2 - containerRect.left + container.scrollLeft,
          y: rect.top - containerRect.top,
        };
      };

      let jumps: { from: number; to: number }[] = [];
      switch (operator) {
        case '+':
          for (let i = 0; i < num2; i++) {
            jumps.push({ from: num1 + i, to: num1 + i + 1 });
          }
          break;
        case '-':
          for (let i = 0; i < num2; i++) {
            jumps.push({ from: num1 - i, to: num1 - i - 1 });
          }
          break;
        case '*':
          for (let i = 0; i < num2; i++) {
            jumps.push({ from: num1 * i, to: num1 * (i + 1) });
          }
          break;
        case '/':
          if (num2 > 0) {
              for (let i = 0; i < num1 / num2; i++) {
                  jumps.push({ from: num2 * i, to: num2 * (i + 1) });
              }
          }
          break;
      }

      jumps = jumps.filter(j => j.from >= 0 && j.to >= 0 && j.from <= 20 && j.to <= 20);
      
      jumps.forEach((jump, index) => {
          const start = getCenter(jump.from);
          const end = getCenter(jump.to);

          const controlY = start.y - Math.min(180, Math.abs(end.x - start.x) * 0.5);
          const pathData = `M${start.x},${start.y} Q${(start.x + end.x) / 2},${controlY} ${end.x},${end.y}`;
          
          const tempPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          tempPath.setAttribute('d', pathData);
          const length = tempPath.getTotalLength();

          const apexX = (start.x + end.x) / 2;
          const apexY = 0.25 * start.y + 0.5 * controlY + 0.25 * end.y;
          
          newArcs.push({ 
            id: index, 
            path: pathData, 
            length,
            label: String(index + 1),
            textX: apexX,
            textY: apexY - 10,
          });
      });
      
      setArcs(newArcs);

      const animationEndTimer = setTimeout(() => {
        setIsHintAnimating(false);
      }, jumps.length * 500);
      animationTimers.push(animationEndTimer);
    }

    return () => {
      animationTimers.forEach(clearTimeout);
      setIsHintAnimating(false);
    };
  }, [isHintOn, num1, num2, operator, correctAnswer, isGridView]);


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
    if (isGridView && hint) {
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

    if (num <= 5) return 'bg-blue-600 border-blue-800 text-white';
    if (num <= 10) return 'bg-red-600 border-red-800 text-white';
    if (num <= 15) return 'bg-sky-500 border-sky-700 text-white';
    return 'bg-rose-500 border-rose-700 text-white';
  };
  
  const isComponentActive = selectedOperators.length > 0;

  const containerClass = layout === 'grid5'
    ? "relative grid grid-cols-5 gap-2 sm:gap-4 p-4 max-w-md mx-auto"
    : layout === 'grid2x10'
    ? "relative grid grid-cols-10 grid-rows-2 gap-2 sm:gap-4 p-4 max-w-2xl mx-auto"
    : "relative flex flex-nowrap items-center justify-start md:justify-center gap-2 pt-48 pb-4 px-2 overflow-x-auto";


  return (
    <div className={`bg-white/90 backdrop-blur-sm p-4 sm:p-8 rounded-2xl shadow-xl border border-white/50 w-full flex flex-col items-center ${!isComponentActive ? 'pointer-events-none opacity-50' : ''}`}>
      <div className="w-full">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-slate-700 mb-8">La Linea del 20</h2>
       
        <div 
          ref={containerRef} 
          className={containerClass}
        >
          {/* Hidden 0 for calculations - only for desktop arcs */}
          {layout === 'line' && <div ref={el => { numberRefs.current[20] = el; }} style={{width: 0, flexShrink: 0}}></div>}
          
          {layout === 'line' && <VisualAidOverlay arcs={arcs} />}

          {numbers.map(num => {
            const hint = hintHighlights[num];
            return (
              <div
                key={num}
                ref={el => { numberRefs.current[num-1] = el; }}
                onClick={() => handleNumberClick(num)}
                className="relative flex flex-col items-center cursor-pointer group"
              >
                <div className={`
                  flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 rounded-full font-bold text-lg sm:text-xl transition-all duration-300 border-4
                  hover:scale-105
                  ${getButtonColorClasses(num)}
                `}>
                  {num}
                </div>
                {isGridView && hint && hint.label && (
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
      {isComponentActive ? (
        <div className="w-full mt-8 pt-8 border-t border-slate-200">
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
        </div>
      ) : (
        <div className="text-center text-slate-600 mt-8">Seleziona un operatore per iniziare.</div>
      )}
    </div>
  );
};

export default LineaDel20;
