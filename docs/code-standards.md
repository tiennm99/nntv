# Code Standards - Night Ninja: Twilight Voyage

## Naming Conventions

### Files
- **Svelte components**: PascalCase (`Game.svelte`, `GameBoard.svelte`, `PlayerSprite.svelte`)
- **JS modules**: kebab-case (`grid-system.js`, `turn-manager.js`, `level-manager.js`)
- **JSON/config**: kebab-case (`en.json`, `vi.json`, `theme.css`)

### Variables & Functions
- **Classes**: PascalCase (`GridSystem`, `Player`, `RotatingGuard`)
- **Methods & Functions**: camelCase (`updateLight()`, `nextTurn()`, `getText()`)
- **Constants**: UPPER_CASE for arrays (`LEVELS`), camelCase for others
- **Svelte state**: camelCase (`renderVersion`, `isPaused`, `detected`)
- **Props**: camelCase (`cellSize`, `oncellclick`, `onplayagain`)

### Grid Coordinates
- **row**: Vertical axis (0 = top, increases downward)
- **col**: Horizontal axis (0 = left, increases rightward)
- **Position objects**: `{ row: num, col: num }`

## Code Organization

### Directory Structure

```
src/
├── main.js                          # Entry point, mounts App.svelte
├── App.svelte                       # Scene router ({#key} + fade)
│
├── scenes/                          # Full-page scene components
│   ├── MainMenu.svelte
│   ├── StoryIntro.svelte
│   ├── LevelIntro.svelte
│   ├── LevelSelect.svelte
│   ├── Game.svelte                  # Main gameplay (state owner)
│   ├── GameOver.svelte
│   ├── Settings.svelte
│   └── Guide.svelte
│
├── components/                      # Reusable UI components
│   ├── Button.svelte
│   ├── GameBoard.svelte             # Grid of pixel tiles
│   ├── GameHud.svelte               # Pixel hearts + pixel icons + level/turns
│   ├── PlayerSprite.svelte          # Pixel rabbit
│   ├── GuardSprite.svelte           # Pixel veggie dispatched by guard.type
│   ├── PauseMenu.svelte
│   ├── DetectionPopup.svelte
│   ├── LevelCompletePopup.svelte
│   └── ControlsOverlay.svelte
│
├── lib/
│   ├── game/                        # Pure JS game engine (no framework)
│   │   ├── grid-system.js
│   │   ├── player.js
│   │   ├── guards.js                # Base + 6 guard subclasses; capture()/apply() contract
│   │   ├── turn-manager.js          # Uses guard.capture()/apply() for non-destructive preview
│   │   ├── level-manager.js         # GUARD_REGISTRY factory pattern
│   │   ├── game-history.js          # Undo/redo system
│   │   ├── princess-mechanic.js     # Level 12 escalating detection; capture()/apply()
│   │   └── touch-controls.js        # Mobile swipe support
│   │
│   ├── pixel/                       # Pixel-art rendering pipeline
│   │   ├── Pixel.svelte             # String-art + palette → SVG rects
│   │   ├── palette.js               # NNTV color constants
│   │   ├── art-characters.js        # Rabbit, princess, 6 veggie guards
│   │   ├── art-tiles.js             # 16×16 board tiles
│   │   ├── art-ui.js                # Hearts, moon, logo, icons
│   │   └── art-scenes.js            # 80×N act backdrops + sceneForLevel(n)
│   │
│   ├── levels/
│   │   └── levels.js                # 12 level definitions
│   │
│   ├── locales/
│   │   ├── en.json
│   │   └── vi.json
│   ├── audio.js                     # Web Audio API sounds
│   ├── localization.js
│   └── progress.js
│
└── styles/
    └── theme.css                    # CSS variables (colors, fonts)
```

### File Size Limits
- **Maximum 200 lines per file** before considering split
- Scenes with heavy logic → extract to `lib/game/`
- Shared UI → extract to `components/`

## Svelte 5 Patterns

### State Management
```javascript
// Primitive state
let isPaused = $state(false);

// Class instances (NOT auto-proxied — use renderVersion pattern)
let grid = $state(null);
let player = $state(null);
let renderVersion = $state(0);

// Derived values depend on renderVersion to pick up class mutations
let cells = $derived((renderVersion, grid ? grid.getAllCells() : []));
```

### Props
```javascript
let { navigate, level = 1, lives = 3 } = $props();
```

### Event Handlers
```svelte
<!-- Window-level events -->
<svelte:window onkeydown={onKeyDown} />

<!-- Component events via callback props -->
<Button text="Resume" onclick={() => isPaused = false} />
```

### Scene Navigation
```javascript
// Parent passes navigate function as prop
navigate('Game', { level: 3, lives: 2 });

// App.svelte routes via {#key currentScene}
```

## Class & Inheritance Patterns

### Guard Hierarchy

```
Guard (abstract base)
├── StaticGuard      — fixed lit cells
├── RotatingGuard    — rotating beam + mirror reflection
├── BlinkingGuard    — toggle on/off
├── MirrorGuard      — redirects beams
├── PatrollingGuard  — path movement + directional light
└── ChaserGuard      — BFS pathfinding + detection radius
```

**Base Guard contract:**
- Constructor: `grid, row, col, type`
- `updateLight(allGuards?)`: Set lit cells on grid
- `onTurnChange(allGuards?)`: Update state then call updateLight

