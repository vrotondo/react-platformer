// src/App.jsx
import { useState, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import HUD from './components/HUD';
import PauseMenu from './components/PauseMenu';
import DebugInfo from './components/DebugInfo';
import { useGameStore } from './game/store';
import './App.css';

function App() {
  const { health, score, isPaused, setIsPaused } = useGameStore();
  const [showDebug, setShowDebug] = useState(true);

  // Handle keyboard events for pausing the game
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsPaused(!isPaused);
      } else if (e.key === 'd' && e.ctrlKey) {
        // Toggle debug info with Ctrl+D
        setShowDebug(prev => !prev);
        e.preventDefault();
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
      {showDebug && <DebugInfo />}

      {/* Fallback message if canvas fails to render */}
      <div id="canvas-fallback" style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        display: 'none', // Initially hidden, shown via JavaScript if canvas fails
        background: 'rgba(0,0,0,0.8)',
        padding: '20px',
        borderRadius: '10px',
        color: 'white',
        maxWidth: '80%',
        textAlign: 'center'
      }}>
        <h2>Canvas Not Rendering</h2>
        <p>There seems to be an issue with the game canvas.</p>
        <p>Check the console for errors.</p>
      </div>
    </div>
  );
}

// Add script to detect if canvas is rendered
setTimeout(() => {
  const canvas = document.querySelector('canvas');
  const fallback = document.getElementById('canvas-fallback');
  if (!canvas && fallback) {
    fallback.style.display = 'block';
  }
}, 1000);

export default App;