# Codebase Summary - Night Ninja: Twilight Voyage

## Overview

NNTV is a turn-based stealth puzzle game built with Phaser 3.88.2 and Vite 6.3.6. The codebase is organized into reusable modules with clear separation of concerns: scenes manage UI/flow, game objects handle logic, and utilities provide cross-cutting functionality.

**Total Files:** 21 JavaScript modules + 2 JSON locale files + config files

## Module Inventory

### Entry Point
- **src/main.js** (35 lines)
  - Phaser game initialization
  - Scene registration (8 scenes in order)
  - Canvas size: 1024x768, scale mode FIT
  - Arcade physics disabled (grid-based movement only)

### Game Scenes (src/game/scenes/)

| File | Lines | Purpose |
|------|-------|---------|
| Boot.js | ~40 | System initialization |
| Preloader.js | ~60 | Asset loading (sprites, audio) |
| MainMenu.js | ~100 | Start game, settings, guide buttons |
| StoryIntro.js | ~50 | Opening narrative sequence |
| LevelSelect.js | ~120 | Level list, progress display, level launch |
| Game.js | ~300 | Main gameplay loop, UI, input handling |
| GameOver.js | ~80 | Loss screen, retry/menu options |
| Settings.js | ~70 | Language toggle, preferences |
| Guide.js | ~90 | Instructions, controls, gameplay rules |

### Core Game Objects (src/game/objects/)

| File | Lines | Purpose |
|------|-------|---------|
| GridSystem.js | ~100 | Grid state management, cell queries, rendering |
| Player.js | ~80 | Ninja rabbit logic, movement, detection |
| Guard.js | ~150 | Base Guard class + 4 subclasses (Static, Rotating, Blinking, Patrolling) |
| TurnManager.js | ~60 | Turn cycle execution, detection checks |
| LightingSystem.js | ~50 | Light aggregation from guards, rendering |

### Level Management (src/game/levels/)

| File | Lines | Purpose |
|------|-------|---------|
| Levels.js | ~450 | 12 level definitions (grid size, guards, walls, goals) |
| LevelManager.js | ~60 | Load/initialize level by ID |
| LevelTester.js | ~80 | Debug utility for testing levels |

### Utilities & Configuration (src/game/)

| File | Lines | Purpose |
|------|-------|---------|
| theme.js | ~71 | COLORS, FONTS constants; button factory functions |
| localization.js | ~60 | Multi-language string management (EN/VI) |
| progress.js | ~43 | Level completion tracking via localStorage |

### Localization (src/game/locales/)

| File | Keys | Purpose |
|------|------|---------|
| en.json | ~50 | English translations (titles, buttons, messages) |
| vi.json | ~50 | Vietnamese translations (parallel structure) |

## Class Hierarchy

### Guard Inheritance

```
Guard (abstract)
  ├─ StaticGuard (always light same cells)
  ├─ RotatingGuard (rotate direction 90° per turn)
  ├─ BlinkingGuard (toggle lights on/off)
  └─ PatrollingGuard (move on path, light adjacent)
```

All guards share:
- Constructor params: `scene, grid, row, col, color`
- Methods: `createSprite()`, `destroy()`, `update()`
- Abstract methods (subclass override): `updateLight()`, `onTurnChange()`
- Sprite: Phaser circle object (colored by type)

### Scene Inheritance

All inherit from `Phaser.Scene`:
```
Phaser.Scene
  ├─ Boot (init phase)
  ├─ Preloader (asset loading)
  ├─ MainMenu (UI hub)
  ├─ StoryIntro (narrative)
  ├─ LevelSelect (level navigation)
  ├─ Game (gameplay)
  ├─ GameOver (loss/retry)
  ├─ Settings (preferences)
  └─ Guide (help)
```

## Key Data Structures

### Level Object
```javascript
{
  id: 1,                              // 1-12
  name: "First Steps",
  grid: { rows: 6, cols: 6 },
  player: { row: 0, col: 0 },
  goal: { row: 5, col: 5 },
  walls: [{ row: 1, col: 1 }, ...],
  guards: [
    { type: "static", position: {...}, litCells: [...] },
    { type: "rotating", position: {...}, direction: 0 },
    ...
  ]
}
```

