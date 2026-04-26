# Code Review — NNTV v2 "Tight 12" Final

Reviewer: code-reviewer
Date: 2026-04-25
Scope: 30 modified + 8 new files (~3.7k LOC delta) across 6 phases.

## Sacred Constraints — Verified

- **L12 byte-identical:** Diff against HEAD shows L12 block unchanged in `src/lib/levels/levels.js:531-627`. Walls, guards, parMoves, isFinalLevel preserved.
- **No new deps:** `git diff package.json` empty.
- **Exactly 12 levels:** `LEVELS.length === 12` (asserted in solvability test).
- **All 11 solvable + L12 unsolvable under 2M nodes:** 180 tests pass (full suite ~52s); solvability suite green.
- **Build clean:** `npm run build` succeeds (one Svelte state-locality warning, pre-annotated with svelte-ignore).

## Critical (blocks merge)

None.

## High (should fix before merge)

### H1. Suspicion tier never reaches GuardSprite — visual + audio cue both broken
File: `src/scenes/Game.svelte:82-84` and `src/scenes/Game.svelte:116-117`

`guardSnapshots` $derived strips `tier` from suspicion guards:
```js
guards.map(g => ({ row, col, type, direction, isOn, isChasing }))
```
Property `tier` (and `currentRadius`, `facing`, `forcedFacingTurns`, etc.) never propagates to `GuardSprite`. Effect:
- Suspicion guard sprite tier dots (`GuardSprite.svelte:158-164`) always render as tier 0
- `SuspicionRing` overlay (`GuardSprite.svelte:167`) always shows tier 0
- Worse: audio effect at `Game.svelte:116-117` reads `g.suspicionTier` (wrong key — actual property is `g.tier`), so `playSuspicionAlert` / `playSuspicionFire` never fire

Fix: extend `guardSnapshots` projection to include type-specific fields (`tier`, `currentRadius`, `facing`), or pass live guard refs to GuardSprite (current approach works for visual reactivity since `renderVersion++` triggers re-render). Then change `g.suspicionTier` → `g.tier` in the audio effect.

### H2. Stale guard state seeds throw enumeration — latent solver correctness gap
File: `src/lib/game/level-solver.js:247-252`

`enumerateThrowTargets` runs BEFORE `applyState`, reading live `guards` array which holds whatever state was left by the last inner-loop iteration (or initial `loadLevel` state for the first parent). The pruning `gDist <= 2` and `DISTRACTIBLE_TYPES.has(g.type)` checks against stale guard positions — may incorrectly include or exclude throw actions for the parent state.

Currently benign because (a) no level requires throws to be solvable per L9 limitation note, and (b) `throwSystem.throw` re-validates LoS/distance from player so phantom throws fail safely. But if a future level made a throw mandatory, this would silently miss valid actions.

Fix: move `applyState(state, ...)` above the throw enumeration, or pass `state.g` snapshot directly to `enumerateThrowTargets` for distance/type checks instead of relying on live engine objects.

## Medium (nice to fix)

### M1. Dead throw-targeting code in GameBoard.svelte
File: `src/components/GameBoard.svelte:18-20, 80-81, 130-134, 229-250`

GameBoard accepts `throwTargetCells` and `throwCursor` props with default `Set()` / `null`, but Game.svelte never passes them — the UI uses the separate `ThrowTargetingOverlay` component overlay. The unused props, helpers (`isThrowTarget`, `isThrowCursor`), conditional rings, and CSS rules (`.throw-target-ring`, `.throw-cursor-ring`) are dead. Confirm intent then either delete or actually pass.

### M2. Unused state and import in Game.svelte
File: `src/scenes/Game.svelte:13, 97`

- `playDoorUnlock` imported but never invoked (acknowledged door-audio gap — gap is documented in phase-06 report).
- `_prevOpenDoors = $state(0)` declared but never read or written outside its declaration.

Either delete or actually wire (engine would need a `doorOpened` delta from TurnManager, out of scope per docs).

### M3. Redundant clearAllLight + updateLight in solver loop
File: `src/lib/game/level-solver.js:258-259`

After `applyState`, no engine code reads `isLight` before `simulateTurn` runs (`player.moveTo`, `throwSystem.throw` ignore lights). The pre-action `grid.clearAllLight()` + `guards.forEach(g => g.updateLight(guards))` does no observable work — but it does mutate warm timers when decay-eligible cells transition from lit → dark. Since lights aren't actually set after `applyState` (warm snap restores warm flags but not lit flags), `clearAllLight()` is a no-op too.

Fix: drop both lines for clarity, or add a comment explaining intent if there's a subtle reason to keep them.

### M4. `simulateTurn` belt-and-suspenders goal check is unreachable
File: `src/lib/game/level-solver.js:295-297`

`simulateTurn` already returns `levelComplete=true` at line 191 if player is on goal. The check on line 295 only fires when `levelComplete=false && detected=false`, which means goal was NOT reached. Code is harmless but misleading.

### M5. Files exceed 200-LoC modularization guideline
- `src/lib/game/guards.js` 651 (8 guard subclasses + helper) — could split per-type into `guards/{static,rotating,…}.js`
- `src/lib/levels/levels.js` 628 — pure data, lower priority
- `src/lib/game/level-solver.js` 308 — single-purpose
- `src/components/GameBoard.svelte` 251 — overlays could split (but each overlay block is small)

Not blocking; flag for follow-up if any of these continue growing.

