# Code Review: Night Ninja: Twilight Voyage (full project)

## Summary

Small, well-scoped Svelte 5 + Vite 6 stealth puzzle (~4k LOC). Pure-JS game engine in `lib/game/` is cleanly separated from Svelte rendering. Recent pixel-art integration (commit 9eced8a) introduces `lib/pixel/` with a simple string→SVG renderer; it works but adds ~94KB of inlined art data. Build succeeds with two `state_referenced_locally` warnings (silenced). Docs drifted after pixel integration and still describe the pre-pixel codebase. Zero automated tests; several pure-JS modules are cheaply testable and worth covering. No critical security/correctness bugs; a handful of real but low-impact issues around stale state on bad level ids, undo/redo discarding princess state partially, and preview-simulation side effects on real guard state.

## Strengths

- Clean engine/render separation; `renderVersion` pattern is documented and consistently applied.
- All user-facing strings localized via `getText`; XSS-safe by default (Svelte interpolation, no `{@html}`).
- `try/catch` around all `localStorage` reads/writes (`progress.js`, `localization.js`).
- Pure-JS classes (`GridSystem`, `Player`, `TurnManager`, `GameHistory`, `TouchControls`, guard hierarchy) have tight, single-responsibility APIs.
- GUARD_REGISTRY factory pattern in `level-manager.js` removes switch boilerplate.
- File sizes largely under 200 lines; only `Game.svelte` (396), `guards.js` (347), `levels.js` (524, data), and `art-characters.js` (330, data) exceed — data files are acceptable.

## Issues by severity

### Critical
None.

### High

- **`src/scenes/Game.svelte:74`** — If `loadLevel(currentLevel)` returns `null` (invalid id), `initLevel` returns early leaving `grid`, `player`, `guards` from the previous level (or `null`, triggering crashes when handlers run). No user-facing guard.
  Fix: when `state` is null, navigate to `MainMenu` or clamp to 1.

- **`src/lib/game/turn-manager.js:31-71` (`previewNextTurn`)** — "Preview" mutates real guard state, collects lit cells, then restores from snapshot. If any guard subclass gains state fields not in the snapshot list (e.g., future `cooldown`, `lastSeen`), the preview will silently corrupt the real game. Also `grid.clearAllLight()` + `updateLight(guards)` at the end re-runs mirror reflection but the beam order now differs from a fresh turn-start state.
  Fix: deep-clone guards into sandbox copies, run on the sandbox, don't mutate live instances. Or add explicit "all snapshotted fields" contract per guard type.

- **`src/scenes/Game.svelte:186-208` (`handleUndo`/`handleRedo`)** — After restoring player/guards, the code calls `grid.clearAllLight()` then `g.updateLight(guards)` for every guard. But guards with direction-dependent light (rotating, patrolling, chaser) need their light recomputed based on direction — which IS restored correctly — so this generally works. BUT `princess.alerted` is restored from `state.princessAlerted`, which was **never captured** at push time for move snapshots: `createSnapshot` at line 100-101 passes `princess.alerted, princess.alertRadius`, but the snapshot is created BEFORE the move's effects — so the restored princess state matches the moment before the move, which is correct. Exception: on final level, if princess was alerted BEFORE the move, undoing restores pre-move alerted=true/radius=N; but the `lightRing` is recomputed with that radius. Fine, but `princess.messageShown` is never snapshotted/restored → first re-alert after an undo back across the alert boundary will skip `showMessage: true` because `alerted` is already true. Minor UX bug.
  Fix: snapshot `messageShown`, or tie message display strictly to `!prevAlerted && nowAlerted`.

- **`src/scenes/Game.svelte:74` / `src/lib/game/turn-manager.js:14`** — `nextTurn` checks `isGoal` BEFORE guard update, so reaching goal never triggers the final guard turn. That's by design, but combined with the preview path (which runs real guard turn), the preview and the actual "step onto goal" disagree. Not wrong, just subtle — confirm this is intended behavior.

