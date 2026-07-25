# Engine Correctness Review — Solver Sync & State Integrity

Date: 2026-07-25 | Scope: `src/lib/game/*.js`, `src/scenes/Game.svelte`, `src/lib/levels/levels.js`
Method: static read + 4 executable probes (scratchpad) + `pnpm test` (180 pass) + full solver-path replay through the real `TurnManager` for L1–L11.

## Headline

- Solver/engine pipeline parity is **good on the happy path**: every BFS solution for L1–L11 replays to `WIN` through the real `TurnManager` (probe `replay-solver-paths.mjs`). No P0 solver desync on shipped playable levels.
- The real damage is elsewhere: **three advertised mechanics do not execute at all** (mirror reflection, light-decay/warm tiles, chaser return-home on L11), the **V-preview can lie** for player-dependent guards, and **a player can stand on a patrolling guard undetected**.
- CI cannot see any of this: the solver reproduces the same dead mechanics, so `test:solvability` "proves" levels solvable that are much easier than authored.

---

## 1. Rule-parity matrix (turn-manager vs level-solver)

| # | Engine rule | turn-manager.js | level-solver.js | Verdict |
|---|---|---|---|---|
| 1 | Turn order: goal → throw.resolve → clearAllLight → guards → tickWarm → detect | `:17-36` | `simulateTurn :189-209` identical | MATCH |
| 2 | Goal check runs *before* guards move (last step always safe) | `:20-22` | `:190-192` | MATCH |
| 3 | Detection = `isLight(player)` only, only *after* guards move | `:31` | `:205` | MATCH |
| 4 | Guard iteration order = array order, incremental grid mutation | `:27` | `:197` | MATCH |
| 5 | Move validation (bounds/wall/door/one-way/key pickup) via `Player.moveTo` | Game.svelte `:372` → `player.js:62` | `:287` same call | MATCH |
| 6 | Door cleared on entry (single-use) | `player.js:74` | same code path | MATCH |
| 7 | Key auto-collect → bitmask | `player.js:87-92` | same, hashed via `k` + `kc` | MATCH |
| 8 | One-way entry direction | `player.js:78-81` | `:280-287` same encoding | MATCH |
| 9 | Throw validation: Manhattan ≤3 + Bresenham LOS | `throwable.js:34-47` | `hasLOS :131-142` duplicate | MATCH (code triplicated, see F13) |
| 10 | Throw target legality = ≥1 distractible guard within 2 | enforced in UI only (`Game.svelte:155-173`) | `enumerateThrowTargets :144-177` | MATCH (coupling is implicit — engine itself allows any LOS target) |
| 11 | Distraction lasts exactly the throw turn (`forcedFacingTurns=1`, consumed same turn) | `throwable.js:61` + guards | same objects | MATCH |
| 12 | Chaser BFS step + direction tie-break | `guards.js:245-281` | same object reused | MATCH |
| 13 | Rotating rotation, beam range 2, mirror bounce | `guards.js:91-142` | same | MATCH (both dead — F1) |
| 14 | Sniper cadence/facing/unbounded beam | `guards.js:550-558` | same | MATCH |
| 15 | Suspicion tier ramp + fire-then-reset | `guards.js:602-624` | same, hashed `tier` | MATCH |
| 16 | Static wilt, clamp at −1 | `guards.js:58-63` | hashed `currentRadius` | MATCH |
| 17 | Blinking toggle | `guards.js:180-183` | hashed via base `isOn` | MATCH |
| 18 | Patrol ping-pong / circular | `guards.js:448-487` | hashed `currentPathIndex`+`isReversing` | MATCH |
| 19 | Warm/decay tiles | created `grid-system.js:101-105`, destroyed same turn `:200-213` | hashed `w`, plus extra warm cells leaked by `:249,:264` | MODELLED DIFFERENTLY — harmless today only because warm is inert (F4, F11) |
| 20 | Princess: `update()` after `nextTurn`, **after** the goal early-out | `Game.svelte:378,493` | `:201-204` **before** the goal check is irrelevant — solver returns `levelComplete` at `:190` before princess ever runs | **DIVERGE (F2)** |
| 21 | Guard/light state entering a turn is the previous turn's residue | implicit | rebuilt by `clearAllLight`+`updateLight` `:248-250,:263-265` | MODELLED DIFFERENTLY (equal light set; unequal warm set) |
| 22 | Player standing on a guard is undetected for patrol guards | `guards.js:403-417` no self-light | same | MATCH (both wrong — F5) |
| 23 | V-preview mutates warm state | `turn-manager.js:45,63` | not modelled (solver has no preview action) | Solver under-approximates player-reachable grid states (inert today — F10) |
| 24 | Undo/redo | `game-history.js` | not modelled | OK — undo cannot create states BFS didn't reach, except F12's warm gap (inert) |
| 25 | `parCap = ceil(par*1.5)` path pruning | n/a | `:221-224,:244` | Solver-only; can only produce false *negatives* (loud CI failure), not false positives |

