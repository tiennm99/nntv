# Puzzle Design & Difficulty Audit — Night Ninja: Twilight Voyage

Date: 2026-07-25 · Scope: L1–L11 puzzle quality + difficulty curve · Read-only audit
Evidence: BFS solver (`src/lib/game/level-solver.js`) run over all 11 playable levels, plus
guard-removal / stone-removal / one-way-removal / decay-removal ablations and static beam analysis.
L12 is unsolvable by design (owner-confirmed easter egg) and is out of scope here.

---

## 1. Headline verdict

**The game is not a stealth puzzle game today. It is a maze-walking game with decorative guards.**

The single decisive measurement: for **every level 1–11, deleting all guards changes the BFS
optimal path length by exactly zero moves.** Guard tax = 0/11.

| Ablation | Result |
|---|---|
| All guards removed | optimal identical on 11/11 levels |
| `wait` actions in optimal path | **0** on 11/11 levels |
| Stones removed (L9/L10/L11) | optimal identical (20 / 22 / 20) |
| `decayTiles` removed (L6/L10) | identical path **and identical state count** (162 / 59307) → provable no-op |
| Optimal == pure walls-only geometric lower bound | 9/11 levels (all but L5, L7) |

Five levels (L4, L6, L8, L9-nearly, L11) are solved by the literal L-shape
`down × (rows-1)` then `right × (cols-1)`. The climax level **L11 "The Throne Room" is beaten by
walking down the left edge and across the bottom edge** — 20 moves, no waits, no stones,
never within 3 cells of a guard.

Root cause is not level authoring alone. Four engine defects (§3) make four of the eight guard
types and two of the four v2 mechanics mechanically inert, so no amount of level tuning alone fixes it.

---

## 2. Evidence table

`geoLB` = shortest path ignoring guards/doors/one-ways (walls only). `tax` = optimal − guard-free optimal.
`#opt` = number of distinct optimal-length action sequences (forgiveness).

| L | Name | Taught mechanic | BFS opt | par | geoLB | tax | states | #opt | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Garden Path | movement | 16 | 22 | 16 | 0 | 50 | 50 | TRIVIAL (intended) |
| 2 | The Watchtower | static wilting | 16 | 24 | 16 | 0 | 60 | 50 | **BROKEN** |
| 3 | Vegetable Patrol | one-way tiles | 18 | 22 | 16 | 0 | 53 | 75 | TRIVIAL |
| 4 | The Searchlight | suspicion guard | 16 | 20 | 16 | 0 | 314 | 71 | **BROKEN** |
| 5 | Fortress Gate | doors + keys | 30 | 30 | 18 | 0 | 1574 | **1** | GOOD |
| 6 | Flickering Corridor | light decay | 18 | 22 | 18 | 0 | 162 | 458 | **BROKEN** |
| 7 | Underground Passage | mirror + door | 28 | 30 | 20 | 0 | 645 | 16 | OK |
| 8 | The Gauntlet | sniper | 20 | 28 | 20 | 0 | 984 | 53 | **BROKEN** |
| 9 | The Decoy Path | throwable stones | 20 | 28 | 20 | 0 | 215098 | >cap | **BROKEN** |
| 10 | Hall of Mirrors | combo | 22 | 34 | 22 | 0 | 59307 | 94 | **BROKEN** |
| 11 | The Throne Room | chaser + full palette | 20 | 36 | 20 | 0 | 207395 | >cap | **BROKEN** |

`states explored` is **not** a difficulty proxy here — it measures state-space size (guard
permutations), not search depth. L9 explores 215k states yet the answer is the naive L-path;
L5 explores 1574 states and is the only level with a unique solution.

Never-lit-cell census (steady state, after turn 4, `structural-check.mjs` §C/safe-corridor):

| L | open cells | never lit | fully-safe blind path exists? |
|---|---|---|---|
| 1 | 52 | 100 % | yes (16) |
| 2 | 52 | 100 % | yes (16) |
| 3 | 53 | 100 % | yes |
| 4 | 69 | 90 % | yes (16) |
| 5 | 84 | 92 % | no (key/door gate) |
| 6 | 85 | 91 % | yes (18) |
| 7 | 94 | 88 % | no (door gate) |
| 8 | 104 | 84 % | yes (20) |
| 9 | 98 | 74 % | no (transient only) |
| 10 | 124 | 81 % | no (transient only) |
| 11 | 103 | 73 % | no (transient only) |

Steady-state lit density peaks at 11 cells / 103 open on L11 (~11 %). The board is 89 % permanently safe.

---

## 3. Engine defects that neuter the mechanics (fix these first)

