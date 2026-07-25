# Playability & UX Audit — Night Ninja: Twilight Voyage

Date: 2026-07-25 · Scope: read-only static code review · No browser/dev-server used.

## VERDICT

A first-time **desktop, mouse-using** player probably reaches level 5 — but by dying, not by understanding. L1–L3 are legible (empty grid, wilting auras, one-way arrows, and the LevelIntro story text for those three levels matches what is actually in the level). L4 is where comprehension breaks: it introduces the **suspicion guard** (`levels.js:133`) whose only tell is a ring that appears *after* tier ≥ 1 (`SuspicionRing.svelte:7`), whose range-3 danger zone is never drawn, and which the L4 intro text never mentions (`en.json:67` talks only about a rotating searchlight). From L5 onward the intro text is factually wrong about the level contents (L5 promises a blinking guard that isn't there and omits the keys/doors that are; L7 promises a patroller that isn't there; L8 promises "two mirrors, two rotating beams" but ships a sniper + patroller + static; L9 promises a chaser and omits the stones it introduces). The one narrative channel that teaches mechanics is desynced from the levels.

A first-time **touch** player does not reach level 5 at all: there are zero media queries in the codebase, the stage is a hard-coded 1024×768 letterbox (`theme.css:65-73`), and stone-throw mode has no on-screen entry point (`Game.svelte:326` — `E` key only).

Also: the level-complete popup prints the raw i18n key `levelComplete` as its title on every single win (`LevelCompletePopup.svelte:8`), and there is no hint, no skip, and no path forward for a stuck player (`LevelSelect.svelte:12-14`).

Difficulty is currently coming from the UI as much as from the puzzles.

---

## Findings

