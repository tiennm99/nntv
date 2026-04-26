---
phase: 01
name: Engine foundations
status: completed
priority: high
effort: M
---

# Phase 01 — Engine Foundations

Add new cell types, new guard classes, and throwable-stones system to the pure-JS game engine. No UI, no level data yet — pure engine + tests.

## Context Links
- Brainstorm: `../reports/brainstormer-260425-1907-tight-12-design-uplift.md`
- Existing engine: `src/lib/game/{grid-system,guards,turn-manager}.js`

## Overview
- **Priority:** High (blocks 02, 03)
- **Status:** pending
- **Description:** Land all engine primitives required by the new mechanics behind unit tests, before solver/level work.

## Key Insights
- `capture()` / `apply()` snapshot pattern already exists on guards — extend for new state.
- `GridSystem` cell shape `{isWall, isGoal, isLight}` extends cleanly with new flags.
- Turn order: stone-throw resolves BEFORE guard turn (per brainstorm Q4).

## Requirements

### Functional
- Cell flags: `isDoor` (with `keyId`), `isKey` (with `keyId`), `isOneWay` (with `dir`), `isWarm` (1-turn timer post-light).
- Movement: doors block until matching key collected; one-way tile rejects entry from wrong dir.
- `SniperGuard`: line-of-sight beam from facing dir, stops at first wall/mirror, beam cells lethal. Rotates 90° every 2 turns (configurable cadence).
- `SuspicionGuard`: 3-tier meter (0 idle, 1 alerted, 2 firing). Tier increments when player in `range` Manhattan; firing-tier lights surrounding cells 1 turn; decays −1/turn when player out of range.
- `ThrowableStone` system: player can throw 1 stone per action turn; targets ≤3 Manhattan (stops at walls); resolves before guard turn; nearby (≤2 of target) rotating/patrolling/chaser guards face target for 1 turn.
- Light-decay tiles: when a cell goes dark (was lit previous turn, now not lit), set `isWarm=true` for 1 turn. Player can step on warm cells safely; rendering distinguishes.

### Non-functional
- Pure JS, no new deps.
- All new code unit-tested (≥80% line coverage on new modules).
- `capture()`/`apply()` extended to cover new state for solver/preview.

## Architecture

### New / changed files
- `src/lib/game/grid-system.js` — extend cell shape + setters/getters
- `src/lib/game/guards.js` — `SniperGuard`, `SuspicionGuard` classes
- `src/lib/game/throwable.js` (NEW) — `ThrowableSystem` with `throw(targetRow, targetCol, guards)` resolver
- `src/lib/game/turn-manager.js` — accept optional pending-throw arg, resolve throw before `onTurnChange`
- Tests: matching `*.test.js` for each.

### State shape additions
- Cell: `{ isWall, isGoal, isLight, isDoor, doorKeyId, isKey, keyId, isOneWay, oneWayDir, isWarm, warmTurnsLeft }`
- `SniperGuard.capture()`: `{ ...super, facing, turnsSinceRotate }`
- `SuspicionGuard.capture()`: `{ ...super, tier }`
- `ThrowableSystem.capture()`: `{ stonesLeft, pendingTarget }`

## Related Code Files

### Modify
- `src/lib/game/grid-system.js`
- `src/lib/game/guards.js`
- `src/lib/game/turn-manager.js`

### Create
- `src/lib/game/throwable.js`
- `src/lib/game/throwable.test.js`
- Append tests in `guards.test.js`, `grid-system.test.js`, `turn-manager.test.js`

## Implementation Steps