**D1 — Warm/decay tiles have no gameplay effect.** Detection is `grid.isLight(...)` only
(`turn-manager.js:31`, `level-solver.js:206`). `grid.isWarm()` (`grid-system.js:190`) is referenced
**only** by `GameBoard.svelte:73/91` for rendering. Proof: removing `decayTiles:"all"` from L6 and
L10 yields byte-identical solver results (18 moves / 162 states; 22 moves / 59307 states).
`docs/game-design.md:87` claims "a warm cell is temporarily dangerous" — it is not.

**D2 — Every mirror in the game is unreachable by any beam.** `RotatingGuard.lightRange = 2`
(`guards.js:79`), but mirrors sit 3–9 cells from their rotator:

| Level | mirror | nearest rotating guard | in-line dist | beam reaches? |
|---|---|---|---|---|
| 7 | (2,7) | (2,2) | 5 | no |
| 7 | (6,7) | (2,2) | 9, not aligned | no |
| 10 | (2,7) | (2,2) | 5 | no |
| 10 | (7,4) | (7,9) | 5 | no |
| 11 | (3,8) | (3,5) | 3 | no — **and (3,8) is a wall** (`levels.js:498`); `castBeam` breaks on the wall before the mirror check (`guards.js:105-112`) |

The mirror guard type has zero effect in every shipped level. L7 and L10 are named after it.

**D3 — Static guards permanently self-destruct in 2–3 turns.** `currentRadius--` each turn, clamped
at −1 (`guards.js:58-62`), never regrows. `initialRadius:2` → harmless from turn 3 onward;
`initialRadius:1` → harmless from turn 2. Any static guard more than ~3 moves from spawn is
decoration. L2's three statics sit at (2,5),(4,3),(6,6) — first reached at turn ≥5. L2's optimal
path is **byte-identical to L1's** (`down down right right right right down down left down down down right right right right`).

**D4 — Suspicion guards have a 9-cell lethal footprint and self-reset.** Tier rises when the player
is within Manhattan `range`, but tier 2 lights only the 3×3 around the guard, then unconditionally
drops back to 0 the next call (`guards.js:589-609`). Net effect: "do not stand orthogonally adjacent
to me on two consecutive turns." The `range` parameter (2–3) never denies territory. The authoring
comment at `levels.js:112` ("must stay ≥4 cells away") describes behaviour that does not exist.

**D5 — Snipers are blocked by confetti walls.** Beam cells beyond self, per facing:
L8 (3,8): 3/2/2/1 · L9 (8,9): 3/1/0/2 · L10 (10,8): **0/0/1/1** · L11 (6,9): 6/1/4/1.
L10's sniper — the level's stated goal-approach threat — covers **at most 1 cell** in any facing.

**D6 — Guards occupy and walk through walls.** `structural-check.mjs` §A:
L8 patrol path node (7,5) is a wall (`levels.js:341` vs `levels.js:353`);
L11 mirror (3,8), patrol node (8,4), and chaser start (6,5) are all walls
(`levels.js:498/501/499` vs `levels.js:510/520/525`). `PatrollingGuard.onTurnChange` never checks `isWall`.

**D7 — The solvability suite has no lower bound.** `levels.solvability.test.js:42-48` asserts only
`solvable === true` and `path.length <= parMoves`. A level whose guards do nothing passes cleanly.
This is why all of the above shipped green with 180 passing tests.

---

## 4. Per-level: degenerate bypasses

Concrete optimal paths from the solver (no waits, no throws anywhere):

| L | Bypass | Why the taught mechanic is skipped |
|---|---|---|
| 2 | `D D R R R R D D L D D D R R R R` (16) — identical to L1 | statics at (2,5)/(4,3)/(6,6) reach radius −1 by turn 3; player arrives turn 5+ (D3) |
| 3 | 18 vs 16 without one-ways | only the `(5,4) dir=right` gate bites, costing +2 detour via (4,3)→(5,3). Both statics are `initialRadius:1` → dead by turn 2 |
| 4 | `D×8 R×8` (16 = geoLB) | col 0 and row 8 are wall-free highways. Rotating (3,3) beam range 2 never reaches col 0; suspicion (4,7) 3×3 footprint is 7+ cells away |
| 6 | `D×9 R×9` (18 = geoLB) | decay is a no-op (D1); both blinkers' litCells sit mid-board; static (5,4) dead by turn 3 |
| 8 | `D×10 R×10` (20 = geoLB) | sniper (3,8) covers ≤3 cells; patrol row 7 cols 4–6 never touches col 0 / row 10 |
| 9 | `D D D R R D D D R D D D D R R R R R R` (20 = geoLB), stones unused | row-5 patrollers light front+right only; the route crosses row 5 at col 3 while A is at col 4–5 facing away. `noStones` solve = 20, identical |
| 10 | `R R R R D D D R D D D D R D D R D D R R R R` (22 = geoLB) | both mirrors inert (D2), sniper covers ≤1 cell (D5), decay no-op (D1), 1 stone unused |
| 11 | `D×10 R×10` (20 = geoLB) | left edge + bottom edge are wall-free; chaser `detectionRadius:2` at (6,5) is ≥5 away the whole route; mirror inert and on a wall; min distance to any guard along the whole path = **3** |

