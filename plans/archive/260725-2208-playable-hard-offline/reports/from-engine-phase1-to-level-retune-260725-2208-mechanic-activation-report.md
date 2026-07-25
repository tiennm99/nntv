# Engine Correctness + Mechanic Activation — Phase 1 Report

Date: 2026-07-25 · Scope: `src/lib/game/**` (guards.js, turn-manager.js, grid-system.js, player.js,
throwable.js, game-history.js, level-solver.js, level-manager.js) + colocated tests + new
`line-of-sight.js`. Every fix landed in both the live engine (turn-manager.js/guards.js) and the
BFS solver (level-solver.js) — verified by direct replay of solver paths through the real
`TurnManager` for 8 levels (all `WIN`).

## Test status

`pnpm test`: 219/220 pass. The single failure is `levels.solvability.test.js > L2 "The Watchtower"
must be solvable` — a file owned by Phase 2/3 (`src/lib/levels/*.test.js`), not touched. Left failing
deliberately per instructions (see "L1-L11 solvability" below).

`pnpm test:solvability`: L1, L3-L11 solvable; **L2 now unsolvable**; **L12 still unsolvable**
(pinned by existing test, `reason: no_path`, 5266 states).

## Changes per file

### guards.js
- **F3 — patrol co-location.** `PatrollingGuard.updateLight()` now lights its own cell (every other
  guard type already did). Fixes "player stands on/rides a patroller undetected."
- **F3 — swap case.** Not fixable by lighting alone (a same-turn cell exchange never leaves guard
  and player co-located at any single snapshot). Handled in `turn-manager.js`/`level-solver.js`
  instead (see below) using a new export `MOBILE_GUARD_TYPES = Set(['patrolling','chaser'])` —
  the only two guard types whose row/col change during `onTurnChange`.
- **F1 — mirror reflection.**
  - New tunable `const ROTATING_BEAM_RANGE = 5` (was hardcoded `2`). Value chosen as the minimum
    that reaches every shipped mirror in a straight line (L7/L10 rotators sit 5 cells from their
    mirrors). `RotatingGuard.lightRange` and `SniperGuard.lightRange` (already unbounded, unchanged)
    both reference the shared beam-casting helper.
  - Extracted `castBeamWithMirrors(grid, dir, fromRow, fromCol, range, allGuards, depth)` and
    `reflectBeam(dir, reflectType)` as module-level functions (removes the byte-identical
    `RotatingGuard.castBeam`/`SniperGuard._castBeam` duplication — noted as a DRY issue in the
    engine review). Both guard classes now delegate to it.
  - **Mirror-before-wall fix:** the beam now checks for a mirror at each step *before* checking
    `isWall`. A mirror mounted on a wall cell (L11: mirror at (3,8), which is also in the wall list)
    now reflects correctly instead of the beam dying on the wall check first. Verified live:
    `isLight(4,8)` (the reflected beam's first cell) goes `true` within 8 turns on L11 — confirmed
    0 → non-zero reflections.
  - **Still blocked by unrelated walls (Phase 3 must fix — see "Guard/wall coordinates" below):**
    increasing range does not help when a different wall sits directly in the beam's straight-line
    path. Confirmed via live probe:
    - L7: rotator(2,2)→mirror(2,7) now reflects (verified `isLight(3,7)=true`). The *second* mirror
      (6,7), fed by the first mirror's reflected beam heading down column 7, is blocked by the wall
      at **(5,7)** — never reflects.
    - L10: rotator(2,2)→mirror(2,7) is blocked by the wall at **(2,5)**, directly between them.
      rotator(7,9)→mirror(7,4) is blocked by the wall at **(7,7)**. Neither reflects with the current
      wall layout regardless of beam range.
    - L11: mirror(3,8)-on-wall now reflects (no obstruction between rotator(3,5) and the mirror).
- **Static guard regrow (item 6).** `StaticGuard.onTurnChange` no longer clamps at `currentRadius=-1`
  forever; once fully wilted it pulses back to `initialRadius` and repeats
  (`initialRadius=2` → cycle `2,1,0,-1,2,1,0,-1,...`, 4-turn period; `initialRadius=1` → 3-turn
  period). Deterministic, finite cycle — no state-space blowup. This is what flips L2 to unsolvable
  (see below) — the guard was previously a one-time 2-3 turn timer with zero long-run effect.
- **Suspicion persistence (item 7).** `SuspicionGuard`:
  - Tier no longer self-resets to 0 the turn after firing; it now decays `2→1→0` one step per turn,
    same rule as the climb `0→1→2`, only while the player is out of range.
  - Tier-2 lighting now covers the **full Manhattan `range`** diamond, not just the immediate 3×3 —
    `range` previously never denied any territory beyond one orthogonal step.
- **F6/F12 — chaser stuck forever (sane behavior for wall-authoring errors).** L11's chaser starts
  on a wall cell (6,5), so `bfsNextStep(home)` can never succeed (BFS never enters a wall cell, even
  as a destination). `ChaserGuard.onTurnChange` now gives up the return (clears `isChasing`/
  `isReturning`) instead of looping in `isReturning` forever, lighting 2 cells for the rest of the
  level.
- **F6/F12 — patrol path crossing walls.** `PatrollingGuard.onTurnChange` now refuses to enter a
  wall cell from its authored path (holds position instead; path-index bookkeeping still advances so
  later, valid, nodes keep working). No crash, no walking through geometry.
- **Trivial-path blind spot (found while fixing F3).** A `PatrollingGuard` with `path.length <= 1`
  previously `return`ed before calling `updateLight()`, going permanently dark after the first
  `clearAllLight()`. Now calls `updateLight()` before returning.

### turn-manager.js
- **F4 — warm/decay lifecycle.** Reordered `nextTurn`: detection check now happens **before**
  `tickWarmTimers()` (previously tick ran first, so a cell marked warm by `clearAllLight()` was
  expired again in the same call, before anything could ever observe it). Detection now also reads
  `grid.isWarm(...)`, per the ruling that **warm tiles are lethal**. Net effect: a cell that goes dark
  this turn is warm and lethal for exactly the following turn, then safe again — a real 1-turn
  afterglow instead of a no-op.
- **F3 — swap/co-location detection.** Snapshots mobile guard cells (`MOBILE_GUARD_TYPES`) *before*
  they move each turn; detection is `swappedWithGuard || isLight || isWarm`, where
  `swappedWithGuard` is true if the player's current (already-moved) cell matches a mobile guard's
  pre-move cell. Catches the clean-swap case that post-move co-location can't see (patroller and
  player cross paths in one turn without ever sharing a snapshot).
