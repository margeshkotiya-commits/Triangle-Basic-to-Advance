"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "motion/react";

interface IntroScreenProps {
  onStart: () => void;
}

export function IntroScreen({ onStart }: IntroScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Background animated triangles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    const render = () => {
      time += 0.005;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw subtle geometric grid
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 1;
      const gridSize = 100;
      
      ctx.beginPath();
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
      }
      ctx.stroke();

      // Draw animated triangle outlines
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const radius = Math.min(canvas.width, canvas.height) * 0.4;

      for (let i = 0; i < 3; i++) {
        const offset = i * (Math.PI * 2) / 3;
        const currentAngle = time + offset;
        
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(currentAngle * 0.2);
        
        ctx.beginPath();
        for (let j = 0; j < 3; j++) {
          const angle = (j * Math.PI * 2) / 3;
          const px = Math.cos(angle) * (radius + Math.sin(time * 2 + i) * 20);
          const py = Math.sin(angle) * (radius + Math.sin(time * 2 + i) * 20);
          if (j === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        
        ctx.strokeStyle = `rgba(244, 196, 48, ${0.05 + i * 0.02})`;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0b2c5f] flex flex-col items-center justify-center selection:bg-[#f4c430] selection:text-[#0b2c5f]">
      {/* Background Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Logo Area (Top Center) */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center"
      >
        <img 
          src="https://i.postimg.cc/vmPQhdZC/SEZ_1_(1).png" 
          alt="Shreeji Education Zone" 
          className="h-28 md:h-32 object-contain"
        />
      </motion.div>

      {/* Main Content */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center text-center px-6 max-w-3xl"
      >
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
          Master Triangle Visually
        </h1>
        
        <h2 className="text-xl md:text-2xl text-[#f4c430] font-medium mb-6">
          Understand Sine, Cosine & Triangle Theorems Interactively
        </h2>
        
        <p className="text-base md:text-lg text-white/90 mb-12 max-w-2xl leading-relaxed">
          Explore triangles, learn concepts step-by-step, and visualize formulas like never before.
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="bg-[#f4c430] text-[#0b2c5f] font-bold text-lg px-10 py-4 rounded-xl shadow-[0_0_20px_rgba(244,196,48,0.3)] hover:shadow-[0_0_30px_rgba(244,196,48,0.6)] transition-shadow duration-300"
        >
          Start Learning
        </motion.button>

        <p className="mt-8 text-sm text-white/50 font-medium tracking-wide">
          Practice and Exam Modes unlock after learning
        </p>
      </motion.div>
    </div>
  );
}
