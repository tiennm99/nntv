// Turn manager — pure JS, no framework dependency

export class TurnManager {
    constructor() {
        this.turnCount = 0;
    }

    // Process a turn: update guards, check detection.
    // Turn order:
    //   1. Goal check (early-out)
    //   2. throwSystem?.resolve(guards) — stone lands, guards face it
    //   3. grid.clearAllLight()
    //   4. guards.forEach onTurnChange — guards move/rotate, emit light
    //   5. grid.tickWarmTimers() — warm cells expire
    //   6. Detection check
    // Returns { detected, levelComplete }
    nextTurn(grid, player, guards, throwSystem = null) {
        this.turnCount++;

        if (grid.isGoal(player.row, player.col)) {
            return { detected: false, levelComplete: true };
        }

        if (throwSystem) throwSystem.resolve(guards);

        grid.clearAllLight();
        guards.forEach(guard => guard.onTurnChange(guards, player));

        grid.tickWarmTimers();

        if (grid.isLight(player.row, player.col)) {
            return { detected: true, levelComplete: false };
        }

        return { detected: false, levelComplete: false };
    }

    // Simulate next turn to preview future lit cells (non-destructive).
    // Captures and restores guard state AND throwSystem state so the preview
    // leaves nothing mutated.
    previewNextTurn(grid, player, guards, throwSystem = null) {
        const guardSnaps = guards.map(g => g.capture());
        const throwSnap = throwSystem ? throwSystem.capture() : null;

        grid.clearAllLight();

        // Apply throw distraction before guard update (same as nextTurn)
        if (throwSystem) throwSystem.resolve(guards);

        guards.forEach(g => g.onTurnChange(guards, player));

        const previewSet = new Set();
        for (let r = 0; r < grid.rows; r++) {
            for (let c = 0; c < grid.cols; c++) {
                if (grid.isLight(r, c)) previewSet.add(`${r},${c}`);
            }
        }

        // Restore guard state
        guards.forEach((g, i) => g.apply(guardSnaps[i]));
        if (throwSystem && throwSnap) throwSystem.apply(throwSnap);

        grid.clearAllLight();
        guards.forEach(g => g.updateLight(guards));

        return previewSet;
    }

    reset() {
        this.turnCount = 0;
    }
}
