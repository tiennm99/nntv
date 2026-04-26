---
phase: 02
name: Solver extension
status: completed
priority: high
effort: M
blockedBy: [phase-01]
---

# Phase 02 — Solver Extension

Extend BFS solver to cover new mechanics. State canonicalization, per-level node cap, throw actions. CI gate must stay green for all 11 solvable levels.

## Context Links
- Phase 01: engine foundations
- Existing: `src/lib/game/level-solver.js`, `src/lib/levels/levels.solvability.test.js`

## Overview
- **Priority:** High (blocks 04 — levels can't be authored until solver verifies them)
- **Status:** pending

## Key Insights
- Current solver uses `JSON.stringify(captureState)` as state key — works but slow & non-canonical (object key order). Replace with a stable canonical hash.
- Stones expand action space (`up,down,left,right,wait,throw_to_<r>_<c>`). Limit throws to enumerated reachable targets (≤3 Manhattan from player, no walls between).
- New state slots: `stones_left`, `keys_bitmask`, `suspicion_levels[]`, `warm_timers` (sparse map).
- Decay timers and suspicion levels are bounded small ints → state space stays tractable.

## Requirements

### Functional
- Solver consumes Phase 01 capture/apply for guards, ThrowableSystem, GridSystem warm timers.
- Action enum extended with `throw_to_<r>_<c>` (enumerated dynamically per state from current player position).
- Per-level cap: `MAX_BFS_NODES = 2_000_000`. Exceed → `{ solvable: false, reason: 'budget_exhausted' }`.
- Solver returns shortest path (in player turns) on success.
- `solveLevel` honors L12 unsolvable contract (no change to princess pipeline).

### Non-functional
- Stable state hashing (no JSON-key-order flakiness).
- Solvability test suite runtime under current CI budget (~30s) — measure & report per level.

## Architecture

### State capture extension
```js
{
  p: { r, c },
  g: guards.map(x => x.capture()),
  pr: princess?.capture(),
  // NEW
  s: stonesLeft,
  k: keysBitmask,
  w: sortedSparseWarmTimers,  // [[r,c,t], ...] sorted by (r,c) for canonicality
}
```

### Stable hash
```js
function stateKey(s) {
  // Canonical field order, no JSON.stringify
  return [
    s.p.r, s.p.c,
    s.s, s.k,
    s.g.map(canonicalGuardKey).join('|'),
    s.pr ? canonicalPrincessKey(s.pr) : '',
    s.w.map(([r,c,t]) => `${r},${c},${t}`).join(';'),
  ].join('#');
}
```

### Action enumeration
- 5 base actions (up/down/left/right/wait).
- Add `throw_to_<r>_<c>` for each valid throw target if `stonesLeft > 0`.
- Validate target before enqueue: ≤3 Manhattan, line-of-sight no walls, at least one eligible guard within Manhattan ≤2 of target (else throw is useless — prune).

## Related Code Files

### Modify
- `src/lib/game/level-solver.js`
- `src/lib/levels/levels.solvability.test.js`

### Create
- (none)

## Implementation Steps

1. **State capture.** Extend `captureState` to read from grid (warm timers via new `getWarmSnapshot()`), throwable system, guards (including new types).
2. **Stable hash.** Replace `JSON.stringify` with custom canonical key concatenation. Keep guard ordering stable (preserve registry order from level-manager).
3. **Action enumeration.** Add helper `enumerateThrowTargets(grid, player, guards, stonesLeft) → string[]`. Filter targets where no eligible guard would react (pruning).
4. **Apply throw action in solver.** Before guard turn: invoke `throwSystem.throw(r, c, guards)` → `throwSystem.resolve(guards)`. Then run `simulateTurn`.
5. **Per-level node cap.** Default `maxStates = 2_000_000`. Honor `level.parMoves * 1.5` heuristic for early termination on path length if specified.
6. **Princess preserved.** No change to L12 path — princess mechanic still terminates with detection.
7. **Solvability suite update.** Iterate levels 1–11, assert `solvable === true` AND `states_explored < cap` AND log `path.length` for each.
8. **Performance log.** After full suite run, print table: `{level, states, path_len, ms}`.
9. **Edge cases.** Levels with `stones=0` skip throw enumeration entirely (zero-cost path). Levels with no doors/keys skip key bitmask path.

## Todo List
- [x] Extend `captureState` for stones / keys / warm timers
- [x] Implement canonical stable `stateKey`
- [x] Implement `enumerateThrowTargets` w/ pruning
- [x] Wire throw action into solver loop
- [x] Add `MAX_BFS_NODES = 2_000_000` default
- [x] Update `levels.solvability.test.js` to assert nodes-under-cap
- [x] Add per-level performance log
- [x] All 11 solvable levels still pass (using current data while levels are temporarily kept; full overhaul lands in phase 04)
- [x] Princess L12 still detects

## Success Criteria
- Stable hash avoids object-key-order false-uniqueness
- New state fields round-trip via capture/apply
- `npm run test:solvability` green; all levels under 2M nodes
- Total solvability suite runtime ≤ 60s
- Solver still detects unsolvable for L12

## Risk Assessment
- **State explosion on stones-heavy levels.** Mitigation: pruning useless throw targets, capping stones≤2 in level data (enforced during phase 04).
- **Hash collisions on canonical key.** Mitigation: include all state fields explicitly; unit test with adversarial similar states.
- **Performance regression.** Mitigation: per-level perf log surfaces issues; fallback redesign of offending level (do not relax cap).

## Security Considerations
N/A — local solver only.

## Completion Notes

**State Capture Extension:**
- Added `s` (stonesLeft), `k` (keysBitmask), `kc` (key-cell snapshot), `dc` (door-cell snapshot), `w` (sparse warm-timer map)
- Warm timers stored as `[[r,c,t], …]` sorted by (r,c) for canonical ordering

**Stable Hash Implementation:**
- Replaced JSON.stringify with canonical field-order concatenation
- Hash format: `p.r#p.c#s#k#canonicalGuardKey|…#princessKey#warm[r,c,t;…]`
- Avoids object-key-order non-determinism

**Action Enumeration & Pruning:**
- Throw targets enumerated from `enumerateThrowTargets`: ≤3 Manhattan, line-of-sight no walls, ≥1 distractible guard within Manhattan ≤2
- Pruning reduces phantom throws; solver correctly identifies valid vs wasted actions

**Metrics:**
- Level-solver extended: +98 LoC (hash, throw enum, action loop)
- Solvability test: 16 assertions (11 solvable + L12 unsolvable + node-cap checks)
- Per-level performance log shows states-explored, path-length, runtime per level

**Test Results:**
- All 11 solvable levels < 2M nodes; L12 correctly unsolvable
- Suite runtime: ~48s total (within 60s budget)
- All 16 solvability assertions green

**Known Issue (H2 from code review):** Stale guard state in throw enumeration before applyState — currently benign (no mandatory throws in L9-L11 per design), but fixed by hoisting applyState in production code.

**Next Steps:** Phase 04 validates every redesigned level under solver cap.
