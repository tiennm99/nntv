# Night Ninja: Twilight Voyage

Night Ninja: Twilight Voyage is a turn-based stealth puzzle game where you play as a ninja rabbit navigating through a grid-based environment while avoiding detection by vegetable guards. Your goal is to rescue the missing carrot princess of the vegetable kingdom.

## Game Overview

Guide the ninja rabbit through 12 levels of escalating danger inside the Vegetable Kingdom. Each level is a grid where:

- Move from your starting position (top-left) to the green goal cell (bottom-right)
- Gray cells are walls — impassable
- Yellow lit cells are danger zones — step into one and the level restarts
- Colored guards illuminate cells around them in various patterns
- New mechanics unlock across acts: one-way tiles, throwable stones, locked doors, decay tiles, and more

## Game Features

- **Turn-based stealth**: Each move triggers all guards simultaneously — plan before stepping
- **Level-restart on detection**: No lives counter; every detection restarts the current level only
- **Guard types (8 total)**:
  - Static Guards (red/wilting tomato): Manhattan aura shrinks each turn — wait them out
  - Rotating Guards (blue): Beam rotates 90° clockwise each turn
  - Blinking Guards (yellow): Toggle lights on/off each turn
  - Patrolling Guards (purple): Move along a path, lighting front and right cells
  - Mirror Guards (green): Redirect rotating beams 90°
  - Chaser Guards (orange): BFS-hunt the player when in detection radius
  - **Sniper Guards (dark red)**: Aim along a fixed line of sight — step into the aim line, instant detection
  - **Suspicion Guards (violet)**: Tier-based alert system: calm → alerted (tier 1) → firing (tier 2)
- **Throwable stones**: Press **E** to enter targeting mode, throw a stone to distract guards (rotating, patrolling, chaser types)
- **Doors + keys**: Color-coded key items unlock matching doors (gold/silver/copper)
- **One-way tiles**: Arrow tiles only allow entry from the designated direction — commitment ratchets
- **Decay/warm tiles**: Cells that cool over turns; danger if stepped on while warm
- **Per-level affordance gates**: Some levels disable undo or preview to raise stakes
- **Undo/redo**: Press Z to undo moves, Y to redo (when level allows)
- **Turn preview**: Press V to preview next-turn lighting (when level allows)
- **Progressive difficulty**: 12 levels across 6 acts, grids growing from 8×8 to 13×13
- **Camera-follow viewport**: Large arenas scroll to keep the ninja in view
- **Procedural audio**: Web Audio API sound effects — moves, detection, throw, key pickup, door unlock, suspicion alerts
- **Pixel-art rendering**: All sprites and tiles drawn as string-art + palette → SVG rects
- **Solvability-verified**: BFS solver runs in CI to guarantee L1–L11 are beatable; L12 is intentionally unsolvable
- **Bilingual**: English and Vietnamese language support
- **Accessibility**: ARIA labels on grid cells, HUD elements, and mechanic overlays

## Tech Stack

- [Svelte 5](https://svelte.dev) — UI framework with runes reactivity
- [Vite 6](https://github.com/vitejs/vite) — Build tool and dev server

## Requirements

[Node.js](https://nodejs.org) is required to install dependencies and run scripts via `npm`.

## How to Play

- Use **arrow keys** or **WASD** to move the rabbit one cell per turn
- **Click** on an adjacent cell to move
- Press **Space** to wait a turn without moving
- Press **V** to preview next-turn lighting (if level allows)
- Press **Z** to undo last move, **Y** to redo (if level allows)
- Press **E** to enter stone-throw targeting mode — arrow keys move cursor, **Enter/E** throws, **Esc** cancels
- Reach the **green goal cell** to complete the level
- Avoid **yellow lit cells** — detection restarts the level
- Guard behaviors:
  - **Red (wilting)**: Aura shrinks each turn — waiting is valid
  - **Blue (rotating)**: Direction indicator shows next aim — time your crossing
  - **Yellow (blinking)**: Move on the dark turn
  - **Purple (patrolling)**: Memorise the patrol path
  - **Green (mirror)**: Predicts reflected beam landing spots
  - **Orange (chaser)**: Stay out of detection radius or lure away
  - **Dark red (sniper)**: Never step onto the aim line
  - **Violet (suspicion)**: Don't cross their view — two crosses and they fire

## Available Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install project dependencies |
| `npm run dev` | Launch development server |
| `npm run build` | Production build in `dist/` |
| `npm run preview` | Preview production build locally |
| `npm test` | Run all unit + solvability tests |
| `npm run test:solvability` | Run only the BFS solvability suite |

## Development

After cloning, run `npm install` then `npm run dev`. Dev server at `http://localhost:5173` by default.

## Project Structure

| Path | Description |
|------|-------------|
| `index.html` | HTML entry point |
| `src/main.js` | Application bootstrap |
| `src/App.svelte` | Scene router + migration modal |
| `src/scenes/` | Game scenes (MainMenu, Game, Guide, Settings, GameOver, etc.) |
| `src/components/` | Reusable UI components (GameBoard, HUD, sprites, overlays) |
| `src/lib/game/` | Pure JS engine (grid, player, guards, turns, history, solver, throwable) |
| `src/lib/pixel/` | Pixel-art renderer + palette + sprite/tile/UI/scene art |
| `src/lib/levels/` | 12 level definitions + BFS solvability test suite |
| `src/lib/locales/` | EN + VI JSON locale files |
| `src/lib/` | Audio (Web Audio), localization, progress persistence |
| `src/styles/theme.css` | CSS variables: colors, fonts, guard colors |

## Game Architecture

Pure JS game engine with Svelte 5 rendering layer:

- **GridSystem**: Cell state management (walls, goals, lighting, doors, warm tiles)
- **Player**: Position, movement validation, key inventory (bitmask)
- **Guards**: 8 guard types — Static, Rotating, Blinking, Mirror, Patrolling, Chaser, SniperGuard, SuspicionGuard
- **ThrowableSystem**: Stone inventory, throw validation (Manhattan ≤3, line-of-sight, guard proximity), distraction turn logic
- **TurnManager**: Turn cycle with preview simulation and throwable integration
- **GameHistory**: Undo/redo via state snapshots (includes grid door state + throwable inventory)
- **LevelSolver**: BFS solvability checker (CI-enforced; reuses runtime AI)
- **PrincessMechanic**: Escalating light-ring detection on L12
- **Audio**: Procedural Web Audio — move, wait, detect, complete, undo, stone throw/impact, key pickup, door unlock, suspicion alert/fire

## Credits

- Built with [Svelte 5](https://svelte.dev) and [Vite 6](https://vitejs.dev)
- Inspired by classic stealth games and vegetable kingdom stories
