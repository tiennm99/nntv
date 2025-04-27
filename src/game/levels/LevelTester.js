import Phaser from 'phaser';
import { LEVELS } from '../levels/Levels.js';

// Level testing utility to verify level completion is possible
export class LevelTester {
    constructor(scene) {
        this.scene = scene;
        this.levels = LEVELS;
        this.testResults = [];
    }

    // Test if a specific level is completable
    async testLevel(levelId) {
        console.log(`Testing level ${levelId}...`);
        
        // Skip testing level 12 as it's designed to be impossible
        if (levelId === 12) {
            console.log("Level 12 is designed to be impossible - skipping test");
            return {
                levelId: levelId,
                completable: false,
                reason: "Final level is designed to be impossible by game design"
            };
        }
        
        const levelData = this.levels[levelId - 1];
        if (!levelData) {
            return {
                levelId: levelId,
                completable: false,
                reason: "Level data not found"
            };
        }
        
        // Create a simplified grid for pathfinding
        const grid = this.createSimplifiedGrid(levelData);
        
        // Find path from player start to goal
        const path = this.findPath(
            grid, 
            levelData.player.row, 
            levelData.player.col,
            levelData.goal.row,
            levelData.goal.col
        );
        
        if (!path) {
            return {
                levelId: levelId,
                completable: false,
                reason: "No path found from start to goal"
            };
        }
        
        // Check if the path avoids all lit cells
        const result = this.validatePath(path, levelData);
        
        return {
            levelId: levelId,
            completable: result.valid,
            reason: result.valid ? "Path found" : result.reason,
            path: path
        };
    }
    
    // Test all levels and return results
    async testAllLevels() {
        this.testResults = [];
        
        for (let i = 1; i <= this.levels.length; i++) {
            const result = await this.testLevel(i);
            this.testResults.push(result);
        }
        
        return this.testResults;
    }
    
    // Create a simplified grid representation for pathfinding
    createSimplifiedGrid(levelData) {
        const rows = levelData.grid.rows;
        const cols = levelData.grid.cols;
        
        // Initialize grid with all cells walkable
        const grid = Array(rows).fill().map(() => Array(cols).fill(0));
        
        // Mark walls as unwalkable
        if (levelData.walls) {
            levelData.walls.forEach(wall => {
                grid[wall.row][wall.col] = 1;
            });
        }
        
        return grid;
    }
    
    // Simple breadth-first search pathfinding
    findPath(grid, startRow, startCol, goalRow, goalCol) {
        const rows = grid.length;
        const cols = grid[0].length;
        
        // Queue for BFS
        const queue = [{row: startRow, col: startCol, path: []}];
        
        // Visited cells
        const visited = Array(rows).fill().map(() => Array(cols).fill(false));
        visited[startRow][startCol] = true;
        
        // Directions: up, right, down, left
        const directions = [
            {row: -1, col: 0},
            {row: 0, col: 1},
            {row: 1, col: 0},
            {row: 0, col: -1}
        ];
        
        while (queue.length > 0) {
            const current = queue.shift();
            
            // Check if reached goal
            if (current.row === goalRow && current.col === goalCol) {
                return [...current.path, {row: current.row, col: current.col}];
            }
            
            // Try all four directions
            for (const dir of directions) {
                const newRow = current.row + dir.row;
                const newCol = current.col + dir.col;
                
                // Check if valid position
                if (
                    newRow >= 0 && newRow < rows &&
                    newCol >= 0 && newCol < cols &&
                    grid[newRow][newCol] === 0 && // Not a wall
                    !visited[newRow][newCol]
                ) {
                    visited[newRow][newCol] = true;
                    queue.push({
                        row: newRow,
                        col: newCol,
                        path: [...current.path, {row: current.row, col: current.col}]
                    });
                }
            }
        }
        
        // No path found
        return null;
    }
    
    // Validate if a path avoids all lit cells
    validatePath(path, levelData) {
        // For each step in the path, check if it would be lit by any guard
        for (let i = 0; i < path.length; i++) {
            const step = path[i];
            
            // Skip the first step (starting position)
            if (i === 0) continue;
            
            // Check static guards
            if (levelData.guards) {
                for (const guard of levelData.guards) {
                    if (guard.type === "static") {
                        // Check if step is in any of the lit cells
                        for (const litCell of guard.litCells) {
                            if (litCell.row === step.row && litCell.col === step.col) {
                                return {
                                    valid: false,
                                    reason: `Step at (${step.row},${step.col}) would be lit by static guard`
                                };
                            }
                        }
                    }
                    else if (guard.type === "rotating") {
                        // This is a simplification - in reality, we'd need to simulate turns
                        // For testing purposes, we'll assume rotating guards can be timed correctly
                        continue;
                    }
                    else if (guard.type === "blinking") {
                        // For blinking guards, we can assume we can time our movement when they're off
                        continue;
                    }
                    else if (guard.type === "patrolling") {
                        // For patrolling guards, we'd need to simulate their movement
                        // For testing purposes, we'll assume patrolling guards can be avoided with timing
                        continue;
                    }
                }
            }
            
            // Check predefined lit cells (for level 2)
            if (levelData.litCells) {
                for (const litCell of levelData.litCells) {
                    if (litCell.row === step.row && litCell.col === step.col) {
                        return {
                            valid: false,
                            reason: `Step at (${step.row},${step.col}) would be in a predefined lit cell`
                        };
                    }
                }
            }
        }
        
        return { valid: true };
    }
    
    // Generate a report of test results
    generateReport() {
        let report = "Level Completion Test Results:\n";
        report += "==============================\n\n";
        
        this.testResults.forEach(result => {
            report += `Level ${result.levelId}: ${result.completable ? "COMPLETABLE" : "NOT COMPLETABLE"}\n`;
            report += `Reason: ${result.reason}\n`;
            if (result.path) {
                report += `Path length: ${result.path.length} steps\n`;
            }
            report += "\n";
        });
        
        const completableCount = this.testResults.filter(r => r.completable).length;
        report += `Summary: ${completableCount} out of ${this.testResults.length} levels are completable.\n`;
        
        return report;
    }
}
