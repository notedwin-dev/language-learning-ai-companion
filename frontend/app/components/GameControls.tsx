'use client';

import React from 'react';
import { motion } from 'framer-motion';

type GameControlsProps = {
  cityId: string | null;
};

const GameControls = ({ cityId }: GameControlsProps) => {
  return (
    <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 mb-6 border border-gray-700/50 shadow-lg">
      <h3 className="text-white font-bold mb-3 text-lg">Controls:</h3>
      <div className="grid grid-cols-2 gap-4">
        <motion.div 
          whileHover={{ x: 3 }}
          className="flex items-center"
        >
          <div className="game-control mr-3 shadow-md">
            <span>W</span>
          </div>
          <span className="text-gray-300">Move Up</span>
        </motion.div>
        <motion.div 
          whileHover={{ x: 3 }}
          className="flex items-center"
        >
          <div className="game-control mr-3 shadow-md">
            <span>S</span>
          </div>
          <span className="text-gray-300">Move Down</span>
        </motion.div>
        <motion.div 
          whileHover={{ x: 3 }}
          className="flex items-center"
        >
          <div className="game-control mr-3 shadow-md">
            <span>A</span>
          </div>
          <span className="text-gray-300">Move Left</span>
        </motion.div>
        <motion.div 
          whileHover={{ x: 3 }}
          className="flex items-center"
        >
          <div className="game-control mr-3 shadow-md">
            <span>D</span>
          </div>
          <span className="text-gray-300">Move Right</span>
        </motion.div>
        <motion.div 
          whileHover={{ x: 3 }}
          className="flex items-center"
        >
          <div className="game-control mr-3 shadow-md">
            <span>E</span>
          </div>
          <span className="text-gray-300">Interact</span>
        </motion.div>
        <motion.div 
          whileHover={{ x: 3 }}
          className="flex items-center"
        >
          <div className="game-control mr-3 shadow-md">
            <span>ESC</span>
          </div>
          <span className="text-gray-300">Close Dialog</span>
        </motion.div>
      </div>
    </div>
  );
};

export default GameControls;