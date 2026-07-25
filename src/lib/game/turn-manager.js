// Turn manager — pure JS, no framework dependency

import { MOBILE_GUARD_TYPES } from './guards.js';

// Every direction the player could take on their NEXT move: staying put, or
// stepping into an enterable neighbour. Used by previewNextTurn to evaluate
// player-reactive guards (chaser, suspicion) against every destination they
// might actually react to, not just the player's current position.
const MOVE_DIRS = [
    { row: -1, col: 0, moveDir: 0 }, // up
    { row: 0, col: 1, moveDir: 1 },  // right
    { row: 1, col: 0, moveDir: 2 },  // down
    { row: 0, col: -1, moveDir: 3 }, // left
];

export class TurnManager {
    constructor() {
        this.turnCount = 0;
    }

    // Process a turn: update guards, check detection.
    // Turn order:
    //   1. Goal check (early-out)
    //   2. throwSystem?.resolve(guards) — stone lands, guards face it
    //   3. grid.clearAllLight() — cells lit last turn become warm (afterglow)
    //   4. guards.forEach onTurnChange — guards move/rotate, emit light
    //   5. Detection check — lit OR warm cell, or a same-turn guard/player swap
    //   6. grid.tickWarmTimers() — warm cells created this turn expire next turn
    // Returns { detected, levelComplete }
    nextTurn(grid, player, guards, throwSystem = null) {
        this.turnCount++;

        if (grid.isGoal(player.row, player.col)) {
            return { detected: false, levelComplete: true };
        }

        // Snapshot mobile guard cells BEFORE they move this turn. Needed to
        // catch a same-turn swap: the player already moved into a cell a
        // guard occupied, and the guard is about to vacate it as part of its
        // own move — end-of-turn co-location alone can't see that crossing.
        const mobileGuardCellsBefore = guards
            .filter(g => MOBILE_GUARD_TYPES.has(g.type))
            .map(g => `${g.row},${g.col}`);

        if (throwSystem) throwSystem.resolve(guards);

        grid.clearAllLight();
        guards.forEach(guard => guard.onTurnChange(guards, player));

        const swappedWithGuard = mobileGuardCellsBefore.includes(`${player.row},${player.col}`);
        const detected = swappedWithGuard
            || grid.isLight(player.row, player.col)
            || grid.isWarm(player.row, player.col);

        // Tick AFTER detection so a cell that just went dark this turn is
        // still checked while warm (the 1-turn lethal afterglow); ticking
        // before detection cleared it in the same call it was created.
        grid.tickWarmTimers();

        return { detected, levelComplete: false };
    }

    // Simulate next turn to preview future lit/warm cells (non-destructive).
    // Evaluates EVERY action the player could take next (stay + each legal
    // move), not just the stationary case — guards that react to player
    // position (chaser BFS target, suspicion tier) behave differently per
    // destination, so previewing only "if I don't move" can paint a cell dark
    // that turns out lethal the instant the player actually steps there. The
    // returned set is the union of hazards across all candidate destinations.
    // Captures and restores guard, throwSystem, AND grid warm state so the
    // preview leaves nothing mutated (pressing the preview key must not create
    // real warm cells that outlive the preview).
    previewNextTurn(grid, player, guards, throwSystem = null) {
        const guardSnaps = guards.map(g => g.capture());
        const throwSnap = throwSystem ? throwSystem.capture() : null;
        const warmSnap = grid.getWarmSnapshot();

        // Advance the shared, player-position-independent part of the turn
        // once: the decay side effect (currently-lit decay-eligible cells
        // become warm) depends only on current guard-lit state, not on which
        // way the player moves, so it's safe to compute a single time before
        // branching per candidate destination below.
        grid.clearAllLight();

        const candidates = [{ row: player.row, col: player.col }];
        for (const d of MOVE_DIRS) {
            const nr = player.row + d.row;
            const nc = player.col + d.col;
            if (player.canEnter(nr, nc, d.moveDir)) candidates.push({ row: nr, col: nc });
        }

        const previewSet = new Set();

        for (const dest of candidates) {
            // Restore guard/throw baseline before simulating each candidate —
            // onTurnChange mutates guard position/direction/tier etc.
            guards.forEach((g, i) => g.apply(guardSnaps[i]));
            if (throwSystem && throwSnap) throwSystem.apply(throwSnap);

            // Reaching the goal ends the level before guards react — no hazard.
            if (grid.isGoal(dest.row, dest.col)) continue;

            grid.clearLight();
            if (throwSystem) throwSystem.resolve(guards);
            guards.forEach(g => g.onTurnChange(guards, dest));

            for (let r = 0; r < grid.rows; r++) {
                for (let c = 0; c < grid.cols; c++) {
                    if (grid.isLight(r, c) || grid.isWarm(r, c)) previewSet.add(`${r},${c}`);
                }
            }
        }

        // Undo everything the preview touched: guard/throw state, and the
        // warm transition applied above (the real turn has not happened yet).
        guards.forEach((g, i) => g.apply(guardSnaps[i]));
        if (throwSystem && throwSnap) throwSystem.apply(throwSnap);
        grid.applyWarmSnapshot(warmSnap);

        grid.clearLight();
        guards.forEach(g => g.updateLight(guards));

        return previewSet;
    }

    reset() {
        this.turnCount = 0;
    }
}
