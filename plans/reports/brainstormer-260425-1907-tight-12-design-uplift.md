---
type: brainstorm
date: 2026-04-25
slug: tight-12-design-uplift
status: approved
project: nntv
---

# NNTV v2 — "Tight 12" Design Uplift

Brainstorm summary. Approach **A — Tight 12**: more design density in the same 12-level shape via curated mechanic additions + full overhaul of L1–L11.

## Problem Statement

Current build: 12 levels, 6 guard types, lives system, undo/preview, BFS-verified. User wants harder design without ballooning level count or dependencies.

Brief (resolved):
- Target: all gameplay difficulty (broad) — mechanics + levels + systemic
- Scope: replace + extend
- Constraints: L12 stays unsolvable · BFS solver verifies all solvable · no new deps · ~12 levels exactly

## Resolved Tensions (Brutal-Honesty Pass)

| Original signal | Tension | Resolution |
|---|---|---|
| All 4 depth categories | Buffet → kitchen-sink levels | Cut to 6 mechanics across 4 categories |
| Player abilities (stones/dash/freeze) | BFS state explosion | Stones only; per-level cap on count |
| Rogue-lite single life | 10+ min replays = masocore | Softened to level-restart on detection (genre standard) |
| Full overhaul + many mechanics | Intro-budget exhausted | One mechanic per level intro slot, L10–L11 = pure compounding |
| Drop undo+preview | Removes information needed for harder puzzles | Per-level affordance gates; only L9–L11 strip them |

## Approaches Evaluated

| | Pros | Cons |
|---|---|---|
| **A — Tight 12** ✅ | Tractable, solver-safe, ships ~2-3 wks, design-legible | Drops 60% of buffet picks |
| B — Layered Hard | Lowest frustration risk, escape valve | Dilutes "make it harder" mandate |
| C — Maximalist v2 | Literally maximal ceiling | ~6 wks, kitchen-sink risk, solver-replacement risk, niche audience |

**Chosen: A.** Reasoning: depth density is a curation problem, not addition. C burns weeks on solver engineering invisible to player.

## Final Spec

### Mechanic Palette (6 additions)

| Mechanic | Category | Rule |
|---|---|---|
| Sniper guard | Guard | LoS beam from facing dir; stops at first wall/mirror; lethal. Rotates 90° **every 2 turns** |
| Suspicion guard | Guard | 3-tier meter (idle→alerted→firing). Firing-tier lights surrounding cells 1 turn |
| Throwable stone | Player verb | **Variable per-level count**. Target ≤3 Manhattan. All rotating/patrolling/chaser within 2 of target face it 1 turn |
| Door + Key | Environment | Locked door = wall; key collect → permanent open. Bitmask state |
| One-way tile | Environment | Arrow tile, entered only from designated dir. Zero state |
| Light decay | Environment | Lit cell stays "warm" (visible warning, passable) 1 turn after light leaves |

### Systems Changes
- Lives counter: removed. Detection → restart current level.
- Affordance gates: per-level `{ allowUndo, allowPreview }`. L1–L8 both on, L9–L10 preview-only, L11 both off.
- Stones refresh on level-start (per-level resource).
- Turn order: **stone resolves before guard turn** → guards-react-to-stone → light recalc → detection.

### Level Plan

| L | Name | New mechanic | Reuses | Undo | Preview |
|---|---|---|---|---|---|
| 1 | Garden Path | — | movement | ✓ | ✓ |
| 2 | Watchtower | — | static | ✓ | ✓ |
| 3 | Vegetable Patrol | one-way | static, one-way | ✓ | ✓ |
| 4 | Searchlight | rotating + suspicion | static, rotating | ✓ | ✓ |
| 5 | Fortress Gate | doors + keys | suspicion, rotating | ✓ | ✓ |
| 6 | Flickering Corridor | blinking + decay | blinking, decay | ✓ | ✓ |
| 7 | Underground Passage | mirror | rotating, mirror, doors | ✓ | ✓ |
| 8 | The Gauntlet | patrolling + sniper | static, rotating, mirror | ✓ | ✓ |
| 9 | Decoy Path | throwable stones | patrolling, sniper, suspicion | ✗ | ✓ |
| 10 | Hall of Mirrors | combo | mirror, sniper, decay, stones | ✗ | ✓ |
| 11 | Throne Room | chaser + full palette | all | ✗ | ✗ |
| 12 | Princess Chamber | (unsolvable) | princess emanation | n/a | n/a |

6 mechanic intros across L3–L9. L10–L11 = compounding-only.

### Engine Architecture Deltas

