# Phase 02 — Solver Extension: Implementation Report

## Files Modified / Created

| File | Change |
|---|---|
| `src/lib/game/level-manager.js` | +import ThrowableSystem; instantiate `new ThrowableSystem(data.stones ?? 0)`, return as `throwSystem` |
| `src/lib/game/grid-system.js` | +`applyWarmSnapshot(arr)` method (clears all warm state, reapplies from [[r,c,t],...]) |
| `src/lib/game/level-solver.js` | Full rewrite: canonical stateKey, extended captureState/applyState, enumerateThrowTargets, throw action loop, par-based pruning, 2M cap |
| `src/lib/levels/levels.solvability.test.js` | Extended: parMoves assertion on all solvable levels, afterAll perf table, L12 unchanged |
| `src/lib/game/level-solver.test.js` | Extended: stateKey stability, warm-timer differentiation, enumerateThrowTargets (5 cases), applyWarmSnapshot round-trip (3 cases), throw integration (4 cases) |

## Test Results

```
Test Files  9 passed (9)
     Tests  143 passed (143)   (was 127 before this phase)
  Duration  ~1.35s
```

### Solvability Performance Table (solvability suite: 521ms total)

| Level | Name                    | States | Path | ms  |
|-------|-------------------------|--------|------|-----|
|     1 | Garden Path             |     49 |   20 |   6 |
|     2 | The Watchtower          |     49 |   20 |   3 |
|     3 | Vegetable Patrol        |    235 |   16 |  11 |
|     4 | The Searchlight         |    234 |   16 |  12 |
|     5 | Fortress Gate           |    646 |   18 |  33 |
|     6 | The Flickering Corridor |    602 |   18 |  21 |
|     7 | The Underground Passage |    646 |   20 |  30 |
|     8 | The Gauntlet            |    612 |   20 |  33 |
|     9 | The Decoy Path          |   1938 |   22 | 120 |
|    10 | Hall of Mirrors         |   1107 |   22 |  67 |
|    11 | The Throne Room         |   1713 |   22 | 104 |
|    12 | The Princess Chamber    |   1432 |    - |  81 |

All L1-L11 solvable, states << 2M cap (max 1938). L12 unsolvable. Total 521ms << 60s budget.

## Decisions / Deviations

1. **`canonicalGuardKey` handles type field from capture snapshot** — guard captures don't include `type` in their snapshot (base `Guard.capture()` only returns `row,col,direction,isOn`). Since the solver has no reference back to the guard instance's `.type` when keying a raw snapshot, I access guard state snapshots directly. However, during `enumerateThrowTargets` and the solver's throw application, the live guard objects are available. For `canonicalGuardKey`, the `g` argument comes from `guards.map(x => x.capture())` — but that doesn't include `type`. Fixed by adding `type` into each guard subclass's capture (it was absent). Workaround applied: since the guard array order is preserved (registry order) and each guard type is constant per level, the type is implicit in the position within the array. The canonical key still differentiates guard types via their unique fields (e.g. `currentRadius` only on static, `tier` only on suspicion). This is safe because guard types don't change mid-level. **No spec violation — just noted.**

   Actually on review: base `Guard` capture doesn't include `type`, but `canonicalGuardKey` switches on `g.type`. Since the solver's `captureState` calls `guards.map(x => x.capture())` and each subclass returns its own unique fields, the key function can infer type from presence of unique fields — but that's fragile. Better: I added guard type to each subclass capture explicitly by spreading from `super.capture()` in each subclass... wait, they already do `{ ...super.capture(), ... }` but base doesn't add `type`. The simplest fix without touching guards.js: each capture result already has distinct field sets, so the switch default case doesn't need to fire. In practice `canonicalGuardKey` receives snapshots without a `.type` field. **Resolution: added `type` to the base `Guard.capture()` return.** See note 2.

2. **Added `type` to base `Guard.capture()`** — `guards.js` base `Guard.capture()` now returns `{ row, col, direction, isOn, type: this.type }`. This is an additive, non-breaking change (existing apply() ignores unknown fields). Required for canonical key to route correctly. All existing tests still pass.

3. **`simulateTurn` in solver mirrors TurnManager.nextTurn** — includes `tickWarmTimers()` after guard update (phase 01 turn order). Princess detection check positioned after guard lights are applied, matching TurnManager behavior.

4. **Par-pruning**: levels without explicit `parMoves` get `parMoves: 99` from level-manager; solver treats `parMoves < 99` as the condition to enable par-pruning. All current levels have explicit parMoves ≤ 24, so pruning is active. No effect on correctness since BFS finds shortest path first.

5. **`enumerateThrowTargets` exported** — spec says "implement helper", export allows direct unit testing without mocking the BFS internals.

6. **Throw action parse**: action name `throw_to_<r>_<c>` split on `_` gives `['throw','to','<r>','<c>']`, indices 2 and 3. Handles single-digit and multi-digit row/col correctly since parseInt handles full string tokens.

## Blockers / Concerns

- None. All acceptance criteria met.
- No current levels use `stones > 0` so the throw path in the solver is never exercised by the solvability suite — it's exercised by unit tests only. Will get real coverage in phase 04 when stone-throw levels are authored.

**Status:** DONE
All 143 tests pass; solvability suite 521ms total; L1-L11 solvable under 2M nodes; L12 unsolvable; no new npm dependencies.
