# System Architecture - Night Ninja: Twilight Voyage

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Phaser Game Instance                     │
│  Config: 1024x768, Scale.FIT, Arcade Physics (disabled)     │
└─────────────────────────────────────────────────────────────┘
                            ↓
         ┌──────────────────┴──────────────────┐
         ↓                                      ↓
  ┌─────────────────┐              ┌──────────────────────┐
  │  Scene Manager  │              │  Game Scenes         │
  └─────────────────┘              ├──────────────────────┤
                                   │ Boot                 │
                                   │ Preloader            │
                                   │ MainMenu             │
                                   │ StoryIntro           │
                                   │ LevelSelect          │
                                   │ Game (main gameplay) │
                                   │ GameOver             │
                                   │ Settings             │
                                   │ Guide                │
                                   └──────────────────────┘
```

## Scene Flow

```
Boot
  ↓
Preloader (load assets)
  ↓
MainMenu (user selects start/settings/guide)
  ├→ Settings (toggle language) → MainMenu
  ├→ Guide (view instructions) → MainMenu
  └→ StoryIntro (intro sequence)
    ↓
  LevelSelect (view unlocked levels, select level)
    ↓
  Game (turn-based gameplay)
    ├→ Level Complete → LevelSelect (or next level)
    └→ Game Over (3 lives lost)
      ↓
    GameOver Scene (retry/menu)
```

## Core Game Objects Architecture

```
Game Scene
├── GridSystem
│   ├── Grid Data: Array[rows][cols] with cell states
│   ├── Methods: isValidPosition, setWall, isGoal, isLight, etc.
│   └── Graphics: Renders grid borders, walls, goal, lighting
│
├── Player
│   ├── State: row, col, alive flag
│   ├── Methods: move(row,col), detectLighting(), update()
│   └── Sprite: Ninja rabbit circle (black)
│
├── Guards[] (dynamic array)
│   ├── Base Class: Guard
│   │   ├── Shared: sprite, row, col, color, createSprite()
│   │   └── Abstract: updateLight(), onTurnChange()
│   │
│   ├── StaticGuard extends Guard
│   │   ├── Lights: Fixed set of adjacent cells
│   │   └── Sprite Color: Red (#ff4444)
│   │
│   ├── RotatingGuard extends Guard
│   │   ├── Lights: 2 cells ahead in rotating direction
│   │   ├── Rotation: 90° clockwise each turn
│   │   └── Sprite Color: Blue (#4488ff)
│   │
│   ├── BlinkingGuard extends Guard
│   │   ├── Lights: Toggle on/off every turn
│   │   ├── State: isOn flag tracking
│   │   └── Sprite Color: Yellow (#ffdd44) / Dark yellow (#887722)
│   │
│   └── PatrollingGuard extends Guard
│       ├── Lights: Front + right cells
│       ├── Movement: Predefined path array
│       └── Sprite Color: Purple (#bb44ff)
│
├── TurnManager
│   ├── State: isPlayerTurn, turnCount
│   ├── nextTurn(): Execute guard actions, detect collision
│   └── Cycle: Player move → Guards update → Detection check
│
├── LightingSystem
│   ├── Graphics: Overlay layer for lit cell visualization
│   ├── updateLightFromGuards(): Aggregate all guard lights
│   └── clearAllLight(): Reset before each guard turn
│
└── LevelManager
    ├── Levels.js: Level data (grid, guards, walls, goal)
    ├── loadLevel(num): Instantiate level configuration
    └── 12 predefined levels with progressive difficulty
```

## Module Responsibilities

| Module | Purpose | Key Exports |
|--------|---------|------------|
| `GridSystem` | Manages grid state, cell types, boundaries | GridSystem class, cell queries |
| `Player` | Player character logic, movement validation | Player class, collision detection |
| `Guard` | Base + 4 specialized guard AI implementations | Guard, StaticGuard, RotatingGuard, BlinkingGuard, PatrollingGuard |
| `TurnManager` | Turn cycle execution, detection checks | TurnManager class, turn flow control |
| `LightingSystem` | Light rendering and aggregation from guards | LightingSystem class, light queries |
| `LevelManager` | Level loading and initialization | LevelManager class, level data access |
| `Levels` | Static level definitions (JSON-like objects) | LEVELS array (12 levels) |
| `theme.js` | Centralized UI constants and button factory | COLORS, FONTS, createButton, createSmallButton |
| `localization.js` | Multi-language string management | getText, setLanguage, getLanguage, initLanguage |
| `progress.js` | Level completion persistence | getProgress, completeLevel |

## Data Flow: Player Turn to Detection

```
Player Input (Arrow Key / Mouse Click)
    ↓
Game.handleInput() → validate move
    ↓
Player.move(newRow, newCol) → update position
    ↓
GridSystem.isWall() → block invalid moves
    ↓
TurnManager.nextTurn()
    ├→ LightingSystem.clearAllLight()
    ├→ For each Guard: guard.onTurnChange() → guard.updateLight()
    ├→ Aggregate all lit cells into GridSystem
    └→ GridSystem.isLight(playerRow, playerCol)?
        ├→ YES: showDetectionPopup() → lose life → restart level
        └→ NO: continue gameplay
```

## Asset & Resource Management

- **Sprites**: Phaser circle objects (guards, player) + image assets from `public/assets/`
- **Localization**: JSON files (`src/game/locales/en.json`, `vi.json`)
- **Levels**: JavaScript objects in `Levels.js` (no external files)
- **Progress**: Browser localStorage (`nntv-progress` key)
- **Language Preference**: Browser localStorage (`nntv-language` key)

## Performance Considerations

- **Grid Rendering**: Single graphics object redrawn per frame
- **Lighting Calc**: O(guardCount * cellsPerGuard) per turn
- **Max Grid**: 10x10 cells for optimal frame rate
- **Guard Limit**: 8 guards max per level
- **Turn Execution**: Synchronous (no async operations)

## Build & Deployment

**Dev Mode:** `npm run dev`
- Vite dev server with hot reload
- Source maps enabled
- Logging to console

**Prod Mode:** `npm run build`
- Vite bundling with terser minification
- Single bundle output to `dist/`
- Assets optimized and copied to `dist/assets/`

**Deployment:** Upload contents of `dist/` to web server (any static host)
