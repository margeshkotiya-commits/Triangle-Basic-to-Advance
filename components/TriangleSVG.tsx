'use client';

import React, { useRef, useState } from 'react';
import { Point, calculateTriangle, midpoint, getAngleLabelPosition, getAngleArcPath, getSideLabelPosition } from '@/lib/math';
import { Mode } from './TrigSimulation';

interface TriangleSVGProps {
  points: { A: Point; B: Point; C: Point };
  onPointChange: (name: 'A' | 'B' | 'C', newPoint: Point) => void;
  mode: Mode;
  selectedAngle: 'A' | 'B' | 'C';
  onSelectAngle?: (angle: 'A' | 'B' | 'C') => void;
  unit?: string;
  pixelsPerUnit?: number;
  showSimplifiedValues?: boolean;
}

export default function TriangleSVG({ points, onPointChange, mode, selectedAngle, onSelectAngle, unit = 'm', pixelsPerUnit = 1, showSimplifiedValues = true }: TriangleSVGProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [draggingPoint, setDraggingPoint] = useState<'A' | 'B' | 'C' | null>(null);

  const handlePointerDown = (e: React.PointerEvent, name: 'A' | 'B' | 'C') => {
    e.preventDefault();
    setDraggingPoint(name);
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

    // Constrain within SVG bounds (with some padding)
    const padding = 20;
    x = Math.max(padding, Math.min(500 - padding, x));
    y = Math.max(padding, Math.min(400 - padding, y));

    onPointChange(draggingPoint, { x, y });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingPoint && svgRef.current) {
      svgRef.current.releasePointerCapture(e.pointerId);
    }
    setDraggingPoint(null);
  };

  const { A, B, C } = points;
  const { a, b, c, angleA, angleB, angleC, aDisplay, bDisplay, cDisplay } = calculateTriangle(A, B, C, pixelsPerUnit);

  const dispA = showSimplifiedValues ? aDisplay : a;
  const dispB = showSimplifiedValues ? bDisplay : b;
  const dispC = showSimplifiedValues ? cDisplay : c;
  const dispUnit = showSimplifiedValues ? 'units' : unit;

  // Side label positions
  const posSideA = getSideLabelPosition(B, C, A, 25);
  const posSideB = getSideLabelPosition(A, C, B, 25);
  const posSideC = getSideLabelPosition(A, B, C, 25);

  // Angle label positions
  const posA = getAngleLabelPosition(A, B, C, 45);
  const posB = getAngleLabelPosition(B, A, C, 45);
  const posC = getAngleLabelPosition(C, A, B, 45);

  // Angle arc paths
  const arcA = getAngleArcPath(A, B, C, 30);
  const arcB = getAngleArcPath(B, A, C, 30);
  const arcC = getAngleArcPath(C, A, B, 30);

  // Helpers for Sine/Cosine highlighting
  const isSineMode = mode === 'SINE';
  const isCosineMode = mode === 'COSINE';

  const getStrokeColor = (side: 'a' | 'b' | 'c') => {
    if (isSineMode) {
      if (selectedAngle === 'A') return side === 'a' ? '#f4c430' : 'rgba(255, 255, 255, 0.4)';
      if (selectedAngle === 'B') return side === 'b' ? '#f4c430' : 'rgba(255, 255, 255, 0.4)';
      if (selectedAngle === 'C') return side === 'c' ? '#f4c430' : 'rgba(255, 255, 255, 0.4)';
    }
    if (isCosineMode) {
      if (selectedAngle === 'A') return side === 'b' || side === 'c' ? '#f4c430' : 'rgba(255, 255, 255, 0.4)';
      if (selectedAngle === 'B') return side === 'a' || side === 'c' ? '#f4c430' : 'rgba(255, 255, 255, 0.4)';
      if (selectedAngle === 'C') return side === 'a' || side === 'b' ? '#f4c430' : 'rgba(255, 255, 255, 0.4)';
    }
    return 'white';
  };

  const getAngleColor = (angleName: 'A' | 'B' | 'C') => {
    if (isSineMode || isCosineMode) {
      return angleName === selectedAngle ? '#f4c430' : 'rgba(255, 255, 255, 0.4)';
    }
    return 'white';
  };

  const getHighlightClass = (isActive: boolean) => {
    return isActive ? 'stroke-yellow-400 drop-shadow-[0_0_8px_rgba(244,196,48,0.8)]' : 'opacity-40';
  };

  const handleSelect = (angle: 'A' | 'B' | 'C') => {
    if (onSelectAngle && (isSineMode || isCosineMode)) {
      onSelectAngle(angle);
    }
  };

  // Triangle Type Detection
  const getTriangleType = () => {
    const angles = [angleA, angleB, angleC];
    const hasRight = angles.some(a => Math.abs(a - 90) < 0.5);
    const hasObtuse = angles.some(a => a > 90.5);
    if (hasRight) return 'Right Triangle';
    if (hasObtuse) return 'Obtuse Triangle';
    return 'Acute Triangle';
  };

  return (
    <div className="relative w-full h-full">
      {/* Triangle Type Badge */}
      <div className="absolute top-4 left-4 z-10">
        <span className="bg-yellow-400 text-blue-900 px-2 py-1 rounded text-xs font-bold shadow-md transition-all duration-300 ease-in-out">
          {getTriangleType()}
        </span>
      </div>

      <svg
        ref={svgRef}
        className="w-full h-full touch-none"
        viewBox="0 0 500 400"
        preserveAspectRatio="xMidYMid meet"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* Angle Arcs */}
        <path d={arcA} fill="none" stroke={getAngleColor('A')} strokeWidth="2" className="transition-colors duration-300 ease-in-out" />
        <path d={arcB} fill="none" stroke={getAngleColor('B')} strokeWidth="2" className="transition-colors duration-300 ease-in-out" />
        <path d={arcC} fill="none" stroke={getAngleColor('C')} strokeWidth="2" className="transition-colors duration-300 ease-in-out" />

        {/* Triangle Sides */}
        <line 
          x1={B.x} y1={B.y} x2={C.x} y2={C.y} 
          stroke={getStrokeColor('a')} strokeWidth="4" 
          className={`transition-colors duration-300 ease-in-out cursor-pointer hover:stroke-yellow-300 ${(isSineMode && selectedAngle === 'A') || (isCosineMode && (selectedAngle === 'B' || selectedAngle === 'C')) ? getHighlightClass(true) : ''}`}
          onClick={() => handleSelect('A')}
        />
        <line 
          x1={A.x} y1={A.y} x2={C.x} y2={C.y} 
          stroke={getStrokeColor('b')} strokeWidth="4" 
          className={`transition-colors duration-300 ease-in-out cursor-pointer hover:stroke-yellow-300 ${(isSineMode && selectedAngle === 'B') || (isCosineMode && (selectedAngle === 'A' || selectedAngle === 'C')) ? getHighlightClass(true) : ''}`}
          onClick={() => handleSelect('B')}
        />
        <line 
          x1={A.x} y1={A.y} x2={B.x} y2={B.y} 
          stroke={getStrokeColor('c')} strokeWidth="4" 
          className={`transition-colors duration-300 ease-in-out cursor-pointer hover:stroke-yellow-300 ${(isSineMode && selectedAngle === 'C') || (isCosineMode && (selectedAngle === 'A' || selectedAngle === 'B')) ? getHighlightClass(true) : ''}`}
          onClick={() => handleSelect('C')}
        />

        {/* Side Labels */}
        <foreignObject x={posSideA.x} y={posSideA.y} width="1" height="1" className="overflow-visible">
          <div
            className={`absolute -translate-x-1/2 -translate-y-1/2 bg-blue-800 text-yellow-300 px-2 py-1 rounded-lg shadow cursor-pointer select-none whitespace-nowrap text-xs md:text-sm font-bold transition-all duration-300 ease-in-out ${(isSineMode && selectedAngle === 'A') || (isCosineMode && (selectedAngle === 'B' || selectedAngle === 'C')) ? 'scale-110 shadow-[0_0_10px_rgba(244,196,48,0.8)]' : 'opacity-80'}`}
            onClick={() => handleSelect('A')}
          >
            a = {dispA.toFixed(1).replace(/\.0$/, '')} {dispUnit}
          </div>
        </foreignObject>
        <foreignObject x={posSideB.x} y={posSideB.y} width="1" height="1" className="overflow-visible">
          <div
            className={`absolute -translate-x-1/2 -translate-y-1/2 bg-blue-800 text-yellow-300 px-2 py-1 rounded-lg shadow cursor-pointer select-none whitespace-nowrap text-xs md:text-sm font-bold transition-all duration-300 ease-in-out ${(isSineMode && selectedAngle === 'B') || (isCosineMode && (selectedAngle === 'A' || selectedAngle === 'C')) ? 'scale-110 shadow-[0_0_10px_rgba(244,196,48,0.8)]' : 'opacity-80'}`}
            onClick={() => handleSelect('B')}
          >
            b = {dispB.toFixed(1).replace(/\.0$/, '')} {dispUnit}
          </div>
        </foreignObject>
        <foreignObject x={posSideC.x} y={posSideC.y} width="1" height="1" className="overflow-visible">
          <div
            className={`absolute -translate-x-1/2 -translate-y-1/2 bg-blue-800 text-yellow-300 px-2 py-1 rounded-lg shadow cursor-pointer select-none whitespace-nowrap text-xs md:text-sm font-bold transition-all duration-300 ease-in-out ${(isSineMode && selectedAngle === 'C') || (isCosineMode && (selectedAngle === 'A' || selectedAngle === 'B')) ? 'scale-110 shadow-[0_0_10px_rgba(244,196,48,0.8)]' : 'opacity-80'}`}
            onClick={() => handleSelect('C')}
          >
            c = {dispC.toFixed(1).replace(/\.0$/, '')} {dispUnit}
          </div>
        </foreignObject>

        {/* Angle Labels */}
        <foreignObject x={posA.x} y={posA.y} width="1" height="1" className="overflow-visible">
          <div
            className={`absolute -translate-x-1/2 -translate-y-1/2 bg-blue-800 text-yellow-300 px-2 py-1 rounded-lg shadow cursor-pointer select-none whitespace-nowrap text-xs md:text-sm font-bold transition-all duration-300 ease-in-out ${selectedAngle === 'A' && (isSineMode || isCosineMode) ? 'scale-110 shadow-[0_0_10px_rgba(244,196,48,0.8)]' : 'opacity-80'}`}
            onClick={() => handleSelect('A')}
          >
            {angleA.toFixed(1)}°
          </div>
        </foreignObject>
        <foreignObject x={posB.x} y={posB.y} width="1" height="1" className="overflow-visible">
          <div
            className={`absolute -translate-x-1/2 -translate-y-1/2 bg-blue-800 text-yellow-300 px-2 py-1 rounded-lg shadow cursor-pointer select-none whitespace-nowrap text-xs md:text-sm font-bold transition-all duration-300 ease-in-out ${selectedAngle === 'B' && (isSineMode || isCosineMode) ? 'scale-110 shadow-[0_0_10px_rgba(244,196,48,0.8)]' : 'opacity-80'}`}
            onClick={() => handleSelect('B')}
          >
            {angleB.toFixed(1)}°
          </div>
        </foreignObject>
        <foreignObject x={posC.x} y={posC.y} width="1" height="1" className="overflow-visible">
          <div
            className={`absolute -translate-x-1/2 -translate-y-1/2 bg-blue-800 text-yellow-300 px-2 py-1 rounded-lg shadow cursor-pointer select-none whitespace-nowrap text-xs md:text-sm font-bold transition-all duration-300 ease-in-out ${selectedAngle === 'C' && (isSineMode || isCosineMode) ? 'scale-110 shadow-[0_0_10px_rgba(244,196,48,0.8)]' : 'opacity-80'}`}
            onClick={() => handleSelect('C')}
          >
            {angleC.toFixed(1)}°
          </div>
        </foreignObject>

        {/* Vertices */}
        {(['A', 'B', 'C'] as const).map((name) => {
          const point = points[name];
          return (
            <g key={name} transform={`translate(${point.x}, ${point.y})`} className="cursor-grab active:cursor-grabbing">
              <circle
                r="20"
                fill="transparent"
                onPointerDown={(e) => handlePointerDown(e, name)}
              />
              <circle
                r="8"
                fill="#f4c430"
                onPointerDown={(e) => handlePointerDown(e, name)}
                className="hover:r-10 transition-colors duration-300 ease-in-out"
              />
              <text x="-15" y="-15" fill="white" className="text-sm font-bold select-none pointer-events-none">
                {name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
