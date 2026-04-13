# Codebase Summary - Night Ninja: Twilight Voyage

## Overview

NNTV is a turn-based stealth puzzle game built with Svelte 5 and Vite 6.x. The codebase separates pure JS game engine (classes in `lib/game/`) from Svelte rendering (scenes + components). State flows one-way: game classes mutate internally, then `renderVersion++` triggers Svelte re-derivation.

## Module Inventory

### Entry Point
- **src/main.js** — Mounts `App.svelte` into `#app`

### Scene Router
- **src/App.svelte** — `{#key currentScene}` with `transition:fade`, passes `navigate` function as prop to all scenes

### Scenes (src/scenes/)

| File | Purpose |
|------|---------|
| MainMenu.svelte | Start game, level select, settings, guide |
| StoryIntro.svelte | Scrolling narrative with skip button |
| LevelIntro.svelte | Level name + story text + continue |
| LevelSelect.svelte | 4x3 grid of level buttons (locked/unlocked/completed) |
| Game.svelte | Main gameplay: state owner, input, turn loop, rendering |
| GameOver.svelte | Loss/twist screen, retry/menu |
| Settings.svelte | Language toggle (EN/VI) |
| Guide.svelte | Rules, controls, enemy types |

### Components (src/components/)

| File | Purpose |
|------|---------|
| Button.svelte | Reusable styled button |
| GameBoard.svelte | CSS grid rendering of cells |
| GameHud.svelte | Level, lives, turns display bar |
| PlayerSprite.svelte | Absolutely positioned player div |
| GuardSprite.svelte | Colored circle (or diamond for mirror) |
| DetectionPopup.svelte | "Detected!" overlay with retry |
| PauseMenu.svelte | Resume / restart / main menu |

### Game Engine (src/lib/game/) — Pure JS, no Svelte

| File | Purpose |
|------|---------|
| grid-system.js | GridSystem class: cell state, walls, goals, lighting |
| player.js | Player class: position, movement validation |
| guards.js | Guard base + 6 subclasses (Static, Rotating, Blinking, Mirror, Patrolling, Chaser) |
| turn-manager.js | TurnManager: turn cycle, guard updates, detection |
| level-manager.js | loadLevel(): GUARD_REGISTRY factory pattern for guard instantiation |
| game-history.js | GameHistory class: undo/redo snapshots (Z/Y keys) |
| princess-mechanic.js | Princess detection logic: escalating light rings on level 12 |
| touch-controls.js | TouchControls class: swipe gesture detection for mobile |

### Level Data (src/lib/levels/)

| File | Purpose |
|------|---------|
| levels.js | LEVELS array: 12 level definitions (grid, guards, walls, goals) |

### Audio System (src/lib/)

| File | Purpose |
|------|---------|
| audio.js | Web Audio API procedural sound: playTone, playMoveSound, playDetectionSound, playCompleteSound, toggleMute |

### Utilities (src/lib/)

| File | Purpose |
|------|---------|
| localization.js | getText/setLanguage/getLanguage/initLanguage |
| progress.js | getProgress/completeLevel via localStorage |

### Localization (src/lib/locales/)

| File | Keys | Purpose |
|------|------|---------|
| en.json | ~55 | English translations |
| vi.json | ~55 | Vietnamese translations |

### Styles (src/styles/)

| File | Purpose |
|------|---------|
| theme.css | CSS variables: colors, fonts, guard colors, grid colors |

## Class Hierarchy

### Guard Inheritance

```
Guard (abstract base: grid, row, col, type, direction, isOn)
├── StaticGuard     — lights fixed litCells array
├── RotatingGuard   — rotates beam 90°/turn, castBeam with mirror bounce
├── BlinkingGuard   — toggles isOn, lights litCells when on
├── MirrorGuard     — lights own cell, stores reflectDirection (cw/ccw)
├── PatrollingGuard — follows path array, lights front + right cells
└── ChaserGuard     — BFS pathfinding to player, detectionRadius range
```

## Key Data Structures

### Level Definition
```javascript
{
  id: 1, name: "Garden Path", storyKey: "level1Story",
  grid: { rows: 6, cols: 6 },
  player: { row: 0, col: 0 },
  goal: { row: 5, col: 5 },
  walls: [{ row: 1, col: 1 }, ...],
  guards: [
    { type: "static", position: { row: 2, col: 4 }, litCells: [...] },
    { type: "rotating", position: { row: 3, col: 3 }, startDirection: 0 },
    { type: "blinking", position: {...}, litCells: [...], startState: true },
    { type: "mirror", position: {...}, reflectDirection: "cw" },
    { type: "patrolling", startPosition: {...}, path: [...] },
  ],
  isFinalLevel: false
}
```

### Cell State
```javascript
{ isWall: boolean, isGoal: boolean, isLight: boolean }
```

### Progress (localStorage)
```javascript
{ maxLevel: 1, completedLevels: [1, 2, 3] }
```

## Public API Summary

### GridSystem
```
new GridSystem(rows, cols, cellSize)
.isValidPosition(row, col), .isWall(row, col), .setWall(row, col, value)
.isGoal(row, col), .setGoal(row, col, value)
.isLight(row, col), .setLight(row, col, value)
.clearAllLight(), .getAllCells() → [{row, col, isWall, isGoal, isLight}]
```

### Player
```
new Player(grid, row, col)
.move(direction) → boolean, .moveTo(row, col) → boolean
.isInLitCell() → boolean, .isAtGoal() → boolean
```

### Guards
```
All: .updateLight(allGuards?), .onTurnChange(allGuards?)
RotatingGuard: .castBeam(dir, fromRow, fromCol, range, allGuards, depth)
PatrollingGuard: .checkIfCircularPath(), path traversal with reversing
MirrorGuard: .reflectDirection ('cw' or 'ccw')
```

### TurnManager
```
new TurnManager()
.nextTurn(grid, player, guards) → { detected, levelComplete }
.reset()
```

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| svelte | 5.x | UI framework (runes mode) |
| vite | 6.3.6 | Build tool, dev server |
| @sveltejs/vite-plugin-svelte | 6.x | Svelte compiler for Vite |

## File Dependency Map

```
main.js → App.svelte
App.svelte → all scenes

Game.svelte (central hub)
  ├── lib/game/level-manager.js → grid-system, player, guards, levels
  ├── lib/game/turn-manager.js
  ├── lib/progress.js
  ├── lib/localization.js
  ├── components/GameBoard, PlayerSprite, GuardSprite, GameHud
  ├── components/DetectionPopup, PauseMenu
  └── renderVersion pattern for reactivity

LevelSelect.svelte → levels.js, progress.js, localization.js
LevelIntro.svelte → levels.js, localization.js
All scenes → localization.js (for UI text)
```

## Statistics

| Metric | Value |
|--------|-------|
| Total Source Files | ~25 (8 scenes + 7 components + 8 engine + audio + utils) |
| Number of Classes | 10 (GridSystem, Player, Guard + 6 subclasses, TurnManager, GameHistory, TouchControls) |
| Number of Levels | 12 (across 6 acts) |
| Guard Types | 6 (Static, Rotating, Blinking, Mirror, Patrolling, Chaser) |
| Localization Keys | ~67 per language |
| Max Grid Size | 10x10 |
| Max Guards/Level | 8 |
