import { TileMap } from './TileMap';

/**
 * Create test maps for different cities
 * @param {string} cityId - The ID of the city to create a map for
 * @param {number} tileSize - The size of each tile in pixels
 * @returns {Object} The created map data
 */
export function createCityMap(cityId, tileSize = 32) {
  // Default map configuration
  const mapConfig = {
    width: 15,
    height: 10,
    tileSize,
    tilesetPath: `/tilesets/${cityId}-tileset.png`,
    tilesetColumns: 8,
    tilesetRows: 8,
  };
  
  // City-specific map data
  switch (cityId) {
    case 'chengdu':
      return createChengduMap(mapConfig);
    case 'kuala-lumpur':
      return createKualaLumpurMap(mapConfig);
    case 'hong-kong':
      return createHongKongMap(mapConfig);
    default:
      return createDefaultMap(mapConfig);
  }
}

/**
 * Create a TileMap for Chengdu
 * @param {Object} config - The base map configuration
 * @returns {TileMap} A new TileMap instance
 */
function createChengduMap(config) {
  // Collision layer (1 = collision, 0 = walkable)
  const collisionLayer = [
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
  ];
  
  // Create background layer (1-based tile IDs)
  // In a real implementation, you would design this with a tilemap editor
  const backgroundLayer = Array(config.height).fill().map(() => Array(config.width).fill(1));
  
  // Add some variety to the ground tiles
  for (let y = 0; y < config.height; y++) {
    for (let x = 0; x < config.width; x++) {
      // Border is walls
      if (y === 0 || y === config.height - 1 || x === 0 || x === config.width - 1) {
        backgroundLayer[y][x] = 5; // Wall tile
      } 
      // Normal ground with some variation
      else {
        backgroundLayer[y][x] = Math.random() < 0.8 ? 1 : 2; // Grass tiles
      }
    }
  }
  
  // Create foreground layer (buildings, trees, etc.)
  const foregroundLayer = Array(config.height).fill().map(() => Array(config.width).fill(0));
  
  // Add trees and buildings based on collision map
  for (let y = 0; y < config.height; y++) {
    for (let x = 0; x < config.width; x++) {
      if (collisionLayer[y][x] === 1 && !(y === 0 || y === config.height - 1 || x === 0 || x === config.width - 1)) {
        // Not a border wall
        if (Math.random() < 0.5) {
          foregroundLayer[y][x] = 9; // Tree
        } else {
          foregroundLayer[y][x] = 17; // Building
        }
      }
    }
  }
  
  // Create the tilemap
  return new TileMap({
    ...config,
    layers: {
      background: backgroundLayer,
      foreground: foregroundLayer,
      collision: collisionLayer
    }
  });
}

/**
 * Create a TileMap for Kuala Lumpur
 * @param {Object} config - The base map configuration
 * @returns {TileMap} A new TileMap instance
 */
function createKualaLumpurMap(config) {
  // Collision layer
  const collisionLayer = [
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
  ];
  
  // Create simplified placeholder layers for testing
  const backgroundLayer = Array(config.height).fill().map(() => Array(config.width).fill(3)); // Different ground tile
  const foregroundLayer = Array(config.height).fill().map(() => Array(config.width).fill(0));
  
  // Customize based on collision map
  for (let y = 0; y < config.height; y++) {
    for (let x = 0; x < config.width; x++) {
      if (y === 0 || y === config.height - 1 || x === 0 || x === config.width - 1) {
        backgroundLayer[y][x] = 6; // Wall tile for KL
      }
      
      if (collisionLayer[y][x] === 1 && !(y === 0 || y === config.height - 1 || x === 0 || x === config.width - 1)) {
        if (Math.random() < 0.5) {
          foregroundLayer[y][x] = 10; // Palm tree
        } else {
          foregroundLayer[y][x] = 18; // Building style for KL
        }
      }
    }
  }
  
  return new TileMap({
    ...config,
    layers: {
      background: backgroundLayer,
      foreground: foregroundLayer,
      collision: collisionLayer
    }
  });
}

/**
 * Create a TileMap for Hong Kong
 * @param {Object} config - The base map configuration
 * @returns {TileMap} A new TileMap instance
 */
