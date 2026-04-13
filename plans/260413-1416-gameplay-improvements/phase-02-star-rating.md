## Phase 2: Star Rating + Par Moves

**Priority:** P1 | **Status:** Pending | **Effort:** 2h

### Overview

Each level gets a `parMoves` value. On completion, show 1-3 star rating.
Persist best stars + best moves in localStorage. Display stars on level select.

### Data Flow

```
Level complete → turnManager.turnCount vs level.parMoves → star rating
  → completeLevel(levelNum, totalLevels, moves) → localStorage update
  → LevelSelect reads stars from progress
```

### Star Calculation

| Condition | Stars |
|-----------|-------|
| moves <= parMoves | 3 |
| moves <= parMoves + 3 | 2 |
| completed | 1 |

### Files to Modify

#### 1. `src/lib/levels/levels.js`
- [ ] Add `parMoves` field to each level definition
- [ ] Placeholder values (will be finalized in Phase 3 after redesign):
  - L1: 10, L2: 12, L3: 14, L4: 14, L5: 14, L6: 16
  - L7: 16, L8: 18, L9: 18, L10: 20, L11: 22, L12: 99 (unbeatable)

#### 2. `src/lib/progress.js`
- [ ] Extend schema: add `levelStars: {}` and `levelBestMoves: {}` to DEFAULT_PROGRESS
- [ ] `getProgress()`: merge missing keys for backwards compat
- [ ] Update `completeLevel(levelNum, totalLevels, moves, parMoves)`:
  - Calculate stars
  - Store best stars (only if better than existing)
  - Store best moves (only if fewer than existing)
  - Return `{ ...progress, stars }` so caller can display

#### 3. `src/scenes/Game.svelte`
- [ ] Import `LEVELS` to access `parMoves` for current level
- [ ] Pass `turnManager.turnCount` and `parMoves` to `completeLevel()`
- [ ] After level complete, show star rating overlay before navigating
- [ ] Add `LevelComplete` popup component (inline or separate small component)
  - Shows 1-3 stars with animation
  - Shows move count vs par
  - "Next Level" button

#### 4. `src/scenes/LevelSelect.svelte`
- [ ] Read `progress.levelStars` in addition to `completedLevels`
- [ ] Replace checkmark with star display (1-3 stars shown as filled/empty)
- [ ] Show best move count under level number

#### 5. `src/components/GameHud.svelte`
- [ ] No changes needed — already shows turn count

### localStorage Schema (backwards compatible)

```js
// Old format still works — missing keys get defaults
{
  maxLevel: 5,
  completedLevels: [1, 2, 3, 4],
  // NEW — absent in old saves, defaults to {}
  levelStars: { "1": 3, "2": 2, "3": 1 },
  levelBestMoves: { "1": 8, "2": 14, "3": 20 }
}
```

### Edge Cases

- Old localStorage without `levelStars`/`levelBestMoves` → defaults to `{}`
- Level 12 unbeatable → `parMoves: 99` never matters
- Player completes level with worse score → keep existing best
- `completeLevel` called with no moves param (old code path) → skip star calc

### Success Criteria

- Star rating appears on level complete
- Best stars persist in localStorage
- Level select shows stars per level
- Old saves don't break (backwards compat)

### Rollback

Revert commit. Old localStorage data unaffected (new keys simply disappear).
