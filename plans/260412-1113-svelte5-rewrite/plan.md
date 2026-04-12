---
title: Rewrite NNTV from Phaser 3 to Svelte 5
status: ready
created: 2026-04-12
branch: main
blockedBy: []
blocks: []
---

# Rewrite NNTV: Phaser 3 → Svelte 5 + Vite

## Overview

Replace Phaser 3 game engine (~1MB) with plain Svelte 5 + Vite for a turn-based grid puzzle game that only uses rectangles, circles, and text. All game logic (guards, turns, levels, lighting) ports as-is. Only the rendering/UI layer changes.

## Architecture: Before → After

```
BEFORE (Phaser 3)                    AFTER (Svelte 5)
─────────────────                    ────────────────
Phaser.Game config          →   App.svelte (scene router)
Phaser.Scene classes        →   Svelte components per scene
scene.add.circle/rect/text  →   HTML/CSS elements
scene.input.keyboard        →   window keydown events
scene.tweens.add            →   CSS transitions
this.scene.start()          →   reactive scene state
camera.fadeIn/fadeOut        →   svelte/transition (fade)
Phaser physics (unused)     →   DELETE
```

## File Migration Map

| Current File | Action | New Location |
|---|---|---|
| `locales/en.json`, `vi.json` | PORT AS-IS | `src/lib/locales/` |
| `levels/Levels.js` | PORT AS-IS | `src/lib/levels/levels.js` |
| `progress.js` | PORT AS-IS | `src/lib/progress.js` |
| `localization.js` | PORT AS-IS | `src/lib/localization.js` |
| `TurnManager.js` | PORT (remove Phaser import) | `src/lib/game/turn-manager.js` |
| `GridSystem.js` | SPLIT: data logic → pure JS, rendering → Svelte | `src/lib/game/grid-system.js` + `GameBoard.svelte` |
| `Guard.js` | SPLIT: logic → pure JS, rendering → Svelte | `src/lib/game/guards.js` + `GuardSprite.svelte` |
| `Player.js` | SPLIT: logic → pure JS, rendering → Svelte | `src/lib/game/player.js` + `PlayerSprite.svelte` |
| `LightingSystem.js` | MERGE into grid-system.js | `src/lib/game/grid-system.js` |
| `LevelManager.js` | REWRITE as pure function | `src/lib/game/level-manager.js` |
| `theme.js` | REWRITE as CSS variables | `src/styles/theme.css` |
| All scenes/*.js | REWRITE as Svelte components | `src/scenes/*.svelte` |
| `main.js` | REWRITE | `src/main.js` + `src/App.svelte` |
| `LevelTester.js` | DELETE | — |

## New Project Structure

```
src/
├── main.js                     # Mount Svelte app
├── App.svelte                  # Scene router + transitions
├── styles/
│   └── theme.css               # CSS variables (colors, fonts)
├── lib/
│   ├── localization.js         # getText, setLanguage (ported)
│   ├── progress.js             # localStorage persistence (ported)
│   ├── locales/
│   │   ├── en.json             # English (ported)
│   │   └── vi.json             # Vietnamese (ported)
│   ├── levels/
│   │   └── levels.js           # Level data (ported)
│   └── game/
│       ├── grid-system.js      # Grid data model + lighting (pure JS)
│       ├── guards.js           # Guard classes, logic only (pure JS)
│       ├── player.js           # Player position + movement (pure JS)
│       ├── turn-manager.js     # Turn logic (pure JS)
│       └── level-manager.js    # Level loading (pure JS)
├── components/
│   ├── GameBoard.svelte        # CSS Grid rendering of cells
│   ├── PlayerSprite.svelte     # Player circle element
│   ├── GuardSprite.svelte      # Guard circle + direction indicator
│   ├── GameHud.svelte          # Lives, level, turns, pause/menu buttons
│   ├── DetectionPopup.svelte   # "You've been detected" overlay
│   ├── PauseMenu.svelte        # Pause overlay
│   └── Button.svelte           # Reusable styled button
└── scenes/
    ├── MainMenu.svelte
    ├── StoryIntro.svelte
    ├── LevelSelect.svelte
    ├── LevelIntro.svelte
    ├── Game.svelte             # Main game scene
    ├── GameOver.svelte
    ├── Settings.svelte
    └── Guide.svelte
```

## Key Design Decisions

1. **Plain Svelte + Vite** (not SvelteKit) — no routing needed for SPA game
2. **Svelte 5 runes** (`$state`, `$derived`, `$effect`) — reactive game state
3. **CSS Grid** for game board — native, responsive, zero dependencies
4. **CSS transitions** for player movement — replace Phaser tweens
5. **`svelte/transition`** for scene switching — fade between screens
6. **Pure JS game logic** — all guard/turn/level logic stays framework-agnostic
7. **Game state as module-level `$state`** in `.svelte.js` files — shared across components

## Phases

| # | Phase | Status | File |
|---|-------|--------|------|
| 1 | Scaffold Svelte 5 project | pending | [phase-01](phase-01-scaffold-project.md) |
| 2 | Port pure game logic | pending | [phase-02](phase-02-port-game-logic.md) |
| 3 | Build game board + sprites | pending | [phase-03](phase-03-game-board-components.md) |
| 4 | Build scene components | pending | [phase-04](phase-04-scene-components.md) |
| 5 | Wire game scene + input | pending | [phase-05](phase-05-game-scene-input.md) |
| 6 | Polish + verify | pending | [phase-06](phase-06-polish-verify.md) |

## Risk Assessment

| Risk | Impact | Mitigation |
|---|---|---|
| Grid reactivity perf on 10x10 | Low | Svelte fine-grained updates; only changed cells re-render |
| CSS transition timing mismatch with game turns | Medium | Use fixed duration, test each guard type |
| Level 12 special mechanic (lightUpEntireMap) | Low | Direct DOM class toggle on all cells |

## Dependencies

- Svelte 5 (latest)
- Vite 6.x (already used)
- No other runtime dependencies
