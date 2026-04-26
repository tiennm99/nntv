# Phase 01 — Engine Foundations: Implementation Report

## Files Modified
- `src/lib/game/grid-system.js` — added door/key/oneWay/warm flags + setters/getters, `tickWarmTimers()`, `getWarmSnapshot()`
- `src/lib/game/guards.js` — added `SniperGuard`, `SuspicionGuard`; added `forcedFacingTurns`/`forcedFacingTarget` to `RotatingGuard`, `PatrollingGuard`, `ChaserGuard`; extended capture/apply on all three
- `src/lib/game/turn-manager.js` — new turn order (goal→throw.resolve→clearLight→onTurnChange→tickWarm→detect); `throwSystem` optional arg on both `nextTurn` and `previewNextTurn`

## Files Created
- `src/lib/game/throwable.js` — `ThrowableSystem` with `throw()`, `resolve()`, `capture()`, `apply()`, `reset()`
- `src/lib/game/throwable.test.js` — 19 tests covering throw validation, resolve distraction, capture/apply, reset
- (tests appended to existing files: `grid-system.test.js`, `guards.test.js`, `turn-manager.test.js`)

## Test Results
```
Test Files  9 passed (9)
     Tests  127 passed (127)   (was 100 before this phase)
  Duration  1.63s
```
All pre-existing tests untouched and passing.

## Decisions / Deviations

1. **SuspicionGuard `_forceDecay` removed** — spec said "force decay to 0 next call" but the simplest correct model is: if a turn starts at tier=2 (guard fired last turn), it immediately drops to 0 and exits. No extra flag needed; behavior is identical. Tests written to match this simpler semantic.

2. **`SniperGuard.lightRange`** — set to `max(rows, cols)` rather than a fixed number, making the beam truly unbounded (hits wall or edge). Matches spec ("casts beam until first wall/mirror/grid edge").

3. **`computeFacingToward` shared utility** — kept private (not exported) since only used internally by distractible guards. No cyclic dep.

4. **`ThrowableSystem` no wall-end-point check** — the `hasLineOfSight` traces strictly BETWEEN the two cells (exclusive endpoints), so throwing at a wall-adjacent cell is allowed; the stone lands there. Matches "stops at walls between" semantics.

5. **Property test in `turn-manager.test.js`** — implemented as deterministic 50-turn replay with 5 checkpoints rather than truly random, to keep the test reproducible and fast (< 50ms). Covers all new guard types + throwable system.

## Blockers / Concerns
None.

**Status:** DONE
All 127 tests pass; no new npm dependencies; all new state covered by capture/apply.
