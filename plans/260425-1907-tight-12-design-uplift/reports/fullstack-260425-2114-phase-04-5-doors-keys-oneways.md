---
type: implementation
date: 2026-04-25
slug: phase-04-5-doors-keys-oneways
status: done
---

# Phase 04.5 — Engine Gap Close: Doors, Keys, One-Ways + L3/L5/L7 Redesign

## Files Modified

| File | Change |
|---|---|
| `src/lib/game/player.js` | Full rewrite: added `keysHeld` bitmask, `hasKey/addKey/getKeysHeld/setKeysHeld`, `capture/apply`, `moveTo(row,col,moveDir)` enforcing walls+doors+oneWays, key auto-collection on step |
| `src/lib/game/grid-system.js` | Added `getDoorSnapshot/applyDoorSnapshot`, `getKeySnapshot/applyKeySnapshot` |
| `src/lib/game/level-solver.js` | `captureState` now reads `player.getKeysHeld()` (not hardcoded 0); adds `kc` (key cells) and `dc` (door cells) to state; `applyState` restores all three; `stateKey` hashes `k`, `kc`, `dc`; inline movement loop replaced with `player.moveTo(nr, nc, moveDir)` so door/oneWay enforcement is inherited |
| `src/lib/levels/levels.js` | L3 reworked (one-way intro); L5 reworked (doors+keys intro); L7 reworked (mirror + door). L1/L2/L4/L6/L8/L9/L10/L11/L12 untouched |
| `src/lib/game/player.test.js` | 22 new test cases across 4 suites: door mechanics, one-way mechanics, key auto-collection, capture/apply round-trip |
| `src/lib/game/level-solver.test.js` | 7 new test cases: synthetic key+door solver, stateKey differentiation by keysHeld/keyCells, applyKeySnapshot round-trip, L3/L5/L7 structure assertions |

## Key/Door/One-Way Test Coverage

| Scenario | Test |
|---|---|
| Door blocked without key | `player.test.js` — blocks move into door when player does not hold the key |
| Door passable with matching key | `player.test.js` — allows move into door with matching key |
| Door cleared (opened) on entry | `player.test.js` — door is cleared after player passes through |
| Wrong key rejected | `player.test.js` — player with key A cannot pass door B |
| One-way rejects wrong direction | `player.test.js` — all 4 directions tested |
| One-way accepts correct direction | `player.test.js` — all 4 directions tested |
| Key auto-collected on step | `player.test.js` — auto-collects key, clears cell |
| Multi-key bitmask | `player.test.js` — holds keys 1+2, getKeysHeld()=0b11 |
| Key→door end-to-end | `player.test.js` — collect key then open door |
| capture/apply round-trips | `player.test.js` — 4 cases including missing field defaults |
| stateKey differentiates keysHeld | `level-solver.test.js` |
| stateKey differentiates remaining key cells | `level-solver.test.js` |
| applyKeySnapshot/getDoorSnapshot round-trip | `level-solver.test.js` |
| L3 has oneWays | `level-solver.test.js` |
| L5 has keys+doors | `level-solver.test.js` |
| L7 has key+door | `level-solver.test.js` |

## Solvability Performance Table (L3, L5, L7)

| Level | Name | States | Path | ms | parMoves | Keys Used |
|---|---|---|---|---|---|---|
| L3 | Vegetable Patrol | 53 | 18 | 4 | 22 | one-ways at steps 5+10 |
| L5 | Fortress Gate | 1574 | 30 | 77 | 30 | keysHeld=0b11 (both keys, both doors) |
| L7 | Underground Passage | 645 | 28 | 41 | 30 | keysHeld=1, key@step12, door@step20 |

All three levels verified: one-way tiles are on the BFS path (L3); both keys collected and both doors opened (L5); mirror chain traversed and door used (L7).

## Full Solvability Suite Results

| Level | States | Path | ms |
|---|---|---|---|
| L1 | 50 | 16 | 10 |
| L2 | 60 | 16 | 11 |
| L3 | 53 | 18 | 4 |
| L4 | 314 | 16 | 28 |
| L5 | 1574 | 30 | 77 |
| L6 | 162 | 18 | 28 |
| L7 | 645 | 28 | 41 |
| L8 | 984 | 20 | 57 |
| L9 | 206833 | 20 | 23191 |
| L10 | 59017 | 22 | 2996 |
| L11 | 200911 | 20 | 24649 |
| L12 | 6534 | - | 439 |

All under 2M cap. Total suite: ~52s.

## L9 Stones Limitation

Per phase 04 comment in levels.js: with current engine, `stones=0` still solvable via long wait loops; stones provide ~10-move shortcut making the level tractable within parMoves. This is unchanged and acceptable — stones remain a player-facing tactical advantage, not a hard solver requirement. BFS finds path=20 at states=206833, well under cap.

## Implementation Notes

- `player.moveTo` convention: `moveDir` encoding 0=up, 1=right, 2=down, 3=left. Documented inline. `moveDir=-1` bypasses one-way check for direct placement.
- Door state now in solver: `dc` (door snapshot) added to state capture/apply/hash. Without this, opened doors would pollute across BFS branches.
- `clearDoor` called on entry (door opens permanently for that branch). On `applyDoorSnapshot`, all doors restored — ensures correct state isolation across BFS paths.
- `GameHistory` (not in ownership) does not capture `keysHeld` or key/door cell state. Undo during a keys-collected-or-door-opened turn will restore player position but NOT grid key/door state. This is a known gap for the UI undo feature — requires phase 05 to fix by extending GameHistory or resetting level on undo.

## Deviations

- L3 design: one-ways sit on the main BFS path (not as bypass gates) — cleaner intro mechanic; player must use them to proceed, not just avoid them.
- L5 design iterated 11 times to get chained key→door dependency working. Final: key1 top-right (row 0) → door1 (4,5) → key2 bottom-right (6,8) → door2 (8,5) → goal.
- L7 right-column bypass blocked with explicit walls at cols 9-10, rows 7-10, to force door usage.

**Status:** DONE
**Summary:** Engine gap closed — player.moveTo enforces doors/oneWays, keys auto-collected; solver state captures keysHeld+keyCells+doorCells; L3/L5/L7 redesigned with their intended mechanics; 172/172 tests pass; build clean.