**Bottom line:** one true divergence (F2, princess/goal ordering, live on L12 only) and one structural divergence (warm-state leakage, currently masked because the warm mechanic is a no-op).

---

## 2. Snapshot-completeness matrix

`capture()`/`apply()` audited field-by-field against each class's own mutable fields.

| Class | Mutable fields | In `capture()` | Missing |
|---|---|---|---|
| `Guard` (base) | row, col, direction, isOn | all + `type` | — |
| `StaticGuard` | + currentRadius (`initialRadius` const) | + currentRadius | — |
| `RotatingGuard` | + forcedFacingTurns, forcedFacingTarget (`lightRange`, `directions` const) | both, target deep-copied | — |
| `BlinkingGuard` | isOn (`litCells` const) | via base | — |
| `MirrorGuard` | none (`reflectDirection` const) | — | — |
| `ChaserGuard` | + isChasing, isReturning, targetRow/Col, forcedFacing* (`startRow/Col` const) | all | — |
| `PatrollingGuard` | + currentPathIndex, isReversing, forcedFacing* (`path`, `isCircularPath` const) | all | — |
| `SniperGuard` | + facing, turnsSinceRotate | both (`direction` resynced on apply) | — |
| `SuspicionGuard` | + tier (`range` const) | tier, range | — |
| `Player` | row, col, keysHeld | all | — |
| `ThrowableSystem` | stonesLeft, pendingTarget | both, deep-copied | — |
| `PrincessMechanic` | alerted, alertRadius, messageShown | all | — |
| `GridSystem` | isLight, isWarm/warmTurnsLeft, isDoor/doorKeyId, isKey/keyId | warm/door/key snapshots exist | light not snapshotted (recomputed — OK) |
| `GameHistory.createSnapshot` | player, guards, turnCount, princess, keys, doors, throwSystem | 9 fields (verified at runtime) | **warm-tile snapshot (F12)** |
| `TurnManager.previewNextTurn` | guards + throwSystem restored | `:42-43,:60-61` | **grid warm state (F10)**, **princess ring (F10)** |

No reference-aliasing defects found: `forcedFacingTarget` and `pendingTarget` are spread-copied on both capture and apply; guard/grid snapshots are freshly-built arrays.

---

## 3. Findings

Severity: **P0** unwinnable-or-cheatable · **P1** unfair / mechanic absent · **P2** latent.

