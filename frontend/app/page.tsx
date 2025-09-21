'use client';

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import GameCards from "./components/GameCards";
import GameControls from "./components/GameControls";
import UsefulPhrases from "./components/UsefulPhrases";
import FeatureCard from "./components/FeatureCard";
import HowToPlay from "./components/HowToPlay";
import LoadingScreen from "./components/LoadingScreen";
import { BackIcon } from "./components/Icons";

export default function Page() {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Preload game assets
  useEffect(() => {
    if (selectedCity && loading) {
      const timer = setTimeout(() => {
        setLoading(false);
        setGameStarted(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [selectedCity, loading]);

  const cities = [
    {
      id: "chengdu",
      name: "Chengdu, China",
      language: "Mandarin (普通话)",
      flag: "🇨🇳",
      description:
        "Explore the vibrant streets of Chengdu! Practice ordering spicy Sichuan food, bargaining at local markets, and asking for directions to pandas!",
      landmark: "🐼",
      bgColor: "from-red-600 to-red-800",
      textColor: "text-yellow-300",
      specialties: [
        "Hotpot restaurants",
        "Tea houses",
        "Street markets",
        "Panda research center",
      ],
      difficulty: "Medium",
      phrases: [
        "你好 (Nǐ hǎo) - Hello",
        "谢谢 (Xièxiè) - Thank you",
        "我要这个 (Wǒ yào zhège) - I want this",
      ],
    },
    {
      id: "kuala-lumpur",
      name: "Kuala Lumpur, Malaysia",
      language: "Bahasa Melayu",
      flag: "🇲🇾",
      description:
        "Navigate through KL's bustling streets! Practice shopping at local kedai, ordering at mamak stalls, and exploring Petaling Street.",
      landmark: "🏢",
      bgColor: "from-blue-600 to-blue-800",
      textColor: "text-yellow-400",
      specialties: [
        "Mamak stalls",
        "Shopping malls",
        "Street food",
        "Local kedai",
      ],
      difficulty: "Easy",
      phrases: [
        "Selamat pagi - Good morning",
        "Terima kasih - Thank you",
        "Berapa harga ini? - How much is this?",
      ],
    },
    {
      id: "hong-kong",
      name: "Hong Kong",
      language: "Cantonese (廣東話)",
      flag: "🇭🇰",
      description:
        "Experience the energy of Hong Kong! Practice ordering dim sum, shopping in wet markets, and taking the MTR around the city.",
      landmark: "🏙️",
      bgColor: "from-purple-600 to-purple-800",
      textColor: "text-pink-300",
      specialties: [
        "Dim sum restaurants",
        "Wet markets",
        "MTR stations",
        "Street vendors",
      ],
      difficulty: "Hard",
      phrases: [
        "你好 (Nei5 hou2) - Hello",
        "唔該 (M4 goi1) - Please/Thank you",
        "幾多錢? (Gei2 do1 cin2?) - How much?",
      ],
    },
  ];

  const features = [
    {
      icon: "🚶‍♂️",
      title: "Explore Cities",
      description:
        "Walk around authentic neighborhoods and discover local culture",
    },
    {
      icon: "💬",
      title: "Talk to NPCs",
      description: "Practice real conversations with AI-powered locals",
    },
    {
      icon: "🎤",
      title: "Voice Practice",
      description: "Use your voice to interact and improve pronunciation",
    },
  ];

  const howToPlaySteps = [
    {
      number: 1,
      title: "Choose City",
      description: "Pick your language and destination",
    },
    {
      number: 2,
      title: "Explore",
      description: "Walk around using arrow keys or WASD",
    },
    {
      number: 3,
      title: "Interact",
      description: "Talk to NPCs and practice scenarios",
    },
    {
      number: 4,
      title: "Learn",
      description: "Master the language through play",
    },
  ];

  const startGame = (cityId: string) => {
    setSelectedCity(cityId);
    setLoading(true);
  };

  if (loading) {
    const city = cities.find((c) => c.id === selectedCity);
    return <LoadingScreen city={city || null} />;
  }

  if (gameStarted) {
    const city = cities.find((c) => c.id === selectedCity);
    if (!city) return null;

    return (
      <div className="min-h-screen bg-gray-900 flex flex-col">
        <NavBar />

        <div className="flex-grow container mx-auto px-4 py-20">
          <div className="bg-gray-800 rounded-lg p-8 max-w-4xl mx-auto w-full shadow-2xl border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-white">
                <span className="text-2xl mr-2">{city.flag}</span> {city.name}
              </h2>
              <div
                className={`px-4 py-1 rounded-full ${city.textColor} bg-gray-900/50`}>
                {city.language}
              </div>
            </div>

            {/* Game Canvas Container */}
            <div className="mb-6 flex justify-center">
              <div className="bg-black p-2 rounded-lg shadow-lg border border-gray-700">
                {(() => {
                  try {
                    const GameEngine = require("./game/GameEngine").default;
                    return <GameEngine cityId={selectedCity} />;
                  } catch (error) {
                    console.error("Failed to load game engine:", error);
                    return (
                      <div className="p-8 text-white w-[480px] h-[320px] flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-red-500 text-2xl mb-2">⚠️</p>
                          <p>
                            Failed to load the game engine. Please try again.
                          </p>
                        </div>
                      </div>
                    );
                  }
                })()}
              </div>
            </div>

            {/* Game controls guide */}
            <GameControls cityId={selectedCity} />

            {/* Useful phrases */}
            <UsefulPhrases phrases={city.phrases} />

            <div className="flex justify-between items-center">
              <button
                onClick={() => {
                  setGameStarted(false);
                  setSelectedCity(null);
                }}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-full transition-colors duration-300 flex items-center">
                <BackIcon />
                <span className="ml-1">Back to City Selection</span>
              </button>

              <div className="bg-gray-900/50 px-3 py-1 rounded-full">
                <span className="text-gray-400 text-sm">Difficulty: </span>
                <span
                  className={`font-medium ${
                    city.difficulty === "Easy"
                      ? "text-green-400"
                      : city.difficulty === "Medium"
                      ? "text-yellow-400"
                      : "text-red-400"
                  }`}>
                  {city.difficulty}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white">
      <NavBar />

      <div className="absolute w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-pink-500 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-500 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-6000"></div>
      </div>

      <div className="container mx-auto px-4 py-24 relative z-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent drop-shadow-lg">
            Language Quest
          </h1>
          <div className="text-5xl mb-6 flex justify-center gap-3">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}>
              🌏
            </motion.span>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}>
              🎮
            </motion.span>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7, type: "spring" }}>
              🗣️
            </motion.span>
          </div>
          <p className="text-2xl mb-4 text-gray-300">
            2D RPG Language Learning Adventure
          </p>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            Explore authentic cities, interact with locals, and master languages
            through immersive gameplay. Walk the streets, visit shops, order
            food, and have real conversations with AI-powered NPCs!
          </p>
        </motion.div>

        {/* Game Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </motion.div>

        {/* City Selection */}
        <motion.div
          id="cities"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-2">Choose Your Adventure</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Select a city to begin your language learning journey. Each location
            offers unique cultural experiences and language challenges.
          </p>

          <GameCards
            cities={cities}
            onStartGame={startGame}
          />

          <div className="mt-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => (window.location.href = "/learn")}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all font-bold text-lg">
              🎯 Try Interactive Learning Scenarios
            </motion.button>
            <p className="text-gray-400 text-sm mt-2">
              Experience realistic conversations without game setup
            </p>
          </div>
        </motion.div>

        {/* How It Works */}
        <HowToPlay steps={howToPlaySteps} />
      </div>

      <Footer />
    </div>
  );
}