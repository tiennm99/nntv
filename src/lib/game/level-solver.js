// BFS solver for level solvability validation.
// Replays the real turn pipeline (guards.js + princess-mechanic.js) so solver
// verdicts match runtime behavior exactly — no reimplementation of AI.
//
// Usage:
//   const result = solveLevel(levelId, { maxStates: 5_000_000 });
//   // { solvable, path?, reason?, states_explored }

import { loadLevel } from './level-manager.js';
import { PrincessMechanic } from './princess-mechanic.js';

const ACTIONS = ['up', 'down', 'left', 'right', 'wait'];

function captureState(player, guards, princess) {
    return {
        p: { r: player.row, c: player.col },
        g: guards.map(x => x.capture()),
        pr: princess ? princess.capture() : null,
    };
}

function applyState(state, player, guards, princess) {
    player.row = state.p.r;
    player.col = state.p.c;
    guards.forEach((x, i) => x.apply(state.g[i]));
    if (princess && state.pr) princess.apply(state.pr);
}

function stateKey(state) {
    return JSON.stringify(state);
}

// Simulate one turn exactly as TurnManager.nextTurn does, including princess.
// Returns { detected, levelComplete }. Mutates grid + guards + princess.
function simulateTurn(grid, player, guards, princess, goalRow, goalCol) {
    if (grid.isGoal(player.row, player.col)) {
        return { detected: false, levelComplete: true };
    }
    grid.clearAllLight();
    guards.forEach(g => g.onTurnChange(guards, player));
    if (princess) {
        const r = princess.update(grid, player, goalRow, goalCol);
        if (r.detected) return { detected: true, levelComplete: false };
    }
    if (grid.isLight(player.row, player.col)) {
        return { detected: true, levelComplete: false };
    }
    return { detected: false, levelComplete: false };
}

export function solveLevel(levelId, options = {}) {
    const maxStates = options.maxStates ?? 5_000_000;
    const init = loadLevel(levelId);
    if (!init) return { solvable: false, reason: 'invalid_level', states_explored: 0 };

    const { grid, player, guards, isFinalLevel, goalRow, goalCol } = init;
    const princess = isFinalLevel ? new PrincessMechanic() : null;

    if (player.row === goalRow && player.col === goalCol) {
        return { solvable: true, path: [], states_explored: 0 };
    }

    const startState = captureState(player, guards, princess);
    const visited = new Set([stateKey(startState)]);
    const queue = [{ state: startState, path: [] }];
    let explored = 0;

    while (queue.length > 0) {
        if (explored >= maxStates) {
            return { solvable: false, reason: 'budget_exhausted', states_explored: explored };
        }

        const { state, path } = queue.shift();
        explored++;

        for (const action of ACTIONS) {
            // Restore parent state into shared mutable engine objects
            applyState(state, player, guards, princess);
            grid.clearAllLight();
            guards.forEach(g => g.updateLight(guards));

            // Apply player action
            let nr = player.row, nc = player.col;
            if (action === 'up') nr--;
            else if (action === 'down') nr++;
            else if (action === 'left') nc--;
            else if (action === 'right') nc++;

            if (action !== 'wait') {
                if (!grid.isValidPosition(nr, nc) || grid.isWall(nr, nc)) continue;
                player.row = nr;
                player.col = nc;
            }

            // Run turn (matches TurnManager.nextTurn pipeline)
            const result = simulateTurn(grid, player, guards, princess, goalRow, goalCol);
            const newPath = path.concat(action);

            if (result.levelComplete) {
                return { solvable: true, path: newPath, states_explored: explored };
            }
            if (result.detected) continue;

            // Check if player reached goal after guard update (edge case: goal cell became lit but player already there — treated as detection by engine)
            // Actually: engine checks goal BEFORE guard update; after player moves onto goal, nextTurn catches it next call. Match that here:
            if (grid.isGoal(player.row, player.col) && !grid.isLight(player.row, player.col)) {
                return { solvable: true, path: newPath, states_explored: explored };
            }

            const newState = captureState(player, guards, princess);
            const key = stateKey(newState);
            if (visited.has(key)) continue;
            visited.add(key);
            queue.push({ state: newState, path: newPath });
        }
    }

    return { solvable: false, reason: 'no_path', states_explored: explored };
}
