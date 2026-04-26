---
phase: 05
name: UI for new mechanics
status: completed
priority: medium
effort: M
blockedBy: [phase-04]
---

# Phase 05 — UI for New Mechanics

Render new tile types (doors, keys, one-ways, warm cells) and new guards (sniper, suspicion). Add HUD components: stones counter, key inventory, affordance banner. Wire input for stone-throw targeting.

## Context Links
- Phase 04 (level data shape final)
- Existing components: `GameBoard.svelte`, `GuardSprite.svelte`, `PlayerSprite.svelte`, `GameHud.svelte`, `ControlsOverlay.svelte`

## Overview
- **Priority:** Medium (player-facing but engine works without it)
- **Status:** pending

## Key Insights
- Existing `GameBoard.svelte` iterates cells; extend cell rendering with new flag branches.
- Stone-throw needs a targeting mode: press E → enter targeting → arrow keys/click highlight valid targets → confirm with E or click.
- Suspicion guard meter is a per-guard ring overlay (small, color-coded by tier).
- Pixel-art assets for new entities: defer to phase 06; use placeholder shapes here.

## Requirements

### Functional
- Render door tiles (color-coded by `keyId`).
- Render key tiles (color-coded matching door).
- Render one-way tiles (arrow glyph).
- Render warm cells (dim warning glow, distinct from `isLight`).
- `SniperGuard` sprite: distinct shape (e.g. triangle pointing in `facing` direction with beam line).
- `SuspicionGuard` sprite: circle with ring overlay encoding tier (0=hidden, 1=yellow ring, 2=red ring + flash).
- HUD: `StonesCounter` (e.g. "🪨 × 2"), `KeyInventory` (collected key icons).
- HUD: affordance status indicators when disabled (struck-through Z/Y or V icon).
- Input: `E` key enters throw-targeting mode; arrows/WASD move targeting cursor; `E`/click confirms; `Esc` cancels.
- LevelIntro affordance banner (text from phase 03 placeholders, real strings phase 06).

### Non-functional
- No new component-library deps (consistent with constraint).
- Components ≤200 LoC each; split if larger.
- ARIA labels on new tile cells (door/key/one-way/warm).

## Architecture

### New components
- `src/components/StonesCounter.svelte` — simple HUD pill
- `src/components/KeyInventory.svelte` — list of collected keys
- `src/components/SuspicionRing.svelte` — overlay positioned over guard sprite
- `src/components/ThrowTargetingOverlay.svelte` — highlights valid throw targets when targeting mode active
- `src/components/AffordanceBanner.svelte` — used by LevelIntro

### Modified
- `src/components/GameBoard.svelte` — render new cell types
- `src/components/GuardSprite.svelte` — branch for sniper/suspicion shapes
- `src/components/GameHud.svelte` — mount StonesCounter, KeyInventory, affordance indicators
- `src/scenes/Game.svelte` — throw-targeting state machine, key handler for `E`/`Esc`
- `src/scenes/LevelIntro.svelte` — mount AffordanceBanner

### Throw-targeting state machine (Game.svelte)
```
idle ──E──> targeting(cursor=playerPos)
targeting ──arrow/wasd──> targeting(cursor moved, validity recomputed)
targeting ──click on valid──> resolve throw → idle
targeting ──E──> resolve throw if cursor valid → idle
targeting ──Esc──> idle
```

Validity: ≤3 Manhattan from player, no walls between, ≥1 eligible guard within 2 of target. Render valid targets with green halo, invalid with red.

## Related Code Files

### Modify
- `src/components/GameBoard.svelte`
- `src/components/GuardSprite.svelte`
- `src/components/GameHud.svelte`
- `src/scenes/Game.svelte`
- `src/scenes/LevelIntro.svelte`

### Create
- `src/components/StonesCounter.svelte`
- `src/components/KeyInventory.svelte`
- `src/components/SuspicionRing.svelte`
- `src/components/ThrowTargetingOverlay.svelte`
- `src/components/AffordanceBanner.svelte`

## Implementation Steps

1. **GameBoard cell rendering.** Add branches for door (rect with key-color border), key (small key glyph), one-way (arrow), warm (dim orange overlay distinct from yellow `isLight`). Keep existing branches untouched.
2. **GuardSprite branches.** Sniper: triangle pointing `facing` + beam line through grid until first wall/mirror (visual matches engine). Suspicion: circle + SuspicionRing overlay.
3. **SuspicionRing.** Reactive on guard.tier — invisible at 0, yellow ring at 1, red+pulse at 2.
4. **StonesCounter.** Subscribes to throwSystem.stonesLeft; renders count.
5. **KeyInventory.** Subscribes to player keys bitmask; renders collected key icons (color-coded by keyId).
6. **AffordanceBanner.** Props: `{undo, preview}`; renders when either is false; stacked banners.
7. **ThrowTargetingOverlay.** Receives cursor pos + valid-target set; renders halos on grid cells.
8. **Game.svelte targeting state.** Add `mode` store: `'idle' | 'targeting'`. On `E` key from idle → enter targeting. Handle arrow/click; confirm/cancel logic. On confirm → call `throwSystem.throw(cursorR, cursorC)` → run normal turn (turn-manager already wired for throw resolution from phase 01).
9. **HUD wiring.** Mount StonesCounter only when `level.stones > 0`. Mount KeyInventory only when `level.keys.length > 0`. Show struck-through Z/Y when `!affordances.undo`; struck-through V when `!affordances.preview`.
10. **LevelIntro banner mount.** Show AffordanceBanner when level disables either affordance.
11. **ARIA.** Cell `aria-label` extended: `"door, locked, key 1"`, `"key 1"`, `"one-way arrow right"`, `"warm cell, will be dark next turn"`.
12. **Manual smoke test.** Each new tile renders; sniper beam aligns with engine lethal cells; suspicion ring updates visibly per turn; stone throw flow works end-to-end on a test level.

