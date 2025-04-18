// src/game/entities/Enemy.js
import { ENEMY_ANIMATIONS } from '../utils/sprites';
import { AnimationController } from '../utils/sprites';
import { checkCollision } from '../physics/collision';

class Enemy {
    constructor({ x, y, width, height, movementType, speed, range, damage }) {
        this.state = {
            position: { x, y },
            velocity: { x: 0, y: 0 },
            width: width || 32,
            height: height || 48,
            health: 100,
            facing: 'left',
            currentAnimation: 'idle',
            startPosition: { x, y },
            isDead: false
        };

        this.props = {
            movementType: movementType || 'patrol', // patrol, chase, stationary
            speed: speed || 2,
            range: range || 100,
            damage: damage || 10,
            detectionRange: 150,
            attackCooldown: 1000, // ms
            lastAttackTime: 0
        };

        // Initialize animation controller
        this.animationController = new AnimationController();

        // Add animations
        Object.entries(ENEMY_ANIMATIONS).forEach(([name, animation]) => {
            this.animationController.addAnimation(name, animation);
        });

        // Start with idle animation
        this.animationController.play('idle', true, true);
    }

    update(deltaTime, player, levelData) {
        // Skip update if dead
        if (this.state.isDead) return;

        // Update animation
        this.animationController.update(deltaTime * 1000);

        // Apply gravity
        this.state.velocity.y += 0.5;

        // Update position based on velocity
        this.state.position.x += this.state.velocity.x;
        this.state.position.y += this.state.velocity.y;

        // Check for level collisions
        this.checkLevelCollisions(levelData);

        // Handle movement based on type
        this.handleMovement(player);

        // Check collision with player
        if (player) {
            this.checkPlayerCollision(player, deltaTime);
        }
    }

    handleMovement(player) {
        // Reset velocity
        this.state.velocity.x = 0;

        switch (this.props.movementType) {
            case 'stationary':
                // No movement
                this.state.currentAnimation = 'idle';
                break;

            case 'patrol':
                // Patrol back and forth
                const distanceFromStart = this.state.position.x - this.state.startPosition.x;

                if (Math.abs(distanceFromStart) > this.props.range) {
                    // Change direction
                    this.state.facing = distanceFromStart > 0 ? 'left' : 'right';
                }

                // Move in facing direction
                const direction = this.state.facing === 'left' ? -1 : 1;
                this.state.velocity.x = this.props.speed * direction;

                this.state.currentAnimation = 'walk';
                break;

            case 'chase':
                // Only chase if player is within detection range
                if (player && this.isPlayerInRange(player, this.props.detectionRange)) {
                    const directionToPlayer = player.state.position.x < this.state.position.x ? 'left' : 'right';
                    this.state.facing = directionToPlayer;

                    const direction = this.state.facing === 'left' ? -1 : 1;
                    this.state.velocity.x = this.props.speed * direction;

                    this.state.currentAnimation = 'walk';
                } else {
                    // Patrol when player is out of range
                    this.props.movementType = 'patrol';
                }
                break;
        }
    }

