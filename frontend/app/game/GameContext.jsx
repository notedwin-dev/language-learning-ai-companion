'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const GameContext = createContext();

// Create a provider component
export function GameProvider({ children }) {
  const [playerXp, setPlayerXp] = useState(0);
  const [learnedPhrases, setLearnedPhrases] = useState([]);
  const [visitedLocations, setVisitedLocations] = useState([]);
  const [completedLessons, setCompletedLessons] = useState([]);
  
  // Load saved game data from localStorage
  useEffect(() => {
    const loadGameData = () => {
      try {
        const savedXp = localStorage.getItem('playerXp');
        const savedPhrases = localStorage.getItem('learnedPhrases');
        const savedLocations = localStorage.getItem('visitedLocations');
        const savedLessons = localStorage.getItem('completedLessons');
        
        if (savedXp) setPlayerXp(parseInt(savedXp));
        if (savedPhrases) setLearnedPhrases(JSON.parse(savedPhrases));
        if (savedLocations) setVisitedLocations(JSON.parse(savedLocations));
        if (savedLessons) setCompletedLessons(JSON.parse(savedLessons));
      } catch (error) {
        console.error('Error loading game data:', error);
      }
    };
    
    loadGameData();
  }, []);
  
  // Save game data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('playerXp', playerXp.toString());
    localStorage.setItem('learnedPhrases', JSON.stringify(learnedPhrases));
    localStorage.setItem('visitedLocations', JSON.stringify(visitedLocations));
    localStorage.setItem('completedLessons', JSON.stringify(completedLessons));
  }, [playerXp, learnedPhrases, visitedLocations, completedLessons]);
  
  // Function to add XP
  const addPlayerXp = (amount) => {
    setPlayerXp(prevXp => prevXp + amount);
  };
  
  // Function to add a learned phrase
  const addLearnedPhrase = (phrase) => {
    setLearnedPhrases(prevPhrases => {
      if (!prevPhrases.includes(phrase)) {
        return [...prevPhrases, phrase];
      }
      return prevPhrases;
    });
  };
  
  // Function to add a visited location
  const addVisitedLocation = (locationId) => {
    setVisitedLocations(prevLocations => {
      if (!prevLocations.includes(locationId)) {
        return [...prevLocations, locationId];
      }
      return prevLocations;
    });
  };
  
  // Function to mark a lesson as completed
  const completeLesson = (lessonId) => {
    setCompletedLessons(prevLessons => {
      if (!prevLessons.includes(lessonId)) {
        return [...prevLessons, lessonId];
      }
      return prevLessons;
    });
  };
  
  // The value that will be provided to consumers
  const value = {
    playerXp,
    learnedPhrases,
    visitedLocations,
    completedLessons,
    addPlayerXp,
    addLearnedPhrase,
    addVisitedLocation,
    completeLesson
  };
  
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

// Custom hook to use the game context
export function useGameContext() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
}