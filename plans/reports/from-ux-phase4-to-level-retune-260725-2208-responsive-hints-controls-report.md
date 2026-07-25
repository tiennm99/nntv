# Phase 4 — UX / Playability Implementation Report

Scope: `src/scenes/**`, `src/components/**`, `src/styles/**`, locales, `progress.js`,
`touch-controls.js`, `App.svelte`. Ran in parallel with the engine rewrite
(`src/lib/game/**`) — did not touch those files.

## P0-1 Responsive (360px+, up to 13x13 grid)

- `src/styles/theme.css`: `#app` kept its fixed 1024x768 design box but is now
  `transform: scale(min(1, 100vw/1024, 100vh/768))` centered via
  `transform-origin: center`. Desktops ≥1024x768 render at native 1x (unchanged
  from before); anything smaller scales down uniformly instead of being
  clipped by the old `max-width/max-height: 100vw/100vh`. No per-component
  media queries needed — every child still lays out in the 1024x768 coordinate
  space.
- Why `min(1, vw/1024, vh/768)` and not plain `vw/1024`: caps scale at 1x so
  large monitors don't stretch the game bigger than its designed size —
  matches current desktop behavior exactly, only fixes the "too small" case.
- `src/scenes/Game.svelte` `.board-container`: removed `85vw/85vh` — those
  viewport units would resolve against the *real* (unscaled) window, shrinking
  the board a second time on top of the stage scale. Replaced with fixed
  `720px/620px` caps, correct in the 1024x768 design space the transform scales
  as a whole.
- Added `touch-action: none` on `.board-container` — without it, a touch swipe
  meant as a move gesture can also trigger native browser panning on this
  scrollable element, fighting `touch-controls.js`.
- Added a global `@media (prefers-reduced-motion: reduce)` block in
  `theme.css` (`*,*::before,*::after { animation/transition-duration:
  0.01ms !important; ... }`). `!important` on an inline-styled property beats
  a non-`!important` inline style per cascade rules, so this also neutralizes
  Svelte's `transition:fade` durations — one rule covers `App.svelte`,
  `StoryIntro`, `LevelCompletePopup`, `SuspicionRing`, `ThrowTargetingOverlay`,
  and the level-flash animation without touching each component individually.
  (`GameBoard.svelte`/`GuardSprite.svelte` already had their own local
  reduced-motion blocks — left those in place, harmless overlap.)

## P0-2 Throw control (touch-usable stone throwing)

- `src/components/GameHud.svelte`: `StonesCounter` becomes a real `<button>`
  (`onenterthrow`) when `canThrow` is true (stones left, idle mode) — the only
  on-screen entry point into targeting mode previously (E-key only).
- `src/components/ThrowTargetingOverlay.svelte`: added a pinned Confirm (✓) /
  Cancel (✕) button pair, 44px circular targets, positioned near the bottom of
  the board viewport (stays fixed regardless of board scroll position). Wired
  to `onconfirm`/`oncancel` props from `Game.svelte` (`confirmThrow`, new
  `cancelThrow()`). Tap-to-target on board cells still works (unchanged), but
  the dedicated buttons guarantee a reachable target even when the board
  shrinks below 44px/cell on small screens.
- `src/scenes/Game.svelte`: added `canThrow` derived, `cancelThrow()`, wired
  new props end to end. Escape/E-key targeting controls unchanged.
- `Button.svelte`/`GameHud.svelte` `.icon-btn`: bumped to `min 44x44px`.

## P0-3 Stuck player — hints + mercy unlock

**Attempt tracking** (`src/lib/progress.js`): `attempts: {levelNum: count}` and
`skippedLevels: []` added to the persisted shape (both default + migration
paths). `recordDetection(levelNum)` increments and persists (wrapped in the
existing try/catch — private-mode safe). `completeLevel()` now also clears the
attempt streak and any skip mark for that level (a real clear supersedes both).

**Bug found & fixed while adding this**: the pre-existing "no saved data"
fallback did `{ ...DEFAULT_PROGRESS }` — a shallow spread that shares nested
object/array references (`attempts`, `completedLevels`, etc.) across every
call. Under a failing localStorage (private mode, quota), every "fresh"
progress object was actually the *same* nested `attempts`/`skippedLevels`
object, so state would silently leak across levels and sessions. Replaced with
a `freshProgress()` factory returning new nested objects each call. Caught by
a test (`progress.test.js` — "survives a localStorage that throws"), verified
by making that test fail first, then confirming the fix. This predates my
changes but wasn't exercised by any prior test.

