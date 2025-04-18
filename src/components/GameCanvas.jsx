// src/components/GameCanvas.jsx
import { useRef, useEffect } from 'react';
import { useGameStore } from '../game/store';
import GameManager from '../game/GameManager';
import GameOverScreen from './GameOverScreen';
import LevelCompleteScreen from './LevelCompleteScreen';

const GameCanvas = () => {
    const canvasRef = useRef(null);
    const gameManagerRef = useRef(null);
    const { isPaused, isGameOver, health, score, currentLevel, levelCompleted } = useGameStore();

    // Initialize the game
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Set canvas size
        canvas.width = 800;
        canvas.height = 480;

        // Create game manager
        gameManagerRef.current = new GameManager(canvas);

        // Handle resize
        const handleResize = () => {
            // Optionally adjust canvas size based on window size
            // For now, we'll keep it fixed at 800x480
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            // Clean up game resources if needed
        };
    }, []);

    // Handle pause state changes
    useEffect(() => {
        if (!gameManagerRef.current) return;

        if (isPaused) {
            gameManagerRef.current.pauseGame();
        } else {
            gameManagerRef.current.resumeGame();
        }
    }, [isPaused]);

    // Handle level changes
    useEffect(() => {
        if (!gameManagerRef.current || !currentLevel) return;

        // Load the current level
        gameManagerRef.current.loadLevel(currentLevel);
    }, [currentLevel]);

    // Handle game over
    useEffect(() => {
        if (!gameManagerRef.current || !isGameOver) return;

        gameManagerRef.current.gameOver();
    }, [isGameOver]);

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