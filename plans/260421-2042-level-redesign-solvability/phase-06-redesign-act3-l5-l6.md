# Phase 6: Act 3 Redesign (L5–L6, 10x10)

## Context
- Brainstorm §3.1
- Depends on: Phase 1 (viewport for 10x10), Phase 5

## Overview
- **Priority:** MEDIUM
- **Status:** pending
- Act 3 introduces **patrolling** (promoted from old Act 4).

## Requirements
- Both levels: 10x10 grid, preserved metadata.
- **L5 "Fortress Gate":** 6 guards — static + rotating + blinking + 1 patrolling (intro); par ~22.
- **L6 "The Flickering Corridor":** 7 guards — mix, ≥2 patrollers OR 1 patroller with longer path; par ~28.

## Implementation Steps
1. Draft L5 10x10 with 6 guards (1 patrolling); solver-verify.
2. Draft L6 10x10 with 7 guards; solver-verify.
3. Replace in `levels.js`.
4. Enable 10x10 grid-size checks.
5. Test green.
6. Manual playthrough — verify viewport scrolls correctly (phase-1 integration smoke).

## Related Files
- **Modify:** `src/lib/levels/levels.js` (L5, L6)
- **Modify:** `src/lib/levels/levels.solvability.test.js`

## Todo List
- [ ] L5 drafted + verified (patrolling intro)
- [ ] L6 drafted + verified
- [ ] Entries replaced
- [ ] Tests green
- [ ] Manual playthrough confirms viewport scroll works

## Success Criteria
- Both solvable; ≥2 paths per level.
- Patroller path length ≥4 cells (meaningful patrol).

## Risks
- **Patrol path length inflates cycle** → solver state blowup. **Mitigation:** cap patrol path ≤6 cells in Act 3.
