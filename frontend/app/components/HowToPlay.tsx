'use client';

import React from 'react';
import { motion } from 'framer-motion';

type HowToPlayProps = {
  steps: Array<{
    number: number;
    title: string;
    description: string;
  }>;
};

const HowToPlay = ({ steps }: HowToPlayProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.8 }}
      className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 max-w-4xl mx-auto border border-white/20 shadow-xl"
    >
      <h3 className="text-3xl font-bold text-center mb-8">How to Play</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {steps.map((step) => (
          <div key={step.number} className="text-center">
            <div className="bg-purple-500 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">{step.number}</div>
            <h4 className="font-bold mb-2">{step.title}</h4>
            <p className="text-sm text-gray-300">{step.description}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default HowToPlay;