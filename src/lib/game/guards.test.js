import { describe, it, expect, beforeEach } from 'vitest';
import { GridSystem } from './grid-system.js';
import {
    StaticGuard, RotatingGuard, BlinkingGuard,
    MirrorGuard, PatrollingGuard, ChaserGuard,
} from './guards.js';

describe('Guard.capture()/apply()', () => {
    let grid;
    beforeEach(() => { grid = new GridSystem(6, 6, 50); });

    it('base fields round-trip on StaticGuard', () => {
        const g = new StaticGuard(grid, 2, 2, []);
        g.direction = 2;
        g.isOn = false;
        const s = g.capture();
        g.direction = 0;
        g.isOn = true;
        g.apply(s);
        expect(g.direction).toBe(2);
        expect(g.isOn).toBe(false);
    });

    it('ChaserGuard preserves chase state', () => {
        const g = new ChaserGuard(grid, 0, 0, 3);
        g.isChasing = true;
        g.isReturning = false;
        g.targetRow = 4;
        g.targetCol = 5;
        const s = g.capture();
        g.isChasing = false;
        g.targetRow = 0;
        g.apply(s);
        expect(g.isChasing).toBe(true);
        expect(g.targetRow).toBe(4);
        expect(g.targetCol).toBe(5);
    });

    it('PatrollingGuard preserves path index + reversing', () => {
        const path = [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }];
        const g = new PatrollingGuard(grid, 0, 0, path);
        g.currentPathIndex = 2;
        g.isReversing = true;
        const s = g.capture();
        g.currentPathIndex = 0;
        g.isReversing = false;
        g.apply(s);
        expect(g.currentPathIndex).toBe(2);
        expect(g.isReversing).toBe(true);
    });
});

describe('RotatingGuard beam + mirror', () => {
    it('casts beam up to range and stops at wall', () => {
        const grid = new GridSystem(5, 5, 50);
        grid.setWall(2, 3, true);
        const g = new RotatingGuard(grid, 2, 0, 1); // facing right
        g.updateLight([g]);
        expect(grid.isLight(2, 0)).toBe(true);
        expect(grid.isLight(2, 1)).toBe(true);
        expect(grid.isLight(2, 2)).toBe(true);
        expect(grid.isLight(2, 3)).toBe(false); // wall blocks
    });

    it('rotates direction on turn change', () => {
        const grid = new GridSystem(5, 5, 50);
        const g = new RotatingGuard(grid, 2, 2, 0);
        expect(g.direction).toBe(0);
        g.onTurnChange([g]);
        expect(g.direction).toBe(1);
        g.onTurnChange([g]); g.onTurnChange([g]); g.onTurnChange([g]);
        expect(g.direction).toBe(0); // wraps
    });

    it('bounces off mirror (cw)', () => {
        const grid = new GridSystem(5, 5, 50);
        const rot = new RotatingGuard(grid, 2, 0, 1); // facing right
        const mir = new MirrorGuard(grid, 2, 2, 'cw');
        rot.updateLight([rot, mir]);
        // beam right→mirror at (2,2)→reflected 90° cw → row+0,col+- rotated: cw of {0,1} = {1,0} (down)
        // So cells below mirror lit
        expect(grid.isLight(2, 0)).toBe(true);
        expect(grid.isLight(2, 2)).toBe(true); // mirror cell
        expect(grid.isLight(3, 2)).toBe(true); // reflected beam
    });
});

describe('BlinkingGuard', () => {
    it('toggles isOn on turn change', () => {
        const grid = new GridSystem(3, 3, 50);
        const g = new BlinkingGuard(grid, 1, 1, [{ row: 0, col: 1 }], true);
        expect(g.isOn).toBe(true);
        g.onTurnChange();
        expect(g.isOn).toBe(false);
        g.onTurnChange();
        expect(g.isOn).toBe(true);
    });

    it('lights cells only when on', () => {
        const grid = new GridSystem(3, 3, 50);
        const g = new BlinkingGuard(grid, 1, 1, [{ row: 0, col: 1 }], false);
        g.updateLight();
        expect(grid.isLight(0, 1)).toBe(false);
        g.isOn = true;
        g.updateLight();
        expect(grid.isLight(0, 1)).toBe(true);
    });
});

describe('ChaserGuard BFS', () => {
    it('finds direct step toward adjacent target', () => {
        const grid = new GridSystem(5, 5, 50);
        const g = new ChaserGuard(grid, 0, 0, 3);
        const step = g.bfsNextStep(0, 2);
        expect(step).toEqual({ row: 0, col: 1 });
    });

    it('routes around walls', () => {
        const grid = new GridSystem(3, 3, 50);
        // Wall blocks direct path from (0,0) to (2,0)
        grid.setWall(1, 0, true);
        const g = new ChaserGuard(grid, 0, 0, 5);
        const step = g.bfsNextStep(2, 0);
        expect(step).not.toEqual({ row: 1, col: 0 });
        expect([{ row: 0, col: 1 }]).toContainEqual(step);
    });

    it('returns null when no path exists', () => {
        const grid = new GridSystem(3, 3, 50);
        grid.setWall(0, 1, true);
        grid.setWall(1, 0, true);
        const g = new ChaserGuard(grid, 0, 0, 5);
        const step = g.bfsNextStep(2, 2);
        expect(step).toBeNull();
    });
});

describe('PatrollingGuard', () => {
    it('reverses at end of non-circular path', () => {
        const grid = new GridSystem(3, 3, 50);
        const path = [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }];
        const g = new PatrollingGuard(grid, 0, 0, path);
        g.onTurnChange(); // index 1
        g.onTurnChange(); // index 2 (end) → triggers reverse
        expect(g.col).toBe(2);
        g.onTurnChange(); // reversing, back to index 1
        expect(g.isReversing).toBe(true);
        expect(g.col).toBe(1);
    });

    it('loops when path is circular', () => {
        const grid = new GridSystem(3, 3, 50);
        const path = [
            { row: 0, col: 0 }, { row: 0, col: 1 },
            { row: 1, col: 1 }, { row: 0, col: 0 },
        ];
        const g = new PatrollingGuard(grid, 0, 0, path);
        expect(g.isCircularPath).toBe(true);
        g.onTurnChange(); g.onTurnChange(); g.onTurnChange();
        // After 3 steps should wrap
        expect(g.isReversing).toBe(false);
    });
});
