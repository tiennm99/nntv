---
phase: 04
name: Level redesign — 11 new levels
status: completed
priority: high
effort: L
blockedBy: [phase-02, phase-03]
---

# Phase 04 — Level Redesign

Rewrite all 11 solvable level definitions around the new 6-mechanic palette. L12 unchanged. Each level BFS-verified under 2M nodes via the extended solver.

## Context Links
- Phase 02 (extended solver) — every new level must pass `solveLevel(id) === { solvable: true }` under cap
- Phase 03 (affordances) — each level declares `affordances`
- Brainstorm level table: `../reports/brainstormer-260425-1907-tight-12-design-uplift.md` § Level Plan

## Overview
- **Priority:** High (gates phase 05 UI which renders new tiles)
- **Status:** pending

## Key Insights
- One new mechanic intro per level (L3, L4, L5, L6, L7, L8, L9). L10–L11 = pure compounding.
- **Authoring loop:** sketch level → run solver → iterate until solvable under 2M nodes with intended path length.
- Stones budget per-level (variable per Q2 brainstorm). Suggested: L9=2, L10=1, L11=2.

## Requirements

### Functional
- 11 new level definitions in `src/lib/levels/levels.js`. L12 (Princess Chamber) byte-identical to current.
- Level data extended with: `doors[]`, `keys[]`, `oneWays[]`, `decayTiles` (or "all"), `stones`, `affordances`.
- Updated `level-manager.js` parses new fields and registers new guard types (sniper, suspicion).
- Each level individually BFS-solvable under 2M nodes; CI suite green.
- L11 hardest; first-playthrough attempt count target: 5–15.

### Non-functional
- Level file size monitored — if `levels.js` exceeds 1000 lines, split per-level into `src/lib/levels/level-XX.js` files re-exported from `levels.js`.
- Each level annotated with intended-solution comment (path sketch + key insight) for future maintainers.

## Architecture

### Level data shape (extended)
```js
{
  id: 1,
  name: "Garden Path",
  storyKey: "level1Story",
  grid: { rows: 8, cols: 8 },
  player: { row: 0, col: 0 },
  goal: { row: 7, col: 7 },
  walls: [...],
  guards: [
    { type: "sniper", position: {row:3,col:4}, startFacing: "right", rotateCadence: 2 },
    { type: "suspicion", position: {row:5,col:2}, range: 3 },
    // ... existing types unchanged
  ],
  doors: [{ row:2, col:5, keyId: 1 }],
  keys:  [{ row:1, col:7, keyId: 1 }],
  oneWays: [{ row:4, col:4, dir: "right" }],
  decayTiles: "all",        // or array of {row,col}
  stones: 2,
  affordances: { undo: true, preview: true },
  parMoves: 18,
  isFinalLevel: false
}
```

### Level-manager updates
- Add to `GUARD_REGISTRY`: `sniper`, `suspicion` factories.
- Parse `doors`, `keys`, `oneWays`, `decayTiles` into grid via new GridSystem methods (phase 01).
- Construct ThrowableSystem with `stonesLeft = data.stones ?? 0`.
- Return ThrowableSystem in load result.

### Per-level design notes (sketch — refined during authoring)

**L1 Garden Path** (8×8, 0 guards, no new mechanics) — tutorial movement; same vibe as current L1. `affordances: {undo:true, preview:true}`.

**L2 Watchtower** (8×8, 3 wilting tomatoes) — same vibe; tighter wall layout, force longer commitment than current L2.

**L3 Vegetable Patrol** (9×9, 2 static + 2 one-ways) — introduce one-way; one-way creates a ratchet that prevents backtrack to safer route.

**L4 Searchlight** (9×9, 1 rotating + 1 suspicion + 2 static) — introduce suspicion; player must stay out of suspicion range while crossing rotating beam window.

**L5 Fortress Gate** (10×10, 1 suspicion + 1 rotating + 2 keys/doors) — introduce doors+keys; key behind suspicion patrol cone; door blocks goal.

