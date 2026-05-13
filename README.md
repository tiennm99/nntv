# Night Ninja: Twilight Voyage

Turn-based stealth puzzle game built with Svelte 5. Play as a ninja rabbit navigating
grid-based levels inside the Vegetable Kingdom, avoiding detection by vegetable guards
to rescue the missing carrot princess.

Play: `pnpm dev` → `http://localhost:5173`

---

## Features

- **12 levels across 6 acts** — grids grow from 8×8 to 13×13; difficulty escalates per act
- **8 guard types** — Static (wilting aura), Rotating (beam), Blinking (toggle), Patrolling,
  Mirror (beam redirect), Chaser (BFS hunt), Sniper (fixed line of sight), Suspicion (tier alert)
- **Throwable stones** — press **E** to distract rotating, patrolling, and chaser guards
- **Doors and keys** — color-coded key items unlock matching doors
- **One-way tiles** — arrow tiles enforce entry direction
- **Decay tiles** — cells that cool over turns; dangerous while warm
- **Undo/redo** — press **Z** / **Y** (when level allows); full state snapshots including door state
- **Turn preview** — press **V** to preview next-turn lighting (when level allows)
- **Procedural audio** — Web Audio API; move, detect, throw, key pickup, door unlock, suspicion
- **Pixel-art rendering** — all sprites drawn as string-art palettes → SVG rects
- **BFS solvability CI** — levels L1–L11 verified beatable in CI; L12 intentionally unsolvable
- **Bilingual** — English and Vietnamese (VI) locale support

---

## Requirements

[Node.js](https://nodejs.org) 18+ and [pnpm](https://pnpm.io).

---

## Quick Start

```sh
git clone https://github.com/tiennm99/nntv
cd nntv
pnpm install
pnpm dev        # dev server at http://localhost:5173
```

---

## Commands

| Command | Description |
|---|---|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build → `dist/` |
| `pnpm preview` | Preview production build locally |
| `pnpm test` | Run all unit + solvability tests |
| `pnpm test:solvability` | Run only the BFS solvability suite |

---

## Controls

| Input | Action |
|---|---|
| Arrow keys / WASD | Move one cell |
| Click adjacent cell | Move |
| Space | Wait one turn |
| V | Preview next-turn lighting |
| Z / Y | Undo / redo |
| E | Enter stone-throw targeting mode |
| Enter / E (in throw mode) | Throw stone |
| Esc | Cancel throw |

---

## Architecture

Pure JavaScript game engine with a Svelte 5 rendering layer.

```
src/
├── lib/game/        # Pure JS engine
│   ├── grid.js      # Cell state: walls, goals, lighting, doors, warm tiles
│   ├── player.js    # Position, movement validation, key inventory (bitmask)
│   ├── guards.js    # 8 guard type implementations
│   ├── throwable.js # Stone inventory, throw validation (Manhattan ≤3, LoS)
│   ├── turn.js      # Turn cycle with preview simulation
│   ├── history.js   # Undo/redo via state snapshots
│   └── solver.js    # BFS solvability checker (reused by CI + runtime AI)
├── lib/levels/      # 12 level definitions + solvability test suite
├── lib/pixel/       # Pixel-art renderer, palette, sprite/tile/scene art
├── lib/locales/     # en.json + vi.json
├── lib/audio.js     # Procedural Web Audio sound effects
├── scenes/          # MainMenu, Game, Guide, Settings, GameOver
└── components/      # GameBoard, HUD, sprites, overlays
```

**Engine loop:** each player action triggers `TurnManager`, which advances all guard
states simultaneously, recomputes lit cells, checks detection, and appends a snapshot
to `GameHistory`. `LevelSolver` (BFS over the same state machine) is run in CI against
every level definition to catch regressions before merge.

---

## Project Structure

| Path | Description |
|---|---|
| `index.html` | HTML entry point |
| `src/main.js` | Application bootstrap |
| `src/App.svelte` | Scene router + migration modal |
| `src/styles/theme.css` | CSS variables: colors, fonts, guard palette |
| `svelte.config.js` | Svelte 5 + Vite config |
| `vite.config.js` | Vite build config |

---

## License

Apache 2.0
