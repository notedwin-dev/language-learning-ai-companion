/**
 * TileMap class for handling tile-based game maps
 */
export class TileMap {
  /**
   * Create a new TileMap
   * @param {Object} config - Configuration for the tilemap
   * @param {number} config.tileSize - Size of each tile in pixels
   * @param {number} config.width - Width of the map in tiles
   * @param {number} config.height - Height of the map in tiles
   * @param {string} config.tilesetPath - Path to tileset image
   * @param {Object} config.layers - Map layers (background, foreground, collision, etc.)
   */
  constructor(config) {
    this.tileSize = config.tileSize || 32;
    this.width = config.width || 15;
    this.height = config.height || 10;
    this.tilesetPath = config.tilesetPath;
    this.tileset = new Image();
    this.loaded = false;
    this.layers = config.layers || {
      background: [],
      foreground: [],
      collision: []
    };
    
    // Tileset properties
    this.tilesetColumns = config.tilesetColumns || 8;
    this.tilesetRows = config.tilesetRows || 8;
    
    // Track loading state
    this.loadPromise = this.loadTileset();
  }
  
  /**
   * Load the tileset image
   * @returns {Promise} A promise that resolves when the tileset is loaded
   */
  loadTileset() {
    return new Promise((resolve, reject) => {
      this.tileset.onload = () => {
        this.loaded = true;
        resolve();
      };
      this.tileset.onerror = (err) => {
        console.error('Failed to load tileset', err);
        reject(err);
      };
      this.tileset.src = this.tilesetPath;
    });
  }
  
  /**
   * Wait for the tileset to load
   * @returns {Promise} A promise that resolves when the tileset is loaded
   */
  waitForLoad() {
    return this.loadPromise;
  }
  
  /**
   * Get the source rectangle for a specific tile ID from the tileset
   * @param {number} tileId - The tile ID to get the source rectangle for
   * @returns {Object} The source rectangle {x, y, width, height}
   */
  getTileSourceRect(tileId) {
    if (tileId === 0) return null; // Empty tile
    
    // Calculate the position in the tileset
    // Tile IDs are 1-based (0 means empty)
    const id = tileId - 1;
    const col = id % this.tilesetColumns;
    const row = Math.floor(id / this.tilesetColumns);
    
    return {
      x: col * this.tileSize,
      y: row * this.tileSize,
      width: this.tileSize,
      height: this.tileSize
    };
  }
  
  /**
   * Draw the tilemap
   * @param {CanvasRenderingContext2D} ctx - The canvas context to draw on
   * @param {Object} options - Drawing options
   * @param {boolean} options.showCollision - Whether to highlight collision tiles
   * @param {boolean} options.drawBackground - Whether to draw background layer
   * @param {boolean} options.drawForeground - Whether to draw foreground layer
   */
  draw(ctx, options = {}) {
    if (!this.loaded) return;
    
    const {
      showCollision = false,
      drawBackground = true,
      drawForeground = true
    } = options;
    
    // Draw background layer
    if (drawBackground && this.layers.background) {
      this.drawLayer(ctx, this.layers.background);
    }
    
    // Draw foreground layer
    if (drawForeground && this.layers.foreground) {
      this.drawLayer(ctx, this.layers.foreground);
    }
    
    // Draw collision layer for debugging
    if (showCollision && this.layers.collision) {
      this.drawCollisionLayer(ctx);
    }
  }
  
  /**
   * Draw a specific layer of the tilemap
   * @param {CanvasRenderingContext2D} ctx - The canvas context to draw on
   * @param {Array} layer - The layer data (2D array of tile IDs)
   */
  drawLayer(ctx, layer) {
    for (let y = 0; y < layer.length; y++) {
      for (let x = 0; x < layer[y].length; x++) {
        const tileId = layer[y][x];
        if (tileId === 0) continue; // Skip empty tiles
        
        const sourceRect = this.getTileSourceRect(tileId);
        if (!sourceRect) continue;
        
        ctx.drawImage(
          this.tileset,
          sourceRect.x,
          sourceRect.y,
          sourceRect.width,
          sourceRect.height,
          x * this.tileSize,
          y * this.tileSize,
          this.tileSize,
          this.tileSize
        );
      }
    }
  }
  
