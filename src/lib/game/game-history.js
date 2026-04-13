// Undo/redo state history for game turns
// Snapshots player position, guard states, turn count, and princess alert state

const MAX_HISTORY = 50;

export class GameHistory {
    constructor() {
        this.undoStack = [];
        this.redoStack = [];
    }

    // Create a snapshot object without pushing to history
    createSnapshot(player, guards, turnCount, princessAlerted, alertRadius) {
        return {
            playerRow: player.row,
            playerCol: player.col,
            turnCount,
            princessAlerted,
            alertRadius,
            guards: guards.map(g => this.snapshotGuard(g)),
        };
    }

    // Push a pre-created snapshot to the undo stack
    pushSnapshot(state) {
        this.undoStack.push(state);
        if (this.undoStack.length > MAX_HISTORY) this.undoStack.shift();
        // Any new action clears the redo stack
        this.redoStack = [];
    }

    snapshotGuard(g) {
        const snap = {
            row: g.row, col: g.col, direction: g.direction, isOn: g.isOn,
        };
        if (g.type === 'patrolling') {
            snap.currentPathIndex = g.currentPathIndex;
            snap.isReversing = g.isReversing;
        }
        if (g.type === 'chaser') {
            snap.isChasing = g.isChasing;
            snap.isReturning = g.isReturning;
            snap.targetRow = g.targetRow;
            snap.targetCol = g.targetCol;
        }
        return snap;
    }

    // Restore game state from a snapshot
    restoreGuard(guard, snap) {
        guard.row = snap.row;
        guard.col = snap.col;
        guard.direction = snap.direction;
        guard.isOn = snap.isOn;
        if (snap.currentPathIndex !== undefined) guard.currentPathIndex = snap.currentPathIndex;
        if (snap.isReversing !== undefined) guard.isReversing = snap.isReversing;
        if (snap.isChasing !== undefined) guard.isChasing = snap.isChasing;
        if (snap.isReturning !== undefined) guard.isReturning = snap.isReturning;
        if (snap.targetRow !== undefined) guard.targetRow = snap.targetRow;
        if (snap.targetCol !== undefined) guard.targetCol = snap.targetCol;
    }

    // Undo last move, returns restored state or null if nothing to undo
    undo(player, guards, turnManager, princessAlerted, alertRadius) {
        if (this.undoStack.length === 0) return null;

        // Save current state to redo stack before undoing
        this.redoStack.push({
            playerRow: player.row,
            playerCol: player.col,
            turnCount: turnManager.turnCount,
            princessAlerted,
            alertRadius,
            guards: guards.map(g => this.snapshotGuard(g)),
        });

        const state = this.undoStack.pop();
        player.row = state.playerRow;
        player.col = state.playerCol;
        turnManager.turnCount = state.turnCount;
        guards.forEach((g, i) => this.restoreGuard(g, state.guards[i]));

        return state;
    }

    // Redo last undone move
    redo(player, guards, turnManager, princessAlerted, alertRadius) {
        if (this.redoStack.length === 0) return null;

        // Save current state to undo stack
        this.undoStack.push({
            playerRow: player.row,
            playerCol: player.col,
            turnCount: turnManager.turnCount,
            princessAlerted,
            alertRadius,
            guards: guards.map(g => this.snapshotGuard(g)),
        });

        const state = this.redoStack.pop();
        player.row = state.playerRow;
        player.col = state.playerCol;
        turnManager.turnCount = state.turnCount;
        guards.forEach((g, i) => this.restoreGuard(g, state.guards[i]));

        return state;
    }

    canUndo() { return this.undoStack.length > 0; }
    canRedo() { return this.redoStack.length > 0; }

    reset() {
        this.undoStack = [];
        this.redoStack = [];
    }
}
