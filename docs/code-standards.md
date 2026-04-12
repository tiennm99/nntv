# Code Standards - Night Ninja: Twilight Voyage

## Naming Conventions

### JavaScript Files
- **Scenes**: PascalCase (e.g., `Boot.js`, `Game.js`, `MainMenu.js`)
- **Classes/Objects**: PascalCase (e.g., `GridSystem.js`, `Player.js`, `Guard.js`)
- **Utilities**: camelCase (e.g., `localization.js`, `progress.js`, `theme.js`)

### Variables & Functions
- **Classes**: PascalCase (`class GridSystem {}`, `class Player {}`)
- **Methods & Functions**: camelCase (`updateLight()`, `nextTurn()`, `getText()`)
- **Constants**: camelCase in exports (`COLORS`, `FONTS`, `LEVELS`)
- **Variables**: camelCase (`playerRow`, `guardColor`, `cellSize`)
- **Parameters**: camelCase (`row`, `col`, `guard`)

### Grid Coordinates
- **row**: Vertical axis (0 = top, increases downward)
- **col**: Horizontal axis (0 = left, increases rightward)
- **Position objects**: `{ row: num, col: num }`

## Code Organization

### Directory Structure

```
src/
├── main.js                          # Entry point, Phaser config
└── game/
    ├── scenes/                      # 8 scene files
    │   ├── Boot.js
    │   ├── Preloader.js
    │   ├── MainMenu.js
    │   ├── StoryIntro.js
    │   ├── LevelSelect.js
    │   ├── Game.js                  # Main gameplay scene
    │   ├── GameOver.js
    │   ├── Settings.js
    │   └── Guide.js
    ├── objects/                     # Core game objects
    │   ├── GridSystem.js
    │   ├── Player.js
    │   ├── Guard.js                 # Base + 4 guard subclasses
    │   ├── TurnManager.js
    │   └── LightingSystem.js
    ├── levels/                      # Level data & management
    │   ├── Levels.js                # 12 level definitions
    │   ├── LevelManager.js
    │   └── LevelTester.js           # Debug utility
    ├── locales/                     # Localization JSON
    │   ├── en.json
    │   └── vi.json
    ├── theme.js                     # UI constants & factory
    ├── localization.js              # String management
    ├── progress.js                  # Progress persistence
    └── (additional utilities as needed)
```

### File Size Limits
- **Maximum 200 lines per file** (before considering split)
- Scenes with heavy logic → extract objects to `objects/`
- Utility functions → consolidate into focused modules

## Class & Inheritance Patterns

### Guard Inheritance Chain

```
Guard (abstract base)
├── StaticGuard
├── RotatingGuard
├── BlinkingGuard
└── PatrollingGuard
```

**Base Guard Responsibilities:**
- Constructor: `scene, grid, row, col, color`
- `createSprite()`: Instantiate circle sprite at grid position
- `updateLight()`: Overridden by subclasses
- `onTurnChange()`: Overridden by subclasses
- `destroy()`: Cleanup sprite resources
- `update()`: Sync sprite position each frame

**Subclass Contract:**
- Must implement `updateLight()` → call `grid.setLight()` for lit cells
- Must implement `onTurnChange()` → update internal state (rotation, blink, position)
- May store additional state (direction, isOn, pathIndex, etc.)

## Phaser Scene Lifecycle

All scenes follow standard Phaser pattern:

```javascript
export class ExampleScene extends Phaser.Scene {
    constructor() {
        super('SceneName');
        // Initialize properties only (no heavy setup)
    }

    init(data) {
        // Receive data from previous scene
    }

    preload() {
        // Load assets (only in Boot & Preloader)
    }

    create() {
        // Initialize scene objects, UI, event listeners
    }

    update() {
        // Per-frame logic (player input, animations)
    }

    shutdown() {
        // Cleanup (optional)
    }
}
```

## Grid & Coordinate System

- **Origin**: Top-left (0, 0)
- **Row**: 0 = top, increases downward
- **Col**: 0 = left, increases rightward
- **Cell Data**: `grid[row][col]` = `{ isWall, isGoal, isLight }`
- **Screen Coords**: `scene.gridToScreen(row, col)` → `{ x, y }`

## Theme & UI Constants

**All colors centralized in `theme.js`:**
- Grid colors (empty, wall, goal, lit)
- Guard colors (static red, rotating blue, blinking yellow, patrolling purple)
- UI colors (buttons, text, borders)
- Font definitions (title, heading, body, small)

**Button Creation:**
```javascript
createButton(scene, x, y, text, onClick, width, height)
createSmallButton(scene, x, y, text, onClick)
```

## Error Handling

- **Try-catch**: Used in localStorage operations (`progress.js`, `localization.js`)
- **Null checks**: Guard scene objects before method calls (`TurnManager`, `LightingSystem`)
- **Validation**: Input bounds checked before grid operations
- **Fallback**: Missing translations default to English, then to key itself

## Localization Pattern

```javascript
// In any scene:
import { getText } from '../localization';

const message = getText('level_complete');  // Returns EN or VI string
```

**Key naming:** `snake_case` matching JSON structure (e.g., `intro_title`, `guard_static`)

## Performance Guidelines

- **Grid Rendering**: Single `graphics` object, redraw every frame
- **Lighting Calculations**: Batch-compute after all guard actions
- **Sprite Updates**: Update position each frame if moving
- **Event Listeners**: Register in `create()`, remove in `shutdown()`
- **Avoid**: Nested loops for 10x10 grids acceptable; limit nested loops for 8+ guards

## Git & Commit Conventions

- **Commits**: Follow conventional commits (feat, fix, refactor, test, docs)
- **Branch**: `main` for production, feature branches for development
- **Messages**: Descriptive, reference issue numbers when applicable
- **Example**: `feat: add rotating guard AI type`

## Testing

- **Unit Tests**: Test guard AI logic, grid validation, level loading
- **Integration Tests**: Test turn cycles, detection mechanics
- **Manual QA**: Play all 12 levels, verify UI responsiveness
- **Browser**: Test on Chrome, Firefox, Safari (Phaser AUTO handles rendering)

## Documentation Requirements

- **Comments**: Explain "why" not "what"; code clarity preferred over comments
- **Complex Logic**: Comment guard AI decision logic, collision detection
- **Localization**: Document new translation keys in locale JSON files
- **Breaking Changes**: Note in commit message and update related docs

## Code Review Checklist

- [ ] Follows naming conventions (PascalCase classes, camelCase methods)
- [ ] No dead code or commented-out blocks
- [ ] Error handling for async/localStorage operations
- [ ] Null/undefined checks for dynamic objects
- [ ] Consistent indentation (2 spaces per Phaser convention)
- [ ] No hardcoded colors (use `theme.js` COLORS)
- [ ] Localization keys used instead of hardcoded strings
- [ ] File size under 200 lines (split if needed)