| id | sev | file:line | failure scenario (reproduced) | fix |
|---|---|---|---|---|
| **F1** | P1 | `guards.js:96` (`lightRange=2`), `guards.js:105`; levels.js `:510` vs wall `:496` | **Mirror reflection never fires in any shipped level.** Probe: instrumented `castBeam`/`_castBeam`, ran 20 turns on L7/L10/L11/L12 → `reflections observed = 0` on all four. Cause (a) rotating beam range is 2 but mirrors are placed 5 cells away (L7 rot(2,2)→mirror(2,7); L10 rot(2,2)→mirror(2,7), rot(7,9)→mirror(7,4)); cause (b) L11's mirror sits on wall (3,8) and `castBeam` breaks on `isWall` *before* the mirror lookup, so a wall-mounted mirror can never reflect. Result: 4 levels are materially easier than the authored design; the "Hall of Mirrors" has no mirror behaviour. | Move mirrors within `lightRange` of their feeder guard (or give mirror-feeding beams a longer range), never place a mirror on a wall, and add a solvability-suite invariant: every `mirror` guard must be non-wall AND reachable by some beam within N turns. |
| **F2** | P0 (scoped to `isFinalLevel`) | `Game.svelte:378-381,492-498` vs `level-solver.js:190-192` | **Solver says WIN, engine says DETECTED on the same move.** Probe E6 on L12: princess alerted, player steps onto the goal (12,12). `turnManager.nextTurn` returns `{levelComplete:true}`, but `handleMove` calls `checkFinalLevel()` *first*; `princess.update` increments `alertRadius`, `lightRing` lights the goal cell (dist 0 ≤ radius), returns `detected:true` → `triggerDetection()` and `return` — `handleLevelComplete()` is never reached. The solver's `simulateTurn` returns `levelComplete` at `:190` before princess runs, so it would call the same move a win. Masked today only because L12's goal is unreachable; it is the root cause of the "L12 unsolvable" easter egg and the `window.__nntvDev.teleport` workaround. | In `handleMove`/`handleWait`, handle `result.levelComplete` **before** `checkFinalLevel()`; or early-out of `PrincessMechanic.update` when the player is on the goal. Then make the L12 "unsolvable" invariant intentional in level data, not an accident of ordering. |
| **F3** | P0 | `guards.js:403-417` (patrol `updateLight` never lights own cell); `turn-manager.js:31` | **Player can stand on a patrolling guard, and swap through it, undetected.** Probe E2: player (2,2), patroller path (2,1)→(2,2)→(2,3); after `nextTurn` guard and player both at (2,2), `detected=false`; next turn the guard walks off, still `detected=false`. Probe P2: player moves onto the guard's cell while the guard moves onto the player's old cell — a clean swap, `detected=false`. On L9 (two patrollers) or L8 a player can ride a patroller's cell to neutralise it entirely. The BFS models the same hole (verified: no current L8/L9/L10 solution uses it, so par values are unaffected — for now). | Either treat player/guard co-location as detection in `nextTurn` (check `guards.some(g => g.row===player.row && g.col===player.col)`), or have `PatrollingGuard.updateLight` light its own cell like every other guard type. Whichever is chosen, the solver inherits it automatically. Add a turn-manager test for co-location and for the swap. |
| **F4** | P1 | `grid-system.js:101-105` + `turn-manager.js:26,29` | **The decay/warm mechanic is a no-op.** `clearAllLight` sets `warmTurnsLeft = 1`; `tickWarmTimers` runs later in the *same* `nextTurn` and decrements it to 0, clearing the flag. Probe E1 (`decayTiles:"all"`, blinking guard): after turn 1 and turn 2, `getWarmSnapshot() === []`. Warm is also never consulted by detection (`nextTurn:31` reads `isLight` only) — grep shows the only consumers are `GameBoard.svelte:73,91` (a CSS class + `tile-warm.png`). So L6 "The Flickering Corridor" and L10's "decay windows" (levels.js:207-209, 429) describe a mechanic that does not exist, and the warm tile art never renders in normal play. | Decide the intent: if warm is meant to be a visible 1-turn safe window, set `warmTurnsLeft = 2` in `clearAllLight` (or tick before clearing) so it survives to render; if it is meant to be gameplay-bearing, detection must read it. Then add an end-to-end test: decay-eligible cell lit at turn N is `isWarm` at the end of turn N+1. |
| **F5** | P1 | `turn-manager.js:41-67` | **V-preview lies for player-position-dependent guards (chaser/suspicion).** The preview simulates the next turn with the player *stationary*, but the real turn runs after the player moved. Probe P1: 5×5, player (2,1), chaser (0,0) r=3 → preview lit set `{0,1 · 0,2}`, i.e. (2,0) looks safe. Player moves left to (2,0) → chaser BFS retargets, steps to (1,0), lights (1,0) and (2,0) → `detected:true` on a cell the preview painted dark. Live only on L12 today (only chaser level with `preview` enabled — L11 sets `preview:false`); shipped suspicion guards use range 2–3, where the equivalent case is unreachable in one step. Any future chaser+preview level is unfair. | Either compute the preview per candidate destination (5 previews: 4 moves + wait) and render the union/per-direction hint, or exclude player-reactive guards from the preview and mark them explicitly in the HUD. Test gap: `turn-manager.test.js:101` only checks preview parity for a `RotatingGuard` with a stationary player. |
| **F6** | P1 | levels.js:525 (chaser at 6,5) vs wall levels.js:499 | **L11's chaser starts inside a wall and can never go home.** Probe: `isWall(6,5)=true`; after a chase it parks at (6,4); `bfsNextStep(home)` returns `null` forever because BFS refuses to enter wall cells, so `isChasing/isReturning` stay `true` permanently and the guard is frozen wherever it lost the player, lighting 2 cells forever. Also lights a wall cell on turn 0. | Move the chaser start to a floor cell; add a level-data invariant test: no guard `position`/`startPosition` may be a wall. |
| **F7** | P2 | levels.js:520-521 (path cell 8,4) vs wall :501; levels.js:353-354 (7,5) vs wall :341 | **Patrollers walk through walls** on L8 and L11 — probe shows the L8 patroller inside wall (7,5) on turns 0,2,4,6 and the L11 patroller inside wall (8,4) on the same cadence. `PatrollingGuard.onTurnChange:481-485` assigns path positions with no wall check. Visually broken and it makes the guard's lit cells appear from inside geometry. | Add a level-data invariant: every patrol path cell must be non-wall and adjacent to its successor. (Adjacency currently holds everywhere; wall overlap does not.) |
| **F8** | P2 | `player.js:69-81` | **A rejected move can permanently open a door.** `moveTo` calls `g.clearDoor(row,col)` *before* the one-way check, then returns `false`. Probe E5: door+one-way on (2,2) with `keyId=1` held, entering from the wrong direction → `move()` returns `false`, player does not move, no turn is consumed, no history snapshot is pushed (`Game.svelte:371-373` discards it) — and `isDoor(2,2)` is now `false`. Free door, free of charge, unundoable. No shipped level puts a door and a one-way on the same cell, so this is latent. | Validate every precondition before applying any mutation: compute pass/fail first, then clear the door and move. |
| **F9** | P2 | `guards.js:460` | **A patrol guard with a path of length ≤1 goes permanently blind.** The early `return` skips `updateLight()`, so after the first `clearAllLight` the guard emits nothing forever. Probe E3: light present at load, `[]` after one turn. No shipped level has such a path (verified across all 12). | Call `this.updateLight()` before the early return. |
| **F10** | P2 | `turn-manager.js:45,63-64` | **Preview leaks grid state.** `previewNextTurn` restores guards and the throw system but not the grid: (a) probe E4 — warm snapshot goes from `[]` to `[[1,1,1]]` merely by pressing V, which is in fact the *only* way a warm tile ever renders (see F4); (b) probe E4c — on an alerted final level the princess ring is wiped from the grid (`isLight(5,5)` true → false) because the restore path only re-runs `guard.updateLight`, so pressing V on L12 makes lethal ring cells look dark until the next turn recomputes them. | Capture/restore `grid.getWarmSnapshot()` around the preview and re-apply `princess.lightRing` in the restore step (same as `Game.svelte:462` already does for undo). |
| **F11** | P2 | `level-solver.js:248-250, 263-265` | **Solver leaks warm state between BFS branches.** `applyState` restores `w` exactly, then the very next `grid.clearAllLight()` converts whatever light was left over from the *previous* branch's simulation into warm cells that are not part of the parent state, before `simulateTurn` runs its own `clearAllLight`. Today this is invisible because warm always dies inside the same turn (F4) and nothing reads it; the moment F4 is fixed, state hashing and detection in the BFS diverge from runtime. | Clear light without the warm side effect when rebuilding a parent's lighting (add a `clearAllLight({decay:false})` or set lights directly), then re-apply the warm snapshot after the rebuild. |
| **F12** | P2 | `game-history.js:20-34` | **Undo does not restore warm tiles.** Runtime dump of snapshot keys: `playerRow, playerCol, keysHeld, turnCount, princess, guards, keySnapshot, doorSnapshot, throwSystem` — no warm snapshot, although `GridSystem.getWarmSnapshot/applyWarmSnapshot` already exist and the solver uses them. Inert today (F4); becomes a real illegal-state bug on decay levels (L6, L10 — note L10 has `undo:false`, L6 has `undo:true`) as soon as warm survives a turn. | Add `warmSnapshot: grid ? grid.getWarmSnapshot() : null` to `createSnapshot` and restore it in `_applySnapshot`. |
| **F13** | P2 | `throwable.js:10-22`, `level-solver.js:131-142`, `Game.svelte:141-152` | **Line-of-sight is implemented three times, byte-identical.** No divergence today (verified by reading all three), but the throw-legality contract is split across engine/solver/UI; a fix to one will silently unsync the others, and the UI's extra "distractible guard within 2" filter is the *only* thing keeping `ThrowableSystem.throw` (which accepts any LOS target ≤3) aligned with the solver's pruned action set. | Export `hasLineOfSight` and a single `isValidThrowTarget(grid, guards, from, to)` from `throwable.js`; have the solver and Game.svelte import it. |

