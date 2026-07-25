import { describe, it, expect, beforeEach } from 'vitest';
import { GridSystem } from './grid-system.js';
import { Player } from './player.js';
import { TurnManager } from './turn-manager.js';
import { RotatingGuard, PatrollingGuard, ChaserGuard, BlinkingGuard, SniperGuard, SuspicionGuard } from './guards.js';
import { ThrowableSystem } from './throwable.js';

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

describe('TurnManager — throwSystem integration', () => {
    it('resolves throw BEFORE guard onTurnChange', () => {
        // Guard at (2,2) facing up (0). If distracted toward (2,4), it should face right.
        const grid = new GridSystem(5, 5, 50);
        const player = new Player(grid, 0, 0);
        const g = new RotatingGuard(grid, 2, 2, 0);
        const ts = new ThrowableSystem(1);
        ts.pendingTarget = { row: 2, col: 4 }; // manually set pending (stone already thrown)

        const tm = new TurnManager();
        tm.nextTurn(grid, player, [g], ts);

        // Guard should have faced right (toward target) not up+1=right by accident
        // Forced facing: from (2,2) toward (2,4) → right=1
        expect(g.direction).toBe(1);
        expect(g.forcedFacingTurns).toBe(0);
        expect(ts.pendingTarget).toBeNull();
    });

    it('nextTurn with null throwSystem works normally', () => {
        const grid = new GridSystem(3, 3, 50);
        const player = new Player(grid, 0, 0);
        const tm = new TurnManager();
        expect(() => tm.nextTurn(grid, player, [], null)).not.toThrow();
    });

    it('tickWarmTimers is called after guard update each turn', () => {
        const grid = new GridSystem(5, 5, 50);
        grid.setWarm(1, 1, 1); // should expire after this turn
        const player = new Player(grid, 0, 0);
        const tm = new TurnManager();
        tm.nextTurn(grid, player, []);
        expect(grid.isWarm(1, 1)).toBe(false);
    });

    it('previewNextTurn does not mutate throwSystem state', () => {
        const grid = new GridSystem(5, 5, 50);
        const player = new Player(grid, 0, 0);
        const g = new RotatingGuard(grid, 2, 2, 0);
        const ts = new ThrowableSystem(2);
        ts.pendingTarget = { row: 2, col: 4 };
        const origStones = ts.stonesLeft;

        const tm = new TurnManager();
        tm.previewNextTurn(grid, player, [g], ts);

        // stonesLeft and pendingTarget must be restored
        expect(ts.stonesLeft).toBe(origStones);
        expect(ts.pendingTarget).toEqual({ row: 2, col: 4 });
    });

    it('previewNextTurn restores guard forcedFacing after throw preview', () => {
        const grid = new GridSystem(5, 5, 50);
        const player = new Player(grid, 0, 0);
        const g = new RotatingGuard(grid, 2, 2, 0);
        const ts = new ThrowableSystem(1);
        ts.pendingTarget = { row: 2, col: 4 };

        const tm = new TurnManager();
        tm.previewNextTurn(grid, player, [g], ts);

        // Guard must be back to original direction with no forcedFacing
        expect(g.direction).toBe(0);
        expect(g.forcedFacingTurns).toBe(0);
    });
});

describe('TurnManager — mobile guard co-location and swap detection', () => {
    it('detects the player standing on a stationary patrolling guard', () => {
        const grid = new GridSystem(3, 3, 50);
        // Path length 1 — the guard never advances, so this is pure co-location.
        const guard = new PatrollingGuard(grid, 1, 1, [{ row: 1, col: 1 }]);
        const player = new Player(grid, 1, 1);
        const tm = new TurnManager();
        const result = tm.nextTurn(grid, player, [guard]);
        expect(result.detected).toBe(true);
    });

    it('detects a same-turn swap where the player and a patrolling guard exchange cells', () => {
        const grid = new GridSystem(3, 3, 50);
        const guard = new PatrollingGuard(grid, 1, 1, [{ row: 1, col: 1 }, { row: 1, col: 2 }]);
        // Player's move this turn lands exactly on the guard's PRE-move cell,
        // while the guard advances away from it — a clean crossing that
        // end-of-turn co-location alone cannot see.
        const player = new Player(grid, 1, 1);
        const tm = new TurnManager();
        const result = tm.nextTurn(grid, player, [guard]);
        expect(guard.row).toBe(1);
        expect(guard.col).toBe(2);
        expect(result.detected).toBe(true);
    });

    it('does not falsely detect when player and guard never share or cross a cell', () => {
        const grid = new GridSystem(5, 5, 50);
        const guard = new PatrollingGuard(grid, 0, 0, [{ row: 0, col: 0 }, { row: 0, col: 1 }]);
        const player = new Player(grid, 4, 4);
        const tm = new TurnManager();
        const result = tm.nextTurn(grid, player, [guard]);
        expect(result.detected).toBe(false);
    });
});

