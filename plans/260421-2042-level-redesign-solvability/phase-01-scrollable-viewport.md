# Phase 1: Scrollable Viewport

## Context
- Brainstorm: `plans/reports/brainstorm-260421-2042-level-redesign-solvability.md` §5
- Board component: `src/components/GameBoard.svelte` (90 LOC)
- Game scene: `src/scenes/Game.svelte` (409 LOC)

## Overview
- **Priority:** CRITICAL — blocks all grid >9x9 redesigns
- **Status:** pending
- Prereq for Acts 3–6 (grids 10x10–13x13). Desktop-first; no mobile handling.

## Key Insights
- Current rendering assumes full grid fits on screen → unplayable at 12x12+.
- Simple solution: CSS scroll container + `scrollIntoView` on player cell each turn.
- Svelte 5 runes: `$effect(() => ...)` to react to player position.

## Requirements
- Viewport shows ~9x9 cells. Grid larger than viewport scrolls.
- After each player move, scroll so player cell is visible (prefer centered).
- Smooth scroll (CSS `scroll-behavior: smooth`).
- No layout break at grids ≤8x8 (viewport = grid size, no scroll).

## Architecture
- Wrap `GameBoard.svelte` grid in a scrollable container `<div class="viewport">`.
- Fixed viewport size (e.g., `min(80vh, 720px)` square).
- Inner grid expands naturally based on rows × cols × cellSize.
- `$effect` triggers `cell_element.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' })` on `player.row`/`player.col` change.

## Related Files
- **Modify:** `src/components/GameBoard.svelte` (add viewport wrapper, scroll effect)
- **Modify:** `src/styles/theme.css` (viewport CSS vars if needed)
- **Read for context:** `src/scenes/Game.svelte`, `src/lib/game/player.js`

## Implementation Steps
1. Add `<div class="viewport">` wrapping the `.grid` element in `GameBoard.svelte`.
2. CSS: `.viewport { max-width: 80vh; max-height: 80vh; overflow: auto; scroll-behavior: smooth; }`.
3. Bind `ref` to the player's cell element (use Svelte action or id).
4. Add `$effect` watching `player.row`, `player.col` → call `scrollIntoView` on the player cell.
5. Test with temporary 12x12 dummy level (don't commit dummy level).
6. Verify no regression at 6x6, 8x8.
7. Run `npm run build` to check compile.

## Todo List
- [ ] Add viewport wrapper + CSS in `GameBoard.svelte`
- [ ] Wire player cell ref + `$effect` scrollIntoView
- [ ] Manual test: 6x6 (no scroll), 12x12 (scroll follows)
- [ ] `npm run build` passes
- [ ] `npm run dev` smoke test on L1 + temp 12x12

## Success Criteria
- 12x12 grid fully playable; camera follows player.
- 6x6/8x8 grids render identically to before (no scrollbars when grid fits).
- Smooth scroll animation on each move.

## Risk Assessment
- **Risk:** `scrollIntoView` with smooth animation may lag on fast moves. **Mitigation:** test with held arrow key; switch to instant scroll if lag visible.
- **Risk:** Svelte 5 reactivity on ref may not fire. **Mitigation:** use `bind:this` + derived runes or simple DOM query.

## Security Considerations
N/A — pure UI.

## Next Steps
Phase 2 (solver) can run in parallel with this phase — no file overlap.
