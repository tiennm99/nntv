import { describe, it, expect, beforeEach } from 'vitest';
import { GridSystem } from './grid-system.js';
import { Player } from './player.js';
import { TurnManager } from './turn-manager.js';
import { GameHistory } from './game-history.js';
import { PrincessMechanic } from './princess-mechanic.js';
import { ThrowableSystem } from './throwable.js';
import { RotatingGuard, ChaserGuard, PatrollingGuard } from './guards.js';

describe('GameHistory', () => {
    let grid, player, tm, history, princess;

    beforeEach(() => {
        grid = new GridSystem(5, 5, 50);
        player = new Player(grid, 0, 0);
        tm = new TurnManager();
        history = new GameHistory();
        princess = new PrincessMechanic();
    });

    it('round-trips player position through undo', () => {
        const snap = history.createSnapshot(player, [], tm.turnCount, princess.capture());
        history.pushSnapshot(snap);
        player.row = 2;
        player.col = 3;
        tm.turnCount = 5;
        const state = history.undo(player, [], tm, princess.capture());
        expect(state).not.toBeNull();
        expect(player.row).toBe(0);
        expect(player.col).toBe(0);
        expect(tm.turnCount).toBe(0);
    });

    it('round-trips guard state through undo', () => {
        const g = new RotatingGuard(grid, 2, 2, 0);
        const snap = history.createSnapshot(player, [g], tm.turnCount, princess.capture());
        history.pushSnapshot(snap);
        g.direction = 2;
        history.undo(player, [g], tm, princess.capture());
        expect(g.direction).toBe(0);
    });

    it('preserves chaser dynamic state (isChasing, targetRow)', () => {
        const g = new ChaserGuard(grid, 0, 0, 3);
        const snap = history.createSnapshot(player, [g], tm.turnCount, princess.capture());
        history.pushSnapshot(snap);
        g.isChasing = true;
        g.targetRow = 4;
        g.targetCol = 4;
        history.undo(player, [g], tm, princess.capture());
        expect(g.isChasing).toBe(false);
        expect(g.targetRow).toBe(0);
        expect(g.targetCol).toBe(0);
    });

    it('preserves patrolling guard path index + reversing', () => {
        const path = [{ row: 0, col: 0 }, { row: 0, col: 1 }];
        const g = new PatrollingGuard(grid, 0, 0, path);
        const snap = history.createSnapshot(player, [g], tm.turnCount, princess.capture());
        history.pushSnapshot(snap);
        g.currentPathIndex = 1;
        g.isReversing = true;
        history.undo(player, [g], tm, princess.capture());
        expect(g.currentPathIndex).toBe(0);
        expect(g.isReversing).toBe(false);
    });

    it('preserves princess.messageShown on undo', () => {
        const snap = history.createSnapshot(player, [], tm.turnCount, princess.capture());
        history.pushSnapshot(snap);
        princess.alerted = true;
        princess.messageShown = true;
        princess.alertRadius = 3;
        const state = history.undo(player, [], tm, princess.capture());
        // Apply returned princess state — matches the pre-alert snapshot
        princess.apply(state.princess);
        expect(princess.messageShown).toBe(false);
        expect(princess.alerted).toBe(false);
        expect(princess.alertRadius).toBe(0);
    });

    it('undo then redo restores post-mutation state', () => {
        const snap1 = history.createSnapshot(player, [], tm.turnCount, princess.capture());
        history.pushSnapshot(snap1);
        player.row = 3;
        tm.turnCount = 7;
        history.undo(player, [], tm, princess.capture());
        expect(player.row).toBe(0);
        history.redo(player, [], tm, princess.capture());
        expect(player.row).toBe(3);
        expect(tm.turnCount).toBe(7);
    });

    it('new action clears redo stack', () => {
        const snap1 = history.createSnapshot(player, [], tm.turnCount, princess.capture());
        history.pushSnapshot(snap1);
        player.row = 2;
        history.undo(player, [], tm, princess.capture());
        expect(history.canRedo()).toBe(true);

        const snap2 = history.createSnapshot(player, [], tm.turnCount, princess.capture());
        history.pushSnapshot(snap2);
        expect(history.canRedo()).toBe(false);
    });

    it('caps undo stack at MAX_HISTORY', () => {
        for (let i = 0; i < 60; i++) {
            const snap = history.createSnapshot(player, [], i, princess.capture());
            history.pushSnapshot(snap);
        }
        expect(history.undoStack.length).toBe(50);
    });

    it('undo returns null on empty stack', () => {
        expect(history.undo(player, [], tm, princess.capture())).toBeNull();
        expect(history.redo(player, [], tm, princess.capture())).toBeNull();
    });
});

