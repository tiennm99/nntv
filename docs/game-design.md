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

### Foreshadowing (Levels 10-12)
- **Level 10**: *"They say the Princess can sense any living thing nearby..."*
- **Level 11**: *"No one who entered the chamber beyond has returned. Not because of guards..."*
- **Level 12**: *"The air itself feels watchful... she already knows you're here."*

## Core Mechanics

### Turn System
1. Player moves one cell (arrow keys / WASD / click adjacent cell)
2. All guards execute their turn action simultaneously
3. Lighting recalculates
4. Detection check: player on lit cell = lose 1 life, restart level
5. Goal check (before guards): reach green cell = level complete

### Lives
- 3 lives per playthrough (shared across all levels)
- Lose a life on detection → restart current level
- 0 lives = game over

### Grid
- Cells: empty (dark/safe), wall (impassable), goal (green), lit (yellow/dangerous)
- Player starts at top-left (0,0), goal at bottom-right corner
- Grid sizes: 8x8 → 13x13 as difficulty increases (camera-follow viewport on large arenas)

## Guard Types

| Type | Color | Shape | Behavior |
|------|-------|-------|----------|
| Static | Red | Circle | Lights fixed adjacent cells every turn |
| Rotating | Blue | Circle + direction line | Rotates beam 90° clockwise each turn; 2-cell range; stopped by walls; reflects off mirrors |
| Blinking | Yellow | Circle (dims when off) | Toggles lights on/off each turn; lights fixed cells when "on" |
| Patrolling | Purple | Circle + direction line | Moves along predefined path; lights front + right cells relative to facing |
| Mirror | Green | Diamond (rotated square) | Stationary; redirects rotating guard beams 90° (configurable cw/ccw); max 3 bounces |
| Chaser | Orange | Circle + direction line | BFS pathfinding toward player when within detectionRadius; returns home otherwise |

### Guard Rules
- Guards light their own cell (visible to player)
- All guards act after player moves (simultaneous)
- Rotating beam stops at walls and grid boundaries
- Mirror only affects rotating guard beams (not static/blinking lit cells)
- Patrolling guards reverse direction at path endpoints (or loop if circular path)

## Level Design Requirements

**Exactly 12 levels. Levels 1-11 MUST be solvable. Level 12 MUST NOT be solvable.**

### Act Structure

| Act | Levels | Theme | Grid | Mechanic Focus |
|-----|--------|-------|------|----------------|
| 1: The Outskirts | 1-2 | Garden | 8x8 | Movement + static guards |
| 2: The Vegetable Garden | 3-4 | Garden/Walls | 9x9 | First rotating + blinking guards |
| 3: The Fortress | 5-6 | Fortress | 10x10 | First patrolling guard, timing + movement |
| 4: The Underground | 7-8 | Tunnels | 11x11 | First mirror guard, beam redirection |
| 5: The Royal Palace | 9-10 | Palace | 12x12 | First chaser guard, perimeter vs ambush |
| 6: The Princess Chamber | 11-12 | Palace/Final | 12x12, 13x13 | All types combined; L12 unsolvable |

### Level-by-Level Specification

**Level 1 — Garden Path** (8x8, 0 guards)
- Tutorial: movement only. Walls route the player through a winding corridor. No danger.

**Level 2 — The Watchtower** (8x8, 3 static guards)
- First guard encounter. Three static guards with two viable paths around them.
- Teaches: lit cells = danger, plan around fixed obstacles.

**Level 3 — Vegetable Patrol** (9x9, 3 static + 1 rotating)
- Rotating guard introduced in the middle of the map; static guards flank the edges.
- Teaches: rotating beam cycles every 4 turns, read direction indicator.

**Level 4 — The Searchlight** (9x9, rotating + blinking + 3 static)
- Blinking guard introduced. Solution requires at least one `wait` action.
- Teaches: counting turns, parity-based movement.

**Level 5 — Fortress Gate** (10x10, static + rotating + blinking + static + static + patrolling)
- Patrolling guard introduced on a short circular path.
- Teaches: predicting patrol path, front+right light pattern.

**Level 6 — The Flickering Corridor** (10x10, 2 blinking + rotating + 2 patrolling + static + static)
- Two patrollers with interlocking routes.
- Teaches: weaving between multiple moving threats.

