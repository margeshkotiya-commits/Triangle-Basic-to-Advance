"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mode } from "./TrigSimulation";
import { cn } from "@/lib/utils";

interface TriangleCanvasProps {
  base: number;
  setBase: (b: number) => void;
  height: number;
  setHeight: (h: number) => void;
  selectedAngle: "A" | "B" | null;
  setSelectedAngle: (angle: "A" | "B" | null) => void;
  mode: Mode;
  learningStep: number;
  setLearningStep: React.Dispatch<React.SetStateAction<number>>;
}

export function TriangleCanvas({
  base,
  setBase,
  height,
  setHeight,
  selectedAngle,
  setSelectedAngle,
  mode,
  learningStep,
  setLearningStep,
}: TriangleCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [draggingPoint, setDraggingPoint] = useState<'A' | 'B' | 'C' | null>(null);

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

  const PIXELS_PER_UNIT = 30;
  const drawBase = currentBase * PIXELS_PER_UNIT;
  const drawHeight = currentHeight * PIXELS_PER_UNIT;

  const cx = 250;
  const cy = 250;

  const C = { x: cx + drawBase / 2, y: cy + drawHeight / 2 };
  const A = { x: cx - drawBase / 2, y: cy + drawHeight / 2 };
  const B = { x: cx + drawBase / 2, y: cy - drawHeight / 2 };

  const angleARad = Math.atan2(currentHeight, currentBase);
  const angleA_deg = angleARad * (180 / Math.PI);
  const angleB_deg = 90 - angleA_deg;
  const hyp = Math.sqrt(currentBase * currentBase + currentHeight * currentHeight);

  const handleAngleClick = (angle: "A" | "B" | null) => {
    setSelectedAngle(angle);
    if (learningStep === 1) setLearningStep(2);
  };

  const handlePointerDown = (e: React.PointerEvent, point: 'A' | 'B' | 'C') => {
    e.preventDefault();
    const svg = svgRef.current;
    if (!svg) return;

    setDraggingPoint(point);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const pt = svg.createSVGPoint();
      pt.x = moveEvent.clientX;
      pt.y = moveEvent.clientY;
      const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());

      if (point === 'A') {
        let newBase = (cx - svgP.x) * 2 / PIXELS_PER_UNIT;
        newBase = Math.max(1, Math.min(15, newBase));
        setBase(Number(newBase.toFixed(1)));
      } else if (point === 'B') {
        let newHeight = (cy - svgP.y) * 2 / PIXELS_PER_UNIT;
        newHeight = Math.max(1, Math.min(15, newHeight));
        setHeight(Number(newHeight.toFixed(1)));
      } else if (point === 'C') {
        let newBase = (svgP.x - cx) * 2 / PIXELS_PER_UNIT;
        let newHeight = (svgP.y - cy) * 2 / PIXELS_PER_UNIT;
        newBase = Math.max(1, Math.min(15, newBase));
        newHeight = Math.max(1, Math.min(15, newHeight));
        setBase(Number(newBase.toFixed(1)));
        setHeight(Number(newHeight.toFixed(1)));
      }
    };

    const handlePointerUp = () => {
      setDraggingPoint(null);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const getSideColor = (side: 'base' | 'height' | 'hypotenuse') => {
    if (learningStep < 2) return 'stroke-white';
    if (side === 'hypotenuse') return 'stroke-white';
    if (selectedAngle === 'A') {
      return side === 'base' ? 'stroke-blue-400' : 'stroke-yellow-400';
    } else if (selectedAngle === 'B') {
      return side === 'height' ? 'stroke-blue-400' : 'stroke-yellow-400';
    }
    return 'stroke-slate-400';
  };

  const getSideLabel = (side: 'base' | 'height' | 'hypotenuse') => {
    if (side === 'hypotenuse') return 'Hypotenuse';
    if (selectedAngle === 'A') {
      return side === 'base' ? 'Adjacent' : 'Opposite';
    } else if (selectedAngle === 'B') {
      return side === 'height' ? 'Adjacent' : 'Opposite';
    }
    return '';
  };

  const getSideBadgeClass = (side: 'base' | 'height' | 'hypotenuse') => {
    let borderColor = 'border-slate-400';
    let textColor = 'text-white';
    if (side === 'hypotenuse') { borderColor = 'border-white'; textColor = 'text-white'; }
    else if (selectedAngle === 'A') {
      if (side === 'base') { borderColor = 'border-blue-400'; textColor = 'text-blue-400'; }
      else { borderColor = 'border-yellow-400'; textColor = 'text-yellow-400'; }
    } else if (selectedAngle === 'B') {
      if (side === 'height') { borderColor = 'border-blue-400'; textColor = 'text-blue-400'; }
      else { borderColor = 'border-yellow-400'; textColor = 'text-yellow-400'; }
    }
    return `bg-blue-900/90 ${textColor} border ${borderColor} px-2 py-1 rounded-md text-xs font-bold shadow-lg`;
  };

  const offset = 30;
  const posAC = { x: (A.x + C.x) / 2, y: C.y + offset };
  const posBC = { x: C.x + offset, y: (B.y + C.y) / 2 };
  const lenAB = Math.sqrt(drawBase**2 + drawHeight**2);
  const nx = -drawHeight / lenAB;
  const ny = -drawBase / lenAB;
  const posAB = { x: (A.x + B.x) / 2 + nx * offset, y: (A.y + B.y) / 2 + ny * offset };

  const posAngleA = { x: A.x - 25, y: A.y + 25 };
  const posAngleB = { x: B.x + 25, y: B.y - 25 };
  const posAngleC = { x: C.x + 25, y: C.y + 25 };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      <div className="relative w-full max-w-[500px] aspect-square">
        <svg
          ref={svgRef}
          viewBox="0 0 500 500"
          className="w-full h-full overflow-visible touch-none"
        >
          {/* Right angle square */}
          <path
            d={`M ${C.x - 20} ${C.y} L ${C.x - 20} ${C.y - 20} L ${C.x} ${C.y - 20}`}
            fill={learningStep === 1 ? "rgba(255,255,255,0.1)" : "none"}
            stroke={learningStep === 1 ? "#ffffff" : "currentColor"}
            className={cn(learningStep === 1 ? "" : "text-slate-600")}
            strokeWidth={learningStep === 1 ? "3" : "2"}
            style={{ filter: learningStep === 1 ? 'drop-shadow(0 0 8px rgba(255,255,255,0.6))' : 'none' }}
          />

          {/* Angle A Arc */}
          <path
            d={`M ${A.x + 30} ${A.y} A 30 30 0 0 0 ${A.x + 30 * Math.cos(angleARad)} ${A.y - 30 * Math.sin(angleARad)}`}
            fill="none"
            stroke={selectedAngle === "A" ? "#fb923c" : "#475569"}
            strokeWidth="3"
            className="transition-colors duration-300 ease-in-out"
          />

          {/* Angle B Arc */}
          <path
            d={`M ${B.x} ${B.y + 30} A 30 30 0 0 1 ${B.x - 30 * Math.cos(angleARad)} ${B.y + 30 * Math.sin(angleARad)}`}
            fill="none"
            stroke={selectedAngle === "B" ? "#fb923c" : "#475569"}
            strokeWidth="3"
            className="transition-colors duration-300 ease-in-out"
          />

          {/* Sides */}
          {/* Side a (BC) - Height */}
          <line
            x1={C.x} y1={C.y} x2={B.x} y2={B.y}
            className={cn("transition-colors duration-300 ease-in-out", getSideColor('height'))}
            strokeWidth={selectedAngle && learningStep >= 2 ? "4" : "3"}
            strokeLinecap="round"
            style={{ filter: selectedAngle && learningStep >= 2 && getSideColor('height').includes('yellow') ? 'drop-shadow(0 0 8px rgba(250,204,21,0.6))' : (learningStep === 1 ? 'drop-shadow(0 0 8px rgba(255,255,255,0.4))' : 'none') }}
          />
          {/* Side b (AC) - Base */}
          <line
            x1={A.x} y1={A.y} x2={C.x} y2={C.y}
            className={cn("transition-colors duration-300 ease-in-out", getSideColor('base'))}
            strokeWidth={selectedAngle && learningStep >= 2 ? "4" : "3"}
            strokeLinecap="round"
            style={{ filter: selectedAngle && learningStep >= 2 && getSideColor('base').includes('yellow') ? 'drop-shadow(0 0 8px rgba(250,204,21,0.6))' : (learningStep === 1 ? 'drop-shadow(0 0 8px rgba(255,255,255,0.4))' : 'none') }}
          />
          {/* Side c (AB) - Hypotenuse */}
          <line
            x1={A.x} y1={A.y} x2={B.x} y2={B.y}
            className={cn("transition-colors duration-300 ease-in-out", getSideColor('hypotenuse'))}
            strokeWidth={selectedAngle && learningStep >= 2 ? "4" : "3"}
            strokeLinecap="round"
            style={{ filter: learningStep === 1 ? 'drop-shadow(0 0 8px rgba(255,255,255,0.4))' : 'none' }}
          />

          {/* Vertices */}
          {(['A', 'B', 'C'] as const).map((pt) => {
            const point = pt === 'A' ? A : pt === 'B' ? B : C;
            const isSelected = selectedAngle === pt;
            return (
              <g 
                key={pt}
                className="cursor-grab active:cursor-grabbing group" 
                onPointerDown={(e) => handlePointerDown(e, pt)}
                onClick={() => pt !== 'C' && handleAngleClick(pt)}
              >
                <circle 
                  cx={point.x} cy={point.y} r="20" 
                  className="fill-transparent" 
                />
                <circle 
                  cx={point.x} cy={point.y} r="6" 
                  className={cn(
                    "fill-white stroke-blue-500 transition-transform duration-300 ease-in-out group-hover:scale-150",
                    isSelected ? "scale-125 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" : "",
                    draggingPoint === pt ? "scale-150 drop-shadow-[0_0_12px_rgba(255,255,255,1)]" : ""
                  )} 
                  strokeWidth="2" 
                  style={{ transformOrigin: `${point.x}px ${point.y}px` }}
                />
              </g>
            );
          })}
        </svg>
        
        {/* Floating Labels (HTML Overlay) */}
        {mode === "BASICS" && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="relative w-full h-full max-w-[500px] max-h-[500px]">
              <AnimatePresence>
                {learningStep >= 2 && (
                  <>
                    {/* Base Label */}
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${(posAC.x / 500) * 100}%`, top: `${(posAC.y / 500) * 100}%` }}
                    >
                      <div className={cn("whitespace-nowrap", getSideBadgeClass('base'))}>
                        {getSideLabel('base')}
                      </div>
                    </motion.div>

                    {/* Height Label */}
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${(posBC.x / 500) * 100}%`, top: `${(posBC.y / 500) * 100}%` }}
                    >
                      <div className={cn("whitespace-nowrap", getSideBadgeClass('height'))}>
                        {getSideLabel('height')}
                      </div>
                    </motion.div>

                    {/* Hypotenuse Label */}
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2"
                      style={{ 
                        left: `${(posAB.x / 500) * 100}%`, 
                        top: `${(posAB.y / 500) * 100}%`,
                        transform: `translate(-50%, -50%) rotate(${-angleA_deg}deg)`
                      }}
                    >
                      <div className={cn("whitespace-nowrap", getSideBadgeClass('hypotenuse'))}>
                        {getSideLabel('hypotenuse')}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              {/* Angle A Label */}
              <div 
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${(posAngleA.x / 500) * 100}%`, top: `${(posAngleA.y / 500) * 100}%` }}
              >
                <div className="bg-slate-900/80 text-slate-300 px-2 py-1 rounded text-xs font-bold shadow">
                  A = {angleA_deg.toFixed(1)}°
                </div>
              </div>

              {/* Angle B Label */}
              <div 
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${(posAngleB.x / 500) * 100}%`, top: `${(posAngleB.y / 500) * 100}%` }}
              >
                <div className="bg-slate-900/80 text-slate-300 px-2 py-1 rounded text-xs font-bold shadow">
                  B = {angleB_deg.toFixed(1)}°
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Manual Controls */}
      <div className="mt-4 flex gap-4 bg-slate-900/90 p-3 rounded-xl border border-slate-700 backdrop-blur-sm shadow-xl z-10">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-slate-400 uppercase tracking-wider">Base (Adj)</label>
          <input 
            type="number" 
            value={base} 
            onChange={(e) => setBase(Math.max(1, Math.min(15, Number(e.target.value))))}
            className="w-20 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white outline-none focus:border-blue-400 transition-colors"
            min="1"
            max="15"
            step="0.1"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-slate-400 uppercase tracking-wider">Height (Opp)</label>
          <input 
            type="number" 
            value={height} 
            onChange={(e) => setHeight(Math.max(1, Math.min(15, Number(e.target.value))))}
            className="w-20 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white outline-none focus:border-blue-400 transition-colors"
            min="1"
            max="15"
            step="0.1"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-slate-400 uppercase tracking-wider">Hypotenuse</label>
          <input 
            type="number" 
            value={Math.sqrt(base * base + height * height).toFixed(2)} 
            readOnly
            className="w-20 bg-slate-800/50 border border-slate-700 rounded px-2 py-1 text-sm text-slate-400 outline-none"
          />
        </div>
      </div>
    </div>
  );
}
