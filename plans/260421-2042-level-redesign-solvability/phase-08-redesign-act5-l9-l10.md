# Phase 8: Act 5 Redesign (L9–L10, 12x12)

## Context
- Brainstorm §3.1
- Depends on: Phase 1 (viewport), Phase 7

## Overview
- **Priority:** MEDIUM
- **Status:** pending
- Act 5 introduces **chaser** guards.

## Requirements
- Both levels: 12x12 grid, preserved metadata.
- **L9 "The Decoy Path":** 8 guards — mix + 1 chaser (intro); par ~34.
- **L10 "Hall of Mirrors":** 9 guards — chaser + multiple mirrors + rotating; par ~38.

## Implementation Steps
1. Draft L9 12x12 with chaser intro; solver-verify (longest run; may take minutes).
2. Draft L10 12x12 with mirror-heavy layout + chaser; solver-verify.
3. Replace in `levels.js`.
4. Tests green.
5. Manual playthrough — verify viewport + camera follow smooth at 12x12.

## Related Files
- **Modify:** `src/lib/levels/levels.js` (L9, L10)
- **Modify:** `src/lib/levels/levels.solvability.test.js`

## Todo List
- [ ] L9 drafted (chaser intro) + verified
- [ ] L10 drafted + verified
- [ ] Entries replaced
- [ ] Tests green
- [ ] Manual playthrough at 12x12

## Success Criteria
- Both solvable; chaser creates genuine threat (solver proves shortest path avoids chaser).
- Solver completes within 10min per level (or raise state cap).

## Risks
- **Solver budget exhausted on 12x12 + chaser + long cycle.** **Mitigation:** shorten patrol paths; cap chaser detection radius at 3.
