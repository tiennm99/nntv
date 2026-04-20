// Princess escalating detection mechanic for final level
// Light radiates outward from goal in expanding Manhattan distance rings

export class PrincessMechanic {
    constructor() {
        this.alerted = false;
        this.alertRadius = 0;
        this.messageShown = false;
    }

    // Check if princess should activate or expand detection wave
    // Returns { showMessage, detected } flags
    update(grid, player, goalRow, goalCol) {
        const distance = Math.abs(player.row - goalRow) + Math.abs(player.col - goalCol);

        if (distance <= 4 && !this.alerted) {
            this.alerted = true;
            this.messageShown = true;
            this.alertRadius = 1;
            this.lightRing(grid, goalRow, goalCol, this.alertRadius);
            return { showMessage: true, detected: false };
        }

        if (this.alerted) {
            this.alertRadius++;
            this.lightRing(grid, goalRow, goalCol, this.alertRadius);
            if (grid.isLight(player.row, player.col)) {
                return { showMessage: false, detected: true };
            }
        }

        return { showMessage: false, detected: false };
    }

    // Light all non-wall cells within Manhattan distance of goal
    lightRing(grid, goalRow, goalCol, radius) {
        for (let r = 0; r < grid.rows; r++) {
            for (let c = 0; c < grid.cols; c++) {
                const dist = Math.abs(r - goalRow) + Math.abs(c - goalCol);
                if (dist <= radius && !grid.isWall(r, c)) {
                    grid.setLight(r, c, true);
                }
            }
        }
    }

    reset() {
        this.alerted = false;
        this.alertRadius = 0;
        this.messageShown = false;
    }

    capture() {
        return {
            alerted: this.alerted,
            alertRadius: this.alertRadius,
            messageShown: this.messageShown,
        };
    }

    apply(s) {
        this.alerted = s.alerted;
        this.alertRadius = s.alertRadius;
        this.messageShown = s.messageShown;
    }
}
