// Level loader — pure function, no framework dependency

import { LEVELS } from '../levels/levels.js';
import { GridSystem } from './grid-system.js';
import { Player } from './player.js';
import { StaticGuard, RotatingGuard, BlinkingGuard, PatrollingGuard } from './guards.js';

// Load a level by ID, returns complete game state
export function loadLevel(levelId) {
    if (levelId < 1 || levelId > LEVELS.length) return null;

    const data = LEVELS[levelId - 1];
    const size = data.grid.rows;
    const cellSize = 50;

    const grid = new GridSystem(size, size, cellSize);

    // Set walls
    if (data.walls) {
        data.walls.forEach(w => grid.setWall(w.row, w.col, true));
    }

    // Set goal
    if (data.goal) {
        grid.setGoal(data.goal.row, data.goal.col, true);
    }

    // Create player
    const player = new Player(grid, data.player.row, data.player.col);

    // Create guards
    const guards = [];
    if (data.guards) {
        data.guards.forEach(g => {
            let guard = null;
            switch (g.type) {
                case 'static':
                    guard = new StaticGuard(grid, g.position.row, g.position.col, g.litCells);
                    break;
                case 'rotating':
                    guard = new RotatingGuard(grid, g.position.row, g.position.col, g.startDirection);
                    break;
                case 'blinking':
                    guard = new BlinkingGuard(grid, g.position.row, g.position.col, g.litCells, g.startState);
                    break;
                case 'patrolling':
                    guard = new PatrollingGuard(grid, g.startPosition.row, g.startPosition.col, g.path);
                    break;
            }
            if (guard) guards.push(guard);
        });
    }

    // Initialize guard lights
    guards.forEach(g => g.updateLight());

    return {
        grid,
        player,
        guards,
        levelName: data.name,
        storyKey: data.storyKey,
        isFinalLevel: data.isFinalLevel || false,
        goalRow: data.goal.row,
        goalCol: data.goal.col,
    };
}

export function getTotalLevels() {
    return LEVELS.length;
}