**Level 7 — The Underground Passage** (11x11, rotating + mirror + blinking + patrolling + 3 static)
- Mirror guard introduced; the rotating beam deflects off it.
- Teaches: predicting reflected beam paths.

**Level 8 — The Gauntlet** (11x11, 2 rotating + 2 mirrors + 2 patrolling + blinking + static)
- Two mirrors form a crossfire pattern.
- Teaches: mastery of reflected beams in open arenas.

**Level 9 — The Decoy Path** (12x12, chaser + rotating + 2 blinking + 2 static + patrolling + chaser-less guard)
- Chaser guard introduced, ambushing the central shortcut.
- Teaches: lure-and-retreat; perimeter path beats the tempting short route.

**Level 10 — Hall of Mirrors** (12x12, 2 rotating + 3 mirrors + blinking + static + patrolling + chaser)
- Mirrors create a crossfire with a hunting chaser.
- Teaches: navigating reflected beams while evading a pursuer.

**Level 11 — The Throne Room** (12x12, ALL 6 TYPES, 9 guards total)
- Climax level: at least one of each guard type.
- Teaches: mastery of all mechanics simultaneously.

**Level 12 — The Princess Chamber** (13x13, 10 guards + expanding wave)
- **UNSOLVABLE BY DESIGN.** See memory `project_level12_unsolvable.md`.
- **Hidden mechanic**: When player reaches Manhattan distance ≤ 4 from goal, the princess "senses" the player. Light radiates outward from the goal one ring per turn. The expanding wave is unstoppable.
- **Easter egg**: `window.__nntvDev.teleport(12, 12)` from the browser console teleports the player to the goal and fires the normal win flow. Hidden from README and in-game UI.
- **Narrative payoff**: *"The Carrot Princess senses your presence! A wave of light radiates outward... Run!"* Then detection → game over screen with: *"Perhaps some rescues were never meant to be..."*

### Level Design Constraints
- Player always starts at (0, 0)
- Goal always at (rows-1, cols-1) — bottom-right corner
- Max 10 guards per level
- Every level 1-11 must have at least one valid path from start to goal (solver-verified)
- No guard's `litCells` may overlap a wall cell (solver lints this)
- Walls should create interesting routing decisions, not dead ends
- Each new mechanic gets a solo introduction level before combining
- All `levels.js` edits must pass `npm run test:solvability`

## Visual Design

Minimalist geometric art — no sprites or animations required.

| Element | Visual | CSS Variable |
|---------|--------|-------------|
| Empty cell | Dark blue-gray square | `--grid-empty` |
| Wall | Gray square | `--grid-wall` |
| Goal | Green square | `--grid-goal` |
| Lit cell | Yellow square | `--grid-lit` |
| Player | Black circle | `--player-color` |
| Static guard | Red circle | `--guard-static` |
| Rotating guard | Blue circle + direction line | `--guard-rotating` |
| Blinking guard | Yellow circle (dims when off) | `--guard-blinking` |
| Patrolling guard | Purple circle + direction line | `--guard-patrolling` |
| Mirror guard | Green diamond (rotated square) | `--guard-mirror` |

## Controls

| Input | Action |
|-------|--------|
| Arrow keys | Move up/down/left/right |
| W/A/S/D | Alternative movement |
| Click adjacent cell | Move to that cell |
| Escape / Pause button | Pause menu |

## UI Screens

1. **Main Menu**: Start Game, Level Select, Settings, Guide
2. **Story Intro**: Scrolling text narrative (skippable)
3. **Level Intro**: Level name + story text + Continue button
4. **Game**: Board + HUD (level, lives, turns) + pause
5. **Detection Popup**: "Detected!" + Play Again button
6. **Pause Menu**: Resume / Restart / Main Menu
7. **Game Over**: Retry or Main Menu (special message for level 12)
8. **Level Select**: 4x3 grid, locked/unlocked/completed states
9. **Settings**: Language toggle (EN/VI)
10. **Guide**: Objectives, controls, enemy type descriptions

## Localization

Full bilingual support: English and Vietnamese. All user-facing strings stored in JSON locale files. Language persisted in localStorage.

## Persistence

- **Progress**: `localStorage` key `nntv-progress` — tracks `maxLevel` (highest unlocked) and `completedLevels[]`
- **Language**: `localStorage` key `nntv-language` — `"en"` or `"vi"`
