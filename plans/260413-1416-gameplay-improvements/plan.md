---
title: "Gameplay Improvements: Wait Action, Star Rating, Level Redesign"
description: "Add wait mechanic, star/par rating system, and redesign levels for challenge"
status: done
priority: P1
effort: 6h
branch: main
tags: [gameplay, levels, ux]
created: 2026-04-13
---

# Gameplay Improvements Plan

## Phases

| # | Phase | Effort | Status | Files Modified |
|---|-------|--------|--------|----------------|
| 1 | [Wait Action](phase-01-wait-action.md) | 15min | Done | Game.svelte |
| 2 | [Star Rating + Par Moves](phase-02-star-rating.md) | 2h | Done | levels.js, progress.js, Game.svelte, LevelSelect.svelte, LevelCompletePopup.svelte |
| 3 | [Level Redesign + Chaser Guard](phase-03-level-redesign.md) | 3h | Done | levels.js, guards.js, level-manager.js, GuardSprite.svelte, theme.css |
| 4 | [Guard Vision Preview](phase-04-vision-preview.md) | 45min | Done | GameBoard.svelte, Game.svelte, turn-manager.js, GameHud.svelte |

## Dependency Graph

```
Phase 1 (Wait) ── no deps, standalone
Phase 2 (Stars) ── no deps, standalone
Phase 3 (Levels) ── after Phase 1 + 2 (par values depend on wait mechanic existing)
Phase 4 (Preview) ── after Phase 3 (needs final guard configs)
```

## File Ownership (no parallel conflicts)

- Phase 1: Game.svelte only (input handler)
- Phase 2: progress.js, LevelSelect.svelte, GameHud.svelte, + level complete flow in Game.svelte
- Phase 3: levels.js, guards.js, level-manager.js, GuardSprite.svelte
- Phase 4: GameBoard.svelte (new overlay layer)

## Key Constraints

- Level 12 MUST remain unbeatable (expanding light wave from goal covers all paths)
- No new npm dependencies
- All state stays in pure JS classes; Svelte 5 reactivity via renderVersion bump pattern
- localStorage schema must be backwards-compatible (existing `nntv-progress` key)

## Rollback

Each phase is a single commit. Revert commit to rollback. No data migrations needed
(localStorage schema only adds optional fields, old data still works).

## Success Criteria

1. Spacebar wait works, guards advance, player stays
2. Stars show on level complete + level select; persist across sessions
3. Levels require more thought; at least 3 levels need wait action to solve optimally
4. Level 12 still unbeatable (manual verification)
5. (Optional) Ghost overlay shows next-turn danger zones
