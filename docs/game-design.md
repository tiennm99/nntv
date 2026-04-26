# Game Design Document - Night Ninja: Twilight Voyage

## Concept

**Genre**: Puzzle / Stealth / Turn-based
**Platform**: Web browser
**Audience**: All ages, puzzle lovers
**Difficulty**: Progressive (easy → hard → impossible)

A ninja rabbit must rescue the Carrot Princess from the Vegetable Kingdom. 12 grid-based stealth levels with a twist: **Level 12 is intentionally unsolvable** — the princess herself detects you when you approach, ending the game with a bittersweet narrative.

## Story

The Carrot Princess, daughter of King Carrot III, has vanished from the royal palace. The Vegetable Kingdom is in chaos. You are Night Ninja — a skilled rabbit from the shadows — called upon for this dangerous rescue mission.

You infiltrate the kingdom's outskirts, fight through gardens, fortress walls, underground passages, and the royal palace. At last, you reach the Princess Chamber. But as you approach, the princess senses your presence. Light radiates outward from her in an unstoppable wave. **The rescue was never possible.** The game ends: *"The Carrot Princess remains beyond your reach. Perhaps some rescues were never meant to be..."*

### Foreshadowing Arc (Levels 10–12)
- **Level 10**: *"They say the Princess can sense any living thing nearby — even ghosts of past attempts..."*
- **Level 11**: *"No one who entered the chamber beyond has returned. The throne itself was a warning."*
- **Level 12**: *"The air itself feels watchful. She already knows you're here."*

## Core Mechanics

### Turn System
1. Player moves one cell (arrow keys / WASD / click adjacent cell) — or waits (Space)
2. All guards execute their turn action simultaneously
3. Lighting recalculates
4. Detection check: player on lit cell → restart current level
5. Goal check (before guards): reach green cell → level complete

### Death Model
Detection restarts the current level only. There are no lives or shared health across levels. Each level is an isolated puzzle run.

### Grid
- Cells: empty (dark/safe), wall (impassable), goal (green), lit (yellow/dangerous)
- Player starts at top-left (0,0), goal at bottom-right corner
- Grid sizes: 8×8 → 13×13 as difficulty increases (camera-follow viewport on large arenas)

### Affordance Gates (per-level)
Some levels disable **undo** and/or **preview** to raise stakes. A banner notifies the player at level start.

## Guard Types

| Type | Color | Veggie | Behavior |
|------|-------|--------|----------|
| Static (Wilting) | Red | Tomato | Manhattan aura shrinks by 1 per turn until harmless. Wait or detour. |
| Rotating | Blue | Blueberry | Rotates beam 90° clockwise each turn; 2-cell range; stopped by walls; reflects off mirrors. |
| Blinking | Yellow | Corn | Toggles lights on/off each turn; lights fixed cells when "on". |
| Patrolling | Purple | Eggplant | Moves along predefined path; lights front + right cells relative to facing. |
| Mirror | Green | Lettuce | Stationary; redirects rotating beams 90° (cw/ccw); max 3 bounces. |
| Chaser | Orange | Pumpkin | BFS pathfinding toward player when within detectionRadius; returns home otherwise. |
| Sniper | Dark Red | Pepper | Aims along a fixed cardinal line of sight. Instant detection if player steps into the aim line regardless of turn timing. |
| Suspicion | Violet | Onion | Three-tier alert: 0=calm, 1=alerted (suspicion ring visible, slower response), 2=firing (instant detection). Tier rises when player crosses field of view; resets over turns if player exits zone. |

### Guard Rules
- Guards light their own cell (visible to player)
- All guards act after player moves (simultaneous)
- Rotating beam stops at walls and grid boundaries
- Mirror only affects rotating guard beams
- Patrolling guards reverse direction at path endpoints (or loop if circular path)
- Sniper aim line is cardinal only (up/down/left/right from guard position)
- Suspicion guard tier resets one step per turn while player is outside view zone

## New Mechanics (v2)

### Throwable Stones
- Each level grants a fixed stone count (defined in `level.stones`)
- Press **E** to enter targeting mode; arrow keys move cursor over the grid
- Valid targets: Manhattan distance ≤ 3 from player, clear line-of-sight, at least one distractible guard (rotating/patrolling/chaser) within distance 2 of target
- Throw uses one turn; distractable guards in range change direction/behavior for that turn
- HUD shows remaining stones; stone icon is a pixel-art grey rock

### Doors and Keys
- Keys appear as colored items on the grid floor (gold/silver/copper for IDs 1/2/3)
- Player auto-collects a key by stepping onto its cell
- Doors block movement until the matching key is held (bitmask in `player.keysHeld`)
- Door and key sprites are color-coded identically — matching is visual
- HUD shows collected keys as pixel-art chips

### One-Way Tiles
- Arrow tiles only allow entry from the designated cardinal direction
- Attempting to enter from any other direction is blocked silently
- Creates commitment ratchets — plan the full route before crossing

