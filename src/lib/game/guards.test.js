import { describe, it, expect, beforeEach } from 'vitest';
import { GridSystem } from './grid-system.js';
import {
    StaticGuard, RotatingGuard, BlinkingGuard,
    MirrorGuard, PatrollingGuard, ChaserGuard,
    SniperGuard, SuspicionGuard,
} from './guards.js';

describe('Guard.capture()/apply()', () => {
    let grid;
    beforeEach(() => { grid = new GridSystem(6, 6, 50); });

    it('base fields round-trip on StaticGuard', () => {
        const g = new StaticGuard(grid, 2, 2, 2);
        g.direction = 2;
        g.isOn = false;
        const s = g.capture();
        g.direction = 0;
        g.isOn = true;
        g.apply(s);
        expect(g.direction).toBe(2);
        expect(g.isOn).toBe(false);
    });

    it('StaticGuard wilts — currentRadius decrements per turn', () => {
        const g = new StaticGuard(grid, 2, 2, 2);
        expect(g.currentRadius).toBe(2);
        g.onTurnChange();
        expect(g.currentRadius).toBe(1);
        g.onTurnChange();
        expect(g.currentRadius).toBe(0);
    });

    it('StaticGuard emits no light once wilted (currentRadius < 0)', () => {
        const g = new StaticGuard(grid, 2, 2, 0);
        g.updateLight();
        expect(grid.isLight(2, 2)).toBe(true);
        g.onTurnChange();  // radius now -1
        grid.clearAllLight();
        g.updateLight();
        expect(grid.isLight(2, 2)).toBe(false);
    });

    it('StaticGuard currentRadius round-trips via capture/apply', () => {
        const g = new StaticGuard(grid, 2, 2, 2);
        g.currentRadius = 0;
        const s = g.capture();
        g.currentRadius = 99;
        g.apply(s);
        expect(g.currentRadius).toBe(0);
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

describe('SniperGuard', () => {
    it('beam lights cells in facing direction up to wall', () => {
        const grid = new GridSystem(7, 7, 50);
        grid.setWall(2, 4, true);
        // facing right (1) from (2,1)
        const g = new SniperGuard(grid, 2, 1, 1);
        g.updateLight([g]);
        expect(grid.isLight(2, 1)).toBe(true);  // own cell
        expect(grid.isLight(2, 2)).toBe(true);
        expect(grid.isLight(2, 3)).toBe(true);
        expect(grid.isLight(2, 4)).toBe(false); // wall blocks
        expect(grid.isLight(2, 5)).toBe(false); // beyond wall
    });

    it('beam stops at grid edge', () => {
        const grid = new GridSystem(5, 5, 50);
        // facing up (0) from (2,2)
        const g = new SniperGuard(grid, 2, 2, 0);
        g.updateLight([g]);
        expect(grid.isLight(1, 2)).toBe(true);
        expect(grid.isLight(0, 2)).toBe(true);
        // no crash — edge handled
    });

    it('beam reflects off mirror (cw) and continues', () => {
        const grid = new GridSystem(7, 7, 50);
        // sniper at (3,0) facing right, mirror at (3,3)
        const sniper = new SniperGuard(grid, 3, 0, 1);
        const mirror = new MirrorGuard(grid, 3, 3, 'cw');
        sniper.updateLight([sniper, mirror]);
        expect(grid.isLight(3, 1)).toBe(true);
        expect(grid.isLight(3, 2)).toBe(true);
        expect(grid.isLight(3, 3)).toBe(true); // mirror cell
        // cw reflect of right → down
        expect(grid.isLight(4, 3)).toBe(true);
        expect(grid.isLight(5, 3)).toBe(true);
        expect(grid.isLight(6, 3)).toBe(true);
    });

    it('beam reflect is capped at 3 bounces (no infinite loop)', () => {
        const grid = new GridSystem(9, 9, 50);
        // Three mirrors arranged to form a bounce chain
        const sniper = new SniperGuard(grid, 0, 0, 1); // facing right
        const m1 = new MirrorGuard(grid, 0, 3, 'cw');  // bounce 1: right→down
        const m2 = new MirrorGuard(grid, 3, 3, 'ccw'); // bounce 2: down→right
        const m3 = new MirrorGuard(grid, 3, 6, 'cw');  // bounce 3: right→down
        const m4 = new MirrorGuard(grid, 6, 6, 'ccw'); // would be bounce 4 — capped
        // Should not throw; just completes with ≤3 bounces
        expect(() => sniper.updateLight([sniper, m1, m2, m3, m4])).not.toThrow();
    });

    it('rotates facing 90° CW after rotateCadence turns', () => {
        const grid = new GridSystem(5, 5, 50);
        const g = new SniperGuard(grid, 2, 2, 0, 2); // facing up, cadence 2
        expect(g.facing).toBe(0);
        g.onTurnChange([g]); // turnsSinceRotate=1, no rotate
        expect(g.facing).toBe(0);
        g.onTurnChange([g]); // turnsSinceRotate=2 → rotate
        expect(g.facing).toBe(1);
        g.onTurnChange([g]);
        expect(g.facing).toBe(1); // still 1 after 1 more
        g.onTurnChange([g]);
        expect(g.facing).toBe(2); // rotated again
    });

    it('rotateCadence=1 rotates every turn', () => {
        const grid = new GridSystem(5, 5, 50);
        const g = new SniperGuard(grid, 2, 2, 0, 1);
        g.onTurnChange([g]);
        expect(g.facing).toBe(1);
        g.onTurnChange([g]);
        expect(g.facing).toBe(2);
    });

    it('capture/apply round-trips facing and turnsSinceRotate', () => {
        const grid = new GridSystem(5, 5, 50);
        const g = new SniperGuard(grid, 2, 2, 3, 2);
        g.turnsSinceRotate = 1;
        const s = g.capture();
        g.facing = 0;
        g.turnsSinceRotate = 99;
        g.apply(s);
        expect(g.facing).toBe(3);
        expect(g.turnsSinceRotate).toBe(1);
    });
});

describe('SuspicionGuard', () => {
    it('tier increments when player is in range', () => {
        const grid = new GridSystem(7, 7, 50);
        const guard = new SuspicionGuard(grid, 3, 3, 3);
        const player = { row: 3, col: 5 }; // Manhattan dist 2
        expect(guard.tier).toBe(0);
        guard.onTurnChange([], player);
        expect(guard.tier).toBe(1);
        guard.onTurnChange([], player);
        expect(guard.tier).toBe(2);
        guard.onTurnChange([], player); // was firing → force decay
        expect(guard.tier).toBe(0);
    });

    it('tier drops to 0 when starting turn at tier 2 (firing), regardless of player distance', () => {
        const grid = new GridSystem(7, 7, 50);
        const guard = new SuspicionGuard(grid, 0, 0, 2);
        guard.tier = 2;
        // Even with player nearby, firing turn always resets to 0
        const nearPlayer = { row: 0, col: 1 };
        guard.onTurnChange([], nearPlayer);
        expect(guard.tier).toBe(0);
    });

    it('tier decrements when player is out of range (from tier 1)', () => {
        const grid = new GridSystem(7, 7, 50);
        const guard = new SuspicionGuard(grid, 0, 0, 2);
        guard.tier = 1;
        const farPlayer = { row: 6, col: 6 }; // dist 12
        guard.onTurnChange([], farPlayer);
        expect(guard.tier).toBe(0);
    });

    it('tier clamps at 0 when decrementing from 0', () => {
        const grid = new GridSystem(5, 5, 50);
        const guard = new SuspicionGuard(grid, 2, 2, 2);
        const farPlayer = { row: 0, col: 0 };
        guard.onTurnChange([], farPlayer);
        expect(guard.tier).toBe(0);
    });

    it('at tier 2, lights own cell and all 8 neighbours', () => {
        const grid = new GridSystem(5, 5, 50);
        const guard = new SuspicionGuard(grid, 2, 2, 5);
        guard.tier = 2;
        guard.updateLight();
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                expect(grid.isLight(2 + dr, 2 + dc)).toBe(true);
            }
        }
    });

    it('at tier 0, lights nothing', () => {
        const grid = new GridSystem(5, 5, 50);
        const guard = new SuspicionGuard(grid, 2, 2, 5);
        guard.tier = 0;
        guard.updateLight();
        for (let r = 0; r < 5; r++)
            for (let c = 0; c < 5; c++)
                expect(grid.isLight(r, c)).toBe(false);
    });

    it('firing tier lights cells even at grid edge (no crash)', () => {
        const grid = new GridSystem(5, 5, 50);
        const guard = new SuspicionGuard(grid, 0, 0, 5);
        guard.tier = 2;
        expect(() => guard.updateLight()).not.toThrow();
        expect(grid.isLight(0, 0)).toBe(true);
        expect(grid.isLight(0, 1)).toBe(true);
        expect(grid.isLight(1, 0)).toBe(true);
    });

    it('capture/apply round-trips tier and range', () => {
        const grid = new GridSystem(5, 5, 50);
        const guard = new SuspicionGuard(grid, 2, 2, 4);
        guard.tier = 1;
        const s = guard.capture();
        guard.tier = 0;
        guard.range = 99;
        guard.apply(s);
        expect(guard.tier).toBe(1);
        expect(guard.range).toBe(4);
    });
});

describe('RotatingGuard — forcedFacing (throwable distraction)', () => {
    it('honors forcedFacingTurns when set, overriding normal rotation', () => {
        const grid = new GridSystem(5, 5, 50);
        const g = new RotatingGuard(grid, 2, 2, 0); // facing up
        g.forcedFacingTurns = 1;
        g.forcedFacingTarget = { row: 2, col: 4 }; // to the right
        g.onTurnChange([g]);
        // Should face right (1) not rotate to right(1) by normal increment — still 1
        expect(g.direction).toBe(1);
        expect(g.forcedFacingTurns).toBe(0);
        // Next turn: normal rotation resumes
        g.onTurnChange([g]);
        expect(g.direction).toBe(2); // normal +1 from 1
    });

    it('capture/apply preserves forcedFacing fields', () => {
        const grid = new GridSystem(5, 5, 50);
        const g = new RotatingGuard(grid, 2, 2, 0);
        g.forcedFacingTurns = 2;
        g.forcedFacingTarget = { row: 4, col: 4 };
        const s = g.capture();
        g.forcedFacingTurns = 0;
        g.forcedFacingTarget = null;
        g.apply(s);
        expect(g.forcedFacingTurns).toBe(2);
        expect(g.forcedFacingTarget).toEqual({ row: 4, col: 4 });
    });
});