### Checked and clean

- Player/chaser swap or pass-through: impossible — the chaser retargets the player's post-move cell and lights its own cell (probe E2b, `detected:true` in both turns).
- All 11 solver paths replay to `WIN` through the real `TurnManager` (L9 215k states/15s, L11 207k/17s — both under the 2M cap).
- Manhattan is used consistently for throws, chaser detection, suspicion range and static aura; Chebyshev appears only in `SuspicionGuard.updateLight` (8-neighbour fire), which is intentional and identical in both engines.
- No off-by-one in `isValidPosition` bounds; all grid mutators are position-guarded.
- Snapshot deep-copies: no shared-reference aliasing found.
- `pnpm test`: 180/180 pass.

---

## 4. Test-coverage gaps that would have caught these

| Finding | Missing test |
|---|---|
| F1 mirrors inert | Solvability-suite invariant: each `mirror` guard is non-wall and receives a beam at least once within `2 × parMoves` turns (probe-style `castBeam` depth counter). |
| F2 princess/goal order | Scene-level (or extracted-function) test: on `isFinalLevel` with `princess.alerted`, stepping onto the goal must produce level-complete, not detection. Today no test exercises `Game.svelte`'s turn ordering at all — `checkFinalLevel` is untested. |
| F3 co-location | `turn-manager.test.js`: (a) player and patrolling guard on the same cell → `detected`; (b) player and guard exchange cells in one turn → `detected`. Neither exists; `guards.test.js` only asserts lit-cell offsets. |
| F4 warm inert | End-to-end decay test: `setDecayEligibleAll` + a guard that lights (1,1) at turn N → assert `isWarm(1,1)` **after** `nextTurn` returns. The existing `turn-manager.test.js:144` test seeds warm with `setWarm()` and asserts it expires, which documents the bug as intended behaviour. |
| F5 preview lies | Extend `turn-manager.test.js:101` to a `ChaserGuard` with the player *moving* between preview and `nextTurn`; assert every actually-lit cell was in the predicted set. |
| F6/F7 guards in walls | `levels.solvability.test.js` metadata block: no guard position and no patrol path cell may be a wall (it currently only checks `litCells`). |
| F8 door on failed move | `player.test.js`: door+one-way on one cell, wrong-direction entry with the key held → `move()` false **and** `isDoor` still true. |

---

## 5. Unresolved questions

1. **F2 / L12:** is "unsolvable by design" meant to be enforced by geometry, or is the princess-kills-you-at-the-goal ordering the intended mechanism? The fix changes L12's outcome for the teleport easter egg too.
2. **F4:** what was the warm tile supposed to *do* — purely a visual afterglow, or a detection-relevant safe window? Detection currently never reads it, so even a lifetime fix leaves it cosmetic.
3. **F3:** is co-location intended (ninja hides in the guard's shadow) or an oversight? Fixing it changes solvability for every patrol level and will require re-running the solvability suite.
4. **F1:** should the rotating beam range grow, or should the mirrors move? Either changes L7/L10/L11 difficulty and par values.
5. `restartTimeout` (`Game.svelte:178`) is declared and cleared but never assigned — leftover from a removed auto-restart path? Same for `restartLevel`'s `throwSystem.reset()` (`:241-244`), which mutates the system that `initLevel()` immediately replaces.
