# Phase 6: Polish + Verify

**Priority:** High | **Status:** pending | **Effort:** Small

## Overview
Final pass — visual polish, cleanup old Phaser code, update docs, verify all 12 levels.

## Steps

1. **Delete old Phaser code**
   - Remove entire `src/game/` directory
   - Remove `vite/` directory
   - Remove `log.js`
   - Remove `public/style.css` (styles now in Svelte components + theme.css)
   - Remove `phaser` from package.json dependencies
   - Remove `terser` from devDependencies (Vite handles minification)
   - Run `npm install` to clean lockfile

2. **Visual polish**
   - Verify dark theme renders correctly on all scenes
   - Test responsive scaling (Scale.FIT equivalent via CSS `max-width` + `aspect-ratio`)
   - Ensure grid is centered on all level sizes (6x6 through 10x10)
   - Test direction indicators on rotating/patrolling guards
   - Verify blinking guard color toggle

3. **Test all 12 levels**
   - Level 1: move freely, reach goal
   - Levels 2-5: static guard lit cells block correct positions
   - Level 6: rotating guard beam sweeps and blocks cells
   - Levels 7-8: mixed guard interactions
   - Level 9: blinking guard toggles on/off
   - Level 10: patrolling guard moves along path
   - Level 11: all 4 guard types simultaneously
   - Level 12: approach goal → entire map lights up (unbeatable)

4. **Test game flows**
   - Lives system: lose 3 lives → game over screen
   - Level progression: complete level → intro → next level
   - Level select: locked/unlocked/completed states correct
   - Progress persistence: refresh browser, progress retained
   - Language switch: EN ↔ VI updates all text
   - Pause menu: resume, restart, main menu all work

5. **Update docs**
   - Update `docs/system-architecture.md` — Svelte 5 architecture
   - Update `docs/codebase-summary.md` — new file listing
   - Update `docs/code-standards.md` — Svelte conventions
   - Update `README.md` — remove Phaser references, add Svelte info

6. **Build verification**
   - `npm run build` produces working dist/
   - Serve dist/ locally, test full game
   - Check bundle size (target: <50KB app code, down from ~1MB with Phaser)

## Success Criteria
- Zero Phaser code remains
- All 12 levels playable with correct guard behavior
- Level 12 secret mechanic works
- Bundle size < 50KB (excluding assets)
- Docs updated to reflect new stack