- **Build warnings `state_referenced_locally` (`Game.svelte:33, 34`)** — Silenced with `svelte-ignore`, but the underlying pattern (`$state(level)` reading the prop's initial value only) means if the parent remounts Game with new props without scene-key change (unlikely given `{#key currentScene}` pattern), the state would desync. With the current navigate flow each Game instance is a fresh mount, so this is safe. Prefer `$derived(level)` if the goal is "latest prop", or a clarifying comment noting "value is only read on mount; parent remounts scene via {#key}".

### Medium

- **`src/lib/game/turn-manager.js:15-16`** — When `player` is at goal, `nextTurn` returns early without clearing lights. Next turn's `grid.clearAllLight()` will run, but intermediate renders show stale lights. Low impact, but combined with the LevelComplete popup it usually isn't visible.

- **`src/lib/game/princess-mechanic.js:24-30`** — `update` increments `alertRadius` on every call once alerted, even if `update` is called twice in one turn. `Game.svelte` only calls it via `checkFinalLevel` per turn, so fine today, but class is not idempotent.

- **`src/lib/game/game-history.js:32-47`** — `snapshotGuard` stores `currentPathIndex/isReversing` only for `patrolling`, `isChasing/isReturning/target*` only for `chaser`. If a rotating guard were ever given a state field, snapshot would silently drop it. Fragile. Use `Object.assign({}, g)` filtered to primitives, or have each guard class expose `snapshot()/restore(s)`.

- **`src/scenes/LevelSelect.svelte:7`** — `const totalLevels = 12;` hardcoded. `getTotalLevels()` already exists. Source of future drift when adding levels.
  Fix: `import { getTotalLevels } from '../lib/game/level-manager.js';` and call.

- **`src/scenes/Game.svelte:59`** — `cellSize = $derived(grid ? Math.min(50, Math.floor(500 / grid.rows)) : 50);` — fixed 500px divisor ignores viewport width and `grid.cols`. On narrow mobile or non-square grids (levels use up to 10×10 but most are ≤7×7), the board can overflow horizontally. No viewport query.
  Fix: compute from `Math.min(availableW / cols, availableH / rows)` or read container size.

- **`src/components/GameBoard.svelte:41` + inline Svelte `{@const}`** — Two `previewCells.has(...)` calls per cell (`class:preview` and `{#if}`). Extract once via `{@const}`. Micro, but cleanup.

- **`src/scenes/Settings.svelte:7-14`** — `tick++` + `{#key tick}` used to force re-render on language change. With Svelte 5 runes, `getText` is not reactive because translations are pulled from a module-level `currentLanguage` variable. This works by mounting the entire subtree — acceptable but note that other scenes don't pick up the change until remount (MainMenu does via App's `{#key currentScene}`, same for Game). If user flips language mid-game and resumes, loaded story text stays until navigation. Low priority.

- **`src/lib/audio.js:17`** — `audioCtx.resume()` is unawaited; returns a Promise. Chrome/Safari fine in practice, but on some mobile browsers first few tones may be silent.
  Fix: `await` inside an async wrapper, or schedule notes after resume resolves.

- **`src/lib/pixel/Pixel.svelte:4`** — `scale = 6` prop is unused when `width`/`height` are provided (always, in current callers). Dead default.

- **`src/lib/pixel/art-scenes.js:5`** — `norm` helper pads with `r.at(-1)` (last char of prior row) if row too short. Silent padding with an unrelated palette char can produce artifacts if an author miscounts. Assert or pad with `.` (transparent).

### Low

- **File naming inconsistency** — `components/` mixes PascalCase (`Button.svelte`, `GameBoard.svelte`) with kebab-case (`controls-overlay.svelte`). `docs/code-standards.md` says PascalCase for components. Either rename `controls-overlay.svelte` → `ControlsOverlay.svelte` (already imported as `ControlsOverlay`) or update the doc convention.

- **`src/scenes/Game.svelte:53-54`** — Comment "class instances are not proxied" accurate; good. Consider extracting the `renderVersion` + `$derived` pattern into a helper once more modules need it (YAGNI for now).

- **`src/lib/game/guards.js:177-213` (`bfsNextStep`)** — Standard BFS, correct. `queue.shift()` is O(n); for 10×10 grids (<100 cells) fine.

- **`src/lib/localization.js:9`** — `currentLanguage = 'vi'` hardcoded default; docstring says same. If requirements change to EN default, two places to update. Minor.

- **`src/scenes/StoryIntro.svelte:9-11`** — `document.querySelector('.story-scroll')` from `onMount`. Works because CSS animation uses `animationend`. Fragile if selector collides; use a `bind:this` ref.

- **`src/scenes/Game.svelte:180`** — `setTimeout(..., 400)` without ref; if user navigates mid-timeout the component is destroyed and the callback writes to dead state. Svelte 5 is tolerant but use `onMount` cleanup or `$effect` with cleanup.

- **`src/components/GameHud.svelte:8`** — `lives` default `3`, but `MAX_LIVES` constant is also `3`. If `lives` prop ever exceeds `MAX_LIVES`, hearts are silently truncated. Cosmetic.

