// Turn manager — pure JS, no framework dependency

export class TurnManager {
    constructor() {
        this.turnCount = 0;
    }

    // Process a turn: update guards, check detection
    // Returns { detected, levelComplete }
    nextTurn(grid, player, guards) {
        this.turnCount++;

        if (grid.isGoal(player.row, player.col)) {
            return { detected: false, levelComplete: true };
        }

        grid.clearAllLight();
        guards.forEach(guard => guard.onTurnChange(guards, player));

        if (grid.isLight(player.row, player.col)) {
            return { detected: true, levelComplete: false };
        }

        return { detected: false, levelComplete: false };
    }

    // Simulate next turn to preview future lit cells (non-destructive).
    // Uses each guard's capture()/apply() so new dynamic fields are picked up
    // automatically without touching this method.
    previewNextTurn(grid, player, guards) {
        const snaps = guards.map(g => g.capture());

        grid.clearAllLight();
        guards.forEach(g => g.onTurnChange(guards, player));

        const previewSet = new Set();
        for (let r = 0; r < grid.rows; r++) {
            for (let c = 0; c < grid.cols; c++) {
                if (grid.isLight(r, c)) previewSet.add(`${r},${c}`);
            }
        }

        guards.forEach((g, i) => g.apply(snaps[i]));
        grid.clearAllLight();
        guards.forEach(g => g.updateLight(guards));

        return previewSet;
    }

    reset() {
        this.turnCount = 0;
    }
}
