'use client';

import React, { useState, useEffect } from 'react';
import { Point, calculateTriangle, solveTriangle, generatePointsFromSides } from '@/lib/math';
import { Mode } from './TrigSimulation';
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

interface ControlPanelProps {
  points: { A: Point; B: Point; C: Point };
  mode: Mode;
  setMode: (mode: Mode) => void;
  selectedAngle: 'A' | 'B' | 'C';
  setSelectedAngle: (angle: 'A' | 'B' | 'C') => void;
  unit: string;
  setUnit: (unit: string) => void;
  setPoints: (points: { A: Point; B: Point; C: Point }) => void;
  pixelsPerUnit: number;
  setPixelsPerUnit: (ppu: number) => void;
  showSimplifiedValues?: boolean;
}

export default function ControlPanel({ points, mode, setMode, selectedAngle, setSelectedAngle, unit, setUnit, setPoints, pixelsPerUnit, setPixelsPerUnit, showSimplifiedValues = true }: ControlPanelProps) {
  const { A, B, C } = points;
  const { a, b, c, angleA, angleB, angleC, aDisplay, bDisplay, cDisplay } = calculateTriangle(A, B, C, pixelsPerUnit);

  const dispA = showSimplifiedValues ? aDisplay : a;
  const dispB = showSimplifiedValues ? bDisplay : b;
  const dispC = showSimplifiedValues ? cDisplay : c;
  const dispUnit = showSimplifiedValues ? 'units' : unit;

  const [inputValues, setInputValues] = useState({
    a: '', b: '', c: '', A: '', B: '', C: ''
  });
  const [inputError, setInputError] = useState('');
  const [inputType, setInputType] = useState<'FREE' | 'SSS' | 'SAS' | 'ASA'>('FREE');
  const [autoCorrect, setAutoCorrect] = useState(false);

  // Sync inputs with current triangle when mode changes to EXPLORE or when triangle is dragged
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInputValues({
      a: dispA.toFixed(1).replace(/\.0$/, ''), 
      b: dispB.toFixed(1).replace(/\.0$/, ''), 
      c: dispC.toFixed(1).replace(/\.0$/, ''),
      A: angleA.toFixed(1), B: angleB.toFixed(1), C: angleC.toFixed(1)
    });
  }, [dispA, dispB, dispC, angleA, angleB, angleC]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValues({ ...inputValues, [e.target.name]: e.target.value });
    setInputError('');
  };

  const handleApplyValues = () => {
    let parsed = {
      a: parseFloat(inputValues.a),
      b: parseFloat(inputValues.b),
      c: parseFloat(inputValues.c),
      A: parseFloat(inputValues.A),
      B: parseFloat(inputValues.B),
      C: parseFloat(inputValues.C),
    };

    const known: any = {};

    if (inputType === 'SSS') {
      if (isNaN(parsed.a) || isNaN(parsed.b) || isNaN(parsed.c)) {
        setInputError('Please enter all 3 sides for SSS.');
        return;
      }
      if (autoCorrect) {
        // Auto-correct triangle inequality
        let sides = [
          { name: 'a', val: parsed.a },
          { name: 'b', val: parsed.b },
          { name: 'c', val: parsed.c }
        ].sort((x, y) => x.val - y.val);
        
        if (sides[0].val + sides[1].val <= sides[2].val) {
          // Adjust the largest side to be slightly less than the sum of the other two
          const newVal = sides[0].val + sides[1].val - 0.1;
          parsed[sides[2].name as 'a'|'b'|'c'] = newVal;
          setInputError(`Auto-corrected: Side ${sides[2].name} adjusted to ${newVal.toFixed(1)} to form a valid triangle.`);
        }
      } else {
        if (parsed.a + parsed.b <= parsed.c || parsed.a + parsed.c <= parsed.b || parsed.b + parsed.c <= parsed.a) {
          setInputError('Triangle not possible with these values. Sum of any two sides must be greater than the third.');
          return;
        }
      }
      known.a = parsed.a; known.b = parsed.b; known.c = parsed.c;
    } else if (inputType === 'SAS') {
      // For SAS, we'll just take b, c, A from the inputs for simplicity, or any valid SAS combo.
      // Let's check which ones are provided.
      let sides = 0;
      let angles = 0;
      if (!isNaN(parsed.a)) sides++;
      if (!isNaN(parsed.b)) sides++;
      if (!isNaN(parsed.c)) sides++;
      if (!isNaN(parsed.A)) angles++;
      if (!isNaN(parsed.B)) angles++;
      if (!isNaN(parsed.C)) angles++;

      if (sides !== 2 || angles !== 1) {
        setInputError('Please enter exactly 2 sides and 1 included angle for SAS.');
        return;
      }
      
      // Check if angle is included
      let included = false;
      if (!isNaN(parsed.b) && !isNaN(parsed.c) && !isNaN(parsed.A)) included = true;
      if (!isNaN(parsed.a) && !isNaN(parsed.c) && !isNaN(parsed.B)) included = true;
      if (!isNaN(parsed.a) && !isNaN(parsed.b) && !isNaN(parsed.C)) included = true;

      if (!included) {
        setInputError('For SAS, the angle must be between the two sides.');
        return;
      }

      const angleVal = !isNaN(parsed.A) ? parsed.A : (!isNaN(parsed.B) ? parsed.B : parsed.C);
      if (angleVal <= 0 || angleVal >= 180) {
        setInputError('Angle must be between 0° and 180°.');
        return;
      }

      if (!isNaN(parsed.a)) known.a = parsed.a;
      if (!isNaN(parsed.b)) known.b = parsed.b;
      if (!isNaN(parsed.c)) known.c = parsed.c;
      if (!isNaN(parsed.A)) known.A = parsed.A;
      if (!isNaN(parsed.B)) known.B = parsed.B;
      if (!isNaN(parsed.C)) known.C = parsed.C;

    } else if (inputType === 'ASA') {
      let sides = 0;
      let angles = 0;
      if (!isNaN(parsed.a)) sides++;
      if (!isNaN(parsed.b)) sides++;
      if (!isNaN(parsed.c)) sides++;
      if (!isNaN(parsed.A)) angles++;
      if (!isNaN(parsed.B)) angles++;
      if (!isNaN(parsed.C)) angles++;

      if (sides !== 1 || angles !== 2) {
        setInputError('Please enter exactly 2 angles and 1 side for ASA/AAS.');
        return;
      }

      let sumAngles = 0;
      if (!isNaN(parsed.A)) sumAngles += parsed.A;
      if (!isNaN(parsed.B)) sumAngles += parsed.B;
      if (!isNaN(parsed.C)) sumAngles += parsed.C;

      if (autoCorrect && sumAngles >= 180) {
        // Scale down angles proportionally
        const scale = 179 / sumAngles;
        if (!isNaN(parsed.A)) parsed.A *= scale;
        if (!isNaN(parsed.B)) parsed.B *= scale;
        if (!isNaN(parsed.C)) parsed.C *= scale;
        setInputError('Auto-corrected: Angles scaled down so their sum is < 180°.');
      } else if (sumAngles >= 180) {
        setInputError('Triangle not possible. Sum of angles must be less than 180°.');
        return;
      }

      if (!isNaN(parsed.a)) known.a = parsed.a;
      if (!isNaN(parsed.b)) known.b = parsed.b;
      if (!isNaN(parsed.c)) known.c = parsed.c;
      if (!isNaN(parsed.A)) known.A = parsed.A;
      if (!isNaN(parsed.B)) known.B = parsed.B;
      if (!isNaN(parsed.C)) known.C = parsed.C;
      
    } else {
      // FREE mode
      let count = 0;
      if (!isNaN(parsed.a) && parsed.a > 0) { known.a = parsed.a; count++; }
      if (!isNaN(parsed.b) && parsed.b > 0) { known.b = parsed.b; count++; }
      if (!isNaN(parsed.c) && parsed.c > 0) { known.c = parsed.c; count++; }
      if (!isNaN(parsed.A) && parsed.A > 0) { known.A = parsed.A; count++; }
      if (!isNaN(parsed.B) && parsed.B > 0) { known.B = parsed.B; count++; }
      if (!isNaN(parsed.C) && parsed.C > 0) { known.C = parsed.C; count++; }

      if (count < 3) {
        setInputError('Please enter at least 3 values (including 1 side).');
        return;
      }
    }

    const solved = solveTriangle(known);
    if (!solved) {
      if (!inputError) setInputError('Triangle not possible with these values. Try valid combinations like SSS, SAS, or ASA.');
      return;
    }

    const result = generatePointsFromSides(solved.a, solved.b, solved.c);
    setPoints(result.points);
    setPixelsPerUnit(result.pixelsPerUnit);
    if (!inputError.startsWith('Auto-corrected')) {
      setInputError('');
    }
  };

  const handleReset = () => {
    setPoints({
      A: { x: 200, y: 100 },
      B: { x: 100, y: 300 },
      C: { x: 400, y: 300 },
    });
    setPixelsPerUnit(1);
    setInputError('');
  };

  const sinA = Math.sin((angleA * Math.PI) / 180);
  const sinB = Math.sin((angleB * Math.PI) / 180);
  const sinC = Math.sin((angleC * Math.PI) / 180);

  const cosA = Math.cos((angleA * Math.PI) / 180);
  const cosB = Math.cos((angleB * Math.PI) / 180);
  const cosC = Math.cos((angleC * Math.PI) / 180);

  const valA = showSimplifiedValues ? dispA : a;
  const valB = showSimplifiedValues ? dispB : b;
  const valC = showSimplifiedValues ? dispC : c;

  const ratioA = valA / sinA;
  const ratioB = valB / sinB;
  const ratioC = valC / sinC;

  return (
    <div className="flex flex-col gap-4 h-full overflow-hidden">
      {/* Top Bar: Mode Toggles & Unit Selector */}
      <div className="flex justify-between items-center gap-2 shrink-0">
        <div className="flex gap-2 bg-blue-950 p-1 rounded-xl shadow-md border border-white/10 flex-1">
          <button
            onClick={() => setMode('SINE')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs md:text-sm font-bold transition-all ${
              mode === 'SINE' ? 'bg-[#f4c430] text-[#0b2c5f] shadow-sm' : 'hover:bg-white/10'
            }`}
          >
            Sine Rule
          </button>
          <button
            onClick={() => setMode('COSINE')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs md:text-sm font-bold transition-all ${
              mode === 'COSINE' ? 'bg-[#f4c430] text-[#0b2c5f] shadow-sm' : 'hover:bg-white/10'
            }`}
          >
            Cosine Rule
          </button>
        </div>
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className="bg-blue-950 border border-white/20 text-white text-xs md:text-sm rounded-xl px-3 py-2 shadow-md outline-none focus:border-[#f4c430]"
        >
          <option value="m">m</option>
          <option value="cm">cm</option>
          <option value="units">units</option>
        </select>
      </div>

      {/* Content based on Mode */}
      {mode === 'EXPLORE' && (
        <div className="bg-blue-950 p-4 rounded-2xl shadow-xl flex-1 overflow-y-auto flex flex-col gap-4 border border-white/5">
          <div>
            <h2 className="text-lg md:text-xl font-bold mb-1 text-[#f4c430]">Explore Mode</h2>
            <p className="text-xs sm:text-sm text-white/80">
              Drag the vertices or enter values manually.
            </p>
          </div>

          <div className="bg-blue-900/50 p-3 rounded-xl border border-white/10">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-white/90">Manual Input</h3>
              <select
                value={inputType}
                onChange={(e) => {
                  setInputType(e.target.value as any);
                  setInputError('');
                }}
                className="bg-blue-950 border border-white/20 text-white text-xs rounded-lg px-2 py-1 outline-none focus:border-[#f4c430]"
              >
                <option value="FREE">Free Mode</option>
                <option value="SSS">SSS (3 Sides)</option>
                <option value="SAS">SAS (2 Sides, 1 Angle)</option>
                <option value="ASA">ASA/AAS (2 Angles, 1 Side)</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              {(inputType === 'FREE' || inputType === 'SSS' || inputType === 'SAS' || inputType === 'ASA') && (
                <div className={`flex items-center gap-2 ${inputType === 'ASA' ? 'opacity-50' : ''}`}>
                  <label className="text-xs font-bold w-4">a</label>
                  <input type="number" name="a" value={inputValues.a} onChange={handleInputChange} disabled={inputType === 'ASA'} className="w-full bg-blue-950 border border-white/20 rounded p-1 text-xs text-white outline-none focus:border-[#f4c430] disabled:bg-blue-900/30" placeholder={`Side a (${unit})`} />
                </div>
              )}
              {(inputType === 'FREE' || inputType === 'SAS' || inputType === 'ASA') && (
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold w-4">A</label>
                  <input type="number" name="A" value={inputValues.A} onChange={handleInputChange} className="w-full bg-blue-950 border border-white/20 rounded p-1 text-xs text-white outline-none focus:border-[#f4c430]" placeholder="Angle A (°)" />
                </div>
              )}
              {(inputType === 'FREE' || inputType === 'SSS' || inputType === 'SAS') && (
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold w-4">b</label>
                  <input type="number" name="b" value={inputValues.b} onChange={handleInputChange} className="w-full bg-blue-950 border border-white/20 rounded p-1 text-xs text-white outline-none focus:border-[#f4c430]" placeholder={`Side b (${unit})`} />
                </div>
              )}
              {(inputType === 'FREE' || inputType === 'ASA') && (
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold w-4">B</label>
                  <input type="number" name="B" value={inputValues.B} onChange={handleInputChange} className="w-full bg-blue-950 border border-white/20 rounded p-1 text-xs text-white outline-none focus:border-[#f4c430]" placeholder="Angle B (°)" />
                </div>
              )}
              {(inputType === 'FREE' || inputType === 'SSS' || inputType === 'SAS') && (
                <div className={`flex items-center gap-2 ${inputType === 'SAS' ? 'opacity-50' : ''}`}>
                  <label className="text-xs font-bold w-4">c</label>
                  <input type="number" name="c" value={inputValues.c} onChange={handleInputChange} disabled={inputType === 'SAS'} className="w-full bg-blue-950 border border-white/20 rounded p-1 text-xs text-white outline-none focus:border-[#f4c430] disabled:bg-blue-900/30" placeholder={`Side c (${unit})`} />
                </div>
              )}
              {(inputType === 'FREE' || inputType === 'ASA') && (
                <div className={`flex items-center gap-2 ${inputType === 'ASA' ? 'opacity-50' : ''}`}>
                  <label className="text-xs font-bold w-4">C</label>
                  <input type="number" name="C" value={inputValues.C} onChange={handleInputChange} disabled={inputType === 'ASA'} className="w-full bg-blue-950 border border-white/20 rounded p-1 text-xs text-white outline-none focus:border-[#f4c430] disabled:bg-blue-900/30" placeholder="Angle C (°)" />
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <input 
                type="checkbox" 
                id="autoCorrect" 
                checked={autoCorrect} 
                onChange={(e) => setAutoCorrect(e.target.checked)}
                className="w-3 h-3 accent-[#f4c430]"
              />
              <label htmlFor="autoCorrect" className="text-[10px] text-white/70 cursor-pointer">Auto-correct invalid values</label>
            </div>

            {inputError && <p className="text-red-400 text-[11px] mb-2 bg-red-900/20 p-2 rounded border border-red-900/50">{inputError}</p>}
            <div className="flex gap-2">
              <button onClick={handleApplyValues} className="flex-1 bg-[#f4c430] text-[#0b2c5f] font-bold py-1.5 rounded-lg text-xs hover:scale-[1.02] transition-transform">Apply Values</button>
              <button onClick={handleReset} className="flex-1 bg-white/10 text-white font-bold py-1.5 rounded-lg text-xs hover:bg-white/20 transition-colors">Reset</button>
            </div>
          </div>
        </div>
      )}

      {mode === 'SINE' && (
        <div className="bg-blue-950 border border-[#f4c430]/30 p-4 rounded-2xl shadow-xl flex-1 flex flex-col overflow-hidden">
          <div className="flex justify-between items-center mb-3 shrink-0">
            <h2 className="text-lg md:text-xl font-bold text-[#f4c430]">Sine Rule</h2>
            <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
              {(['A', 'B', 'C'] as const).map((ang) => (
                <button
                  key={ang}
                  onClick={() => setSelectedAngle(ang)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedAngle === ang ? 'bg-[#f4c430] text-[#0b2c5f] shadow-sm' : 'hover:bg-white/10'
                  }`}
                >
                  ∠{ang}
                </button>
              ))}
            </div>
          </div>
          
          <div className="text-xs sm:text-sm text-white/80 mb-4 bg-blue-900/50 p-3 rounded-xl border border-white/5 shrink-0">
            <Latex>{'$$\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C}$$'}</Latex>
          </div>

          <div className="bg-blue-900/80 rounded-xl p-3 text-yellow-300 text-xs sm:text-sm flex flex-col gap-2 shrink-0 overflow-y-auto border border-white/5 shadow-inner">
            <div className={`flex justify-between items-center bg-white/5 p-2 rounded-lg transition-all duration-300 ${selectedAngle === 'A' ? 'bg-white/10 scale-[1.02] border border-yellow-400/50 shadow-md' : 'border border-transparent'}`}>
              <Latex>{`$$\\frac{a}{\\sin A} = \\frac{${valA.toFixed(1)}}{\\sin(${angleA.toFixed(1)}^\\circ)}$$`}</Latex>
              <span className="font-bold text-white bg-blue-950 px-2 py-1 rounded-md border border-white/10">≈ {ratioA.toFixed(2)}</span>
            </div>
            <div className={`flex justify-between items-center bg-white/5 p-2 rounded-lg transition-all duration-300 ${selectedAngle === 'B' ? 'bg-white/10 scale-[1.02] border border-yellow-400/50 shadow-md' : 'border border-transparent'}`}>
              <Latex>{`$$\\frac{b}{\\sin B} = \\frac{${valB.toFixed(1)}}{\\sin(${angleB.toFixed(1)}^\\circ)}$$`}</Latex>
              <span className="font-bold text-white bg-blue-950 px-2 py-1 rounded-md border border-white/10">≈ {ratioB.toFixed(2)}</span>
            </div>
            <div className={`flex justify-between items-center bg-white/5 p-2 rounded-lg transition-all duration-300 ${selectedAngle === 'C' ? 'bg-white/10 scale-[1.02] border border-yellow-400/50 shadow-md' : 'border border-transparent'}`}>
              <Latex>{`$$\\frac{c}{\\sin C} = \\frac{${valC.toFixed(1)}}{\\sin(${angleC.toFixed(1)}^\\circ)}$$`}</Latex>
              <span className="font-bold text-white bg-blue-950 px-2 py-1 rounded-md border border-white/10">≈ {ratioC.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {mode === 'COSINE' && (
        <div className="bg-blue-950 border border-[#f4c430]/30 p-4 rounded-2xl shadow-xl flex-1 flex flex-col overflow-hidden">
          <div className="flex justify-between items-center mb-3 shrink-0">
            <h2 className="text-lg md:text-xl font-bold text-[#f4c430]">Cosine Rule</h2>
            <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
              {(['A', 'B', 'C'] as const).map((ang) => (
                <button
                  key={ang}
                  onClick={() => setSelectedAngle(ang)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedAngle === ang ? 'bg-[#f4c430] text-[#0b2c5f] shadow-sm' : 'hover:bg-white/10'
                  }`}
                >
                  ∠{ang}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs sm:text-sm text-white/80 mb-4 bg-blue-900/50 p-3 rounded-xl border border-white/5 shrink-0">
            {selectedAngle === 'A' && <Latex>{'$$a^2 = b^2 + c^2 - 2bc \\cos A$$'}</Latex>}
            {selectedAngle === 'B' && <Latex>{'$$b^2 = a^2 + c^2 - 2ac \\cos B$$'}</Latex>}
            {selectedAngle === 'C' && <Latex>{'$$c^2 = a^2 + b^2 - 2ab \\cos C$$'}</Latex>}
          </div>

          <div className="bg-blue-900/80 rounded-xl p-4 text-white text-xs sm:text-sm flex-1 overflow-y-auto border border-white/5 shadow-inner flex flex-col gap-3">
            <h3 className="text-[#f4c430] font-bold mb-1 border-b border-white/10 pb-2">Step-by-Step Solution</h3>
            
            {selectedAngle === 'A' && (
              <div className="flex flex-col gap-3 animate-in fade-in duration-500">
                <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                  <span className="text-white/50 text-[10px] uppercase tracking-wider mb-1 block">1. Substitute Values</span>
                  <Latex>{`$$a^2 = ${valB.toFixed(1)}^2 + ${valC.toFixed(1)}^2 - 2(${valB.toFixed(1)})(${valC.toFixed(1)}) \\cos(${angleA.toFixed(1)}^\\circ)$$`}</Latex>
                </div>
                <div className="flex justify-center text-white/30">↓</div>
                <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                  <span className="text-white/50 text-[10px] uppercase tracking-wider mb-1 block">2. Calculate Parts</span>
                  <Latex>{`$$a^2 = ${(valB**2).toFixed(1)} + ${(valC**2).toFixed(1)} - ${(2*valB*valC).toFixed(1)}(${cosA.toFixed(3)})$$`}</Latex>
                </div>
                <div className="flex justify-center text-white/30">↓</div>
                <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                  <span className="text-white/50 text-[10px] uppercase tracking-wider mb-1 block">3. Simplify</span>
                  <Latex>{`$$a^2 = ${(valB**2 + valC**2).toFixed(1)} - ${(2*valB*valC*cosA).toFixed(1)}$$`}</Latex>
                </div>
                <div className="flex justify-center text-white/30">↓</div>
                <div className="bg-blue-950 p-3 rounded-lg border border-yellow-400/50 shadow-md">
                  <span className="text-white/50 text-[10px] uppercase tracking-wider mb-1 block">4. Final Result</span>
                  <Latex>{`$$a = \\sqrt{${(valA**2).toFixed(1)}} \\approx \\mathbf{${valA.toFixed(1)} \\text{ ${showSimplifiedValues ? 'units' : unit}}}$$`}</Latex>
                </div>
              </div>
            )}

            {selectedAngle === 'B' && (
              <div className="flex flex-col gap-3 animate-in fade-in duration-500">
                <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                  <span className="text-white/50 text-[10px] uppercase tracking-wider mb-1 block">1. Substitute Values</span>
                  <Latex>{`$$b^2 = ${valA.toFixed(1)}^2 + ${valC.toFixed(1)}^2 - 2(${valA.toFixed(1)})(${valC.toFixed(1)}) \\cos(${angleB.toFixed(1)}^\\circ)$$`}</Latex>
                </div>
                <div className="flex justify-center text-white/30">↓</div>
                <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                  <span className="text-white/50 text-[10px] uppercase tracking-wider mb-1 block">2. Calculate Parts</span>
                  <Latex>{`$$b^2 = ${(valA**2).toFixed(1)} + ${(valC**2).toFixed(1)} - ${(2*valA*valC).toFixed(1)}(${cosB.toFixed(3)})$$`}</Latex>
                </div>
                <div className="flex justify-center text-white/30">↓</div>
                <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                  <span className="text-white/50 text-[10px] uppercase tracking-wider mb-1 block">3. Simplify</span>
                  <Latex>{`$$b^2 = ${(valA**2 + valC**2).toFixed(1)} - ${(2*valA*valC*cosB).toFixed(1)}$$`}</Latex>
                </div>
                <div className="flex justify-center text-white/30">↓</div>
                <div className="bg-blue-950 p-3 rounded-lg border border-yellow-400/50 shadow-md">
                  <span className="text-white/50 text-[10px] uppercase tracking-wider mb-1 block">4. Final Result</span>
                  <Latex>{`$$b = \\sqrt{${(valB**2).toFixed(1)}} \\approx \\mathbf{${valB.toFixed(1)} \\text{ ${showSimplifiedValues ? 'units' : unit}}}$$`}</Latex>
                </div>
              </div>
            )}

            {selectedAngle === 'C' && (
              <div className="flex flex-col gap-3 animate-in fade-in duration-500">
                <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                  <span className="text-white/50 text-[10px] uppercase tracking-wider mb-1 block">1. Substitute Values</span>
                  <Latex>{`$$c^2 = ${valA.toFixed(1)}^2 + ${valB.toFixed(1)}^2 - 2(${valA.toFixed(1)})(${valB.toFixed(1)}) \\cos(${angleC.toFixed(1)}^\\circ)$$`}</Latex>
                </div>
                <div className="flex justify-center text-white/30">↓</div>
                <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                  <span className="text-white/50 text-[10px] uppercase tracking-wider mb-1 block">2. Calculate Parts</span>
                  <Latex>{`$$c^2 = ${(valA**2).toFixed(1)} + ${(valB**2).toFixed(1)} - ${(2*valA*valB).toFixed(1)}(${cosC.toFixed(3)})$$`}</Latex>
                </div>
                <div className="flex justify-center text-white/30">↓</div>
                <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                  <span className="text-white/50 text-[10px] uppercase tracking-wider mb-1 block">3. Simplify</span>
                  <Latex>{`$$c^2 = ${(valA**2 + valB**2).toFixed(1)} - ${(2*valA*valB*cosC).toFixed(1)}$$`}</Latex>
                </div>
                <div className="flex justify-center text-white/30">↓</div>
                <div className="bg-blue-950 p-3 rounded-lg border border-yellow-400/50 shadow-md">
                  <span className="text-white/50 text-[10px] uppercase tracking-wider mb-1 block">4. Final Result</span>
                  <Latex>{`$$c = \\sqrt{${(valC**2).toFixed(1)}} \\approx \\mathbf{${valC.toFixed(1)} \\text{ ${showSimplifiedValues ? 'units' : unit}}}$$`}</Latex>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
