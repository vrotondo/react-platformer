// src/App.jsx
import GameCanvas from './components/GameCanvas';
import Level from './components/Level';
import Player from './components/Player';
import HUD from './components/HUD';
import PauseMenu from './components/PauseMenu';
import levelData from './assets/levels/level1.json';

function App() {
  const [playerHealth, setPlayerHealth] = useState(100);
  const [gameScore, setGameScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  return (
    <GameCanvas>
      <Level levelData={levelData}>
        <Player spawnPoint={levelData.spawn} />
      </Level>
      <HUD health={playerHealth} score={gameScore} />
      <PauseMenu isOpen={isPaused} />
    </GameCanvas>
  );
}