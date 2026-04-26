import { describe, it, expect, beforeEach } from 'vitest';
import { GridSystem } from './grid-system.js';
import { RotatingGuard, PatrollingGuard, ChaserGuard, StaticGuard, BlinkingGuard } from './guards.js';
import { ThrowableSystem } from './throwable.js';

// Helper: build a minimal player-like object
function makePlayer(row, col) {
    return { row, col };
}

describe('ThrowableSystem.throw — validation', () => {
    let grid, ts, player;

    beforeEach(() => {
        grid = new GridSystem(9, 9, 50);
        ts = new ThrowableSystem(3);
        player = makePlayer(4, 4);
    });

    it('succeeds when target is within Manhattan 3 and no walls', () => {
        expect(ts.throw(4, 7, player, grid)).toBe(true);
        expect(ts.stonesLeft).toBe(2);
        expect(ts.pendingTarget).toEqual({ row: 4, col: 7 });
    });

    it('fails when target is more than Manhattan 3 away', () => {
        expect(ts.throw(4, 8, player, grid)).toBe(false);
        expect(ts.stonesLeft).toBe(3);
        expect(ts.pendingTarget).toBeNull();
    });

    it('fails when stonesLeft is 0', () => {
        const empty = new ThrowableSystem(0);
        expect(empty.throw(4, 5, player, grid)).toBe(false);
    });

    it('fails when a wall blocks line of sight', () => {
        // Wall sits between player (4,4) and target (4,6)
        grid.setWall(4, 5, true);
        expect(ts.throw(4, 6, player, grid)).toBe(false);
        expect(ts.stonesLeft).toBe(3);
    });

    it('succeeds when path is clear diagonally within range', () => {
        // Manhattan(4,4→5,6) = |5-4|+|6-4| = 1+2 = 3 → valid
        const ts2 = new ThrowableSystem(1);
        expect(ts2.throw(5, 6, player, grid)).toBe(true);
    });

    it('fails when target is exactly Manhattan 4 away', () => {
        // Manhattan(4,4→4,8) = 4 > 3 → invalid
        expect(ts.throw(4, 8, player, grid)).toBe(false);
    });

    it('allows throwing at own cell (dist 0)', () => {
        expect(ts.throw(4, 4, player, grid)).toBe(true);
    });
});

describe('ThrowableSystem.resolve — guard distraction', () => {
    let grid;

    beforeEach(() => {
        grid = new GridSystem(9, 9, 50);
    });

    it('sets forcedFacing on rotating guard within radius 2', () => {
        const ts = new ThrowableSystem(1);
        const rot = new RotatingGuard(grid, 4, 4, 0);
        ts.pendingTarget = { row: 4, col: 6 };
        ts.resolve([rot]);
        expect(rot.forcedFacingTurns).toBe(1);
        expect(rot.forcedFacingTarget).toEqual({ row: 4, col: 6 });
        expect(ts.pendingTarget).toBeNull();
    });

    it('sets forcedFacing on patrolling guard within radius 2', () => {
        const ts = new ThrowableSystem(1);
        const path = [{ row: 3, col: 3 }, { row: 3, col: 5 }];
        const pat = new PatrollingGuard(grid, 3, 3, path);
        ts.pendingTarget = { row: 3, col: 5 };
        ts.resolve([pat]);
        expect(pat.forcedFacingTurns).toBe(1);
    });

    it('sets forcedFacing on chaser guard within radius 2', () => {
        const ts = new ThrowableSystem(1);
        const ch = new ChaserGuard(grid, 5, 5, 3);
        ts.pendingTarget = { row: 5, col: 7 }; // dist 2 from (5,5)
        ts.resolve([ch]);
        expect(ch.forcedFacingTurns).toBe(1);
    });

    it('does NOT distract guard outside radius 2', () => {
        const ts = new ThrowableSystem(1);
        const rot = new RotatingGuard(grid, 0, 0, 0);
        ts.pendingTarget = { row: 4, col: 6 }; // dist from (0,0) = 10
        ts.resolve([rot]);
        expect(rot.forcedFacingTurns).toBe(0);
    });

    it('does NOT distract static guard even if in radius', () => {
        const ts = new ThrowableSystem(1);
        const stat = new StaticGuard(grid, 4, 5, 2);
        ts.pendingTarget = { row: 4, col: 6 }; // dist 1
        ts.resolve([stat]);
        expect(stat.forcedFacingTurns).toBeUndefined();
    });

    it('does NOT distract blinking guard', () => {
        const ts = new ThrowableSystem(1);
        const blink = new BlinkingGuard(grid, 4, 5, [{ row: 3, col: 5 }], true);
        ts.pendingTarget = { row: 4, col: 6 };
        ts.resolve([blink]);
        expect(blink.forcedFacingTurns).toBeUndefined();
    });

    it('is a no-op when no pending target', () => {
        const ts = new ThrowableSystem(1);
        const rot = new RotatingGuard(grid, 4, 4, 0);
        ts.resolve([rot]);
        expect(rot.forcedFacingTurns).toBe(0);
    });

    it('distracts multiple eligible guards simultaneously', () => {
        const ts = new ThrowableSystem(1);
        const r1 = new RotatingGuard(grid, 4, 5, 0);
        const r2 = new RotatingGuard(grid, 5, 5, 0);
        ts.pendingTarget = { row: 4, col: 6 };
        ts.resolve([r1, r2]);
        expect(r1.forcedFacingTurns).toBe(1);
        expect(r2.forcedFacingTurns).toBe(1);
    });
});

describe('ThrowableSystem.capture/apply round-trip', () => {
    it('preserves stonesLeft and pendingTarget', () => {
        const ts = new ThrowableSystem(5);
        ts.stonesLeft = 3;
        ts.pendingTarget = { row: 2, col: 3 };
        const s = ts.capture();
        ts.stonesLeft = 0;
        ts.pendingTarget = null;
        ts.apply(s);
        expect(ts.stonesLeft).toBe(3);
        expect(ts.pendingTarget).toEqual({ row: 2, col: 3 });
    });

    it('preserves null pendingTarget', () => {
        const ts = new ThrowableSystem(2);
        const s = ts.capture();
        ts.pendingTarget = { row: 1, col: 1 };
        ts.apply(s);
        expect(ts.pendingTarget).toBeNull();
    });

    it('pendingTarget clone is independent (no reference sharing)', () => {
        const ts = new ThrowableSystem(2);
        ts.pendingTarget = { row: 1, col: 1 };
        const s = ts.capture();
        s.pendingTarget.row = 99; // mutate snapshot
        expect(ts.pendingTarget.row).toBe(1); // original unaffected
    });
});

describe('ThrowableSystem.reset', () => {
    it('resets stonesLeft and clears pendingTarget', () => {
        const ts = new ThrowableSystem(3);
        ts.stonesLeft = 1;
        ts.pendingTarget = { row: 0, col: 0 };
        ts.reset(5);
        expect(ts.stonesLeft).toBe(5);
        expect(ts.pendingTarget).toBeNull();
    });
});