L11 additionally ships with `undo:false, preview:false` — the player is denied information on a
level that requires none.

---

## 5. Levels with a genuine insight

Only two, and only from the door/key system:

- **L5 Fortress Gate** — *the key you need second is behind the door the first key opens, so the
  route is a forced there-and-back-and-there again across the col-5 spine.* Optimal 30 = par 30,
  `#opt = 1` (exactly one optimal action sequence out of 1574 states), and removing doors/keys drops
  the optimum to 18 (+12 forced). This is the only level in the game with a unique solution.
- **L7 Underground Passage** — *the goal is walled off behind door (8,5), and its key sits in the
  far-right pocket, so you must cross the map, double back, then descend.* Optimal 28 vs 21 without
  doors/keys (+7 forced), `#opt = 16`. The mirror half of the level contributes nothing (D2).

L3's one-way is a *weak* insight (+2 forced, `#opt = 75`): entering (5,4) requires moving **right**
from (5,3), so you cannot simply run down col 4 — but no route order is at stake, which is what a
commitment ratchet is supposed to create.

Everything else is walk-and-wait — and there is not even any waiting.

---

## 6. Difficulty curve

Optimal length by level: **16, 16, 18, 16, 30, 18, 28, 20, 20, 22, 20**

- Not monotonic. Peak is **L5** (30). The curve then collapses to 18 at L6 and never returns.
  The finale L11 (20) is easier than L5, L7, and L10.
- Two flat plateaus: L1–L4 are all 16–18 with a 0 guard tax (four consecutive tutorials, three of
  which teach nothing); L8–L11 are all 20–22 and all equal to their geometric lower bound.
- The only *actual* difficulty gradient in the game is maze length, and it tracks grid size, not design.
- Act structure in `levels.js` (10 acts) contradicts `docs/game-design.md:97-104` (6 acts), and the
  doc's per-level spec is wrong for L4, L5, L6, L8, L9, L10 (e.g. doc says L5 introduces patrolling
  and L10 introduces doors+keys — neither is true in `levels.js`).
- **Par is free everywhere but L5.** 3★ is `moves <= parMoves` (`progress.js:73-76`). Slack:
  L1 +6, L2 +8, L3 +4, L4 +4, L5 **0**, L6 +4, L7 +2, L8 +8, L9 +8, L10 +12, L11 +16.
  A player who blunders 8 moves on the climax still gets 3 stars.

---

## 7. Prioritized recommendations (L1–L11 only)

Ordering is by leverage. P0 items are prerequisites — no level tuning will hold without them.

### P0 — CI invariant that makes degeneracy unshippable

**R1. Add a guard-tax lower bound to `levels.solvability.test.js`.** For each L2–L11, solve twice:
once normally, once with `guards: []`. Assert `optimal - guardFreeOptimal >= tax_min(level)`
(suggest 2 for L2–L4, 4 for L5–L8, 6 for L9–L11). Also assert `optimal > wallsOnlyGeoLB` for every
level. Then assert per-mechanic: L3 unsolvable-or-longer without `oneWays`, L5/L7 longer without
doors, L9/L10/L11 **strictly longer** without stones, L6/L10 longer without `decayTiles`.
This is the highest-value change in the report: it converts "the guards do nothing" from an
invisible property into a red test. Ablation harness already proven — the logic is ~40 lines.

**R2. Add an authoring invariant: no guard position, no patrol path node, and no mirror may sit on
a wall cell.** Extends the existing `no wall cell overlaps a guard lit cell` test
(`levels.solvability.test.js:100`). Fixes D6, currently violated 4× across L8 and L11.

### P0 — Engine fixes that restore the four dead mechanics

