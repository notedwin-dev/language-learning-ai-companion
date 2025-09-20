'use client';

import React, { useRef, useEffect, useState } from 'react';
import Player from './Player';
import { drawMap } from './MapRenderer';

const TILE_SIZE = 32;
const PLAYER_SPEED = 3;

export default function GameEngine({ cityId }) {
  const canvasRef = useRef(null);
  const [gameLoaded, setGameLoaded] = useState(false);
  const [player, setPlayer] = useState(null);
  const [keysPressed, setKeysPressed] = useState({});
  const [mapData, setMapData] = useState(null);
  const [showDebug, setShowDebug] = useState(false);
  const [dialogueBox, setDialogueBox] = useState(null);
  const [nearbyNPC, setNearbyNPC] = useState(null);
  const [nearbyLocation, setNearbyLocation] = useState(null);
  const [currentScene, setCurrentScene] = useState('city');
  const [activeLocation, setActiveLocation] = useState(null);
  const [previousPlayerPosition, setPreviousPlayerPosition] = useState(null);
  
  // Game setup
  useEffect(() => {
    // Initialize debug mode for console logging
    window.debugMode = false;
    
    const loadGame = async () => {
      // Load map data based on selected city
      const mapAssets = {
        'chengdu': {
          background: '/maps/chengdu-map.png',
          collisionMap: [
            // Simple collision map (1 = collision, 0 = walkable)
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1],
            [1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 1],
            [1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1],
            [1, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 1],
            [1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 0, 1],
            [1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          ],
          startPosition: { x: 5, y: 5 },
          // Add interactive NPCs and locations for Chengdu
          npcs: [
            { 
              id: 'npc1',
              x: 3, 
              y: 3, 
              name: '李老师 (Teacher Li)',
              greeting: 'Nǐ hǎo! Welcome to Chengdu! I can teach you Mandarin phrases.',
              interactionRadius: 1.5
            },
            { 
              id: 'npc2',
              x: 10, 
              y: 4, 
              name: '王阿姨 (Auntie Wang)',
              greeting: 'Nǐ chī le ma? Have you eaten yet? Try our Sichuan cuisine!',
              interactionRadius: 1.5
            }
          ],
          locations: [
            {
              id: 'restaurant1',
              name: '川菜馆 (Sichuan Restaurant)',
              x: 11,
              y: 3,
              width: 2,
              height: 2,
              type: 'restaurant',
              description: 'Famous for spicy Sichuan cuisine. Practice ordering in Mandarin!',
              interior: {
                background: '/maps/restaurant-interior.png',
                collisionMap: [
                  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                  [1, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1],
                  [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
                  [1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1],
                  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
                  [1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1],
                  [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
                  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                  [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
                ],
                startPosition: { x: 7, y: 9 }, // Door position
                exitPosition: { x: 7, y: 9 },
                npcs: [
                  { 
                    id: 'chef',
                    x: 7, 
                    y: 3, 
                    name: '厨师 (Chef)',
                    greeting: 'Huānyíng! Welcome! Would you like to try our spicy Sichuan dishes? 你想尝尝我们的川菜吗？',
                    interactionRadius: 1.5
                  },
                  { 
                    id: 'waiter',
                    x: 3, 
                    y: 5, 
                    name: '服务员 (Waiter)',
                    greeting: 'Nín xūyào shénme? What would you like to order? 您需要什么？',
                    interactionRadius: 1.5
                  }
                ]
              }
            },
            {
              id: 'teahouse1',
              name: '茶馆 (Tea House)',
              x: 3,
              y: 5,
              width: 2,
              height: 2,
              type: 'shop',
              description: 'Traditional tea house. Learn tea culture vocabulary.',
              interior: {
                background: '/maps/teahouse-interior.png',
                collisionMap: [
                  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
                  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
                  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
                  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                  [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
                ],
                startPosition: { x: 7, y: 9 }, // Door position
                exitPosition: { x: 7, y: 9 },
                npcs: [
                  { 
                    id: 'tea-master',
                    x: 7, 
                    y: 2, 
                    name: '茶艺师 (Tea Master)',
                    greeting: 'Nǐ hǎo! Would you like to learn about different types of tea? 你想了解不同种类的茶吗？',
                    interactionRadius: 1.5
                  }
                ]
              }
            }
          ]
        },
        'kuala-lumpur': {
          background: '/maps/kl-map.png',
          collisionMap: [
            // Simple collision map for KL
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1],
            [1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          ],
          startPosition: { x: 6, y: 4 },
          // Add interactive NPCs and locations for Kuala Lumpur
          npcs: [
            { 
              id: 'npc1',
              x: 8, 
              y: 3, 
              name: 'Encik Ahmad',
              greeting: 'Selamat datang! Welcome to KL! I can teach you basic Malay phrases.',
              interactionRadius: 1.5
            },
            { 
              id: 'npc2',
              x: 4, 
              y: 7, 
              name: 'Puan Siti',
              greeting: 'Apa khabar? How are you? Would you like to try some local snacks?',
              interactionRadius: 1.5
            }
          ],
          locations: [
            {
              id: 'market1',
              name: 'Pasar Malam (Night Market)',
              x: 3,
              y: 3,
              width: 2,
              height: 2,
              type: 'market',
              description: 'Vibrant night market with local street food. Practice bargaining in Malay!',
              interior: {
                background: '/maps/market-interior.png',
                collisionMap: [
                  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
                  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
                  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                  [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1],
                  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
                  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                  [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
                ],
                startPosition: { x: 7, y: 9 }, // Door position
                exitPosition: { x: 7, y: 9 },
                npcs: [
                  { 
                    id: 'food-vendor',
                    x: 3, 
                    y: 2, 
                    name: 'Penjual Makanan (Food Vendor)',
                    greeting: 'Selamat datang! Would you like to try our satay? Nak cuba satay kita?',
                    interactionRadius: 1.5
                  },
                  { 
                    id: 'souvenir-seller',
                    x: 11, 
                    y: 2, 
                    name: 'Penjual Cenderahati (Souvenir Seller)',
                    greeting: 'Hai! Looking for souvenirs? Harga boleh dirunding (prices are negotiable)!',
                    interactionRadius: 1.5
                  }
                ]
              }
            },
            {
              id: 'cafe1',
              name: 'Kopitiam (Coffee Shop)',
              x: 10,
              y: 7,
              width: 2,
              height: 1,
              type: 'cafe',
              description: 'Traditional Malaysian coffee shop. Learn how to order drinks in Malay.'
            }
          ]
        },
        'hong-kong': {
          background: '/maps/hk-map.png',
          collisionMap: [
            // Simple collision map for Hong Kong
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1],
            [1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1],
            [1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1],
            [1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          ],
          startPosition: { x: 3, y: 7 },
          // Add interactive NPCs and locations for Hong Kong
          npcs: [
            { 
              id: 'npc1',
              x: 6, 
              y: 3, 
              name: '陳師傅 (Master Chan)',
              greeting: 'Nei hou! Welcome to Hong Kong! I can teach you Cantonese phrases.',
              interactionRadius: 1.5
            },
            { 
              id: 'npc2',
              x: 12, 
              y: 6, 
              name: '黃小姐 (Miss Wong)',
              greeting: 'Sik jo faan mei? Have you eaten yet? Our dim sum is delicious!',
              interactionRadius: 1.5
            }
          ],
          locations: [
            {
              id: 'dimsum1',
              name: '點心茶樓 (Dim Sum Restaurant)',
              x: 10,
              y: 2,
              width: 2,
              height: 2,
              type: 'restaurant',
              description: 'Famous dim sum restaurant. Learn food vocabulary in Cantonese!',
              interior: {
                background: '/maps/dimsum-interior.png',
                collisionMap: [
                  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                  [1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1],
                  [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
                  [1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1],
                  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
                  [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
                  [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
                  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                  [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
                ],
                startPosition: { x: 7, y: 9 }, // Door position
                exitPosition: { x: 7, y: 9 },
                npcs: [
                  { 
                    id: 'dim-sum-chef',
                    x: 7, 
                    y: 3, 
                    name: '點心師傅 (Dim Sum Chef)',
                    greeting: 'Nei hou! Would you like to try our special dim sum? 你想試試我們的特色點心嗎？',
                    interactionRadius: 1.5
                  },
                  { 
                    id: 'tea-server',
                    x: 3, 
                    y: 6, 
                    name: '茶水師傅 (Tea Server)',
                    greeting: 'Ngóh hó! What tea would you like with your dim sum? 你想配什麼茶？',
                    interactionRadius: 1.5
                  }
                ]
              }
            },
            {
              id: 'market1',
              name: '街市 (Wet Market)',
              x: 2,
              y: 6,
              width: 2,
              height: 1,
              type: 'market',
              description: 'Traditional wet market. Practice numbers and bargaining in Cantonese.'
            }
          ]
        }
      };

      // Initialize player at start position
      const cityMap = mapAssets[cityId];
      setMapData(cityMap);
      
      // Create player at the city's start position
      const newPlayer = new Player(
        cityMap.startPosition.x * TILE_SIZE + 4, // Center player in tile with a small offset
        cityMap.startPosition.y * TILE_SIZE + 4,
        TILE_SIZE - 8, // Make player smaller than tile for better collision detection
        TILE_SIZE - 8,
        '/sprites/player.png'
      );
      
      setPlayer(newPlayer);
      setGameLoaded(true);
    };

    loadGame();
  }, [cityId]);

  // Keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      setKeysPressed(prev => ({ ...prev, [e.key]: true }));
      
      // Check for interaction key (E or Space)
      if ((e.key === 'e' || e.key === 'E' || e.key === ' ')) {
        // Handle interaction based on current scene
        if (currentScene === 'city') {
          // In city map, interact with NPCs or enter locations
          if (nearbyNPC) {
            setDialogueBox({
              type: 'npc',
              name: nearbyNPC.name,
              message: nearbyNPC.greeting
            });
          } else if (nearbyLocation) {
            // Save current player position for when we exit the location
            setPreviousPlayerPosition({
              x: player.x,
              y: player.y
            });
            
            // Enter the location
            setActiveLocation(nearbyLocation);
            setCurrentScene('location');
            
            // Reset movement keys to prevent drift
            setKeysPressed({});
          }
        } else if (currentScene === 'location') {
          // In location scene, interact with interior NPCs
          if (nearbyNPC) {
            setDialogueBox({
              type: 'npc',
              name: nearbyNPC.name,
              message: nearbyNPC.greeting
            });
          }
        }
      }
      
      // Handle exiting location with Escape key
      if (e.key === 'Escape') {
        if (dialogueBox) {
          // Close dialogue box if open
          setDialogueBox(null);
        } else if (currentScene === 'location') {
          // Exit location and return to city map
          setCurrentScene('city');
          setActiveLocation(null);
          
          // Restore player to previous position
          if (previousPlayerPosition && player) {
            player.x = previousPlayerPosition.x;
            player.y = previousPlayerPosition.y;
          }
          
          // Reset movement keys to prevent drift
          setKeysPressed({});
        }
      }
    };

    const handleKeyUp = (e) => {
      setKeysPressed(prev => ({ ...prev, [e.key]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [nearbyNPC, nearbyLocation, dialogueBox, currentScene, player, previousPlayerPosition]);

// Game loop
  useEffect(() => {
    if (!gameLoaded || !player || !mapData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    let animationId;
    
    const gameLoop = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Don't process movement if dialogue box is open
      if (!dialogueBox) {
        // Update player position based on key presses
        if (keysPressed['ArrowUp'] || keysPressed['w']) {
          player.moveY(-PLAYER_SPEED, mapData.collisionMap, TILE_SIZE);
        }
        if (keysPressed['ArrowDown'] || keysPressed['s']) {
          player.moveY(PLAYER_SPEED, mapData.collisionMap, TILE_SIZE);
        }
        if (keysPressed['ArrowLeft'] || keysPressed['a']) {
          player.moveX(-PLAYER_SPEED, mapData.collisionMap, TILE_SIZE);
        }
        if (keysPressed['ArrowRight'] || keysPressed['d']) {
          player.moveX(PLAYER_SPEED, mapData.collisionMap, TILE_SIZE);
        }
      }
      
      // Log player position for debugging
      if (window.debugMode) {
        console.log('Player position:', player.x, player.y);
        console.log('Player tile:', Math.floor(player.x / TILE_SIZE), Math.floor(player.y / TILE_SIZE));
      }
      
      // Draw the game
      drawMap(ctx, mapData.background, mapData.collisionMap, TILE_SIZE);
      
      // Draw locations (buildings, shops, etc.)
      if (mapData.locations) {
        mapData.locations.forEach(location => {
          // Draw the location
          ctx.fillStyle = getLocationColor(location.type);
          ctx.fillRect(
            location.x * TILE_SIZE, 
            location.y * TILE_SIZE, 
            location.width * TILE_SIZE, 
            location.height * TILE_SIZE
          );
          
          // Draw location name
          ctx.fillStyle = 'white';
          ctx.font = '10px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(
            location.name, 
            (location.x + location.width/2) * TILE_SIZE, 
            (location.y + location.height/2) * TILE_SIZE
          );
        });
      }
      
      // Draw player
      player.draw(ctx);
      
      // Draw NPCs
      if (mapData.npcs) {
        mapData.npcs.forEach(npc => {
          // Draw NPC (simple circle for now)
          ctx.fillStyle = '#F59E0B'; // Amber color
          ctx.beginPath();
          ctx.arc(
            (npc.x + 0.5) * TILE_SIZE, 
            (npc.y + 0.5) * TILE_SIZE, 
            TILE_SIZE / 2 - 4, 
            0, 
            Math.PI * 2
          );
          ctx.fill();
          
          // Draw NPC name
          ctx.fillStyle = 'white';
          ctx.font = '10px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(
            npc.name, 
            (npc.x + 0.5) * TILE_SIZE, 
            npc.y * TILE_SIZE - 5
          );
        });
      }
      
      // Check for nearby NPCs and locations
      let foundNPC = null;
      let foundLocation = null;
      
      // Calculate player's center position in tile coordinates
      const playerTileX = (player.x + player.width / 2) / TILE_SIZE;
      const playerTileY = (player.y + player.height / 2) / TILE_SIZE;
      
      // Check NPCs
      if (mapData.npcs) {
        for (const npc of mapData.npcs) {
          const distance = Math.hypot(playerTileX - (npc.x + 0.5), playerTileY - (npc.y + 0.5));
          if (distance <= (npc.interactionRadius || 1.5)) {
            foundNPC = npc;
            
            // Draw interaction indicator
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.beginPath();
            ctx.arc(
              (npc.x + 0.5) * TILE_SIZE, 
              (npc.y - 0.5) * TILE_SIZE, 
              10, 
              0, 
              Math.PI * 2
            );
            ctx.fill();
            
            ctx.fillStyle = 'black';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('E', (npc.x + 0.5) * TILE_SIZE, (npc.y - 0.5) * TILE_SIZE + 4);
            break;
          }
        }
      }
      
      // Check locations
      if (mapData.locations && !foundNPC) {
        for (const location of mapData.locations) {
          // Calculate center of the location
          const locationCenterX = location.x + location.width / 2;
          const locationCenterY = location.y + location.height / 2;
          
          // Check if player is near the perimeter of the location
          const distance = Math.min(
            Math.abs(playerTileX - location.x), // Left edge
            Math.abs(playerTileX - (location.x + location.width)), // Right edge
            Math.abs(playerTileY - location.y), // Top edge
            Math.abs(playerTileY - (location.y + location.height)) // Bottom edge
          );
          
          if (distance <= 1) {
            foundLocation = location;
            
            // Draw interaction indicator at the nearest edge
            let indicatorX, indicatorY;
            
            // Find the closest edge
            if (Math.abs(playerTileX - location.x) <= 1) { // Left edge
              indicatorX = location.x * TILE_SIZE;
              indicatorY = playerTileY * TILE_SIZE;
            } else if (Math.abs(playerTileX - (location.x + location.width)) <= 1) { // Right edge
              indicatorX = (location.x + location.width) * TILE_SIZE;
              indicatorY = playerTileY * TILE_SIZE;
            } else if (Math.abs(playerTileY - location.y) <= 1) { // Top edge
              indicatorX = playerTileX * TILE_SIZE;
              indicatorY = location.y * TILE_SIZE;
            } else { // Bottom edge
              indicatorX = playerTileX * TILE_SIZE;
              indicatorY = (location.y + location.height) * TILE_SIZE;
            }
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.beginPath();
            ctx.arc(indicatorX, indicatorY, 10, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = 'black';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('E', indicatorX, indicatorY + 4);
            break;
          }
        }
      }
      
      // Update state with nearby interactive elements
      setNearbyNPC(foundNPC);
      setNearbyLocation(foundLocation);
      
      // Continue the game loop
      animationId = requestAnimationFrame(gameLoop);
    };
    
    // Start the game loop
    gameLoop();
    
    // Clean up on unmount
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [gameLoaded, player, mapData, keysPressed, dialogueBox]);
  
  // Helper function to get color for different location types
  const getLocationColor = (type) => {
    switch(type) {
      case 'restaurant':
        return '#EF4444'; // Red
      case 'shop':
        return '#3B82F6'; // Blue
      case 'market':
        return '#10B981'; // Green
      case 'cafe':
        return '#F59E0B'; // Amber
      default:
        return '#8B5CF6'; // Purple
    }
  };

  return (
    <div className="relative">
      <canvas 
        ref={canvasRef} 
        width={15 * TILE_SIZE} 
        height={10 * TILE_SIZE} 
        className="border border-gray-700 rounded-lg shadow-lg mx-auto"
      />
      
      {/* Dialogue Box */}
      {dialogueBox && (
        <div className="absolute bottom-0 left-0 right-0 bg-gray-800/90 text-white p-4 rounded-t-md mx-2 border-t-2 border-yellow-500">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-yellow-400">{dialogueBox.name}</h3>
            <button 
              onClick={() => setDialogueBox(null)}
              className="text-gray-400 hover:text-white"
            >
              Close [ESC]
            </button>
          </div>
          <p className="text-sm">{dialogueBox.message}</p>
        </div>
      )}
      
      {/* Interaction hint when near an NPC or location */}
      {(nearbyNPC || nearbyLocation) && !dialogueBox && (
        <div className="absolute bottom-16 left-0 right-0 text-center">
          <div className="inline-block bg-black/70 text-white px-3 py-1 rounded-full text-sm">
            Press <span className="font-bold text-yellow-400">E</span> to interact with {nearbyNPC ? nearbyNPC.name : nearbyLocation.name}
          </div>
        </div>
      )}
      
      <div className="absolute top-2 left-2 bg-black/70 text-white px-3 py-1 rounded-full text-xs">
        ⌨️ Arrow keys or WASD to move | E to interact
      </div>
      
      <button 
        onClick={() => {
          window.debugMode = !window.debugMode;
          setShowDebug(!showDebug);
        }}
        className="absolute top-2 right-2 bg-red-500/70 text-white px-2 py-1 rounded text-xs"
      >
        {showDebug ? 'Hide Debug' : 'Debug'}
      </button>
      
      {showDebug && player && (
        <div className="absolute top-10 right-2 bg-black/70 text-white p-2 rounded text-xs">
          <div>X: {Math.round(player.x)}, Y: {Math.round(player.y)}</div>
          <div>Tile: {Math.floor(player.x / TILE_SIZE)}, {Math.floor(player.y / TILE_SIZE)}</div>
          <div>Facing: {player.facingDirection}</div>
          <div>Moving: {player.moving ? 'Yes' : 'No'}</div>
          <div>Near NPC: {nearbyNPC ? nearbyNPC.name : 'None'}</div>
          <div>Near Location: {nearbyLocation ? nearbyLocation.name : 'None'}</div>
        </div>
      )}
    </div>
  );
}