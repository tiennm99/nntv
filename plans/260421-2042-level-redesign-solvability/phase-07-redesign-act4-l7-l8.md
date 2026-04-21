# Phase 7: Act 4 Redesign (L7–L8, 11x11)

## Context
- Brainstorm §3.1
- Depends on: Phase 1 (viewport), Phase 6

## Overview
- **Priority:** MEDIUM
- **Status:** pending
- Act 4 introduces **mirror** guards (promoted from old Act 5).

## Requirements
- Both levels: 11x11 grid, preserved metadata.
- **L7 "The Underground Passage":** 7 guards — mix + 1 mirror (intro); par ~26.
- **L8 "The Gauntlet":** 8 guards — ≥2 mirrors + ≥2 patrolling + rotating; par ~32.

## Implementation Steps
1. Draft L7 11x11 with mirror intro; solver-verify (requires solver to correctly model mirror deflection).
2. Draft L8 11x11 with complex mirror setup; solver-verify.
3. Replace in `levels.js`.
4. Tests green.
5. Manual playthrough.

## Related Files
- **Modify:** `src/lib/levels/levels.js` (L7, L8)
- **Modify:** `src/lib/levels/levels.solvability.test.js`

## Todo List
- [ ] L7 drafted (mirror intro) + verified
- [ ] L8 drafted + verified
- [ ] Entries replaced
- [ ] Tests green
- [ ] Manual playthrough

## Success Criteria
- Both solvable; mirror deflection creates a hazard that player must account for.
- L8 has ≥3 guards of same dynamic type (patrol/rotating) — "gauntlet" flavor.

## Risks
- **Solver mirror logic mismatch with runtime.** **Mitigation:** Phase 2 solver imports guards.js — single source of truth.
- **11x11 + mirrors + many guards → state blowup.** **Mitigation:** profile; may need state cap bump or heuristic pruning.
