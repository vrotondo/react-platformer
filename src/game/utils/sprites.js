// sprites.js
export const PLAYER_ANIMATIONS = {
    idle: { frames: 4, row: 0, speed: 150 },
    run: { frames: 8, row: 1, speed: 100 },
    jump: { frames: 2, row: 2, speed: 200 }
};

// In render loop
ctx.drawImage(
    spriteSheet,
    frameX * 32,  // Sprite sheet coordinates
    animation.row * 32,
    32, 32,       // Source size
    x, y,         // Canvas position
    48, 48        // Render size (1.5x scale)
);