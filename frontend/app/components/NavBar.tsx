'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { GameControllerIcon, LanguageIcon, GlobeIcon } from './Icons';

const NavBar = () => {
  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="backdrop-blur-md bg-black/40 border-b border-white/10 fixed top-0 left-0 right-0 z-50 shadow-lg shadow-black/20"
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2 group">
            <span className="text-2xl transition-transform group-hover:scale-110">🎮</span>
            <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Language Quest
            </span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              href="/destinations" 
              className="text-gray-300 hover:text-white flex items-center space-x-2 group"
            >
              <div className="bg-gradient-to-br from-blue-600/50 to-purple-600/50 p-2 rounded-full group-hover:from-blue-500/70 group-hover:to-purple-500/70 transition-all duration-300 shadow-md">
                <GlobeIcon />
              </div>
              <span className="group-hover:text-white transition-colors">Destinations</span>
            </Link>
            <Link 
              href="/languages" 
              className="text-gray-300 hover:text-white flex items-center space-x-2 group"
            >
              <div className="bg-gradient-to-br from-green-600/50 to-teal-600/50 p-2 rounded-full group-hover:from-green-500/70 group-hover:to-teal-500/70 transition-all duration-300 shadow-md">
                <LanguageIcon />
              </div>
              <span className="group-hover:text-white transition-colors">Languages</span>
            </Link>
            <Link 
              href="/how-to-play" 
              className="text-gray-300 hover:text-white flex items-center space-x-2 group"
            >
              <div className="bg-gradient-to-br from-purple-600/50 to-pink-600/50 p-2 rounded-full group-hover:from-purple-500/70 group-hover:to-pink-500/70 transition-all duration-300 shadow-md">
                <GameControllerIcon />
              </div>
              <span className="group-hover:text-white transition-colors">How To Play</span>
            </Link>
          </div>
          
          <div>
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition-all font-medium"
              onClick={() => window.location.href = '/#cities'}
            >
              Start Learning
            </motion.button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default NavBar;