  /**
   * Draw the collision layer for debugging
   * @param {CanvasRenderingContext2D} ctx - The canvas context to draw on
   */
  drawCollisionLayer(ctx) {
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    
    for (let y = 0; y < this.layers.collision.length; y++) {
      for (let x = 0; x < this.layers.collision[y].length; x++) {
        if (this.layers.collision[y][x] === 1) {
          ctx.fillRect(
            x * this.tileSize,
            y * this.tileSize,
            this.tileSize,
            this.tileSize
          );
        }
      }
    }
  }
  
  /**
   * Check if a position has a collision
   * @param {number} x - X position in pixels
   * @param {number} y - Y position in pixels
   * @returns {boolean} Whether there's a collision at the position
   */
  hasCollisionAt(x, y) {
    const tileX = Math.floor(x / this.tileSize);
    const tileY = Math.floor(y / this.tileSize);
    
    // Out of bounds is always a collision
    if (tileX < 0 || tileX >= this.width || tileY < 0 || tileY >= this.height) {
      return true;
    }
    
    // Check the collision layer
    return this.layers.collision[tileY][tileX] === 1;
  }
  
  /**
   * Convert a Tiled JSON map export to our tilemap format
   * @param {Object} tiledJSON - The Tiled JSON map data
   * @returns {Object} The converted tilemap data
   */
  static fromTiledJSON(tiledJSON) {
    const width = tiledJSON.width;
    const height = tiledJSON.height;
    const tileSize = tiledJSON.tilewidth;
    
    // Get the first tileset
    const firstTileset = tiledJSON.tilesets[0];
    const tilesetPath = firstTileset.image.replace('../', '/');
    const tilesetColumns = firstTileset.columns;
    
    // Initialize layers
    const layers = {
      background: Array(height).fill().map(() => Array(width).fill(0)),
      foreground: Array(height).fill().map(() => Array(width).fill(0)),
      collision: Array(height).fill().map(() => Array(width).fill(0))
    };
    
    // Process layers from Tiled
    tiledJSON.layers.forEach(layer => {
      if (layer.type !== 'tilelayer') return;
      
      const layerName = layer.name.toLowerCase();
      let targetLayer;
      
      if (layerName.includes('collision')) {
        targetLayer = 'collision';
      } else if (layerName.includes('foreground')) {
        targetLayer = 'foreground';
      } else {
        targetLayer = 'background';
      }
      
      // Convert from array to 2D array
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const index = y * width + x;
          
          if (targetLayer === 'collision') {
            // For collision layer, any non-zero tile is a collision
            layers[targetLayer][y][x] = layer.data[index] > 0 ? 1 : 0;
          } else {
            // For other layers, use the tile ID
            layers[targetLayer][y][x] = layer.data[index];
          }
        }
      }
    });
    
    return {
      width,
      height,
      tileSize,
      tilesetPath,
      tilesetColumns,
      layers
    };
  }
}

/**
 * Create a simple tilemap with a placeholder tileset
 * @param {number} width - Width of the map in tiles
 * @param {number} height - Height of the map in tiles
 * @param {number} tileSize - Size of each tile in pixels
 * @param {Array} collisionMap - 2D array of collision data
 * @returns {TileMap} A new TileMap instance
 */
export function createPlaceholderTileMap(width, height, tileSize, collisionMap) {
  // Create empty layers
  const background = Array(height).fill().map(() => Array(width).fill(0));
  const foreground = Array(height).fill().map(() => Array(width).fill(0));
  
  // Fill background with grass (tile ID 1)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      background[y][x] = 1; // Grass tile
      
      // Add some variety with other tiles
      if (Math.random() < 0.1) {
        background[y][x] = 2; // Alternate ground tile
      }
      
      // Add trees and objects to foreground
      if (collisionMap[y][x] === 1 && Math.random() < 0.7) {
        foreground[y][x] = 8 + Math.floor(Math.random() * 4); // Trees/objects
      }
    }
  }
  
  return new TileMap({
    width,
    height,
    tileSize,
    tilesetPath: '/tilesets/basic-tileset.png',
    tilesetColumns: 8,
    layers: {
      background,
      foreground,
      collision: collisionMap
    }
  });
}