### Cell State
```javascript
{
  isWall: boolean,
  isGoal: boolean,
  isLight: boolean
}
```

### Progress Object
```javascript
{
  maxLevel: 1,                    // Highest unlocked level
  completedLevels: [1, 2, 3]     // Array of completed level IDs
}
```

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| phaser | 3.88.2 | Game framework (rendering, physics, input) |
| vite | 6.3.6 | Build tool, dev server |
| terser | 5.39.0 | JS minification (prod build) |

## Public API Summary

### GridSystem
```javascript
new GridSystem(scene, rows, cols, cellSize)
.isValidPosition(row, col) → boolean
.isWall(row, col) → boolean
.setWall(row, col, value)
.isGoal(row, col) → boolean
.setGoal(row, col, value)
.isLight(row, col) → boolean
.setLight(row, col, value)
.render(offsetX, offsetY, cellSize)
```

### Player
```javascript
new Player(scene, grid, row, col)
.move(newRow, newCol) → boolean
.update()
.destroy()
```

### Guard (Base)
```javascript
new Guard(scene, grid, row, col, color)
.createSprite()
.updateLight()        // Override in subclass
.onTurnChange()       // Override in subclass
.destroy()
.update()
```

### TurnManager
```javascript
new TurnManager(scene)
.nextTurn()           // Execute guard actions, detect collision
.reset()
```

### LightingSystem
```javascript
new LightingSystem(scene, grid)
.clearAllLight()
.updateLightFromGuards(guards)
```

### Localization
```javascript
getText(key) → string         // Get current language text
setLanguage(lang) → boolean   // 'en' or 'vi'
getLanguage() → string
initLanguage()                // Load from localStorage
```

### Progress
```javascript
getProgress() → { maxLevel, completedLevels }
completeLevel(levelNum, totalLevels) → updated progress
```

## File Dependency Map

```
main.js
  └─ Boot, Preloader, MainMenu, StoryIntro, LevelSelect, Game, GameOver, Settings, Guide

Game.js
  ├─ GridSystem
  ├─ Player
  ├─ Guard (+ 4 subclasses)
  ├─ TurnManager
  ├─ LightingSystem
  ├─ LevelManager → Levels
  ├─ localization
  ├─ theme
  └─ progress

LevelManager.js
  └─ Levels

LevelSelect.js
  ├─ LevelManager
  ├─ progress
  ├─ localization
  └─ theme

All Scenes
  ├─ localization (for UI text)
  ├─ theme (for colors, fonts, buttons)
  └─ progress (for tracking)
```

## Configuration Files

| File | Purpose |
|------|---------|
| vite/config.dev.mjs | Dev server config (hot reload, logging) |
| vite/config.prod.mjs | Prod build config (minify, optimize) |
| index.html | Entry HTML, Phaser div target (#app) |
| public/style.css | Global styles (layout, responsive) |
| package.json | Dependencies, npm scripts |

## Asset Organization

- **public/assets/**: Static sprites, audio, images (served directly)
- **Imported in Preloader.js**: Load via Phaser loader
- **Vite bundling**: ES module imports for bundled assets

## Build Output

**Dev Mode:** `npm run dev`
- Source maps enabled
- Hot module reload
- Dev logging active

**Prod Mode:** `npm run build`
- Minified JS (terser)
- Assets optimized
- Output to `dist/` directory

## Statistics

| Metric | Value |
|--------|-------|
| Total JS Lines | ~2,100 |
| Number of Classes | 12 (8 scenes + 4 objects) |
| Number of Levels | 12 |
| Localization Keys | ~50 |
| Max Grid Size | 10x10 |
| Max Guards/Level | 8 |
| Browser Support | All (Phaser AUTO) |

## Code Quality Notes

- **No external frameworks** beyond Phaser (pure vanilla JS + ES modules)
- **Consistent patterns**: Guard inheritance, scene lifecycle, utility exports
- **Error handling**: Try-catch in localStorage, null checks for dynamic objects
- **Localization**: Full coverage EN/VI, fallback to English
- **Performance**: Synchronous turn system, optimized lighting calculations
