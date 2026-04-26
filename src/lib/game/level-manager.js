// Level loader — pure function, no framework dependency

import { LEVELS } from '../levels/levels.js';
import { GridSystem } from './grid-system.js';
import { Player } from './player.js';
import { StaticGuard, RotatingGuard, BlinkingGuard, PatrollingGuard, MirrorGuard, ChaserGuard, SniperGuard, SuspicionGuard } from './guards.js';
import { ThrowableSystem } from './throwable.js';

// Guard type registry — maps type strings to factory functions
const GUARD_REGISTRY = {
    static: (grid, g) => new StaticGuard(grid, g.position.row, g.position.col, g.initialRadius),
    rotating: (grid, g) => new RotatingGuard(grid, g.position.row, g.position.col, g.startDirection),
    blinking: (grid, g) => new BlinkingGuard(grid, g.position.row, g.position.col, g.litCells, g.startState),
    patrolling: (grid, g) => new PatrollingGuard(grid, g.startPosition.row, g.startPosition.col, g.path),
    mirror: (grid, g) => new MirrorGuard(grid, g.position.row, g.position.col, g.reflectDirection),
    chaser: (grid, g) => new ChaserGuard(grid, g.position.row, g.position.col, g.detectionRadius),
    sniper: (grid, g) => new SniperGuard(grid, g.position.row, g.position.col, g.startFacing ?? 0, g.rotateCadence ?? 2),
    suspicion: (grid, g) => new SuspicionGuard(grid, g.position.row, g.position.col, g.range ?? 3),
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

    // Parse door tiles: setDoor(row, col, keyId) makes cell impassable until key collected
    if (data.doors) {
        data.doors.forEach(d => grid.setDoor(d.row, d.col, d.keyId));
    }

    // Parse key tiles: setKey(row, col, keyId) places collectible key on cell
    if (data.keys) {
        data.keys.forEach(k => grid.setKey(k.row, k.col, k.keyId));
    }

    // Parse one-way tiles: dir=0=up,1=right,2=down,3=left (allowed entry direction)
    if (data.oneWays) {
        data.oneWays.forEach(ow => grid.setOneWay(ow.row, ow.col, ow.dir));
    }

    // Parse decayTiles: marks cells as decay-eligible (warm timers activate on those cells only).
    // "all" = mark every non-wall cell; array = mark only listed cells.
    // Default: no decay (existing behavior).
    if (data.decayTiles === 'all') {
        grid.setDecayEligibleAll();
    } else if (Array.isArray(data.decayTiles)) {
        data.decayTiles.forEach(({ row, col }) => grid.setDecayEligible(row, col, true));
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

    const throwSystem = new ThrowableSystem(data.stones ?? 0);

    return {
        grid,
        player,
        guards,
        throwSystem,
        levelName: data.name,
        storyKey: data.storyKey,
        isFinalLevel: data.isFinalLevel || false,
        goalRow: data.goal.row,
        goalCol: data.goal.col,
        parMoves: data.parMoves || 99,
        // Return affordances so Game.svelte can read per-level gates
        affordances: data.affordances ?? { undo: true, preview: true },
        stones: data.stones ?? 0,
    };
}

export function getTotalLevels() {
    return LEVELS.length;
}
