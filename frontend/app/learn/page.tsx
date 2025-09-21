'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import ScenarioEngine from '../components/ScenarioEngine';

export default function LearnPage() {
  const [selectedLanguage, setSelectedLanguage] = useState<'mandarin' | 'malay' | 'cantonese' | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<'restaurant' | 'market' | 'directions' | null>(null);
  const [showScenario, setShowScenario] = useState(false);
  const [completedScenarios, setCompletedScenarios] = useState<Array<{ language: string; scenario: string; score: number }>>([]);

  const languages = [
    {
      id: 'mandarin' as const,
      name: 'Mandarin Chinese',
      flag: '🇨🇳',
      city: 'Chengdu',
      description: 'Learn Mandarin through authentic Sichuan experiences'
    },
    {
      id: 'malay' as const,
      name: 'Bahasa Melayu',
      flag: '🇲🇾',
      city: 'Kuala Lumpur',
      description: 'Practice Malay in bustling Malaysian markets and cafes'
    },
    {
      id: 'cantonese' as const,
      name: 'Cantonese',
      flag: '🇭🇰',
      city: 'Hong Kong',
      description: 'Experience Cantonese culture in Hong Kong\'s vibrant streets'
    }
  ];

  const scenarios = [
    {
      id: 'restaurant' as const,
      name: 'Restaurant Dining',
      emoji: '🍜',
      description: 'Order food, ask about dishes, and handle dining situations',
      difficulty: 'Beginner',
      available: true
    },
    {
      id: 'market' as const,
      name: 'Market Shopping',
      emoji: '🛒',
      description: 'Bargain prices, ask about products, and make purchases',
      difficulty: 'Intermediate',
      available: false // Coming soon
    },
    {
      id: 'directions' as const,
      name: 'Getting Directions',
      emoji: '🗺️',
      description: 'Ask for directions, understand locations, use public transport',
      difficulty: 'Beginner',
      available: false // Coming soon
    }
  ];

  const handleScenarioComplete = (score: number) => {
    if (selectedLanguage && selectedScenario) {
      setCompletedScenarios(prev => [
        ...prev,
        {
          language: selectedLanguage,
          scenario: selectedScenario,
          score
        }
      ]);
      setShowScenario(false);
      setSelectedScenario(null);
    }
  };

  const handleScenarioExit = () => {
    setShowScenario(false);
    setSelectedScenario(null);
  };

  const startScenario = (language: typeof selectedLanguage, scenario: typeof selectedScenario) => {
    if (language && scenario) {
      setSelectedLanguage(language);
      setSelectedScenario(scenario);
      setShowScenario(true);
    }
  };

  if (showScenario && selectedLanguage && selectedScenario) {
    return (
      <ScenarioEngine 
        language={selectedLanguage}
        scenario={selectedScenario}
        onComplete={handleScenarioComplete}
        onExit={handleScenarioExit}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white">
      <NavBar />
      
      <div className="container mx-auto px-4 py-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent drop-shadow-lg">
            Start Learning
          </h1>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Choose your language and scenario to begin your immersive learning journey. Practice real conversations in authentic cultural settings.
          </p>
        </motion.div>

        {/* Language Selection */}
        {!selectedLanguage && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold text-center mb-8">Choose Your Language</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {languages.map((language, index) => (
                <motion.button
                  key={language.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                  onClick={() => setSelectedLanguage(language.id)}
                  className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all hover:transform hover:scale-[1.02] hover:shadow-xl"
                >
                  <div className="text-6xl mb-4">{language.flag}</div>
                  <h3 className="text-xl font-bold mb-2">{language.name}</h3>
                  <p className="text-purple-300 mb-2">{language.city}</p>
                  <p className="text-gray-300 text-sm">{language.description}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Scenario Selection */}
        {selectedLanguage && !selectedScenario && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Choose Your Scenario</h2>
              <p className="text-gray-300">
                Learning: <span className="text-purple-400 font-bold">
                  {languages.find(l => l.id === selectedLanguage)?.name}
                </span> in <span className="text-blue-400 font-bold">
                  {languages.find(l => l.id === selectedLanguage)?.city}
                </span>
              </p>
              <button 
                onClick={() => setSelectedLanguage(null)}
                className="mt-2 text-gray-400 hover:text-white text-sm underline"
              >
                Change Language
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {scenarios.map((scenario, index) => (
                <motion.div
                  key={scenario.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 ${
                    scenario.available 
                      ? 'hover:border-purple-500/50 cursor-pointer hover:transform hover:scale-[1.02] hover:shadow-xl' 
                      : 'opacity-50 cursor-not-allowed'
                  } transition-all`}
                  onClick={() => scenario.available && setSelectedScenario(scenario.id)}
                >
                  <div className="text-4xl mb-4">{scenario.emoji}</div>
                  <h3 className="text-xl font-bold mb-2">{scenario.name}</h3>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      scenario.difficulty === 'Beginner' ? 'bg-green-600' : 
                      scenario.difficulty === 'Intermediate' ? 'bg-yellow-600' : 'bg-red-600'
                    }`}>
                      {scenario.difficulty}
                    </span>
                    {!scenario.available && (
                      <span className="text-xs text-gray-400">Coming Soon</span>
                    )}
                  </div>
                  <p className="text-gray-300 text-sm mb-4">{scenario.description}</p>
                  
                  {scenario.available && (
                    <motion.button
                      whileHover={{ scale: 1.05 }} 
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        startScenario(selectedLanguage, scenario.id);
                      }}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg shadow-lg hover:shadow-xl transition-all font-medium"
                    >
                      Start Scenario
                    </motion.button>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Progress & Achievements */}
        {completedScenarios.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
          >
            <h3 className="text-2xl font-bold mb-6 text-center">🏆 Your Achievements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedScenarios.map((completed, index) => (
                <div key={index} className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium capitalize">{completed.language}</span>
                    <span className="text-yellow-400 font-bold">{completed.score} pts</span>
                  </div>
                  <p className="text-gray-300 text-sm capitalize">{completed.scenario} Scenario</p>
                  <div className="mt-2">
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                        style={{ width: `${Math.min((completed.score / 100) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}