### Decay / Warm Tiles
- A warm cell is temporarily dangerous (flagged `isWarm`); after one turn it cools to safe
- Visually distinct from lit cells: dim orange glow vs bright yellow
- Used to create timed hazard zones without persistent guards

## Level Design

**Exactly 12 levels. Levels 1–11 MUST be solvable. Level 12 MUST NOT be solvable.**

### Act Structure

| Act | Levels | Theme | Grid | Mechanic Focus |
|-----|--------|-------|------|----------------|
| 1: The Outskirts | 1–2 | Garden | 8×8 | Movement + wilting static guards |
| 2: The Vegetable Garden | 3–4 | Garden/Walls | 9×9 | One-way tiles + rotating + blinking |
| 3: The Fortress | 5–6 | Fortress | 10×10 | Patrolling guards, timing, parity |
| 4: The Underground | 7–8 | Tunnels | 11×11 | Mirror guards, beam reflection mastery |
| 5: The Royal Palace | 9–10 | Palace | 11×12 | Chaser guards, stones, doors + keys |
| 6: The Princess Chamber | 11–12 | Palace/Final | 11×13 | All types + sniper/suspicion; L12 unsolvable |

### Level-by-Level Specification

**Level 1 — Garden Path** (8×8, 0 guards)
Tutorial: movement only. Three wall bands route the player through a winding corridor. No danger.

**Level 2 — The Watchtower** (8×8, 3 wilting tomatoes)
Three wilting tomatoes (initialRadius 2) on the zigzag detour. Auras shrink by 1/turn.
Teaches: lit cells = danger, but they fade. Wait or detour.

**Level 3 — Vegetable Patrol** (9×9, one-way tiles + static + rotating)
One-way tiles introduced. Two one-way gates between map zones. Two static guards flank edges; one rotating guard in middle.
Teaches: commitment ratchets — plan route before crossing a one-way.

**Level 4 — The Searchlight** (9×9, rotating + blinking + 3 static)
Blinking guard introduced. Solution requires at least one `wait` action.
Teaches: counting turns, parity-based movement.

**Level 5 — Fortress Gate** (10×10, static + rotating + blinking + patrolling)
Patrolling guard introduced on a short circular path.
Teaches: predicting patrol path, front+right light pattern.

**Level 6 — The Flickering Corridor** (10×10, 2 blinking + rotating + 2 patrolling + static × 2)
Two patrollers with interlocking routes.
Teaches: weaving between multiple moving threats.

**Level 7 — The Underground Passage** (11×11, rotating + mirror + blinking + patrolling + 3 static)
Mirror guard introduced; rotating beam deflects off it.
Teaches: predicting reflected beam paths.

**Level 8 — The Gauntlet** (11×11, 2 rotating + 2 mirrors + 2 patrolling + blinking + static)
Two mirrors form a crossfire pattern.
Teaches: mastery of reflected beams in open arenas.

**Level 9 — The Decoy Path** (12×12, chaser + rotating + 2 blinking + 2 static + patrolling)
Chaser guard introduced, ambushing the central shortcut. Stones introduced.
Teaches: lure-and-retreat; throwable distraction; perimeter path beats the tempting short route.

**Level 10 — Hall of Mirrors** (12×12, 2 rotating + 3 mirrors + blinking + static + patrolling + chaser)
Mirrors create a crossfire with a hunting chaser. Doors + keys introduced.
Teaches: navigating reflected beams while evading a pursuer; key routing.

**Level 11 — The Throne Room** (11×11, ALL TYPES, 7 guards total)
Climax: at least one of each guard type including sniper and suspicion.
Teaches: mastery of all mechanics simultaneously.

**Level 12 — The Princess Chamber** (13×13, 10 guards + expanding princess wave)
**UNSOLVABLE BY DESIGN.** See `project_level12_unsolvable.md` in memory.
- When player reaches Manhattan distance ≤ 4 from goal, the princess "senses" the player
- Light radiates outward from the goal one ring per turn — unstoppable
- **Easter egg**: `window.__nntvDev.teleport(12, 12)` triggers the normal win flow (undocumented)
- **Narrative payoff**: *"The Carrot Princess senses your presence! A wave of light radiates outward... Run!"* → detection → bittersweet game-over

### Level Design Constraints
- Player always starts at (0, 0); goal always at (rows-1, cols-1)
- Max 10 guards per level
- Every level 1–11 must have at least one valid path (BFS solver-verified in CI)
- Walls create routing decisions, not dead ends
- Each new mechanic gets a solo introduction level before combining
- All `levels.js` edits must pass `npm run test:solvability`

## Visual Design

Pixel-art sprites (string-art + palette → SVG rects via `Pixel.svelte`). No raster image files.

