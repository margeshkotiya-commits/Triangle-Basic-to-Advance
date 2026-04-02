import React, { useEffect } from "react";
import { TheoremType } from "./TheoremsCanvas";

interface TheoremsPanelProps {
  selectedTheorem: TheoremType;
  setSelectedTheorem: (t: TheoremType) => void;
  theoremStep: number;
  setTheoremStep: (s: number) => void;
}

const THEOREMS_DATA: Record<TheoremType, { title: string; statement: string; steps: string[] }> = {
  sss: {
    title: "SSS Congruence",
    statement: "If three sides of one triangle are equal to three sides of another triangle, then the triangles are congruent.",
    steps: [
      "Consider two triangles.",
      "If all three corresponding sides are equal in length...",
      "The triangles are exactly the same size and shape (congruent)."
    ]
  },
  sas: {
    title: "SAS Congruence",
    statement: "If two sides and the included angle of one triangle are equal to two sides and the included angle of another triangle, then the triangles are congruent.",
    steps: [
      "Consider two triangles.",
      "If two sides and the angle between them are equal...",
      "The triangles are congruent."
    ]
  },
  aaa: {
    title: "AAA Similarity",
    statement: "If all three angles of one triangle are equal to all three angles of another triangle, then the triangles are similar.",
    steps: [
      "Consider two triangles of different sizes.",
      "If their corresponding angles are equal...",
      "The triangles are similar (same shape, different size)."
    ]
  },
  pythagoras: {
    title: "Pythagoras Theorem",
    statement: "In a right-angled triangle, the square of the hypotenuse is equal to the sum of the squares of the other two sides.",
    steps: [
      "This is a right-angled triangle.",
      "The longest side is called the hypotenuse.",
      "Construct a square on side a (area = a²).",
      "Construct a square on side b (area = b²).",
      "Construct a square on hypotenuse (area = c²).",
      "The areas of the two smaller squares perfectly fill the largest square.",
      "Therefore: a² + b² = c²"
    ]
  },
  midpoint: {
    title: "Midpoint Theorem",
    statement: "The line segment connecting the midpoints of two sides of a triangle is parallel to the third side and is half as long.",
    steps: [
      "Consider a triangle.",
      "Find the midpoints of two sides.",
      "The line joining them is parallel to the base and exactly half its length."
    ]
  },
  angleBisector: {
    title: "Angle Bisector Theorem",
    statement: "An angle bisector of a triangle divides the opposite side into two segments that are proportional to the other two sides of the triangle.",
    steps: [
      "Consider a triangle ABC.",
      "We focus on angle A.",
      "Draw a line that bisects angle A.",
      "The angle is divided into two equal parts.",
      "The opposite side is divided into two segments.",
      "The ratio of these segments equals the ratio of the other two sides.",
      "This is the Angle Bisector Theorem."
    ]
  }
};