| id | area | sev | file:line | one-line fix |
|----|------|-----|-----------|--------------|
| F01 | mobile | **P0** | `theme.css:65-73`; no `@media` anywhere in `src/` | Wrap `#app` in a JS/CSS `transform: scale()` fit-to-viewport, or make the stage fluid below 1024px. |
| F02 | mobile | **P0** | `Game.svelte:326,395`; `GameHud.svelte:38-56` | Add a HUD stone button that calls `enterTargeting()`; add on-screen Confirm/Cancel in targeting mode. |
| F03 | progression | **P0** | `LevelSelect.svelte:12-14`; `progress.js:85-88`; no hint code in `src/` | Unlock level N+1 after X failed attempts, and/or add a per-level hint (see stuck-player section). |
| F04 | onboarding | P1 | `en.json:68` vs `levels.js:181-187`; `en.json:70` vs `levels.js:300-307`; `en.json:71` vs `levels.js:345-359`; `en.json:72` vs `levels.js:396-417` | Rewrite `level5/7/8/9Story` to describe the guards/mechanics actually present. |
| F05 | onboarding | P1 | suspicion first at `levels.js:133` (L4), keys/doors at `levels.js:190-197` (L5), warm at `levels.js:253` (L6), sniper at `levels.js:347` (L8), stones at `levels.js:419` (L9) — none named in their intro text | Add a one-line "New this level: …" strip to `LevelIntro.svelte` driven by a `level.teaches[]` field. |
| F06 | onboarding | P1 | `GameHud.svelte:51` → `ControlsOverlay.svelte` (keys only); `Guide.svelte` only reachable from `MainMenu.svelte:41` | Make the in-game `?` a two-tab overlay: Controls + Bestiary, or add a Guide button to `PauseMenu.svelte`. |
| F07 | onboarding | P1 | `en.json:8` `instructions` defined but unused (grep: 0 hits); L1 has no on-screen prompt (`levels.js:9-25`) | Show a dismissible "Arrow keys / WASD / tap a neighbour cell" toast on L1 turn 0. |
| F08 | onboarding | P1 | `ControlsOverlay.svelte:14-34` has no `E`/throw row; `en.json:55` `controlThrow` unused | Add the throw row (E / Enter / Esc) to the controls overlay. |
| F09 | readability | P1 | `GameBoard.svelte:68,84` (`previewCells… && !cell.isLight`) | Also render a "goes dark next turn" marker on currently-lit cells — that is the timing info players need. |
| F10 | readability | P1 | `turn-manager.js:41-50` passes the *current* player position into the simulation | Label the preview "if you wait", or preview per candidate destination; chaser/suspicion previews are wrong for any move. |
| F11 | readability | P1 | `SuspicionRing.svelte:7` (`visible = tier > 0`); range never drawn (`levels.js:133` `range: 3`) | Draw a faint tier-0 range boundary so the player can see the zone before entering it. |
| F12 | readability / colour | P1 | `GameBoard.svelte:5` `KEY_COLORS`; `KeyInventory.svelte:8-12`; `game-design.md:79` "matching is visual" | Stamp the key id (1/2/3) or a distinct glyph on doors + keys + HUD chips. |
| F13 | readability / semantics | P1 | warm rendered as orange hazard glow `GameBoard.svelte:91-95,148-150,200-203`; but detection only tests `isLight` (`turn-manager.js:31`), so warm is **safe** — `levels.js:206-210` confirms it is the sprint window; `game-design.md:87` calls it "dangerous" | Re-skin warm as a cooling/safe cue (blue-grey fade) or add an explicit "cooling — safe" label; fix the doc. |
| F14 | failure feedback | P1 | `Game.svelte:437-448` + `DetectionPopup.svelte:16-23` (`--bg-overlay` = `rgba(0,0,0,0.85)`, `theme.css:5`) fades in over 200 ms while the death flash lasts 400 ms (`GameBoard.svelte:189-195`) | Delay the popup ~600 ms and/or drop overlay opacity so the killing lit cell is visible; name the culprit guard in the popup. |
| F15 | failure feedback / kbd | P1 | `Game.svelte:293` early-returns all keys while `detected`/`isPaused`/`showLevelComplete` | Accept Enter/Space/R inside modals; add global `R` = restart. |
| F16 | failure feedback | P1 | `Game.svelte:451-454` restart is the only offer | When `affordances.undo`, add "Undo last move" to the detection popup — one move back beats a full replay in a hard puzzler. |
| F17 | a11y | P1 | `PauseMenu.svelte`, `DetectionPopup.svelte`, `ControlsOverlay.svelte`, `LevelCompletePopup.svelte` — no `role="dialog"`, no `aria-modal`, no focus move, no trap (only `App.svelte:98` does it right) | Add `role="dialog" aria-modal="true"`, focus the primary button on mount, trap Tab, restore focus on close. |
| F18 | a11y | P1 | `App.svelte:73-93` `{#key currentScene}` replaces the DOM; no focus target in any scene | Focus the scene `<h1>`/first control after each transition; add a live-region scene announcement. |
| F19 | a11y | P1 | `Game.svelte:291-329` — no `Escape` branch in idle mode; `PauseMenu.svelte` has no key handler | `Escape` should open pause from idle and close it from paused. |
| F20 | a11y | P1 | `GameBoard.svelte:65` all cells `tabindex="-1"`; `role="grid"` at :56 without any `role="row"` children; no `aria-live` for turn results | Add a roving-tabindex cursor over cells + an `aria-live="polite"` turn summary ("turn 7, lit cells adjacent: up, right"). |
| F21 | i18n | P1 | `LevelCompletePopup.svelte:8` uses `getText('levelComplete')`, key absent from both locales; `localization.js:27` returns the key itself, which is truthy so the `||` fallback never fires | Add `levelComplete` to `en.json`/`vi.json` (and make `getText` return `null` on miss). |
| F22 | i18n | P1 | `levels.js:10,34,69,115,161,211,274,329,377,434,488,537` — level `name` is English-only, shown at `LevelIntro.svelte:24`; default language is `vi` (`localization.js:9`) | Move level names into locale files as `levelNName`. |
| F23 | audio | P1 | `bgm.js:124` sets `activeTrack = url` *before* `play()` may throw at :145-150; the gesture retry at :167-171 re-enters `playBgm(same)` and hits the `url === activeTrack` early-return at :124 | Reset `activeTrack = null` in the catch block so the retry actually plays. Menu BGM currently never starts on autoplay-blocking browsers. |
| F24 | touch | P1 | `Game.svelte:534` swipe handlers on `.game-scene`; `.board-container` is `overflow: auto` (`Game.svelte:675`) with no `touch-action` | Set `touch-action: none` on the board and handle panning explicitly, otherwise swipes scroll the board instead of moving. |
| F25 | touch | P1 | `GameHud.svelte:75-84` `.icon-btn` ≈ 32 px; `Button.svelte:23-27` `.small` ≈ 37 px | Raise to `min-height/min-width: 44px` on coarse pointers. |
| F26 | undo gating | P2 | `Game.svelte:324` — pressing `Z` on a no-undo level does nothing, silently | Flash the affordance banner / play a denial tick when a gated key is pressed. |
| F27 | undo gating | P2 | banner shown only at `LevelIntro.svelte:28`; restarting from `PauseMenu` re-enters `initLevel()` without re-showing it (`Game.svelte:196-234`) | Keep a small persistent "no undo" chip in the HUD for gated levels. |
| F28 | undo/redo | P2 | redo exists (`Game.svelte:474`) but has no HUD button — `GameHud.svelte:40-44` only renders undo | Add a redo icon button next to undo. |
| F29 | i18n | P2 | Hardcoded English: `GameHud.svelte:30` `Turns:`, `:41` `aria-label="Undo"`, `:47` `"Toggle preview"`; `LevelCompletePopup.svelte:15` `/ Par:`; `ThrowTargetingOverlay.svelte:96` invalid-target hint; `GameBoard.svelte:13-25,58` all ARIA; `GuardSprite.svelte:65-76` ARIA; `LevelSelect.svelte:45` `{bestMoves}m` | Route through `getText`. |
| F30 | motion | P2 | `prefers-reduced-motion` handled in `GameBoard.svelte:272`, `GuardSprite.svelte:293`, `PlayerSprite.svelte:92` but **not** in `App.svelte:74` (fade), `StoryIntro.svelte:81` (30 s scroll), `LevelCompletePopup.svelte:35,56`, `SuspicionRing.svelte:33`, `ThrowTargetingOverlay.svelte:138`, `Game.svelte:651` (flash) | Add a global reduced-motion block in `theme.css`. |
| F31 | flow | P2 | `StoryIntro.svelte:8-15` auto-navigates on `animationend` of a 30 s CSS scroll | If animations are suppressed the event may never fire; add a timeout fallback and a pause control. |
| F32 | flow | P2 | `Game.svelte:518-526`: L12 is `isFinalLevel` (`levels.js:625`), so `next > total` is unreachable → `gameOver.runComplete` / `gameOver.runCompleteBody` are dead strings | Fire the run-complete flow after L11, or drop the branch. |
| F33 | dead code | P2 | `GameBoard.svelte:10,31-39,122-127` `throwTargetCells`/`throwCursor` props are never passed (`Game.svelte:559-567`) | Delete, or delete the duplicate rings in `ThrowTargetingOverlay`. |
| F34 | discoverability | P2 | `Game.svelte:355` tapping your own cell = wait; documented nowhere | Add "Tap yourself = wait" to the controls overlay. |
| F35 | discoverability | P2 | `Game.svelte:229` resets `showPreview = false` on every level and every restart | Persist the preview toggle across levels/restarts. |
| F36 | key handling | P2 | `Game.svelte:319,324,325` only match lowercase `v`/`z`/`y`; `e` handles both cases at :326 | Normalise with `e.key.toLowerCase()`. |
| F37 | scoring | P2 | par is only revealed after the win (`LevelCompletePopup.svelte:15`) | Show `Turns: n / par` in the HUD so 3★ is a playable goal. |
| F38 | colour | P2 | `ThrowTargetingOverlay.svelte:123-131` valid/invalid = green vs red fill only; `LevelSelect.svelte:86-91` locked = colour only | Add a check/cross glyph and a padlock glyph. |
| F39 | audio | P2 | mute exists in-game (`GameHud.svelte:45`) and in `Settings.svelte:60-71`, but `MainMenu.svelte` has no mute and BGM starts on mount (`App.svelte:49-52`) | Add a small mute toggle to the main menu. |

