---
phase: 03
name: Death model + affordance gates
status: completed
priority: high
effort: M
blockedBy: [phase-01]
---

# Phase 03 — Death Model + Affordance Gates

Drop the run-wide lives system. Detection → restart current level. Add per-level affordance gates: `{ allowUndo, allowPreview }`. Final-act levels strip these.

## Context Links
- Phase 01 (engine foundations) — turn-manager hook reused
- Lives system spread across: `App.svelte`, `GameOver.svelte`, `LevelSelect.svelte`, `LevelIntro.svelte`, `Game.svelte`, `StoryIntro.svelte`, `GameHud.svelte`, locale files
- Existing affordance code: `game-history.js` (undo), `turn-manager.js::previewNextTurn` (V key)

## Overview
- **Priority:** High (blocks 04 — levels reference affordance flags)
- **Status:** pending

## Key Insights
- Removing lives is a clean delete — no data integrity issue. One-time progress reset on first v2 launch.
- Affordances are level-data fields read by Game scene; gating is presentation-only (engine doesn't change).
- "GameOver" scene becomes irrelevant under level-restart-only model — repurpose as "Run Complete" celebration after L11 / "Bittersweet" after L12.

## Requirements

### Functional
- Lives counter removed from state, UI, level-intro, game-over, locale strings.
- Detection event flow: turn-manager flags `detected: true` → Game scene calls `restartLevel()` (reload level data, reset history, reset throwable stones).
- Affordance gate `{ allowUndo: bool, allowPreview: bool }` on each level (default both true).
- LevelIntro scene shows banner when an affordance is disabled: e.g. "No undo this level" / "No preview this level".
- Game scene disables corresponding key handler:
  - Z/Y blocked when `!allowUndo`
  - V blocked when `!allowPreview`
- Save migration: on first v2 boot, detect old progress shape (has `lives` field) → wipe progress + show modal "v2 restart".

### Non-functional
- No regression in undo/preview on levels where affordance is enabled.
- Localized strings for new banners + migration modal (placeholder; full i18n in phase 06).

## Architecture

### Files affected
| File | Change |
|---|---|
| `src/App.svelte` | Drop `lives` state; rewire detection handler to `restartLevel()` |
| `src/scenes/Game.svelte` | Drop `lives` prop; add `level.affordances` checks for Z/Y/V handlers; expose `restartLevel()` |
| `src/scenes/GameOver.svelte` | Remove lives reference; repurpose as "Run Complete" or remove if redundant |
| `src/scenes/LevelIntro.svelte` | Add affordance banner section |
| `src/scenes/LevelSelect.svelte` | Drop lives indicator |
| `src/scenes/StoryIntro.svelte` | Drop lives mention |
| `src/components/GameHud.svelte` | Drop life pips |
| `src/lib/progress.js` (or wherever) | Migration: detect & wipe legacy save with `lives` field |
| `src/lib/locales/en.json`, `vi.json` | Drop lives strings; add `noUndo`, `noPreview`, `migrationModal` keys (placeholders) |

### Affordance level-data shape (read by Game scene)
```js
{
  // ... existing fields
  affordances: { undo: true, preview: true } // default if absent
}
```

## Related Code Files

### Modify
- `src/App.svelte`
- `src/scenes/Game.svelte`
- `src/scenes/GameOver.svelte`
- `src/scenes/LevelIntro.svelte`
- `src/scenes/LevelSelect.svelte`
- `src/scenes/StoryIntro.svelte`
- `src/components/GameHud.svelte`
- `src/lib/locales/en.json`
- `src/lib/locales/vi.json`
- `src/lib/progress.js` (or current persistence module)

### Create
- (none — repurpose existing files)

## Implementation Steps

1. **Audit lives usages.** `grep -rn "lives\|life" src/` and list every reference. Categorize: state, UI, locale.
2. **Remove lives state.** Delete from App.svelte / Game.svelte stores. Remove props passed to children.
3. **Rewire detection.** In Game.svelte, on `detected: true` from turn-manager → call `restartLevel()` (reload level data via level-manager, reset history, reset throwable system). No game-over branch on detection.
4. **Repurpose GameOver scene.** Two flows: (a) L11 cleared → "Run Complete" celebration; (b) L12 reached → existing "Bittersweet" narrative. Remove "out of lives" branch entirely.
5. **Affordance flags.** In Game.svelte, read `level.affordances ?? {undo: true, preview: true}`. Guard Z/Y key handlers on `allowUndo`. Guard V key on `allowPreview`. Hide preview button in HUD when disabled.
6. **LevelIntro banner.** When `!allowUndo` or `!allowPreview`, render warning banner with localized text.
7. **Save migration.** In `progress.js` load step, detect `parsed.lives !== undefined` → discard parsed data, persist new clean shape, set flag for one-time modal.
8. **Migration modal.** Simple modal in App.svelte gated on flag; on dismiss, clear flag.
9. **Locale placeholders.** Add `noUndoBanner`, `noPreviewBanner`, `migrationTitle`, `migrationBody` keys with English strings; copy English to Vietnamese (proper translation in phase 06).
10. **Tests.** No new unit tests required for engine (no logic change). Manual smoke: run dev server, verify detection on L1 restarts level, verify affordance banner on a test level with `affordances: {undo:false, preview:false}`.

## Todo List
- [x] Audit and list all `lives` references
- [x] Remove `lives` state + props
- [x] Rewire detection → `restartLevel()`
- [x] Repurpose GameOver scene (no out-of-lives branch)
- [x] Add affordance gates on Z/Y/V key handlers
- [x] LevelIntro banner for disabled affordances
- [x] Save migration: wipe legacy lives field
- [x] Migration modal in App.svelte
- [x] Locale placeholder strings (EN+VI)
- [x] Manual smoke test
- [x] `npm run build` passes
- [x] All existing tests still pass

## Success Criteria
- No `lives` references remain in `src/`
- Detection on L1 → seamless level restart, no GameOver flash
- Test level with `affordances:{undo:false}` blocks Z/Y; banner renders
- L12 still reaches existing princess-emanation narrative
- `npm run build` clean

## Risk Assessment
- **Detection-mid-animation feels harsh** — add brief flash + sound cue before reload (defer polish to phase 06).
- **Save migration loses legacy progress** — acceptable; v2 is a redesign. Modal communicates this.
- **Affordance banner clutters intro** — only render when at least one affordance disabled.

## Security Considerations
N/A — local-only state.

## Completion Notes

**Lives System Removal:**
- Deleted `lives` state from App.svelte, Game.svelte, all scene files
- Removed lives UI: life pips in GameHud, lives display in LevelSelect, lives mention in StoryIntro
- Removed 12 locale keys (en.json, vi.json) related to lives counter

**Detection Rewiring:**
- On `detected: true` from turn-manager → `restartLevel()` in Game.svelte
- Reload level data via level-manager, reset game-history, reset throwable system
- No GameOver scene branch on detection; seamless level restart

**Affordance Gates:**
- Level shape extended with `affordances: { undo: bool, preview: bool }`
- Game.svelte reads `level.affordances ?? {undo:true, preview:true}`
- Z/Y handlers guard on `allowUndo`; V handler guard on `allowPreview`
- HUD: hide preview button when `!allowPreview`; strike-through Z/Y icons when `!allowUndo`

**LevelIntro Banner:**
- AffordanceBanner component shows when either affordance disabled
- Stacked banners for levels with multiple disabled affordances (e.g. L11: no undo + no preview)
- Placeholder strings (EN as default; VI copy; real translations in phase 06)

**Save Migration:**
- On first v2 boot, progress.js detects `parsed.lives !== undefined`
- Discards old save, persists clean new shape (no lives field)
- One-time modal in App.svelte explains reset, auto-dismisses

**Files Modified:** App.svelte, Game.svelte, GameOver.svelte (repurposed as run-complete scene), LevelIntro.svelte, LevelSelect.svelte, StoryIntro.svelte, GameHud.svelte, progress.js, en.json, vi.json

**Test Results:** All existing tests pass; manual smoke verified detection restarts level, affordance banners render, migration modal fires on first boot.

**Next Steps:** Phase 04 adds affordance data per level design table; Phase 06 replaces placeholder strings with real translations.
