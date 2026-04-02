'use client';

import React, { useState, useEffect } from 'react';

interface OnboardingProps {
  onClose: () => void;
}

const steps = [
  {
    title: 'Interactive Triangle',
    content: 'Drag the yellow points (A, B, C) to change the shape of the triangle.',
    targetId: 'triangle-container',
    position: 'center',
  },
  {
    title: 'Angles & Sides',
    content: 'Watch how the angles and side lengths update in real-time as you drag.',
    targetId: 'triangle-container',
    position: 'center',
  },
  {
    title: 'Mode Toggle',
    content: 'Switch between Sine Rule and Cosine Rule modes to see different formulas in action.',
    targetId: 'control-panel',
    position: 'top',
  },
  {
    title: 'Live Formulas',
    content: 'The formula box will show step-by-step calculations based on your triangle.',
    targetId: 'control-panel',
    position: 'bottom',
  },
];

export default function Onboarding({ onClose }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [style, setStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    const updatePosition = () => {
      const step = steps[currentStep];
      const target = document.getElementById(step.targetId);
      
      if (target) {
        const rect = target.getBoundingClientRect();
        
        // Default to center of screen if mobile, or position near target on desktop
        const isMobile = window.innerWidth < 1024;
        
        if (isMobile) {
          setStyle({
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          });
        } else {
          if (step.position === 'center') {
            setStyle({
              top: rect.top + rect.height / 2,
              left: rect.left + rect.width / 2,
              transform: 'translate(-50%, -50%)',
            });
          } else if (step.position === 'top') {
            setStyle({
              top: rect.top + 100,
              left: rect.left + rect.width / 2,
              transform: 'translate(-50%, -50%)',
            });
          } else if (step.position === 'bottom') {
            setStyle({
              top: rect.bottom - 100,
              left: rect.left + rect.width / 2,
              transform: 'translate(-50%, -50%)',
            });
          }
        }
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-black/50 pointer-events-auto transition-opacity duration-300" />
      
      {/* Tooltip Box */}
      <div 
        className="absolute bg-[#0b2c5f] border-2 border-[#f4c430] p-6 rounded-2xl shadow-2xl w-[90%] max-w-sm pointer-events-auto transition-all duration-500 ease-in-out z-50"
        style={style}
      >
        <div className="mb-2 flex justify-between items-center">
          <span className="text-[#f4c430] font-bold text-sm tracking-wider uppercase">
            Step {currentStep + 1} of {steps.length}
          </span>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            ✕
          </button>
        </div>
        
        <h3 className="text-xl font-bold text-white mb-3">{steps[currentStep].title}</h3>
        <p className="text-white/80 text-sm mb-6 leading-relaxed">
          {steps[currentStep].content}
        </p>
        
        <div className="flex justify-between items-center">
          <button 
            onClick={onClose}
            className="text-sm text-white/60 hover:text-white transition-colors"
          >
            Skip Tutorial
          </button>
          <button 
            onClick={handleNext}
            className="bg-[#f4c430] text-[#0b2c5f] px-6 py-2 rounded-lg font-bold hover:bg-yellow-300 transition-colors shadow-lg"
          >
            {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
