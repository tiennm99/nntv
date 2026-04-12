import Phaser from 'phaser';
import { COLORS } from '../theme';

export class GridSystem {
    constructor(scene, rows, cols, cellSize) {
        this.scene = scene;
        this.rows = rows;
        this.cols = cols;
        this.cellSize = cellSize;

        // Create grid data
        this.grid = Array(rows).fill().map(() => Array(cols).fill().map(() => ({
            isWall: false,
            isGoal: false,
            isLight: false
        })));

        // Create graphics object for rendering
        this.graphics = this.scene.add.graphics();
    }

    // Resize grid
    resize(rows, cols) {
        this.rows = rows;
        this.cols = cols;

        // Create new grid data with new size
        this.grid = Array(rows).fill().map(() => Array(cols).fill().map(() => ({
            isWall: false,
            isGoal: false,
            isLight: false
        })));
    }

    // Check if position is valid
    isValidPosition(row, col) {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
    }

    // Set wall at position
    setWall(row, col, value) {
        if (this.isValidPosition(row, col)) {
            this.grid[row][col].isWall = value;
        }
    }

    // Check if position is a wall
    isWall(row, col) {
        if (this.isValidPosition(row, col)) {
            return this.grid[row][col].isWall;
        }
        return false;
    }

    // Set goal at position
    setGoal(row, col, value) {
        if (this.isValidPosition(row, col)) {
            this.grid[row][col].isGoal = value;
        }
    }

    // Check if position is a goal
    isGoal(row, col) {
        if (this.isValidPosition(row, col)) {
            return this.grid[row][col].isGoal;
        }
        return false;
    }

    // Set light at position
    setLight(row, col, value) {
        if (this.isValidPosition(row, col)) {
            this.grid[row][col].isLight = value;
        }
    }

    // Check if position is lit
    isLight(row, col) {
        if (this.isValidPosition(row, col)) {
            return this.grid[row][col].isLight;
        }
        return false;
    }

    // Convert grid coordinates to pixel coordinates
    gridToPixel(row, col) {
        return {
            x: col * this.cellSize + this.cellSize / 2,
            y: row * this.cellSize + this.cellSize / 2
        };
    }

    // Convert pixel coordinates to grid coordinates
    pixelToGrid(x, y) {
        return {
            row: Math.floor(y / this.cellSize),
            col: Math.floor(x / this.cellSize)
        };
    }

    // Render the grid
    render() {
        this.graphics.clear();

        // Draw grid cells
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = this.grid[row][col];
                const x = col * this.cellSize;
                const y = row * this.cellSize;

                // Draw cell background
                if (cell.isWall) {
                    this.graphics.fillStyle(COLORS.gridWall);
                } else if (cell.isGoal) {
                    this.graphics.fillStyle(COLORS.gridGoal);
                } else if (cell.isLight) {
                    this.graphics.fillStyle(COLORS.gridLit);
                } else {
                    this.graphics.fillStyle(COLORS.gridEmpty);
                }
                this.graphics.fillRect(x, y, this.cellSize, this.cellSize);

                // Draw cell border
                this.graphics.lineStyle(1, COLORS.gridBorder);
                this.graphics.strokeRect(x, y, this.cellSize, this.cellSize);
            }
        }
    }
}
