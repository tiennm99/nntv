// Shared line-of-sight + throw-target validation — single source of truth for
// the throw-legality contract. Before this module existed, the same ~12 lines
// of Bresenham stepping were copy-pasted into the live engine (throwable.js),
// the BFS solver (level-solver.js), and the UI's targeting overlay
// (Game.svelte). Three independent copies of the same rule can only drift
// apart; importing from here instead means a rule change can't silently
// desync what the solver certifies from what the player can actually do.

// Guard types eligible to be distracted by a thrown stone.
export const DISTRACTIBLE_TYPES = new Set(['rotating', 'patrolling', 'chaser']);

// Returns true if there is no wall strictly between (r0,c0) and (r1,c1).
// Bresenham-style integer stepping along the line; the endpoints themselves
// are not checked here — callers validate the target cell separately.
export function hasLineOfSight(grid, r0, c0, r1, c1) {
    const dr = r1 - r0;
    const dc = c1 - c0;
    const steps = Math.max(Math.abs(dr), Math.abs(dc));
    if (steps === 0) return true;
    for (let i = 1; i < steps; i++) {
        const r = Math.round(r0 + (dr * i) / steps);
        const c = Math.round(c0 + (dc * i) / steps);
        if (grid.isWall(r, c)) return false;
    }
    return true;
}

// A throw target is legal when: not a wall itself, within Manhattan 3 of the
// thrower, in line of sight (no wall between), and within Manhattan 2 of at
// least one distractible guard (otherwise the stone can never affect play —
// this is the "wasted throw" pruning the solver and the UI overlay both need).
export function isValidThrowTarget(grid, guards, fromRow, fromCol, targetRow, targetCol) {
    if (grid.isWall(targetRow, targetCol)) return false;

    const dist = Math.abs(targetRow - fromRow) + Math.abs(targetCol - fromCol);
    if (dist > 3) return false;

    if (!hasLineOfSight(grid, fromRow, fromCol, targetRow, targetCol)) return false;

    return guards.some(g => {
        if (!DISTRACTIBLE_TYPES.has(g.type)) return false;
        const gDist = Math.abs(g.row - targetRow) + Math.abs(g.col - targetCol);
        return gDist <= 2;
    });
}