| Element | Visual | Source |
|---------|--------|--------|
| Empty cell | Dark blue-gray tile | `art-tiles.js TILE_EMPTY` |
| Wall | Stone brick tile | `art-tiles.js TILE_WALL` |
| Goal | Green tile | `art-tiles.js TILE_GOAL` |
| Lit cell | Bright yellow tile | `art-tiles.js TILE_LIT` |
| Warm cell | Dim orange glow tile | `art-tiles.js TILE_WARM` |
| One-way tile | Directional arrow tile | `art-tiles.js TILE_ONEWAY_RIGHT` (rotated) |
| Door (locked) | Color-coded door tile | `art-tiles.js TILE_DOOR_*_PAL` |
| Door (open) | Open doorway tile | `art-tiles.js TILE_DOOR_OPEN` |
| Key item | Color-coded key tile | `art-tiles.js TILE_KEY_*_PAL` |
| Player | Ninja rabbit sprite | `art-characters.js RABBIT_ART` |
| Static guard | Wilting tomato | `art-characters.js TOMATO_ART` |
| Rotating guard | Blueberry | `art-characters.js BLUEBERRY_ART` |
| Blinking guard | Corn | `art-characters.js CORN_ART` |
| Patrolling guard | Eggplant | `art-characters.js EGGPLANT_ART` |
| Mirror guard | Lettuce | `art-characters.js LETTUCE_ART` |
| Chaser guard | Pumpkin | `art-characters.js PUMPKIN_ART` |
| Sniper guard | Dark-red pepper | `art-characters.js SNIPER_ART` |
| Suspicion guard | Violet onion (3 tier states) | `art-characters.js SUSPICION_CALM_ART` |
| Stone HUD icon | Grey rock pixel | `art-tiles.js ICON_STONE` |

## Controls

| Input | Action |
|-------|--------|
| Arrow keys / WASD | Move |
| Space | Wait one turn |
| V | Toggle next-turn preview (if allowed) |
| Z | Undo last move (if allowed) |
| Y | Redo move (if allowed) |
| E | Enter / confirm stone-throw targeting |
| Esc | Cancel throw targeting |
| Click adjacent cell | Move |
| Swipe | Move (mobile) |

## UI Screens

1. **Main Menu**: Start Game, Level Select, Settings, Guide
2. **Migration Modal**: Shown once on v2 first launch (progress reset notice)
3. **Story Intro**: Scrolling text narrative (skippable)
4. **Level Intro**: Level name + story/foreshadowing text + Continue button
5. **Game**: Board + HUD (level, turns, stones, keys, affordance banners) + pause
6. **Detection Popup**: "Detected!" + Play Again button (restarts current level)
7. **Pause Menu**: Resume / Restart / Main Menu
8. **Level Complete Popup**: Star rating, move count vs par, Next button
9. **Game Over**: Run-complete celebration (L11) or bittersweet end (L12)
10. **Level Select**: 4×3 grid, locked/unlocked/completed states
11. **Settings**: Language toggle (EN/VI)
12. **Guide**: Objectives, controls, all enemy type descriptions

## Audio (Procedural Web Audio API)

| Event | Function | Character |
|-------|----------|-----------|
| Player move | `playMove` | Soft sine 220 Hz, 60ms |
| Player wait | `playWait` | Quiet tick 160 Hz, 40ms |
| Detection | `playDetection` | Harsh saw 400+600 Hz alarm |
| Level complete | `playLevelComplete` | Ascending 3-note jingle |
| UI click | `playClick` | Square click 800 Hz, 20ms |
| Undo | `playUndo` | Descending triangle 300 Hz |
| Stone throw | `playStoneThrow` | Whoosh sine 800→200 Hz, 100ms |
| Stone impact | `playStoneImpact` | Thud filtered noise, 50ms |
| Key pickup | `playKeyPickup` | Triangle pluck 1200 Hz, 150ms |
| Door unlock | `playDoorUnlock` | Square click + minor third, 250ms |
| Suspicion tier 1 | `playSuspicionAlert` | Saw 600 Hz, 200ms |
| Suspicion tier 2 | `playSuspicionFire` | Sine wobble 800↔1200 Hz, 400ms |

## Localization

Full bilingual support: English (en) and Vietnamese (vi). All user-facing strings in `src/lib/locales/*.json`. Language persisted in `localStorage`.

### Key Namespaces
- `banner.*` — affordance gate warnings
- `migration.*` — v2 progress-reset modal
- `gameOver.*` — run-complete / bittersweet end
- `throw.*` — throw-mode hints
- `mechanics.*` — guard/mechanic ARIA labels and display names
- `level{N}Story` — per-level intro/foreshadowing text

## Persistence

- **Progress**: `localStorage` key `nntv-progress` — `{ maxLevel, completedLevels[], version }`
- **Language**: `localStorage` key `nntv-language` — `"en"` or `"vi"`
- Version mismatch triggers the migration modal and resets progress to v2 baseline
