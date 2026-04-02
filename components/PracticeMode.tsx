'use client';

import React, { useState, useEffect } from 'react';

type ProblemType = 'SINE' | 'COSINE';

interface Problem {
  type: ProblemType;
  question: string;
  answer: number;
  solution: string;
}

const generateProblem = (): Problem => {
  const type: ProblemType = Math.random() > 0.5 ? 'SINE' : 'COSINE';
  
  if (type === 'COSINE') {
    // Given a, b, angleC -> find c
    const a = Math.floor(Math.random() * 10) + 5;
    const b = Math.floor(Math.random() * 10) + 5;
    const angleC = Math.floor(Math.random() * 60) + 30; // 30 to 90 degrees
    
    const cosC = Math.cos((angleC * Math.PI) / 180);
    const cSquared = a**2 + b**2 - 2*a*b*cosC;
    const c = Math.sqrt(cSquared);
    
    return {
      type,
      question: `In triangle ABC, side a = ${a}, side b = ${b}, and angle C = ${angleC}°. Find the length of side c (rounded to 1 decimal place).`,
      answer: Number(c.toFixed(1)),
      solution: `Using Cosine Rule: c² = a² + b² - 2ab cos(C)\nc² = ${a}² + ${b}² - 2(${a})(${b}) cos(${angleC}°)\nc² = ${a**2} + ${b**2} - ${2*a*b} × ${cosC.toFixed(3)}\nc² = ${(a**2 + b**2).toFixed(1)} - ${(2*a*b*cosC).toFixed(1)}\nc = ${c.toFixed(1)}`,
    };
  } else {
    // Given a, angleA, angleB -> find b
    const a = Math.floor(Math.random() * 10) + 5;
    const angleA = Math.floor(Math.random() * 40) + 30; // 30 to 70
    const angleB = Math.floor(Math.random() * 40) + 30; // 30 to 70
    
    const sinA = Math.sin((angleA * Math.PI) / 180);
    const sinB = Math.sin((angleB * Math.PI) / 180);
    
    const b = (a * sinB) / sinA;
    
    return {
      type,
      question: `In triangle ABC, side a = ${a}, angle A = ${angleA}°, and angle B = ${angleB}°. Find the length of side b (rounded to 1 decimal place).`,
      answer: Number(b.toFixed(1)),
      solution: `Using Sine Rule: a/sin(A) = b/sin(B)\n${a}/sin(${angleA}°) = b/sin(${angleB}°)\n${a}/${sinA.toFixed(3)} = b/${sinB.toFixed(3)}\nb = (${a} × ${sinB.toFixed(3)}) / ${sinA.toFixed(3)}\nb = ${b.toFixed(1)}`,
    };
  }
};

export default function PracticeMode() {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<'CORRECT' | 'INCORRECT' | null>(null);
  const [showSolution, setShowSolution] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProblem(generateProblem());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem) return;
    
    const userAnswer = parseFloat(input);
    if (isNaN(userAnswer)) return;
    
    // Allow small margin of error due to rounding
    if (Math.abs(userAnswer - problem.answer) <= 0.2) {
      setFeedback('CORRECT');
    } else {
      setFeedback('INCORRECT');
    }
  };

  const handleNext = () => {
    setProblem(generateProblem());
    setInput('');
    setFeedback(null);
    setShowSolution(false);
  };

  if (!problem) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="h-full w-full flex items-center justify-center p-2 md:p-4 overflow-y-auto">
      <div className="bg-[#0b2c5f] border border-white/20 p-4 md:p-6 rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg md:text-xl font-bold text-[#f4c430]">Practice Mode</h2>
          <span className="bg-white/10 px-2 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider">
            {problem.type} RULE
          </span>
        </div>
        
        <p className="text-sm md:text-base text-white/90 mb-4 leading-relaxed">
          {problem.question}
        </p>
        
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="flex gap-2">
            <input
              type="number"
              step="0.1"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setFeedback(null);
              }}
              placeholder="Your answer..."
              className={`flex-1 bg-white/5 border-2 rounded-xl px-3 py-2 text-sm md:text-base text-white outline-none transition-colors ${
                feedback === 'CORRECT' ? 'border-green-500 bg-green-500/10' :
                feedback === 'INCORRECT' ? 'border-red-500 bg-red-500/10' :
                'border-white/20 focus:border-[#f4c430]'
              }`}
            />
            <button
              type="submit"
              className="bg-[#f4c430] text-[#0b2c5f] px-4 py-2 rounded-xl text-sm md:text-base font-bold hover:bg-yellow-300 transition-colors shadow-lg"
            >
              Submit
            </button>
          </div>
        </form>
        
        {feedback && (
          <div className={`p-3 rounded-xl mb-4 font-bold text-center text-sm ${
            feedback === 'CORRECT' ? 'bg-green-500/20 text-green-400 border border-green-500/50' :
            'bg-red-500/20 text-red-400 border border-red-500/50'
          }`}>
            {feedback === 'CORRECT' ? 'Correct! Well done.' : 'Incorrect. Try again or check the solution.'}
          </div>
        )}
        
        <div className="flex justify-between items-center border-t border-white/10 pt-4">
          <button
            onClick={() => setShowSolution(!showSolution)}
            className="text-white/60 hover:text-white transition-colors text-xs sm:text-sm font-medium"
          >
            {showSolution ? 'Hide Solution' : 'Show Solution'}
          </button>
          <button
            onClick={handleNext}
            className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 md:px-4 md:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors"
          >
            Next Question
          </button>
        </div>
        
        {showSolution && (
          <div className="mt-4 bg-black/30 p-3 rounded-xl border border-white/5">
            <h4 className="text-[#f4c430] font-bold mb-1 text-[10px] sm:text-xs uppercase tracking-wider">Step-by-step Solution</h4>
            <pre className="font-mono text-xs sm:text-sm text-white/80 whitespace-pre-wrap leading-relaxed">
              {problem.solution}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
