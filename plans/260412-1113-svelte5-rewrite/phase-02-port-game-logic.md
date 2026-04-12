# Phase 2: Port Pure Game Logic

**Priority:** Critical | **Status:** pending | **Effort:** Medium

## Overview
Move all framework-agnostic game logic into `src/lib/`. Strip Phaser imports. Separate data/logic from rendering.

## Steps

1. **Copy as-is** (just move files):
   - `locales/en.json` → `src/lib/locales/en.json`
   - `locales/vi.json` → `src/lib/locales/vi.json`
   - `levels/Levels.js` → `src/lib/levels/levels.js`
   - `progress.js` → `src/lib/progress.js`
   - `localization.js` → `src/lib/localization.js`

2. **Port TurnManager** → `src/lib/game/turn-manager.js`
   - Remove `import Phaser` (line 1)
   - Remove `this.scene` references
   - Make it accept callbacks instead of calling scene methods directly
   - Constructor takes `{ onLevelComplete, onDetected, getPlayerPos, getGrid, getGuards, getLightSystem }`

3. **Port GridSystem** → `src/lib/game/grid-system.js`
   - Keep: grid data model, isValidPosition, setWall/setGoal/setLight, gridToPixel, pixelToGrid
   - Remove: `scene.add.graphics()`, `render()` method, all Phaser graphics calls
   - Merge LightingSystem's `clearAllLight()` into GridSystem
   - Add `getCellState(row, col)` returning `{ isWall, isGoal, isLight }`

4. **Port Guards** → `src/lib/game/guards.js`
   - Keep: all guard logic (updateLight, onTurnChange, patrol path, rotation, blinking)
   - Remove: `createSprite()`, `update()` (sprite positioning), `scene.add.circle/line`
   - Remove: `destroy()` sprite cleanup (no sprites to destroy)
   - Each guard exposes: `{ row, col, color, type, direction, isOn }` for rendering

5. **Port Player** → `src/lib/game/player.js`
   - Keep: `moveTo()`, `move()`, `isInLitCell()`, `isAtGoal()`
   - Remove: `createSprite()`, `update()` (sprite), tweens
   - Pure data: `{ row, col }` position tracking

6. **Port LevelManager** → `src/lib/game/level-manager.js`
   - Rewrite as a pure function: `loadLevel(levelId, grid)` → returns `{ player, guards, isFinalLevel }`
   - No scene references
   - Creates guard instances, sets up grid walls/goals

## Files to Create
- `src/lib/game/grid-system.js`
- `src/lib/game/guards.js`
- `src/lib/game/player.js`
- `src/lib/game/turn-manager.js`
- `src/lib/game/level-manager.js`
- `src/lib/localization.js`
- `src/lib/progress.js`
- `src/lib/locales/en.json`
- `src/lib/locales/vi.json`
- `src/lib/levels/levels.js`

## Files to Delete (after all phases complete)
- Entire `src/game/` directory

## Success Criteria
- All game logic files import zero Phaser code
- Guard logic can be tested independently (no DOM/canvas needed)
- `loadLevel()` returns a complete game state object
