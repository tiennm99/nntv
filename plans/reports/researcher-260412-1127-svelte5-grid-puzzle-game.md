# Svelte 5 Research: Grid Puzzle Game Rewrite

**Status:** Complete | **Focus:** Runes, setup, transitions, grid patterns, state management  
**Date:** 2026-04-12 | **Scope:** Actionable patterns for turn-based grid game

---

## 1. Svelte 5 Runes Syntax — Reactive State

### Core Pattern: $state for Grid
Runes are compiler keywords (not functions), prefixed with `$`. Use `$state` to declare reactive cell data.

**Grid state pattern (array of cells):**
```javascript
let grid = $state([
  { id: 0, type: 'wall' },
  { id: 1, type: 'floor' },
  // ... 16+ cells
]);
```

**For object-based grid:**
```javascript
let gridMap = $state(new Map([
  ['0,0', { type: 'wall', solved: false }],
  ['0,1', { type: 'puzzle', value: 5 }],
]));
```

### $derived — Computed Grid State
Auto-updates when dependencies change (memoized). Zero side-effects allowed.

```javascript
let solvedCount = $derived(grid.filter(c => c.solved).length);
let isWon = $derived(solvedCount === grid.length);
let gridDisplay = $derived(grid.map(c => c.type)); // safe memo
```

### $effect — Side Effects (Subscriptions, DOM, Analytics)
Runs after DOM update. Return cleanup function for teardown.

```javascript
$effect(() => {
  console.log('Game state changed:', grid);
  localStorage.setItem('game', JSON.stringify(grid));
});

$effect(() => {
  return () => console.log('Component unmounting'); // cleanup
});
```

### Key Gotchas
- Avoid mutations inside `$derived`: `$derived(count++)` **fails**.
- `$state` works outside `.svelte` files (in `.svelte.js` / `.svelte.ts`).
- Runes replace old `let x = 0; $: x = x + 1` reactive declarations.

---

## 2. Svelte 5 + Vite Setup

### Recommended: Use `sv` CLI (SvelteKit)
```bash
npx sv create my-puzzle-game
# Select: Svelte, TypeScript, Vitest, Prettier
cd my-puzzle-game
npm run dev
```

Scaffold includes: Vite (pre-configured), TypeScript, dev server at `localhost:5173`.

### Alternative: Bare Svelte + Vite
```bash
npm create vite@latest my-game -- --template svelte-ts
npm install
npm run dev
```

Simpler but misses SvelteKit's routing/build optimizations. **For a static SPA game, either works.**

### Vite Config (if bare Svelte)
`vite.config.ts` auto-includes `vite-plugin-svelte`. No manual config needed for basic setup.

---

## 3. Scene Transitions (Fade/Fly/Slide)

### Pattern: Conditional Scenes
```svelte
<script>
  import { fade, fly, slide } from 'svelte/transition';
  let currentScene = $state('intro');
</script>

{#if currentScene === 'intro'}
  <div transition:fade={{ duration: 300 }}>
    <h1>Intro Scene</h1>
    <button onclick={() => currentScene = 'game'}>Play</button>
  </div>
{:else if currentScene === 'game'}
  <div transition:fly={{ x: 100, duration: 400 }}>
    <!-- Game board here -->
  </div>
{:else if currentScene === 'win'}
  <div transition:slide={{ axis: 'y', duration: 600 }}>
    <h1>You Won!</h1>
  </div>
{/if}
```

### Available Transitions
| Name | Use | Params |
|------|-----|--------|
| `fade` | Opacity 0→1 | `duration`, `delay`, `easing` |
| `fly` | Position + opacity | `x`, `y`, `duration` |
| `slide` | Axis-based slide | `axis` ('x'/'y'), `duration` |
| `scale`, `blur` | Also available | config object |

### Bidirectional
`transition:` works both in and out. Reverses smoothly mid-animation if toggled.

---

## 4. CSS Grid for Game Board

### Reactive Grid Layout
```svelte
<script>
  let grid = $state(Array(16).fill(null).map((_, i) => ({
    id: i,
    row: Math.floor(i / 4),
    col: i % 4,
  })));
</script>

<div class="board">
  {#each grid as cell (cell.id)}
    <div class="cell" onclick={() => handleCellClick(cell.id)}>
      {cell.id}
    </div>
  {/each}
</div>

<style>
  .board {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    width: 320px;
  }
  .cell {
    aspect-ratio: 1;
    background: #e0e0e0;
    border-radius: 4px;
    cursor: pointer;
  }
</style>
```

### Performance Note
Svelte's fine-grained reactivity means updating a single cell **doesn't re-render all others**. Safe for responsive grids (6x6, 8x8).

