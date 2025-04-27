import Phaser from 'phaser';

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
                    // Wall cells
                    this.graphics.fillStyle(0x666666);
                    this.graphics.fillRect(x, y, this.cellSize, this.cellSize);
                } else if (cell.isGoal) {
                    // Goal cells
                    this.graphics.fillStyle(0x00FF00);
                    this.graphics.fillRect(x, y, this.cellSize, this.cellSize);
                } else if (cell.isLight) {
                    // Lit cells
                    this.graphics.fillStyle(0xFFFF99);
                    this.graphics.fillRect(x, y, this.cellSize, this.cellSize);
                } else {
                    // Empty cells
                    this.graphics.fillStyle(0x333333);
                    this.graphics.fillRect(x, y, this.cellSize, this.cellSize);
                }
                
                // Draw cell border
                this.graphics.lineStyle(1, 0x444444);
                this.graphics.strokeRect(x, y, this.cellSize, this.cellSize);
            }
        }
    }
}