describe('GameHistory — keys/doors/throwSystem snapshots', () => {
    let grid, player, tm, history, princess;

    beforeEach(() => {
        grid = new GridSystem(6, 6, 50);
        player = new Player(grid, 0, 0);
        tm = new TurnManager();
        history = new GameHistory();
        princess = new PrincessMechanic();
    });

    it('snapshot includes keysHeld', () => {
        player.addKey(1);
        const snap = history.createSnapshot(player, [], tm.turnCount, princess.capture(), grid, null);
        expect(snap.keysHeld).toBe(1);
    });

    it('snapshot includes keySnapshot (sparse array of remaining key cells)', () => {
        grid.setKey(2, 3, 1);
        grid.setKey(4, 5, 2);
        const snap = history.createSnapshot(player, [], tm.turnCount, princess.capture(), grid, null);
        expect(snap.keySnapshot).toEqual([[2, 3, 1], [4, 5, 2]]);
    });

    it('snapshot includes doorSnapshot (sparse array of remaining doors)', () => {
        grid.setDoor(1, 2, 1);
        grid.setDoor(3, 4, 2);
        const snap = history.createSnapshot(player, [], tm.turnCount, princess.capture(), grid, null);
        expect(snap.doorSnapshot).toEqual([[1, 2, 1], [3, 4, 2]]);
    });

    it('snapshot without grid yields null key/door snapshots (backward compat)', () => {
        const snap = history.createSnapshot(player, [], tm.turnCount, princess.capture());
        expect(snap.keySnapshot).toBeNull();
        expect(snap.doorSnapshot).toBeNull();
    });

    it('undo round-trips keysHeld: collect key → snapshot+push → undo → keysHeld=0', () => {
        grid.setKey(1, 0, 1);
        // Capture before key collection
        const before = history.createSnapshot(player, [], tm.turnCount, princess.capture(), grid, null);
        history.pushSnapshot(before);
        // Simulate player walking onto key cell
        player.moveTo(1, 0, 2); // moveDir=2=down; auto-collects key
        expect(player.getKeysHeld()).toBe(1);
        expect(grid.isKey(1, 0)).toBe(false); // key cleared from grid
        // Undo restores position, keysHeld, and key cell
        history.undo(player, [], tm, princess.capture(), grid, null);
        expect(player.row).toBe(0);
        expect(player.col).toBe(0);
        expect(player.getKeysHeld()).toBe(0);
        expect(grid.isKey(1, 0)).toBe(true);
        expect(grid.getKeyId(1, 0)).toBe(1);
    });

    it('undo round-trips door open: use key → open door → undo → door back, keysHeld=1', () => {
        grid.setKey(1, 0, 1);
        grid.setDoor(2, 0, 1);
        // Snapshot before key pickup
        const snap0 = history.createSnapshot(player, [], tm.turnCount, princess.capture(), grid, null);
        history.pushSnapshot(snap0);
        // Collect key
        player.moveTo(1, 0, 2);
        expect(player.getKeysHeld()).toBe(1);
        // Snapshot before opening door
        const snap1 = history.createSnapshot(player, [], tm.turnCount, princess.capture(), grid, null);
        history.pushSnapshot(snap1);
        // Open door (player has key, door clears on entry)
        player.moveTo(2, 0, 2);
        expect(grid.isDoor(2, 0)).toBe(false); // door opened
        // Undo: door reopens, player back at key cell
        history.undo(player, [], tm, princess.capture(), grid, null);
        expect(grid.isDoor(2, 0)).toBe(true);
        expect(player.row).toBe(1);
        expect(player.getKeysHeld()).toBe(1); // still holds key from snap1
    });

    it('snapshot captures throwSystem state', () => {
        const ts = new ThrowableSystem(3);
        const snap = history.createSnapshot(player, [], tm.turnCount, princess.capture(), grid, ts);
        expect(snap.throwSystem).toEqual({ stonesLeft: 3, pendingTarget: null });
    });

    it('undo restores stonesLeft via throwSystem', () => {
        const ts = new ThrowableSystem(3);
        // Snapshot at 3 stones
        const snap = history.createSnapshot(player, [], tm.turnCount, princess.capture(), grid, ts);
        history.pushSnapshot(snap);
        // Use a stone (simulate)
        ts.stonesLeft = 2;
        // Undo: stone count restored
        history.undo(player, [], tm, princess.capture(), grid, ts);
        expect(ts.stonesLeft).toBe(3);
    });
});
