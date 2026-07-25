// ThrowableSystem — manages thrown stones mechanic.
// Stones distract rotating/patrolling/chaser guards within radius 2 of target.
// No imports from guards.js to avoid cyclic dependency — uses duck-typed type check.

// hasLineOfSight/DISTRACTIBLE_TYPES live in line-of-sight.js — the single
// shared copy also used by level-solver.js, so engine and solver can't drift.
import { hasLineOfSight, DISTRACTIBLE_TYPES } from './line-of-sight.js';

export class ThrowableSystem {
    constructor(stonesLeft = 0) {
        this.stonesLeft = stonesLeft;
        this.pendingTarget = null; // { row, col } | null
    }

    // Attempt to throw a stone at (targetRow, targetCol).
    // Validates: Manhattan ≤ 3 from player, line-of-sight (no wall between),
    // and stonesLeft > 0.
    // Returns true on success, false on failure.
    throw(targetRow, targetCol, player, grid) {
        if (this.stonesLeft <= 0) return false;

        const dist = Math.abs(targetRow - player.row) + Math.abs(targetCol - player.col);
        if (dist > 3) return false;

        if (!hasLineOfSight(grid, player.row, player.col, targetRow, targetCol)) {
            return false;
        }

        this.stonesLeft--;
        this.pendingTarget = { row: targetRow, col: targetCol };
        return true;
    }

    // Resolve the pending throw: for each distractible guard within Manhattan ≤ 2
    // of the pending target, set forcedFacingTurns=1 and forcedFacingTarget.
    // Called by TurnManager BEFORE guards.forEach(onTurnChange).
    // No-op if no pending target.
    resolve(guards) {
        if (!this.pendingTarget) return;
        const { row: tr, col: tc } = this.pendingTarget;

        for (const guard of guards) {
            if (!DISTRACTIBLE_TYPES.has(guard.type)) continue;
            const dist = Math.abs(guard.row - tr) + Math.abs(guard.col - tc);
            if (dist <= 2) {
                guard.forcedFacingTurns = 1;
                guard.forcedFacingTarget = { row: tr, col: tc };
            }
        }

        this.pendingTarget = null;
    }

    // Snapshot for undo / preview (non-destructive turn simulation)
    capture() {
        return {
            stonesLeft: this.stonesLeft,
            pendingTarget: this.pendingTarget
                ? { ...this.pendingTarget }
                : null,
        };
    }

    apply(s) {
        this.stonesLeft = s.stonesLeft;
        this.pendingTarget = s.pendingTarget
            ? { ...s.pendingTarget }
            : null;
    }

    // Reset to initial count, clearing any pending throw
    reset(stones) {
        this.stonesLeft = stones;
        this.pendingTarget = null;
    }
}
