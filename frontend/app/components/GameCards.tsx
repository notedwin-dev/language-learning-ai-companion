'use client';

import React from 'react';
import { motion } from 'framer-motion';

type City = {
  id: string;
  name: string;
  language: string;
  flag: string;
  description: string;
  landmark: string;
  bgColor: string;
  textColor: string;
  specialties: string[];
  difficulty: string;
  phrases: string[];
};

type GameCardsProps = {
  cities: City[];
  onStartGame: (cityId: string) => void;
};

const GameCards = ({ cities, onStartGame }: GameCardsProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {cities.map((city, index) => (
        <motion.div
          key={city.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 + index * 0.2 }}
          whileHover={{ y: -10 }}
          className="bg-white/5 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/20 hover:border-white/40 shadow-xl"
        >
          <div className={`relative h-48 bg-gradient-to-br ${city.bgColor} flex items-center justify-center`}>
            <div className="text-8xl">{city.flag}</div>
            <div className="absolute top-4 right-4 text-4xl">{city.landmark}</div>
            <div className="absolute bottom-4 left-4 bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
              <span className={`text-sm font-semibold ${city.textColor}`}>{city.language}</span>
            </div>
          </div>
          
          <div className="p-6">
            <h3 className="text-2xl font-bold mb-2">{city.name}</h3>
            <div className="flex items-center mb-4">
              <span className={`px-2 py-1 rounded-full text-xs mr-2 ${
                city.difficulty === 'Easy' ? 'bg-green-900/50 text-green-400' : 
                city.difficulty === 'Medium' ? 'bg-yellow-900/50 text-yellow-400' : 
                'bg-red-900/50 text-red-400'
              }`}>
                {city.difficulty}
              </span>
              <span className="text-gray-400 text-sm">Difficulty</span>
            </div>
            <p className="text-gray-300 mb-6 text-sm leading-relaxed">{city.description}</p>
            
            <div className="mb-6">
              <h4 className="font-semibold mb-2 text-pink-400">Practice Locations:</h4>
              <div className="grid grid-cols-2 gap-2">
                {city.specialties.map((specialty, index) => (
                  <div key={index} className="bg-white/10 rounded-lg px-3 py-1 text-xs text-center">
                    {specialty}
                  </div>
                ))}
              </div>
            </div>
            
            <button
              onClick={() => onStartGame(city.id)}
              className={`w-full bg-gradient-to-r ${city.bgColor} text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg`}
            >
              Start Adventure 🎮
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default GameCards;