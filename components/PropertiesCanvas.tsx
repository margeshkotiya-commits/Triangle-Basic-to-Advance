"use client";

import React, { useRef, useState, useEffect } from "react";
import { Point, calculateTriangle, getAngleArcPath, getAngleLabelPosition, getSideLabelPosition } from "@/lib/math";
import { cn } from "@/lib/utils";

interface PropertiesCanvasProps {
  propStep: number;
  triggerSpecialTriangle: "equilateral" | "isosceles" | "scalene" | null;
  onSpecialTriangleDone: () => void;
}

export function PropertiesCanvas({ propStep, triggerSpecialTriangle, onSpecialTriangleDone }: PropertiesCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [draggingPoint, setDraggingPoint] = useState<"A" | "B" | "C" | null>(null);

  // Initial points
  const [points, setPoints] = useState<{ A: Point; B: Point; C: Point }>({
    A: { x: 250, y: 100 },
    B: { x: 100, y: 350 },
    C: { x: 400, y: 350 },
  });

  const targetPoints = useRef({ ...points });
  const animPoints = useRef({ ...points });
  const [currentPoints, setCurrentPoints] = useState({ ...points });

  // Smooth animation loop
  useEffect(() => {
    let frameId: number;
    const loop = () => {
      let changed = false;
      const ease = 0.15;

      const newPoints = { ...animPoints.current };
      for (const key of ["A", "B", "C"] as const) {
        const dx = targetPoints.current[key].x - newPoints[key].x;
        const dy = targetPoints.current[key].y - newPoints[key].y;
        if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
          newPoints[key].x += dx * ease;
          newPoints[key].y += dy * ease;
          changed = true;
        } else {
          newPoints[key].x = targetPoints.current[key].x;
          newPoints[key].y = targetPoints.current[key].y;
        }
      }

      if (changed) {
        animPoints.current = newPoints;
        setCurrentPoints(newPoints);
      }
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Update target points when dragging
  useEffect(() => {
    targetPoints.current = { ...points };
  }, [points]);

  // Handle special triangles trigger
  useEffect(() => {
    if (triggerSpecialTriangle) {
      if (triggerSpecialTriangle === "equilateral") {
        const side = 250;
        const h = side * Math.sqrt(3) / 2;
        targetPoints.current = {
          A: { x: 250, y: 250 - h / 2 },
          B: { x: 250 - side / 2, y: 250 + h / 2 },
          C: { x: 250 + side / 2, y: 250 + h / 2 },
        };
      } else if (triggerSpecialTriangle === "isosceles") {
        targetPoints.current = {
          A: { x: 250, y: 100 },
          B: { x: 150, y: 350 },
          C: { x: 350, y: 350 },
        };
      } else if (triggerSpecialTriangle === "scalene") {
        targetPoints.current = {
          A: { x: 200, y: 100 },
          B: { x: 100, y: 350 },
          C: { x: 450, y: 300 },
        };
      }
      // Update the actual points state so dragging continues from here
      setPoints({ ...targetPoints.current });
      onSpecialTriangleDone();
    }
  }, [triggerSpecialTriangle, onSpecialTriangleDone]);

  const handlePointerDown = (e: React.PointerEvent, pt: "A" | "B" | "C") => {
    e.preventDefault();
    setDraggingPoint(pt);
    if (svgRef.current) {
      svgRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingPoint || !svgRef.current) return;

    const CTM = svgRef.current.getScreenCTM();
    if (!CTM) return;

    let x = (e.clientX - CTM.e) / CTM.a;
    let y = (e.clientY - CTM.f) / CTM.d;

    const padding = 20;
    x = Math.max(padding, Math.min(500 - padding, x));
    y = Math.max(padding, Math.min(500 - padding, y));

    setPoints((prev) => ({ ...prev, [draggingPoint]: { x, y } }));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingPoint && svgRef.current) {
      svgRef.current.releasePointerCapture(e.pointerId);
    }
    setDraggingPoint(null);
  };

  const { A, B, C } = currentPoints;
  const { a, b, c, angleA, angleB, angleC } = calculateTriangle(A, B, C, 1);

  const minAngle = Math.min(angleA, angleB, angleC);
  const maxAngle = Math.max(angleA, angleB, angleC);
  const minAngleName = minAngle === angleA ? 'A' : minAngle === angleB ? 'B' : 'C';
  const maxAngleName = maxAngle === angleA ? 'A' : maxAngle === angleB ? 'B' : 'C';

  const getRadius = (angle: number) => {
    if (propStep === 5) {
      if (angle === maxAngle) return 40;
      if (angle === minAngle) return 20;
      return 30;
    }
    return 30;
  };

  // Side label positions
  const posSideA = getSideLabelPosition(B, C, A, 25);
  const posSideB = getSideLabelPosition(A, C, B, 25);
  const posSideC = getSideLabelPosition(A, B, C, 25);

  // Angle label positions
  const posA = getAngleLabelPosition(A, B, C, getRadius(angleA) + 25);
  const posB = getAngleLabelPosition(B, A, C, getRadius(angleB) + 25);
  const posC = getAngleLabelPosition(C, A, B, getRadius(angleC) + 25);

  // Angle arc paths
  const arcA = getAngleArcPath(A, B, C, getRadius(angleA));
  const arcB = getAngleArcPath(B, A, C, getRadius(angleB));
  const arcC = getAngleArcPath(C, A, B, getRadius(angleC));

  // Exterior angle logic (Step 2)
  // Extend BC to D
  const lenBC = Math.sqrt((C.x - B.x) ** 2 + (C.y - B.y) ** 2);
  const dirBC = { x: (C.x - B.x) / lenBC, y: (C.y - B.y) / lenBC };
  const extD = { x: C.x + dirBC.x * 100, y: C.y + dirBC.y * 100 };
  const extArc = getAngleArcPath(C, A, extD, 30);
  const extLabelPos = getAngleLabelPosition(C, A, extD, 55);
  const extAngle = 180 - angleC;

  // Triangle Inequality logic (Step 3)
  // Show side lengths as bars at the bottom
  const maxSide = Math.max(a, b, c);
  const scale = 400 / (a + b + c);

  // Triangle Types logic (Step 4)
  const isRight = Math.abs(angleA - 90) < 1 || Math.abs(angleB - 90) < 1 || Math.abs(angleC - 90) < 1;
  const isObtuse = angleA > 90 || angleB > 90 || angleC > 90;
  const isAcute = !isRight && !isObtuse;

  const createPieSlice = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
    const startRad = (startAngle - 180) * Math.PI / 180;
    const endRad = (endAngle - 180) * Math.PI / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  const renderAngleBadge = (pos: Point, angle: number, colorClass: string) => (
    <foreignObject x={pos.x - 40} y={pos.y - 20} width="80" height="40" className="overflow-visible pointer-events-none">
      <div className="w-full h-full flex items-center justify-center">
        <div className={`px-2 py-1 rounded-md text-xs font-bold shadow-sm transition-colors duration-300 ${colorClass}`}>
          {angle.toFixed(1)}°
        </div>
      </div>
    </foreignObject>
  );

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      <svg
        ref={svgRef}
        viewBox="0 0 500 500"
        className="w-full h-full max-w-[500px] max-h-[500px] overflow-visible touch-none"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* Exterior Angle Line */}
        {propStep === 2 && (
          <line
            x1={C.x}
            y1={C.y}
            x2={extD.x}
            y2={extD.y}
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
        )}

        {/* Triangle Polygon */}
        <polygon
          points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`}
          fill="rgba(59, 130, 246, 0.1)"
          stroke="white"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Side vs Angle Highlights */}
        {propStep === 5 && (
          <>
            <line
              x1={maxAngleName === 'A' ? B.x : maxAngleName === 'B' ? A.x : A.x}
              y1={maxAngleName === 'A' ? B.y : maxAngleName === 'B' ? A.y : A.y}
              x2={maxAngleName === 'A' ? C.x : maxAngleName === 'B' ? C.x : B.x}
              y2={maxAngleName === 'A' ? C.y : maxAngleName === 'B' ? C.y : B.y}
              stroke="#f4c430"
              strokeWidth="6"
              strokeLinecap="round"
            />
          </>
        )}

        {/* Angle Arcs */}
        <path
          d={arcA}
          fill={propStep === 1 || propStep === 2 ? "rgba(59, 130, 246, 0.5)" : "none"}
          stroke={propStep === 1 || propStep === 2 ? "#3b82f6" : (propStep === 4 || propStep === 5) && maxAngleName === 'A' ? "#f4c430" : propStep === 5 && minAngleName === 'A' ? "#a855f7" : "white"}
          strokeWidth={(propStep === 4 || propStep === 5) && maxAngleName === 'A' ? "4" : propStep === 5 && minAngleName === 'A' ? "2" : "3"}
          strokeLinecap="round"
        />
        <path
          d={arcB}
          fill={propStep === 1 ? "rgba(34, 197, 94, 0.5)" : propStep === 2 ? "rgba(59, 130, 246, 0.5)" : "none"}
          stroke={propStep === 1 ? "#22c55e" : propStep === 2 ? "#3b82f6" : (propStep === 4 || propStep === 5) && maxAngleName === 'B' ? "#f4c430" : propStep === 5 && minAngleName === 'B' ? "#a855f7" : "white"}
          strokeWidth={(propStep === 4 || propStep === 5) && maxAngleName === 'B' ? "4" : propStep === 5 && minAngleName === 'B' ? "2" : "3"}
          strokeLinecap="round"
        />
        <path
          d={arcC}
          fill={propStep === 1 ? "rgba(168, 85, 247, 0.5)" : "none"}
          stroke={propStep === 1 ? "#a855f7" : (propStep === 4 || propStep === 5) && maxAngleName === 'C' ? "#f4c430" : propStep === 5 && minAngleName === 'C' ? "#a855f7" : "white"}
          strokeWidth={(propStep === 4 || propStep === 5) && maxAngleName === 'C' ? "4" : propStep === 5 && minAngleName === 'C' ? "2" : "3"}
          strokeLinecap="round"
        />

        {/* Exterior Angle Arc */}
        {propStep === 2 && (
          <path
            d={extArc}
            fill="rgba(244, 196, 48, 0.5)"
            stroke="#f4c430"
            strokeWidth="3"
            strokeLinecap="round"
          />
        )}

        {/* Vertices */}
        {(["A", "B", "C"] as const).map((pt) => {
          const point = pt === "A" ? A : pt === "B" ? B : C;
          return (
            <g
              key={pt}
              className="cursor-grab active:cursor-grabbing group"
              onPointerDown={(e) => handlePointerDown(e, pt)}
            >
              <circle cx={point.x} cy={point.y} r="20" className="fill-transparent" />
              <circle
                cx={point.x}
                cy={point.y}
                r="6"
                className={cn(
                  "fill-white stroke-blue-500 transition-transform duration-300 ease-in-out group-hover:scale-150",
                  draggingPoint === pt ? "scale-150 drop-shadow-[0_0_12px_rgba(255,255,255,1)]" : ""
                )}
                strokeWidth="2"
                style={{ transformOrigin: `${point.x}px ${point.y}px` }}
              />
            </g>
          );
        })}

        {/* Labels */}
        {renderAngleBadge(posA, angleA, propStep === 1 || propStep === 2 ? "bg-blue-500/90 text-white" : (propStep === 4 || propStep === 5) && maxAngleName === 'A' ? "bg-yellow-500/90 text-black" : propStep === 5 && minAngleName === 'A' ? "bg-purple-500/90 text-white" : "bg-blue-900/90 text-white")}
        {renderAngleBadge(posB, angleB, propStep === 1 ? "bg-green-500/90 text-white" : propStep === 2 ? "bg-blue-500/90 text-white" : (propStep === 4 || propStep === 5) && maxAngleName === 'B' ? "bg-yellow-500/90 text-black" : propStep === 5 && minAngleName === 'B' ? "bg-purple-500/90 text-white" : "bg-blue-900/90 text-white")}
        {propStep !== 2 && renderAngleBadge(posC, angleC, propStep === 1 ? "bg-purple-500/90 text-white" : (propStep === 4 || propStep === 5) && maxAngleName === 'C' ? "bg-yellow-500/90 text-black" : propStep === 5 && minAngleName === 'C' ? "bg-purple-500/90 text-white" : "bg-blue-900/90 text-white")}
        {propStep === 2 && renderAngleBadge(extLabelPos, extAngle, "bg-yellow-500/90 text-black")}

        <text x={posSideA.x} y={posSideA.y} fill="white" fontSize="14" textAnchor="middle" dominantBaseline="middle">
          a = {a.toFixed(1)}
        </text>
        <text x={posSideB.x} y={posSideB.y} fill="white" fontSize="14" textAnchor="middle" dominantBaseline="middle">
          b = {b.toFixed(1)}
        </text>
        <text x={posSideC.x} y={posSideC.y} fill="white" fontSize="14" textAnchor="middle" dominantBaseline="middle">
          c = {c.toFixed(1)}
        </text>

        {/* Angle Sum Visualization (Step 1) */}
        {propStep === 1 && (
          <g transform="translate(250, 450)">
            <path d={createPieSlice(0, 0, 50, 0, angleA)} fill="rgba(59, 130, 246, 0.5)" stroke="#3b82f6" strokeWidth="2" />
            <path d={createPieSlice(0, 0, 50, angleA, angleA + angleB)} fill="rgba(34, 197, 94, 0.5)" stroke="#22c55e" strokeWidth="2" />
            <path d={createPieSlice(0, 0, 50, angleA + angleB, 180)} fill="rgba(168, 85, 247, 0.5)" stroke="#a855f7" strokeWidth="2" />
            <line x1="-60" y1="0" x2="60" y2="0" stroke="white" strokeWidth="2" />
            <text x="0" y="20" fill="white" fontSize="14" textAnchor="middle" dominantBaseline="middle" fontWeight="bold">
              180° Straight Line
            </text>
          </g>
        )}
      </svg>

      {/* Angle Sum Visualization (Step 1) */}
      {propStep === 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-2 bg-black/50 p-3 rounded-xl backdrop-blur-sm shadow-[0_0_15px_rgba(250,204,21,0.2)]">
          <div className="flex items-center space-x-2">
            <span className="text-blue-400 font-bold bg-blue-900/30 px-2 py-1 rounded">{angleA.toFixed(1)}°</span>
            <span className="text-white font-bold">+</span>
            <span className="text-green-400 font-bold bg-green-900/30 px-2 py-1 rounded">{angleB.toFixed(1)}°</span>
            <span className="text-white font-bold">+</span>
            <span className="text-purple-400 font-bold bg-purple-900/30 px-2 py-1 rounded">{angleC.toFixed(1)}°</span>
            <span className="text-white font-bold">=</span>
            <span className="text-yellow-400 font-bold text-lg drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]">180°</span>
          </div>
        </div>
      )}

      {/* Exterior Angle Visualization (Step 2) */}
      {propStep === 2 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 p-4 rounded-xl backdrop-blur-sm flex flex-col items-center space-y-2">
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-yellow-400 font-bold">Exterior ∠C ({extAngle.toFixed(1)}°)</span>
            <span className="text-white font-bold">=</span>
            <span className="text-blue-400 font-bold">∠A ({angleA.toFixed(1)}°)</span>
            <span className="text-white font-bold">+</span>
            <span className="text-blue-400 font-bold">∠B ({angleB.toFixed(1)}°)</span>
          </div>
        </div>
      )}

      {/* Triangle Inequality Visualization (Step 3) */}
      {propStep === 3 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-md bg-black/50 p-4 rounded-xl backdrop-blur-sm flex flex-col space-y-4">
          <div className="flex items-center justify-between text-sm font-bold">
            <span className="text-blue-400">a = {a.toFixed(1)}</span>
            <span className="text-green-400">b = {b.toFixed(1)}</span>
            <span className="text-purple-400">c = {c.toFixed(1)}</span>
          </div>
          
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-white/70 text-xs w-24 text-right">Longest Side:</span>
              <div className="relative h-4 bg-slate-800 rounded-full overflow-hidden flex-1">
                <div className="h-full bg-yellow-500" style={{ width: `${(maxSide / (a + b + c)) * 100}%` }} />
              </div>
              <span className="text-yellow-400 text-xs font-bold w-12">{maxSide.toFixed(1)}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-white/70 text-xs w-24 text-right">Other Two:</span>
              <div className="relative h-4 bg-slate-800 rounded-full overflow-hidden flex-1 flex">
                {maxSide === a ? (
                  <>
                    <div className="h-full bg-green-500" style={{ width: `${(b / (a + b + c)) * 100}%` }} />
                    <div className="h-full bg-purple-500" style={{ width: `${(c / (a + b + c)) * 100}%` }} />
                  </>
                ) : maxSide === b ? (
                  <>
                    <div className="h-full bg-blue-500" style={{ width: `${(a / (a + b + c)) * 100}%` }} />
                    <div className="h-full bg-purple-500" style={{ width: `${(c / (a + b + c)) * 100}%` }} />
                  </>
                ) : (
                  <>
                    <div className="h-full bg-blue-500" style={{ width: `${(a / (a + b + c)) * 100}%` }} />
                    <div className="h-full bg-green-500" style={{ width: `${(b / (a + b + c)) * 100}%` }} />
                  </>
                )}
              </div>
              <span className="text-white text-xs font-bold w-12">{((a + b + c) - maxSide).toFixed(1)}</span>
            </div>
          </div>

          <div className="text-center text-sm text-white/90 font-bold">
            {((a + b + c) - maxSide).toFixed(1)} &gt; {maxSide.toFixed(1)}
          </div>
          {((a + b + c) - maxSide) - maxSide < 0.1 && (
            <div className="text-center text-sm text-red-400 font-bold bg-red-900/30 py-1 rounded">
              Triangle not possible (collinear points)
            </div>
          )}
        </div>
      )}

      {/* Triangle Types Badge (Step 4) */}
      {propStep === 4 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-blue-900/90 text-white px-6 py-2 rounded-full font-bold shadow-lg border border-blue-400/30 backdrop-blur-sm transition-all">
          {isRight ? "Right Triangle" : isObtuse ? "Obtuse Triangle" : "Acute Triangle"}
        </div>
      )}
      {/* Side vs Angle Visualization (Step 5) */}
      {propStep === 5 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 p-4 rounded-xl backdrop-blur-sm flex flex-col items-center space-y-2">
          <div className="text-yellow-400 font-bold text-sm">
            Largest Angle ({maxAngleName}) is opposite Longest Side ({maxAngleName.toLowerCase()})
          </div>
          <div className="text-purple-400 font-bold text-sm">
            Smallest Angle ({minAngleName}) is opposite Shortest Side ({minAngleName.toLowerCase()})
          </div>
        </div>
      )}
    </div>
  );
}
