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
│   ├── GameBoard.svelte             # CSS grid rendering
│   ├── GameHud.svelte               # Level/lives/turns display
│   ├── PlayerSprite.svelte          # Positioned player div
│   ├── GuardSprite.svelte           # Colored guard circle/diamond
│   ├── PauseMenu.svelte
│   └── DetectionPopup.svelte
│
├── lib/
│   ├── game/                        # Pure JS game engine (no framework)
│   │   ├── grid-system.js
│   │   ├── player.js
│   │   ├── guards.js                # Base + 5 guard subclasses
│   │   ├── turn-manager.js
│   │   └── level-manager.js
│   │
│   ├── levels/
│   │   └── levels.js                # 12 level definitions
│   │
│   ├── locales/
│   │   ├── en.json
│   │   └── vi.json
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
└── PatrollingGuard  — path movement + directional light
```

**Base Guard contract:**
- Constructor: `grid, row, col, type`
- `updateLight(allGuards?)`: Set lit cells on grid
- `onTurnChange(allGuards?)`: Update state then call updateLight

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

## Code Review Checklist

- [ ] Follows naming conventions (PascalCase components, kebab-case JS modules)
- [ ] No dead code or commented-out blocks
- [ ] Class mutations followed by `renderVersion++`
- [ ] No hardcoded colors (use CSS variables)
- [ ] Localization keys used for all user-facing strings
- [ ] File size under 200 lines
- [ ] Pure JS game logic has no Svelte imports
