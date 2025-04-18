// src/components/PauseMenu.jsx
import React from 'react';
import { useGameStore } from '../game/store';

const PauseMenu = () => {
    const { setIsPaused, resetGame } = useGameStore();

    const handleResumeClick = () => {
        setIsPaused(false);
    };

    const handleRestartClick = () => {
        resetGame();
        setIsPaused(false);
    };

    return (
        <div className="pause-menu-overlay">
            <div className="pause-menu">
                <h2>Game Paused</h2>

                <div className="menu-buttons">
                    <button className="menu-button" onClick={handleResumeClick}>
                        Resume Game
                    </button>

                    <button className="menu-button" onClick={handleRestartClick}>
                        Restart Level
                    </button>
                </div>

                <div className="game-controls">
                    <h3>Controls</h3>
                    <ul>
                        <li>Move: Arrow Keys or WASD</li>
                        <li>Jump: Space</li>
                        <li>Pause: Esc</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default PauseMenu;