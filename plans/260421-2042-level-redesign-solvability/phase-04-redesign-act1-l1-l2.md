# Phase 4: Act 1 Redesign (L1–L2, 8x8)

## Context
- Brainstorm §3.1, §6 (migration)
- Depends on: Phase 3 (tests)

## Overview
- **Priority:** HIGH (fixes L2 unsolvability bug).
- **Status:** pending
- Act 1 teaches movement + static guards.

## Requirements
- Both levels: 8x8 grid, preserved `id`/`name`/`storyKey`.
- **L1 "Garden Path":** 0 guards (gentle intro, pure movement/walls); par ~12.
- **L2 "The Watchtower":** 3 static guards, ≥2 viable paths; par ~16.
- L2 must be SOLVABLE this time.

## Implementation Steps
1. Sketch L1 8x8 grid: start (0,0), goal (7,7), ~10 walls forming winding but connected path.
2. Run solver on L1 → assert `solvable`; set par = path.length + 2.
3. Sketch L2 8x8 grid: 3 static guards placed so ≥2 distinct paths exist; walls widen the arena.
4. Run solver on L2 → assert solvable; set par = path.length + 2.
5. Update `src/lib/levels/levels.js` — replace L1, L2 entries in place.
6. Unskip L2 assertion in `levels.solvability.test.js`.
7. Run `npm run test:solvability` → both pass.
8. Manual playthrough via `npm run dev`.

## Related Files
- **Modify:** `src/lib/levels/levels.js` (L1, L2 entries only)
- **Modify:** `src/lib/levels/levels.solvability.test.js` (unskip L2, enable L1-2 grid-size check)

## Todo List
- [ ] Draft L1 layout, verify with solver
- [ ] Draft L2 layout with 3 guards + 2 paths, verify with solver
- [ ] Replace entries in `levels.js`
- [ ] Unskip L2 test
- [ ] Solvability suite green
- [ ] Manual playthrough L1 + L2 via `npm run dev`

## Success Criteria
- L1 and L2 solvable per solver.
- L2 has ≥2 distinct solutions (verify by running solver with different seeds or via manual BFS count).
- Par values match `solver_optimal + 2`.

## Risks
- **Overlapping wall+light** (original L2 bug). **Mitigation:** lint via assertion in solver — no wall cell should appear in any guard's `litCells` array.