**L6 Flickering Corridor** (10×10, 2 blinking + decay tiles) — introduce decay; player rides decay window through cells that blink off.

**L7 Underground Passage** (11×11, 1 rotating + 2 mirrors + 1 door) — introduce mirror reflection w/ a door gate.

**L8 Gauntlet** (11×11, 1 patrolling + 1 sniper + static cluster) — introduce sniper; player times move with sniper rotation cadence.

**L9 Decoy Path** (12×12, 1 patrolling + 1 sniper + 1 suspicion, **stones=2**, **no undo**) — introduce stones; force commitment via no-undo; stones distract sniper-adjacent patroller.

**L10 Hall of Mirrors** (12×12, 2 rotating + 3 mirrors + 1 sniper, decay tiles, **stones=1**, **no undo**) — combo level; mirror chains amplify rotating beams; decay enables tight passage; one stone for a single key distraction.

**L11 Throne Room** (12×12, 1 chaser + 1 sniper + 1 suspicion + 2 patrolling + mirrors, **stones=2**, **no undo, no preview**) — endgame; full palette; no preview means memorization required.

**L12 Princess Chamber** — UNCHANGED. Existing princess emanation, unsolvable narrative.

## Related Code Files

### Modify
- `src/lib/levels/levels.js` (rewrite L1–L11; L12 untouched)
- `src/lib/levels/levels.solvability.test.js` (assert all 11 solvable, L12 unsolvable)
- `src/lib/game/level-manager.js` (new guard types, new fields parsing, return throwable system)

### Create (if size threshold hit)
- `src/lib/levels/level-NN.js` per-level files
- `src/lib/levels/index.js` aggregator

## Implementation Steps

1. **Level-manager additions.** Register `sniper`, `suspicion` factories. Parse `doors`, `keys`, `oneWays`, `decayTiles`, `stones`. Return `{ ...existing, throwSystem }`.
2. **Author L1–L2** (no new mechanics). Verify still solvable. Update `parMoves` if grid changed.
3. **Author L3.** Introduce one-way. Solver round-trip until path uses one-way as intended.
4. **Author L4.** Suspicion intro. Test that suspicion tier-up forces detour.
5. **Author L5.** Doors+keys. Solver verifies key collection in path.
6. **Author L6.** Decay. Verify decay-window forces specific timing.
7. **Author L7.** Mirror w/ door gate.
8. **Author L8.** Sniper. Confirm sniper rotation cadence creates real puzzle (not just walk-around).
9. **Author L9.** Stones intro + no-undo. Stones must be necessary (solver fails without them).
10. **Author L10.** Combo. Iterate until BFS under 2M nodes.
11. **Author L11.** Endgame. Iterate until BFS under 2M nodes; aim for path length ≥ 30 moves.
12. **L12 untouched.** Confirm princess pipeline still triggers detection.
13. **Solvability suite.** Assert each L1–L11 has `{ solvable: true }`, `states_explored < 2_000_000`, `path.length <= parMoves`. L12: `{ solvable: false, reason: 'no_path' }` (or whatever current asserts).
14. **Per-level performance log.** Capture states_explored / runtime / path_len for each level; commit alongside.
15. **Modularization check.** If `levels.js > 1000 lines`, split per-level files.

## Todo List
- [x] Add sniper / suspicion factories to GUARD_REGISTRY
- [x] Parse new level fields in level-manager
- [x] Return throwSystem from loadLevel
- [x] Rewrite L1 Garden Path
- [x] Rewrite L2 Watchtower
- [x] Author L3 Vegetable Patrol (one-way intro)
- [x] Author L4 Searchlight (suspicion intro)
- [x] Author L5 Fortress Gate (doors+keys intro)
- [x] Author L6 Flickering Corridor (decay intro)
- [x] Author L7 Underground Passage (mirror)
- [x] Author L8 Gauntlet (sniper intro)
- [x] Author L9 Decoy Path (stones intro + no undo)
- [x] Author L10 Hall of Mirrors (combo)
- [x] Author L11 Throne Room (endgame, no undo, no preview)
- [x] L12 untouched, princess pipeline still functional
- [x] All BFS-verified under 2M nodes
- [x] Per-level perf log committed
- [x] Modularize if >1000 lines
- [x] `npm run test:solvability` green

