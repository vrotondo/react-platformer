// src/game/GameManager.js
import { useGameStore } from './store';
import Player from './entities/Player';
import Enemy from './entities/Enemy';
import Collectible from './entities/Collectible';
import level1Data from '../assets/levels/level1.json';

// Sprite images
let playerSpriteImg = null;
let enemySpriteImg = null;
let collectibleSpriteImg = null;
let backgroundImg = null;

// Preload images
const loadImages = () => {
    playerSpriteImg = new Image();
    playerSpriteImg.src = '../assets/sprites/player-sheet.png';

    enemySpriteImg = new Image();
    enemySpriteImg.src = '../assets/sprites/enemy-sheet.png';

    collectibleSpriteImg = new Image();
    collectibleSpriteImg.src = '../assets/sprites/collectibles-sheet.png';

    backgroundImg = new Image();
    backgroundImg.src = '../assets/backgrounds/background1.png';
};

// Get current level data
const getLevelData = (levelNumber) => {
    // For now we only have level 1
    // In a full game, you would have multiple level data files
    // and load them based on the level number
    return level1Data;
};

class GameManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.gameState = {
            lastTime: 0,
            keys: {},
            entities: {
                player: null,
                enemies: [],
                collectibles: []
            },
            currentLevel: 1,
            levelData: null,
            isPaused: false,
            isGameOver: false
        };

        // Load images
        loadImages();

        // Set up event listeners
        this.setupEventListeners();

        // Initialize the game
        this.init();
    }

    init() {
        // Load level data
        this.loadLevel(this.gameState.currentLevel);

        // Start game loop
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    setupEventListeners() {
        // Keyboard events
        window.addEventListener('keydown', (e) => {
            this.gameState.keys[e.key] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.gameState.keys[e.key] = false;
        });

        // Pause/unpause game when tab visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseGame();
            }
        });
    }

    loadLevel(levelNumber) {
        // Get the level data
        this.gameState.levelData = getLevelData(levelNumber);

        // Reset entities
        this.gameState.entities.enemies = [];
        this.gameState.entities.collectibles = [];

        // Create player
        const { spawn } = this.gameState.levelData;
        this.gameState.entities.player = new Player({
            x: spawn.x,
            y: spawn.y,
            width: 32,
            height: 48
        });

        // Create enemies
        if (this.gameState.levelData.entities) {
            this.gameState.levelData.entities.forEach(entity => {
                if (entity.type === 'enemy') {
                    this.gameState.entities.enemies.push(
                        new Enemy({
                            x: entity.position.x,
                            y: entity.position.y,
                            ...entity.properties
                        })
                    );
                }
            });
        }

        // Create collectibles from level data (second layer)
        if (this.gameState.levelData.layers && this.gameState.levelData.layers.length > 1) {
            const collectiblesLayer = this.gameState.levelData.layers.find(
                layer => layer.name === 'collectibles'
            );

            if (collectiblesLayer && collectiblesLayer.data) {
                const tileSize = this.gameState.levelData.tileSize;
                const gridWidth = Math.sqrt(collectiblesLayer.data.length);

                collectiblesLayer.data.forEach((tileValue, index) => {
                    // Skip empty tiles
                    if (tileValue === 0) return;

                    const tileConfig = collectiblesLayer.tileset[tileValue];
                    if (!tileConfig) return;

                    // Calculate position
                    const x = (index % gridWidth) * tileSize;
                    const y = Math.floor(index / gridWidth) * tileSize;

                    // Create collectible
                    if (tileConfig.type === 'coin' || tileConfig.type === 'gem') {
                        this.gameState.entities.collectibles.push(
                            new Collectible({
                                x,
                                y,
                                type: tileConfig.type,
                                value: tileConfig.value
                            })
                        );
                    } else if (tileConfig.type === 'exit') {
                        // Add exit portal
                        this.gameState.exit = {
                            x,
                            y,
                            width: tileSize,
                            height: tileSize,
                            nextLevel: tileConfig.nextLevel
                        };
                    }
                });
            }
        }

        // Sync with Zustand store
        const { setHealth, setScore, setCurrentLevel } = useGameStore.getState();
        setHealth(100);
        setScore(0);
        setCurrentLevel(levelNumber);
    }

    gameLoop(timestamp) {
        // Calculate delta time
        const deltaTime = (timestamp - this.gameState.lastTime) / 1000; // Convert to seconds
        this.gameState.lastTime = timestamp;

        // Skip update if game is paused
        if (this.gameState.isPaused || this.gameState.isGameOver) {
            requestAnimationFrame(this.gameLoop.bind(this));
            return;
        }

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update and render game
        this.update(deltaTime);
        this.render();

        // Continue game loop
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    update(deltaTime) {
        const { player, enemies, collectibles } = this.gameState.entities;

        // Update player
        if (player) {
            player.update(deltaTime, this.gameState.keys, this.gameState.levelData);

            // Check if player fell off the level
            if (player.state.position.y > this.canvas.height) {
                player.takeDamage(100); // Kill player
            }

            // Sync player health with store
            const { setHealth } = useGameStore.getState();
            setHealth(player.state.health);

            // Check if player reached exit
            this.checkExit(player);
        }

        // Update enemies
        enemies.forEach(enemy => {
            enemy.update(deltaTime, player, this.gameState.levelData);
        });

        // Update collectibles
        collectibles.forEach(collectible => {
            collectible.update(deltaTime, player);

            // If collected, update score
            if (collectible.state.isCollected) {
                const { addPoints } = useGameStore.getState();
                addPoints(collectible.state.value);
            }
        });

        // Remove collected collectibles
        this.gameState.entities.collectibles = collectibles.filter(
            collectible => !collectible.state.isCollected
        );

        // Check game over condition
        if (player && player.state.health <= 0) {
            this.gameOver();
        }
    }

    render() {
        const { player, enemies, collectibles } = this.gameState.entities;

        // Render background
        this.renderBackground();

        // Render level tiles
        this.renderLevel();

        // Render collectibles
        collectibles.forEach(collectible => {
            collectible.render(this.ctx, collectibleSpriteImg);
        });

        // Render player
        if (player) {
            player.render(this.ctx, playerSpriteImg);
        }

        // Render enemies
        enemies.forEach(enemy => {
            enemy.render(this.ctx, enemySpriteImg);
        });

        // Render exit
        if (this.gameState.exit) {
            this.renderExit();
        }
    }

    renderBackground() {
        const { width, height } = this.canvas;

        // If we have a background image, use it
        if (backgroundImg && backgroundImg.complete) {
            this.ctx.drawImage(backgroundImg, 0, 0, width, height);
            return;
        }

        // Otherwise use the background from level data
        if (this.gameState.levelData && this.gameState.levelData.background) {
            const background = this.gameState.levelData.background;

            if (background.type === 'gradient') {
                const gradient = this.ctx.createLinearGradient(0, 0, 0, height);

                background.colors.forEach((color, index) => {
                    gradient.addColorStop(index / (background.colors.length - 1), color);
                });

                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(0, 0, width, height);
            } else if (background.color) {
                this.ctx.fillStyle = background.color;
                this.ctx.fillRect(0, 0, width, height);
            }
        } else {
            // Default background
            this.ctx.fillStyle = '#87CEEB';
            this.ctx.fillRect(0, 0, width, height);
        }
    }

    renderLevel() {
        if (!this.gameState.levelData) return;

        const { layers, tileSize } = this.gameState.levelData;

        // Render each layer
        layers.forEach(layer => {
            if (layer.name === 'collectibles') return; // Skip collectibles layer

            if (!layer.data || !layer.tileset) return;

            // Calculate grid dimensions based on data length (assuming square grid)
            const gridWidth = Math.sqrt(layer.data.length);

            // Loop through each tile in the grid
            for (let i = 0; i < layer.data.length; i++) {
                const tileValue = layer.data[i];

                // Skip empty tiles
                if (tileValue === 0) continue;

                // Get tile type and properties
                const tileConfig = layer.tileset[tileValue];

                if (!tileConfig) continue;

                // Calculate position
                const x = (i % gridWidth) * tileSize;
                const y = Math.floor(i / gridWidth) * tileSize;

                // Render tile based on type
                switch (tileConfig.type) {
                    case 'ground':
                        this.ctx.fillStyle = tileConfig.color || '#7a6c5d';
                        this.ctx.fillRect(x, y, tileSize, tileSize);

                        // Add a simple shading effect
                        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                        this.ctx.fillRect(x + tileSize - 5, y, 5, tileSize);
                        this.ctx.fillRect(x, y + tileSize - 5, tileSize, 5);
                        break;

                    case 'hazard':
                        // Draw hazard (spikes)
                        this.ctx.fillStyle = '#ff0000';

                        // Draw spikes
                        this.ctx.beginPath();
                        for (let s = 0; s < 4; s++) {
                            const spikeWidth = tileSize / 4;
                            const startX = x + s * spikeWidth;
                            this.ctx.moveTo(startX, y + tileSize);
                            this.ctx.lineTo(startX + spikeWidth / 2, y);
                            this.ctx.lineTo(startX + spikeWidth, y + tileSize);
                        }
                        this.ctx.fill();
                        break;
                }

                // Draw tile border
                this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
                this.ctx.strokeRect(x, y, tileSize, tileSize);
            }
        });
    }

    renderExit() {
        const { x, y, width, height } = this.gameState.exit;

        // Draw portal
        this.ctx.fillStyle = '#44cc44';
        this.ctx.fillRect(x, y, width, height);

        // Add glow effect
        const gradient = this.ctx.createRadialGradient(
            x + width / 2, y + height / 2, 5,
            x + width / 2, y + height / 2, 40
        );
        gradient.addColorStop(0, 'rgba(0, 255, 0, 0.5)');
        gradient.addColorStop(1, 'rgba(0, 255, 0, 0)');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x - 20, y - 20, width + 40, height + 40);

        // Add portal effect
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.beginPath();
        this.ctx.ellipse(
            x + width / 2,
            y + height / 2,
            width / 4,
            height / 4,
            0, 0, Math.PI * 2
        );
        this.ctx.fill();
    }

    checkExit(player) {
        if (!player || !this.gameState.exit) return;

        // Simple collision check with exit
        const playerRight = player.state.position.x + player.state.width;
        const playerBottom = player.state.position.y + player.state.height;
        const exitRight = this.gameState.exit.x + this.gameState.exit.width;
        const exitBottom = this.gameState.exit.y + this.gameState.exit.height;

        if (
            player.state.position.x < exitRight &&
            playerRight > this.gameState.exit.x &&
            player.state.position.y < exitBottom &&
            playerBottom > this.gameState.exit.y
        ) {
            // Player reached exit, complete the level
            this.completeLevel();
        }
    }

    completeLevel() {
        const { completeLevel } = useGameStore.getState();
        completeLevel();

        // Load next level
        const nextLevel = this.gameState.exit.nextLevel || this.gameState.currentLevel + 1;
        this.loadLevel(nextLevel);
    }

    gameOver() {
        this.gameState.isGameOver = true;
        const { setIsGameOver } = useGameStore.getState();
        setIsGameOver(true);
    }

    pauseGame() {
        this.gameState.isPaused = true;
        const { setIsPaused } = useGameStore.getState();
        setIsPaused(true);
    }

    resumeGame() {
        this.gameState.isPaused = false;
        const { setIsPaused } = useGameStore.getState();
        setIsPaused(false);
    }

    resetGame() {
        const { resetGame } = useGameStore.getState();
        resetGame();

        this.gameState.isGameOver = false;
        this.loadLevel(1);
        this.resumeGame();
    }
}

export default GameManager;