| File | Change |
|---|---|
| `src/lib/game/guards.js` | + `SniperGuard`, `SuspicionGuard` classes |
| `src/lib/game/throwable.js` (new) | Stone throw resolver, distraction queue |
| `src/lib/game/grid-system.js` | + cell types `door`, `key`, `oneWay`, `warm` |
| `src/lib/game/level-manager.js` | Parse `doors[]`, `keys[]`, `oneWays[]`, `stones`, `affordances` |
| `src/lib/game/level-solver.js` | State += `(keys_bitmask, stones_left, suspicion[], warm_timers)`; canonicalize hash; per-level node cap |
| `src/lib/game/turn-manager.js` | Throw action ordering; suspicion meter ticks |
| `src/lib/levels/levels.js` | All 11 solvable levels rewritten |
| `src/components/` | StonesCounter, KeyInventory, SuspicionRing overlay, AffordanceBanner |
| `src/lib/i18n/` (or equiv) | EN/VI strings for new mechanics |

### Data Model Extension

```js
{
  name, width, height, start, goal,
  walls: [...],
  guards: [...],
  doors: [{ pos, keyId }],
  keys: [{ pos, keyId }],
  oneWays: [{ pos, dir }],
  decayTiles: [pos] | "all",
  stones: 0,                    // per-level budget
  affordances: { undo: true, preview: true }
}
```

### Solver Scaling Plan
- State canonicalization with new fields hashed.
- Suspicion 0–2, decay 0–1 → bounded per-cell additive blow-up.
- `MAX_BFS_NODES = 2_000_000` per level. CI fails loud → redesign offending level, never relax cap.
- Stone branching mitigated by ≤3 Manhattan target rule + small per-level count.

### Sacred Constraints (verified honored)
- L12 unsolvable narrative: unchanged.
- BFS CI gate: kept; extended to new state.
- No new deps: pure JS additions only.
- 12 levels exactly.
- EN/VI bilingual + ARIA: preserved on new tiles.

### Risk Register

| Risk | Severity | Mitigation |
|---|---|---|
| BFS state explosion | High | Per-level node cap; redesign-not-relax policy |
| Affordance gates confuse players | Med | Pre-level banner; theming aligned w/ act tone |
| Save data breaks (lives→no-lives, new structures) | Med | One-shot progress reset on v2 launch + migration notice |
| Stones make some puzzles single-trick | Med | Multi-stone levels designed around branching distractions; ≥2 valid stone targets where used |
| Soft-rogue (vs original "single life") underdelivers brief | Low | User downgraded in Q3; documented |
| Sniper-every-2-turns trivializes encounters | Low | Compose with rotating/patrolling for overlapping-window puzzles |

### Out of Scope (Cut)

Sound guard · dash · freeze-turn · fog-of-war · breakable walls · decoy guards · star scoring · par-move · run-life ironman · A* solver replacement.

### Success Criteria
- All 11 solvable levels BFS-verified in CI under node cap.
- Each of 6 new mechanics has a dedicated intro level.
- L11 solve attempts on first playthrough: target 5–15.
- v2 run completion 30–50% (vs ~70% current — target zone for "harder").
- Zero new dependencies in `package.json`.

### Phase Outline (rough)

1. Engine: new guards + throwable + door/key/one-way/decay tiles + unit tests
2. Solver: extended state, canonicalization, per-level cap + tests
3. Level redesign: 11 new level definitions + BFS CI green
4. UI: stones counter, suspicion overlay, key inventory, affordance banner
5. i18n: EN/VI strings for new mechanics
6. Polish: pixel art for new entities, audio cues, intro-text per level

## Unresolved Questions

1. Cosmetic life counter — strip entirely or replace with "attempts-on-this-level" counter? (defaulting: strip; show only level-restart number)
2. Mirror behavior with sniper beam — also reflects 90°? (defaulting: yes, consistency w/ rotating beam)
3. Suspicion meter — does it decay when player breaks LoS, or only after N idle turns? (recommend: decay 1/turn when player out of range)
4. Stone-throw fizzle — what if no eligible guards within 2 of target? (recommend: stone still consumed; player loses one)
5. Save migration UX — silent reset or modal acknowledgment? (recommend: modal once)
6. Audio for new entities — procedural Web Audio (existing pattern) or punt to art-pass phase?

---

**Status:** DONE
**Summary:** Converged on Approach A — Tight 12. Six curated mechanics (sniper, suspicion, stones, doors+keys, one-way, light-decay), full L1–L11 overhaul, level-restart death model, per-level affordance gates, BFS solver extended with per-level node cap. L12 unsolvable preserved. ~2-3 weeks scope.