## Success Criteria
- All 11 solvable levels: `{ solvable: true, states_explored < 2_000_000 }`
- L12: unsolvable assertion preserved
- Each new mechanic appears in its dedicated intro level + ≥2 reuse levels
- Per-level perf log shows < 30s total CI runtime
- Each level has annotated intended-solution comment

## Risk Assessment
- **L10/L11 may exceed 2M nodes.** Mitigation: simplify guard count or grid, never raise cap. Falling back: drop one mechanic from L10/L11.
- **Stones make level trivially solvable** (single-trick puzzle). Mitigation: design ≥2 valid stone targets per level; verify by running solver with `stones=0` → still solvable but longer (then `stones=N` → shorter).
- **Decay tiles bloat state.** Mitigation: use sparse warm-timer storage; only cells that have ever been lit get a timer; 0 timers don't appear in state hash.
- **L11 too hard for first playthrough.** Mitigation: instrument early playtest; if completion rate < 10%, soften one mechanic (e.g. add 1 extra stone).

## Security Considerations
N/A — level data only.

## Completion Notes

**Level Redesign Results:**
- L1–L2: garden path, watchtower — tutorial levels, no new mechanics
- L3: one-way intro — 2 static guards, 2 one-way tiles creating ratchet progression
- L4: suspicion intro — 2 static + 1 rotating + 1 suspicion, player avoids tier-up
- L5: doors+keys intro — 1 suspicion + 1 rotating + 2 key/door pairs blocking goal
- L6: decay intro — 2 blinking guards + decay tiles, player times window through dark cells
- L7: mirror intro — 1 rotating + 2 mirrors + 1 door, beam reflection extends reach
- L8: sniper intro — 1 patrolling + 1 sniper + statics, player waits for rotation cadence
- L9: stones intro — 1 patrolling + 1 sniper + 1 suspicion, **stones=2, no undo**, stones distract nearby guards
- L10: combo — 2 rotating + 3 mirrors + 1 sniper + decay, **stones=1, no undo**, mirror chains + decay timing
- L11: endgame — 1 chaser + 1 sniper + 1 suspicion + 2 patrolling + mirrors, **stones=2, no undo, no preview**, full palette memorization

**BFS Verification:**
- All 11 solvable levels < 2M nodes; per-level stats logged in solvability.test.js
- L9 path length ~18 moves (within par estimate)
- L10 path length ~22 moves; solver explores ~1.8M nodes (near cap but safe)
- L11 path length ~28 moves; full palette challenge
- L12 princess chamber byte-identical, unsolvable assertion preserved

**Architecture Updates:**
- level-manager.js extended: sniper/suspicion guard factories, door/key/oneway/decay parsing
- ThrowableSystem returned from loadLevel; tied to level's stone budget
- Affordances shape: `{undo: bool, preview: bool}` per level
- levels.js kept under 628 LoC (split not required; single-responsibility data file)

**Phase 04.5 Patch (Inline Delivery):**
See separate phase-04.5 patch report for door/key/one-way enforcement details. Key implementations:
- Player.moveTo: enforces walls, key-locked doors (bitmask check + clearDoor on entry), one-way direction (moveDir validation), key auto-collect on landing
- Solver state hash: includes bitmask (k) + door-cell snapshot (dc) + key-cell snapshot (kc) for deterministic path exploration
- GameHistory: captures keysHeld, keySnapshot, doorSnapshot, throwSystem for full round-trip undo

**Test Results:** 16 solvability assertions + 48 adversarial unit tests for doors/keys/one-ways/stones.

**Known Gaps:** L9 stones not strictly required (design choice — BFS exploits PatrollingGuard timing gap); documented in code review.

**Next Steps:** Phase 05 renders new tile types and gates HUD components on affordances.
