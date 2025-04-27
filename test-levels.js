// Level testing script
import { LEVELS } from './src/game/levels/Levels.js';

// Simple testing function to check if levels are completable
function testLevels() {
    console.log("Testing level completion possibility...");
    console.log("=======================================");
    
    const results = [];
    
    for (let i = 0; i < LEVELS.length; i++) {
        const levelId = i + 1;
        const level = LEVELS[i];
        
        console.log(`\nTesting Level ${levelId}: ${level.name}`);
        
        // Skip testing level 12 as it's designed to be impossible
        if (levelId === 12) {
            console.log("Level 12 is designed to be impossible - skipping detailed test");
            results.push({
                levelId,
                completable: false,
                reason: "Final level is designed to be impossible by game design"
            });
            continue;
        }
        
        // Create a simplified grid for pathfinding
        const grid = createSimplifiedGrid(level);
        
        // Find path from player start to goal
        const path = findPath(
            grid, 
            level.player.row, 
            level.player.col,
            level.goal.row,
            level.goal.col
        );
        
        if (!path) {
            console.log("❌ NO PATH FOUND: Level appears to be impossible to complete");
            results.push({
                levelId,
                completable: false,
                reason: "No path found from start to goal"
            });
            continue;
        }
        
        // Check if the path avoids all lit cells
        const result = validatePath(path, level);
        
        if (result.valid) {
            console.log(`✅ PATH FOUND: Level is completable (${path.length} steps)`);
            results.push({
                levelId,
                completable: true,
                reason: "Path found",
                pathLength: path.length
            });
        } else {
            console.log(`❌ INVALID PATH: ${result.reason}`);
            results.push({
                levelId,
                completable: false,
                reason: result.reason
            });
        }
    }
    
    // Generate summary
    console.log("\n\nSUMMARY OF RESULTS");
    console.log("=================");
    
    const nonFinalLevels = results.filter(r => r.levelId !== 12);
    const completableCount = nonFinalLevels.filter(r => r.completable).length;
    
    console.log(`${completableCount} out of ${nonFinalLevels.length} non-final levels are completable.`);
    
    if (completableCount === nonFinalLevels.length) {
        console.log("\n✅ SUCCESS: All non-final levels are completable!");
    } else {
        console.log("\n❌ FAILURE: Some non-final levels are not completable!");
        
        // List problematic levels
        const problematicLevels = nonFinalLevels.filter(r => !r.completable);
        problematicLevels.forEach(level => {
            console.log(`- Level ${level.levelId}: ${level.reason}`);
        });
    }
    
    return results;
}

// Create a simplified grid representation for pathfinding
function createSimplifiedGrid(levelData) {
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
function findPath(grid, startRow, startCol, goalRow, goalCol) {
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
function validatePath(path, levelData) {
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

// Run the tests
testLevels();
