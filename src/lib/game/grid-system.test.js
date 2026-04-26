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

describe('GridSystem — door/key flags', () => {
    it('setDoor marks cell as door with keyId', () => {
        const g = new GridSystem(3, 3, 50);
        g.setDoor(1, 1, 'key-A');
        expect(g.isDoor(1, 1)).toBe(true);
        expect(g.getDoorKeyId(1, 1)).toBe('key-A');
    });

    it('clearDoor removes door flag', () => {
        const g = new GridSystem(3, 3, 50);
        g.setDoor(1, 1, 'key-A');
        g.clearDoor(1, 1);
        expect(g.isDoor(1, 1)).toBe(false);
        expect(g.getDoorKeyId(1, 1)).toBeNull();
    });

    it('setKey marks cell as key with keyId', () => {
        const g = new GridSystem(3, 3, 50);
        g.setKey(0, 2, 'key-A');
        expect(g.isKey(0, 2)).toBe(true);
        expect(g.getKeyId(0, 2)).toBe('key-A');
    });

    it('clearKey removes key flag', () => {
        const g = new GridSystem(3, 3, 50);
        g.setKey(0, 2, 'key-A');
        g.clearKey(0, 2);
        expect(g.isKey(0, 2)).toBe(false);
        expect(g.getKeyId(0, 2)).toBeNull();
    });

    it('ignores door/key setters on out-of-bounds positions', () => {
        const g = new GridSystem(2, 2, 50);
        g.setDoor(-1, 0, 'k');
        g.setKey(5, 5, 'k');
        expect(g.isDoor(-1, 0)).toBe(false);
        expect(g.isKey(5, 5)).toBe(false);
    });
});

describe('GridSystem — one-way flags', () => {
    it('setOneWay marks cell with allowed entry direction', () => {
        const g = new GridSystem(3, 3, 50);
        g.setOneWay(1, 1, 2); // only allow entry moving down
        expect(g.isOneWay(1, 1)).toBe(true);
        expect(g.getOneWayDir(1, 1)).toBe(2);
    });

    it('canEnterOneWay allows correct direction', () => {
        const g = new GridSystem(3, 3, 50);
        g.setOneWay(1, 1, 1); // allowed: moving right
        expect(g.canEnterOneWay(1, 1, 1)).toBe(true);
        expect(g.canEnterOneWay(1, 1, 0)).toBe(false);
        expect(g.canEnterOneWay(1, 1, 3)).toBe(false);
    });

    it('canEnterOneWay returns true for non-one-way cells', () => {
        const g = new GridSystem(3, 3, 50);
        expect(g.canEnterOneWay(1, 1, 0)).toBe(true);
    });

    it('clearOneWay removes one-way flag', () => {
        const g = new GridSystem(3, 3, 50);
        g.setOneWay(0, 0, 3);
        g.clearOneWay(0, 0);
        expect(g.isOneWay(0, 0)).toBe(false);
        expect(g.getOneWayDir(0, 0)).toBeNull();
    });
});

describe('GridSystem — warm tiles', () => {
    it('setWarm marks cell as warm with timer', () => {
        const g = new GridSystem(3, 3, 50);
        g.setWarm(1, 1, 1);
        expect(g.isWarm(1, 1)).toBe(true);
        expect(g.getWarmTurnsLeft(1, 1)).toBe(1);
    });

    it('tickWarmTimers decrements timer and clears isWarm at 0', () => {
        const g = new GridSystem(3, 3, 50);
        g.setWarm(0, 0, 1);
        g.tickWarmTimers();
        expect(g.isWarm(0, 0)).toBe(false);
        expect(g.getWarmTurnsLeft(0, 0)).toBe(0);
    });

    it('tickWarmTimers with timer > 1 decrements without clearing', () => {
        const g = new GridSystem(3, 3, 50);
        g.setWarm(0, 0, 3);
        g.tickWarmTimers();
        expect(g.isWarm(0, 0)).toBe(true);
        expect(g.getWarmTurnsLeft(0, 0)).toBe(2);
        g.tickWarmTimers();
        g.tickWarmTimers();
        expect(g.isWarm(0, 0)).toBe(false);
    });

    it('tickWarmTimers only affects warm cells', () => {
        const g = new GridSystem(3, 3, 50);
        g.setWarm(0, 0, 1);
        // (1,1) not warm
        g.tickWarmTimers();
        expect(g.isWarm(1, 1)).toBe(false);
        expect(g.getWarmTurnsLeft(1, 1)).toBe(0);
    });

    it('getWarmSnapshot returns sorted sparse array of warm cells', () => {
        const g = new GridSystem(4, 4, 50);
        g.setWarm(3, 1, 2);
        g.setWarm(0, 2, 1);
        g.setWarm(1, 0, 3);
        const snap = g.getWarmSnapshot();
        // Should be sorted row-major: (0,2), (1,0), (3,1)
        expect(snap).toEqual([
            [0, 2, 1],
            [1, 0, 3],
            [3, 1, 2],
        ]);
    });

    it('getWarmSnapshot returns empty array when no warm cells', () => {
        const g = new GridSystem(3, 3, 50);
        expect(g.getWarmSnapshot()).toEqual([]);
    });
});
