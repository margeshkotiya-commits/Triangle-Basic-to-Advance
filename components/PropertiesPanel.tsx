"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

interface PropertiesPanelProps {
  propStep: number;
  setPropStep: React.Dispatch<React.SetStateAction<number>>;
  triggerSpecialTriangle: (type: "equilateral" | "isosceles" | "scalene") => void;
}

export function PropertiesPanel({ propStep, setPropStep, triggerSpecialTriangle }: PropertiesPanelProps) {
  const [isAutoPlaying, setIsAutoPlaying] = React.useState(false);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAutoPlaying) {
      timer = setInterval(() => {
        setPropStep((prev) => {
          if (prev >= 6) {
            setIsAutoPlaying(false);
            return 6;
          }
          return prev + 1;
        });
      }, 5000);
    }
    return () => clearInterval(timer);
  }, [isAutoPlaying, setPropStep]);

  const steps = [
    {
      title: "Angle Sum Property",
      explanation: "The sum of all interior angles in any triangle is always exactly 180 degrees.",
      formula: "∠A + ∠B + ∠C = 180°",
      highlight: "Try dragging the vertices to see the angles change while the sum remains constant.",
    },
    {
      title: "Exterior Angle Property",
      explanation: "The measure of an exterior angle of a triangle is equal to the sum of the measures of its two remote interior angles.",
      formula: "Exterior ∠C = ∠A + ∠B",
      highlight: "The yellow exterior angle equals the sum of the blue interior angles.",
    },
    {
      title: "Triangle Inequality Theorem",
      explanation: "The sum of the lengths of any two sides of a triangle must be greater than the length of the third side.",
      formula: "a + b > c, a + c > b, b + c > a",
      highlight: "If this rule is broken, the sides won't connect to form a triangle.",
    },
    {
      title: "Triangle Classification",
      explanation: "Triangles can be classified by their largest angle.",
      formula: "Acute (<90°), Right (=90°), Obtuse (>90°)",
      highlight: "Watch the badge update automatically as you drag the vertices.",
    },
    {
      title: "Side-Angle Relationship",
      explanation: "In any triangle, the longest side is always opposite the largest angle, and the shortest side is opposite the smallest angle.",
      formula: "Largest Angle ↔ Longest Side",
      highlight: "The largest angle and its opposite side are highlighted in yellow.",
    },
    {
      title: "Special Triangles",
      explanation: "Some triangles have special properties based on equal sides or angles.",
      formula: "Equilateral, Isosceles, Scalene",
      highlight: "Click the buttons below to instantly morph the triangle into these special shapes.",
    },
  ];

  const currentStep = steps[propStep - 1];

  return (
    <div className="w-full lg:w-96 bg-[#0a1930] flex flex-col border-l border-white/10 shadow-2xl z-10">
      <div className="p-6 bg-[#0b2c5f] border-b border-white/10 shrink-0">
        <h2 className="text-2xl font-bold text-white mb-2">Triangle Properties</h2>
        <p className="text-white/70 text-sm">
          Explore the fundamental rules that govern all triangles.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={propStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col space-y-6"
          >
            <div className="bg-blue-900/50 rounded-xl p-5 border border-blue-400/20">
              <h3 className="text-xl font-bold text-[#f4c430] mb-3">
                {propStep}. {currentStep.title}
              </h3>
              <p className="text-white/90 leading-relaxed mb-4">
                {currentStep.explanation}
              </p>
              <div className="bg-black/30 rounded-lg p-3 text-center border border-white/5">
                <code className="text-lg font-mono text-blue-300 font-bold">
                  {currentStep.formula}
                </code>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-yellow-400 text-sm font-bold">i</span>
                </div>
                <p className="text-sm text-white/80 leading-relaxed">
                  {currentStep.highlight}
                </p>
              </div>
            </div>

            {propStep === 6 && (
              <div className="flex flex-col space-y-3 mt-4">
                <button
                  onClick={() => triggerSpecialTriangle("equilateral")}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-colors shadow-lg"
                >
                  Make Equilateral
                </button>
                <button
                  onClick={() => triggerSpecialTriangle("isosceles")}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-colors shadow-lg"
                >
                  Make Isosceles
                </button>
                <button
                  onClick={() => triggerSpecialTriangle("scalene")}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-colors shadow-lg"
                >
                  Make Scalene
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="p-6 bg-black/20 border-t border-white/10 shrink-0">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPropStep((p) => Math.max(1, p - 1))}
            disabled={propStep === 1}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="flex flex-col items-center">
            <span className="text-sm font-bold text-white/50 mb-2">
              Step {propStep} of 6
            </span>
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 transition-colors border border-blue-500/30"
            >
              {isAutoPlaying ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span className="text-sm font-bold">Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span className="text-sm font-bold">Auto-play</span>
                </>
              )}
            </button>
          </div>

          <button
            onClick={() => setPropStep((p) => Math.min(6, p + 1))}
            disabled={propStep === 6}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