function createHongKongMap(config) {
  // Collision layer
  const collisionLayer = [
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
  ];
  
  // Create placeholder layers
  const backgroundLayer = Array(config.height).fill().map(() => Array(config.width).fill(4)); // Urban ground
  const foregroundLayer = Array(config.height).fill().map(() => Array(config.width).fill(0));
  
  // Customize based on collision map
  for (let y = 0; y < config.height; y++) {
    for (let x = 0; x < config.width; x++) {
      if (y === 0 || y === config.height - 1 || x === 0 || x === config.width - 1) {
        backgroundLayer[y][x] = 7; // Urban wall
      }
      
      if (collisionLayer[y][x] === 1 && !(y === 0 || y === config.height - 1 || x === 0 || x === config.width - 1)) {
        if (Math.random() < 0.3) {
          foregroundLayer[y][x] = 11; // Small plant/decoration
        } else {
          foregroundLayer[y][x] = 19; // Urban building
        }
      }
    }
  }
  
  return new TileMap({
    ...config,
    layers: {
      background: backgroundLayer,
      foreground: foregroundLayer,
      collision: collisionLayer
    }
  });
}

/**
 * Create a default TileMap
 * @param {Object} config - The base map configuration
 * @returns {TileMap} A new TileMap instance
 */
function createDefaultMap(config) {
  // Simple collision layer
  const collisionLayer = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ];
  
  // Create simple layers
  const backgroundLayer = Array(config.height).fill().map(() => Array(config.width).fill(1));
  const foregroundLayer = Array(config.height).fill().map(() => Array(config.width).fill(0));
  
  // Basic customization
  for (let y = 0; y < config.height; y++) {
    for (let x = 0; x < config.width; x++) {
      if (collisionLayer[y][x] === 1) {
        backgroundLayer[y][x] = 5; // Wall tile
      }
    }
  }
  
  return new TileMap({
    ...config,
    tilesetPath: '/tilesets/default-tileset.png', // Fallback tileset
    layers: {
      background: backgroundLayer,
      foreground: foregroundLayer,
      collision: collisionLayer
    }
  });
}

/**
 * Create a TileMap for a location interior
 * @param {string} locationId - The ID of the location
 * @param {Array} collisionMap - The collision map for the location
 * @param {number} tileSize - The size of each tile in pixels
 * @returns {TileMap} A new TileMap instance
 */
export function createLocationMap(locationId, collisionMap, tileSize = 32) {
  const width = collisionMap[0].length;
  const height = collisionMap.length;
  
  // Map type based on location ID
  let mapType = 'restaurant';
  if (locationId.includes('tea')) mapType = 'teahouse';
  if (locationId.includes('market')) mapType = 'market';
  if (locationId.includes('cafe')) mapType = 'cafe';
  
  // Create background and foreground layers
  const backgroundLayer = Array(height).fill().map(() => Array(width).fill(20)); // Interior floor
  const foregroundLayer = Array(height).fill().map(() => Array(width).fill(0));
  
  // Customize based on location type and collision map
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Walls for all edges
      if (y === 0 || y === height - 1 || x === 0 || x === width - 1) {
        backgroundLayer[y][x] = 21; // Interior wall
      }
      
      // Add decorations based on collision map and location type
      if (collisionMap[y][x] === 1 && !(y === 0 || y === height - 1 || x === 0 || x === width - 1)) {
        // Determine decoration type based on location
        let decorationId;
        if (mapType === 'restaurant') decorationId = 25; // Tables
        else if (mapType === 'teahouse') decorationId = 26; // Tea furniture
        else if (mapType === 'market') decorationId = 27; // Market stalls
        else if (mapType === 'cafe') decorationId = 28; // Cafe furniture
        else decorationId = 25; // Default
        
        foregroundLayer[y][x] = decorationId;
      }
    }
  }
  
  // Create the tilemap
  return new TileMap({
    width,
    height,
    tileSize,
    tilesetPath: `/tilesets/interior-tileset.png`,
    tilesetColumns: 8,
    tilesetRows: 8,
    layers: {
      background: backgroundLayer,
      foreground: foregroundLayer,
      collision: collisionMap
    }
  });
}

/**
 * Load a map from a Tiled JSON file
 * @param {string} mapPath - Path to the Tiled JSON map file
 * @returns {Promise<TileMap>} A promise that resolves to a TileMap instance
 */
export async function loadTiledMap(mapPath) {
  try {
    const response = await fetch(mapPath);
    if (!response.ok) throw new Error(`Failed to load map: ${response.statusText}`);
    
    const tiledJSON = await response.json();
    const mapConfig = TileMap.fromTiledJSON(tiledJSON);
    
    return new TileMap(mapConfig);
  } catch (error) {
    console.error('Error loading Tiled map:', error);
    throw error;
  }
}