## Phase 1: Wait Action

**Priority:** P1 | **Status:** Pending | **Effort:** 15min

### Overview

Spacebar (and tap-on-player for mobile) skips the player's move but still advances guards.
Creates timing puzzles — player must wait for a safe window.

### Data Flow

1. User presses Space / taps player cell
2. `handleMove` is NOT called; instead new `handleWait()` fires
3. `handleWait` calls `turnManager.nextTurn(grid, player, guards)` without moving player
4. Same detection/completion checks run
5. `renderVersion++` triggers re-render

### Files to Modify

**`src/scenes/Game.svelte`** (input handler only)

### Implementation Steps

- [ ] 1. In `onKeyDown`, add `' '` (Space) key check before direction map lookup
- [ ] 2. When Space detected, call `handleWait()` and `e.preventDefault()`
- [ ] 3. Create `handleWait()` function:
  ```js
  function handleWait() {
      if (!player || !grid) return;
      const result = turnManager.nextTurn(grid, player, guards);
      if (isFinalLevel && checkFinalLevel()) { renderVersion++; return; }
      renderVersion++;
      if (result.levelComplete) handleLevelComplete();
      else if (result.detected) detected = true;
  }
  ```
- [ ] 4. In `onCellClick`, if clicked cell === player position, call `handleWait()`

### Edge Cases

- Wait on level 12 still triggers princess detection expansion (covered — same `checkFinalLevel` path)
- Wait when already at goal: `nextTurn` returns `levelComplete: true` (correct)
- Wait counts as a turn for move counter (correct — `turnManager.turnCount++` happens in `nextTurn`)

### Success Criteria

- Space key advances turn without moving player
- Guards rotate/patrol/blink as normal
- Turn counter increments
- Detection still works if guard light reaches player after wait

### Rollback

Revert single commit. No schema changes.
