// src/components/HUD.jsx
import React from 'react';

const HUD = ({ health, score }) => {
    return (
        <div className="game-hud">
            <div className="health-bar">
                <div className="health-label">Health:</div>
                <div className="health-bar-outer">
                    <div
                        className="health-bar-inner"
                        style={{
                            width: `${health}%`,
                            backgroundColor: health > 70
                                ? '#3dd42c'
                                : health > 30
                                    ? '#f7d51d'
                                    : '#e63946'
                        }}
                    />
                </div>
                <div className="health-text">{health}%</div>
            </div>

            <div className="score-display">
                <div className="score-label">Score:</div>
                <div className="score-value">{score}</div>
            </div>

            <div className="controls-hint">
                <p>Arrow Keys or WASD: Move • Space: Jump • Esc: Pause</p>
            </div>
        </div>
    );
};

export default HUD;