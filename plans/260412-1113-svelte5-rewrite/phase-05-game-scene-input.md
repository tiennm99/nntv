# Phase 5: Wire Game Scene + Input

**Priority:** Critical | **Status:** pending | **Effort:** Large

## Overview
The main Game.svelte scene — connects game logic (grid, guards, turns, player) to the visual components and handles keyboard/click input.

## Steps

1. **Game.svelte** — main game orchestrator
   - `$state` for: grid, player, guards, lives, level, turns, isPaused, detected, isFinalLevel
   - `onMount`: call `loadLevel()` to get initial state, set up keyboard listener
   - `onDestroy`: clean up keyboard listener
   - Render: GameBoard + PlayerSprite + GuardSprites + GameHud + overlays

2. **Keyboard input**
   ```js
   function onKeyDown(e) {
     if (isPaused || !inputEnabled) return;
     const dirMap = {
       ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
       w: 'up', s: 'down', a: 'left', d: 'right',
     };
     const dir = dirMap[e.key];
     if (dir) handleMove(dir);
   }
   ```
   - Bind to `window` via `svelte:window` directive: `<svelte:window onkeydown={onKeyDown} />`

3. **Click-to-move input**
   - GameBoard emits `oncellclick(row, col)`
   - Game.svelte checks if cell is adjacent to player, calls `handleMove()`

4. **Turn flow** (handleMove function)
   ```
   1. player.move(direction)
   2. If moved successfully:
      a. Check if player at goal → handleLevelComplete()
      b. clearAllLight()
      c. Each guard.onTurnChange()
      d. grid.render state update (triggers Svelte reactivity)
      e. Check if player in lit cell → showDetection()
      f. turns++
   ```

5. **Level 12 special mechanic**
   - On each move, check `isFinalLevel && Manhattan distance to goal <= 2`
   - If triggered: set ALL non-wall cells to `isLight = true`
   - Show princess detected message
   - This looks like normal gameplay — player won't know it's impossible until they experience it

6. **Detection flow**
   - Set `detected = true` → shows DetectionPopup
   - On "Play Again": `lives--`, if lives > 0 reload level, else navigate to GameOver

7. **Level complete flow**
   - Call `completeLevel()` from progress.js
   - Brief CSS flash animation on board
   - Navigate to LevelIntro for next level (or GameOver for final)

8. **Pause flow**
   - Toggle `isPaused` → shows PauseMenu
   - Resume / Restart / Main Menu actions

## Reactive State Shape

```js
// In Game.svelte
let grid = $state(null);       // GridSystem instance
let player = $state(null);     // Player instance
let guards = $state([]);       // Guard instances
let lives = $state(3);
let currentLevel = $state(1);
let turns = $state(0);
let isPaused = $state(false);
let detected = $state(false);
let isFinalLevel = $state(false);

// Derived for rendering
let cells = $derived(grid ? grid.getAllCells() : []);
let playerPos = $derived(player ? { row: player.row, col: player.col } : null);
let guardData = $derived(guards.map(g => ({
  row: g.row, col: g.col, type: g.constructor.name,
  direction: g.direction, isOn: g.isOn,
})));
```

## Success Criteria
- Arrow keys / WASD move player through grid
- Click adjacent cell moves player
- Guards update correctly each turn (static lit, rotating beam, blinking toggle, patrol movement)
- Detection popup shows when stepping on lit cell
- Level completes when reaching goal
- Level 12 lights up entire map near goal
- Pause menu works
- Lives decrement and game over triggers at 0
