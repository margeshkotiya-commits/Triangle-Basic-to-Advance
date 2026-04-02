"use client";

import React, { useState } from "react";
import TriangleSVG from "./TriangleSVG";
import ControlPanel from "./ControlPanel";
import PracticeMode from "./PracticeMode";
import ExamMode from "./ExamMode";
import { BasicsPanel } from "./BasicsPanel";
import { TriangleCanvas } from "./TriangleCanvas";
import { PropertiesPanel } from "./PropertiesPanel";
import { PropertiesCanvas } from "./PropertiesCanvas";
import { TheoremsCanvas, TheoremType } from "./TheoremsCanvas";
import { TheoremsPanel } from "./TheoremsPanel";
import { Point } from "@/lib/math";

export type Mode = "EXPLORE" | "SINE" | "COSINE" | "PRACTICE" | "EXAM" | "BASICS" | "PROPERTIES" | "THEOREMS";
export type SelectedAngle = "A" | "B" | "C";

export function TrigSimulation() {
  const [mode, setMode] = useState<Mode>("EXPLORE");
  const [points, setPoints] = useState<{ A: Point; B: Point; C: Point }>({
    A: { x: 200, y: 100 },
    B: { x: 100, y: 300 },
    C: { x: 400, y: 300 },
  });
  const [selectedAngle, setSelectedAngle] = useState<SelectedAngle>("A");
  const [unit, setUnit] = useState("m");
  const [pixelsPerUnit, setPixelsPerUnit] = useState(1);

  // State for Basics Mode
  const [basicsBase, setBasicsBase] = useState<number>(4);
  const [basicsHeight, setBasicsHeight] = useState<number>(3);
  const [basicsSelectedAngle, setBasicsSelectedAngle] = useState<"A" | "B" | null>("A");
  const [learningStep, setLearningStep] = useState<number>(1);

  // State for Properties Mode
  const [propStep, setPropStep] = useState<number>(1);
  const [triggerSpecialTriangle, setTriggerSpecialTriangle] = useState<"equilateral" | "isosceles" | "scalene" | null>(null);

  // State for Theorems Mode
  const [selectedTheorem, setSelectedTheorem] = useState<TheoremType>("sss");
  const [theoremStep, setTheoremStep] = useState<number>(1);

  const handlePointChange = (name: "A" | "B" | "C", newPoint: Point) => {
    setPoints((prev) => ({ ...prev, [name]: newPoint }));
  };

  const isExploreMode = mode === "EXPLORE" || mode === "SINE" || mode === "COSINE";

  return (
    <div className="flex flex-col h-screen w-full bg-[#0b2c5f] text-white overflow-hidden">
      {/* Header / Mode Toggle */}
      <header className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20 shrink-0">
        <h1 className="text-xl font-bold text-[#f4c430]">Trigonometry Simulator</h1>
        <div className="flex bg-black/30 rounded-lg p-1">
          <button
            onClick={() => setMode("EXPLORE")}
            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${
              isExploreMode ? "bg-[#f4c430] text-[#0b2c5f]" : "text-white/70 hover:text-white"
            }`}
          >
            Explore
          </button>
          <button
            onClick={() => setMode("BASICS")}
            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${
              mode === "BASICS" ? "bg-[#f4c430] text-[#0b2c5f]" : "text-white/70 hover:text-white"
            }`}
          >
            Basics
          </button>
          <button
            onClick={() => setMode("PROPERTIES")}
            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${
              mode === "PROPERTIES" ? "bg-[#f4c430] text-[#0b2c5f]" : "text-white/70 hover:text-white"
            }`}
          >
            Properties
          </button>
          <button
            onClick={() => setMode("THEOREMS")}
            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${
              mode === "THEOREMS" ? "bg-[#f4c430] text-[#0b2c5f]" : "text-white/70 hover:text-white"
            }`}
          >
            Theorems
          </button>
          <button
            onClick={() => setMode("PRACTICE")}
            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${
              mode === "PRACTICE" ? "bg-[#f4c430] text-[#0b2c5f]" : "text-white/70 hover:text-white"
            }`}
          >
            Practice
          </button>
          <button
            onClick={() => setMode("EXAM")}
            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${
              mode === "EXAM" ? "bg-[#f4c430] text-[#0b2c5f]" : "text-white/70 hover:text-white"
            }`}
          >
            Exam
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Panel: Triangle Canvas */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 relative min-h-[50vh] lg:min-h-0">
          {mode === "THEOREMS" ? (
            <TheoremsCanvas 
              selectedTheorem={selectedTheorem}
              theoremStep={theoremStep}
            />
          ) : mode === "PROPERTIES" ? (
            <PropertiesCanvas 
              propStep={propStep} 
              triggerSpecialTriangle={triggerSpecialTriangle}
              onSpecialTriangleDone={() => setTriggerSpecialTriangle(null)}
            />
          ) : mode === "BASICS" ? (
            <TriangleCanvas
              base={basicsBase}
              setBase={setBasicsBase}
              height={basicsHeight}
              setHeight={setBasicsHeight}
              selectedAngle={basicsSelectedAngle}
              setSelectedAngle={setBasicsSelectedAngle}
              mode="BASICS"
              learningStep={learningStep}
              setLearningStep={setLearningStep}
            />
          ) : (
            <TriangleSVG
              points={points}
              onPointChange={handlePointChange}
              mode={mode}
              selectedAngle={selectedAngle}
              onSelectAngle={setSelectedAngle}
              unit={unit}
              pixelsPerUnit={pixelsPerUnit}
            />
          )}
        </div>

        {/* Right Panel: Educational Content / Controls */}
        <div className="w-full lg:w-[450px] xl:w-[500px] border-t lg:border-t-0 lg:border-l border-white/10 bg-black/20 overflow-y-auto">
          {isExploreMode && (
            <div className="h-full p-4">
              <ControlPanel
                points={points}
                mode={mode}
                setMode={setMode}
                selectedAngle={selectedAngle}
                setSelectedAngle={setSelectedAngle}
                unit={unit}
                setUnit={setUnit}
                setPoints={setPoints}
                pixelsPerUnit={pixelsPerUnit}
                setPixelsPerUnit={setPixelsPerUnit}
              />
            </div>
          )}
          {mode === "PROPERTIES" && (
            <PropertiesPanel
              propStep={propStep}
              setPropStep={setPropStep}
              triggerSpecialTriangle={setTriggerSpecialTriangle}
            />
          )}
          {mode === "BASICS" && (
            <BasicsPanel
              base={basicsBase}
              setBase={setBasicsBase}
              height={basicsHeight}
              setHeight={setBasicsHeight}
              selectedAngle={basicsSelectedAngle}
              setSelectedAngle={setBasicsSelectedAngle}
              learningStep={learningStep}
              setLearningStep={setLearningStep}
            />
          )}
          {mode === "THEOREMS" && (
            <TheoremsPanel
              selectedTheorem={selectedTheorem}
              setSelectedTheorem={setSelectedTheorem}
              theoremStep={theoremStep}
              setTheoremStep={setTheoremStep}
            />
          )}
          {mode === "PRACTICE" && <PracticeMode />}
          {mode === "EXAM" && <ExamMode />}
        </div>
      </main>
    </div>
  );
}

