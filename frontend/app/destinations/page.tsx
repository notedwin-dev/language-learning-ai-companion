'use client';

import React from 'react';
import { motion } from 'framer-motion';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

export default function DestinationsPage() {
  const destinations = [
    {
      id: 'chengdu',
      name: 'Chengdu, China',
      language: 'Mandarin (普通话)',
      flag: '🇨🇳',
      image: '/images/chengdu.jpg',
      description: 'Explore the vibrant streets of Chengdu! Practice ordering spicy Sichuan food, bargaining at local markets, and asking for directions to pandas!',
      attractions: ['Panda Research Base', 'Jinli Ancient Street', 'Wuhou Temple', 'Kuanzhai Alley'],
      foodSpecialties: ['Hotpot', 'Mapo Tofu', 'Kung Pao Chicken', 'Dandan Noodles'],
    },
    {
      id: 'kuala-lumpur',
      name: 'Kuala Lumpur, Malaysia',
      language: 'Bahasa Melayu',
      flag: '🇲🇾',
      image: '/images/kuala-lumpur.jpg',
      description: 'Navigate through KL\'s bustling streets! Practice shopping at local kedai, ordering at mamak stalls, and exploring Petaling Street.',
      attractions: ['Petronas Twin Towers', 'Batu Caves', 'Petaling Street', 'Central Market'],
      foodSpecialties: ['Nasi Lemak', 'Satay', 'Roti Canai', 'Char Kway Teow'],
    },
    {
      id: 'hong-kong',
      name: 'Hong Kong',
      language: 'Cantonese (廣東話)',
      flag: '🇭🇰',
      image: '/images/hong-kong.jpg',
      description: 'Experience the energy of Hong Kong! Practice ordering dim sum, shopping in wet markets, and taking the MTR around the city.',
      attractions: ['Victoria Peak', 'Temple Street Night Market', 'Hong Kong Disneyland', 'Star Ferry'],
      foodSpecialties: ['Dim Sum', 'Roast Goose', 'Wonton Noodles', 'Egg Tarts'],
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
            Destinations
          </h1>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Explore our virtual cities around Asia. Each destination offers authentic language learning experiences with native speakers and cultural immersion.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((destination, index) => (
            <motion.div 
              key={destination.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
              className="bg-gray-800/60 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl border border-gray-700/50 hover:shadow-2xl transition-all hover:transform hover:scale-[1.02]"
            >
              <div className="h-48 bg-gray-700 relative">
                <div className="absolute inset-0 flex items-center justify-center text-4xl">
                  {/* Placeholder for image */}
                  <span className="text-7xl">{destination.flag}</span>
                </div>
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm py-1 px-3 rounded-full text-sm font-medium flex items-center">
                  <span className="mr-2">{destination.flag}</span>
                  <span>{destination.language}</span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2">{destination.name}</h3>
                <p className="text-gray-300 mb-4">{destination.description}</p>
                
                <div className="mb-4">
                  <h4 className="text-lg font-semibold mb-2 text-purple-300">Key Attractions</h4>
                  <ul className="text-gray-300 text-sm space-y-1">
                    {destination.attractions.map((attraction, i) => (
                      <li key={i} className="flex items-center">
                        <span className="mr-2">•</span>
                        {attraction}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold mb-2 text-pink-300">Food Specialties</h4>
                  <ul className="text-gray-300 text-sm space-y-1">
                    {destination.foodSpecialties.map((food, i) => (
                      <li key={i} className="flex items-center">
                        <span className="mr-2">•</span>
                        {food}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                  className="mt-6 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg shadow-lg hover:shadow-xl transition-all font-medium"
                  onClick={() => window.location.href = `/?city=${destination.id}`}
                >
                  Explore {destination.name.split(',')[0]}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}