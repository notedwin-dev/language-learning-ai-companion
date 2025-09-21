'use client';

import React from 'react';
import { motion } from 'framer-motion';

type LoadingScreenProps = {
  city: {
    name: string;
    flag: string;
    landmark: string;
    bgColor: string;
    textColor: string;
  } | null;
};

const LoadingScreen = ({ city }: LoadingScreenProps) => {
  if (!city) return null;
  
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <h2 className="text-4xl font-bold mb-4 text-white">
          Loading <span className={`${city.textColor}`}>{city.name}</span>
        </h2>
        <div className="flex justify-center mb-4">
          <div className="animate-bounce text-6xl mr-2">{city.flag}</div>
          <div className="animate-bounce text-6xl delay-100">{city.landmark}</div>
        </div>
        <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.5 }}
            className={`h-full bg-gradient-to-r ${city.bgColor}`}
          />
        </div>
        <p className="text-gray-400 mt-4">Preparing your language adventure...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;