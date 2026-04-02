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
    const a = Math.floor(Math.random() * 10) + 5;
    const b = Math.floor(Math.random() * 10) + 5;
    const angleC = Math.floor(Math.random() * 60) + 30;
    const cosC = Math.cos((angleC * Math.PI) / 180);
    const c = Math.sqrt(a**2 + b**2 - 2*a*b*cosC);
    return {
      type,
      question: `In triangle ABC, side a = ${a}, side b = ${b}, and angle C = ${angleC}°. Find the length of side c (rounded to 1 decimal place).`,
      answer: Number(c.toFixed(1)),
      solution: `Using Cosine Rule: c² = a² + b² - 2ab cos(C)\nc² = ${a}² + ${b}² - 2(${a})(${b}) cos(${angleC}°)\nc² = ${a**2} + ${b**2} - ${2*a*b} × ${cosC.toFixed(3)}\nc² = ${(a**2 + b**2).toFixed(1)} - ${(2*a*b*cosC).toFixed(1)}\nc = ${c.toFixed(1)}`,
    };
  } else {
    const a = Math.floor(Math.random() * 10) + 5;
    const angleA = Math.floor(Math.random() * 40) + 30;
    const angleB = Math.floor(Math.random() * 40) + 30;
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

export default function ExamMode() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const newProblems = Array.from({ length: 5 }, generateProblem);
    setProblems(newProblems);
    setAnswers(new Array(5).fill(''));
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !isFinished) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isFinished) {
      setIsFinished(true);
    }
  }, [timeLeft, isFinished]);

  const handleFinish = () => {
    setIsFinished(true);
  };

  const calculateScore = () => {
    let score = 0;
    problems.forEach((p, i) => {
      const ans = parseFloat(answers[i]);
      if (!isNaN(ans) && Math.abs(ans - p.answer) <= 0.2) {
        score++;
      }
    });
    return score;
  };

  if (problems.length === 0) return <div className="p-8 text-center">Loading...</div>;

  if (isFinished) {
    const score = calculateScore();
    return (
      <div className="h-full w-full flex items-center justify-center p-2 md:p-4 overflow-y-auto">
        <div className="bg-[#0b2c5f] border border-white/20 p-4 md:p-6 rounded-2xl shadow-2xl w-full max-w-2xl">
          <h2 className="text-xl md:text-2xl font-bold text-center text-[#f4c430] mb-2">Exam Results</h2>
          <p className="text-center text-sm md:text-base text-white/80 mb-4">
            You scored <span className="font-bold text-white">{score}</span> out of {problems.length}
          </p>

          <div className="space-y-3">
            {problems.map((p, i) => {
              const ans = parseFloat(answers[i]);
              const isCorrect = !isNaN(ans) && Math.abs(ans - p.answer) <= 0.2;
              return (
                <div key={i} className={`p-3 rounded-xl border ${isCorrect ? 'border-green-500/50 bg-green-500/10' : 'border-red-500/50 bg-red-500/10'}`}>
                  <p className="font-medium text-xs sm:text-sm mb-1">Q{i + 1}: {p.question}</p>
                  <div className="flex justify-between text-[10px] sm:text-xs mb-2">
                    <span className="text-white/70">Your answer: <span className={isCorrect ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>{answers[i] || 'None'}</span></span>
                    <span className="text-white/70">Correct answer: <span className="text-white font-bold">{p.answer}</span></span>
                  </div>
                  {!isCorrect && (
                    <div className="text-[10px] font-mono text-white/60 bg-black/30 p-2 rounded-lg whitespace-pre-wrap">
                      {p.solution}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 text-center">
            <button
              onClick={() => window.location.reload()}
              className="bg-[#f4c430] text-[#0b2c5f] px-6 py-2 rounded-xl text-sm md:text-base font-bold hover:bg-yellow-300 transition-colors shadow-lg"
            >
              Restart Exam
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-2 md:p-4 overflow-y-auto">
      <div className="w-full max-w-2xl flex justify-between items-center mb-4">
        <h2 className="text-lg md:text-xl font-bold text-[#f4c430]">Exam Mode</h2>
        <div className={`text-sm md:text-base font-mono font-bold px-3 py-1 rounded-lg border ${timeLeft < 60 ? 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse' : 'bg-white/10 text-white border-white/20'}`}>
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="bg-[#0b2c5f] border border-white/20 p-4 md:p-6 rounded-2xl shadow-2xl w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <span className="text-white/60 font-bold uppercase tracking-wider text-[10px] sm:text-xs">
            Question {currentQuestion + 1} of {problems.length}
          </span>
          <span className="bg-white/10 px-2 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider">
            {problems[currentQuestion].type} RULE
          </span>
        </div>
        
        <p className="text-sm md:text-base text-white/90 mb-4 leading-relaxed">
          {problems[currentQuestion].question}
        </p>
        
        <div className="mb-4">
          <input
            type="number"
            step="0.1"
            value={answers[currentQuestion]}
            onChange={(e) => {
              const newAnswers = [...answers];
              newAnswers[currentQuestion] = e.target.value;
              setAnswers(newAnswers);
            }}
            placeholder="Your answer..."
            className="w-full bg-white/5 border-2 border-white/20 focus:border-[#f4c430] rounded-xl px-3 py-2 text-sm md:text-base text-white outline-none transition-colors"
          />
        </div>
        
        <div className="flex justify-between items-center border-t border-white/10 pt-4">
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="text-white/60 hover:text-white disabled:opacity-30 disabled:hover:text-white/60 transition-colors px-3 py-1 text-xs sm:text-sm font-medium"
          >
            Previous
          </button>
          
          {currentQuestion === problems.length - 1 ? (
            <button
              onClick={handleFinish}
              className="bg-green-500 text-white px-4 py-2 md:px-6 md:py-3 rounded-xl text-xs sm:text-sm font-bold hover:bg-green-400 transition-colors shadow-lg"
            >
              Submit Exam
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestion(Math.min(problems.length - 1, currentQuestion + 1))}
              className="bg-[#f4c430] text-[#0b2c5f] px-4 py-2 md:px-6 md:py-3 rounded-xl text-xs sm:text-sm font-bold hover:bg-yellow-300 transition-colors shadow-lg"
            >
              Next
            </button>
          )}
        </div>
      </div>
      
      {/* Question Navigator */}
      <div className="flex gap-2 mt-4">
        {problems.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentQuestion(i)}
            className={`w-8 h-8 md:w-10 md:h-10 rounded-lg text-xs md:text-sm font-bold transition-colors ${
              currentQuestion === i ? 'bg-[#f4c430] text-[#0b2c5f]' :
              answers[i] ? 'bg-white/20 text-white hover:bg-white/30' :
              'bg-white/5 text-white/50 hover:bg-white/10'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
