# Phase 10: L12 Redesign — Princess Chamber + Console Easter Egg (13x13)

## Context
- Brainstorm §6, §10
- Memory: `project_level12_unsolvable.md`
- Depends on: Phase 9

## Overview
- **Priority:** HIGH (preserves core narrative invariant).
- **Status:** pending
- L12 MUST remain unsolvable by normal play. Only console-based teleport can trigger the win screen.

## Hard Invariant
Solver MUST return `solvable: false` for L12 after redesign. Test asserts this; CI blocks any change that makes L12 solvable.

## Requirements
- 13x13 grid (biggest), preserved metadata (`id: 12`, `isFinalLevel: true`).
- 10 guards + expanding-wave mechanic from `princess-mechanic.js`.
- Console easter-egg hook exposed on `window` so dev-tools users can teleport to goal.
- Normal win flow triggers regardless of how goal was reached.

## Architecture
- **Guards:** all 6 types represented, packed aggressively around goal.
- **Expanding wave:** intact from current impl — lights ring around goal after player within distance 4.
- **Console hook:** expose `window.__nntvDev = { teleport(row, col) { ... }, reveal() { ... } }`.
  - `teleport` mutates the live game state via existing reactive store.
  - Documented in code comments only; NOT in README, NOT in guide UI.
- **Win flow unchanged:** existing `isAtGoal()` check + `LevelCompletePopup.svelte` fire normally when player position = goal.

## Implementation Steps
1. Draft 13x13 layout with 10 guards + wave mechanic.
2. Solver-verify `solvable: false` within 10M state budget.
3. Replace L12 in `levels.js`.
4. Add `window.__nntvDev` hook in `src/main.js` (or `Game.svelte`) — gated behind Svelte store reference.
5. Manual test:
   - Normal play → impossible confirmed.
   - `window.__nntvDev.teleport(goal.row, goal.col)` in console → win flow triggers.
6. Add test in `levels.solvability.test.js`: assert L12 unsolvable.
7. Manual playthrough.

## Related Files
- **Modify:** `src/lib/levels/levels.js` (L12)
- **Modify:** `src/main.js` or `src/scenes/Game.svelte` (expose dev hook)
- **Modify:** `src/lib/levels/levels.solvability.test.js`
- **Read:** `src/lib/game/princess-mechanic.js`

## Todo List
- [ ] L12 drafted (13x13, 10 guards + wave)
- [ ] Solver confirms unsolvable
- [ ] Dev hook (`window.__nntvDev.teleport`) wired
- [ ] Manual: normal play impossible, console win works
- [ ] Solvability test asserts `!solvable`
- [ ] Code comment documents easter egg

## Success Criteria
- Solver asserts `solvable: false` — test green.
- Pressing every direction + wait indefinitely never reaches goal (manual spot-check).
- `window.__nntvDev.teleport(12, 12)` from console → LevelCompletePopup fires.
- No in-game UI/readme hint about the easter egg.

## Risks
- **Dev hook security.** **Mitigation:** non-sensitive (just game state); no auth/data exposure. Fine for a client-only game.
- **Wave mechanic solvability.** **Mitigation:** solver includes `waveRadius` in state key (Phase 2).

## Security Considerations
- `window.__nntvDev` is intentionally world-accessible in-browser. Acceptable — no server, no user data.
