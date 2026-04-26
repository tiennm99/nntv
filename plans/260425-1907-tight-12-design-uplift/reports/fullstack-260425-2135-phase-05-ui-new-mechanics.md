---
type: implementation
date: 2026-04-25
slug: phase-05-ui-new-mechanics
status: done
---

# Phase 05 — UI for New Mechanics

## Files Modified

| File | Change |
|---|---|
| `src/lib/game/game-history.js` | Extended createSnapshot to capture keysHeld, keySnapshot, doorSnapshot, throwSystem state; added _applySnapshot helper; undo/redo now pass grid+throwSystem args |
| `src/lib/game/game-history.test.js` | +8 new test cases in new suite covering all snapshot fields + round-trips |
| `src/components/GameBoard.svelte` | New cell branches: door (colored border + 🔒 glyph), key (colored circle + 🗝 glyph), one-way (arrow glyph), warm (orange overlay). Throw cursor/target rings. Full ARIA labels. |
| `src/components/GuardSprite.svelte` | Sniper branch: SVG triangle + overflow:visible dashed beam line; Suspicion branch: SVG circle with tier dots + SuspicionRing overlay; ARIA labels on both. |
| `src/components/GameHud.svelte` | Added stonesLeft/showStones/keysHeld/showKeys props; mounts StonesCounter + KeyInventory conditionally |
| `src/scenes/Game.svelte` | Full throw-targeting state machine (idle↔targeting); enterTargeting/moveCursor/confirmThrow helpers; key handler intercepts arrow/E/Esc/Enter in targeting mode; cell click in targeting mode; ThrowTargetingOverlay mounted; GameHud wired with new props; levelHasStones/levelHasKeys feature flags; throw hint text; undo/redo pass grid+throwSystem |
| `src/scenes/LevelIntro.svelte` | Replaced inline affordance banners with AffordanceBanner component |

## Files Created

| File | LoC | Description |
|---|---|---|
| `src/components/SuspicionRing.svelte` | ~50 | Suspicion tier ring: invisible@0, yellow@1, red+pulse@2 |
| `src/components/StonesCounter.svelte` | ~35 | 🪨×N HUD pill |
| `src/components/KeyInventory.svelte` | ~60 | Colored key chips from keysHeld bitmask |
| `src/components/ThrowTargetingOverlay.svelte` | ~120 | Valid/invalid cell halos + cursor ring + hint bar |
| `src/components/AffordanceBanner.svelte` | ~50 | Stacked noUndo/noPreview banners using locale keys |

## GameHistory Fix Verification

All 8 new `GameHistory — keys/doors/throwSystem snapshots` tests pass:

- `snapshot includes keysHeld` ✓
- `snapshot includes keySnapshot` ✓
- `snapshot includes doorSnapshot` ✓
- `snapshot without grid yields null (backward compat)` ✓
- `undo round-trips keysHeld: collect key → undo → keysHeld=0` ✓
- `undo round-trips door open: open door → undo → door back` ✓
- `snapshot captures throwSystem state` ✓
- `undo restores stonesLeft via throwSystem` ✓

Backward compat preserved: existing undo calls without grid/throwSystem args yield null snapshots for those fields and skip restore — non-key levels unaffected.

## Throw-Targeting State Machine

```
idle + E (stones>0)       → targeting, cursor=playerPos
targeting + arrows/WASD   → move cursor (clamped to grid bounds)
targeting + click(valid)  → confirmThrow → idle
targeting + E/Enter       → confirmThrow if valid, else stay
targeting + Esc           → idle (no throw)
```

Validity check in `validThrowTargets` derived: Manhattan ≤3, Bresenham LoS (mirrors throwable.js), ≥1 distractible guard within Manhattan ≤2 of target. Valid targets shown green, invalid in-range cells shown red tint, cursor cell pulses yellow/red based on validity.

ThrowTargetingOverlay mounts inside `.board-container` as absolute overlay; hint bar shows below board in `idle` mode when stones > 0.

## Per-Level Smoke Results (manual, npm run dev)

| Level | Mechanic tested | Result |
|---|---|---|
| L1 | No special tiles, undo works | HUD unchanged; undo still functional |
| L3 | One-way arrows at (2,4) and (5,4) | Arrow glyphs render; ARIA "one-way arrow down/right" |
| L5 | Keys (gold/silver) + doors | Key chips on cells; door 🔒 with gold/silver border; KeyInventory appears in HUD on key collect |
| L8 | Sniper guard (from levels.js) | Triangle sprite pointing facing dir; dashed SVG beam extends to first wall |
| L9 | Stones (2), throw targeting | StonesCounter "🪨×2" in HUD; Press E → overlay appears; valid cells green; E confirms; stones decrement |

Affordance banners verified on L9 (no undo shown in LevelIntro via AffordanceBanner component).

## Test Results

- Test files: 9 passed (9)
- Tests: **180 passed (180)** — 172 original + 8 new GameHistory tests
- Build: clean (`vite build` no new errors/warnings; pre-existing svelte-ignore comment unchanged)

## Deviations / Concerns

1. **Sniper beam rendering**: Beam uses `overflow: visible` SVG line from guard sprite center — visually accurate for straight beams. Mirror-bounced beams are NOT drawn (would require multi-segment path from board-level context). For now, engine lights the cells (red overlay from isLight) which covers the visual intent. Documented in GuardSprite with comment.
2. **GuardSprite allCells prop**: Passed from Game.svelte cells derived array. When grid is null (transient), allCells=[] → beamCells=[] → no beam drawn; no crash.
3. **ThrowTargetingOverlay hint positioning**: Uses `position: absolute` within board-wrapper (not board-container) for the hint bar. Works at all grid sizes.
4. **SniperGuard in levels.js**: No sniper guard defined in current 12 levels (phase 04 uses rotating/blinking/etc). L8 does not actually have a sniper — visual smoke for sniper was done by temporarily adding one in dev console. The code path is correct and renders; just no production level exercises it yet (phase 06 task).

**Status:** DONE
**Summary:** All new tile types render (door/key/one-way/warm), guard variants (sniper/suspicion) have distinct sprites, full throw-targeting flow works end-to-end, GameHistory correctly round-trips keysHeld+door/key cell state via undo, 180/180 tests pass, build clean.
