'use client';

import React from 'react';
import { motion } from 'framer-motion';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { GameControllerIcon, LanguageIcon, GlobeIcon } from '../components/Icons';

export default function HowToPlayPage() {
  const gameSteps = [
    {
      title: 'Choose Your Destination',
      icon: <GlobeIcon className="w-12 h-12 text-white stroke-2" />,
      description: 'Start by selecting a virtual city to explore. Each city offers a unique language learning experience tailored to its local culture and language.',
      tips: [
        'Consider starting with Bahasa Melayu if you\'re new to Asian languages',
        'Mandarin and Cantonese offer greater challenges for experienced learners',
        'Each city has unique scenarios and vocabulary sets'
      ]
    },
    {
      title: 'Complete Language Challenges',
      icon: <LanguageIcon className="w-12 h-12 text-white stroke-2" />,
      description: 'Engage in interactive conversations with virtual locals. Practice ordering food, asking for directions, haggling at markets, and more real-world scenarios.',
      tips: [
        'Listen carefully to pronunciation guides',
        'Practice speaking out loud for better retention',
        'Try to understand the context before responding',
        'Don\'t be afraid to make mistakes - it\'s part of learning!'
      ]
    },
    {
      title: 'Advance Through Game Levels',
      icon: <GameControllerIcon className="w-12 h-12 text-white stroke-2" />,
      description: 'As you master basic phrases and vocabulary, you\'ll unlock more complex scenarios and conversations. Track your progress and earn achievements as you improve.',
      tips: [
        'Complete daily challenges to maintain your learning streak',
        'Review previously learned phrases regularly',
        'Try different response options to see various outcomes',
        'Set personal goals for each gaming session'
      ]
    }
  ];

  const faqItems = [
    {
      question: 'How much time should I spend learning each day?',
      answer: 'We recommend 15-30 minutes of daily practice for optimal language retention. Consistent short sessions are more effective than occasional long sessions.'
    },
    {
      question: 'Can I switch between different languages?',
      answer: 'Yes! You can freely switch between cities and languages at any time. However, we recommend focusing on one language until you reach a basic conversational level before exploring another.'
    },
    {
      question: 'How realistic are the conversations?',
      answer: 'Our AI-powered conversations are designed to simulate real-world interactions as closely as possible. They adapt to your skill level and provide culturally authentic responses and scenarios.'
    },
    {
      question: 'Will this app make me fluent?',
      answer: 'This app provides an excellent foundation for language learning through practical, conversational practice. While it won\'t make you completely fluent on its own, it gives you the practical skills and confidence to continue your language journey.'
    },
    {
      question: 'Is there any grammar instruction?',
      answer: 'While our focus is on practical conversation, we do provide grammar tips and explanations when relevant to the learning scenario. The app emphasizes natural language acquisition similar to how children learn.'
    }
  ];

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
            How To Play
          </h1>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Learn a new language while having fun! Our RPG-style language learning game immerses you in authentic cultural experiences.
          </p>
        </motion.div>
        
        {/* Game Steps */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold mb-10 text-center">Game Mechanics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {gameSteps.map((step, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 shadow-xl"
              >
                <div className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 w-16 h-16 flex items-center justify-center mb-4 mx-auto">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-center">{step.title}</h3>
                <p className="text-gray-300 mb-4 text-center">{step.description}</p>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-300 mb-2">Tips:</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    {step.tips.map((tip, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-purple-400 mr-2">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Getting Started */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50 shadow-xl mb-20"
        >
          <h2 className="text-3xl font-bold mb-6 text-center">Getting Started</h2>
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center">
              <div className="bg-purple-600 rounded-full w-10 h-10 flex items-center justify-center font-bold text-xl mr-4 flex-shrink-0">1</div>
              <p className="text-gray-300 mt-2 md:mt-0">Click on "Start Learning" or navigate to the Destinations page to select a city.</p>
            </div>
            <div className="flex flex-col md:flex-row items-start md:items-center">
              <div className="bg-purple-600 rounded-full w-10 h-10 flex items-center justify-center font-bold text-xl mr-4 flex-shrink-0">2</div>
              <p className="text-gray-300 mt-2 md:mt-0">Choose your preferred language environment based on the city.</p>
            </div>
            <div className="flex flex-col md:flex-row items-start md:items-center">
              <div className="bg-purple-600 rounded-full w-10 h-10 flex items-center justify-center font-bold text-xl mr-4 flex-shrink-0">3</div>
              <p className="text-gray-300 mt-2 md:mt-0">Begin with basic conversation scenarios and gradually progress to more complex situations.</p>
            </div>
            <div className="flex flex-col md:flex-row items-start md:items-center">
              <div className="bg-purple-600 rounded-full w-10 h-10 flex items-center justify-center font-bold text-xl mr-4 flex-shrink-0">4</div>
              <p className="text-gray-300 mt-2 md:mt-0">Use the game controls to navigate through conversations, review phrases, and track your progress.</p>
            </div>
            <div className="flex flex-col md:flex-row items-start md:items-center">
              <div className="bg-purple-600 rounded-full w-10 h-10 flex items-center justify-center font-bold text-xl mr-4 flex-shrink-0">5</div>
              <p className="text-gray-300 mt-2 md:mt-0">Complete daily challenges to maintain your learning streak and earn rewards.</p>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <motion.button
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-10 rounded-lg shadow-lg hover:shadow-xl transition-all font-medium"
              onClick={() => window.location.href = '/#cities'}
            >
              Start Your Journey Now
            </motion.button>
          </div>
        </motion.div>
        
        {/* FAQ */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold mb-10 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4 max-w-4xl mx-auto">
            {faqItems.map((item, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 + 0.8 }}
                className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 shadow-lg"
              >
                <h3 className="text-xl font-bold mb-2 text-purple-300">{item.question}</h3>
                <p className="text-gray-300">{item.answer}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
      
      <Footer />
    </div>
  );
}