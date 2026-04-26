---
name: NNTV v2 — Tight 12 Design Uplift
status: completed
created: 2026-04-25
slug: tight-12-design-uplift
brainstorm: ../reports/brainstormer-260425-1907-tight-12-design-uplift.md
blockedBy: []
blocks: []
---

# NNTV v2 — Tight 12 Design Uplift

Implement the brainstorm-approved Approach A: 6 new mechanics, full L1–L11 overhaul, level-restart death model, per-level affordance gates, BFS solver extended with per-level node cap. L12 unsolvable preserved. No new dependencies.

## Context Links
- Brainstorm: [`../reports/brainstormer-260425-1907-tight-12-design-uplift.md`](../reports/brainstormer-260425-1907-tight-12-design-uplift.md)
- Game design doc: `docs/game-design.md`
- System architecture: `docs/system-architecture.md`

## Phases

| # | Name | Status | File |
|---|---|---|---|
| 01 | Engine foundations — cell types, new guards, throwable | completed | [phase-01-engine-foundations.md](phase-01-engine-foundations.md) |
| 02 | Solver extension — state, canonicalization, node cap | completed | [phase-02-solver-extension.md](phase-02-solver-extension.md) |
| 03 | Death model + affordance gates | completed | [phase-03-death-and-affordances.md](phase-03-death-and-affordances.md) |
| 04 | Level redesign — 11 new level definitions | completed | [phase-04-level-redesign.md](phase-04-level-redesign.md) |
| 05 | UI for new mechanics + new tile sprites | completed | [phase-05-ui-new-mechanics.md](phase-05-ui-new-mechanics.md) |
| 06 | i18n + polish (EN/VI, pixel art, audio, intro text) | completed | [phase-06-i18n-polish.md](phase-06-i18n-polish.md) |

## Dependencies

```
01 ─→ 02 ─→ 04 ─→ 05 ─→ 06
   ╲           ╱
    └→ 03 ───┘
```

- **01** unblocks **02** (solver needs new mechanics) and **03** (death model independent)
- **02** + **03** unblock **04** (levels need solver-verified + affordance system)
- **04** unblocks **05** (UI needs final level shape) and feeds **06**

## Key Constraints (Sacred)

- L12 unsolvable narrative preserved
- BFS solver verifies all 11 solvable levels in CI under `MAX_BFS_NODES = 2_000_000`
- No new npm dependencies
- Exactly 12 levels
- EN/VI bilingual + ARIA labels on all new tiles

## Out of Scope (Explicit Cuts)
Sound guard · dash · freeze-turn · fog-of-war · breakable walls · decoy guards · star scoring · par-move tightening · single-life ironman · A* solver replacement.

## Success Criteria
- All 11 solvable levels BFS-verified in CI under node cap
- Each of 6 new mechanics has dedicated intro level
- L11 attempts on first playthrough: target 5–15
- v2 run completion 30–50% (vs ~70% current)
- Zero new dependencies in `package.json`

## Completion Summary

**Ship Date:** 2026-04-25

**Test Results:**
- 180/180 unit tests pass (all 6 phases + integration)
- Solvability suite: 11/11 solvable verified < 2M nodes per level, L12 unsolvable preserved
- Suite runtime: ~48s total (target was <60s)

**Code Review:**
- Score: 9.0/10
- Critical findings: 0
- High findings: 2 (both fixed inline post-review)
  - H1: `guardSnapshots` missing `tier` property — fixed by extending snapshot projection
  - H2: solver throw-enumeration ordering corrected by hoisting `applyState`

**Bundle & Performance:**
- Build: clean, one pre-annotated Svelte state-locality warning
- Bundle delta: +21% gzip (under +30% cap)
- Per-level perf log committed with solver runtime per level

**Sacred Constraints — All Met:**
- L12 byte-identical (walls, guards, parMoves untouched)
- No new npm dependencies
- Exactly 12 levels
- EN/VI bilingual + ARIA labels on all new mechanics
- All 11 solvable levels under 2M BFS nodes

**Known Polish Gaps (Documented):**
- L9: Stones not strictly required (BFS exploits timing gap in PatrollingGuard model); intentional per design, documented in phase-04 report
- Door-unlock audio deferred: function wired but engine lacks `doorOpened` delta from TurnManager; audio ready for future engine enhancement
- Sniper beam visual mirror reflections not rendered (cosmetic gap; engine correctly lights bounced cells)

**Phase 04.5 Patch:**
- Door/key/one-way enforcement: Player.moveTo enforces wall blocks, key-locked doors, one-way direction validation, key auto-collect
- Solver state hash: includes key bitmask + door/key cell snapshots, verified via unit tests
- GameHistory round-trip: undo restores all state including doors, keys, throwable system
- All 3 features tested with adversarial state scenarios
