// src/game/entities/Player.js
import { PHYSICS } from '../physics/movement';
import { PLAYER_ANIMATIONS } from '../utils/sprites';
import { checkCollision } from '../physics/collision';

class Player {
    constructor({ x, y, width, height }) {
        this.state = {
            position: { x, y },
            velocity: { x: 0, y: 0 },
            width,
            height,
            isGrounded: false,
            facing: 'right',
            currentAnimation: 'idle',
            frameX: 0,
            frameTimer: 0,
            health: 100
        };
    }

    update(deltaTime, keys, levelData) {
        // Handle input
        this.handleInput(keys);

        // Apply physics
        this.applyPhysics(deltaTime);

        // Check for collisions with the level
        this.checkLevelCollisions(levelData);

        // Update animation
        this.updateAnimation(deltaTime);
    }

    handleInput(keys) {
        // Reset horizontal velocity
        this.state.velocity.x = 0;

        // Handle left/right movement
        if (keys['ArrowLeft'] || keys['a']) {
            this.state.velocity.x = -PHYSICS.MAX_DX;
            this.state.facing = 'left';
            this.state.currentAnimation = this.state.isGrounded ? 'run' : 'jump';
        }

        if (keys['ArrowRight'] || keys['d']) {
            this.state.velocity.x = PHYSICS.MAX_DX;
            this.state.facing = 'right';
            this.state.currentAnimation = this.state.isGrounded ? 'run' : 'jump';
        }

        // Jump only when grounded
        if ((keys['ArrowUp'] || keys['w'] || keys[' ']) && this.state.isGrounded) {
            this.state.velocity.y = PHYSICS.JUMP_FORCE;
            this.state.isGrounded = false;
            this.state.currentAnimation = 'jump';
        }

        // Set idle animation when not moving horizontally and grounded
        if (this.state.velocity.x === 0 && this.state.isGrounded) {
            this.state.currentAnimation = 'idle';
        }
    }

    applyPhysics(deltaTime) {
        // Apply gravity
        this.state.velocity.y += PHYSICS.GRAVITY;

        // Apply air resistance
        if (!this.state.isGrounded) {
            this.state.velocity.x *= PHYSICS.AIR_RESISTANCE;
        } else {
            this.state.velocity.x *= PHYSICS.GROUND_FRICTION;
        }

        // Update position based on velocity
        this.state.position.x += this.state.velocity.x;
        this.state.position.y += this.state.velocity.y;
    }

    checkLevelCollisions(levelData) {
        this.state.isGrounded = false;

        // Simple collision with the ground
        const tileSize = levelData.tileSize;
        const layer = levelData.layers[0];

        // Check all tiles around the player
        const startCol = Math.floor(this.state.position.x / tileSize);
        const endCol = Math.floor((this.state.position.x + this.state.width) / tileSize);
        const startRow = Math.floor(this.state.position.y / tileSize);
        const endRow = Math.floor((this.state.position.y + this.state.height) / tileSize);

        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                const tileIndex = row * Math.sqrt(layer.data.length) + col;
                const tile = layer.data[tileIndex];

                // Skip air tiles
                if (tile === 0) continue;

                // Get tile position
                const tileX = col * tileSize;
                const tileY = row * tileSize;

                // Check collision
                const collision = checkCollision(
                    this.state.position.x, this.state.position.y, this.state.width, this.state.height,
                    tileX, tileY, tileSize, tileSize
                );

                if (collision.collided) {
                    // Resolve collision
                    if (collision.direction === 'top') {
                        this.state.position.y = tileY - this.state.height;
                        this.state.velocity.y = 0;
                        this.state.isGrounded = true;
                    } else if (collision.direction === 'bottom') {
                        this.state.position.y = tileY + tileSize;
                        this.state.velocity.y = 0;
                    } else if (collision.direction === 'left') {
                        this.state.position.x = tileX - this.state.width;
                        this.state.velocity.x = 0;
                    } else if (collision.direction === 'right') {
                        this.state.position.x = tileX + tileSize;
                        this.state.velocity.x = 0;
                    }

                    // Check if tile is a hazard
                    if (layer.tileset[tile] && layer.tileset[tile].type === 'hazard') {
                        this.takeDamage(layer.tileset[tile].damage || 1);
                    }
                }
            }
        }
    }

    updateAnimation(deltaTime) {
        const animation = PLAYER_ANIMATIONS[this.state.currentAnimation];

        // Update animation frame
        this.state.frameTimer += deltaTime * 1000;
        if (this.state.frameTimer >= animation.speed) {
            this.state.frameTimer = 0;
            this.state.frameX = (this.state.frameX + 1) % animation.frames;
        }
    }

    takeDamage(amount) {
        this.state.health -= amount;
        if (this.state.health < 0) {
            this.state.health = 0;
        }
    }

    /*render(ctx, spriteSheet) {
        if (!spriteSheet.complete) return;

        const animation = PLAYER_ANIMATIONS[this.state.currentAnimation];

        // Draw the player sprite
        ctx.save();

        // Flip horizontally if facing left
        if (this.state.facing === 'left') {
            ctx.translate(this.state.position.x + this.state.width, this.state.position.y);
            ctx.scale(-1, 1);
        } else {
            ctx.translate(this.state.position.x, this.state.position.y);
        }

        // Draw the sprite
        ctx.drawImage(
            spriteSheet,
            this.state.frameX * 32,
            animation.row * 32,
            32, 32,
            0, 0,
            this.state.width, this.state.height
        );

        ctx.restore();
    }*/
    render(ctx) {
        // Draw a simple colored rectangle instead of sprite
        ctx.fillStyle = '#3498db'; // Blue color
        ctx.fillRect(
            this.state.position.x,
            this.state.position.y,
            this.state.width,
            this.state.height
        );

        // Draw direction indicator
        ctx.fillStyle = this.state.facing === 'right' ? '#e74c3c' : '#2ecc71';
        ctx.fillRect(
            this.state.facing === 'right'
                ? this.state.position.x + this.state.width - 5
                : this.state.position.x,
            this.state.position.y + 5,
            5,
            5
        );
    }
}

export default Player;