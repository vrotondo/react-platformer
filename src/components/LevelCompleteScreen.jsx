// src/components/LevelCompleteScreen.jsx
import React, { useEffect, useState } from 'react';
import { useGameStore } from '../game/store';

const LevelCompleteScreen = ({ level, score }) => {
    const { setCurrentLevel, setIsPaused } = useGameStore();
    const [countdown, setCountdown] = useState(3);

    useEffect(() => {
        // Auto-continue to next level after countdown
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    // Continue to next level
                    setCurrentLevel(level + 1);
                    setIsPaused(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [level, setCurrentLevel, setIsPaused]);

    return (
        <div className="level-complete">
            <h1>Level {level} Complete!</h1>
            <div className="level-score">Score: {score}</div>
            <div className="level-next">Next level in {countdown}...</div>
            <button
                className="menu-button"
                onClick={() => {
                    setCurrentLevel(level + 1);
                    setIsPaused(false);
                }}
            >
                Continue Now
            </button>
        </div>
    );
};

export default LevelCompleteScreen;