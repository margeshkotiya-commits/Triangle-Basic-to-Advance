"use client";

import { useState } from 'react';
import { TrigSimulation } from '@/components/TrigSimulation';
import { IntroScreen } from '@/components/IntroScreen';
import { AnimatePresence, motion } from 'motion/react';

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <main className="min-h-screen bg-[#0b2c5f] text-white font-sans selection:bg-[#f4c430] selection:text-[#0b2c5f] overflow-hidden">
      <AnimatePresence mode="wait">
        {showIntro ? (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
            className="absolute inset-0 z-50"
          >
            <IntroScreen onStart={() => setShowIntro(false)} />
          </motion.div>
        ) : (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.5, delay: 0.2 } }}
            className="absolute inset-0"
          >
            <TrigSimulation />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}