'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { BrainCircuit } from 'lucide-react';

const dotVariants: Variants = {
  initial: { y: 0 },
  animate: (i: number) => ({
    y: [0, -6, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      repeatDelay: 0.15,
      delay: i * 0.15,
      type: 'spring',
      stiffness: 300,
      damping: 10,
    },
  }),
};

export default function TypingIndicator() {
  return (
    <motion.div
      className="flex justify-start"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className="glass backdrop-blur-xl border border-slate-700/50 rounded-full px-5 py-3 flex items-center gap-3 shadow-lg shadow-cyan-500/5">
        {/* Brain icon */}
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <BrainCircuit className="w-4 h-4 text-cyan-400" />
        </motion.div>

        <span className="text-xs font-medium text-cyan-400/80 mr-1">Thinking</span>

        {/* Bouncing dots */}
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-cyan-400"
              variants={dotVariants}
              initial="initial"
              animate="animate"
              custom={i}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
