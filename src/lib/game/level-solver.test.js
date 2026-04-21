import { describe, it, expect } from 'vitest';
import { solveLevel } from './level-solver.js';
import { LEVELS } from '../levels/levels.js';
import { loadLevel } from './level-manager.js';

describe('level-solver', () => {
    it('solves trivial level (L1 has no guards)', () => {
        const result = solveLevel(1);
        expect(result.solvable).toBe(true);
        expect(result.path.length).toBeGreaterThan(0);
    });

    it('L2 is solvable after Phase 4 redesign', () => {
        const result = solveLevel(2);
        expect(result.solvable).toBe(true);
        expect(result.path.length).toBeGreaterThan(0);
    });

    it('returns invalid_level for out-of-range IDs', () => {
        expect(solveLevel(0).solvable).toBe(false);
        expect(solveLevel(99).solvable).toBe(false);
    });

    it('solved path length is reasonable vs par (L1)', () => {
        const result = solveLevel(1);
        const par = LEVELS[0].parMoves;
        expect(result.path.length).toBeLessThanOrEqual(par);
    });

    it('solver replay actually works (L1 path reaches goal via simulated play)', () => {
        const { path } = solveLevel(1);
        const init = loadLevel(1);
        const { grid, player } = init;
        // Walk the path step by step
        for (const action of path) {
            let nr = player.row, nc = player.col;
            if (action === 'up') nr--;
            else if (action === 'down') nr++;
            else if (action === 'left') nc--;
            else if (action === 'right') nc++;
            if (action !== 'wait') {
                expect(grid.isValidPosition(nr, nc)).toBe(true);
                expect(grid.isWall(nr, nc)).toBe(false);
                player.row = nr;
                player.col = nc;
            }
        }
        expect(grid.isGoal(player.row, player.col)).toBe(true);
    });
});
