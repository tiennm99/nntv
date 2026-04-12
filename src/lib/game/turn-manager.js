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
        guards.forEach(guard => guard.onTurnChange());

        // Check if player is now in a lit cell
        if (grid.isLight(player.row, player.col)) {
            return { detected: true, levelComplete: false };
        }

        return { detected: false, levelComplete: false };
    }

    reset() {
        this.turnCount = 0;
    }
}
