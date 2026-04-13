## Phase 4: Guard Vision Preview (Optional)

**Priority:** P3 | **Status:** Pending | **Effort:** 45min

### Overview

Show semi-transparent overlay of cells that will be lit NEXT turn.
Helps player plan without trial-and-error. Toggle via button or hotkey.

### Data Flow

1. Before rendering, simulate next turn's guard positions/lights on a **cloned grid**
2. Diff current lit cells vs next-turn lit cells
3. Render "preview" cells with distinct CSS class (e.g., `cell-preview` with 20% opacity warning color)

### Implementation

#### `src/lib/game/turn-manager.js`
- [ ] Add `previewNextTurn(grid, guards)` method:
  - Deep-clone guard states (row, col, direction, isOn, currentPathIndex, isReversing)
  - Create temporary grid clone
  - Run `onTurnChange` on clones
  - Return Set of `"row,col"` strings for next-turn lit cells

#### `src/scenes/Game.svelte`
- [ ] Add `showPreview` toggle state (default false)
- [ ] Bind `v` key or HUD button to toggle
- [ ] Compute `previewCells` derived from `turnManager.previewNextTurn()` when toggle on
- [ ] Pass `previewCells` to `GameBoard`

#### `src/components/GameBoard.svelte`
- [ ] Accept optional `previewCells` prop
- [ ] Add `cell-preview` CSS class to cells in preview set

### Edge Cases

- Chaser guard preview needs player position — pass current player pos to preview
- Level 12 expanding wave — preview should show next ring expansion
- Performance: cloning 5-10 guards per frame is trivial for grid sizes <= 10x10

### Success Criteria

- Toggle shows/hides next-turn danger zones
- Preview visually distinct from current lit cells (different opacity/color)
- No performance impact on turn processing

### Rollback

Revert commit. Preview is purely additive UI — no game logic changes.
