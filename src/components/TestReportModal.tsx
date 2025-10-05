import React from 'react';
import { TestResult } from '../App';
import { Operator } from './OperatorSelector';
import { jsPDF } from "jspdf";

interface TestReportModalProps {
  results: TestResult[];
  onClose: () => void;
}

const operatorSymbols: { [key in Operator]: string } = {
  '+': '+',
  '-': '-',
  '*': '×',
  '/': '÷',
};

const TestReportModal: React.FC<TestReportModalProps> = ({ results, onClose }) => {
  const correctAnswers = results.filter(r => r.isCorrect).length;
  const totalQuestions = results.length;
  const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.text("Report del Test di Matematica", 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`Data: ${new Date().toLocaleDateString('it-IT')}`, 20, 35);
    doc.text(`Punteggio Finale: ${correctAnswers} / ${totalQuestions} (${percentage}%)`, 20, 42);

    doc.setFontSize(12);
    doc.text("Riepilogo Risposte:", 20, 60);

    let yPos = 70;
    results.forEach((result, index) => {
        if (yPos > 280) { // New page
            doc.addPage();
            yPos = 20;
        }
        const problemString = `${index + 1}.  ${result.num1} ${operatorSymbols[result.operator]} ${result.num2} = ${result.correctAnswer}`;
        const answerString = `   (Tua risposta: ${result.userAnswer})`;
        
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(result.isCorrect ? '#22c55e' : '#ef4444'); // green or red
        doc.text(result.isCorrect ? "Corretto" : "Errato", 170, yPos);
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor('#000000');
        doc.text(problemString, 20, yPos);
        doc.text(answerString, 80, yPos);

        yPos += 10;
    });

    doc.save(`Report_Test_Matematica_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full flex flex-col gap-6 animate-fade-in-up">
        <h2 className="text-3xl font-bold text-slate-800 text-center">Risultati del Test</h2>
        
        <div className="text-center bg-slate-50 p-4 rounded-lg">
            <p className="text-lg text-slate-600">Punteggio Finale</p>
            <p className="text-5xl font-extrabold text-slate-800 my-2">{percentage}%</p>
            <p className="text-lg text-slate-600">({correctAnswers} su {totalQuestions} risposte corrette)</p>
        </div>

        <div className="max-h-60 overflow-y-auto pr-4 -mr-4 border-t border-b border-slate-200 py-4">
            <ul className="space-y-3">
                {results.map((result, index) => (
                    <li key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="font-mono text-slate-700 text-lg">
                           {result.num1} {operatorSymbols[result.operator]} {result.num2} = {result.userAnswer}
                        </span>
                        {result.isCorrect ? (
                             <span className="font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full">Corretto</span>
                        ) : (
                            <span className="font-semibold text-red-600 bg-red-100 px-3 py-1 rounded-full">
                                Errato (era {result.correctAnswer})
                            </span>
                        )}
                    </li>
                ))}
            </ul>
        </div>


        <div className="flex justify-center items-center gap-4 mt-4">
          <button
            onClick={onClose}
            className="px-8 py-3 rounded-full text-base font-semibold transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            Chiudi
          </button>
          <button
            onClick={handleDownloadPdf}
            className="px-8 py-3 rounded-full text-base font-semibold transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 bg-blue-600 text-white hover:bg-blue-700 shadow-md"
          >
            Scarica PDF
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

export default TestReportModal;