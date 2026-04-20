import { describe, it, expect, beforeEach } from 'vitest';
import { GridSystem } from './grid-system.js';
import { PrincessMechanic } from './princess-mechanic.js';

// Minimal player stub — mechanic only reads row/col
const player = (row, col) => ({ row, col });

describe('PrincessMechanic', () => {
    let grid, p;
    beforeEach(() => {
        grid = new GridSystem(8, 8, 50);
        p = new PrincessMechanic();
    });

    it('does not alert if player is far from goal', () => {
        const result = p.update(grid, player(0, 0), 7, 7);
        expect(result.showMessage).toBe(false);
        expect(p.alerted).toBe(false);
    });

    it('alerts and shows message when within Manhattan distance 4', () => {
        const result = p.update(grid, player(5, 5), 7, 7);
        expect(p.alerted).toBe(true);
        expect(p.alertRadius).toBe(1);
        expect(result.showMessage).toBe(true);
        expect(p.messageShown).toBe(true);
    });

    it('expands radius each subsequent call', () => {
        p.update(grid, player(5, 5), 7, 7);  // alert
        p.update(grid, player(5, 5), 7, 7);  // radius 2
        expect(p.alertRadius).toBe(2);
        p.update(grid, player(5, 5), 7, 7);
        expect(p.alertRadius).toBe(3);
    });

    it('detects player when they step into expanded ring', () => {
        p.update(grid, player(5, 5), 7, 7);  // alert, radius 1, lights (7,7) area
        // Grow ring until it touches player at (4,4) — distance 6 from (7,7)
        let detected = false;
        for (let i = 0; i < 8 && !detected; i++) {
            const r = p.update(grid, player(5, 5), 7, 7);
            if (r.detected) detected = true;
        }
        expect(detected).toBe(true);
    });

    it('lightRing respects walls', () => {
        grid.setWall(7, 6, true);
        p.lightRing(grid, 7, 7, 1);
        expect(grid.isLight(7, 7)).toBe(true);
        expect(grid.isLight(7, 6)).toBe(false); // wall
        expect(grid.isLight(6, 7)).toBe(true);
    });

    it('capture/apply round-trips all 3 fields including messageShown', () => {
        p.alerted = true;
        p.alertRadius = 3;
        p.messageShown = true;
        const s = p.capture();
        p.reset();
        expect(p.messageShown).toBe(false);
        p.apply(s);
        expect(p.alerted).toBe(true);
        expect(p.alertRadius).toBe(3);
        expect(p.messageShown).toBe(true);
    });
});
