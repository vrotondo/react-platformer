// src/components/GameCanvas.jsx (Simplified)
import { useRef, useEffect } from 'react';
import { useGameStore } from '../game/store';
import GameOverScreen from './GameOverScreen';
import LevelCompleteScreen from './LevelCompleteScreen';

const GameCanvas = () => {
    const canvasRef = useRef(null);
    const { isPaused, isGameOver, health, score, currentLevel, levelCompleted } = useGameStore();

    // Initialize the game
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            console.error("Canvas element not found!");
            return;
        }

        // Set canvas size
        canvas.width = 800;
        canvas.height = 480;

        const ctx = canvas.getContext('2d');

        // Simple animation to show the canvas is working
        let frameCount = 0;

        const render = () => {
            frameCount++;

            // Skip if paused
            if (isPaused) {
                requestAnimationFrame(render);
                return;
            }

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw background
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#87CEEB');
            gradient.addColorStop(1, '#E0F7FA');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw ground
            ctx.fillStyle = '#7a6c5d';
            ctx.fillRect(0, 350, 800, 130);

            // Draw player (animated bouncing rectangle)
            const bounce = Math.sin(frameCount * 0.05) * 10;
            ctx.fillStyle = '#3498db';
            ctx.fillRect(100, 300 + bounce, 32, 48);

            // Draw platform
            ctx.fillStyle = '#7a6c5d';
            ctx.fillRect(300, 250, 200, 30);

            // Draw exit portal
            ctx.fillStyle = '#44cc44';
            ctx.fillRect(700, 300, 48, 48);

            // Draw info text
            ctx.fillStyle = 'white';
            ctx.font = '16px Arial';
            ctx.fillText('Simple Canvas Demo - Sprites Not Loaded', 20, 30);
            ctx.fillText('Use arrow keys to move & space to jump', 20, 50);

            requestAnimationFrame(render);
        };

        // Start render loop
        requestAnimationFrame(render);

        // Log success
        console.log("Canvas initialized successfully!");

    }, [isPaused]);

    return (
        <div className="game-canvas-container">
            <canvas
                ref={canvasRef}
                className="game-canvas"
                style={{ border: '1px solid #333' }}
            />

            {isGameOver && <GameOverScreen score={score} />}

            {levelCompleted && (
                <LevelCompleteScreen
                    level={currentLevel}
                    score={score}
                />
            )}
        </div>
    );
};

export default GameCanvas;