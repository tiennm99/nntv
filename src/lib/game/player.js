// Player data model — pure JS, no framework dependency

export class Player {
    constructor(grid, row, col) {
        this.grid = grid;
        this.row = row;
        this.col = col;
    }

    moveTo(row, col) {
        if (!this.grid.isValidPosition(row, col) || this.grid.isWall(row, col)) {
            return false;
        }
        this.row = row;
        this.col = col;
        return true;
    }

    move(direction) {
        let newRow = this.row;
        let newCol = this.col;

        switch (direction) {
            case 'up': newRow--; break;
            case 'down': newRow++; break;
            case 'left': newCol--; break;
            case 'right': newCol++; break;
        }

        return this.moveTo(newRow, newCol);
    }

    isInLitCell() {
        return this.grid.isLight(this.row, this.col);
    }

    isAtGoal() {
        return this.grid.isGoal(this.row, this.col);
    }
}
