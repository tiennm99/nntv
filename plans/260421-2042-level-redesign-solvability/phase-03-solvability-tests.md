# Phase 3: Solvability Test Suite + CI Wiring

## Context
- Brainstorm §4.2
- Depends on: Phase 2 (solver)

## Overview
- **Priority:** HIGH — gate for all redesign phases.
- **Status:** pending
- Vitest suite that asserts invariants on every PR touching `levels.js`.

## Requirements
- For L1, L3–L11: assert `solveLevel(level).solvable === true`.
- For L2: known fail (baseline); test marked `.skip` with TODO to unskip after Phase 4.
- For L12: assert `solveLevel(level).solvable === false` (unsolvable invariant).
- Each passing level also asserts `par = path.length + 2` (or logs mismatch for manual par tuning).

## Architecture
- One describe block per level; `test.each(LEVELS)` pattern.
- Long-running: set Vitest timeout to 120s per test.
- Separate suite file so dev can skip fast unit tests vs full solvability run.

## Related Files
- **Create:** `src/lib/levels/levels.solvability.test.js`
- **Modify:** `package.json` — add script `"test:solvability": "vitest run src/lib/levels/levels.solvability.test.js"`
- **Modify:** `.github/workflows/*.yml` if CI exists (else note for later)

## Implementation Steps
1. Create test file, import `LEVELS` and `solveLevel`.
2. Loop levels, assert expected solvability per hard rules.
3. Add par validation (warn only, don't fail yet — par tuning happens in redesign phases).
4. Add `test.each` table for grid size validation (L1-2 = 8x8, L3-4 = 9x9, etc.) — initially all fail; phase-by-phase unskips.
5. Add npm script.
6. If `.github/workflows` exists, add step: `npm run test:solvability`.

## Todo List
- [ ] Write solvability test file
- [ ] Skip L2 initially with TODO
- [ ] Add par-delta warning (console.warn, not fail)
- [ ] Add grid-size table (initially all skipped; unskip per phase)
- [ ] Add npm script
- [ ] CI integration (if CI present)
- [ ] Confirm local: L1/3-11/12 assertions pass

## Success Criteria
- `npm run test:solvability` passes with L2 skipped and L12 asserted-unsolvable.
- CI (if present) runs solvability on PRs.

## Risk Assessment
- **Risk:** Solver too slow for CI. **Mitigation:** run solvability only on PRs that touch `levels.js` or `level-solver.js` (path-filter in CI).

## Next Steps
Phase 4 redesigns L1-L2. After L2 passes, unskip its assertion here.
