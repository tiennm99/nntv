# Phase 11: Docs + Full Smoke Test

## Context
- Brainstorm §11
- Depends on: all prior phases

## Overview
- **Priority:** LOW–MEDIUM (final polish, CI gate).
- **Status:** pending
- Update `docs/`, verify full playthrough, tune pars if needed.

## Requirements
- Update `docs/system-architecture.md` — add solver + viewport sections.
- Update `docs/code-standards.md` — note "all level edits must run solvability suite".
- README unchanged re: easter egg (keep hidden).
- Full manual playthrough L1→L11; verify L12 is impossible but console-teleport wins.

## Implementation Steps
1. Run full test suite: `npm test && npm run test:solvability`.
2. Check `docs/` files exist — if not, create.
3. Append solver architecture section to `docs/system-architecture.md`.
4. Append level-authoring rule to `docs/code-standards.md`: "never commit `levels.js` without running `npm run test:solvability`".
5. Add codebase-summary.md entry for `level-solver.js`.
6. Manual playthrough L1 → L11 (screenshot key moments for regression visibility).
7. Par tuning pass: if solver_par + 2 feels too loose/tight per actual play, adjust.
8. `npm run build` produces clean dist.

## Related Files
- **Modify:** `docs/system-architecture.md`
- **Modify:** `docs/code-standards.md`
- **Modify:** `docs/codebase-summary.md` (if exists)
- **Modify (maybe):** `src/lib/levels/levels.js` (par tuning)

## Todo List
- [ ] Full test suite green
- [ ] docs/system-architecture.md updated
- [ ] docs/code-standards.md updated
- [ ] Manual playthrough L1→L11 complete, no blockers
- [ ] L12 console win confirmed
- [ ] Par tuning (if any) complete
- [ ] `npm run build` clean

## Success Criteria
- All 11 solvable levels playable end-to-end without test failures.
- L12 impossible by normal play; console win works.
- Docs reflect new solver + viewport architecture.

## Risks
- **Par values feel off in real play.** **Mitigation:** dedicated tuning pass here; adjust before merge.

## Next Steps
- Archive plan via `/ck:plan archive`.
- Merge to main, tag release if versioned.
