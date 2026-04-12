# Phase 1: Scaffold Svelte 5 Project

**Priority:** Critical | **Status:** pending | **Effort:** Small

## Overview
Set up a fresh Svelte 5 + Vite project structure alongside existing code. Replace Phaser dependency with Svelte.

## Steps

1. Remove Phaser and related deps from `package.json`
2. Install Svelte 5 + vite-plugin-svelte
   ```bash
   npm install svelte && npm install -D @sveltejs/vite-plugin-svelte
   ```
3. Replace Vite config files (`vite/config.dev.mjs`, `vite/config.prod.mjs`) with single `vite.config.js` using svelte plugin
4. Create directory structure:
   ```
   src/lib/          # Pure JS game logic
   src/lib/locales/  # Locale JSON files
   src/lib/levels/   # Level data
   src/lib/game/     # Game logic classes
   src/components/   # Reusable Svelte components
   src/scenes/       # Scene components
   src/styles/       # CSS
   ```
5. Create `src/main.js` — mount Svelte app to `#app`
6. Create minimal `src/App.svelte` — renders "Hello NNTV" placeholder
7. Create `src/styles/theme.css` — port color/font constants from `theme.js` as CSS variables
8. Update `index.html` — remove Phaser-specific meta, keep basic structure
9. Update `package.json` scripts to use new vite config
10. Verify `npm run dev` serves the placeholder app

## Files to Create
- `vite.config.js`
- `src/main.js` (replace existing)
- `src/App.svelte`
- `src/styles/theme.css`

## Files to Delete
- `vite/config.dev.mjs`
- `vite/config.prod.mjs`
- `vite/` directory
- `log.js`
- `src/game/theme.js`

## Success Criteria
- `npm run dev` opens browser with "Hello NNTV"
- `npm run build` produces working dist/
- Zero Phaser imports remain
- CSS variables available globally
