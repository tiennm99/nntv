# Night Ninja: Twilight Voyage

Night Ninja: Twilight Voyage is a turn-based stealth puzzle game where you play as a ninja rabbit navigating through a grid-based environment while avoiding detection by various vegetable guards. Your goal is to rescue the missing carrot princess of the vegetable kingdom.

## Game Overview

In Night Ninja: Twilight Voyage, you play as a ninja rabbit trying to navigate through increasingly complex levels in the vegetable kingdom to rescue the missing carrot princess. Each level consists of a grid where:

- You must move from your starting position to the green goal cell
- Gray cells represent walls that block movement
- Colored triangles represent different types of guards that create light in certain cells
- If you step into a lit cell, you'll be detected and lose a life
- You have 3 lives to complete all levels

## Game Features

- **Turn-based gameplay**: Each move you make triggers the vegetable guards to take their turn
- **Multiple guard types**:
  - Static Guards (red): Light up fixed cells around them
  - Rotating Guards (blue): Rotate and light up cells in different directions each turn
  - Blinking Guards (yellow): Toggle their lights on and off each turn
  - Patrolling Guards (purple): Move along predefined paths, lighting cells around them
  - Mirror Guards (green): Deflect rotating beams 90 degrees
  - Chaser Guards (orange): Detect nearby players and hunt them using pathfinding
- **Progressive difficulty**: 12 levels across 6 acts with increasing complexity
- **Grid-based movement**: Move one cell at a time using arrow keys, WASD, clicking, or swiping
- **Stealth mechanics**: Avoid lit cells to remain undetected
- **Undo/redo**: Press Z to undo moves, Y to redo — experiment without full restarts
- **Turn preview**: Press V to see where lights will be next turn
- **Sound effects**: Procedural audio feedback for moves, detection, and completion
- **Mobile support**: Touch controls with swipe gestures
- **Accessibility**: ARIA labels on grid cells for screen readers
- **Bilingual**: English and Vietnamese language support
- **Lives system**: You have 3 lives to complete all levels

## Tech Stack

- [Svelte 5](https://svelte.dev) — UI framework with runes reactivity
- [Vite 6](https://github.com/vitejs/vite) — Build tool and dev server

## Requirements

[Node.js](https://nodejs.org) is required to install dependencies and run scripts via `npm`.

## How to Play

- Use **arrow keys** or **WASD** to move your rabbit character one cell at a time
- **Click** on an adjacent cell or **swipe** on mobile to move
- Press **Space** to wait a turn without moving
- Press **V** to preview where lights will be next turn
- Press **Z** to undo your last move, **Y** to redo
- Reach the **green goal cell** to complete each level
- Avoid stepping on **yellow lit cells** or you'll be detected and lose a life
- Plan your moves carefully as each guard behaves differently:
  - **Red guards** (Static): Always light the same cells
  - **Blue guards** (Rotating): Change the direction they light each turn
  - **Yellow guards** (Blinking): Turn their lights on and off each turn
  - **Purple guards** (Patrolling): Move along a path, lighting cells around them
  - **Green mirrors**: Deflect light beams 90 degrees
  - **Orange chasers**: Detect and hunt you using pathfinding

## Available Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install project dependencies |
| `npm run dev` | Launch a development web server |
| `npm run build` | Create a production build in the `dist` folder |
| `npm run preview` | Preview the production build locally |

## Development

After cloning the repo, run `npm install` from your project directory. Then, you can start the local development server by running `npm run dev`.

The local development server runs on `http://localhost:5173` by default. Vite will automatically recompile your code and reload the browser on changes.

## Project Structure

| Path                         | Description                                                |
|------------------------------|------------------------------------------------------------|
| `index.html`                 | HTML entry point                                           |
| `public/assets`              | Static assets + pixel-art authoring source (JSX canvas)    |
| `src/main.js`                | Application bootstrap                                      |
| `src/App.svelte`             | Scene router                                               |
| `src/scenes/`                | Game scenes (MainMenu, Game, Guide, Settings, etc.)        |
| `src/components/`            | Reusable UI components (GameBoard, PlayerSprite, etc.)     |
| `src/lib/game/`              | Pure JS game engine (grid, player, guards, turns, history) |
| `src/lib/pixel/`             | Pixel-art renderer + palette + sprite/tile/UI/scene art    |
| `src/lib/levels/`            | Level definitions (12 levels)                              |
| `src/lib/`                   | Audio, localization, progress persistence                  |
| `src/styles/theme.css`       | Global layout styles and CSS variables                     |

## Game Architecture

Pure JS game engine (no framework dependency) with Svelte 5 rendering:

- **GridSystem**: Cell state management (walls, goals, lighting)
- **Player**: Position and movement validation
- **Guards**: 6 guard types with distinct AI (static, rotating, blinking, patrolling, mirror, chaser)
- **TurnManager**: Turn cycle with preview simulation
- **GameHistory**: Undo/redo via state snapshots
- **Audio**: Procedural Web Audio API sound effects

## Credits

- Built with [Svelte 5](https://svelte.dev) and [Vite 6](https://vitejs.dev)
- Inspired by classic stealth games and vegetable kingdom stories
