# Phase 9: L11 Redesign — Throne Room (12x12)

## Context
- Brainstorm §3.1
- Depends on: Phase 1 (viewport), Phase 8

## Overview
- **Priority:** MEDIUM
- **Status:** pending
- L11 is the climax before the impossible finale. All guard types combined.

## Requirements
- 12x12 grid, preserved metadata (`id: 11`, `name: "The Throne Room"`, `storyKey: level11Story`).
- 9 guards: ≥1 of each type (static, rotating, blinking, patrolling, mirror, chaser).
- Must be solvable but hard (par ~42).
- Multiple paths; each path tests a different mix of skills learned.

## Implementation Steps
1. Draft 12x12 with all 6 guard types represented; solver-verify.
2. Ensure par > L10 par (difficulty climb).
3. Replace L11 in `levels.js`.
4. Tests green.
5. Manual playthrough — note difficulty feel; adjust if solver par drastically exceeds 42.

## Related Files
- **Modify:** `src/lib/levels/levels.js` (L11)
- **Modify:** `src/lib/levels/levels.solvability.test.js`

## Todo List
- [ ] L11 drafted with all 6 guard types
- [ ] Solver-verified
- [ ] Par sensible (≤~50)
- [ ] Tests green
- [ ] Manual playthrough

## Success Criteria
- Solvable.
- Uses every guard type at least once.
- Feels like a climactic combo of all mechanics.

## Risks
- **Mirror + chaser + rotating interaction too chaotic.** **Mitigation:** if solver par >50 or feels unfair, reduce to 8 guards (drop one redundant type).
