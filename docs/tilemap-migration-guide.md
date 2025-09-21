# Migrating to Tilemaps in GameEngine.jsx

To modify GameEngine.jsx to support tilemaps, you'll need to make these changes:

1. Import the necessary tilemap modules
2. Add tilemap state variables
3. Create tilemap objects for cities and locations
4. Update the game loop to use tilemaps for rendering and collision detection
5. Create functions to toggle between regular and tilemap modes

## Import Changes

```jsx
import React, { useRef, useEffect, useState } from 'react';
import Player from './Player';
import { drawMap, createMapFromCollision } from './MapRenderer';
import { createCityMap, createLocationMap, loadTiledMap } from './MapCreator';
import { TileMap } from './TileMap';
import CantonseseNPCDialog from "../components/CantonseseNPCDialog";
```

## State Variable Changes

```jsx
// Add these to your state variables
const [useTilemap, setUseTilemap] = useState(false);
const [cityTilemap, setCityTilemap] = useState(null);
const [locationTilemaps, setLocationTilemaps] = useState({});
```

## Game Setup Changes

In your loadGame function, add this code:

```jsx
// Create tilemaps for city and locations
if (useTilemap) {
  try {
    // Create a tilemap for the city
    const cityMap = createCityMap(cityId, TILE_SIZE);
    setCityTilemap(cityMap);
    
    // Create tilemaps for each location interior
    const locationMaps = {};
    cityMap.locations.forEach(location => {
      if (location.interior) {
        locationMaps[location.id] = createLocationMap(
          location.id,
          location.interior.collisionMap,
          TILE_SIZE
        );
      }
    });
    setLocationTilemaps(locationMaps);
  } catch (error) {
    console.error('Error creating tilemaps:', error);
    setUseTilemap(false);
  }
} else {
  // Legacy mode - convert collision maps to tilemaps
  const cityMap = createMapFromCollision(cityMap.collisionMap, TILE_SIZE);
  setCityTilemap(cityMap);
}
```

## Game Loop Changes

In your gameLoop function, modify the map drawing:

```jsx
// Draw the game
if (currentScene === "city") {
  // Draw the city map using either tilemap or legacy approach
  if (useTilemap && cityTilemap) {
    await drawMap(ctx, cityTilemap, mapData.collisionMap, TILE_SIZE, { 
      showCollision: showDebug 
    });
  } else {
    drawMap(ctx, mapData.background, mapData.collisionMap, TILE_SIZE);
  }
  
  // Rest of your city drawing code...
} else if (currentScene === "location" && activeLocation?.interior) {
  // Draw the location interior using either tilemap or legacy approach
  if (useTilemap && locationTilemaps[activeLocation.id]) {
    await drawMap(ctx, locationTilemaps[activeLocation.id], 
      activeLocation.interior.collisionMap, TILE_SIZE, { 
        showCollision: showDebug 
      });
  } else {
    drawMap(ctx, activeLocation.interior.background, 
      activeLocation.interior.collisionMap, TILE_SIZE);
  }
  
  // Rest of your location interior drawing code...
}
```

## Movement Code Changes

When updating the player position, change the collision detection:

```jsx
// Get the correct collision map based on current scene
const currentCollisionMap = 
  currentScene === "location" && activeLocation?.interior
    ? (useTilemap && locationTilemaps[activeLocation.id]
      ? locationTilemaps[activeLocation.id]
      : activeLocation.interior.collisionMap)
    : (useTilemap && cityTilemap
      ? cityTilemap
      : mapData.collisionMap);
```

## Add Tilemap Toggle

Add a button to toggle between regular rendering and tilemap rendering:

```jsx
<button
  onClick={() => setUseTilemap(!useTilemap)}
  className="absolute top-2 right-20 bg-purple-500/70 text-white px-2 py-1 rounded text-xs">
  {useTilemap ? "Legacy Mode" : "Tilemap Mode"}
</button>
```

## Preload Tileset Images

Create a utility function to preload tilesets:

```jsx
const preloadTilesets = async () => {
  const tilesetPaths = [
    `/tilesets/${cityId}-tileset.png`,
    '/tilesets/interior-tileset.png',
    '/tilesets/default-tileset.png'
  ];
  
  const promises = tilesetPaths.map(path => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load ${path}`));
      img.src = path;
    });
  });
  
  try {
    await Promise.all(promises);
    console.log('All tilesets preloaded successfully');
  } catch (error) {
    console.error('Error preloading tilesets:', error);
  }
};
```

## Creating and Organizing Tileset Images

To work with tilemaps, you'll need to create tileset images. These are sprite sheets containing all the tiles used in your game. Create the following folders and files:

1. Create a `public/tilesets` directory
2. Add tileset images:
   - `basic-tileset.png` - Default tileset with common elements
   - `chengdu-tileset.png` - Tileset for Chengdu with Chinese-themed elements
   - `kuala-lumpur-tileset.png` - Tileset for Kuala Lumpur with Malaysian elements
   - `hong-kong-tileset.png` - Tileset for Hong Kong with Cantonese elements
   - `interior-tileset.png` - Tileset for indoor locations

Each tileset should be organized in a grid (typically 8x8 or 16x16 tiles) with each tile being 32x32 pixels. The first tile (top-left) is usually empty or transparent.

## Using Tiled Map Editor

For a more professional approach, you can use the free Tiled Map Editor (https://www.mapeditor.org/) to create your maps:

1. Install Tiled Map Editor
2. Create a new map (32x32 tile size)
3. Import your tileset images
4. Create layers:
   - `background` - Base tiles (ground, floors)
   - `foreground` - Objects that appear above the player (tops of trees, roofs)
   - `collision` - Collision data (invisible in-game)
5. Export as JSON
6. Add a function to load Tiled maps:

```jsx
const loadTiledMaps = async () => {
  try {
    const cityMap = await loadTiledMap(`/maps/${cityId}.json`);
    setCityTilemap(cityMap);
    
    // Load location maps
    const locationPromises = mapData.locations.map(async location => {
      if (location.interior) {
        const locationMap = await loadTiledMap(`/maps/interiors/${location.id}.json`);
        return { id: location.id, map: locationMap };
      }
      return null;
    }).filter(Boolean);
    
    const loadedLocationMaps = await Promise.all(locationPromises);
    const locationMapsObject = {};
    loadedLocationMaps.forEach(item => {
      if (item) locationMapsObject[item.id] = item.map;
    });
    
    setLocationTilemaps(locationMapsObject);
  } catch (error) {
    console.error('Error loading Tiled maps:', error);
    setUseTilemap(false);
  }
};
```