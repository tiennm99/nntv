// Level loader — pure function, no framework dependency

import { LEVELS } from '../levels/levels.js';
import { GridSystem } from './grid-system.js';
import { Player } from './player.js';
import { StaticGuard, RotatingGuard, BlinkingGuard, PatrollingGuard, MirrorGuard, ChaserGuard } from './guards.js';

// Guard type registry — maps type strings to factory functions
const GUARD_REGISTRY = {
    static: (grid, g) => new StaticGuard(grid, g.position.row, g.position.col, g.initialRadius),
    rotating: (grid, g) => new RotatingGuard(grid, g.position.row, g.position.col, g.startDirection),
    blinking: (grid, g) => new BlinkingGuard(grid, g.position.row, g.position.col, g.litCells, g.startState),
    patrolling: (grid, g) => new PatrollingGuard(grid, g.startPosition.row, g.startPosition.col, g.path),
    mirror: (grid, g) => new MirrorGuard(grid, g.position.row, g.position.col, g.reflectDirection),
    chaser: (grid, g) => new ChaserGuard(grid, g.position.row, g.position.col, g.detectionRadius),
};

// Load a level by ID, returns complete game state
export function loadLevel(levelId) {
    if (levelId < 1 || levelId > LEVELS.length) return null;

    const data = LEVELS[levelId - 1];
    const rows = data.grid.rows;
    const cols = data.grid.cols || rows;
    const cellSize = 50;

    const grid = new GridSystem(rows, cols, cellSize);

    if (data.walls) {
        data.walls.forEach(w => grid.setWall(w.row, w.col, true));
    }

    if (data.goal) {
        grid.setGoal(data.goal.row, data.goal.col, true);
    }

    const player = new Player(grid, data.player.row, data.player.col);

    const guards = [];
    if (data.guards) {
        data.guards.forEach(g => {
            const factory = GUARD_REGISTRY[g.type];
            if (factory) guards.push(factory(grid, g));
        });
    }

    // Initialize guard lights (pass all guards for mirror reflection)
    guards.forEach(g => g.updateLight(guards));

    return {
        grid,
        player,
        guards,
        levelName: data.name,
        storyKey: data.storyKey,
        isFinalLevel: data.isFinalLevel || false,
        goalRow: data.goal.row,
        goalCol: data.goal.col,
        parMoves: data.parMoves || 99,
    };
}

export function getTotalLevels() {
    return LEVELS.length;
}
