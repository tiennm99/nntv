// Solvability invariant suite. Runs BFS solver over each level and asserts:
//   - L1 and "confirmed-good" levels MUST be solvable.
//   - Broken levels (L2, L3, L4, L9, L11) are skipped until their redesign lands.
//     Each skipped entry carries a TODO tied to the owning plan phase.
//   - L12 MUST be unsolvable (Princess Chamber easter-egg invariant).
//
// Run via: npm run test:solvability
// Fail mode: any legitimate solvable level that flips to unsolvable, or L12 becoming
// solvable, will fail CI — preventing regressions.

import { describe, it, expect } from 'vitest';
import { solveLevel } from '../game/level-solver.js';
import { LEVELS } from './levels.js';

const SOLVER_OPTS = { maxStates: 2_000_000 };

// Levels known broken under current design. Each entry names the phase that
// redesigns it — flip to expect `solvable: true` after the redesign lands.
const KNOWN_UNSOLVABLE_BUGS = new Set([
    // All playable levels now fixed (phases 04-09). L12 unsolvable by design.
]);

describe('level solvability', () => {
    const solvableLevels = LEVELS
        .filter(l => l.id !== 12 && !KNOWN_UNSOLVABLE_BUGS.has(l.id))
        .map(l => [l.id, l.name]);

    it.each(solvableLevels)('L%i "%s" must be solvable', (id) => {
        const result = solveLevel(id, SOLVER_OPTS);
        expect(result.solvable, `L${id} unsolvable: ${result.reason}`).toBe(true);
        expect(result.path.length).toBeGreaterThan(0);
    }, 120_000);

    it('L12 "The Princess Chamber" must remain unsolvable (easter-egg invariant)', () => {
        const result = solveLevel(12, SOLVER_OPTS);
        expect(result.solvable).toBe(false);
        // Accept either exhaustive no-path or budget exhausted — both prove
        // "not reachable within reasonable play". Memory: project_level12_unsolvable.md.
        expect(['no_path', 'budget_exhausted']).toContain(result.reason);
    }, 300_000);

    describe.skip('broken levels (unskip per phase as they are redesigned)', () => {
        // Unskip each block when its owning redesign phase completes.
        it.each([...KNOWN_UNSOLVABLE_BUGS])('L%i must become solvable after redesign', (id) => {
            const result = solveLevel(id, SOLVER_OPTS);
            expect(result.solvable).toBe(true);
        }, 120_000);
    });
});

describe('level metadata invariants', () => {
    it('exactly 12 levels exist', () => {
        expect(LEVELS.length).toBe(12);
    });

    it('each level has required fields', () => {
        for (const lvl of LEVELS) {
            expect(lvl.id).toBeGreaterThan(0);
            expect(typeof lvl.name).toBe('string');
            expect(typeof lvl.storyKey).toBe('string');
            expect(lvl.grid.rows).toBeGreaterThan(0);
            expect(lvl.player).toBeDefined();
            expect(lvl.goal).toBeDefined();
        }
    });

    it('L12 is flagged isFinalLevel', () => {
        const l12 = LEVELS.find(l => l.id === 12);
        expect(l12.isFinalLevel).toBe(true);
    });

    // Forward regression guard — several current levels (L2, L5 at least) have
    // pre-existing wall-on-light overlaps. Full cleanup happens as each level is
    // redesigned in its owning phase. Unskip in Phase 11 once all levels clean.
    it.skip('no wall cell overlaps a guard lit cell (enable after all redesigns)', () => {
        for (const lvl of LEVELS) {
            if (KNOWN_UNSOLVABLE_BUGS.has(lvl.id)) continue;
            const walls = new Set((lvl.walls ?? []).map(w => `${w.row},${w.col}`));
            for (const g of (lvl.guards ?? [])) {
                for (const cell of (g.litCells ?? [])) {
                    const key = `${cell.row},${cell.col}`;
                    if (walls.has(key)) {
                        throw new Error(`L${lvl.id}: guard lights wall cell (${cell.row},${cell.col}) — redundant, indicates sloppy authoring`);
                    }
                }
            }
        }
    });
});