- **Perf (pixel backdrop)** — `LevelIntro` and `Game` each render a `Pixel` backdrop via SVG. After run-length compression ≤1-2KB of rects. Re-renders only on level change (due to `$derived` on `currentLevel`). No action needed.

- **Bundle size** — 129KB JS (40KB gzip) is fine for a small game. Art data (~8KB compressed) inlined in the JS chunk. Not worth code-splitting given total size.

## Docs drift

All three docs pre-date the pixel integration (commit 9eced8a). Required updates:

- **`docs/codebase-summary.md`**
  - Line 28-38 Components table: missing `LevelCompletePopup.svelte`, `controls-overlay.svelte`; `GuardSprite.svelte` described as "Colored circle" (now a Pixel sprite).
  - Missing the `src/lib/pixel/` subsystem entirely (5 files, 773 LOC).
  - File Dependency Map (line 171) doesn't mention `Pixel`, `art-*`, `palette`.
  - Stats (line 193): "Total Source Files ~25" — actually ~35 now.
  - "No sprites/images" (line 248 of architecture) is now wrong; pixel-art sprites are present but inlined as JS strings.

- **`docs/system-architecture.md`**
  - Line 83-90 "Svelte Components" still says "PlayerSprite — positioned div", "GuardSprite — colored circle/diamond". Both now wrap `<Pixel>`.
  - Line 246-253 "Asset & Resource Management — No sprites/images: Pure CSS rendering". Outdated.
  - Missing section on pixel rendering pipeline (string-art + palette + SVG rect merge).

- **`docs/code-standards.md`**
  - Line 41-48 Components table missing `LevelCompletePopup.svelte`, `controls-overlay.svelte`.
  - Directory Structure (line 26-73) missing `src/lib/pixel/` entirely.
  - File-naming rule says "PascalCase" for components but `controls-overlay.svelte` exists. Resolve one way.
  - "No sprites/images" implication in theme section still holds but worth clarifying the pixel pipeline's relationship to theme.css guard colors (duplicated as `NNTV.guard*` constants — document the coupling).

- **`README.md`** Project Structure table (line 79-91) — does not mention `src/lib/pixel/`. Minor.

## Test coverage gap

No tests, no framework installed. Priority targets (pure JS, deterministic, cheap):

1. **`src/lib/game/grid-system.js`** — bounds, setters, `getAllCells`. Smoke-level only.
2. **`src/lib/game/player.js`** — `move` direction mapping, wall/bounds rejection.
3. **`src/lib/game/turn-manager.js`** — especially `previewNextTurn` (state restoration is the highest-risk code in the engine). Covers the Medium/High fragility noted above.
4. **`src/lib/game/game-history.js`** — undo/redo round-trip for each guard type. Would catch the missing `messageShown` snapshot.
5. **`src/lib/game/guards.js`** — `RotatingGuard.castBeam` with mirror bounce (depth cap, boundary, wall), `ChaserGuard.bfsNextStep` on wall mazes, `PatrollingGuard` circular vs reversing path. Most logic-heavy module, highest defect risk.
6. **`src/lib/game/princess-mechanic.js`** — ring expansion, detection at each radius.
7. **`src/lib/progress.js`** — star calculation, localStorage serialization survives corruption.

Svelte component tests (via `@testing-library/svelte` or `vitest` + `jsdom`) are worth deferring — the components are thin and mostly props-through.

Recommended: add `vitest` as a dev dep, create `src/lib/game/*.test.js` for items 1-7. Target: 60-70% statement coverage of `lib/game/`. Skip UI/scene tests initially.

## Unresolved questions

- Is `previewNextTurn` mutating real guards intentional (for perf), or a candidate for immediate refactor to sandbox copies?
- Is `currentLanguage = 'vi'` the permanent default, or should it detect `navigator.language`?
- Is `isFinalLevel` behavior of skipping guard detection after princess detect intended? (Currently both code paths can fire in sequence — guard detect wins the popup order.)
- Should `LevelSelect`'s hardcoded `totalLevels = 12` become reactive to `getTotalLevels()` now, anticipating level additions?

---

**Status:** DONE_WITH_CONCERNS
**Summary:** Project is in good shape architecturally; pixel integration is clean but docs weren't updated to match. One high-impact correctness risk in `previewNextTurn` state mutation, one High issue with `initLevel` silent-fail on invalid level, and undo state incompleteness for princess `messageShown`. Docs and tests are the primary gaps.
**Concerns/Blockers:** None blocking; recommend addressing the High items before the next feature phase.
