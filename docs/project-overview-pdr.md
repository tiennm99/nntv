# Night Ninja: Twilight Voyage - Project Overview & PDR

## Project Overview

**Night Ninja: Twilight Voyage (NNTV)** is a turn-based stealth puzzle browser game where players control a ninja rabbit navigating grid-based levels to rescue the Carrot Princess from the Vegetable Kingdom.

### Core Concept
- Turn-based grid movement with real-time lighting detection
- Multiple guard AI types with distinct behaviors
- Progressive difficulty across 12 levels
- Bilingual support (English/Vietnamese)

### Target Audience
- Casual puzzle game players (10+)
- Fans of stealth mechanics and logic puzzles
- Browser game enthusiasts

### Platform
- Web browser (desktop, responsive)
- Technology: Phaser 3.88.2 + Vite 6.3.6
- Languages: Vanilla JavaScript (ES modules)

## Product Development Requirements

### Functional Requirements

| Requirement | Description | Status |
|---|---|---|
| Grid-based Movement | Player moves one cell per turn via arrow keys or mouse click | Complete |
| Guard AI System | Four distinct guard types (Static, Rotating, Blinking, Patrolling) | Complete |
| Detection System | Players lose a life when stepping on lit cells | Complete |
| Level Progression | 12 difficulty-scaled levels with persistent progress tracking | Complete |
| Win Condition | Reach goal cell to advance; complete all 12 levels to win | Complete |
| Lives System | 3 lives per play session; game over at zero lives | Complete |

### Non-Functional Requirements

| Requirement | Description | Status |
|---|---|---|
| Localization | English and Vietnamese via localStorage persistence | Complete |
| UI/UX Consistency | Centralized theme (colors, fonts, button styles) | Complete |
| Asset Management | Vite module imports for sprites and static assets | Complete |
| Performance | 60 FPS gameplay on modern browsers (Phaser default) | Complete |
| Browser Support | Phaser AUTO type (Canvas/WebGL auto-detection) | Complete |

### User Interface Components

- **Main Menu**: Start game, settings, guide
- **Level Select**: View unlocked levels, track progress
- **Game HUD**: Current level, lives remaining, turn count
- **Settings Panel**: Language toggle (EN/VI)
- **Guide/Instructions**: Game rules and controls
- **Game Over Screen**: Retry level or return to menu

### Game Mechanics

**Turn Cycle:**
1. Player executes move (arrow keys/mouse)
2. Grid updates player position
3. Guards execute turn actions (rotate, blink, patrol)
4. Lighting system recalculates lit cells
5. Detection check: if player on lit cell, lose life + restart level
6. Advance to goal: level complete, unlock next level

**Guard Behaviors:**
- **Static**: Lights fixed adjacent cells every turn
- **Rotating**: Rotates light direction 90° each turn
- **Blinking**: Toggles lights on/off each turn
- **Patrolling**: Moves along predefined path, lights adjacent cells
- **Level 12 Special**: Princess detection at distance 2, full map illuminate

### Success Metrics

- All 12 levels completable without game crashes
- Turn-based mechanics execute without delay
- No memory leaks during 30+ minute gameplay sessions
- UI responsive to all input methods (keyboard, mouse, touch)
- Localization string coverage >= 95%

### Technical Constraints

- Vanilla JavaScript only (no frameworks beyond Phaser)
- Grid size capped at 10x10 for performance
- Max 8 guards per level (lighting system performance)
- Phaser 3.x compatibility required
- ES modules only (no CommonJS)

## Project Status

**Current Version:** 0.0.1  
**Repository:** GitHub (private)  
**Last Updated:** 2026-04-12

All core gameplay features implemented and functional. Project ready for content expansion and quality assurance testing.