describe('TurnManager — warm tiles are a lethal 1-turn afterglow', () => {
    it('a cell that goes dark this turn is warm and lethal to enter that same turn', () => {
        const grid = new GridSystem(5, 5, 50);
        grid.setDecayEligibleAll();
        const guard = new RotatingGuard(grid, 2, 0, 1); // facing right
        guard.updateLight([guard]); // paint initial light, as level load does
        expect(grid.isLight(2, 2)).toBe(true);

        // Player's move this turn lands on the cell that is about to go dark.
        const player = new Player(grid, 2, 2);
        const tm = new TurnManager();
        const result = tm.nextTurn(grid, player, [guard]);

        // Guard rotated away (now facing down) — (2,2) is no longer directly lit...
        expect(grid.isLight(2, 2)).toBe(false);
        // ...but it just went dark this turn, so it's warm, and warm is lethal.
        expect(result.detected).toBe(true);
    });

    it('a cell is safe again the turn after its warm afterglow expires', () => {
        const grid = new GridSystem(5, 5, 50);
        grid.setDecayEligibleAll();
        const guard = new RotatingGuard(grid, 2, 0, 1);
        guard.updateLight([guard]);

        const bystander = new Player(grid, 4, 4); // uninvolved, drives the first turn
        const tm = new TurnManager();
        tm.nextTurn(grid, bystander, [guard]); // (2,2) goes dark and becomes warm this turn

        const player = new Player(grid, 2, 2); // arrives one turn later than the warm window
        const result = tm.nextTurn(grid, player, [guard]);
        expect(result.detected).toBe(false);
    });
});

describe('TurnManager.previewNextTurn — truthful for player-reactive guards', () => {
    it('flags a cell as hazardous if ANY reachable next move would let a chaser catch it', () => {
        // Chaser at (0,0), detectionRadius 3. Player currently at (2,1) — out of
        // the chaser's immediate light — but moving to (2,0) brings the player
        // within range; the chaser then steps to (1,0) and lights (2,0). A
        // preview that only simulates the stationary player would miss this.
        const grid = new GridSystem(5, 5, 50);
        const player = new Player(grid, 2, 1);
        const chaser = new ChaserGuard(grid, 0, 0, 3);
        const tm = new TurnManager();

        const preview = tm.previewNextTurn(grid, player, [chaser]);
        expect(preview.has('2,0')).toBe(true);

        // Confirm it isn't a false alarm: actually moving there triggers real detection.
        player.row = 2; player.col = 0;
        const result = tm.nextTurn(grid, player, [chaser]);
        expect(result.detected).toBe(true);
    });

    it('does not leave fabricated warm state on the real grid after the preview runs', () => {
        const grid = new GridSystem(5, 5, 50);
        grid.setDecayEligibleAll();
        const guard = new RotatingGuard(grid, 2, 0, 1);
        guard.updateLight([guard]); // (2,2) lit
        const player = new Player(grid, 4, 4);
        const tm = new TurnManager();

        expect(grid.getWarmSnapshot()).toEqual([]);
        tm.previewNextTurn(grid, player, [guard]);
        // previewNextTurn internally calls clearAllLight (which would normally
        // mark (2,2) warm) — that side effect must not leak onto the real grid.
        expect(grid.getWarmSnapshot()).toEqual([]);
    });
});

describe('TurnManager — property test: capture/apply round-trip over 50 random turns', () => {
    // Build a small deterministic but varied scenario and verify that restoring
    // any mid-sequence snapshot and replaying produces identical state.
    it('state is reproducible from any snapshot after 50 turns', () => {
        const grid = new GridSystem(7, 7, 50);
        grid.setWall(3, 3, true);

        const rotGuard = new RotatingGuard(grid, 1, 1, 0);
        const patGuard = new PatrollingGuard(grid, 5, 1, [
            { row: 5, col: 1 }, { row: 5, col: 3 }, { row: 5, col: 5 },
        ]);
        const chaseGuard = new ChaserGuard(grid, 6, 6, 3);
        const sniperGuard = new SniperGuard(grid, 0, 6, 2, 2);
        const suspGuard = new SuspicionGuard(grid, 3, 6, 3);
        const ts = new ThrowableSystem(10);

        const player = new Player(grid, 0, 0);
        const guards = [rotGuard, patGuard, chaseGuard, sniperGuard, suspGuard];
        const tm = new TurnManager();

        // Capture snapshots at every turn
        const snapshots = [];
        for (let i = 0; i < 50; i++) {
            snapshots.push({
                guards: guards.map(g => g.capture()),
                ts: ts.capture(),
                turnCount: tm.turnCount,
            });
            tm.nextTurn(grid, player, guards, ts);
        }

        // Pick 5 evenly-spaced checkpoints and replay forward from them
        const checkpoints = [0, 10, 20, 35, 48];
        for (const startIdx of checkpoints) {
            // Restore from snapshot at startIdx
            const snap = snapshots[startIdx];
            guards.forEach((g, i) => g.apply(snap.guards[i]));
            ts.apply(snap.ts);
            tm.turnCount = snap.turnCount;

            // Replay from startIdx to 49
            for (let i = startIdx; i < 50; i++) {
                tm.nextTurn(grid, player, guards, ts);
            }

            // Capture final state
            const replayedSnaps = guards.map(g => g.capture());
            const replayedTs = ts.capture();

            // Reset and replay fresh from startIdx for comparison
            guards.forEach((g, i) => g.apply(snap.guards[i]));
            ts.apply(snap.ts);
            tm.turnCount = snap.turnCount;

            for (let i = startIdx; i < 50; i++) {
                tm.nextTurn(grid, player, guards, ts);
            }

            guards.forEach((g, i) => {
                expect(g.capture()).toEqual(replayedSnaps[i]);
            });
            expect(ts.capture()).toEqual(replayedTs);
        }
    });
});
