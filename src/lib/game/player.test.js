import { describe, it, expect, beforeEach } from 'vitest';
import { GridSystem } from './grid-system.js';
import { Player } from './player.js';

describe('Player', () => {
    let grid;
    beforeEach(() => { grid = new GridSystem(4, 4, 50); });

    it('maps direction strings to row/col delta', () => {
        const p = new Player(grid, 1, 1);
        expect(p.move('up') && [p.row, p.col]).toEqual([0, 1]);
        expect(p.move('right') && [p.row, p.col]).toEqual([0, 2]);
        expect(p.move('down') && [p.row, p.col]).toEqual([1, 2]);
        expect(p.move('left') && [p.row, p.col]).toEqual([1, 1]);
    });

    it('rejects moves into walls', () => {
        grid.setWall(0, 1, true);
        const p = new Player(grid, 0, 0);
        expect(p.move('right')).toBe(false);
        expect(p.row).toBe(0);
        expect(p.col).toBe(0);
    });

    it('rejects moves out of bounds', () => {
        const p = new Player(grid, 0, 0);
        expect(p.move('up')).toBe(false);
        expect(p.move('left')).toBe(false);
        expect(p.row).toBe(0);
        expect(p.col).toBe(0);
    });

    it('detects lit cell and goal cell', () => {
        const p = new Player(grid, 0, 0);
        expect(p.isInLitCell()).toBe(false);
        grid.setLight(0, 0, true);
        expect(p.isInLitCell()).toBe(true);
        expect(p.isAtGoal()).toBe(false);
        grid.setGoal(0, 0, true);
        expect(p.isAtGoal()).toBe(true);
    });
});