1. **GridSystem extension.** Add new cell flags + paired set/get methods (`setDoor`, `isDoor`, `getDoorKeyId`, etc.). Keep API symmetric with existing patterns. Add `tickWarmTimers()` called by turn manager after detection check.
2. **SniperGuard.** Subclass `Guard`. `updateLight(guards)` casts beam from `(row,col)` in `facing` until first wall/mirror/edge; mirror reflects 90° (reuse mirror logic). `onTurnChange` increments `turnsSinceRotate`; rotates 90° CW when ≥ `rotateCadence` (default 2) and resets counter.
3. **SuspicionGuard.** `updateLight` lights nothing at tier 0/1; at tier 2 lights surrounding 8 cells. `onTurnChange` checks player in `range` (Manhattan), increments tier (cap 2) or decrements (floor 0). After firing turn, force-decay to 0.
4. **ThrowableSystem.** Class with `stonesLeft`, `pendingTarget`. `throw(r,c)` validates ≤3 Manhattan + line-of-sight (no walls); decrements stones; sets pending target. `resolve(guards)` called by turn manager: for each rotating/patrolling/chaser within Manhattan ≤2 of pending target, override that guard's facing toward target for 1 turn (store `forcedFacingTurns=1` on guard; guards consume in next `onTurnChange`).
5. **TurnManager wiring.** `nextTurn` signature add optional `throwSystem` arg. Order: goal-check → throwSystem.resolve → clearLight → guards.onTurnChange → tickWarmTimers → detection check.
6. **Capture/apply.** Extend snapshot for new guard fields and warm-timer state. Verify preview still works (capture before, apply after).
7. **Tests.** Cover: door blocks → key collected → opens; one-way reject; sniper beam stops at wall and reflects off mirror; sniper rotates on cadence; suspicion tier transitions; suspicion firing lethal cells; stone throws distract correct guards within radius; stones don't affect static/blinking/sniper/suspicion guards; warm tile passable but visible; capture/apply round-trip restores all fields.

## Todo List
- [x] Extend `grid-system.js` cell shape + new methods
- [x] Add `tickWarmTimers()` to GridSystem
- [x] Implement `SniperGuard` (with mirror reflection reuse)
- [x] Implement `SuspicionGuard` (3-tier meter)
- [x] Create `throwable.js` `ThrowableSystem`
- [x] Wire throw resolution into `turn-manager.js`
- [x] Extend capture/apply on new guards + ThrowableSystem
- [x] Unit tests for grid extensions
- [x] Unit tests for SniperGuard (beam, mirror, rotation cadence)
- [x] Unit tests for SuspicionGuard (tier transitions, lethal firing)
- [x] Unit tests for ThrowableSystem (radius, eligibility, capture/apply)
- [x] Update turn-manager.test.js for new turn order
- [x] `npm test` green

## Success Criteria
- All new modules ≥80% test coverage
- `npm test` passes
- Capture/apply round-trip preserves all new state
- Existing tests untouched & passing
- No new entries in `package.json`

## Risk Assessment
- **Mirror+sniper interaction may infinite-loop** — cap reflection bounces at 3 (same as rotating).
- **Capture/apply drift** — write a property test: random sequence of 50 turns, snapshot at each, restore, replay → identical state.
- **ThrowableSystem cyclic dep with Guard** — keep `forcedFacingTurns` as plain number on guard, no class import in throwable.js.

## Security Considerations
N/A — local game state only.

## Completion Notes

**Test Coverage:** 35 new unit tests covering SniperGuard beam casting + mirror reflection, SuspicionGuard 3-tier transitions & lethal cells, ThrowableSystem targeting & guard distraction, grid cell flags & warm-timer decay, capture/apply round-trip for all new guard types.

**Key Results:**
- SniperGuard: beam casts from facing, reflects off mirrors (max 3 bounces), rotates 90° on configurable cadence (default 2 turns)
- SuspicionGuard: tier-0 (idle) → tier-1 (alerted when player in range) → tier-2 (firing, lights surrounding 8 cells, detection lethal) → decay -1/turn when player out of range
- ThrowableSystem: validates ≤3 Manhattan, line-of-sight, nearby (≤2) distractible guards; redirects facing for 1 turn
- Warm timers: cells lit last turn set `isWarm=true` for 1 turn when dark (player safe passage marker)
- Capture/apply: all new properties round-trip correctly for solver/preview

**Metrics:** GridSystem +42 LoC, Guards +187 LoC (8 subclasses), Throwable 89 LoC, TurnManager +8 LoC (hook integration)

**Next Steps:** Phase 02 extends state capture for solver BFS; Phase 03 reuses turn-manager hook for affordance gating.
