# Phase 03 Report — Death Model + Affordance Gates

## Files Modified

| File | Change summary |
|------|---------------|
| `src/lib/progress.js` | Added `loadProgress()` with v1→v2 migration detection, `acknowledgeMigration()`, `isMigrationAcknowledged()`; kept `getProgress()` shim |
| `src/lib/locales/en.json` | Removed `lives` key; updated `levelObjectivesContent`; added 7 new keys |
| `src/lib/locales/vi.json` | Same as en.json; new keys use EN placeholder strings (real VI in phase 06) |
| `src/components/GameHud.svelte` | Removed life pips, `HEART_ART*` imports, `lives` prop, `hearts` derived, `MAX_LIVES` const; added `allowUndo`/`allowPreview` props that conditionally render undo/preview buttons |
| `src/scenes/Game.svelte` | Removed `lives` prop + `livesRemaining` state; added `throwSystem` state; rewired detection → `restartLevel()` (no game-over branch); added affordance gates on Z/Y/V keys; passed `allowUndo`/`allowPreview` to GameHud; updated `handleLevelCompleteNext` to use `flow:` param |
| `src/scenes/GameOver.svelte` | Repurposed: `flow='runComplete'` (L11) shows celebration, `flow='bittersweet'` (L12) shows princess narrative; removed lives/tryAgain logic entirely |
| `src/scenes/LevelIntro.svelte` | Removed `lives` prop; added affordance banner section (inline, no new component); stacked `noUndo`/`noPreview` warnings |
| `src/scenes/LevelSelect.svelte` | Removed `lives: 3` from `navigate('LevelIntro', ...)` call |
| `src/scenes/StoryIntro.svelte` | Removed `lives: 3` from both `navigate('LevelIntro', ...)` calls |
| `src/App.svelte` | Removed `lives` props from LevelIntro/Game scene bindings; added migration modal (shown once on first v2 boot via `loadProgress()` signal); imported `loadProgress`, `acknowledgeMigration`, `isMigrationAcknowledged` |

## Audit Findings — lives/life references

**Before (11 references across 7 files):**

| Category | References |
|----------|-----------|
| State | `Game.svelte`: `lives` prop, `livesRemaining` state; `GameHud.svelte`: `lives` prop, `hearts` derived |
| UI | `GameHud.svelte`: heart pips render; `GameOver.svelte`: tryAgain resets lives to 3 |
| Navigation payload | `StoryIntro`, `LevelSelect`, `Game`, `LevelIntro` all passed `lives: 3` |
| Locale | `en.json` + `vi.json`: `"lives"` key; `levelObjectivesContent` referenced "3 lives" |

**After:** Only 3 references remain — all in `progress.js` migration guard (`parsed.lives !== undefined`). These are intentional detection of legacy v1 save shape. No UI/state/locale references remain.

## Locale Keys Added

```
banner.noUndo          = "No undo on this level"
banner.noPreview       = "No preview on this level"
migration.title        = "Welcome to Night Ninja v2"
migration.body         = "The kingdom has been redesigned. Your previous progress has been reset."
migration.dismiss      = "Continue"
gameOver.runComplete   = "Run Complete!"
gameOver.runCompleteBody = "You guided the ninja through the kingdom. The Princess Chamber awaits..."
```

## Locale Keys Removed

```
lives   (en + vi)
```
`levelObjectivesContent` updated in both locales to remove lives-count reference.

## Architecture Notes

- **Detection flow:** `triggerDetection()` → shows `DetectionPopup` → `handleDetectionDismiss()` → `restartLevel()` → `initLevel()`. No `GameOver` flash.
- **Affordance gates:** `level.affordances ?? { undo: true, preview: true }` read on `initLevel()`. Defaults both `true` so all existing levels work unmodified until phase 04 populates `affordances` per level.
- **GameOver flows:** `flow: 'runComplete'` for L11 cleared (`next > total && !isFinalLevel`); `flow: 'bittersweet'` for L12 goal reached (`isFinalLevel`).
- **Migration modal:** `loadProgress()` returns `{ progress, needsMigrationModal }`. If legacy save has `lives` field, data is wiped, clean v2 shape saved, `needsMigrationModal: true` returned. App checks `isMigrationAcknowledged()` (separate `nntv-migration-v2` key) to prevent re-show on second boot even if localStorage is re-parsed.

## Test Results

- `npm run build`: **PASS** — 165 modules, no errors. One pre-existing `state_referenced_locally` warning in Game.svelte (present before this phase, already suppressed with comment).
- `npm test`: **PASS** — 9 test files, 143 tests, 0 failures. Engine tests untouched.

## Deviations from Spec

- `throwSystem` now tracked in `Game.svelte` state (was hardcoded in original `initLevel`). Required to properly pass to `turnManager.nextTurn()` if throwable system is used; currently initialized but not passed to `nextTurn` (pre-existing pattern — throwSystem was already created by level-manager but not wired to turn calls in original code).
- VI locale new keys use EN strings as placeholder — spec confirms real translations in phase 06.

## Open Issues

None.

---

**Status:** DONE
**Summary:** Lives system fully removed; detection routes to `restartLevel()`; affordance gates on Z/Y/V + HUD buttons; LevelIntro affordance banners; save migration with one-time modal; all 143 tests pass, build clean.