**R3. Make warm tiles lethal to *enter* (D1).** In `turn-manager.js:31` and the solver's
`simulateTurn`, detect on `isLight(p) || (isWarm(p) && playerMovedIntoItThisTurn)`. Staying put on a
cell that turns warm under you stays safe. Why this raises difficulty fairly: it converts every
sweeping beam into a 2-cell-wide moving hazard, so "follow one step behind the beam" — currently the
free answer — becomes a loss, and the player must be **two** tiles ahead. It is fully legible: warm
cells already render as a distinct orange tile and are already in the preview pipeline. If the owner
prefers not to change detection, the honest alternative is to delete `decayTiles` and re-theme L6 —
but then L6 has no mechanic at all.

**R4. Give static guards a pulse instead of a death (D3).** Cycle `currentRadius` on a period, e.g.
`2 → 1 → 0 → 2 → …` (a 3-turn cycle) rather than clamping at −1. This keeps the state space finite
(3 states per guard, same as today's 4) so BFS cost is unchanged. Why it is fair: the period is
short, visible, and identical everywhere, so the player learns one rule and applies it. It turns the
static guard from a 3-turn timer into the game's cheapest source of **parity** constraints — the
thing the design doc claims L4 teaches (`docs/game-design.md:122`) and no level actually does.

**R5. Make suspicion guards deny territory (D4).** At tier 2, light all cells within Manhattan
`range` (not the 3×3), and decay tier `2 → 1 → 0` over turns instead of snapping to 0. Why fair:
tier 1 already has a visible ring and a dedicated sprite/sound (`SUSPICION_CALM_ART`,
`playSuspicionAlert`), so the player gets a full turn of warning before the zone goes lethal — the
mechanic becomes "back out of the ring within one turn, or commit and be gone before it fires."

**R6. Fix mirror geometry rather than beam range (D2).** Keep `lightRange = 2`; relocate each mirror
to be cardinally in line and within 2 cells of its rotator. Concretely: L7 (2,7)→**(2,4)**;
L7 (6,7)→**(4,4)** (fed by the deflected column); L10 (2,7)→**(2,4)** and (7,4)→**(7,7)**;
L11 (3,8)→**(3,7)** and delete the wall at (3,8). Then verify each reflected beam actually crosses a
choke point. Why fair: reflection is deterministic and shown by the preview overlay.

### P1 — Level surgery (in place, no new levels)

The shared root problem: **walls are scattered single cells, so row 0 / col 0 / last row / last col
are always free highways.** Every P1 item below is the same move — convert confetti walls into
corridors with 2–3 named choke points, then aim a guard at each choke point.

**R7. L11 The Throne Room — full rebuild (worst offender).** Wall the left edge (rows 3–4 col 0 and
rows 7–8 col 0) and the bottom row (row 10 cols 2–3 and 7–8) so the perimeter L-path is impossible.
Force the route through three chokes: a rotating-beam corridor near (3,5), the patrol corridor at
row 8, and a sniper line on col 9. Move the chaser off the wall at (6,5) to (5,5) and raise
`detectionRadius` from 2 to 4 so it actually contests the mid-map choke. Target: optimal ≥ 34, guard
tax ≥ 8, stones strictly required. **Re-enable `preview: true`** — with a real solution the
difficulty comes from planning depth; keeping preview off just hides information the player needs
and converts the level into memorize-by-death.

**R8. L9 The Decoy Path — make stones necessary.** Turn row 5 into a real wall band with one 1-wide
gap at (5,5), and phase the two patrollers so the gap's front+right cone is covered on 5 of every 6
turns — while making the 6th turn unreachable from the approach square. Then a stone throw at (5,4)
(freezing patroller A's facing for one turn) is the only opener. Verify with the R1 ablation:
`noStones` must be unsolvable or ≥ +6 moves. Fair because the throw target is a legal, previewable
action and the patrol cycle is 6 turns and fully visible.

**R9. L4 The Searchlight — wall the highway, then let R5 do the work.** Add walls at (3,0),(4,0) and
(8,2),(8,3) to kill the `D×8 R×8` bypass. With R5 landed, the suspicion guard at (4,7) range 3 denies
a 25-cell diamond, so the right flank becomes a real commit-or-detour decision. Retitle the level's
taught mechanic honestly — `levels.js:109` says suspicion, `docs/game-design.md:119` says blinking.

**R10. L6 Flickering Corridor — build an actual corridor.** With R3 landed, collapse the mid-board
into a 1-wide horizontal corridor at row 5 (walls at row 5 all cols except a 3-cell run), covered by
the two phase-offset blinkers so the safe window is 1 turn wide and the warm afterglow closes the
tile behind. Insight becomes: *the beam's afterglow means the safe window opens one turn later than
it looks.* Target optimal ≥ 24, guard tax ≥ 6.

**R11. L8 The Gauntlet — put the sniper on the route.** Move the sniper from (3,8) to a position
whose four facings each sweep a full corridor (e.g. (5,5) after clearing its lines), and remove the
walls that currently truncate every beam to ≤3 cells. Fix the patrol path node at (7,5) (D6). Wall
the col-0 and row-10 highways. Insight: *the sniper's 2-turn cadence gives a 4-turn cycle; you must
cross its line on the turn it is pointed away and be clear before it comes back.*

**R12. L10 Hall of Mirrors — becomes the real combo level only after R3+R6.** With mirrors live and
warm tiles lethal, aim both reflected beams at the two chokes on the diagonal, and place the single
stone so it is required to cross one of them. Wall the row-0/col-0 approach.

**R13. L2 The Watchtower — teach the mechanic it is named after.** Move the three statics so their
turn-0/turn-1 auras cover the three wall-band gaps at the moment the player can first arrive
(gap-adjacent cells at ~turn 2, 6, 10). With R4's pulse, a static at the band-1 gap makes "wait 2 and
walk through" (18) compete against "detour" (20) — a genuine, one-decision patience-vs-distance
tradeoff, which is exactly the stated lesson (`levels.js:32`).

**R14. L3 Vegetable Patrol — make the one-way a real ratchet.** Today it costs +2 and cannot be
failed. Add a second one-way so that crossing gate A before gate B strands the player in a region
with no exit, forcing route *order* to be planned. Keep undo+preview on so the trap is recoverable
and the lesson lands without punishment. Target: optimal ≥ 24, and unsolvable without `oneWays`
rather than merely shorter.

**R15. L5 Fortress Gate — leave the structure alone; it is the only good level.** Optional polish
only: narrow the door-1 approach to 1 cell wide inside the rotating beam at (2,3) so the rotating
guard finally imposes a turn cost (guard tax currently 0 even here).

### P2 — Scoring and documentation

**R16. Retune every `parMoves` to the post-redesign BFS optimal** so 3★ means "found the optimal
route." Current slack (§6) makes 3★ automatic on 10 of 11 levels. Add a CI assertion
`parMoves === BFS optimal` (or optimal + 1) so par can never drift again.

**R17. Reconcile `docs/game-design.md:106-150` with `levels.js`.** The per-level mechanic spec is
wrong for L4, L5, L6, L8, L9, L10, the act table (6 acts) contradicts the level comments (10 acts),
and `docs/game-design.md:86-89` documents warm-tile danger that the engine does not implement.
Authoring comments inside `levels.js` are also stale — `levels.js:112` and `levels.js:373-375`
describe behaviour the solver disproves.

---

## 8. Level count

Per owner ruling the game stays at exactly 12 levels; no additions considered. All of the
"hard enough to solve" budget therefore has to come from §7. That is achievable: with R3–R6 landed,
the four currently-dead mechanics (decay, mirrors, static pulse, suspicion zones) become available
design material for L2, L4, L6, L7, L8, L10 and L11 — seven levels that currently teach nothing.
L12 remains frozen and unsolvable by design.

---

## 9. Unresolved questions

1. **R3 (warm = lethal) changes the death model.** Is a 2-cell-wide moving hazard acceptable for the
   "all ages" audience in `docs/game-design.md:6`, or should decay stay cosmetic and L6 be re-themed
   around a different mechanic? This choice gates R10 and R12.
2. **R7 recommends re-enabling `preview` on L11.** The current `undo:false, preview:false` gate is
   presented as a difficulty lever (`docs/game-design.md:40-41`). Is hiding information an intended
   part of the endgame identity, or is it a substitute for the puzzle depth that is missing?
3. **What is the intended solve time per level?** Without a target (30 s? 5 min?) I judged difficulty
   by forced-interaction depth, not by human solve time. A target would let R7/R10 pick concrete
   optimal-length goals rather than the placeholder numbers above.
4. **Is the L5-style unique-solution profile (`#opt = 1`) the goal, or too brittle?** It is the only
   level with real bite, but a single optimal sequence in 1574 states is unforgiving. A target band
   (e.g. 5–30 optimal sequences) would make R7–R14 tunable rather than guesswork.
5. **BFS budget.** L9/L11 already explore ~210k states; the CI cap is 2M
   (`levels.solvability.test.js:13`) with a 60 s suite budget (`:136`). The R7/R10 targets
   (optimal 30–34, more live guards) will multiply state counts. Is a longer solvability suite
   acceptable, or should the solver gain A* / dominance pruning first?
6. **`RotatingGuard.lightRange = 2` vs the sniper's unbounded beam** — R6 assumes range 2 is
   intentional. If instead rotating beams should reach across a room, that is a one-line change with
   very different level-design consequences, and R6's mirror relocations would be wrong.
