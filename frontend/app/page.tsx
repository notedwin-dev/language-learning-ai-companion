'use client';

import React, { useState } from 'react';

export default function Page() {
  const [selectedCity, setSelectedCity] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);

  const cities = [
    {
      id: 'chengdu',
      name: 'Chengdu, China',
      language: 'Mandarin (普通话)',
      flag: '🇨🇳',
      description: 'Explore the vibrant streets of Chengdu! Practice ordering spicy Sichuan food, bargaining at local markets, and asking for directions to pandas!',
      landmark: '🐼',
      specialties: ['Hotpot restaurants', 'Tea houses', 'Street markets', 'Panda research center']
    },
    {
      id: 'kuala-lumpur',
      name: 'Kuala Lumpur, Malaysia',
      language: 'Bahasa Melayu',
      flag: '🇲🇾',
      description: 'Navigate through KL\'s bustling streets! Practice shopping at local kedai, ordering at mamak stalls, and exploring Petaling Street.',
      landmark: '🏢',
      specialties: ['Mamak stalls', 'Shopping malls', 'Street food', 'Local kedai']
    },
    {
      id: 'hong-kong',
      name: 'Hong Kong',
      language: 'Cantonese (廣東話)',
      flag: '🇭🇰',
      description: 'Experience the energy of Hong Kong! Practice ordering dim sum, shopping in wet markets, and taking the MTR around the city.',
      landmark: '🏙️',
      specialties: ['Dim sum restaurants', 'Wet markets', 'MTR stations', 'Street vendors']
    }
  ];

  const startGame = (cityId) => {
    setSelectedCity(cityId);
    setGameStarted(true);
  };

  if (gameStarted) {
    const city = cities.find(c => c.id === selectedCity);
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 max-w-3xl mx-auto text-center w-full">
          <h2 className="text-2xl font-bold mb-4">Welcome to {city?.name}!</h2>
          <p className="text-gray-600 mb-6">
            Use arrow keys or WASD to move your character and explore. Approach NPCs to start conversations.
          </p>
          
          {/* Game Canvas Container */}
          <div className="mb-6">
            <div className="bg-black p-2 rounded-lg inline-block">
              {/* Import and render the GameEngine component */}
              {(() => {
                try {
                  const GameEngine = require('./game/GameEngine').default;
                  return <GameEngine cityId={selectedCity} />;
                } catch (error) {
                  console.error('Failed to load game engine:', error);
                  return (
                    <div className="p-8 text-white">
                      <p>Failed to load the game engine. Please try again.</p>
                    </div>
                  );
                }
              })()}
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <button 
              onClick={() => {setGameStarted(false); setSelectedCity(null);}}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Back to City Selection
            </button>
            
            <div className="flex items-center">
              <span className="text-2xl mr-2">{city?.flag}</span>
              <span className="text-lg font-medium text-gray-700">{city?.language}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
            🌏 Language Quest
          </h1>
          <p className="text-2xl mb-4 text-gray-300">
            2D RPG Language Learning Adventure
          </p>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            Explore authentic cities, interact with locals, and master languages through immersive gameplay. 
            Walk the streets, visit shops, order food, and have real conversations with AI-powered NPCs!
          </p>
        </div>

        {/* Game Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
            <div className="text-4xl mb-4">🚶‍♂️</div>
            <h3 className="text-xl font-bold mb-2">Explore Cities</h3>
            <p className="text-gray-300">Walk around authentic neighborhoods and discover local culture</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-bold mb-2">Talk to NPCs</h3>
            <p className="text-gray-300">Practice real conversations with AI-powered locals</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
            <div className="text-4xl mb-4">🎤</div>
            <h3 className="text-xl font-bold mb-2">Voice Practice</h3>
            <p className="text-gray-300">Use your voice to interact and improve pronunciation</p>
          </div>
        </div>

        {/* City Selection */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-8">Choose Your Adventure</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {cities.map((city) => (
              <div
                key={city.id}
                className="bg-white/5 backdrop-blur-lg rounded-2xl overflow-hidden hover:scale-105 transform transition-all duration-300 border border-white/20 hover:border-white/40"
              >
                <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <div className="text-8xl">{city.flag}</div>
                  <div className="absolute top-4 right-4 text-4xl">{city.landmark}</div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2">{city.name}</h3>
                  <p className="text-lg text-yellow-400 mb-4 font-medium">{city.language}</p>
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
                    onClick={() => startGame(city.id)}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
                  >
                    Start Adventure 🎮
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-8">How to Play</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-purple-500 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
              <h4 className="font-bold mb-2">Choose City</h4>
              <p className="text-sm text-gray-300">Pick your language and destination</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-500 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
              <h4 className="font-bold mb-2">Explore</h4>
              <p className="text-sm text-gray-300">Walk around using arrow keys</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-500 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
              <h4 className="font-bold mb-2">Interact</h4>
              <p className="text-sm text-gray-300">Talk to NPCs and practice scenarios</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-500 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">4</div>
              <h4 className="font-bold mb-2">Learn</h4>
              <p className="text-sm text-gray-300">Master the language through play</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}