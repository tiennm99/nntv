# Codebase Summary - Night Ninja: Twilight Voyage

## Overview

NNTV is a turn-based stealth puzzle game built with Svelte 5 and Vite 6.x. The codebase separates pure JS game engine (classes in `lib/game/`) from Svelte rendering (scenes + components). State flows one-way: game classes mutate internally, then `renderVersion++` triggers Svelte re-derivation.

## Module Inventory

### Entry Point
- **src/main.js** — Mounts `App.svelte` into `#app`

### Scene Router
- **src/App.svelte** — `{#key currentScene}` with `transition:fade`, passes `navigate` as prop; hosts migration modal (v2 progress-reset) shown once on first launch

### Scenes (src/scenes/)

| File | Purpose |
|------|---------|
| MainMenu.svelte | Start game, level select, settings, guide |
| StoryIntro.svelte | Scrolling narrative with skip button |
| LevelIntro.svelte | Level name + story/foreshadowing text + continue |
| LevelSelect.svelte | 4×3 grid of level buttons (locked/unlocked/completed) |
| Game.svelte | Main gameplay: state owner, input, turn loop, rendering, audio wiring |
| GameOver.svelte | Run-complete (L11) or bittersweet (L12) end screen |
| Settings.svelte | Language toggle (EN/VI) |
| Guide.svelte | Rules, controls, all enemy type descriptions |

### Components (src/components/)

| File | Purpose |
|------|---------|
| Button.svelte | Reusable styled button |
| GameBoard.svelte | CSS grid of cells, each rendering a pixel-art tile |
| GameHud.svelte | Level, turns, pixel-icon action buttons; conditionally mounts StonesCounter + KeyInventory + AffordanceBanner |
| PlayerSprite.svelte | Pixel-art ninja rabbit sprite, absolute-positioned over board |
| GuardSprite.svelte | Pixel-art veggie sprite dispatched by guard.type; sniper/suspicion use tier-state palettes |
| StonesCounter.svelte | HUD pill — stone count with pixel-art rock icon; only mounted when level has stones |
| KeyInventory.svelte | HUD row — collected key chips with pixel-art key icons (gold/silver/copper) |
| SuspicionRing.svelte | Visual overlay showing suspicion guard alert radius |
| ThrowTargetingOverlay.svelte | Full-board overlay in throw-targeting mode; green valid / red invalid halos; localized hint bar |
| AffordanceBanner.svelte | Stacked banners when level disables undo and/or preview; uses `getText` for locale copy |
| DetectionPopup.svelte | "Detected!" overlay with retry (restarts current level) |
| LevelCompletePopup.svelte | Star rating, best moves vs par, next-level action |
| PauseMenu.svelte | Resume / restart / main menu |
| ControlsOverlay.svelte | Keyboard / tap / swipe reference overlay |

### Game Engine (src/lib/game/) — Pure JS, no Svelte

| File | Purpose |
|------|---------|
| grid-system.js | GridSystem class: cell state (walls, goals, lighting, doors, warm tiles) |
| player.js | Player class: position, movement validation, key inventory (bitmask `keysHeld`), `getKeysHeld()` |
| guards.js | Guard base + 8 subclasses (Static, Rotating, Blinking, Mirror, Patrolling, Chaser, SniperGuard, SuspicionGuard) |
| throwable.js | ThrowableSystem: stone inventory, throw validation (Manhattan ≤3, LoS via Bresenham, guard proximity), distraction logic |
| turn-manager.js | TurnManager: turn cycle, guard updates, throwable integration, detection check |
| level-manager.js | loadLevel(): GUARD_REGISTRY factory pattern for all 8 guard types; reads doors/keys/oneWays/decayTiles/affordances/stones from level data |
| level-solver.js | BFS solvability checker (test-only); reuses runtime AI via capture()/apply() |
| game-history.js | GameHistory: undo/redo snapshots including grid door state + throwSystem stone count |
| princess-mechanic.js | Princess detection logic: escalating light rings on L12 |
| touch-controls.js | TouchControls: pointer gesture detection |

### Level Data (src/lib/levels/)

| File | Purpose |
|------|---------|
| levels.js | LEVELS array: 12 level definitions; extended shape with doors, keys, oneWays, decayTiles, affordances, stones |
| levels.solvability.test.js | CI-enforced: each L1–L11 solvable, L12 unsolvable, no wall/light overlaps, exactly 12 levels |

### Pixel-Art Pipeline (src/lib/pixel/)

