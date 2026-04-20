// Undo/redo state history for game turns.
// Snapshots player, guards (via guard.capture()), turn count, and princess state.

const MAX_HISTORY = 50;

export class GameHistory {
    constructor() {
        this.undoStack = [];
        this.redoStack = [];
    }

    // Create a snapshot object without pushing to history.
    // princessState: { alerted, alertRadius, messageShown } via princess.capture()
    createSnapshot(player, guards, turnCount, princessState) {
        return {
            playerRow: player.row,
            playerCol: player.col,
            turnCount,
            princess: { ...princessState },
            guards: guards.map(g => g.capture()),
        };
    }

    pushSnapshot(state) {
        this.undoStack.push(state);
        if (this.undoStack.length > MAX_HISTORY) this.undoStack.shift();
        this.redoStack = [];
    }

    // Undo last move, returns restored state or null if nothing to undo
    undo(player, guards, turnManager, princessState) {
        if (this.undoStack.length === 0) return null;

        this.redoStack.push(this.createSnapshot(player, guards, turnManager.turnCount, princessState));

        const state = this.undoStack.pop();
        player.row = state.playerRow;
        player.col = state.playerCol;
        turnManager.turnCount = state.turnCount;
        guards.forEach((g, i) => g.apply(state.guards[i]));

        return state;
    }

    redo(player, guards, turnManager, princessState) {
        if (this.redoStack.length === 0) return null;

        this.undoStack.push(this.createSnapshot(player, guards, turnManager.turnCount, princessState));

        const state = this.redoStack.pop();
        player.row = state.playerRow;
        player.col = state.playerCol;
        turnManager.turnCount = state.turnCount;
        guards.forEach((g, i) => g.apply(state.guards[i]));

        return state;
    }

    canUndo() { return this.undoStack.length > 0; }
    canRedo() { return this.redoStack.length > 0; }

    reset() {
        this.undoStack = [];
        this.redoStack = [];
    }
}
