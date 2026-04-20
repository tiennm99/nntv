import { describe, it, expect, beforeEach } from 'vitest';
import { GridSystem } from './grid-system.js';
import { Player } from './player.js';
import { TurnManager } from './turn-manager.js';
import { GameHistory } from './game-history.js';
import { PrincessMechanic } from './princess-mechanic.js';
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
