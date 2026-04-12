# Phase 4: Build Scene Components

**Priority:** High | **Status:** pending | **Effort:** Medium

## Overview
Replace all Phaser Scene classes with Svelte components. App.svelte acts as the scene router using reactive state + transitions.

## Steps

1. **App.svelte** — scene router
   - Module-level `$state` for `currentScene` and `sceneData`
   - `{#if currentScene === 'MainMenu'}` blocks for each scene
   - Each block wrapped in `transition:fade={{ duration: 300 }}`
   - Export `navigate(scene, data)` function for child components
   - Initialize with `currentScene = 'MainMenu'`

2. **MainMenu.svelte**
   - Starfield background (random positioned dots via `{#each}`)
   - Title, ninja icon, 4 buttons (Start, Level Select, Guide, Settings)
   - Buttons call `navigate('StoryIntro')` etc.

3. **StoryIntro.svelte**
   - Dark background, scrolling story text
   - CSS animation `@keyframes scroll` moves text upward
   - Skip button → navigates to LevelIntro
   - Auto-advance after scroll completes

4. **LevelIntro.svelte**
   - Props via sceneData: `{ level, lives }`
   - Shows level number, name (from levels.js), story text (from localization)
   - Continue button → navigates to Game

5. **LevelSelect.svelte**
   - Grid of 12 level buttons (CSS Grid, 4 columns)
   - Reads progress from `getProgress()`
   - Locked/unlocked/completed states via CSS classes
   - Checkmark on completed levels
   - Click → navigate to LevelIntro with level data

6. **GameOver.svelte**
   - Props via sceneData: `{ level, isLastLevel }`
   - Different message for final level vs normal game over
   - Try Again + Main Menu buttons

7. **Settings.svelte**
   - Language toggle (EN/VI)
   - Calls `setLanguage()` from localization.js
   - Re-renders text reactively via `$derived` on language

8. **Guide.svelte**
   - Scrollable content area (native CSS `overflow-y: auto`)
   - Sections: objectives, controls, enemy types
   - Back button

## Scene Navigation Pattern

```svelte
<!-- App.svelte -->
<script>
  let currentScene = $state('MainMenu');
  let sceneData = $state({});

  function navigate(scene, data = {}) {
    sceneData = data;
    currentScene = scene;
  }
</script>

{#if currentScene === 'MainMenu'}
  <div transition:fade>
    <MainMenu {navigate} />
  </div>
{:else if currentScene === 'Game'}
  <div transition:fade>
    <Game {navigate} level={sceneData.level} lives={sceneData.lives} />
  </div>
{/if}
```

## Success Criteria
- All 8 scenes render correctly
- Scene transitions fade smoothly
- Language switching updates all visible text
- Level select shows correct progress state
- Story intro scrolls and auto-advances
