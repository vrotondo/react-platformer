// src/game/entities/Collectible.js
import { COLLECTIBLE_ANIMATIONS, AnimationController } from '../utils/sprites';
import { checkCollision } from '../physics/collision';

class Collectible {
    constructor({ x, y, type, value }) {
        this.state = {
            position: { x, y },
            width: 32,
            height: 32,
            type: type || 'coin',
            value: value || 10,
            isCollected: false,
            floatOffset: 0,
            floatDirection: 1,
            floatSpeed: 0.5,
            floatAmount: 5
        };

        // Initialize animation controller
        this.animationController = new AnimationController();

        // Add animations
        Object.entries(COLLECTIBLE_ANIMATIONS).forEach(([name, animation]) => {
            this.animationController.addAnimation(name, animation);
        });

        // Play animation based on type
        this.animationController.play(this.state.type, true, true);
    }

    update(deltaTime, player) {
        if (this.state.isCollected) return;

        // Update animation
        this.animationController.update(deltaTime * 1000);

        // Floating animation
        this.state.floatOffset += this.state.floatSpeed * this.state.floatDirection;

        if (Math.abs(this.state.floatOffset) >= this.state.floatAmount) {
            this.state.floatDirection *= -1;
        }

        // Check collision with player
        if (player) {
            this.checkPlayerCollision(player);
        }
    }

    checkPlayerCollision(player) {
        // Skip if already collected
        if (this.state.isCollected) return;

        // Check collision with player
        const collision = checkCollision(
            this.state.position.x,
            this.state.position.y + this.state.floatOffset,
            this.state.width,
            this.state.height,
            player.state.position.x,
            player.state.position.y,
            player.state.width,
            player.state.height
        );

        if (collision.collided) {
            this.collect(player);
        }
    }

    collect(player) {
        this.state.isCollected = true;

        // Apply effects based on collectible type
        switch (this.state.type) {
            case 'coin':
                // Add points
                if (player.addPoints) {
                    player.addPoints(this.state.value);
                }
                break;

            case 'gem':
                // Add more points
                if (player.addPoints) {
                    player.addPoints(this.state.value * 5);
                }
                break;

            case 'powerup':
                // Give player power-up
                if (player.addPowerUp) {
                    player.addPowerUp(this.state.value);
                }
                break;
        }
    }

    render(ctx, spriteSheet) {
        if (this.state.isCollected || !spriteSheet || !spriteSheet.complete) return;

        // Get current frame from animation controller
        const { frameX, frameY } = this.animationController.getCurrentFrame();

        // Draw the collectible with floating animation
        ctx.drawImage(
            spriteSheet,
            frameX * 32,  // Sprite sheet coordinates
            frameY * 32,
            32, 32,       // Source size
            this.state.position.x,
            this.state.position.y + this.state.floatOffset,
            this.state.width,
            this.state.height
        );

        // Optional particle effects
        if (this.state.type === 'gem' || this.state.type === 'powerup') {
            this.drawParticles(ctx);
        }
    }

    drawParticles(ctx) {
        // Simple particle effect
        const centerX = this.state.position.x + this.state.width / 2;
        const centerY = this.state.position.y + this.state.floatOffset + this.state.height / 2;

        // Draw particles based on type
        if (this.state.type === 'gem') {
            ctx.fillStyle = 'rgba(0, 255, 255, 0.7)';
        } else {
            ctx.fillStyle = 'rgba(255, 215, 0, 0.7)';
        }

        // Draw 3 particles
        for (let i = 0; i < 3; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 10 + 5;
            const size = Math.random() * 3 + 2;

            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;

            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

export default Collectible;