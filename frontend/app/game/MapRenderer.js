import { TileMap, createPlaceholderTileMap } from './TileMap';

/**
 * Draw a map using either a TileMap or a simple collision-based map
 * 
 * @param {CanvasRenderingContext2D} ctx - The canvas context to draw on
 * @param {string|TileMap} map - The map to draw (either a TileMap instance or a path to a background image)
 * @param {Array} collisionMap - 2D array of collision data (used only if map is not a TileMap)
 * @param {number} tileSize - Size of each tile in pixels
 * @param {Object} options - Drawing options
 */
export const drawMap = async (ctx, map, collisionMap, tileSize, options = {}) => {
  // If the map is a TileMap instance, use it
  if (map instanceof TileMap) {
    // Wait for the tilemap to load if needed
    if (!map.loaded) {
      try {
        await map.waitForLoad();
      } catch (error) {
        console.error('Failed to load tilemap:', error);
        drawFallbackMap(ctx, collisionMap, tileSize);
        return;
      }
    }

    // Draw the tilemap
    map.draw(ctx, {
      showCollision: options.showCollision || false,
      drawBackground: true,
      drawForeground: true
    });
    return;
  }

  // Fall back to the old drawing method
  drawFallbackMap(ctx, collisionMap, tileSize);
};

/**
 * Create a TileMap from a collision map
 * 
 * @param {Array} collisionMap - 2D array of collision data
 * @param {number} tileSize - Size of each tile in pixels
 * @returns {TileMap} A new TileMap instance
 */
export const createMapFromCollision = (collisionMap, tileSize) => {
  const height = collisionMap.length;
  const width = collisionMap[0].length;

  return createPlaceholderTileMap(width, height, tileSize, collisionMap);
};

/**
 * Draw a simple map based on a collision map (fallback method)
 * 
 * @param {CanvasRenderingContext2D} ctx - The canvas context to draw on
 * @param {Array} collisionMap - 2D array of collision data
 * @param {number} tileSize - Size of each tile in pixels
 */
const drawFallbackMap = (ctx, collisionMap, tileSize) => {
  // We'll use a simple approach for now - later we can implement proper tilemap rendering
  
  // Draw the background (temporary placeholder)
  ctx.fillStyle = '#A7F3D0'; // Light green
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  // Draw a grid for clarity
  ctx.strokeStyle = '#D1D5DB';
  ctx.lineWidth = 0.5;
  
  // Vertical lines
  for (let x = 0; x <= ctx.canvas.width; x += tileSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, ctx.canvas.height);
    ctx.stroke();
  }
  
  // Horizontal lines
  for (let y = 0; y <= ctx.canvas.height; y += tileSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(ctx.canvas.width, y);
    ctx.stroke();
  }
  
  // Draw collision tiles
  collisionMap.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell === 1) {
        ctx.fillStyle = '#4B5563'; // Gray for walls/obstacles
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
      }
    });
  });
  
  // Draw some decorative elements based on map (basic placeholders)
  // These would be replaced with actual sprites later
  
  // Trees
  ctx.fillStyle = '#047857'; // Dark green
  const treePositions = [
    { x: 2, y: 2 },
    { x: 7, y: 3 },
    { x: 12, y: 5 },
    { x: 4, y: 7 }
  ];
  
  treePositions.forEach(pos => {
    const { x, y } = pos;
    // Tree trunk
    ctx.fillRect(x * tileSize + tileSize/4, y * tileSize + tileSize/2, tileSize/2, tileSize/2);
    // Tree top
    ctx.beginPath();
    ctx.arc(x * tileSize + tileSize/2, y * tileSize + tileSize/3, tileSize/2, 0, Math.PI * 2);
    ctx.fill();
  });
  
  // Buildings (simple rectangles for now)
  ctx.fillStyle = '#BE185D'; // Pink/Purple
  const buildingPositions = [
    { x: 10, y: 2, width: 2, height: 2 },
    { x: 3, y: 5, width: 2, height: 2 }
  ];
  
  buildingPositions.forEach(building => {
    const { x, y, width, height } = building;
    ctx.fillRect(x * tileSize, y * tileSize, width * tileSize, height * tileSize);
  });
};