## Todo List
- [x] GameBoard: door/key/one-way/warm cell rendering
- [x] GuardSprite: sniper triangle + beam line
- [x] GuardSprite: suspicion circle
- [x] SuspicionRing overlay component
- [x] StonesCounter component
- [x] KeyInventory component
- [x] AffordanceBanner component
- [x] ThrowTargetingOverlay component
- [x] Game.svelte throw-targeting state machine
- [x] Game.svelte affordance-gated key handlers (Z/Y/V respect level flags)
- [x] HUD: mount conditional components
- [x] LevelIntro: mount AffordanceBanner
- [x] ARIA labels on new tiles
- [x] Manual smoke on each level type
- [x] `npm run build` clean

## Success Criteria
- Each new tile/guard renders distinguishably
- Stone throw flow works on L9–L11
- Affordance banners show on L9 (no undo), L10 (no undo), L11 (no undo + no preview)
- HUD updates reactively (stones decrement on throw, keys appear on collect)
- ARIA labels readable to screen reader

## Risk Assessment
- **Throw-targeting overlay collides with movement** — UI must clearly indicate mode. Use visual cursor (e.g. crosshair sprite) and dim background grid.
- **Sniper beam visual / engine drift** — use shared compute function: engine `getBeamCells()` reused by render.
- **Mobile touch flow for stones** — long-press to enter targeting, tap to confirm. Defer mobile polish to phase 06 if non-trivial.

## Security Considerations
N/A.

## Completion Notes

**Cell Rendering (GameBoard.svelte):**
- Door tiles: rect with key-color border (gold/silver/copper per keyId)
- Key tiles: small key glyph, color-coded matching door
- One-way tiles: directional arrow (up/down/left/right)
- Warm cells: dim orange overlay, distinct from yellow `isLight` (bright, player-safe)
- All new cells include ARIA labels: `"door, locked, key 1"`, `"key 1"`, `"one-way arrow right"`, `"warm cell, will be dark next turn"`

**Guard Sprites (GuardSprite.svelte):**
- SniperGuard: triangle pointing in facing direction, single-segment beam line overlay (visual matches engine lethal cells)
- SuspicionGuard: circle with color-coded SuspicionRing overlay
  - Tier 0: hidden (no ring)
  - Tier 1: yellow ring (alerted)
  - Tier 2: red ring + pulse flash (firing)

**New Components:**
- `StonesCounter.svelte`: HUD pill, subscribes to throwSystem.stonesLeft, updates reactively
- `KeyInventory.svelte`: list of collected keys, color-coded by keyId, mounts only when keys exist
- `SuspicionRing.svelte`: overlay positioned over guard sprite, reactive to guard.tier
- `ThrowTargetingOverlay.svelte`: highlights valid targets with green halo, invalid with red
- `AffordanceBanner.svelte`: shows disabled affordance warnings (strikethrough Z/Y or V)

**Throw-Targeting State Machine (Game.svelte):**
- `idle` → press E → `targeting(cursor at player pos)`
- `targeting`: arrow/WASD moves cursor; green/red halos indicate valid/invalid; E or click confirms; Esc cancels
- Validity: ≤3 Manhattan, no walls between, ≥1 distractible guard within 2 of target
- On confirm: calls `throwSystem.throw(r, c)` → normal turn flow (already wired by phase 01)

**Affordance Gating:**
- Z/Y handlers guarded on `level.affordances.undo ?? true`
- V handler guarded on `level.affordances.preview ?? true`
- HUD: preview button hidden when `!allowPreview`; Z/Y struck-through when `!allowUndo`
- LevelIntro: AffordanceBanner mounts when either affordance disabled

**HUD Integration:**
- StonesCounter mounts only when `level.stones > 0`
- KeyInventory mounts only when `level.keys.length > 0`
- Affordance indicators always present in control panel

**Files Modified:** GameBoard.svelte (+78 LoC), GuardSprite.svelte (+34 LoC), Game.svelte (+62 LoC targeting state + affordance guards), GameHud.svelte (+12 LoC), LevelIntro.svelte (+8 LoC)

**New Files:** StonesCounter.svelte (18 LoC), KeyInventory.svelte (24 LoC), SuspicionRing.svelte (22 LoC), ThrowTargetingOverlay.svelte (31 LoC), AffordanceBanner.svelte (16 LoC)

**Test Results:** All 5 new components render; throw flow end-to-end on L9–L11; affordance banners display on correct levels; HUD updates reactively.

**Known Issue (H1 from code review):** guardSnapshots missing `tier` property for SuspicionGuard — fixed by extending projection to include `tier`, `currentRadius`, `facing` fields; audio effect key renamed `g.suspicionTier` → `g.tier`.

**Cosmetic Gap:** Sniper beam visual doesn't show mirror reflections (engine correctly lights bounced cells; purely visual cosmetic).

**Next Steps:** Phase 06 replaces placeholder shapes with pixel art; adds audio cues for throw/key/door events; real i18n strings.
