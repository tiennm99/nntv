# Level Redesign & Solvability — Brainstorm Summary

**Date:** 2026-04-21
**Scope:** Redesign all 12 levels of Night Ninja: Twilight Voyage. Fix L2 unsolvability. Expand grid sizes. Add more guards. Preserve L12 as intentionally unsolvable.
**Status:** Design approved — ready for implementation plan.

---

## 1. Problem Statement

- **L2 unsolvable** — BFS from `(0,0)` cannot reach `(5,5)`. Right-side component `{(3,5),(4,4),(4,5),(5,3),(5,4),(5,5)}` is disconnected by permanent light walls from static guards at `(2,4)` and `(4,2)`.
- **No solvability gate** — levels authored manually; no automated proof. Risk of regressions on future edits.
- **Levels feel narrow** — current grids 6x6–9x9 have single corridors; user wants wider, more complex puzzles.
- **Progression imbalanced** — mirror/chaser/patrolling introduced too late (Acts 4–5); early acts feel sparse.

## 2. Hard Rules (invariants)

1. **Exactly 12 levels, 6 acts.** No adds, removes, renumbers.
2. **L12 must remain unsolvable by normal play.** Only console easter-egg win (user teleports player to goal via dev tools). Win condition / congratulations screen still fires when goal reached by any means.
3. **Desktop-first.** No mobile responsive work. Large grids handled via scrollable viewport that follows the player.
4. **Preserve** `id`, `name`, `storyKey`, `isFinalLevel` per level — zero progress-persistence migration.

## 3. Solution — Redesign Philosophy

### 3.1 Progression (rebalanced acts)

| Act | Levels | Grid | Guard types (cumulative) | Guard count |
|-----|--------|------|--------------------------|-------------|
| 1 | 1–2 | 8x8 | static | 0 / 3 |
| 2 | 3–4 | 9x9 | + rotating + **blinking** (promoted from Act 3) | 4 / 5 |
| 3 | 5–6 | 10x10 | + **patrolling** (promoted from Act 4) | 6 / 7 |
| 4 | 7–8 | 11x11 | + **mirror** (promoted from Act 5) | 7 / 8 |
| 5 | 9–10 | 12x12 | + chaser | 8 / 9 |
| 6 | 11 | 12x12 | all types combined | 9 |
| 6 | 12 | 13x13 | all types + expanding-wave mechanic | 10 (unsolvable) |

### 3.2 Design Rules Per Level

- **Connectivity gate:** at least one reachable path from start→goal in solver (except L12).
- **Widen, don't narrow:** add 2–3 alternative routes so guards force *decisions*, not single chokepoints.
- **More guards ≠ more walls.** Keep wall density ~20–25% of grid area; increase guard count per act tier.
- **Par = solver_optimal + 2** (small slack for undo experimentation).
- **No redundant wall-on-light** (L2 had wall `(3,4)` over guard light `(3,4)` — sloppy overlap, remove).
- **Guard beam pruning:** rotating beams stop at walls — use walls strategically to create safe windows.

## 4. Solvability Solver (automated validation)

### 4.1 State & Search

**State key:** `(player_row, player_col, chaser_positions_tuple, turn_mod_cycle)`
- `cycle = LCM(4 [rotating], 2 [blinking], patrol_path_length_i...)`. Typical cycles 4–24.
- **Chaser** is stateful — include each chaser's position in state key. State space stays tractable (<10M for 12x12 + 2 chasers + cycle 24).
- **Mirror beams** are pure function of rotating-guard directions + mirror positions each turn — not part of state.

**Transitions:** 5 actions per turn — `up / down / left / right / wait`.
**Pruning:** after applying action + running guard update for next turn, if player cell `isLight` → dead branch.
**Algorithm:** BFS (guarantees shortest). Bail out at state-count cap (~10M) with "unsolvable within budget" → manual check.

### 4.2 Location & Modules

- `src/lib/game/level-solver.js` — pure BFS solver, reuses existing `grid-system.js`, `guards.js`, `turn-manager.js`.
- `src/lib/levels/levels.solvability.test.js` — Vitest suite asserting:
  - For L1–L11: solver returns a valid path.
  - For L12: solver returns no path within budget (unsolvable invariant).
  - Par values match `solver_optimal + 2`.
- CI hook: run solvability suite on every PR that touches `levels.js`.

### 4.3 Known Limitations

