// src/components/GameOverScreen.jsx
import React from 'react';
import { useGameStore } from '../game/store';

const GameOverScreen = ({ score }) => {
    const { resetGame } = useGameStore();

    const handleRestartClick = () => {
        resetGame();
    };

    return (
        <div className="game-over">
            <h1>Game Over</h1>
            <div className="final-score">Your Score: {score}</div>
            <button className="menu-button" onClick={handleRestartClick}>
                Try Again
            </button>
        </div>
    );
};

export default GameOverScreen;