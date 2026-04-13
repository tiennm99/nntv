# Night Ninja: Twilight Voyage - Project Overview & PDR

## Project Overview

**Night Ninja: Twilight Voyage (NNTV)** is a turn-based stealth puzzle browser game where players control a ninja rabbit navigating grid-based levels to rescue the Carrot Princess from the Vegetable Kingdom.

### Core Concept
- Turn-based grid movement with lighting-based detection
- 5 guard AI types with distinct behaviors
- Progressive difficulty across 12 levels in 6 acts
- Bilingual support (English/Vietnamese)
- Narrative twist ending with escalating detection mechanic

### Target Audience
- Casual puzzle game players (10+)
- Fans of stealth mechanics and logic puzzles
- Browser game enthusiasts

### Platform
- Web browser (desktop, responsive)
- Technology: Svelte 5 + Vite 6.x
- Languages: JavaScript (ES modules) + Svelte components

## Product Development Requirements

### Functional Requirements

| Requirement | Description | Status |
|---|---|---|
| Grid-based Movement | Player moves one cell per turn via arrow keys, WASD, cell click, or swipe | Complete |
| Guard AI System | 6 guard types (Static, Rotating, Blinking, Patrolling, Mirror, Chaser) | Complete |
| Mirror Reflection | Rotating guard beams bounce off mirror guards at 90 degrees | Complete |
| Detection System | Players lose a life when stepping on lit cells; visual feedback with cell flash + player shake | Complete |
| Chaser Guard | BFS pathfinding with detection radius; advanced AI for late-game difficulty | Complete |
| Undo/Redo System | Z/Y keys rewind/forward through up to 50 previous turns | Complete |
| Level Progression | 12 difficulty-scaled levels with localStorage progress tracking | Complete |
| Win Condition | Reach goal cell to advance; level 12 is unbeatable (narrative twist) | Complete |
| Lives System | 3 lives per play session; game over at zero lives | Complete |
| Escalating Detection | Level 12: light radiates outward from princess when player approaches | Complete |
| Mobile Touch Controls | Swipe gestures (up/down/left/right) for full mobile gameplay support | Complete |
| Audio Feedback | Web Audio API procedural sounds for moves, detection, level completion | Complete |

### Non-Functional Requirements

| Requirement | Description | Status |
|---|---|---|
| Localization | English and Vietnamese via localStorage persistence | Complete |
| UI/UX Consistency | CSS variables theme (colors, fonts, button styles) | Complete |
| Svelte 5 Reactivity | renderVersion counter pattern for class instance mutations | Complete |
| Performance | Lightweight Svelte 5 rendering, no heavy framework overhead | Complete |
| Browser Support | Modern browsers with ES module support | Complete |

### User Interface Components

- **Main Menu**: Start game, level select, settings, guide
- **Story Intro**: Scrolling narrative with skip option
- **Level Intro**: Level name, story text, continue button
- **Level Select**: Grid of level buttons with lock/complete states
- **Game HUD**: Current level, lives remaining, turn count
- **Game Board**: Grid cells with CSS transitions for smooth lighting changes
- **Controls Overlay**: "?" button reveals all keyboard/touch controls
- **Settings Panel**: Language toggle (EN/VI)
- **Guide**: Game rules, controls, enemy types, chaser/mirror guard descriptions
- **Detection Popup**: Retry prompt with visual feedback (cell flash, player shake)
- **Pause Menu**: Resume, restart, main menu
- **Game Over Screen**: Retry or return to menu
- **Button Component**: Reusable styled button with disabled state support

### Game Mechanics

**Turn Cycle:**
1. Player executes move (arrow keys / WASD / cell click)
2. Player position updates (validated against walls/bounds)
3. Guards execute turn actions (rotate, blink, patrol)
4. Lighting system recalculates lit cells
5. Detection check: if player on lit cell, lose life + restart level
6. Goal check (before guard update): level complete, unlock next

**Guard Behaviors:**
- **Static (red)**: Lights fixed adjacent cells every turn
- **Rotating (blue)**: Rotates light direction 90 degrees each turn, casts beam of 2 cells
- **Blinking (yellow)**: Toggles lights on/off each turn
- **Patrolling (purple)**: Moves along predefined path, lights front + right cells
- **Mirror (green)**: Redirects rotating guard beams 90 degrees (cw or ccw)
- **Chaser (cyan)**: Uses BFS pathfinding to chase player, lights all cells within detection radius
- **Level 12 Special**: Princess detection — light radiates from goal at distance 4, expanding 1 ring per turn

**Player Abilities:**
- **Movement**: Arrow keys, WASD, cell click, or swipe gestures (mobile)
- **Undo/Redo**: Z key to undo, Y key to redo (up to 50 turns)

### Level Progression (6 Acts)

| Act | Levels | Focus |
|-----|--------|-------|
| 1: Outskirts | 1-2 | Movement basics + static guards |
| 2: Garden | 3-4 | Walls as shields + rotating guards |
| 3: Fortress | 5-6 | Blinking guards + timing puzzles |
| 4: Underground | 7-8 | Patrolling guards + path prediction |
| 5: Palace | 9-11 | Combinations, decoy paths, mirror guards |
| 6: Chamber | 12 | Narrative twist with escalating detection |

### Success Metrics

- All 11 levels completable without game crashes (level 12 is intentionally unbeatable)
- Turn-based mechanics execute without delay
- No memory leaks during extended gameplay sessions
- UI responsive to all input methods (keyboard, mouse)
- Localization string coverage 100%

### Technical Constraints

- Svelte 5 runes mode (`$state`, `$derived`, `$props`)
- Class instances require `renderVersion` pattern for reactivity
- Grid size capped at 10x10
- Max 8 guards per level
- ES modules only

## Project Status

**Current Version:** 0.1.0
**Repository:** GitHub
**Last Updated:** 2026-04-12

All core gameplay features implemented. Svelte 5 rewrite complete with reactivity fix, mirror guard mechanic, redesigned level progression, and escalating final level twist.
