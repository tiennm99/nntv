# Level Retune Phase 3 — Difficulty Harness + Tuning Report

Scope: `src/lib/levels/levels.js`, `src/lib/levels/levels.solvability.test.js`. Engine untouched.
`pnpm test`: 243/243 green. `pnpm test:solvability`: 39/39 green, ~20-24s wall time (varies by run;
L11's chaser BFS pathfinding dominates at ~15s of that alone).

## 1. Before / after table

"Before" = post-engine-fix baseline measured by the Phase 1 report (mechanics now execute but
levels still authored against inert guards). "After" = this session's retune, final state.

| L | Name | opt before | opt after | guard tax | par | states (after) |
|---|---|---|---|---|---|---|
| 1 | Garden Path | 16 | 16 | 0 (no guards, by design) | 18 | 50 |
| 2 | The Watchtower | unsolvable | 19 | 1 | 20 | 68 |
| 3 | Vegetable Patrol | 18 | 19 | 1 | 20 | 117 |
| 4 | The Searchlight | 18 | 18 | 2 | 20 | 162 |
| 5 | Fortress Gate | 30 | 31 | 1 | 33 | 1365 |
| 6 | The Flickering Corridor | 18 | 30 | 12 | 32 | 356 |
| 7 | The Underground Passage | 28 | 29 | 1 | 30 | 646 |
| 8 | The Gauntlet | 20 | 22 | 2 | 24 | 657 |
| 9 | The Decoy Path | 20 | 23 | 3 | 25 | 8712 |
| 10 | Hall of Mirrors | 22 | 24 | 2 | 26 | 46021 |
| 11 | The Throne Room | 20 | 23 | 3 | 25 | 251612 |
| 12 | The Princess Chamber | unsolvable | unsolvable | n/a (frozen) | 99 | 5266 |

Guard tax = BFS-optimal-with-guards minus BFS-optimal-with-guards-removed. Every level moved off
zero; L2 flipped from unsolvable to solvable. L6's tax (12) is an outlier by design — decay
converts a period-2 blinker gap into a permanent seal, forcing a full-board backtrack, not just a
local wait.

## 2. Guard-tax thresholds chosen (in `levels.solvability.test.js`, `GUARD_TAX_MIN`)

```
L1: 0   L2: 1   L3: 1   L4: 2   L5: 1   L6: 10   L7: 1   L8: 2   L9: 3   L10: 2   L11: 3
```

Reasoning: L1 is a guard-free movement tutorial — tax is always exactly 0 and that's correct, not
a bug, so it's exempted rather than given a fake floor. L2-L5 and L7 teach one mechanic on a small
board with one interaction point — 1-2 moves is the entire available budget once that mechanic
fires once (verified: pushing harder broke solvability outright on at least three levels, see §5).
L6's floor (10) sits just under its measured 12 to leave tuning headroom without weakening the
regression guard. L8-L11 compound bigger boards and more guards, so floors step up to 2-3.
Thresholds are deliberately set at-or-just-below the measured value, not exactly equal, so the
test is a genuine regression floor rather than a number that breaks on the next micro-tune.

## 3. Per-level insight (for the briefing-text rewrite)

Each is what the level *actually* contains, verified by the solver — not the old aspirational copy.

- **L1 Garden Path** — no insight required; pure movement/traversal tutorial, zero guards.
- **L2 The Watchtower** — the wilting cycle has a fixed period (shrink 1/turn, then regrow); wait
  one beat at the safe cell just before a gap, then step through when the aura is at its lowest.
- **L3 Vegetable Patrol** — one-ways are commitment ratchets: plan the full route before crossing,
  since you cannot re-enter against the arrow.
- **L4 The Searchlight** — suspicion needs two consecutive turns in range to fire; cross its zone
  in a single turn if you can, or plan the stall before you're two turns deep in range.
- **L5 Fortress Gate** — the key2 pocket in the lower-right is one-way; the only exit is back
  through door1, so key1 must already be in hand before you go get key2, not after.
- **L6 The Flickering Corridor** — the blinker's own gap looks like the fast route, but decay
  keeps it lit-or-warm on every single turn for as long as decay is active; cross where the
  blinker ISN'T, not where it looks open.
- **L7 The Underground Passage** — trace the beam through BOTH mirrors before committing to the
  key; the second bounce lands exactly on the tile you need to stand on.
- **L8 The Gauntlet** — the sniper's cadence is fixed and its beam is unbounded; count turns from
  the start rather than reacting to its current facing, since the gap is the only crossing.
- **L9 The Decoy Path** — the row-4/6 gap guard is a short, fixed, countable bounce; time your
  crossing to its cycle. (Stones remain a legitimate shortcut for a sloppier route — see §5.)
- **L10 Hall of Mirrors** — decay makes a beam's afterglow outlast the sweep itself; count from
  when the light left, not from when the cell looks dark, before stepping in.
- **L11 The Throne Room** — the chaser's detection radius is fixed and Manhattan-based; plan the
  mid-map crossing to stay outside radius 2 of its position, not just off its exact tile.

## 4. Tuning constants chosen

All within levels.js (per-level guard parameters); no engine constants changed.

- **Static pulse (`initialRadius`)**: 1 for all new small-board timing guards (L2, L3, L6's
  secondary), 2 for area-denial guards (L4, L8, L11). Radius 1 gives a 3-turn cycle (short enough
  to reason about by counting on fingers); radius 2 gives a 4-turn cycle with a wider danger zone,
  used where a whole approach corridor needs denying, not just one cell.
- **Suspicion range**: kept at the audit-era values (2-3) — the engine fix (tier persists, tier-2
  lights the full range diamond) already made these meaningfully harder without retuning the
  number itself.
- **Sniper `rotateCadence`**: kept at 2 everywhere (matches the original design intent; changing
  it wasn't necessary once beams were repositioned to actually cross the route).
  **`ROTATING_BEAM_RANGE`** (engine constant, unchanged at 5): sufficient for every mirror
  placement used in this retune; no level needed a longer reach once mirrors were moved onto
  the actual route instead of the original mis-measured positions.
- **Chaser `detectionRadius`**: kept at 2 for L11. Tried 3 and 4 (per the Phase 1 report's open
  question and the original audit's R7 suggestion) — 4 took 256s and 1.3M states to solve, 3 timed
  out past 500k states before resolving. Both are incompatible with a CI budget on an 11x11 board
  with 6 other guards. Documented as a hard constraint, not a preference.
- **Rotating/sniper `startDirection`/`startFacing`**: the actual tuning lever used everywhere.
  Every beam-based guard (L5, L7, L8, L10, L11's rotating) was retimed by picking the phase that
  makes the guard's "beam active" turn land on the earliest possible arrival at the cell it
  guards, computed from `facing(k) = (start + floor(k / cadence)) mod 4` (rotating: cadence 1;
  sniper: cadence = `rotateCadence`). This is the single technique that turned every "guard doesn't
  matter" level into a real one — repositioning alone wasn't enough; phase mattered as much as
  place.

## 5. Deliberately not done / unresolved

1. **L9 stones and L10 mirror are not proven load-bearing at the BFS optimum.** Both mechanics are
   present, functional, and correctly wired (no wall overlaps, mirrors reflect, stones are legal
   throws) but the solver finds a wait/detour route around them that's exactly as short as any
   route using them. `levels.solvability.test.js`'s `MECHANIC_NECESSITY` list omits these two
   entries rather than asserting a check known to fail — flagging it here instead of quietly
   deleting the requirement. Root cause: a single small guard (patrol bounce, mirror-fed beam) on
   an otherwise-open board always has *some* free timing window, because the player can freely
   reroute a few cells elsewhere to shift arrival parity at zero cost; forcing genuine necessity
   needs either a fully rail-roaded single-file corridor with zero rerouting slack, or a
   guard whose danger coverage has no gap at all (attempted for L9 with two guards permanently
   swapping the same two cells — this made the level provably unsolvable instead, see #2).
2. **L11 is not the longest optimal path among L1-L11** (23, vs L5's 31/L6's 30/L7's 29), so the
   "L11 is the hardest playable level" and "monotonic curve" acceptance criteria are only
   partially met. Root cause, confirmed by direct experiment: this specific 7-guard combination
   is right at the edge of solvability. Three independent attempts to add a second forced
   chokepoint (a static guard sitting exactly on a single-file gap; a sniper-guarded band near the
   goal; a 2-cell-wider version of the same band) each made the level **provably unsolvable**
   (`no_path`, not a budget/timeout artifact — verified via a plain wall-only BFS connectivity
   check and per-guard-type ablation). The mechanism: a periodic guard sitting exactly on a
   mandatory single cell has exactly one safe entry turn, and the very next turn its radius/cycle
   resets to maximum danger — covering every adjacent cell before the player can move off the gap.
   This is a corner-trap, not a puzzle. The safe, shipped version keeps chaser as the sole but
   fully load-bearing tax source (verified: removing only the chaser drops the solve to the
   guard-free 20) rather than risk another silent lockout. Recommendation: a follow-up pass
   dedicated solely to L11, likely widening the board or reducing guard count to buy back the
   slack this combination needs for a second real chokepoint.
3. Did not add `describe.skip` scaffolding or delete/weaken any existing assertion to force green
   — `KNOWN_UNSOLVABLE_BUGS` is empty, matching Phase 1's exit state.
4. Did not touch `progress.js`'s star formula (3★ ≤ par, 2★ ≤ par+3) — only tightened `parMoves`
   per level so 3★ tracks the real optimum instead of a stale pre-retune number.
5. Memoized the baseline (unablated) solve per level (`solveBaseline`) across the guard-tax,
   mechanic-necessity, and par-invariant test blocks — cut total suite time from ~92s to ~20s by
   solving L11 once instead of four times. Documented in-file since it's a real perf-relevant
   design choice, not just cleanup.

## Unresolved questions

1. Is L11 not being the strict hardest level (by BFS path length) acceptable given the concrete,
   reproducible solvability wall documented in §5.2, or should a wider L11 redesign be scheduled
   before this ships?
2. Should L9/L10's non-necessary mechanics be accepted as "present but decorative at the optimum"
   (they still teach/demo the mechanic to a human player, just not to the solver's shortest path),
   or does the acceptance bar require a follow-up redesign pass for those two specifically?
3. `chaser detectionRadius` is capped at 2 for CI-runtime reasons, not design reasons — if the
   solver ever gains pruning (A*/dominance, mentioned as future work in the Phase 1 report), radius
   3-4 should be revisited for L11.