---

## Death → retry interaction cost (counted)

Path: `turn-manager.js:31` returns `detected` → `Game.svelte:388` → `triggerDetection()` (`Game.svelte:437-448`) → `DetectionPopup` mounts (`Game.svelte:609-611`).

**Pointer (mouse/touch): 1 click.**
- 0 ms: `detected = true`, popup starts a 200 ms fade (`DetectionPopup.svelte:8`).
- The player must hit one target: `PLAY AGAIN`, a 220 px-min-width centred button (`Button.svelte:17`).
- `handleDetectionDismiss` → `restartLevel()` → `initLevel()` is synchronous (`Game.svelte:451-454`, `196-234`); the only trailing cost is the smooth camera scroll (`Game.svelte:183-193`).
- Blocking animation chain: **none**. The 400 ms shake/flash runs *behind* the overlay. Cost is good.

**Keyboard: 0 keys work; 5–7 keypresses to escape.**
- `onKeyDown` returns at `Game.svelte:293` for every key while `detected` — Enter, Space, Esc and R are all inert.
- No autofocus in `DetectionPopup.svelte`; after a scene mount focus sits on `<body>`, so Tab starts at the top of the DOM.
- Tab order before the popup button: HUD undo (if `allowUndo`), SND, eye (if `allowPreview`), `?`, pause, MENU (`GameHud.svelte:40-56`). Board cells are `tabindex="-1"` (`GameBoard.svelte:65`) so they are skipped.
- L1–L8 (undo + preview on): **6 Tab + 1 Enter = 7 keypresses**. L9–L10 (no undo): 5 + 1 = 6. L11 (no undo, no preview): 4 + 1 = 5.
- Worse: every intermediate stop is invisible under an 85 %-opaque overlay, and one of them (`MENU`, `GameHud.svelte:55`) exits the level on Enter.