    checkLevelCollisions(levelData) {
        if (!levelData || !levelData.layers || !levelData.layers.length) return;

        const tileSize = levelData.tileSize;
        const layer = levelData.layers[0]; // Assuming first layer has collision tiles

        // Check all tiles around the enemy
        const startCol = Math.floor(this.state.position.x / tileSize);
        const endCol = Math.floor((this.state.position.x + this.state.width) / tileSize);
        const startRow = Math.floor(this.state.position.y / tileSize);
        const endRow = Math.floor((this.state.position.y + this.state.height) / tileSize);

        // Assume enemy is not on ground initially
        let isGrounded = false;

        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                // Get grid width from the data array (assuming square grid)
                const gridWidth = Math.sqrt(layer.data.length);
                const tileIndex = row * gridWidth + col;

                // Skip if out of bounds
                if (tileIndex < 0 || tileIndex >= layer.data.length) continue;

                const tile = layer.data[tileIndex];

                // Skip non-solid tiles
                if (tile === 0 || !layer.tileset[tile] || !layer.tileset[tile].solid) continue;

                // Get tile position
                const tileX = col * tileSize;
                const tileY = row * tileSize;

                // Check collision
                const collision = checkCollision(
                    this.state.position.x,
                    this.state.position.y,
                    this.state.width,
                    this.state.height,
                    tileX,
                    tileY,
                    tileSize,
                    tileSize
                );

                if (collision.collided) {
                    // Resolve collision
                    if (collision.direction === 'top') {
                        this.state.position.y = tileY - this.state.height;
                        this.state.velocity.y = 0;
                        isGrounded = true;
                    } else if (collision.direction === 'bottom') {
                        this.state.position.y = tileY + tileSize;
                        this.state.velocity.y = 0;
                    } else if (collision.direction === 'left') {
                        this.state.position.x = tileX - this.state.width;
                        this.state.velocity.x = 0;
                        // Change facing direction when hitting a wall
                        this.state.facing = 'right';
                    } else if (collision.direction === 'right') {
                        this.state.position.x = tileX + tileSize;
                        this.state.velocity.x = 0;
                        // Change facing direction when hitting a wall
                        this.state.facing = 'left';
                    }
                }
            }
        }
    }

    checkPlayerCollision(player, deltaTime) {
        // Skip if player is dead
        if (player.state.isDead) return;

        // Check collision with player
        const collision = checkCollision(
            this.state.position.x,
            this.state.position.y,
            this.state.width,
            this.state.height,
            player.state.position.x,
            player.state.position.y,
            player.state.width,
            player.state.height
        );

        if (collision.collided) {
            // Check if player is attacking from above
            if (collision.direction === 'top' && player.state.velocity.y > 0) {
                // Player jumped on enemy
                this.takeDamage(50);
                player.state.velocity.y = -10; // Bounce
            } else {
                // Enemy damages player
                const now = Date.now();
                if (now - this.props.lastAttackTime > this.props.attackCooldown) {
                    player.takeDamage(this.props.damage);
                    this.props.lastAttackTime = now;

                    // Play attack animation
                    this.animationController.play('attack', true, false);
                }
            }
        }
    }

    takeDamage(amount) {
        this.state.health -= amount;

        if (this.state.health <= 0) {
            this.state.health = 0;
            this.state.isDead = true;
            // Could add a death animation here
        }
    }

    isPlayerInRange(player, range) {
        const dx = player.state.position.x - this.state.position.x;
        const dy = player.state.position.y - this.state.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance <= range;
    }

    render(ctx, spriteSheet) {
        if (this.state.isDead || !spriteSheet || !spriteSheet.complete) return;

        // Get current frame from animation controller
        const { frameX, frameY } = this.animationController.getCurrentFrame();

        ctx.save();

        // Flip horizontally if facing left
        if (this.state.facing === 'left') {
            ctx.translate(this.state.position.x + this.state.width, this.state.position.y);
            ctx.scale(-1, 1);
            ctx.drawImage(
                spriteSheet,
                frameX * 32,  // Sprite sheet coordinates
                frameY * 32,
                32, 32,       // Source size
                0, 0,         // Canvas position (already translated)
                this.state.width, this.state.height // Render size
            );
        } else {
            ctx.drawImage(
                spriteSheet,
                frameX * 32,  // Sprite sheet coordinates
                frameY * 32,
                32, 32,       // Source size
                this.state.position.x, this.state.position.y, // Canvas position
                this.state.width, this.state.height // Render size
            );
        }

        ctx.restore();

        // Draw health bar (optional)
        if (this.state.health < 100) {
            const barWidth = this.state.width;
            const barHeight = 4;
            const healthPercentage = this.state.health / 100;

            // Background
            ctx.fillStyle = '#333';
            ctx.fillRect(
                this.state.position.x,
                this.state.position.y - barHeight - 2,
                barWidth,
                barHeight
            );

            // Health
            ctx.fillStyle = this.state.health > 50 ? '#44cc44' : '#cc4444';
            ctx.fillRect(
                this.state.position.x,
                this.state.position.y - barHeight - 2,
                barWidth * healthPercentage,
                barHeight
            );
        }
    }
}

export default Enemy;