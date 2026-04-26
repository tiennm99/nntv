// Undo/redo state history for game turns.
// Snapshots player (including keysHeld), guards (via guard.capture()), turn count,
// princess state, throwSystem state, and grid key/door cell state.
//
// Phase 04.5 gap fix: keysHeld + key/door cell snapshots added here so that undo
// correctly restores inventory and grid state after key collection or door opening.

const MAX_HISTORY = 50;

export class GameHistory {
    constructor() {
        this.undoStack = [];
        this.redoStack = [];
    }

    // Create a snapshot object without pushing to history.
    // princessState: { alerted, alertRadius, messageShown } via princess.capture()
    // grid (optional): GridSystem instance — if provided, captures key/door cell state
    // throwSystem (optional): ThrowableSystem instance — if provided, captures stone/pending state
    createSnapshot(player, guards, turnCount, princessState, grid, throwSystem) {
        return {
            playerRow: player.row,
            playerCol: player.col,
            keysHeld: player.getKeysHeld ? player.getKeysHeld() : (player.keysHeld ?? 0),
            turnCount,
            princess: { ...princessState },
            guards: guards.map(g => g.capture()),
            // Grid snapshots: sparse arrays; null when grid not provided (e.g. levels without keys/doors)
            keySnapshot: grid ? grid.getKeySnapshot() : null,
            doorSnapshot: grid ? grid.getDoorSnapshot() : null,
            // ThrowSystem state: null when system not present
            throwSystem: throwSystem ? throwSystem.capture() : null,
        };
    }

    pushSnapshot(state) {
        this.undoStack.push(state);
        if (this.undoStack.length > MAX_HISTORY) this.undoStack.shift();
        this.redoStack = [];
    }

    // Restore a snapshot into live game objects.
    // grid and throwSystem are optional — pass null for levels that don't use them.
    _applySnapshot(state, player, guards, turnManager, grid, throwSystem) {
        player.row = state.playerRow;
        player.col = state.playerCol;
        if (player.setKeysHeld) player.setKeysHeld(state.keysHeld ?? 0);
        turnManager.turnCount = state.turnCount;
        guards.forEach((g, i) => g.apply(state.guards[i]));
        if (grid && state.keySnapshot !== null) grid.applyKeySnapshot(state.keySnapshot);
        if (grid && state.doorSnapshot !== null) grid.applyDoorSnapshot(state.doorSnapshot);
        if (throwSystem && state.throwSystem !== null) throwSystem.apply(state.throwSystem);
    }

    // Undo last move, returns restored state or null if nothing to undo
    // grid and throwSystem are optional extras passed from Game.svelte
    undo(player, guards, turnManager, princessState, grid, throwSystem) {
        if (this.undoStack.length === 0) return null;

        this.redoStack.push(this.createSnapshot(player, guards, turnManager.turnCount, princessState, grid, throwSystem));

        const state = this.undoStack.pop();
        this._applySnapshot(state, player, guards, turnManager, grid, throwSystem);

        return state;
    }

    redo(player, guards, turnManager, princessState, grid, throwSystem) {
        if (this.redoStack.length === 0) return null;

        this.undoStack.push(this.createSnapshot(player, guards, turnManager.turnCount, princessState, grid, throwSystem));

        const state = this.redoStack.pop();
        this._applySnapshot(state, player, guards, turnManager, grid, throwSystem);

        return state;
    }

    canUndo() { return this.undoStack.length > 0; }
    canRedo() { return this.redoStack.length > 0; }

    reset() {
        this.undoStack = [];
        this.redoStack = [];
    }
}