**Net:** this is a keyboard-driven puzzle game (arrows/WASD/Space/V/Z/E) that forces the player's hand to the mouse on every death. Target for a hard puzzler: **any key = retry, R = restart, U = undo the fatal move.**

There is also no fast restart when *not* dead: no `R` binding, no `Escape` → pause (`Game.svelte:291-329` has no Escape branch in idle), so a voluntary restart = click pause icon + click RESTART LEVEL = 2 clicks, mouse only.

---

## Stuck-player analysis

Current state:
- `LevelSelect.svelte:12-14` — `if (num <= progress.maxLevel)`; everything above `maxLevel` is `disabled` (`:34`).
- `progress.js:85-88` — `maxLevel` only advances inside `completeLevel()`, i.e. only on a win.
- No hint system anywhere (grep for `hint` returns only the two `throw.hint*` strings, `en.json:84-85`).
- No attempt counter, no per-level solution reveal, no "skip" affordance.
- Difficulty spikes are real: L11 runs 7 guards of all types with **both** undo and preview disabled (`levels.js:506-528`).
- L12 is unsolvable **by design** (`game-design.md:93`) and the only exit is an undocumented console call, `window.__nntvDev.teleport` (`Game.svelte:254-270`).

So: a player who cannot solve L7 has exactly two options — keep replaying L7, or quit. On a static offline site with local-storage progress, quitting means the session ends and very likely never resumes. This is the single biggest threat to "enjoyable, hard".

**Recommendation — ship both, they solve different problems:**

1. **Progressive hint (comprehension failure).** Track `attempts[levelNum]` in `progress.js`. After 3 detections on the same level, surface a `HINT` button in the HUD that reveals `level.hints[]` one step at a time:
   - hint 1 = the mechanic ("the onion's suspicion rises whenever you are within 3 cells — back off for a turn to cool it"),
   - hint 2 = the shape of the route ("cross row 5 on an even turn"),
   - hint 3 = the first 5 moves of the solver path. `level-solver.js` already exists and CI verifies solvability, so hint 3 is nearly free.
   Cost: one `hints` array per level + one button. Preserves the puzzle; removes the wall.