- Chaser path depends on guard AI implementation — solver must use *identical* chaser logic as runtime (import from `guards.js`, don't reimplement).
- Cycle computation must account for patrol path length (may be odd / prime).
- L12's expanding-wave mechanic needs the solver to model princess-mechanic.js state — include `waveRadius` in state key.

## 5. Scrollable Viewport (prereq for large grids)

- Current rendering assumes full grid fits on screen.
- Need: camera-follow the player so 12x12 / 13x13 grids are playable on 1080p screens.
- Implementation touch points:
  - `src/components/GameBoard.svelte` (or equivalent) — CSS `overflow: auto` + `scroll-behavior: smooth` + programmatic `scrollIntoView` on player position change.
  - Viewport: show ~9x9 cells visible; pan on player move.
- Out-of-scope for this redesign brainstorm but **blocker** for Acts 4–6 playability.

## 6. L12 Easter Egg — Console Win

- Expose a minimal dev hook on `window` (e.g., `window.__nntvDev = { teleportToGoal() { ... } }`) OR rely on existing game-state reactivity so user can directly mutate player position via devtools.
- Reaching goal by any means → normal win flow (congratulations, progress saved).
- Document the easter egg ONLY in code comments, not in-game UI or README.

## 7. Migration & Rollout

- **In-place rewrite** of `src/lib/levels/levels.js`. No new file.
- Preserve each level's `id`, `name`, `storyKey`, `isFinalLevel`, array position. No changes to `src/lib/localization/*` story keys needed.
- Update `parMoves` from solver output for all levels.
- Tests first: land solver + solvability suite **before** level content changes, so each new level design is validated as it's written.

## 8. Evaluated Alternatives

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| Fix L2 only, leave others | Minimal churn | Doesn't address "narrow levels" complaint; no regression protection | **Rejected** |
| Keep grids, add guards only | No viewport work | Crowded; still narrow corridors; low decision value | **Rejected** |
| Aggressive grid expansion + more guards + solver | Solves all issues; prevents future regressions | Requires viewport work; solver effort | **Chosen** |
| Expand to 15–18 levels | Richer progression | Breaks progress persistence, story keys, count invariant | **Rejected** (violates hard rule) |

## 9. Success Criteria

- [ ] Vitest suite: 11/11 levels solvable, L12 unsolvable. Passes on CI.
- [ ] Every level has ≥2 distinct BFS-discovered paths OR clear single-path justification in code comment.
- [ ] All acts visually wider than before (row/col counts match Section 3.1).
- [ ] Scrollable viewport works on 1080p / 1440p screens for 12x12 grids.
- [ ] Win condition fires when L12 goal is reached via console manipulation.
- [ ] No changes to story keys, level IDs, or progress-persistence schema.

## 10. Next Steps (Implementation Plan Phases)

1. **Phase 1:** Implement scrollable viewport (prereq for >9x9 grids).
2. **Phase 2:** Build `level-solver.js` + unit tests on current L1, L3–L11 (should solve) and L12 (should fail). Accept that L2 will fail — that's the baseline bug.
3. **Phase 3:** Solvability test suite — wire into CI.
4. **Phase 4:** Redesign L1–L2 (Act 1, 8x8). Run solver, lock par values.
5. **Phase 5:** Redesign L3–L4 (Act 2, 9x9, introduce blinking earlier).
6. **Phase 6:** Redesign L5–L6 (Act 3, 10x10, introduce patrolling).
7. **Phase 7:** Redesign L7–L8 (Act 4, 11x11, introduce mirror).
8. **Phase 8:** Redesign L9–L10 (Act 5, 12x12, introduce chaser).
9. **Phase 9:** Redesign L11 (Act 6, 12x12, all guards combined).
10. **Phase 10:** Redesign L12 (Act 6, 13x13, preserve unsolvable invariant; expose console win hook).
11. **Phase 11:** Update `docs/` (code-standards, system-architecture) with solver + easter-egg notes. Smoke-test full playthrough.

## 11. Risks

| Risk | Mitigation |
|------|------------|
| Solver too slow on chaser+long-cycle levels | State cap 10M; if exceeded, reduce cycle via shorter patrol paths |
| Viewport work reveals rendering bugs | Isolate in Phase 1; land before level changes |
| Solver disagrees with runtime (chaser logic) | Import guard logic from `guards.js` — single source of truth |
| L12 accidentally solvable after redesign | Solver test asserts unsolvability; fails CI |
| Parsing console easter egg as "cheating" concern | Document in code comments only; feature is intentional |

---

## Unresolved Questions

1. **Console easter-egg API shape** — expose `window.__nntvDev.teleport()` explicitly, or rely on Svelte 5 reactive store mutation? Simplest path TBD in Phase 10.
2. **Viewport implementation owner** — is scrollable viewport a separate brainstorm/plan, or bundled into this redesign's Phase 1?
3. **Story text updates** — do any `storyKey` copy lines need rewriting to match new grid sizes/themes (e.g., "narrow corridor" lines on now-wider levels)? Decision deferred to QA after redesigns land.
4. **Chaser count in Act 5+** — cap at 1 per level, or allow 2 in L10/L11? Affects solver state-space budget.
