## Phase 3: Level Redesign + Chaser Guard

**Priority:** P1 | **Status:** Pending | **Effort:** 3h

### Overview

Redesign existing 12 levels for more challenge. Add **Chaser guard** type.
Finalize `parMoves` values after redesign. Level 12 remains unbeatable.

### New Guard Type: ChaserGuard

**Behavior:** Dormant until player enters Manhattan distance <= `detectionRadius` (default 3).
Once triggered, moves 1 cell toward player's **last known position** each turn.
Lights its own cell + adjacent cell in movement direction. Returns to start if reaches
last known position and player not visible.

**Why Chaser over Sentry:** Chaser creates dynamic panic — player must change route.
Sentry is just a fancy static guard (cone vision = static pattern). Chaser adds genuine
reactive gameplay with minimal code.

#### Implementation in `src/lib/game/guards.js`

- [ ] Add `ChaserGuard` class extending `Guard`:
  ```
  Properties: detectionRadius, startRow, startCol, targetRow, targetCol,
              isChasing, lastKnownRow, lastKnownCol
  Methods:
    - onTurnChange(allGuards, player): check distance to player
      - If within radius and not blocked by wall: set isChasing, record lastKnownPos
      - If chasing: move 1 step toward lastKnownPos (prefer row then col)
      - If reached lastKnownPos and player not in radius: return to start
    - updateLight(): light own cell + 1 cell in facing direction
  ```
- [ ] Key: `onTurnChange` needs player reference — update signature

#### Turn Manager Change (`src/lib/game/turn-manager.js`)

- [ ] Pass `player` to `guard.onTurnChange(guards, player)` — non-breaking since
  existing guards ignore extra params

#### Level Manager Change (`src/lib/game/level-manager.js`)

- [ ] Add `case 'chaser'` to guard factory switch

#### Guard Sprite (`src/components/GuardSprite.svelte`)

- [ ] Add chaser visual (red-tinted sprite, or different emoji/icon)
- [ ] Show "alert" state when `isChasing` is true

### Level Redesign Principles

1. **Tighter corridors** — reduce open space, force specific paths
2. **More guards per level** — current levels are sparse
3. **Timing windows** — require waiting (Phase 1) for safe passage
4. **Chaser placement** — put chasers near obvious paths to force detours
5. **Level 12** — keep walls + guard placement, only verify light wave still covers all paths

### Level-by-Level Notes

- [ ] **L1-2** (tutorial): Keep simple but add 1 more wall each to reduce trivial paths
- [ ] **L3-4** (rotating intro): Add extra static guard, narrow corridors
- [ ] **L5-6** (blinking): Tighter timing — reduce safe windows from 2 turns to 1
- [ ] **L7-8** (patrolling): Add walls to force player into patrol paths, require waiting
- [ ] **L9** (decoy): Add chaser near the "obvious" short path — punishes rushing
- [ ] **L10** (mirrors): Add more mirror bounces, tighter spaces
- [ ] **L11** (throne room): Add chaser + extra patrolling guard
- [ ] **L12** (princess): DO NOT CHANGE core mechanic. May add 1-2 more guards in upper sections
- [ ] **Finalize parMoves** for each level after redesign (playtest manually)

### Edge Cases / Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Level becomes unsolvable | Medium | High | Playtest each level; keep at least 1 valid path |
| Chaser pathfinding hits wall | Medium | Medium | Simple Manhattan step; skip move if blocked by wall |
| Level 12 becomes beatable | Low | High | Verify: expanding light wave from (9,9) covers all reachable cells within player's max possible steps |
| ChaserGuard makes levels too hard | Medium | Low | Tune detectionRadius per level (2-4 range) |

### Success Criteria

- All levels 1-11 are solvable but require thought
- At least 3 levels benefit from wait action
- Chaser guard creates noticeable tension when triggered
- Level 12 remains provably unbeatable
- parMoves set to optimal-path length for each level

### Rollback

Revert commit restores old level definitions and removes ChaserGuard class.