### M6. `if (player.setKeysHeld)` defensive check is unnecessary
File: `src/lib/game/level-solver.js:106` and `src/lib/game/game-history.js:24, 47`

Player class always has `setKeysHeld`/`getKeysHeld`. Optional-chain `player?.getKeysHeld?.()` style is fine but the explicit `if` adds noise. Minor.

## Low (informational)

### L1. Capture/apply contract: `apply(s)` defaults `forcedFacingTurns` to 0
File: `src/lib/game/guards.js:156, 303, 442`

`apply` uses `s.forcedFacingTurns ?? 0` with nullish-coalesce — works because capture always emits the field. If a future capture omits it, apply silently zeroes. Probably the intent (defensive default), but worth noting.

### L2. SniperGuard has `lightRange` computed at construction
File: `src/lib/game/guards.js:503`

`this.lightRange = Math.max(grid.rows, grid.cols)` is fine for fixed grids. If grid resized after construction (it isn't currently, but `GridSystem.resize` exists), beam range would be stale. Not exercised today.

### L3. Sniper beam visual doesn't show mirror reflections
File: `src/components/GuardSprite.svelte:30-54`

Documented in phase-05 report. Beam line drawn via single SVG segment; mirror-bounced beams not visualized. Engine still lights the bounced cells via `_castBeam` so puzzle correctness is preserved — purely cosmetic gap.

### L4. L9 stones-not-strictly-required
Documented in phase-04 report. PatrollingGuard's front+right light model leaves timing gaps that BFS exploits without throws. Acceptable per docs; flagged again here for completeness.

### L5. `MAX_HISTORY = 50` undo cap
File: `src/lib/game/game-history.js:8`

50 snapshots × per-snapshot {keysHeld, guards.map(capture), keySnapshot, doorSnapshot, throwSystem} can grow to a few KB per level. Acceptable. Consider making it a named export if a level wanted to override (not now).

### L6. Solver leaves engine objects in mid-state on early return
File: `src/lib/game/level-solver.js:237, 290, 296`

Engine objects from `loadLevel` are mutated and not cleaned up on early `return`. Not shared with the running game (loadLevel always returns fresh objects), so no leak — but if a caller ever passed in pre-loaded state, this would corrupt it. Document the contract or always restore on exit.

## Phase-04.5 Patch Correctness — Verified

- `Player.moveTo` (`player.js:62-95`): enforces walls, doors (key bitmask check + `clearDoor` on entry), one-ways (moveDir match required when moveDir≠-1), key auto-collect on landing (`addKey` + `clearKey`).
- Solver state hash (`level-solver.js:62-77`): includes `k` (bitmask), `kc` (remaining key cells sparse), `dc` (remaining door cells sparse). All three differentiated (`level-solver.test.js:328-345, 347-358`).
- GameHistory snapshots (`game-history.js:20-34`): captures keysHeld, keySnapshot, doorSnapshot, throwSystem; round-trip tests assert undo restores all (`game-history.test.js:120-213`).
- Door/key/oneway parsed in level-manager (`level-manager.js:41-53`).

## Sacred Constraints Status

| Constraint | Status |
|---|---|
| L12 byte-identical | PASS (block unchanged vs HEAD) |
| 11 solvable + L12 unsolvable < 2M nodes | PASS (16/16 solvability tests) |
| No new deps | PASS (package.json clean) |
| Exactly 12 levels | PASS (asserted in test) |
| EN/VI + ARIA labels | PASS (12 storyKeys × 2 langs; ARIA in GuardSprite, GameBoard) |
| Build clean | PASS (1 Svelte warn, pre-annotated) |
| 180 unit tests pass | PASS |

## Positive Observations

- Solid capture/apply contract on every guard subclass with type-routed canonicalGuardKey
- Solvability suite includes per-level perf table, parMoves enforcement, metadata invariants
- L12 byte-identical verified by line-by-line diff
- Throw enumerator pruning (Manhattan ≤3, LoS, distractible-guard-near-target) keeps BFS state count manageable
- Player.moveTo cleanly composes door + one-way + key-collect in one path; tests exercise each branch
- Audio module guards every cue with `if (muted) return; if (!ctx) return;` and swallows resume rejection
- Locale coverage complete for all 12 levels EN+VI

## Recommended Actions (priority order)

1. Fix H1: extend `guardSnapshots` to include type-specific fields (or pass live refs); rename `g.suspicionTier` → `g.tier` in audio effect (`Game.svelte:116-117`).
2. Fix H2: hoist `applyState` above `enumerateThrowTargets` in solver inner loop to avoid stale guard state.
3. M1-M2: remove dead throw-targeting code in GameBoard or wire it; remove `_prevOpenDoors`; either wire `playDoorUnlock` (requires engine doorOpened delta) or drop the import.
4. Defer M3-M6 and L1-L6 to follow-up cleanup PRs.

## Unresolved Questions

- Should `playDoorUnlock` wiring be tracked as a follow-up issue, or is the audio cue silently dropped acceptable for v2 ship?
- Is there appetite to split `guards.js` per-type now that 8 subclasses live in one file?
- L11 chaser detectionRadius=2 may make L11 too punishing in human play (BFS finds path but humans rarely have BFS-perfect timing); does playtest data exist to confirm 5-15 attempts target?

**Score:** 9.0/10
**Critical:** 0
**High:** 2
**Status:** REQUEST_CHANGES (H1 visual+audio bug for suspicion tier needs a 5-line fix; H2 latent correctness should be addressed before next solver-touching change)