**Thresholds** (my judgement, per the task's "~8" suggestion for mercy):
- Hint tier 1 (nudge) at 3 attempts, tier 2 (mechanic reminder) at 5, tier 3
  (concrete next step) at 7 — evenly spaced escalation ending just before mercy.
- Mercy unlock at 8 attempts (matches audit's suggestion directly).
- `HINT_THRESHOLDS = [3, 5, 7]`, `MERCY_THRESHOLD = 8`, both exported constants
  in `progress.js` for a single source of truth.

**Hints**: `src/lib/level-hints.js` (new) maps level → 3 locale keys
(`hint.level{N}.{1,2,3}`), scoped to L2–L11 (L1 has no guards so detection
never fires; L12 is intentionally unsolvable so hints would be dishonest).
`src/components/HintPanel.svelte` (new, modal) shows unlocked tiers' text and
a generic "keep trying" placeholder for locked ones. `GameHud` shows a `HINT`
button once `hintTiersAvailable > 0`.

**Mercy unlock**: `mercySkipLevel(levelNum, totalLevels)` in `progress.js`
marks the level "skipped" and unlocks `levelNum+1` (capped at `totalLevels`,
no-op if already completed). Surfaced as an explicit, separately-labelled
button in `DetectionPopup` (never auto-triggered — appears alongside "PLAY
AGAIN", not instead of it) once `isMercyEligible()` and the level isn't final.
`LevelSelect.svelte` shows a grey "SKIPPED" badge (not stars) for skipped,
uncompleted levels.

**Tests**: `src/lib/progress.test.js` (new) — 10 cases covering attempt
increment/persistence, hint-tier escalation at exact thresholds, mercy
eligibility boundary, mercy skip unlocking next level and capping at total,
no-op on an already-completed level, attempt/skip reset on a real clear, and
the localStorage-failure guard (which caught the shared-reference bug above).

## P1 items completed

- **`levelComplete` key**: added to both locales. `localization.js` `getText`
  now checks `!== undefined` (not truthiness — an intentionally empty string
  is a valid translation) and, on a total miss, returns a visibly-flagged
  `⚠ missing:{key}` plus a `console.warn`, instead of silently returning the
  raw key (which reads as plausible text and hides the bug).
- **Death→retry keyboard**: `DetectionPopup`'s primary button now
  autofocuses on mount (`Button.svelte` gained an `autofocus` prop) so
  Enter/Space work immediately via native button semantics — no more 5-7 Tabs
  through hidden HUD buttons (one of which used to be MENU, which exits the
  level). Added an `R` shortcut once the popup is actually visible. Same
  autofocus treatment for `PauseMenu` (Resume), `ControlsOverlay` (Back),
  `LevelCompletePopup` (Continue), `HintPanel` (Back).
  **Cost before → after**: 6-7 Tab + Enter (worse: MENU sat in that Tab
  chain and would exit the level) → 1 keypress (Enter/Space/R), or unchanged
  1-click for pointer.
- **Detection overlay timing**: `detected` (freezes input) still fires
  immediately; a new `showDetectionPopup` flag now lags it by 500ms — past the
  400ms cell-flash/shake duration — so the popup's dark overlay no longer
  covers the lit cell that caught the player. `initLevel`/`restartLevel`/
  `onDestroy` all clear the new timeout.
- **Guard onboarding**: `src/lib/level-teaches.js` (new) + a "New this level"
  strip in `LevelIntro.svelte`, independent of `levels.js` (not touched) —
  mirrors the "Mechanic intro" authoring comments already there. `L4`'s
  suspicion guard now also gets an always-visible range boundary (a Manhattan
  diamond, math verified so its edge lands exactly `range` cells out) in
  `SuspicionRing.svelte`, not just the tier≥1 ring — the audit's core
  complaint (F11) was that the only tell appeared *after* the guard had
  already started tracking.
- **Affordance awareness**: `GameHud` now shows a persistent small
  "NO UNDO"/"NO PREVIEW" chip whenever a level disables them, in addition to
  the existing `LevelIntro` banner (which doesn't reappear after a mid-level
  pause-menu restart) — the player has a standing reminder before committing
  to a move, not just a one-time splash.
- **i18n**: `levelComplete`, `turnsLabel` (replaces hardcoded `Turns:`),
  `parLabel`, per-level `level{N}Name` (12 keys — VI-default game had 12
  English-only level names), all board-cell ARIA (`board.*`, 13 keys),
  throw-control strings, hint/mercy/teaches strings — **62 new keys, both
  locales, verified 167/167 parity** (script-checked, see Verification).
  Removed the dead `mechanics.sniper.name`, `mechanics.suspicion.name`,
  `mechanics.suspicion.alerted`, `mechanics.suspicion.firing`,
  `mechanics.oneWay.aria`, `mechanics.warm.aria`, `mechanics.door.locked`,
  `mechanics.door.open` (unused — `GameBoard`/`GuardSprite` built English
  labels inline; explicit task instruction was to remove, not wire up).
  Kept `mechanics.stones.label`/`mechanics.keys.label`/`mechanics.key.aria`
  (actually used by `StonesCounter`/`KeyInventory`).
  Also softened `controlPreview` text to note the preview assumes the player
  waits (interim fix for F09/F10 — the underlying simulate-stationary bug is
  in `turn-manager.js`, which I don't own).
- **A11y**: `role="dialog" aria-modal="true"` + a shared `src/lib/focus-trap.js`
  Svelte action (Tab-cycling) on all four modal overlays + the new
  `HintPanel`. `App.svelte` now focuses the scene wrapper after every
  `navigate()` and announces the scene name via a visually-hidden
  `aria-live="polite"` region (scene transitions previously dropped focus to
  `<body>` silently). `Escape` now opens Pause from idle and closes it from
  paused (previously only worked inside the Controls overlay).
  `GameBoard.svelte` cell/grid ARIA labels are now fully localized
  (`board.*` keys) instead of hardcoded English strings.
- **Dead code removed**: `GameBoard.svelte`'s `throwTargetCells`/`throwCursor`
  props and their rings were never passed from `Game.svelte` (confirmed via
  grep) — deleted along with the now-orphaned CSS; the real throw-targeting
  visuals live in `ThrowTargetingOverlay`, which is what's actually rendered.
- **Warm-tile text alignment (frozen constraint #2)**: while drafting L6
  hint/teaches copy, caught myself echoing the *old* levels.js design comment
  ("decay window = safe sprint"). Since an engine agent is concurrently
  making warm tiles lethal, that copy would teach the opposite of the
  incoming rule. Rewrote `teaches.warm` and `hint.level6.2`/`.3` (both
  locales) to say warm is dangerous and the player should wait for full
  dark, not sprint through the afterglow. Did **not** touch the warm-tile
  *visual* (`GameBoard.svelte`'s orange glow) — the audit's own description
  ("rendered as orange hazard... but actually safe") means the art already
  reads as dangerous; it was the code/logic that lied, and that's the engine
  team's fix landing in parallel. Nothing for me to change there.

## L12 frozen constraint

Added comments at both `checkFinalLevel()` call sites in `Game.svelte`
(`handleMove`, `handleWait`) marking the `isFinalLevel && checkFinalLevel()`-
before-`levelComplete` ordering as intentional, per the task's instruction —
did not change the ordering itself.

## Deliberately not done (scope cuts)

- Bestiary two-tab overlay (F06) — added a `Guide` button to `PauseMenu`
  instead (one line, reuses the existing scene) rather than building a new
  in-game two-tab component.
- Redo HUD button (F28), gated-key denial feedback/sound (F26), colour-blind
  glyphs for valid/invalid/locked (F38), StoryIntro scroll timeout fallback
  (F31), unreachable `gameOver.runComplete` flow (F32) — all P2 in the audit,
  not in the task's explicit P1 list; left as-is.
- Culprit-guard-name in `DetectionPopup` (audit F14 embellishment) — would
  need `turn-manager.js` to return which guard triggered detection; that's
  engine-owned and not currently exposed.
- Preview-per-destination correctness (F10 root cause) — `turn-manager.js`
  simulates the player stationary; fixing the simulation itself is engine
  territory. Only softened the label text as an interim honesty fix.
- Did not touch `LevelIntro` story text (L5-L9 factually wrong per the audit)
  — explicitly scheduled for the level-retune phase, per instructions.

## Verification

- `pnpm test` (`npx vitest run`): 219/220 pass. The one failure
  (`levels.solvability.test.js` — "L2 must be solvable") is in a file/area I
  don't own (`src/lib/levels/**` exercising `src/lib/game/**`); `git status`
  confirms `src/lib/game/*.js` are mid-edit by the concurrent engine phase
  right now. Not caused by, or fixable within, this phase's file ownership.
- `pnpm build` (`npx vite build`): succeeds, 180 modules, dist unchanged in
  shape (only a pre-existing unrelated Svelte compiler warning about
  `currentLevel = $state(level)` capturing only the initial prop value —
  present before my changes, not introduced by them).
- i18n parity: scripted check, `en: 167 vi: 167`, zero en-only/vi-only keys.
- No new runtime dependencies (`package.json` untouched).

## Files touched

New: `src/components/HintPanel.svelte`, `src/lib/focus-trap.js`,
`src/lib/level-hints.js`, `src/lib/level-teaches.js`, `src/lib/progress.test.js`.

Modified: `src/App.svelte`, `src/components/{Button,ControlsOverlay,
DetectionPopup,GameBoard,GameHud,GuardSprite,LevelCompletePopup,PauseMenu,
SuspicionRing,ThrowTargetingOverlay}.svelte`, `src/lib/locales/{en,vi}.json`,
`src/lib/localization.js`, `src/lib/progress.js`, `src/scenes/{Game,
LevelIntro,LevelSelect}.svelte`, `src/styles/theme.css`.

## Unresolved questions

1. Hint tier thresholds (3/5/7/8) are my judgement call per the task's
   instruction to use it — no user confirmation sought given auto-mode.
   Easy to retune later since they're two exported constants.
2. L6's actual difficulty/par once warm tiles go lethal is Phase 3's problem
   (level retune) — my hint text is now directionally correct (warm =
   dangerous) but doesn't assert a specific solved route, since the exact
   safe window shifts once the engine and Phase 3 retune land.
3. Mercy-skip for L12 specifically (audit's "secondary" suggestion — let the
   bittersweet ending play after N failures) was not implemented; L12 is
   excluded from mercy/hints entirely since it's the intentionally-unsolvable
   final level and there's no "next level" to unlock. Flagging in case the
   owner wants that documented escape after all.