export function TheoremsPanel({ selectedTheorem, setSelectedTheorem, theoremStep, setTheoremStep }: TheoremsPanelProps) {
  const data = THEOREMS_DATA[selectedTheorem];

  // Auto-play logic
  const [isPlaying, setIsPlaying] = React.useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setTimeout(() => {
        if (theoremStep < data.steps.length) {
          setTheoremStep(theoremStep + 1);
        } else {
          setIsPlaying(false);
        }
      }, 2500);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, theoremStep, data.steps.length, setTheoremStep]);

  return (
    <div className="flex flex-col h-full bg-[#0b2c5f] text-white p-6 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4 text-[#f4c430]">Theorems Mode</h2>
      
      <div className="mb-6">
        <label className="block text-sm text-white/70 mb-2">Select Theorem</label>
        <select 
          className="w-full bg-black/30 border border-white/20 rounded-lg p-2 text-white outline-none focus:border-[#f4c430]"
          value={selectedTheorem}
          onChange={(e) => {
            setSelectedTheorem(e.target.value as TheoremType);
            setTheoremStep(1);
            setIsPlaying(false);
          }}
        >
          <optgroup label="Congruence">
            <option value="sss">SSS Congruence</option>
            <option value="sas">SAS Congruence</option>
          </optgroup>
          <optgroup label="Similarity">
            <option value="aaa">AAA Similarity</option>
          </optgroup>
          <optgroup label="Basic Theorems">
            <option value="pythagoras">Pythagoras Theorem</option>
          </optgroup>
          <optgroup label="Special Lines">
            <option value="midpoint">Midpoint Theorem</option>
            <option value="angleBisector">Angle Bisector Theorem</option>
          </optgroup>
        </select>
      </div>

      <div className="bg-blue-900/50 border border-blue-800 rounded-xl p-5 mb-6">
        <h3 className="text-lg font-bold text-[#f4c430] mb-2">{data.title}</h3>
        <p className="text-sm text-white/90 leading-relaxed">{data.statement}</p>
      </div>

      <div className="flex-1">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-sm font-bold text-white/70 uppercase tracking-wider">Step-by-Step Explanation</h4>
          <span className="text-xs font-mono text-[#f4c430] bg-[#f4c430]/10 px-2 py-1 rounded">
            Step {theoremStep}/{data.steps.length}
          </span>
        </div>
        <div className="space-y-3">
          {data.steps.map((step, index) => {
            const stepNum = index + 1;
            const isActive = stepNum === theoremStep;
            const isPast = stepNum < theoremStep;
            
            return (
              <div 
                key={index}
                className={`p-3 rounded-lg border transition-all duration-300 ${
                  isActive 
                    ? "bg-[#f4c430]/10 border-[#f4c430] text-white" 
                    : isPast
                      ? "bg-black/20 border-white/10 text-white/70"
                      : "bg-black/10 border-transparent text-white/40"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isActive ? "bg-[#f4c430] text-[#0b2c5f]" : isPast ? "bg-white/20 text-white" : "bg-white/10 text-white/40"
                  }`}>
                    {stepNum}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm pt-0.5">{step}</p>
                    {selectedTheorem === "pythagoras" && stepNum === 7 && isActive && (
                      <div className="mt-4 p-4 bg-black/30 rounded-lg text-center border border-white/10">
                        <div className="text-2xl font-mono text-[#f4c430] mb-2">a² + b² = c²</div>
                        <div className="text-xs text-white/50">Only valid for right-angled triangles</div>
                      </div>
                    )}
                    {selectedTheorem === "angleBisector" && stepNum >= 6 && isActive && (
                      <div className="mt-4 p-4 bg-black/30 rounded-lg text-center border border-white/10">
                        <div className="text-2xl font-mono text-[#f4c430] mb-4 flex items-center justify-center gap-2">
                          <div className="flex flex-col items-center">
                            <span className="text-blue-400 border-b border-[#f4c430] px-2">BD</span>
                            <span className="text-green-400 px-2">DC</span>
                          </div>
                          <span>=</span>
                          <div className="flex flex-col items-center">
                            <span className="text-blue-400 border-b border-[#f4c430] px-2">AB</span>
                            <span className="text-green-400 px-2">AC</span>
                          </div>
                        </div>
                        <div className="text-lg font-mono text-white/90 mb-2 flex items-center justify-center gap-2">
                          <div className="flex flex-col items-center">
                            <span className="text-blue-400 border-b border-white/30 px-2">5.5</span>
                            <span className="text-green-400 px-2">6.5</span>
                          </div>
                          <span>=</span>
                          <div className="flex flex-col items-center">
                            <span className="text-blue-400 border-b border-white/30 px-2">10.8</span>
                            <span className="text-green-400 px-2">12.8</span>
                          </div>
                          <span className="ml-2 text-white/50">≈ 0.84</span>
                        </div>
                        <div className="text-xs text-white/50 mt-3">Segments are proportional to adjacent sides</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => {
              setTheoremStep(Math.max(1, theoremStep - 1));
              setIsPlaying(false);
            }}
            disabled={theoremStep === 1}
            className="px-4 py-2 rounded-lg bg-black/30 text-white disabled:opacity-50 hover:bg-black/50 transition-colors"
          >
            Previous
          </button>
          
          <button
            onClick={() => {
              if (theoremStep >= data.steps.length) {
                setTheoremStep(1);
                setIsPlaying(true);
              } else {
                setIsPlaying(!isPlaying);
              }
            }}
            className="flex-1 px-4 py-2 rounded-lg bg-[#f4c430] text-[#0b2c5f] font-bold hover:bg-[#f4c430]/90 transition-colors"
          >
            {isPlaying ? "Pause" : theoremStep >= data.steps.length ? "Replay" : "Auto-Play"}
          </button>

          <button
            onClick={() => {
              setTheoremStep(Math.min(data.steps.length, theoremStep + 1));
              setIsPlaying(false);
            }}
            disabled={theoremStep === data.steps.length}
            className="px-4 py-2 rounded-lg bg-black/30 text-white disabled:opacity-50 hover:bg-black/50 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
