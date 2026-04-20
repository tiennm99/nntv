import { describe, it, expect } from 'vitest';
import { GridSystem } from './grid-system.js';

describe('GridSystem', () => {
    it('creates empty grid with given dimensions', () => {
        const g = new GridSystem(3, 4, 50);
        expect(g.rows).toBe(3);
        expect(g.cols).toBe(4);
        expect(g.grid.length).toBe(3);
        expect(g.grid[0].length).toBe(4);
    });

    it('rejects out-of-bounds positions', () => {
        const g = new GridSystem(3, 3, 50);
        expect(g.isValidPosition(-1, 0)).toBe(false);
        expect(g.isValidPosition(0, -1)).toBe(false);
        expect(g.isValidPosition(3, 0)).toBe(false);
        expect(g.isValidPosition(0, 3)).toBe(false);
        expect(g.isValidPosition(0, 0)).toBe(true);
        expect(g.isValidPosition(2, 2)).toBe(true);
    });

    it('ignores setters on invalid positions', () => {
        const g = new GridSystem(2, 2, 50);
        g.setWall(-1, 0, true);
        g.setLight(5, 5, true);
        expect(g.isWall(-1, 0)).toBe(false);
        expect(g.isLight(5, 5)).toBe(false);
    });

    it('clearAllLight resets every cell', () => {
        const g = new GridSystem(2, 2, 50);
        g.setLight(0, 0, true);
        g.setLight(1, 1, true);
        g.clearAllLight();
        expect(g.isLight(0, 0)).toBe(false);
        expect(g.isLight(1, 1)).toBe(false);
    });

    it('getAllCells returns flat array with positions', () => {
        const g = new GridSystem(2, 3, 50);
        g.setWall(1, 2, true);
        const cells = g.getAllCells();
        expect(cells.length).toBe(6);
        const wall = cells.find(c => c.row === 1 && c.col === 2);
        expect(wall.isWall).toBe(true);
    });
});
