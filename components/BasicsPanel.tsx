"use client";

import React, { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import "katex/dist/katex.min.css";
import { InlineMath } from "react-katex";
import { motion, AnimatePresence } from "motion/react";

interface BasicsPanelProps {
  base: number;
  setBase: (b: number) => void;
  height: number;
  setHeight: (h: number) => void;
  selectedAngle: "A" | "B" | null;
  setSelectedAngle: (angle: "A" | "B" | null) => void;
  learningStep: number;
  setLearningStep: React.Dispatch<React.SetStateAction<number>>;
}

export function BasicsPanel({
  base,
  setBase,
  height,
  setHeight,
  selectedAngle,
  setSelectedAngle,
  learningStep,
  setLearningStep,
}: BasicsPanelProps) {
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  const targetState = useRef({ base, height });
  useEffect(() => {
    targetState.current = { base, height };
  }, [base, height]);

  const animState = useRef({ base, height });
  const [currentBase, setCurrentBase] = useState(base);
  const [currentHeight, setCurrentHeight] = useState(height);

  useEffect(() => {
    let frameId: number;
    const loop = () => {
      let changed = false;
      const ease = 0.12;
      
      const dBase = targetState.current.base - animState.current.base;
      if (Math.abs(dBase) > 0.001) {
        animState.current.base += dBase * ease;
        changed = true;
      } else if (animState.current.base !== targetState.current.base) {
        animState.current.base = targetState.current.base;
        changed = true;
      }

      const dHeight = targetState.current.height - animState.current.height;
      if (Math.abs(dHeight) > 0.001) {
        animState.current.height += dHeight * ease;
        changed = true;
      } else if (animState.current.height !== targetState.current.height) {
        animState.current.height = targetState.current.height;
        changed = true;
      }

      if (changed) {
        setCurrentBase(animState.current.base);
        setCurrentHeight(animState.current.height);
      }
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    if (learningStep >= 2 && !selectedAngle) {
      setSelectedAngle("A");
    }
  }, [learningStep, selectedAngle, setSelectedAngle]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAutoPlaying) {
      timer = setInterval(() => {
        setLearningStep((prev: number) => {
          if (prev >= 5) {
            setIsAutoPlaying(false);
            return 5;
          }
          return prev + 1;
        });
      }, 4000);
    }
    return () => clearInterval(timer);
  }, [isAutoPlaying, setLearningStep]);

  const standardAngles = [30, 45, 60];

  const targetAngleARad = Math.atan2(height, base);
  const targetAngleA = targetAngleARad * (180 / Math.PI);
  const roundedAngleA = Math.round(targetAngleA);

  const angleARad = Math.atan2(currentHeight, currentBase);
  const angleA = angleARad * (180 / Math.PI);
  const currentAngleValue = selectedAngle === "A" ? angleA : 90 - angleA;

  const handleStandardAngle = (angle: number) => {
    if (angle === 30) {
      setBase(5 * Math.sqrt(3));
      setHeight(5);
    } else if (angle === 45) {
      setBase(5);
      setHeight(5);
    } else if (angle === 60) {
      setBase(5);
      setHeight(5 * Math.sqrt(3));
    }
    if (learningStep < 4) setLearningStep(4);
  };

  // Helper to get exact values for standard angles
  const getExactValue = (func: "sin" | "cos" | "tan", angle: number) => {
    const rounded = Math.round(angle);
    if (Math.abs(angle - rounded) > 0.1) return null; // Not a standard angle

    if (rounded === 30) {
      if (func === "sin") return "\\frac{1}{2}";
      if (func === "cos") return "\\frac{\\sqrt{3}}{2}";
      if (func === "tan") return "\\frac{1}{\\sqrt{3}}";
    }
    if (rounded === 45) {
      if (func === "sin") return "\\frac{1}{\\sqrt{2}}";
      if (func === "cos") return "\\frac{1}{\\sqrt{2}}";
      if (func === "tan") return "1";
    }
    if (rounded === 60) {
      if (func === "sin") return "\\frac{\\sqrt{3}}{2}";
      if (func === "cos") return "\\frac{1}{2}";
      if (func === "tan") return "\\sqrt{3}";
    }
    return null;
  };

  const exactSin = getExactValue("sin", currentAngleValue);
  const exactCos = getExactValue("cos", currentAngleValue);
  const exactTan = getExactValue("tan", currentAngleValue);

  const decimalSin = Math.sin(currentAngleValue * Math.PI / 180);
  const decimalCos = Math.cos(currentAngleValue * Math.PI / 180);
  const decimalTan = Math.tan(currentAngleValue * Math.PI / 180);

  const hypValue = Math.sqrt(currentBase * currentBase + currentHeight * currentHeight).toFixed(2);
  const oppValue = selectedAngle === "A" ? currentHeight.toFixed(1) : currentBase.toFixed(1);
  const adjValue = selectedAngle === "A" ? currentBase.toFixed(1) : currentHeight.toFixed(1);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Guided Teaching Panel */}
      <div className="bg-slate-800/80 border border-blue-500/30 rounded-xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-slate-700">
          <motion.div 
            className="h-full bg-blue-500" 
            initial={{ width: "0%" }}
            animate={{ width: `${(learningStep / 5) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        
        <div className="flex items-center justify-between mb-4 mt-1">
          <h3 className="text-blue-400 font-bold flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Guided Teaching
          </h3>
          <span className="text-xs font-medium bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
            Step {learningStep} of 5
          </span>
        </div>

        <div className="min-h-[140px] flex flex-col items-center justify-center text-center relative">
          <AnimatePresence mode="wait">
            {learningStep === 1 && (
              <motion.div key="step1" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-lg text-white font-medium">This is a right triangle.</p>
                <p className="text-sm text-slate-400 mt-2">It has one 90° angle, which makes trigonometry possible!</p>
              </motion.div>
            )}
            {learningStep === 2 && (
              <motion.div key="step2" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-lg text-white font-medium">Identify the sides.</p>
                <p className="text-sm text-slate-400 mt-2">Relative to angle <span className="text-yellow-400 font-bold">{selectedAngle || 'A'}</span>, we have the <span className="text-yellow-400 font-bold">Opposite</span>, <span className="text-blue-400 font-bold">Adjacent</span>, and <span className="text-white font-bold">Hypotenuse</span>.</p>
              </motion.div>
            )}
            {learningStep === 3 && (
              <motion.div key="step3" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-lg text-white font-medium">The Sine Formula</p>
                <div className="text-2xl text-yellow-400 mt-3 bg-black/30 px-4 py-2 rounded-lg">
                  <InlineMath math={`\\sin(${selectedAngle || 'A'}) = \\frac{\\text{Opp}}{\\text{Hyp}}`} />
                </div>
              </motion.div>
            )}
            {learningStep === 4 && (
              <motion.div key="step4" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-lg text-white font-medium">Substitute the values</p>
                <div className="text-2xl text-yellow-400 mt-3 bg-black/30 px-4 py-2 rounded-lg">
                  <InlineMath math={`\\sin(${currentAngleValue.toFixed(1)}^\\circ) = \\frac{${oppValue}}{${hypValue}}`} />
                </div>
              </motion.div>
            )}
            {learningStep === 5 && (
              <motion.div key="step5" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-lg text-white font-medium">Final Answer</p>
                <div className="text-3xl text-yellow-400 mt-3 font-bold bg-black/30 px-4 py-2 rounded-lg drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]">
                  <InlineMath math={`\\sin(${currentAngleValue.toFixed(1)}^\\circ) = ${decimalSin.toFixed(3)}`} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-700/50">
          <button 
            onClick={() => setLearningStep(Math.max(1, learningStep - 1))} 
            disabled={learningStep === 1} 
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <button 
            onClick={() => setIsAutoPlaying(!isAutoPlaying)} 
            className={cn(
              "px-6 py-2 text-white text-sm font-bold rounded-lg transition-all shadow-lg",
              isAutoPlaying 
                ? "bg-red-500 hover:bg-red-600 shadow-red-500/20" 
                : "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20"
            )}
          >
            {isAutoPlaying ? "Stop Auto-play" : "Auto-play"}
          </button>
          <button 
            onClick={() => setLearningStep(Math.min(5, learningStep + 1))} 
            disabled={learningStep === 5} 
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>

      {/* Standard Angles */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Standard Angles</h3>
          <span className="text-xs text-slate-500 italic">Important exam values</span>
        </div>
        <div className="flex gap-2">
          {standardAngles.map((angle) => (
            <button
              key={angle}
              onClick={() => handleStandardAngle(angle)}
              className={cn(
                "flex-1 py-2 rounded-lg font-medium transition-colors border",
                roundedAngleA === angle
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
              )}
            >
              {angle}°
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Ratios Panel */}
      <div className="bg-blue-900/40 border border-blue-800/50 p-5 rounded-xl space-y-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
        <h3 className="text-sm font-semibold text-blue-300 uppercase tracking-wider mb-4">
          Trigonometric Ratios
        </h3>
        
        <div className="grid grid-cols-1 gap-4">
          {/* Sine */}
          <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded-lg">
            <div className="text-lg">
              <InlineMath math={`\\sin ${selectedAngle || 'A'} = \\frac{\\text{Opp}}{\\text{Hyp}}`} />
            </div>
            <div className="text-lg font-bold text-yellow-400 flex items-center gap-2">
              {exactSin ? (
                <InlineMath math={`= ${exactSin}`} />
              ) : (
                <div className="flex items-center gap-1">
                  <span>=</span>
                  <span>{decimalSin.toFixed(3)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Cosine */}
          <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded-lg">
            <div className="text-lg">
              <InlineMath math={`\\cos ${selectedAngle || 'A'} = \\frac{\\text{Adj}}{\\text{Hyp}}`} />
            </div>
            <div className="text-lg font-bold text-blue-400 flex items-center gap-2">
              {exactCos ? (
                <InlineMath math={`= ${exactCos}`} />
              ) : (
                <div className="flex items-center gap-1">
                  <span>=</span>
                  <span>{decimalCos.toFixed(3)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tangent */}
          <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded-lg">
            <div className="text-lg">
              <InlineMath math={`\\tan ${selectedAngle || 'A'} = \\frac{\\text{Opp}}{\\text{Adj}}`} />
            </div>
            <div className="text-lg font-bold text-emerald-400 flex items-center gap-2">
              {exactTan ? (
                <InlineMath math={`= ${exactTan}`} />
              ) : (
                <div className="flex items-center gap-1">
                  <span>=</span>
                  <span>{decimalTan.toFixed(3)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Common Values Table */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
        <table className="w-full text-sm text-center">
          <thead className="bg-slate-800 text-slate-300">
            <tr>
              <th className="py-3 px-2 font-semibold">Angle</th>
              <th className="py-3 px-2 font-semibold">sin</th>
              <th className="py-3 px-2 font-semibold">cos</th>
              <th className="py-3 px-2 font-semibold">tan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {standardAngles.map((angle) => (
              <tr 
                key={angle}
                className={cn(
                  "transition-colors",
                  roundedAngleA === angle ? "bg-blue-900/30" : "hover:bg-slate-700/30"
                )}
              >
                <td className="py-3 px-2 font-medium">{angle}°</td>
                <td className="py-3 px-2"><InlineMath math={getExactValue("sin", angle) || ""} /></td>
                <td className="py-3 px-2"><InlineMath math={getExactValue("cos", angle) || ""} /></td>
                <td className="py-3 px-2"><InlineMath math={getExactValue("tan", angle) || ""} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Identities Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Reciprocal Identities */}
        <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl group relative">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Reciprocal
          </h3>
          <div className="space-y-2 text-sm">
            <div><InlineMath math={`\\csc A = \\frac{1}{\\sin A}`} /></div>
            <div><InlineMath math={`\\sec A = \\frac{1}{\\cos A}`} /></div>
            <div><InlineMath math={`\\cot A = \\frac{1}{\\tan A}`} /></div>
          </div>
          
          {/* Tooltip */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            Reciprocal means inverse
          </div>
        </div>

        {/* Quotient Identities */}
        <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Quotient
          </h3>
          <div className="space-y-4 text-sm">
            <div className="relative">
              <InlineMath math={`\\tan A = \\frac{\\sin A}{\\cos A}`} />
              <motion.div 
                className="absolute -left-2 top-1/2 w-1 h-full bg-emerald-500/50 rounded-full -translate-y-1/2"
                animate={{ height: ["0%", "100%", "0%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
            <div className="relative">
              <InlineMath math={`\\cot A = \\frac{\\cos A}{\\sin A}`} />
              <motion.div 
                className="absolute -left-2 top-1/2 w-1 h-full bg-purple-500/50 rounded-full -translate-y-1/2"
                animate={{ height: ["0%", "100%", "0%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
