---
name: Level Redesign & Solvability
slug: level-redesign-solvability
created: 2026-04-21
status: pending
blockedBy: []
blocks: []
source: plans/reports/brainstorm-260421-2042-level-redesign-solvability.md
---

# Level Redesign & Solvability — Implementation Plan

Redesign all 12 levels of Night Ninja: Twilight Voyage. Fix L2 unsolvability. Widen grids (8x8→13x13). Add more guards per act. Introduce automated BFS solver + CI-enforced solvability tests. Preserve L12 as unsolvable (console easter-egg win only).

## Hard Rules

1. Exactly 12 levels, 6 acts. No adds/removes/renumbers.
2. L12 must remain unsolvable by normal play.
3. Desktop-first. Large grids via scrollable viewport that follows player.
4. Preserve `id`, `name`, `storyKey`, `isFinalLevel` per level (no progress migration).

## Progression Target

| Act | Levels | Grid | Guard types (cumulative) | Guard count |
|-----|--------|------|--------------------------|-------------|
| 1 | 1–2 | 8x8 | static | 0 / 3 |
| 2 | 3–4 | 9x9 | + rotating + blinking | 4 / 5 |
| 3 | 5–6 | 10x10 | + patrolling | 6 / 7 |
| 4 | 7–8 | 11x11 | + mirror | 7 / 8 |
| 5 | 9–10 | 12x12 | + chaser | 8 / 9 |
| 6 | 11 | 12x12 | all | 9 |
| 6 | 12 | 13x13 | all + expanding wave | 10 (unsolvable) |

## Phases

| # | File | Status | Description |
|---|------|--------|-------------|
| 1 | [phase-01-scrollable-viewport.md](phase-01-scrollable-viewport.md) | pending | Camera-follow viewport for grids >9x9 |
| 2 | [phase-02-level-solver.md](phase-02-level-solver.md) | pending | BFS solver in `src/lib/game/level-solver.js` |
| 3 | [phase-03-solvability-tests.md](phase-03-solvability-tests.md) | pending | Vitest suite + CI wiring; assert L2 fails as baseline |
| 4 | [phase-04-redesign-act1-l1-l2.md](phase-04-redesign-act1-l1-l2.md) | pending | Act 1 (L1–L2, 8x8, static) |
| 5 | [phase-05-redesign-act2-l3-l4.md](phase-05-redesign-act2-l3-l4.md) | pending | Act 2 (L3–L4, 9x9, + rotating + blinking) |
| 6 | [phase-06-redesign-act3-l5-l6.md](phase-06-redesign-act3-l5-l6.md) | pending | Act 3 (L5–L6, 10x10, + patrolling) |
| 7 | [phase-07-redesign-act4-l7-l8.md](phase-07-redesign-act4-l7-l8.md) | pending | Act 4 (L7–L8, 11x11, + mirror) |
| 8 | [phase-08-redesign-act5-l9-l10.md](phase-08-redesign-act5-l9-l10.md) | pending | Act 5 (L9–L10, 12x12, + chaser) |
| 9 | [phase-09-redesign-l11.md](phase-09-redesign-l11.md) | pending | L11 Throne Room (12x12, all guards) |
| 10 | [phase-10-redesign-l12-easter-egg.md](phase-10-redesign-l12-easter-egg.md) | pending | L12 Princess Chamber (13x13, unsolvable) + console win hook |
| 11 | [phase-11-docs-and-smoke-test.md](phase-11-docs-and-smoke-test.md) | pending | Update docs/ + manual playthrough QA |

## Dependencies

- Phase 1 (viewport) blocks Phases 6–10 (grids ≥10x10 unplayable without it).
- Phase 2 (solver) blocks Phase 3 (tests need solver).
- Phase 3 (tests) blocks Phases 4–10 (each redesign validated by tests).
- Phases 4–9 independent of each other but best done in order (progression curve).
- Phase 10 depends on Phase 9 (L11 finalized before L12).
- Phase 11 depends on all previous.

## Source

Brainstorm summary: `plans/reports/brainstorm-260421-2042-level-redesign-solvability.md`
