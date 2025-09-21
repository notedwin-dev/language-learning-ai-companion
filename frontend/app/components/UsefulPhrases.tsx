'use client';

import React from 'react';
import { motion } from 'framer-motion';

type PhrasesProps = {
  phrases: string[];
};

const UsefulPhrases = ({ phrases }: PhrasesProps) => {
  return (
    <div className="bg-gray-900/50 rounded-lg p-4 mb-6">
      <h3 className="text-white font-bold mb-2 text-lg">Useful Phrases:</h3>
      <div className="grid grid-cols-1 gap-2">
        {phrases.map((phrase, index) => (
          <motion.div 
            key={index} 
            className="text-gray-300 bg-gray-800/50 rounded p-2"
            whileHover={{ backgroundColor: 'rgba(75, 85, 99, 0.5)' }}
            transition={{ duration: 0.2 }}
          >
            {phrase}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default UsefulPhrases;