**Level Manager Pattern:**
Use `GUARD_REGISTRY` factory pattern in `level-manager.js`:
```javascript
const GUARD_REGISTRY = {
    static: (grid, g) => new StaticGuard(...),
    chaser: (grid, g) => new ChaserGuard(...),
    // ... etc
};
```
This eliminates switch statements and allows easy guard type registration.

**Key rule**: Game engine classes are pure JS with no Svelte dependency. They operate on raw object references, not proxied state.

## Grid & Coordinate System

- **Origin**: Top-left (0, 0)
- **Row**: 0 = top, increases downward
- **Col**: 0 = left, increases rightward
- **Cell Data**: `grid[row][col]` = `{ isWall, isGoal, isLight }`
- **Pixel Position**: `row * cellSize`, `col * cellSize`

## Theme & Styling

All visual constants centralized in `src/styles/theme.css` as CSS variables:
- `--bg-dark`, `--bg-panel` — backgrounds
- `--grid-empty`, `--grid-wall`, `--grid-goal`, `--grid-lit` — cell colors
- `--guard-static`, `--guard-rotating`, `--guard-blinking`, `--guard-patrolling`, `--guard-mirror` — guard colors
- `--font-title`, `--font-body`, `--font-button` — typography
- `--text-primary`, `--text-accent`, `--text-danger` — text colors

Component-scoped `<style>` blocks reference these variables. No inline color values.

**Pixel-art color coupling:** Guard colors are duplicated in `src/lib/pixel/palette.js` as `NNTV.guardStatic`, `NNTV.guardRotating`, etc. These MUST stay in sync with the `--guard-*` CSS variables because gameplay readability depends on consistent color semantics across CSS cells and SVG sprites. Change both sides together.

## Error Handling

- **Try-catch**: localStorage operations (`progress.js`, `localization.js`)
- **Null checks**: `if (!player || !grid) return` in input handlers
- **Validation**: Grid bounds checked before all cell operations
- **Fallback**: Missing translations return key string itself

## Localization Pattern

```javascript
import { getText } from '../lib/localization.js';

const message = getText('level1Story');  // Returns EN or VI string
```

Key naming: camelCase matching JSON structure (`levelSelectTitle`, `enemyTypesContent`).

## Git & Commit Conventions

- **Format**: Conventional commits (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`)
- **Branch**: `main` for production
- **Messages**: Descriptive, explain "why" not just "what"
- **Example**: `fix: resolve Svelte 5 reactivity for class instances`

## New Patterns

### Undo/Redo System
```javascript
import { GameHistory } from '../lib/game/game-history.js';
const history = new GameHistory();

// Before player move
const snap = history.createSnapshot(player, guards, turnCount, princess.capture());
history.pushSnapshot(snap);

// Z/Y key handlers
if (event.key === 'z') {
    const state = history.undo(player, guards, turnManager, princess.capture());
    if (state) princess.apply(state.princess);
}
if (event.key === 'y') {
    const state = history.redo(player, guards, turnManager, princess.capture());
    if (state) princess.apply(state.princess);
}
```

### Guard capture()/apply() Contract
Every guard exposes `capture()` (returns dynamic state object) and `apply(state)` (restores). Used by both `GameHistory` and `TurnManager.previewNextTurn` — new dynamic fields picked up automatically without touching either caller.

```javascript
class Guard {
    capture() { return { row, col, direction, isOn }; }
    apply(s) { this.row = s.row; ... }
}
// Subclasses override via super.capture(), adding their own fields (isChasing, currentPathIndex, etc.)
```

### Pixel Sprite Usage
```svelte
import Pixel from '../lib/pixel/Pixel.svelte';
import { RABBIT_ART, RABBIT_PAL } from '../lib/pixel/art-characters.js';

<Pixel art={RABBIT_ART} palette={RABBIT_PAL} width={size} height={size} />
```
Art data is string arrays of equal length; palette maps single characters → hex colors; `.`/` ` is transparent.

### Mobile Touch Controls
```javascript
import { TouchControls } from '../lib/game/touch-controls.js';
const touch = new TouchControls();

// In Game.svelte
<svelte:window ontouchstart={e => touch.onTouchStart(e)} 
               ontouchend={e => { const dir = touch.onTouchEnd(e); handleMove(dir); }} />
```

### Audio Feedback
```javascript
import * as audio from '../lib/audio.js';
audio.playMoveSound();
audio.playDetectionSound();
audio.toggleMute();
```

## Code Review Checklist

- [ ] Follows naming conventions (PascalCase components, kebab-case JS modules)
- [ ] No dead code or commented-out blocks
- [ ] Class mutations followed by `renderVersion++`
- [ ] No hardcoded colors (use CSS variables or NNTV palette constants)
- [ ] Localization keys used for all user-facing strings
- [ ] File size under 200 lines (pixel art data files exempt)
- [ ] Pure JS game logic has no Svelte imports
- [ ] Guard types registered in GUARD_REGISTRY (not switch statements)
- [ ] Guards extending the hierarchy override `capture()/apply()` if they add dynamic state
- [ ] Touch input debounced/throttled if needed
- [ ] Audio context lazily initialized (autoplay policy compliance)
- [ ] Pixel color semantics (`--guard-*` CSS vars ↔ `NNTV.guard*`) kept in sync when modifying theme
