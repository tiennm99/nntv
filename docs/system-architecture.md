# System Architecture - Night Ninja: Twilight Voyage

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Svelte 5 Application                     │
│  Entry: src/main.js → mounts App.svelte into #app            │
└─────────────────────────────────────────────────────────────┘
                            ↓
         ┌──────────────────┴──────────────────┐
         ↓                                      ↓
  ┌─────────────────┐              ┌──────────────────────┐
  │  Scene Router   │              │  Scenes (Svelte)     │
  │  App.svelte     │              ├──────────────────────┤
  │  {#key} block   │              │ MainMenu.svelte      │
  │  + fade trans.  │              │ StoryIntro.svelte     │
  └─────────────────┘              │ LevelIntro.svelte     │
                                   │ LevelSelect.svelte    │
                                   │ Game.svelte (gameplay) │
                                   │ GameOver.svelte        │
                                   │ Settings.svelte        │
                                   │ Guide.svelte           │
                                   └──────────────────────┘
         ┌──────────────────────────────────────┐
         │  Pure JS Game Engine (no framework)   │
         ├──────────────────────────────────────┤
         │ GridSystem  │ Player    │ Guards     │
         │ TurnManager │ Levels    │ Progress   │
         └──────────────────────────────────────┘
```

## Scene Flow

```
MainMenu
  ├→ Settings (toggle language) → MainMenu
  ├→ Guide (view instructions) → MainMenu
  ├→ LevelSelect → LevelIntro → Game
  └→ StoryIntro → LevelIntro → Game

Game (turn-based gameplay loop)
  ├→ Level Complete → LevelIntro (next level)
  ├→ Detection (lives > 0) → restart same level
  └→ Game Over (0 lives or final level)
     └→ GameOver → MainMenu
```

Navigation is handled by `App.svelte` via a `navigate(scene, data)` function passed as prop. Scene switching uses `{#key currentScene}` with `transition:fade`.

## Core Game Objects Architecture

```
Game.svelte (state owner, input handler, render coordinator)
├── GridSystem (pure JS class)
│   ├── Grid Data: Array[rows][cols] → { isWall, isGoal, isLight }
│   ├── Methods: isValidPosition, setWall, isGoal, isLight, setLight
│   ├── clearAllLight(): Reset all cells before guard turn
│   └── getAllCells(): Flat array for Svelte rendering
│
├── Player (pure JS class)
│   ├── State: row, col, grid reference
│   ├── move(direction): Validates bounds + walls, updates position
│   ├── isInLitCell(): Detection check
│   └── isAtGoal(): Win condition check
│
├── Guards[] (pure JS class hierarchy)
│   ├── Guard (abstract base)
│   │   ├── Shared: grid, row, col, type, direction, isOn
│   │   └── Abstract: updateLight(), onTurnChange()
│   │
│   ├── StaticGuard — lights fixed adjacent cells
│   ├── RotatingGuard — rotates beam 90°/turn, reflects off mirrors
│   ├── BlinkingGuard — toggles lights on/off each turn
│   ├── MirrorGuard — redirects rotating beams (cw/ccw 90°)
│   ├── PatrollingGuard — follows path, lights front + right
│   └── ChaserGuard — BFS pathfinding, lights detectionRadius cells
│
├── TurnManager (pure JS class)
│   ├── turnCount tracking
│   └── nextTurn(): clear lights → update guards → detect
│
└── Svelte Components (rendering only)
    ├── GameBoard.svelte — CSS grid of cells
    ├── PlayerSprite.svelte — positioned div
    ├── GuardSprite.svelte — colored circle/diamond
    ├── GameHud.svelte — level, lives, turns display
    ├── DetectionPopup.svelte — retry prompt
    └── PauseMenu.svelte — resume/restart/menu
```

## Svelte 5 Reactivity Pattern

**Problem**: Svelte 5 does not deep-proxy class instances. Mutations inside `Player.move()` or `Guard.onTurnChange()` are invisible to the reactivity system. Self-assignment (`grid = grid`) is a no-op due to `===` equality check.

**Solution**: `renderVersion` counter pattern.

```javascript
let renderVersion = $state(0);

// Derived values depend on renderVersion via comma operator
let cells = $derived((renderVersion, grid ? grid.getAllCells() : []));
let playerRow = $derived((renderVersion, player ? player.row : 0));
let guardSnapshots = $derived((renderVersion, guards.map(g => ({
    row: g.row, col: g.col, type: g.type, direction: g.direction, isOn: g.isOn
}))));

// After any game state mutation:
renderVersion++;
```

Guard data is passed to templates as plain object snapshots, not class instances.

## Data Flow: Player Turn

```
Player Input (Arrow Key / WASD / Cell Click)
    ↓
Game.svelte onKeyDown() or onCellClick()
    ↓
handleMove(direction)
    ├→ player.move(direction) → validate bounds + walls
    ↓
turnManager.nextTurn(grid, player, guards)
    ├→ Check goal (win condition, checked BEFORE guard update)
    ├→ grid.clearAllLight()
    ├→ guards.forEach(g => g.onTurnChange(allGuards))
    │   ├→ RotatingGuard: rotate + castBeam (with mirror reflection)
    │   ├→ BlinkingGuard: toggle isOn + updateLight
    │   ├→ PatrollingGuard: advance path + updateLight
    │   └→ MirrorGuard: light own cell
    └→ Check detection: grid.isLight(player.row, player.col)
    ↓
renderVersion++ → triggers $derived re-computation
    ↓
Svelte re-renders: cells, playerRow/Col, guardSnapshots
```

## Mirror Guard Beam Reflection

```
RotatingGuard.castBeam(dir, fromRow, fromCol, range, allGuards, depth)
    ├→ Cast cells in direction up to range
    ├→ Stop at wall or grid boundary
    ├→ If cell contains MirrorGuard:
    │   ├→ Compute reflected direction (cw or ccw 90°)
    │   └→ Recursively castBeam from mirror position
    └→ Max bounce depth: 3 (prevents infinite loops)
```

## Level 12: Escalating Detection

```
checkFinalLevel() — called each turn on final level
    ├→ Manhattan distance to goal <= 4 AND not yet alerted:
    │   ├→ princessAlerted = true
    │   ├→ Show finalMessage overlay
    │   └→ lightRing(radius=1)
    ├→ Already alerted:
    │   ├→ alertRadius++
    │   ├→ lightRing(alertRadius) — light all cells within radius of goal
    │   └→ If player in lit cell → detected = true
    └→ Light expands one Manhattan ring per turn until player caught
```

## Module Responsibilities

| Module | File | Purpose |
|--------|------|---------|
| GridSystem | `src/lib/game/grid-system.js` | Grid state, cell queries, lighting |
| Player | `src/lib/game/player.js` | Movement validation, position |
| Guards | `src/lib/game/guards.js` | 6 guard types with AI logic (including BFS pathfinding) |
| TurnManager | `src/lib/game/turn-manager.js` | Turn cycle, detection checks |
| LevelManager | `src/lib/game/level-manager.js` | Level loading via GUARD_REGISTRY factory pattern |
| GameHistory | `src/lib/game/game-history.js` | Undo/redo snapshots (Z/Y keys), MAX_HISTORY=50 |
| PrincessMechanic | `src/lib/game/princess-mechanic.js` | Level 12 escalating light rings |
| TouchControls | `src/lib/game/touch-controls.js` | Swipe gesture detection (SWIPE_THRESHOLD=30px) |
| Audio | `src/lib/audio.js` | Web Audio API: tones, move/detection/complete sounds, mute toggle |
| Levels | `src/lib/levels/levels.js` | 12 level definitions |
| Localization | `src/lib/localization.js` | Multi-language string management |
| Progress | `src/lib/progress.js` | localStorage persistence |
| Theme | `src/styles/theme.css` | CSS variables for all colors/fonts |

## Undo/Redo System (GameHistory)

```javascript
const history = new GameHistory();
history.snapshot(player, guards, turnCount, princessAlerted, alertRadius);
const state = history.undo(player, guards);  // Restores: row, col, direction, isOn per guard
const state = history.redo(player, guards);  // Re-applies undone state
```

- Max history size: 50 snapshots
- Triggered by Z key (undo) / Y key (redo)
- Snapshots reset redo stack on any new action
- Restores: player position, guard positions/directions/states, turn count, princess alert state

## Chaser Guard (BFS Pathfinding)

ChaserGuard uses Breadth-First Search to calculate shortest path to player:

```javascript
new ChaserGuard(grid, row, col, detectionRadius);
```

- Rebuilds path each turn via BFS algorithm
- Lights all cells within `detectionRadius` Manhattan distance
- Accounts for walls in pathfinding
- Used for advanced AI in later levels

## Touch Controls & Mobile Support

```javascript
const touch = new TouchControls();
svelte:window ontouchstart={e => touch.onTouchStart(e)};
svelte:window ontouchend={e => { const dir = touch.onTouchEnd(e); }};
```

- Swipe threshold: 30px minimum movement
- Returns direction: 'up', 'down', 'left', 'right'
- Integrated in Game.svelte for full mobile support

## Audio System (Web Audio API)

```javascript
import * as audio from '../lib/audio.js';
audio.playMoveSound();      // Low F note
audio.playDetectionSound(); // Ascending pattern
audio.playCompleteSound();  // Celebration chord
audio.toggleMute();         // Toggle global mute
```

- Context lazily created on first user interaction (autoplay policy)
- Master gain: 0.3 (master volume control)
- Multiple sound effects mapped to game events
- Mute state persisted in component state

## CSS Transitions & Visual Feedback

- **Cell Flash**: `background-color` transitions on detection
- **Player Shake**: CSS animation on detection feedback
- **Light Transitions**: Smooth CSS transitions on grid lighting changes
- **ARIA Accessibility**: `role="grid"`, `aria-label` on cells for screen readers
- **Controls Overlay**: "?" button reveals all keyboard/touch controls

## Asset & Resource Management

- **No sprites/images**: Pure CSS rendering (colored divs, borders)
- **Localization**: JSON files (`src/lib/locales/en.json`, `vi.json`)
- **Levels**: JS objects in `levels.js`
- **Progress**: localStorage key `nntv-progress`
- **Language**: localStorage key `nntv-language`
- **Audio**: Web Audio API (no external files)

## Build & Deployment

| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev server at localhost:8080 with HMR |
| `npm run build` | Production bundle to `dist/` |

**Deployment**: Upload `dist/` contents to any static host.
