class Player {
  constructor(x, y, width, height, spriteSrc) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.sprite = new Image();
    this.sprite.src = spriteSrc;
    this.facingDirection = 'down'; // down, up, left, right
    this.frameX = 0; // For animation
    this.frameCount = 0;
    this.moving = false;
  }

  // Collision detection
  wouldCollide(newX, newY, collisionMap, tileSize) {
    // Support both TileMap objects and traditional collision arrays
    if (collisionMap && typeof collisionMap.hasCollisionAt === 'function') {
      // If we have a TileMap, use its collision detection
      // Check corners of the player hitbox against the collision map
      const corners = [
        { x: newX + 2, y: newY + 2 },                    // Top-left (with 2px buffer)
        { x: newX + this.width - 2, y: newY + 2 },       // Top-right (with 2px buffer)
        { x: newX + 2, y: newY + this.height - 2 },      // Bottom-left (with 2px buffer)
        { x: newX + this.width - 2, y: newY + this.height - 2 } // Bottom-right (with 2px buffer)
      ];

      // Check each corner against the tilemap
      for (const corner of corners) {
        if (collisionMap.hasCollisionAt(corner.x, corner.y)) {
          if (window.debugMode) {
            console.log(`Collision at pixel [${corner.x}, ${corner.y}]`);
          }
          return true;
        }
      }

      return false; // No collision detected with tilemap
    }

    // Legacy collision detection with 2D array
    // Check if collisionMap exists
    if (!collisionMap || !Array.isArray(collisionMap)) {
      console.error('Invalid collision map:', collisionMap);
      return false;
    }
    
    // Check corners of the player hitbox against the collision map
    // We use 4 points: top-left, top-right, bottom-left, bottom-right
    
    // Calculate the corners in pixel coordinates
    const corners = [
      { x: newX + 2, y: newY + 2 },                    // Top-left (with 2px buffer)
      { x: newX + this.width - 2, y: newY + 2 },       // Top-right (with 2px buffer)
      { x: newX + 2, y: newY + this.height - 2 },      // Bottom-left (with 2px buffer)
      { x: newX + this.width - 2, y: newY + this.height - 2 } // Bottom-right (with 2px buffer)
    ];
    
    // Check each corner against the collision map
    for (const corner of corners) {
      // Convert pixel position to tile position
      const tileX = Math.floor(corner.x / tileSize);
      const tileY = Math.floor(corner.y / tileSize);
      
      // Check for out of bounds
      if (tileX < 0 || tileY < 0 || 
          tileY >= collisionMap.length || 
          tileX >= collisionMap[0].length) {
        return true; // Collide with out of bounds
      }
      
      // Check for collision with a wall tile
      if (collisionMap[tileY][tileX] === 1) {
        if (window.debugMode) {
          console.log(`Collision at tile [${tileX}, ${tileY}]`);
        }
        return true;
      }
    }
    
    return false; // No collision detected
  }

  // X-axis movement
  moveX(amount, collisionMap, tileSize) {
    // Update facing direction
    if (amount > 0) {
      this.facingDirection = 'right';
    } else if (amount < 0) {
      this.facingDirection = 'left';
    }
    
    // Update animation frame
    this.frameCount++;
    if (this.frameCount >= 5) { // Change frame every 5 game frames
      this.frameX = (this.frameX + 1) % 4; // 4 frames of animation
      this.frameCount = 0;
    }
    
    // Calculate new position
    const newX = this.x + amount;
    
    // Check collision before moving
    if (!this.wouldCollide(newX, this.y, collisionMap, tileSize)) {
      this.x = newX;
      this.moving = true;
    } else {
      this.moving = false;
      
      // Try to slide along walls for smoother movement
      // This helps when the player is moving diagonally toward a wall
      // First try moving a smaller amount
      const smallerAmount = amount * 0.5;
      const smallerX = this.x + smallerAmount;
      
      if (!this.wouldCollide(smallerX, this.y, collisionMap, tileSize)) {
        this.x = smallerX;
        this.moving = true;
      }
    }
  }

  // Y-axis movement
  moveY(amount, collisionMap, tileSize) {
    // Update facing direction
    if (amount > 0) {
      this.facingDirection = 'down';
    } else if (amount < 0) {
      this.facingDirection = 'up';
    }
    
    // Update animation frame
    this.frameCount++;
    if (this.frameCount >= 5) {
      this.frameX = (this.frameX + 1) % 4;
      this.frameCount = 0;
    }
    
    // Calculate new position
    const newY = this.y + amount;
    
    // Check collision before moving
    if (!this.wouldCollide(this.x, newY, collisionMap, tileSize)) {
      this.y = newY;
      this.moving = true;
    } else {
      this.moving = false;
      
      // Try to slide along walls for smoother movement
      const smallerAmount = amount * 0.5;
      const smallerY = this.y + smallerAmount;
      
      if (!this.wouldCollide(this.x, smallerY, collisionMap, tileSize)) {
        this.y = smallerY;
        this.moving = true;
      }
    }
  }

  // Draw the player
  draw(ctx) {
    // For now, we'll just use a colored rectangle as a placeholder
    // Later this would use the sprite sheet with animation frames
    ctx.fillStyle = '#4F46E5'; // Indigo color
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // Draw a smaller rectangle to indicate facing direction
    const markerSize = 8;
    ctx.fillStyle = '#FFFFFF';
    
    switch(this.facingDirection) {
      case 'down':
        ctx.fillRect(this.x + this.width/2 - markerSize/2, this.y + this.height - markerSize/2, markerSize, markerSize);
        break;
      case 'up':
        ctx.fillRect(this.x + this.width/2 - markerSize/2, this.y - markerSize/2, markerSize, markerSize);
        break;
      case 'left':
        ctx.fillRect(this.x - markerSize/2, this.y + this.height/2 - markerSize/2, markerSize, markerSize);
        break;
      case 'right':
        ctx.fillRect(this.x + this.width - markerSize/2, this.y + this.height/2 - markerSize/2, markerSize, markerSize);
        break;
    }
    
    // Draw collision detection points in debug mode
    if (window.debugMode) {
      const corners = [
        { x: this.x + 2, y: this.y + 2 },                       // Top-left
        { x: this.x + this.width - 2, y: this.y + 2 },          // Top-right
        { x: this.x + 2, y: this.y + this.height - 2 },         // Bottom-left
        { x: this.x + this.width - 2, y: this.y + this.height - 2 }  // Bottom-right
      ];
      
      ctx.fillStyle = '#FF0000'; // Red for collision points
      for (const corner of corners) {
        ctx.beginPath();
        ctx.arc(corner.x, corner.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

export default Player;