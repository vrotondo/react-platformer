// src/App.jsx
import { useState, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import HUD from './components/HUD';
import PauseMenu from './components/PauseMenu';
import { useGameStore } from './game/store';
import './App.css';

function App() {
  const { health, score, isPaused, setIsPaused } = useGameStore();

  // Handle keyboard events for pausing the game
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsPaused(!isPaused);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPaused, setIsPaused]);

  return (
    <div className="game-container">
      <GameCanvas />
      <HUD health={health} score={score} />
      {isPaused && <PauseMenu />}
    </div>
  );
}

export default App;