2. **Mercy unlock (execution/patience failure).** After 8 detections on the same level, unlock level N+1 in `LevelSelect` and mark it "skipped" (grey star row, no stars awarded). Keeps the story moving and keeps the completionist incentive to come back. Implement as `progress.skippedLevels[]` so 100 % completion still requires a real clear.

Do **not** rely on hint-only: L11's no-undo/no-preview combination is an execution wall, not a comprehension wall, and hints will not clear it.

Secondary: expose a *safe* documented escape for L12 rather than only the console egg — after 5 detections in the Princess Chamber, let the bittersweet ending play. Right now the intended narrative payoff is gated behind repeated failure the player has no reason to believe is intentional.

---

## i18n key-parity diff

Machine diff of `src/lib/locales/en.json` ↔ `vi.json`:

```
en keys: 93   vi keys: 93
en-only: (none)
vi-only: (none)
```

**Key parity is clean.** The problems are elsewhere:

- **Used but undefined in both locales:** `levelComplete` (`LevelCompletePopup.svelte:8`). Because `localization.js:27` returns the key string on a miss, the `|| 'Level Complete!'` fallback never runs → the popup title renders the literal text `levelComplete` in EN and VI. Visible on every level win.
- **Defined but never used (dead or should-be-used):** `instructions` (should be used — F07), `controlThrow` (should be used — F08), `caughtInLight`, `gameOver`, `tryAgain`, `levelNumber`, `gameDescription`, `gameOver.runComplete*` (unreachable, F32), `mechanics.sniper.name`, `mechanics.suspicion.name`, `mechanics.suspicion.alerted`, `mechanics.suspicion.firing`, `mechanics.oneWay.aria`, `mechanics.warm.aria`, `mechanics.door.locked`, `mechanics.door.open`. The whole `mechanics.*` ARIA namespace is unused because `GameBoard.svelte:13-25` and `GuardSprite.svelte:65-76` build English labels inline.
  (`level1Story`…`level12Story` are used dynamically via `levelData.storyKey`, `LevelIntro.svelte:11` — not dead.)
- **Hardcoded English in `.svelte`:** see F29. Note that default language is Vietnamese (`localization.js:9`), so a fresh VI player sees a VI menu, English level titles (F22), and an English `Turns:` counter.
- **Content-accuracy defect (worse than a missing key):** `level5Story`, `level7Story`, `level8Story`, `level9Story` describe guards that are not in those levels and omit the mechanics that are. Both languages are wrong identically.

---

## Prioritized fix list

### P0 — blocks play

1. **F01 Fit the stage to the viewport.** `src/styles/theme.css:65-73` + a small `src/lib/viewport-scale.js` mounted in `src/main.js`: keep the 1024×768 design box, apply `transform: scale(min(vw/1024, vh/768))` with `transform-origin: top left` on `#app`, and centre it. Nothing else in the codebase is responsive (zero `@media` rules), so this one change is what makes phones and small windows playable.
2. **F02 On-screen throw entry.** `src/components/GameHud.svelte` — render the `StonesCounter` as a button when `stonesLeft > 0` and emit `onthrow` → `enterTargeting()` in `src/scenes/Game.svelte:395`; add tap-able ✓ / ✗ buttons to `src/components/ThrowTargetingOverlay.svelte` (currently `pointer-events: none`, `:106`). Without this, L9/L10/L11 stone routes are keyboard-only.
3. **F03 Give stuck players a path.** `src/lib/progress.js` (add `attempts`, `skippedLevels`), `src/lib/levels/levels.js` (add `hints: []`), `src/components/GameHud.svelte` (HINT button after 3 deaths), `src/scenes/LevelSelect.svelte:12-14` (mercy unlock after 8). See stuck-player section.

### P1 — frustrates

