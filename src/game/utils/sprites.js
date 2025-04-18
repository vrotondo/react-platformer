// src/game/utils/sprites.js

/**
 * Player animation definitions
 * Each animation has:
 * - frames: number of frames in the animation
 * - row: row in the sprite sheet
 * - speed: milliseconds per frame
 */
export const PLAYER_ANIMATIONS = {
    idle: { frames: 4, row: 0, speed: 150 },
    run: { frames: 8, row: 1, speed: 100 },
    jump: { frames: 2, row: 2, speed: 200 },
    fall: { frames: 2, row: 3, speed: 200 },
    hurt: { frames: 3, row: 4, speed: 100 }
};

/**
 * Enemy animation definitions
 */
export const ENEMY_ANIMATIONS = {
    idle: { frames: 4, row: 0, speed: 150 },
    walk: { frames: 6, row: 1, speed: 120 },
    attack: { frames: 4, row: 2, speed: 80 }
};

/**
 * Collectible animation definitions
 */
export const COLLECTIBLE_ANIMATIONS = {
    coin: { frames: 6, row: 0, speed: 100 },
    gem: { frames: 4, row: 1, speed: 120 },
    powerup: { frames: 8, row: 2, speed: 80 }
};

/**
 * Load an image asynchronously
 * 
 * @param {string} src - Image source URL
 * @returns {Promise<HTMLImageElement>} - Promise resolving to the loaded image
 */
export function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
        img.src = src;
    });
}

/**
 * Load multiple images asynchronously
 * 
 * @param {Object} sources - Object with key-value pairs of name and image source URL
 * @returns {Promise<Object>} - Promise resolving to object with loaded images
 */
export function loadImages(sources) {
    const promises = Object.entries(sources).map(([name, src]) =>
        loadImage(src).then(img => [name, img])
    );

    return Promise.all(promises).then(entries => Object.fromEntries(entries));
}

/**
 * Draw a sprite from a sprite sheet
 * 
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {HTMLImageElement} spriteSheet - Sprite sheet image
 * @param {number} frameX - Frame index (column)
 * @param {number} frameY - Row index
 * @param {number} frameWidth - Width of each frame
 * @param {number} frameHeight - Height of each frame
 * @param {number} x - X position on canvas
 * @param {number} y - Y position on canvas
 * @param {number} width - Destination width on canvas
 * @param {number} height - Destination height on canvas
 * @param {boolean} flipHorizontal - Whether to flip horizontally
 */
export function drawSprite(
    ctx,
    spriteSheet,
    frameX,
    frameY,
    frameWidth,
    frameHeight,
    x,
    y,
    width,
    height,
    flipHorizontal = false
) {
    if (!spriteSheet || !spriteSheet.complete) return;

    ctx.save();

    if (flipHorizontal) {
        ctx.translate(x + width, y);
        ctx.scale(-1, 1);
        x = 0;
        y = 0;
    }

    ctx.drawImage(
        spriteSheet,
        frameX * frameWidth,
        frameY * frameHeight,
        frameWidth,
        frameHeight,
        x,
        y,
        width,
        height
    );

    ctx.restore();
}

/**
 * Animation controller to handle sprite animations
 */
export class AnimationController {
    constructor() {
        this.animations = {};
        this.currentAnimation = null;
        this.frameIndex = 0;
        this.frameTimer = 0;
        this.isPlaying = false;
        this.loop = true;
        this.finished = false;
    }

    /**
     * Add an animation to the controller
     * 
     * @param {string} name - Animation name
     * @param {Object} animation - Animation definition
     */
    addAnimation(name, animation) {
        this.animations[name] = animation;

        // Set as current if no animation is set
        if (!this.currentAnimation) {
            this.currentAnimation = name;
        }
    }

    /**
     * Play an animation
     * 
     * @param {string} name - Animation name
     * @param {boolean} reset - Whether to reset the animation
     * @param {boolean} loop - Whether to loop the animation
     */
    play(name, reset = true, loop = true) {
        if (!this.animations[name]) return;

        // No need to restart if already playing this animation
        if (this.currentAnimation === name && this.isPlaying && !reset) {
            return;
        }

        this.currentAnimation = name;
        this.loop = loop;
        this.isPlaying = true;
        this.finished = false;

        if (reset) {
            this.frameIndex = 0;
            this.frameTimer = 0;
        }
    }

    /**
     * Stop the current animation
     */
    stop() {
        this.isPlaying = false;
    }

    /**
     * Update the animation
     * 
     * @param {number} deltaTime - Time in milliseconds since last update
     */
    update(deltaTime) {
        if (!this.isPlaying || !this.currentAnimation) return;

        const animation = this.animations[this.currentAnimation];
        if (!animation) return;

        this.frameTimer += deltaTime;

        if (this.frameTimer >= animation.speed) {
            this.frameTimer = 0;
            this.frameIndex++;

            if (this.frameIndex >= animation.frames) {
                if (this.loop) {
                    this.frameIndex = 0;
                } else {
                    this.frameIndex = animation.frames - 1;
                    this.isPlaying = false;
                    this.finished = true;
                }
            }
        }
    }

    /**
     * Get the current frame data
     * 
     * @returns {Object} Frame data with frameX and frameY
     */
    getCurrentFrame() {
        if (!this.currentAnimation) return { frameX: 0, frameY: 0 };

        const animation = this.animations[this.currentAnimation];
        if (!animation) return { frameX: 0, frameY: 0 };

        return {
            frameX: this.frameIndex,
            frameY: animation.row
        };
    }
}