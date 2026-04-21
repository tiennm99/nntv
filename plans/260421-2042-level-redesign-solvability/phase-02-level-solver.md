# Phase 2: Level Solver (BFS)

## Context
- Brainstorm: `plans/reports/brainstorm-260421-2042-level-redesign-solvability.md` §4
- Existing engine: `src/lib/game/grid-system.js`, `guards.js`, `turn-manager.js`, `player.js`

## Overview
- **Priority:** CRITICAL — blocks Phase 3 (tests) and all redesigns.
- **Status:** pending
- Pure-JS BFS solver that replays the real turn simulation to prove reachability.

## Key Insights
- **Must import guard AI from `guards.js`** — do NOT reimplement, or solver disagrees with runtime.
- Chaser is stateful → include positions in state key.
- Mirror + rotating beams are pure function of rotating direction + mirror positions → not part of state key (recomputed each turn).
- Cycle length = `LCM(4 [rotating], 2 [blinking], patrol_path_lengths...)`. Typical 4–24.
- L12 expanding-wave mechanic lives in `princess-mechanic.js` — solver must hook in `waveRadius` as state dim.

## Requirements
- Function `solveLevel(levelDef, { maxStates = 10_000_000 } = {})` → `{ solvable: boolean, path?: string[], states_explored: number }`.
- `path` is array of actions: `'up' | 'down' | 'left' | 'right' | 'wait'`.
- BFS guarantees shortest path.
- Hard cap on state count; returns `solvable: false, reason: 'budget_exhausted'` if exceeded.
- Returns `solvable: false, reason: 'no_path'` if BFS completes without reaching goal.

## Architecture

State key:
```
key = `${pRow},${pCow}|${chaserPositions.map(c => c.row+','+c.col).join(';')}|${turn % cycle}|${waveRadius ?? 0}`
```

Per step:
1. Apply action (move or wait); validate against walls + bounds.
2. Run `turnManager.nextTurn()` equivalent on a cloned grid + guards.
3. If player cell is lit after guard update → prune.
4. If player at goal → return path.
5. Enqueue new state if unseen.

## Related Files
- **Create:** `src/lib/game/level-solver.js` (main BFS + state cloning helpers)
- **Create:** `src/lib/game/level-solver.test.js` (unit tests for solver itself)
- **Read for context:** `src/lib/game/guards.js`, `turn-manager.js`, `grid-system.js`, `princess-mechanic.js`

## Implementation Steps
1. Extract or reuse guard instantiation from `level-manager.js` so solver can build guards from a level def.
2. Write `cloneState(grid, guards, player)` — deep copies cells, guard positions, player.
3. Write `stateKey(player, guards, turn, cycle, waveRadius)`.
4. Write `computeCycle(level)` → LCM of per-guard periods.
5. Implement BFS loop with visited Set and state budget.
6. Hook expanding-wave: include `waveRadius` in state when level has `isFinalLevel` + princess mechanic.
7. Return `{ solvable, path, states_explored, par }`.

## Todo List
- [ ] Create `level-solver.js` scaffolding + exports
- [ ] Implement state cloning helpers
- [ ] Implement `computeCycle`
- [ ] Implement BFS core loop with state budget
- [ ] Wire chaser positions into state key
- [ ] Wire princess-mechanic `waveRadius` into state key
- [ ] Unit tests: toy 3x3 level (trivial solve), 4x4 blocked level (no path), cycle computation
- [ ] `npm test` passes
- [ ] Solver finishes L1 in <5s; L11 in <60s on dev machine

## Success Criteria
- Solver correctly solves L1 (current) returning a path ≤ par.
- Solver returns `solvable: false` for current L2 (matches known bug).
- Solver returns `solvable: false` for current L12 (preserves invariant).
- Unit tests pass.

## Risk Assessment
- **Risk:** State explosion on 12x12 + 2 chasers. **Mitigation:** profile; if >10M states, tighten cycle (shorter patrol paths) or add heuristic dedup (e.g., ignore chaser when >N cells away).
- **Risk:** Chaser simulation non-deterministic (random tiebreak in pathfinding). **Mitigation:** ensure `guards.js` chaser AI is deterministic; if not, make it so (sorted tiebreak).

## Security Considerations
N/A — pure compute in test harness.

## Next Steps
Phase 3 writes the Vitest suite using this solver.
