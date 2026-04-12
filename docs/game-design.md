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
- Grid sizes: 6x6 → 10x10 as difficulty increases

## Guard Types

| Type | Color | Shape | Behavior |
|------|-------|-------|----------|
| Static | Red | Circle | Lights fixed adjacent cells every turn |
| Rotating | Blue | Circle + direction line | Rotates beam 90° clockwise each turn; 2-cell range; stopped by walls; reflects off mirrors |
| Blinking | Yellow | Circle (dims when off) | Toggles lights on/off each turn; lights fixed cells when "on" |
| Patrolling | Purple | Circle + direction line | Moves along predefined path; lights front + right cells relative to facing |
| Mirror | Green | Diamond (rotated square) | Stationary; redirects rotating guard beams 90° (configurable cw/ccw); max 3 bounces |

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
| 1: The Outskirts | 1-2 | Garden | 6x6 | Movement basics, first static guard |
| 2: The Vegetable Garden | 3-4 | Garden/Walls | 7x7 | Walls as shields, first rotating guard |
| 3: The Fortress | 5-6 | Fortress | 7x7, 8x8 | First blinking guard, timing puzzles |
| 4: The Underground | 7-8 | Tunnels | 8x8 | First patrolling guard, dual patrols |
| 5: The Royal Palace | 9-11 | Palace | 8x8, 9x9 | Combinations, decoy paths, mirrors |
| 6: The Princess Chamber | 12 | Final | 10x10 | Escalating detection (unsolvable) |

### Level-by-Level Specification

**Level 1 — Garden Path** (6x6, 0 guards)
- Tutorial: movement only. Walls block some paths. No danger.
- Teaches: arrow keys, goal cell, walls.

**Level 2 — The Watchtower** (6x6, 1 static guard)
- First guard encounter. Static guard lights 4 adjacent cells.
- Teaches: lit cells = danger, plan around fixed obstacles.

**Level 3 — Vegetable Patrol** (7x7, 2 static guards)
- Multiple guards create overlapping danger zones.
- Teaches: navigating between multiple light sources.

**Level 4 — The Searchlight** (7x7, 1 rotating guard)
- Rotating guard enclosed in wall box so player can safely observe its pattern.
- Teaches: rotating beam cycles every 4 turns, timing moves.

**Level 5 — Fortress Gate** (7x7, 1 blinking guard)
- Blinking guard toggles on/off. Safe passage on "off" turns.
- Teaches: counting turns, parity-based movement.

**Level 6 — The Flickering Corridor** (8x8, 1 blinking + 2 static)
- Must time passage through blinking zone while avoiding static lights.
- Teaches: combining timing with spatial awareness.

**Level 7 — The Underground Passage** (8x8, 1 patrolling guard)
- Patrolling guard moves in a square loop inside a walled corridor.
- Teaches: predicting patrol path, front+right light pattern.

**Level 8 — The Gauntlet** (8x8, 2 patrolling guards)
- Two patrols with interlocking back-and-forth paths.
- Teaches: weaving between multiple moving threats.

**Level 9 — The Decoy Path** (8x8, 1 rotating + 1 blinking + 1 static)
- Two visible routes: short (obvious) and long (safe). Short route becomes deadly when guard cycles synchronize around turn 6.
- Teaches: observation beats impulse; not every shortcut is safe.

**Level 10 — Hall of Mirrors** (8x8, 2 rotating + 2 mirror)
- Rotating guard beams bounce off mirrors, creating reflected danger zones.
- Teaches: predicting reflected beam paths.

**Level 11 — The Throne Room** (9x9, 1 static + 1 rotating + 1 blinking + 1 patrolling)
- All guard types combined. Three horizontal wall rows create a zigzag path with narrow gaps.
- Teaches: mastery of all mechanics simultaneously.

**Level 12 — The Princess Chamber** (10x10, 1 static + 1 rotating + 1 blinking + 2 patrolling)
- **UNSOLVABLE BY DESIGN.** The level layout appears normal with multiple viable paths.
- **Hidden mechanic**: When player reaches Manhattan distance ≤ 4 from goal (9,9), the princess "senses" the player. Light radiates outward from the goal one ring per turn (Manhattan distance). The expanding wave is unstoppable — it will always catch the player before they reach the goal.
- **Narrative payoff**: Message appears: *"The Carrot Princess senses your presence! A wave of light radiates outward... Run!"* Then detection → game over screen with: *"Perhaps some rescues were never meant to be..."*

### Level Design Constraints
- Player always starts at (0, 0)
- Goal always at (rows-1, cols-1) — bottom-right corner
- Max 8 guards per level
- Every level 1-11 must have at least one valid path from start to goal
- Walls should create interesting routing decisions, not dead ends
- Each new mechanic gets a solo introduction level before combining

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
