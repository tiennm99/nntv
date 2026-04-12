# Phase 3: Build Game Board + Sprite Components

**Priority:** Critical | **Status:** pending | **Effort:** Medium

## Overview
Create Svelte components that render the game grid, player, and guards using HTML/CSS instead of Phaser canvas.

## Steps

1. **Button.svelte** — reusable styled button
   - Props: `text`, `onclick`, `small` (boolean for compact variant)
   - Styled with CSS variables from theme.css
   - Hover/active states via CSS

2. **GameBoard.svelte** — renders the grid
   - Props: `grid` (2D array of cell states), `rows`, `cols`, `cellSize`
   - CSS Grid layout: `grid-template-columns: repeat(cols, cellSize)`
   - Each cell is a `<div>` with class based on state: `.wall`, `.goal`, `.lit`, `.empty`
   - Click handler on cells for tap-to-move (emits `oncellclick` with row, col)
   - Cell colors from CSS variables

3. **PlayerSprite.svelte** — renders the player
   - Props: `row`, `col`, `cellSize`, `gridOffset`
   - Positioned absolutely over the grid
   - CSS `transition: top 100ms, left 100ms` for smooth movement (replaces Phaser tweens)
   - Black circle via `border-radius: 50%`

4. **GuardSprite.svelte** — renders a guard
   - Props: `guard` object `{ row, col, type, direction, isOn }`
   - Props: `cellSize`, `gridOffset`
   - Positioned absolutely over the grid
   - Circle colored by type (CSS class: `.guard-static`, `.guard-rotating`, etc.)
   - Direction indicator for rotating/patrolling: rotated CSS triangle or line
   - Blinking guard dim state: reduced opacity via class toggle

5. **GameHud.svelte** — top HUD bar
   - Props: `lives`, `level`, `turns`
   - Events: `onpause`, `onmenu`
   - Fixed position, not part of game board
   - Uses Button.svelte for pause/menu

6. **DetectionPopup.svelte** — detection overlay
   - Props: `visible`
   - Events: `onplayagain`
   - Dark overlay with centered message + button
   - Uses `transition:fade`

7. **PauseMenu.svelte** — pause overlay
   - Props: `visible`
   - Events: `onresume`, `onrestart`, `onmainmenu`
   - Dark overlay with 3 buttons
   - Uses `transition:fade`

## Rendering Strategy

```
┌─ GameBoard.svelte (CSS Grid) ─────────┐
│ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐       │
│ │  │ │  │ │  │ │  │ │  │ │  │  ...    │
│ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘       │
│   (each cell = div with bg color)     │
│                                        │
│   PlayerSprite (absolute positioned)   │
│   GuardSprite × N (absolute positioned)│
└────────────────────────────────────────┘
```

## CSS Class Map

| Game State | CSS Class | Color Variable |
|---|---|---|
| Empty cell | `.cell` | `--grid-empty` |
| Wall | `.cell.wall` | `--grid-wall` |
| Goal | `.cell.goal` | `--grid-goal` |
| Lit | `.cell.lit` | `--grid-lit` |
| Static guard | `.guard.static` | `--guard-static` |
| Rotating guard | `.guard.rotating` | `--guard-rotating` |
| Blinking guard (on) | `.guard.blinking` | `--guard-blinking` |
| Blinking guard (off) | `.guard.blinking.off` | `--guard-blinking-off` |
| Patrolling guard | `.guard.patrolling` | `--guard-patrolling` |

## Success Criteria
- GameBoard renders correct grid for any level (6x6 through 10x10)
- Player circle moves smoothly with CSS transitions
- Guards display correct colors and direction indicators
- All overlays (detection, pause) fade in/out
- Components accept plain JS data — no Phaser objects