---

## 5. State Management: Stores vs. Runes

### For Game Progress + Localization: Use Runes in `.svelte.js`

**gameState.svelte.js:**
```javascript
export const game = $state({
  level: 1,
  moves: 0,
  isWon: false,
  grid: [],
});

export const i18n = $state({
  lang: 'en',
  strings: { title: 'Puzzle Game', play: 'Play' },
});

export function resetLevel() {
  game.level = 1;
  game.moves = 0;
  game.isWon = false;
}
```

**App.svelte:**
```svelte
<script>
  import { game, i18n } from './gameState.svelte.js';
</script>

<h1>{i18n.strings.title}</h1>
<p>Level {game.level} • Moves: {game.moves}</p>
<button onclick={() => i18n.lang = 'es'}>Español</button>
```

### When to Use Stores (Deprecated Pattern)
Only for **async data streams** (polling, WebSocket). Most games don't need this.

### Why Runes > Stores
- No boilerplate (no `writable()`, `.subscribe()`).
- Works in plain `.js` files (shared logic).
- Memoization via `$derived`.

---

## 6. SvelteKit vs. Plain Svelte for Static Game

### Recommendation: **Use Plain Svelte + Vite**

| Criteria | Plain Svelte | SvelteKit |
|----------|--------------|-----------|
| **Setup time** | 2 min | 3 min |
| **Routing** | Manual | File-based (unnecessary) |
| **Build output** | Single HTML/JS | Server capable |
| **Static deploy** | ✅ Simpler | ✅ Needs adapter-static |
| **DevTools** | Vite only | Vite + SvelteKit CLI |
| **Scaling** | Hits limits ~2-3 scenes | Extensible |

### For a Static SPA Game
```bash
npm create vite@latest my-game -- --template svelte-ts
```

This is **KISS**. No file-based routing overhead, no server code, direct control.

### Only Use SvelteKit If
- Game needs **server-side scoring/leaderboards** (then use SvelteKit backend).
- Game will expand to **10+ pages** (use file-based routing).
- Team prefers **unified framework** across multiple projects.

---

## Implementation Checklist

### Phase 1: Setup
- [ ] `npm create vite@latest` (svelte-ts template)
- [ ] Replace Vite's default App.svelte with game component
- [ ] Verify `npm run dev` opens at localhost:5173

### Phase 2: Grid & State
- [ ] Create `gameState.svelte.js` with `$state(grid)`
- [ ] Build `GameBoard.svelte` with CSS Grid + `{#each grid}`
- [ ] Wire `$derived(isWon)` from grid state

### Phase 3: Interactions
- [ ] Add cell click handlers → update grid state
- [ ] Bind to `$effect` for persistence (localStorage)
- [ ] Test fine-grained reactivity (click cell, only that cell re-renders)

### Phase 4: Transitions
- [ ] Import `fade`, `fly`, `slide` from `svelte/transition`
- [ ] Wrap scenes in conditional blocks with `transition:` directives
- [ ] Test bidirectional transitions (scene switches)

### Phase 5: Deploy
- [ ] `npm run build` → outputs `dist/` (static)
- [ ] Upload `dist/` to any static host (Vercel, GitHub Pages, Netlify)

---

## Trade-offs & Adoption Risk

| Risk | Mitigation |
|------|-----------|
| Svelte 5 is new (2024+) | Use LTS minor versions; runes are stable now |
| Team unfamiliar with runes | Runes are **simpler** than Vue/React hooks; quick ramp |
| Grid performance at scale | Fine-grained reactivity handles 100+ cells easily |
| Transitions can stutter | Use `duration: 200–400ms`; test on target devices |

---

## Sources

- [Svelte Runes Documentation](https://svelte.dev/docs/svelte/what-are-runes)
- [Svelte Transitions](https://svelte.dev/docs/svelte/svelte-transition)
- [Svelte Stores](https://svelte.dev/docs/svelte/stores)
- [SvelteKit Single-Page Apps](https://svelte.dev/docs/kit/single-page-apps)
- [Getting Started](https://svelte.dev/docs/svelte/getting-started)
- [Mainmatter: Runes and Global State](https://mainmatter.com/blog/2025/03/11/global-state-in-svelte-5/)
- [Frontend Masters: Game Board Grid](https://frontendmasters.com/courses/svelte-v2/game-board-grid/)

---

## Unresolved Questions

- **WebSocket multiplayer?** Not covered; requires SvelteKit backend or third-party service.
- **Mobile touch events?** Standard DOM events work; no Svelte-specific guidance needed.
- **Save file encryption?** Depends on backend; out of scope for static game.
