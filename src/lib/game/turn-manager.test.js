import { describe, it, expect, beforeEach } from 'vitest';
import { GridSystem } from './grid-system.js';
import { Player } from './player.js';
import { TurnManager } from './turn-manager.js';
import { RotatingGuard, PatrollingGuard, ChaserGuard, BlinkingGuard } from './guards.js';

describe('TurnManager.nextTurn', () => {
    it('reports levelComplete when player is on goal', () => {
        const grid = new GridSystem(3, 3, 50);
        grid.setGoal(2, 2, true);
        const player = new Player(grid, 2, 2);
        const tm = new TurnManager();
        const r = tm.nextTurn(grid, player, []);
        expect(r.levelComplete).toBe(true);
    });

    it('reports detected when guards light up the player cell', () => {
        const grid = new GridSystem(3, 3, 50);
        const player = new Player(grid, 2, 0);
        const g = new RotatingGuard(grid, 2, 2, 3); // facing left
        const tm = new TurnManager();
        const r = tm.nextTurn(grid, player, [g]);
        // After rotation (3 → 0 = up), beam no longer points at player
        expect(r.detected).toBe(false);
    });

    it('increments turn count', () => {
        const grid = new GridSystem(3, 3, 50);
        const player = new Player(grid, 0, 0);
        const tm = new TurnManager();
        tm.nextTurn(grid, player, []);
        tm.nextTurn(grid, player, []);
        expect(tm.turnCount).toBe(2);
    });
});

describe('TurnManager.previewNextTurn — non-destructive', () => {
    it('does not mutate rotating guard direction', () => {
        const grid = new GridSystem(5, 5, 50);
        const player = new Player(grid, 0, 0);
        const g = new RotatingGuard(grid, 2, 2, 0);
        const tm = new TurnManager();
        tm.previewNextTurn(grid, player, [g]);
        expect(g.direction).toBe(0); // unchanged
    });

    it('does not mutate blinking guard isOn', () => {
        const grid = new GridSystem(3, 3, 50);
        const player = new Player(grid, 0, 0);
        const g = new BlinkingGuard(grid, 1, 1, [{ row: 0, col: 1 }], true);
        const tm = new TurnManager();
        tm.previewNextTurn(grid, player, [g]);
        expect(g.isOn).toBe(true);
    });

    it('does not mutate patrolling guard path index', () => {
        const grid = new GridSystem(3, 3, 50);
        const player = new Player(grid, 0, 0);
        const path = [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }];
        const g = new PatrollingGuard(grid, 0, 0, path);
        g.currentPathIndex = 1;
        const tm = new TurnManager();
        tm.previewNextTurn(grid, player, [g]);
        expect(g.currentPathIndex).toBe(1);
        expect(g.isReversing).toBe(false);
    });

    it('does not mutate chaser guard position or state', () => {
        const grid = new GridSystem(5, 5, 50);
        const player = new Player(grid, 0, 1); // adjacent to chaser
        const g = new ChaserGuard(grid, 0, 0, 3);
        const tm = new TurnManager();
        tm.previewNextTurn(grid, player, [g]);
        expect(g.row).toBe(0);
        expect(g.col).toBe(0);
        expect(g.isChasing).toBe(false);
    });

    it('restores current turn lights after preview', () => {
        const grid = new GridSystem(5, 5, 50);
        const player = new Player(grid, 0, 0);
        const g = new RotatingGuard(grid, 2, 2, 0); // up initially
        g.updateLight([g]);
        const litBeforePreview = new Set();
        for (let r = 0; r < grid.rows; r++)
            for (let c = 0; c < grid.cols; c++)
                if (grid.isLight(r, c)) litBeforePreview.add(`${r},${c}`);

        const tm = new TurnManager();
        tm.previewNextTurn(grid, player, [g]);

        const litAfterPreview = new Set();
        for (let r = 0; r < grid.rows; r++)
            for (let c = 0; c < grid.cols; c++)
                if (grid.isLight(r, c)) litAfterPreview.add(`${r},${c}`);

        expect(litAfterPreview).toEqual(litBeforePreview);
    });

    it('returned preview set matches the next real turn lights', () => {
        const grid = new GridSystem(5, 5, 50);
        const player = new Player(grid, 0, 0);
        const g = new RotatingGuard(grid, 2, 2, 0);
        const tm = new TurnManager();
        const predicted = tm.previewNextTurn(grid, player, [g]);

        tm.nextTurn(grid, player, [g]);
        const actual = new Set();
        for (let r = 0; r < grid.rows; r++)
            for (let c = 0; c < grid.cols; c++)
                if (grid.isLight(r, c)) actual.add(`${r},${c}`);

        expect(actual).toEqual(predicted);
    });
});