| File | Purpose |
|------|---------|
| Pixel.svelte | SVG renderer: string-art + palette → run-length-merged `<rect>`s; `scale`, `bg`, `pixelated` props |
| palette.js | NNTV color constants (mirrors theme.css guard colors; extended atmosphere + veggie + tile tones) |
| art-characters.js | 32×32 sprites: rabbit, princess, 8 guard veggies; SNIPER_ART + SUSPICION_CALM/ALERT/FIRE variants; GUARD_SPRITES map |
| art-tiles.js | 16×16 board tiles: empty, wall, goal, lit, mirror, preview; **new**: TILE_WARM, TILE_DOOR_* (locked/open × 3 colors), TILE_KEY_* (3 colors), TILE_ONEWAY_RIGHT, ICON_STONE |
| art-ui.js | Heart (full/empty), moon, logo, pixel icons (undo/redo/eye/pause/settings/lang/arrow) |
| art-scenes.js | 80×N act backdrops + SCENE_BY_LEVEL mapping (garden/walls/fortress/underground/palace/chamber) |

### Audio System (src/lib/)

| File | Purpose |
|------|---------|
| audio.js | Web Audio API procedural sound: move, wait, detect, complete, click, undo; **new**: playStoneThrow, playStoneImpact, playKeyPickup, playDoorUnlock, playSuspicionAlert, playSuspicionFire |

### Utilities (src/lib/)

| File | Purpose |
|------|---------|
| localization.js | getText / setLanguage / getLanguage / initLanguage |
| progress.js | getProgress / completeLevel via localStorage; version field for migration detection |

### Localization (src/lib/locales/)

| File | Keys | Purpose |
|------|------|---------|
| en.json | ~75 | English translations — includes mechanics.*, banner.*, migration.*, throw.*, gameOver.*, level intros |
| vi.json | ~75 | Vietnamese translations — full parity with EN; proper nouns localised (e.g. "Ớt Bắn Tỉa", "Hành Tím Nghi Ngờ") |

### Styles (src/styles/)

| File | Purpose |
|------|---------|
| theme.css | CSS variables: colors, fonts, guard colors, grid colors |

## Class Hierarchy

### Guard Inheritance

```
Guard (abstract base: grid, row, col, type, direction, isOn)
├── StaticGuard      — wilting tomato: Manhattan aura shrinks by 1/turn
├── RotatingGuard    — rotates beam 90°/turn, castBeam with mirror bounce
├── BlinkingGuard    — toggles isOn, lights litCells when on
├── MirrorGuard      — lights own cell, stores reflectDirection (cw/ccw)
├── PatrollingGuard  — follows path array, lights front + right cells
├── ChaserGuard      — BFS pathfinding to player, detectionRadius range
├── SniperGuard      — cardinal aim line; instant detection on aim-line crossing
└── SuspicionGuard   — tier-based alert (0=calm, 1=alerted, 2=firing); field-of-view zone
```

## Key Data Structures

### Level Definition (v2 shape)
```javascript
{
  id: 1, name: "Garden Path", storyKey: "level1Story",
  grid: { rows: 8, cols: 8 },
  player: { row: 0, col: 0 },
  goal:   { row: 7, col: 7 },
  walls:  [{ row, col }, ...],
  guards: [
    { type: "static",     position: { row, col }, initialRadius: 2 },
    { type: "rotating",   position: { row, col }, startDirection: 0 },
    { type: "blinking",   position: { row, col }, litCells: [...], startState: true },
    { type: "mirror",     position: { row, col }, reflectDirection: "cw" },
    { type: "patrolling", startPosition: { row, col }, path: [...] },
    { type: "chaser",     position: { row, col }, detectionRadius: 3 },
    { type: "sniper",     position: { row, col }, direction: 1 },
    { type: "suspicion",  position: { row, col }, viewZone: [...] },
  ],
  // v2 extensions:
  oneWays:    [{ row, col, dir: 0|1|2|3 }],  // 0=up,1=right,2=down,3=left
  doors:      [{ row, col, keyId: 1|2|3 }],
  keys:       [{ row, col, keyId: 1|2|3 }],
  decayTiles: [{ row, col }],
  stones:     3,                              // throwable stone count (0 = no throws)
  affordances: { undo: true, preview: true }, // false = gate disabled
  parMoves:   22,
  isFinalLevel: false,
}
```

### Cell State (v2)
```javascript
{ isWall: boolean, isGoal: boolean, isLight: boolean, isWarm: boolean,
  doorKeyId: number|null, isOneWay: boolean, oneWayDir: number|null }
```

### Progress (localStorage)
```javascript
{ maxLevel: 1, completedLevels: [1, 2], version: 2 }
```

## Public API Summary

### GridSystem
```
new GridSystem(rows, cols)
.isValidPosition(r,c), .isWall(r,c), .setWall(r,c,v)
.isGoal(r,c), .setGoal(r,c,v)
.isLight(r,c), .setLight(r,c,v)
.isWarm(r,c), .setWarm(r,c,v)
.clearAllLight(), .getAllCells() → [{row,col,isWall,isGoal,isLight,isWarm,...}]
```

