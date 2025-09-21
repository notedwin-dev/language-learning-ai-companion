'use client';

import React from 'react';
import { motion } from 'framer-motion';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

export default function LanguagesPage() {
  const languages = [
    {
      id: 'mandarin',
      name: 'Mandarin Chinese',
      native: '普通话 (Pǔtōnghuà)',
      flag: '🇨🇳',
      speakers: '918 million',
      difficulty: 'Very Hard',
      difficultyLevel: 5,
      features: [
        'Four tones that change word meaning',
        'Character-based writing system',
        'No verb conjugation',
        'No plurals',
        'Measure words for counting objects',
      ],
      basicPhrases: [
        { phrase: '你好', pronunciation: 'Nǐ hǎo', meaning: 'Hello' },
        { phrase: '谢谢', pronunciation: 'Xièxiè', meaning: 'Thank you' },
        { phrase: '对不起', pronunciation: 'Duìbùqǐ', meaning: 'Sorry' },
        { phrase: '再见', pronunciation: 'Zàijiàn', meaning: 'Goodbye' },
      ],
    },
    {
      id: 'malay',
      name: 'Bahasa Melayu',
      native: 'Bahasa Melayu',
      flag: '🇲🇾',
      speakers: '77 million',
      difficulty: 'Easy',
      difficultyLevel: 2,
      features: [
        'Latin alphabet with consistent pronunciation',
        'Straightforward grammar structure',
        'No grammatical gender',
        'No verb conjugation for tenses',
        'Word repetition to form plurals',
      ],
      basicPhrases: [
        { phrase: 'Selamat pagi', pronunciation: 'Se-la-mat pa-gi', meaning: 'Good morning' },
        { phrase: 'Terima kasih', pronunciation: 'Te-ri-ma ka-sih', meaning: 'Thank you' },
        { phrase: 'Maaf', pronunciation: 'Ma-af', meaning: 'Sorry' },
        { phrase: 'Jumpa lagi', pronunciation: 'Jum-pa la-gi', meaning: 'See you again' },
      ],
    },
    {
      id: 'cantonese',
      name: 'Cantonese',
      native: '廣東話 (Gwóngdūng wá)',
      flag: '🇭🇰',
      speakers: '85 million',
      difficulty: 'Very Hard',
      difficultyLevel: 5,
      features: [
        'Six to nine tones depending on region',
        'Character-based writing system',
        'Different vocabulary from Mandarin',
        'Colloquial expressions differ from written form',
        'Complex classifier system',
      ],
      basicPhrases: [
        { phrase: '你好', pronunciation: 'Néih hóu', meaning: 'Hello' },
        { phrase: '唔該', pronunciation: 'M̀h gōi', meaning: 'Please/Thank you (for service)' },
        { phrase: '對不起', pronunciation: 'Deui m̀h jyuh', meaning: 'Sorry' },
        { phrase: '再見', pronunciation: 'Joih gin', meaning: 'Goodbye' },
      ],
    },
  ];

  const difficultyBar = (level) => {
    return (
      <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
        <div 
          className={`h-2 rounded-full ${
            level === 1 ? 'bg-green-500' :
            level === 2 ? 'bg-green-400' :
            level === 3 ? 'bg-yellow-400' :
            level === 4 ? 'bg-orange-400' :
            'bg-red-500'
          }`}
          style={{ width: `${level * 20}%` }}
        ></div>
      </div>
    );
  };

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
            Languages
          </h1>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Discover the unique languages featured in our immersive learning experience. Each language offers its own challenges and rewards.
          </p>
        </motion.div>
        
        <div className="space-y-12">
          {languages.map((language, index) => (
            <motion.div 
              key={language.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="bg-gray-800/60 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl border border-gray-700/50"
            >
              <div className="md:flex">
                <div className="md:w-1/3 bg-gray-700/50 p-8 flex flex-col items-center justify-center">
                  <div className="text-9xl mb-4">{language.flag}</div>
                  <h2 className="text-3xl font-bold text-center mb-2">{language.name}</h2>
                  <p className="text-xl text-center text-gray-300">{language.native}</p>
                  <div className="mt-4 flex items-center">
                    <span className="text-gray-400 mr-2">Difficulty:</span>
                    <span className="font-semibold">{language.difficulty}</span>
                  </div>
                  {difficultyBar(language.difficultyLevel)}
                  <p className="mt-4 text-gray-400">
                    <span className="font-semibold text-white">{language.speakers}</span> native speakers
                  </p>
                </div>
                
                <div className="md:w-2/3 p-8">
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4 text-purple-300">Key Features</h3>
                    <ul className="space-y-2">
                      {language.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-purple-400 mr-2">•</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-pink-300">Basic Phrases</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {language.basicPhrases.map((phrase, i) => (
                        <div key={i} className="bg-gray-700/50 p-4 rounded-lg">
                          <p className="text-xl font-bold mb-1">{phrase.phrase}</p>
                          <p className="text-gray-300 text-sm">{phrase.pronunciation}</p>
                          <p className="text-gray-400 text-sm italic">{phrase.meaning}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                    className="mt-8 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg shadow-lg hover:shadow-xl transition-all font-medium"
                    onClick={() => {
                      const cityMap = {
                        'mandarin': 'chengdu',
                        'malay': 'kuala-lumpur',
                        'cantonese': 'hong-kong'
                      };
                      window.location.href = `/?city=${cityMap[language.id]}`;
                    }}
                  >
                    Start Learning {language.name}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}