4. **F21 Add the `levelComplete` key** to `en.json`/`vi.json`; make `localization.js:27` return `null` on a miss so `||` fallbacks work. One line each, removes a visible text bug from every win.
5. **F04 + F05 Resync the teaching text.** `src/lib/locales/*.json` `level5/7/8/9Story`, and add `teaches: ['suspicion']` etc. to `src/lib/levels/levels.js`, rendered as a "New this level" strip in `src/scenes/LevelIntro.svelte:22-30`.
6. **F14 + F15 + F16 Make death legible and instant.** `src/scenes/Game.svelte:437-454`: delay `detected = true` by ~500 ms so the flash reads; pass the culprit guard type into `DetectionPopup`; accept Enter/Space/R at `:293`; add an "Undo last move" action when `affordances.undo`.
7. **F19 Escape = pause.** `src/scenes/Game.svelte:318` add an `Escape` branch; `src/components/PauseMenu.svelte` close on Escape.
8. **F09 + F10 Fix preview semantics.** `src/components/GameBoard.svelte:68,84` — also mark currently-lit cells that go dark next turn; label the toggle "preview (if you wait)" in `src/components/ControlsOverlay.svelte` until `turn-manager.js:41` can simulate per-destination.
9. **F11 Draw the suspicion range** at tier 0. `src/components/SuspicionRing.svelte:7` + a faint diamond overlay sized from `guard.range` (needs `range` added to the snapshot at `Game.svelte:81-83`).
10. **F13 Fix the warm-tile lie.** `src/components/GameBoard.svelte:91-95` re-skin to a cooling cue; correct `docs/game-design.md:87`.
11. **F12 De-colour the key/door pairing.** `src/components/GameBoard.svelte:5,111,118` and `src/components/KeyInventory.svelte:8-12` — add a numeral or glyph.
12. **F17 + F18 Modal and scene focus.** All four overlay components + `src/App.svelte:73-93`.
13. **F23 Fix the BGM autoplay retry.** `src/lib/bgm.js:145-150` — set `activeTrack = null` in the catch.
14. **F24 + F25 Touch hygiene.** `touch-action: none` on `.board-container` (`src/scenes/Game.svelte:666-677`); 44 px minimum on `.icon-btn` (`src/components/GameHud.svelte:75`) and `.btn.small` (`src/components/Button.svelte:23`).
15. **F06 + F07 + F08 Teach in-game.** In-game bestiary behind the `?` button, an L1 controls toast, and the throw row in `src/components/ControlsOverlay.svelte:14-34`.
16. **F20 Board for screen readers.** Roving tabindex + `aria-live` turn summary in `src/components/GameBoard.svelte`.
17. **F22 + F29 Remaining i18n.** Level names into locales; route hardcoded strings and ARIA through `getText`.

### P2 — polish

18. F30 global reduced-motion block in `theme.css`; F26/F27 gated-key feedback + persistent HUD chip; F28 redo button; F35 persist preview toggle; F36 lowercase key matching; F37 par in HUD; F34 "tap yourself = wait"; F38 glyphs for valid/invalid and locked; F31 story-scroll timeout fallback + pause; F32 unreachable run-complete flow; F33 dead throw props in `GameBoard.svelte`; F39 mute on main menu.

---

## Unresolved questions

1. Is the fixed 1024×768 stage a deliberate "desktop-only" product decision? If yes, F01/F02/F24/F25 drop to P2 and the game should say so on the main menu; if no, F01 is the top item in this report.
2. Is L11's no-undo + no-preview combination (`levels.js:528`) intentional as the final skill gate, or a leftover from the phase-04 affordance rollout? It is the most likely permanent stopping point in the game.
3. Should hint text spoil the solution path (solver-derived) or stop at the mechanic? Affects whether `level-solver.js` needs a UI-facing export.
4. Is the `gameOver.runComplete` ending meant to fire after L11 (as `Game.svelte:522`'s comment says) or is L12's bittersweet ending the only intended finale? Current code makes run-complete unreachable.
5. Should warm tiles be safe (code) or dangerous (`game-design.md:87`)? The visual language currently backs the doc, the engine backs the code.
6. Is Vietnamese-by-default (`localization.js:9`) intended for a GitHub Pages audience, or should it detect `navigator.language`?
