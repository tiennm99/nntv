// Turn manager — pure JS, no framework dependency

export class TurnManager {
    constructor() {
        this.turnCount = 0;
    }

    // Process a turn: update guards, check detection
    // Returns { detected, levelComplete }
    nextTurn(grid, player, guards) {
        this.turnCount++;

        // Check if player reached goal
        if (grid.isGoal(player.row, player.col)) {
            return { detected: false, levelComplete: true };
        }

        // Clear current lights and update guards
        grid.clearAllLight();
        guards.forEach(guard => guard.onTurnChange(guards, player));

        // Check if player is now in a lit cell
        if (grid.isLight(player.row, player.col)) {
            return { detected: true, levelComplete: false };
        }

        return { detected: false, levelComplete: false };
    }

    // Simulate next turn to preview future lit cells (non-destructive)
    previewNextTurn(grid, player, guards) {
        // Snapshot guard states
        const snapshots = guards.map(g => ({
            row: g.row, col: g.col, direction: g.direction,
            isOn: g.isOn, currentPathIndex: g.currentPathIndex,
            isReversing: g.isReversing, isChasing: g.isChasing,
            isReturning: g.isReturning,
            targetRow: g.targetRow, targetCol: g.targetCol,
        }));

        // Run one turn on real guards
        grid.clearAllLight();
        guards.forEach(g => g.onTurnChange(guards, player));

        // Collect lit cells
        const previewSet = new Set();
        for (let r = 0; r < grid.rows; r++) {
            for (let c = 0; c < grid.cols; c++) {
                if (grid.isLight(r, c)) previewSet.add(`${r},${c}`);
            }
        }

        // Restore guard states
        guards.forEach((g, i) => {
            const s = snapshots[i];
            g.row = s.row; g.col = s.col; g.direction = s.direction;
            g.isOn = s.isOn;
            if (s.currentPathIndex !== undefined) g.currentPathIndex = s.currentPathIndex;
            if (s.isReversing !== undefined) g.isReversing = s.isReversing;
            if (s.isChasing !== undefined) g.isChasing = s.isChasing;
            if (s.isReturning !== undefined) g.isReturning = s.isReturning;
            if (s.targetRow !== undefined) g.targetRow = s.targetRow;
            if (s.targetCol !== undefined) g.targetCol = s.targetCol;
        });

        // Restore current lighting
        grid.clearAllLight();
        guards.forEach(g => g.updateLight(guards));

        return previewSet;
    }

    reset() {
        this.turnCount = 0;
    }
}