### Player
```
new Player(grid, row, col)
.move(direction) → boolean
.isInLitCell() → boolean, .isAtGoal() → boolean
.getKeysHeld() → number  // bitmask
.addKey(keyId), .hasKey(keyId) → boolean
```

### ThrowableSystem
```
new ThrowableSystem(stones)
.stonesLeft → number
.throw(targetRow, targetCol, player, grid) → boolean
.hasLineOfSight(r0,c0,r1,c1,grid) → boolean
.reset(stones)
```

### Guards
```
All: .updateLight(allGuards?), .onTurnChange(allGuards?)
All: .capture() → state, .apply(state)
SniperGuard:    .getAimLine() → [{row,col}]
SuspicionGuard: .suspicionTier (0|1|2), .updateSuspicion(playerRow,playerCol)
```

### PrincessMechanic
```
new PrincessMechanic()
.update(grid, player, goalRow, goalCol) → { showMessage, detected }
.lightRing(grid, goalRow, goalCol, radius)
.capture() → { alerted, alertRadius, messageShown }, .apply(state)
```

### GameHistory
```
new GameHistory()
.createSnapshot(player, guards, turnCount, princessState, grid, throwSystem) → snapshot
.pushSnapshot(snap), .undo(...), .redo(...)
.canUndo(), .canRedo(), .reset()
```

### TurnManager
```
new TurnManager()
.nextTurn(grid, player, guards, throwSystem?) → { detected, levelComplete }
.previewNextTurn(grid, player, guards, throwSystem?) → Set<string>
.reset()
```

### Audio (src/lib/audio.js)
```
playMove(), playWait(), playDetection(), playLevelComplete(), playClick(), playUndo()
playStoneThrow(), playStoneImpact()
playKeyPickup(), playDoorUnlock()
playSuspicionAlert(), playSuspicionFire()
setMuted(bool), isMuted() → bool
```

## Audio Wiring (Game.svelte)

| Event | Trigger | Functions |
|-------|---------|-----------|
| Player move | `player.move()` succeeds | `playMove()` |
| Player wait | Space key | `playWait()` |
| Detection | `result.detected` | `playDetection()` |
| Level complete | `result.levelComplete` | `playLevelComplete()` |
| Undo | Z key | `playUndo()` |
| Stone throw | `confirmThrow()` → ok | `playStoneThrow()` + `playStoneImpact()` (80ms delay) |
| Key pickup | `keysHeld` delta in `$effect` | `playKeyPickup()` |
| Suspicion tier 1 | `maxTier` delta 0→1 in `$effect` | `playSuspicionAlert()` |
| Suspicion tier 2 | `maxTier` delta 1→2 in `$effect` | `playSuspicionFire()` |

## File Dependency Map

```
main.js → App.svelte
App.svelte → all scenes + migration modal

Game.svelte (central hub)
  ├── lib/game/level-manager.js → grid-system, player, guards, throwable, levels
  ├── lib/game/turn-manager.js
  ├── lib/game/game-history.js, princess-mechanic.js, touch-controls.js
  ├── lib/audio.js (12 exported cue functions)
  ├── lib/progress.js, lib/localization.js
  ├── lib/pixel/Pixel.svelte, lib/pixel/art-scenes.js
  ├── components/GameBoard, PlayerSprite, GuardSprite, GameHud
  ├── components/ThrowTargetingOverlay, StonesCounter, KeyInventory
  ├── components/DetectionPopup, LevelCompletePopup, PauseMenu, ControlsOverlay
  └── renderVersion pattern for reactivity

GameHud.svelte → StonesCounter, KeyInventory, AffordanceBanner (conditional)
GuardSprite.svelte → art-characters (GUARD_SPRITES + sniper/suspicion palettes)
GameBoard.svelte → art-tiles (all tile types including TILE_WARM, TILE_DOOR_*, TILE_KEY_*, TILE_ONEWAY_*)
```

## Statistics

| Metric | Value |
|--------|-------|
| Total Source Files | ~42 (8 scenes + 12 components + 9 engine + 6 pixel + audio + utils) |
| Guard Types | 8 (Static, Rotating, Blinking, Mirror, Patrolling, Chaser, Sniper, Suspicion) |
| Number of Levels | 12 (across 6 acts) |
| Locale Keys per Language | ~75 |
| Max Grid Size | 13×13 |
| Max Guards per Level | 10 |
| Audio Cue Functions | 12 |
| Pixel-Art Sprite Variants | 20+ (characters + tiles + UI icons) |
