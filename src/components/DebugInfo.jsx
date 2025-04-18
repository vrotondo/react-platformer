// src/components/DebugInfo.jsx
import React from 'react';
import { useGameStore } from '../game/store';

const DebugInfo = () => {
    const {
        health,
        score,
        isPaused,
        isGameOver,
        currentLevel
    } = useGameStore();

    const styles = {
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 1000
    };

    return (
        <div style={styles}>
            <h3 style={{ margin: '0 0 5px 0' }}>Debug Info</h3>
            <div>Health: {health}</div>
            <div>Score: {score}</div>
            <div>Paused: {isPaused ? 'Yes' : 'No'}</div>
            <div>Game Over: {isGameOver ? 'Yes' : 'No'}</div>
            <div>Level: {currentLevel}</div>
            <div>Canvas Rendered: {document.querySelector('canvas') ? 'Yes' : 'No'}</div>
            <div>Screen Size: {window.innerWidth}x{window.innerHeight}</div>
        </div>
    );
};

export default DebugInfo;