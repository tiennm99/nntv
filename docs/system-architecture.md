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
         │ GridSystem  │ Player       │ Guards     │
         │ TurnManager │ LevelSolver  │ Progress   │
         └──────────────────────────────────────┘
```

## Level Solver (Validation Tool)

BFS-based solvability checker at `src/lib/game/level-solver.js`. Verdicts are
test-only — the solver is not bundled into the runtime. It reuses the real
`guards.js` + `princess-mechanic.js` AI so results match live gameplay.

- **State key:** `(player.row, player.col, guardCaptures, princessCapture)` via
  each guard's `capture()` method. Includes chaser positions and patroller
  path indices.
- **Actions:** `up / down / left / right / wait` per turn.
- **Pruning:** after `turnManager.nextTurn` semantics, if player cell is lit
  the branch dies.
- **Budget:** 5M states default, caller-overridable. Returns
  `{ solvable, path?, reason?, states_explored }`.

CI-enforced invariants in `src/lib/levels/levels.solvability.test.js`:
- L1–L11 must be solvable.
- L12 must remain unsolvable (Princess Chamber easter-egg rule).
- No guard may light a wall cell (pre-existing authoring bug guard).
- Exactly 12 levels exist.

## Viewport (Camera-Follow)

`src/components/GameBoard.svelte` is wrapped by a scrollable `board-container`
div in `Game.svelte` with `max-width/height: min(720px, 85vw, 85vh); overflow: auto`.
A `$effect` in `Game.svelte` watches `player.row/col` and calls `scrollTo` with
smooth behavior so the player stays roughly centered on grids larger than the
viewport. `cellSize` is fixed at 50 — grids no longer shrink cells.

## L12 Easter Egg (Console Teleport)

`Game.svelte` `onMount` exposes `window.__nntvDev`:

```js
window.__nntvDev.teleport(row, col)  // Instantly move player; if on goal, win
window.__nntvDev.reveal()             // Read player/goal positions
```

Intentional escape hatch for L12 "Princess Chamber", which is unsolvable by
normal play. Teleporting to the goal fires the normal level-complete flow.
Cleaned up in `onDestroy`. Not documented in README or in-game UI.

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
    ├── GameBoard.svelte — CSS grid; each cell wraps a <Pixel> tile sprite
    ├── PlayerSprite.svelte — <Pixel> ninja rabbit (32×32)
    ├── GuardSprite.svelte — <Pixel> veggie sprite dispatched by guard.type
    ├── GameHud.svelte — pixel hearts + pixel icons + level/turns text
    ├── DetectionPopup.svelte — retry prompt
    ├── LevelCompletePopup.svelte — star rating + next-level action
    ├── ControlsOverlay.svelte — keyboard/tap/swipe reference
    └── PauseMenu.svelte — resume/restart/menu

Pixel Pipeline (src/lib/pixel/)
├── Pixel.svelte   — string-art + palette → inline SVG <rect>s (run-length merged, pixelated rendering)
├── palette.js     — NNTV color constants; semantic guard colors mirror theme.css
├── art-characters.js — player, princess, 6 guard veggies
├── art-tiles.js   — board tiles (empty/wall/goal/lit/mirror/preview)
├── art-ui.js      — hearts, moon, logo, pixel icons
└── art-scenes.js  — 6 act backdrops + sceneForLevel(n)
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
const snap = history.createSnapshot(player, guards, turnCount, princess.capture());
history.pushSnapshot(snap);
const state = history.undo(player, guards, turnManager, princess.capture());  // restores via g.apply(state.guards[i])
const state = history.redo(player, guards, turnManager, princess.capture());
princess.apply(state.princess);  // { alerted, alertRadius, messageShown }
```

- Max history size: 50 snapshots
- Triggered by Z key (undo) / Y key (redo)
- Snapshots reset redo stack on any new action
- Restores: player position, guards via `capture()/apply()` (dynamic state only), turn count, full princess state (including `messageShown`)
- Same `capture()/apply()` contract is used by `TurnManager.previewNextTurn` — any new dynamic guard field picked up automatically

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

- **Pixel art**: Inlined as string-art + palette constants in `src/lib/pixel/art-*.js`; rendered via `Pixel.svelte` as SVG `<rect>`s with run-length merging. No external image files.
- **Semantic color coupling**: Guard colors duplicated between `theme.css` CSS variables and `NNTV.guard*` JS constants — both sides must stay in sync for gameplay readability.
- **Act backdrops**: `sceneForLevel(n)` maps level → 80×N scene; used by `LevelIntro` and `Game` as opacity-dimmed backdrop.
- **Localization**: JSON files (`src/lib/locales/en.json`, `vi.json`)
- **Levels**: JS objects in `levels.js`
- **Progress**: localStorage key `nntv-progress`
- **Language**: localStorage key `nntv-language`
- **Audio**: Web Audio API (no external files)
- **Source-of-truth pixel authoring**: `public/assets/src/*.jsx` (Figma-style JSX canvas preview; ported manually into `src/lib/pixel/`)

## Build & Deployment

| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev server at localhost:8080 with HMR |
| `npm run build` | Production bundle to `dist/` |

**Deployment**: Upload `dist/` contents to any static host.