- **F5/F10 — truthful, non-leaking preview.** `previewNextTurn` was simulating the next turn with
  the player stationary, so it could paint a cell dark that a player-reactive guard (chaser, suspicion)
  would actually light the instant the player stepped there. Rewrote it to evaluate **every** action
  the player could take next (stay + each legal move, checked via the new `Player.canEnter`), run each
  candidate through the guards, and return the **union** of resulting lit/warm cells. Also fixed the
  leak where `previewNextTurn`'s internal `clearAllLight()` call fabricated real warm cells on the
  live grid (pressing the preview key used to be the *only* way a warm cell ever appeared, per the
  engine review) — warm state is now snapshotted and restored exactly, same as guard/throw state.

### grid-system.js
- Added `clearLight()` — clears `isLight` on every cell **without** the decay side effect. Used
  whenever code needs to repaint light for a state the simulation is already in (BFS branch
  re-entry, preview candidate branches) rather than genuinely transitioning to a new turn.
  `clearAllLight()` (with the decay side effect) is reserved for actual turn transitions. This
  matters once warm is lethal: reusing `clearAllLight()` for internal re-priming was fabricating
  warm cells that were never part of the real turn sequence (this was F10/F11 in the engine review;
  harmless while warm was inert, a real correctness bug once it isn't).

### player.js
- **F7 — rejected move opened doors.** Split `moveTo` into a read-only `canEnter(row, col, moveDir)`
  (bounds/wall/door-key/one-way checks, no mutation) and `moveTo`, which now calls `canEnter` first
  and only mutates (open door, move, collect key) if it returns true. Previously `moveTo` cleared the
  door *before* checking the one-way direction, so a door+one-way combo on the same cell could pop
  open on a move that was ultimately rejected.
- `canEnter` is also the mechanism that makes `previewNextTurn`'s multi-candidate simulation possible
  without duplicating movement-legality logic.

### throwable.js
- No behavior change. `hasLineOfSight` and `DISTRACTIBLE_TYPES` now import from the new
  `line-of-sight.js` instead of a local copy (F13).

### level-solver.js
- Mirrors every turn-manager fix: swap/co-location detection (via `MOBILE_GUARD_TYPES` import from
  guards.js), warm-lethal detection with tick-after-detection ordering, in `simulateTurn` (now
  exported for direct parity testing).
- **F11 — solver warm-state leak between BFS branches.** The two "re-prime state for the next
  action attempt" call sites (`applyState(...); grid.clearAllLight(); guards.forEach(updateLight)`)
  now call `grid.clearLight()` instead — the parent's warm state was already restored verbatim by
  `applyState`'s warm snapshot; re-deriving it from `clearAllLight()`'s decay logic here fabricated
  warm cells that were never part of the parent state. This was invisible while warm was inert; it
  would have silently desynced solver verdicts from the live engine the moment F4 landed, so it had
  to be fixed alongside F4, not separately.
- **F13 — DRY.** `enumerateThrowTargets` now calls the shared `isValidThrowTarget` from
  `line-of-sight.js` instead of a local `hasLOS` + inline Manhattan/wall/distractible-guard logic.
  Behavior unchanged (verified: same 8 existing `enumerateThrowTargets` tests pass unmodified).
- Added a comment next to the `PrincessMechanic` setup documenting that L12's unsolvability is
  intentional (owner-confirmed easter egg) and that the solver deliberately does not reproduce
  `Game.svelte`'s princess-before-goal ordering on that level — a guardrail against a future
  maintainer "fixing" it.

### line-of-sight.js (new)
- `hasLineOfSight(grid, r0, c0, r1, c1)` and `isValidThrowTarget(grid, guards, fromRow, fromCol,
  targetRow, targetCol)` + `DISTRACTIBLE_TYPES`. Single source of truth for the throw-legality
  contract that was previously byte-identical in `throwable.js`, `level-solver.js`, and (still, since
  it's a frozen file) `Game.svelte`. Now importable by any of them; `Game.svelte`'s copy is
  unmodified (out of ownership) but can migrate to this in a later phase.

### game-history.js
- **F12 — undo didn't restore warm tiles.** Added `warmSnapshot: grid.getWarmSnapshot()` to
  `createSnapshot` and `grid.applyWarmSnapshot(state.warmSnapshot)` (guarded for
  `undefined`/`null`, backward compatible with any pre-existing snapshot shape) to `_applySnapshot`.
  This was inert while warm was cosmetic; it is a real illegal-state bug now that warm is lethal on
  any decay-eligible level with undo enabled (L6 currently; L9/L10 have `undo:false` so are
  unaffected either way).

### level-manager.js
- No changes required. Guard construction and level-loading contracts were already correct; the
  guard/wall interactions were behavior bugs in guards.js, not loading bugs.

## Snapshot-completeness

New/changed mutable state audited against capture()/apply() and GameHistory:
- `StaticGuard.currentRadius` — already captured; regrow reuses the same field, no gap.
- `SuspicionGuard.tier`/`range` — already captured; persistence reuses the same field, no gap.
- `ChaserGuard.isChasing`/`isReturning` — already captured; the give-up-on-unreachable-home fix only
  changes when these flip, not what's captured.
- `GridSystem` warm state — **was missing from `GameHistory`** (F12); now added (see above). This is
  the one real snapshot gap this phase closed.
- No new mutable fields were introduced anywhere; every fix reused existing captured state or (for
  the swap-detection snapshot in turn-manager/solver) used a same-call local variable, not persisted
  state, so no `capture()`/`apply()` addition was needed there.

## Determinism

No `Math.random` anywhere (none existed before, none added). Static-guard regrow, suspicion decay,
and chaser give-up are all pure functions of turn count / player position — same inputs always
produce the same outputs. Chaser BFS tie-breaking unchanged (already total/stable: `up > right > down
> left` priority, unaffected by this phase).

## L1-L11 solvability: before/after

Solved path length (states explored) from the live solver, before this phase (source: puzzle-design
audit) vs after (measured just now):

| L | Before: opt (states) | After: opt (states) | Guard tax (after, with vs without guards) |
|---|---|---|---|
| 1 | 16 (50) | 16 (50) | 0 (no guards — intended) |
| 2 | 16 (60) | **UNSOLVABLE** (66, no_path) | **infinite** — was 0 |
| 3 | 18 (53) | 18 (125) | 0 (unchanged) |
| 4 | 16 (314) | **18** (169) | **2 — was 0** |
| 5 | 30 (1574) | 30 (1335) | 0 (unchanged, rotating guard still imposes no cost) |
| 6 | 18 (162) | 18 (253) | 0 (unchanged — decay now lethal but optimal route never touches a warm cell) |
| 7 | 28 (645) | 28 (626) | 0 (unchanged — mirror1 now reflects but off the optimal route) |
| 8 | 20 (984) | 20 (927) | 0 (unchanged) |
| 9 | 20 (215098) | 20 (148602) | 0 (unchanged) |
| 10 | 22 (59307) | 22 (52175) | 0 (unchanged — both mirrors blocked by unrelated walls, see above) |
| 11 | 20 (207395) | 20 (122259) | 0 (unchanged) |

**L2 and L4 are the only levels where guard behavior now measurably matters.** The rest are
unaffected in path length because their currently-optimal routes don't cross the cells the
now-functional mechanics protect — that's the level-geometry work Phase 2 (ablation CI) and Phase 3
(retune) own. State-explored counts dropped on the slow levels (L9: 215k→149k, L10: 59k→52k,
L11: 207k→122k) — the extra hazard density (regrowing statics, wider suspicion zones, live mirrors)
prunes more branches, so the solver is also faster despite doing more work per branch.

**Do not** interpret unchanged path length as "the fix didn't work" — mirror reflection, warm
lethality, and suspicion persistence are all verified working in isolation (see probes above); they
just don't yet intersect the shipped optimal route on 9 of 11 levels. That is exactly the gap Phase 3
closes.

## Guard/wall coordinates Phase 2/3 must fix

Confirmed by reading `levels.js` walls arrays against guard/mirror/patrol positions:

- **L8**: patrol path node `(7,5)` is a wall (`walls` includes `{row:7,col:5}`). Guard now holds
  position instead of entering it (engine-safe), but the authored patrol path is wrong.
- **L11**: mirror `(3,8)` is a wall; patrol path node `(8,4)` is a wall; chaser start `(6,5)` is a
  wall. All three are now handled safely by the engine (mirror still reflects despite the wall flag;
  patrol holds position; chaser gives up its return instead of freezing) — but all three are still
  authoring mistakes that should be cleaned up.
- **L7**: wall `(5,7)` sits directly between mirror1's reflected beam (heading down column 7 from
  `(2,7)`) and mirror2 at `(6,7)` — blocks the second bounce entirely. Not a wall-on-guard overlap,
  but it neuters the "Hall of Mirrors"-style chain in this level.
- **L10**: wall `(2,5)` blocks rotator `(2,2)` → mirror `(2,7)` in a straight line; wall `(7,7)`
  blocks rotator `(7,9)` → mirror `(7,4)`. Both of L10's mirrors are geometrically blocked regardless
  of beam range — this is why L10's guard tax is still 0.

## Unresolved / deliberately not done

1. **L2 unsolvability.** Confirmed genuine (`no_path`, only 66 states explored — BFS exhausted the
   reachable space within the `parCap` of 36 moves, not a performance/budget issue). The three
   regrowing statics apparently deny every route within cap. This is squarely Phase 3's retune
   (reposition/retime the statics per the original review's R13 recommendation) — I did not weaken
   the regrow fix to force L2 passable, per instructions.
2. **F2 (princess-vs-goal ordering) — untouched, as required.** Left `Game.svelte`'s ordering alone;
   added a documentation comment in `level-solver.js` instead of code changes there.
3. **Game.svelte / GuardSprite.svelte still carry their own LOS/beam-casting copies.** `line-of-sight.js`
   and the shared `castBeamWithMirrors` are now available for them to import, but migrating those
   frozen-for-this-phase files is out of my ownership.
4. Did not attempt to "fix" L7/L10's remaining wall-blocked mirrors myself — that's level data, which
   I'm not permitted to touch. Documented exact coordinates above instead.
5. Did not change `parCap`/BFS pruning or add A*/dominance pruning — out of scope for this phase and
   not requested; current levels stay well under the 2M-state/60s budget (slowest: L9 at ~10s,
   149k states).

## Files modified

- `src/lib/game/guards.js`, `guards.test.js`
- `src/lib/game/turn-manager.js`, `turn-manager.test.js`
- `src/lib/game/grid-system.js`, `grid-system.test.js`
- `src/lib/game/player.js`, `player.test.js`
- `src/lib/game/throwable.js` (no test changes needed — behavior preserved)
- `src/lib/game/game-history.js`, `game-history.test.js`
- `src/lib/game/level-solver.js`, `level-solver.test.js`
- `src/lib/game/line-of-sight.js` (new)
- `src/lib/game/level-manager.js` — read, no changes needed

## Unresolved questions for the owner / Phase 3

1. Is a 4-turn static-guard pulse period (`initialRadius=2`) the right cadence, or should Phase 3
   tune per-level `initialRadius` values now that the guard is a real recurring hazard rather than a
   one-time timer?
2. `ROTATING_BEAM_RANGE=5` was picked as the minimum that reaches today's shipped mirror distances.
   If Phase 3 repositions mirrors farther away (per the original audit's R6 suggestions), this
   constant will need to grow with them.
3. Should L7/L10's wall-blocked mirror chains be fixed by moving the wall, moving the mirror, or
   accepting a single-bounce level instead of a chain? I left the choice to Phase 3 since it's a
   design call, not an engine defect.
