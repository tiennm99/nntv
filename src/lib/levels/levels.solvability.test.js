// Solvability invariant suite. Runs BFS solver over each level and asserts:
//   - L1–L11: MUST be solvable, states < 2M cap, path.length ≤ parMoves.
//   - L12 MUST be unsolvable (Princess Chamber easter-egg invariant).
//
// Run via: npm run test:solvability
// Fail mode: any legitimate solvable level that flips to unsolvable, or L12 becoming
// solvable, will fail CI — preventing regressions.

import { describe, it, expect, afterAll } from 'vitest';
import { solveLevel } from '../game/level-solver.js';
import { LEVELS } from './levels.js';

const SOLVER_OPTS = { maxStates: 2_000_000 };

// Levels known broken under current design. Each entry names the phase that
// redesigns it — flip to expect `solvable: true` after the redesign lands.
const KNOWN_UNSOLVABLE_BUGS = new Set([
    // All playable levels now fixed (phases 04-09). L12 unsolvable by design.
]);

// Per-level perf table, populated during test run and printed after all tests.
const perfTable = [];

describe('level solvability', () => {
    const solvableLevels = LEVELS
        .filter(l => l.id !== 12 && !KNOWN_UNSOLVABLE_BUGS.has(l.id))
        .map(l => [l.id, l.name, l.parMoves]);

    it.each(solvableLevels)('L%i "%s" must be solvable', (id, name, parMoves) => {
        const t0 = Date.now();
        const result = solveLevel(id, SOLVER_OPTS);
        const ms = Date.now() - t0;

        perfTable.push({
            level: id,
            name,
            states: result.states_explored,
            path_len: result.solvable ? result.path.length : '-',
            ms,
        });

        expect(result.solvable, `L${id} unsolvable: ${result.reason}`).toBe(true);
        expect(result.states_explored, `L${id} exceeded 2M node cap`).toBeLessThan(2_000_000);
        expect(result.path.length, `L${id} path longer than 0`).toBeGreaterThan(0);

        // Path must not exceed parMoves (if specified; default 99 means no effective constraint)
        const par = parMoves ?? 99;
        expect(result.path.length, `L${id} path (${result.path.length}) exceeds parMoves (${par})`).toBeLessThanOrEqual(par);
    }, 120_000);

    it('L12 "The Princess Chamber" must remain unsolvable (easter-egg invariant)', () => {
        const t0 = Date.now();
        const result = solveLevel(12, SOLVER_OPTS);
        const ms = Date.now() - t0;

        perfTable.push({
            level: 12,
            name: 'The Princess Chamber',
            states: result.states_explored,
            path_len: '-',
            ms,
        });

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

    it('no wall cell overlaps a guard lit cell', () => {
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

// Print per-level performance table after all tests
afterAll(() => {
    if (perfTable.length === 0) return;

    perfTable.sort((a, b) => a.level - b.level);

    const totalMs = perfTable.reduce((s, r) => s + r.ms, 0);

    console.log('\n--- Solvability Suite Performance ---');
    console.log('Level | Name                          | States     | Path | ms');
    console.log('------|-------------------------------|------------|------|------');
    for (const r of perfTable) {
        const lv = String(r.level).padStart(5);
        const nm = r.name.padEnd(29).slice(0, 29);
        const st = String(r.states).padStart(10);
        const pl = String(r.path_len).padStart(4);
        const ms = String(r.ms).padStart(6);
        console.log(`${lv} | ${nm} | ${st} | ${pl} | ${ms}`);
    }
    console.log(`Total: ${totalMs}ms`);
    if (totalMs > 60_000) {
        console.warn(`WARNING: solvability suite took ${totalMs}ms — exceeds 60s budget`);
    }
});
