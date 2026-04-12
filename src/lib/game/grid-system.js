// Grid data model — pure JS, no framework dependency

export class GridSystem {
    constructor(rows, cols, cellSize) {
        this.rows = rows;
        this.cols = cols;
        this.cellSize = cellSize;
        this.grid = this.createEmptyGrid(rows, cols);
    }

    createEmptyGrid(rows, cols) {
        return Array.from({ length: rows }, () =>
            Array.from({ length: cols }, () => ({
                isWall: false,
                isGoal: false,
                isLight: false,
            }))
        );
    }

    resize(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.grid = this.createEmptyGrid(rows, cols);
    }

    isValidPosition(row, col) {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
    }

    setWall(row, col, value) {
        if (this.isValidPosition(row, col)) this.grid[row][col].isWall = value;
    }

    isWall(row, col) {
        return this.isValidPosition(row, col) && this.grid[row][col].isWall;
    }

    setGoal(row, col, value) {
        if (this.isValidPosition(row, col)) this.grid[row][col].isGoal = value;
    }

    isGoal(row, col) {
        return this.isValidPosition(row, col) && this.grid[row][col].isGoal;
    }

    setLight(row, col, value) {
        if (this.isValidPosition(row, col)) this.grid[row][col].isLight = value;
    }

    isLight(row, col) {
        return this.isValidPosition(row, col) && this.grid[row][col].isLight;
    }

    // Clear all light from the grid
    clearAllLight() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.grid[row][col].isLight = false;
            }
        }
    }

    // Get flat array of all cells with positions (for rendering)
    getAllCells() {
        const cells = [];
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = this.grid[row][col];
                cells.push({ row, col, ...cell });
            }
        }
        return cells;
    }
}
