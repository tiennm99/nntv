# Phase 5: Act 2 Redesign (L3–L4, 9x9)

## Context
- Brainstorm §3.1
- Depends on: Phase 4 (Act 1 done; solver + tests trusted)

## Overview
- **Priority:** MEDIUM
- **Status:** pending
- Act 2 introduces **rotating** + **blinking** (blinking promoted from old Act 3).

## Requirements
- Both levels: 9x9 grid, preserved metadata.
- **L3 "Vegetable Patrol":** 4 guards total — mix of static + rotating (≥1 rotating); par ~18.
- **L4 "The Searchlight":** 5 guards — static + rotating + 1 blinking; timing window required; par ~22.

## Implementation Steps
1. Draft L3 9x9 with 4 guards; verify solver solvable + ≥2 paths.
2. Draft L4 9x9 with 5 guards including blinking (introduce teaching level); verify solvable; ensure `wait` action is useful (solver path includes at least one `wait`).
3. Replace L3, L4 in `levels.js`.
4. Enable L3-4 grid-size assertion in test.
5. `npm run test:solvability` green.
6. Manual playthrough.

## Related Files
- **Modify:** `src/lib/levels/levels.js` (L3, L4)
- **Modify:** `src/lib/levels/levels.solvability.test.js`

## Todo List
- [ ] L3 drafted + solver-verified
- [ ] L4 drafted + solver-verified (blinking intro)
- [ ] Entries replaced
- [ ] Tests green
- [ ] Manual playthrough

## Success Criteria
- Solver proves both solvable with pars reasonable.
- L4 solution requires a `wait` action (teaches mechanic).

## Risks
- **Rotating guard cycle + blinking cycle interaction** may create tight windows. **Mitigation:** solver par check; if par >30, simplify.
