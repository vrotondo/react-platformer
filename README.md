# React Platformer

A 2D platformer game built with React, Vite, and Canvas. This game features physics, collectibles, enemies, and multiple levels.

## Features

- Smooth player movement and platforming physics
- Multiple levels with different layouts and challenges
- Collectible items and scoring system
- Enemy characters with basic AI
- Health and score tracking
- Responsive game canvas

## Controls

- Move left/right: Arrow keys or A/D
- Jump: Space or W or Up arrow
- Pause: Esc

## Setup and Running the Game

1. Clone the repository
```bash
git clone https://github.com/yourusername/react-platformer.git
cd react-platformer
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Game Architecture

This game is built with a component-based architecture:

- **GameCanvas**: The main canvas that renders the game
- **Player**: Handles player movement, physics, and animations
- **Level**: Manages level data, tiles, and entities
- **Enemies**: Implements enemy behavior and interactions
- **Collectibles**: Implements items that can be collected
- **HUD**: Displays health, score, and other game information
- **State Management**: Uses Zustand to manage game state

## Development

### Adding New Levels

To add a new level, create a JSON file in `src/assets/levels/` following the format of the existing levels. The level format includes:

- `name`: Level name
- `tileSize`: Size of each tile in pixels
- `spawn`: Player spawn coordinates
- `exit`: Level exit coordinates
- `layers`: Array of tile layers
- `entities`: Array of game entities (enemies, items, etc.)
- `background`: Background configuration

### Adding New Enemies

To create a new enemy type, extend the base Enemy class and implement custom behavior in the update method.

### Adding New Collectibles

Collectibles can be added to the level data or created programmatically in the game code.

## License

MIT