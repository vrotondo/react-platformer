// src/components/Level.jsx
import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../game/store';
import { renderTiles } from '../game/utils/tilemap';
import Enemy from '../game/entities/Enemy';
import Collectible from '../game/entities/Collectible';

const Level = ({ levelData, canvasContext }) => {
    const levelRef = useRef({
        enemies: [],
        collectibles: []
    });

    const { addPoints, setCurrentLevel } = useGameStore();

    // Initialize level entities
    useEffect(() => {
        if (!levelData) return;

        // Clear previous entities
        levelRef.current.enemies = [];
        levelRef.current.collectibles = [];

        // Create enemies from level data
        if (levelData.entities) {
            levelData.entities.forEach(entity => {
                if (entity.type === 'enemy') {
                    levelRef.current.enemies.push(
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
        if (levelData.layers && levelData.layers.length > 1) {
            const collectiblesLayer = levelData.layers.find(layer => layer.name === 'collectibles');

            if (collectiblesLayer && collectiblesLayer.data) {
                const tileSize = levelData.tileSize;
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
                        levelRef.current.collectibles.push(
                            new Collectible({
                                x,
                                y,
                                type: tileConfig.type,
                                value: tileConfig.value
                            })
                        );
                    } else if (tileConfig.type === 'exit') {
                        // Add exit portal
                        levelRef.current.exit = {
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
    }, [levelData]);

    // Update and render level
    const updateLevel = (deltaTime, player) => {
        if (!canvasContext || !levelData) return;

        // Render background
        renderBackground(canvasContext, levelData);

        // Render tiles
        renderTiles(canvasContext, levelData);

        // Update and render enemies
        levelRef.current.enemies.forEach(enemy => {
            enemy.update(deltaTime, player, levelData);
            enemy.render(canvasContext, enemySprite);
        });

        // Update and render collectibles
        levelRef.current.collectibles.forEach(collectible => {
            collectible.update(deltaTime, player);
            collectible.render(canvasContext, collectibleSprite);
        });

        // Check if player reached exit
        checkExit(player);
    };

    // Render level background
    const renderBackground = (ctx, levelData) => {
        if (!levelData.background) return;

        const { width, height } = ctx.canvas;

        if (levelData.background.type === 'gradient') {
            const gradient = ctx.createLinearGradient(0, 0, 0, height);

            levelData.background.colors.forEach((color, index) => {
                gradient.addColorStop(index / (levelData.background.colors.length - 1), color);
            });

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
        } else if (levelData.background.color) {
            ctx.fillStyle = levelData.background.color;
            ctx.fillRect(0, 0, width, height);
        }
    };

    // Check if player reached the exit
    const checkExit = (player) => {
        if (!player || !levelRef.current.exit) return;

        // Simple collision check with exit
        const playerRight = player.state.position.x + player.state.width;
        const playerBottom = player.state.position.y + player.state.height;
        const exitRight = levelRef.current.exit.x + levelRef.current.exit.width;
        const exitBottom = levelRef.current.exit.y + levelRef.current.exit.height;

        if (
            player.state.position.x < exitRight &&
            playerRight > levelRef.current.exit.x &&
            player.state.position.y < exitBottom &&
            playerBottom > levelRef.current.exit.y
        ) {
            // Player reached exit, go to next level
            setCurrentLevel(levelRef.current.exit.nextLevel);
        }
    };

    return null; // This component doesn't render anything directly
};

export default Level;

// Load sprites
const enemySprite = new Image();
enemySprite.src = '/src/assets/sprites/enemy-sheet.png';

const collectibleSprite = new Image();
collectibleSprite.src = '/src/assets/sprites/collectibles-sheet.png';