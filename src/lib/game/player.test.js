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

// ─── Door mechanics ────────────────────────────────────────────────────────────

describe('Player — door mechanics', () => {
    let grid;
    beforeEach(() => { grid = new GridSystem(4, 4, 50); });

    it('blocks move into door when player does not hold the key', () => {
        grid.setDoor(0, 1, 1); // keyId=1
        const p = new Player(grid, 0, 0);
        expect(p.move('right')).toBe(false);
        expect(p.col).toBe(0);
    });

    it('allows move into door when player holds matching key', () => {
        grid.setDoor(0, 1, 1);
        const p = new Player(grid, 0, 0);
        p.addKey(1);
        expect(p.move('right')).toBe(true);
        expect(p.col).toBe(1);
    });

    it('door is cleared (opened) after player passes through with key', () => {
        grid.setDoor(0, 1, 1);
        const p = new Player(grid, 0, 0);
        p.addKey(1);
        p.move('right'); // opens door
        expect(grid.isDoor(0, 1)).toBe(false);
    });

    it('door with keyId=null is always passable', () => {
        grid.setDoor(0, 1, null);
        const p = new Player(grid, 0, 0);
        expect(p.move('right')).toBe(true);
    });

    it('player with key for door A cannot pass door B', () => {
        grid.setDoor(0, 1, 2); // requires keyId=2
        const p = new Player(grid, 0, 0);
        p.addKey(1); // holds keyId=1
        expect(p.move('right')).toBe(false);
    });
});

// ─── One-way mechanics ─────────────────────────────────────────────────────────

describe('Player — one-way mechanics', () => {
    let grid;
    beforeEach(() => { grid = new GridSystem(5, 5, 50); });

    it('rejects entry when moving in wrong direction', () => {
        // one-way at (0,1) allows entry only when moving right (moveDir=1)
        grid.setOneWay(0, 1, 1); // dir=1=right
        const p = new Player(grid, 0, 2);
        // Moving left (moveDir=3) should be rejected
        expect(p.move('left')).toBe(false);
        expect(p.col).toBe(2);
    });

    it('accepts entry when moving in the correct direction', () => {
        grid.setOneWay(0, 1, 1); // dir=1=right — player must move right to enter
        const p = new Player(grid, 0, 0);
        expect(p.move('right')).toBe(true);
        expect(p.col).toBe(1);
    });

    it('rejects up-direction one-way when player moves down', () => {
        // one-way at (1,0) allows only upward entry (dir=0=up)
        grid.setOneWay(1, 0, 0);
        const p = new Player(grid, 0, 0);
        // Moving down (moveDir=2) into (1,0) should be rejected
        expect(p.move('down')).toBe(false);
    });

    it('accepts up-direction one-way when player moves up', () => {
        grid.setOneWay(1, 0, 0); // dir=0=up
        const p = new Player(grid, 2, 0);
        expect(p.move('up')).toBe(true);
        expect(p.row).toBe(1);
    });

    it('rejects left one-way when moving right', () => {
        grid.setOneWay(0, 1, 3); // dir=3=left
        const p = new Player(grid, 0, 0);
        expect(p.move('right')).toBe(false);
    });

    it('accepts left one-way when moving left', () => {
        grid.setOneWay(0, 1, 3); // dir=3=left
        const p = new Player(grid, 0, 2);
        expect(p.move('left')).toBe(true);
        expect(p.col).toBe(1);
    });

    it('skips direction check when moveDir=-1 (direct placement)', () => {
        grid.setOneWay(0, 1, 1); // dir=1=right
        const p = new Player(grid, 0, 0);
        // moveTo with moveDir=-1 bypasses one-way check
        expect(p.moveTo(0, 1, -1)).toBe(true);
    });
});

// ─── Key auto-collection ──────────────────────────────────────────────────────

describe('Player — key auto-collection', () => {
    let grid;
    beforeEach(() => { grid = new GridSystem(4, 4, 50); });

    it('auto-collects key when stepping on key cell', () => {
        grid.setKey(0, 1, 1);
        const p = new Player(grid, 0, 0);
        p.move('right');
        expect(p.hasKey(1)).toBe(true);
    });

    it('key cell is cleared after collection', () => {
        grid.setKey(0, 1, 1);
        const p = new Player(grid, 0, 0);
        p.move('right');
        expect(grid.isKey(0, 1)).toBe(false);
    });

    it('collecting key2 sets bit 1 (keyId=2)', () => {
        grid.setKey(0, 1, 2);
        const p = new Player(grid, 0, 0);
        p.move('right');
        expect(p.hasKey(2)).toBe(true);
        expect(p.hasKey(1)).toBe(false);
    });

    it('can hold multiple keys simultaneously', () => {
        grid.setKey(0, 1, 1);
        grid.setKey(0, 2, 2);
        const p = new Player(grid, 0, 0);
        p.move('right'); // collect key1
        p.move('right'); // collect key2
        expect(p.hasKey(1)).toBe(true);
        expect(p.hasKey(2)).toBe(true);
        expect(p.getKeysHeld()).toBe(0b11); // bits 0 and 1 set
    });

    it('collecting key then using it on door works end-to-end', () => {
        grid.setKey(0, 1, 1);
        grid.setDoor(0, 2, 1);
        const p = new Player(grid, 0, 0);
        p.move('right'); // step on key
        expect(p.hasKey(1)).toBe(true);
        expect(p.move('right')).toBe(true); // open door
        expect(p.col).toBe(2);
        expect(grid.isDoor(0, 2)).toBe(false);
    });
});

// ─── keysHeld bitmask round-trip via capture/apply ────────────────────────────

describe('Player — capture/apply round-trip', () => {
    let grid;
    beforeEach(() => { grid = new GridSystem(4, 4, 50); });

    it('capture preserves position and keysHeld', () => {
        const p = new Player(grid, 2, 3);
        p.addKey(1);
        p.addKey(3);
        const snap = p.capture();
        expect(snap.row).toBe(2);
        expect(snap.col).toBe(3);
        expect(snap.keysHeld).toBe(0b101); // bits 0 and 2 set
    });

    it('apply restores position and keysHeld', () => {
        const p = new Player(grid, 0, 0);
        p.apply({ row: 3, col: 2, keysHeld: 0b11 });
        expect(p.row).toBe(3);
        expect(p.col).toBe(2);
        expect(p.hasKey(1)).toBe(true);
        expect(p.hasKey(2)).toBe(true);
    });

    it('apply with missing keysHeld defaults to 0', () => {
        const p = new Player(grid, 0, 0);
        p.addKey(1);
        p.apply({ row: 1, col: 1 }); // no keysHeld field
        expect(p.getKeysHeld()).toBe(0);
    });

    it('capture/apply round-trips keysHeld faithfully', () => {
        const p = new Player(grid, 1, 1);
        p.addKey(2);
        const snap = p.capture();

        const p2 = new Player(grid, 0, 0);
        p2.apply(snap);
        expect(p2.getKeysHeld()).toBe(p.getKeysHeld());
        expect(p2.hasKey(2)).toBe(true);
        expect(p2.hasKey(1)).toBe(false);
    });

    it('setKeysHeld and getKeysHeld round-trip', () => {
        const p = new Player(grid, 0, 0);
        p.setKeysHeld(0b110);
        expect(p.getKeysHeld()).toBe(0b110);
        expect(p.hasKey(2)).toBe(true);
        expect(p.hasKey(3)).toBe(true);
        expect(p.hasKey(1)).toBe(false);
    });
});
