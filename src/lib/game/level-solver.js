// BFS solver for level solvability validation.
// Replays the real turn pipeline (guards.js + princess-mechanic.js) so solver
// verdicts match runtime behavior exactly — no reimplementation of AI.
//
// State captures: player pos, guard snapshots, princess snapshot,
// stonesLeft, pendingTarget, keysBitmask (reserved, always 0 this phase),
// and warm-tile snapshot.
//
// Usage:
//   const result = solveLevel(levelId, { maxStates: 2_000_000 });
//   // { solvable, path?, reason?, states_explored }

import { loadLevel } from './level-manager.js';
import { PrincessMechanic } from './princess-mechanic.js';
import { MOBILE_GUARD_TYPES } from './guards.js';
import { isValidThrowTarget } from './line-of-sight.js';

const BASE_ACTIONS = ['up', 'down', 'left', 'right', 'wait'];
const DEFAULT_MAX_STATES = 2_000_000;

// ─── Canonical guard key by type ────────────────────────────────────────────
// Fixed field order per guard type prevents key-order flakiness.

function canonicalGuardKey(g) {
    // Base fields present in all guard captures: row, col, direction, isOn
    const base = `${g.row},${g.col},${g.direction},${g.isOn ? 1 : 0}`;

    switch (g.type ?? '_') {
        case 'static':
            return `st:${base},${g.currentRadius}`;
        case 'rotating':
            return `ro:${base},${g.forcedFacingTurns ?? 0},${
                g.forcedFacingTarget ? `${g.forcedFacingTarget.row}:${g.forcedFacingTarget.col}` : ''
            }`;
        case 'blinking':
            return `bl:${base}`;
        case 'patrolling':
            return `pa:${base},${g.currentPathIndex},${g.isReversing ? 1 : 0},${g.forcedFacingTurns ?? 0},${
                g.forcedFacingTarget ? `${g.forcedFacingTarget.row}:${g.forcedFacingTarget.col}` : ''
            }`;
        case 'mirror':
            return `mi:${base}`;
        case 'chaser':
            return `ch:${base},${g.isChasing ? 1 : 0},${g.isReturning ? 1 : 0},${g.targetRow},${g.targetCol},${g.forcedFacingTurns ?? 0},${
                g.forcedFacingTarget ? `${g.forcedFacingTarget.row}:${g.forcedFacingTarget.col}` : ''
            }`;
        case 'sniper':
            return `sn:${base},${g.facing},${g.turnsSinceRotate}`;
        case 'suspicion':
            return `su:${base},${g.tier}`;
        default:
            // Unknown type — fall back to full base
            return `uk:${base}`;
    }
}

function canonicalPrincessKey(pr) {
    // PrincessMechanic capture fields: alerted, alertRadius, messageShown
    return `${pr.alerted ? 1 : 0}|${pr.alertRadius ?? 0}|${pr.messageShown ? 1 : 0}`;
}

// ─── Canonical state key ─────────────────────────────────────────────────────

function stateKey(s) {
    return [
        s.p.r, s.p.c,
        s.s ?? 0,
        // keys bitmask: differentiates states where player holds different keys
        s.k ?? 0,
        s.pt ? `${s.pt.row},${s.pt.col}` : '',
        s.g.map(canonicalGuardKey).join('|'),
        s.pr ? canonicalPrincessKey(s.pr) : '',
        s.w.map(([r, c, t]) => `${r},${c},${t}`).join(';'),
        // remaining key cells: differentiates states where different keys have been collected
        (s.kc ?? []).map(([r, c, k]) => `${r},${c},${k}`).join(','),
        // remaining door cells: differentiates states where doors have been opened
        (s.dc ?? []).map(([r, c, k]) => `${r},${c},${k}`).join(','),
    ].join('#');
}

// ─── State capture / apply ───────────────────────────────────────────────────

function captureState(player, guards, princess, throwSystem, grid) {
    const ts = throwSystem ? throwSystem.capture() : { stonesLeft: 0, pendingTarget: null };
    return {
        p: { r: player.row, c: player.col },
        g: guards.map(x => x.capture()),
        pr: princess ? princess.capture() : null,
        // stones left
        s: ts.stonesLeft,
        // pending throw target (null or {row,col})
        pt: ts.pendingTarget ? { ...ts.pendingTarget } : null,
        // keys bitmask: actual held keys from player
        k: player.getKeysHeld ? player.getKeysHeld() : 0,
        // warm-tile snapshot
        w: grid.getWarmSnapshot(),
        // remaining key cells snapshot: [[r, c, keyId], ...]
        kc: grid.getKeySnapshot(),
        // remaining door cells snapshot: [[r, c, keyId], ...] — doors can be opened by player
        dc: grid.getDoorSnapshot(),
    };
}

function applyState(state, player, guards, princess, throwSystem, grid) {
    player.row = state.p.r;
    player.col = state.p.c;
    // Restore keys bitmask
    if (player.setKeysHeld) player.setKeysHeld(state.k ?? 0);
    guards.forEach((x, i) => x.apply(state.g[i]));
    if (princess && state.pr) princess.apply(state.pr);
    if (throwSystem) {
        throwSystem.apply({
            stonesLeft: state.s ?? 0,
            pendingTarget: state.pt ? { ...state.pt } : null,
        });
    }
    grid.applyWarmSnapshot(state.w);
    // Restore key cells so collected keys don't linger across state branches
    grid.applyKeySnapshot(state.kc ?? []);
    // Restore door cells so opened doors don't linger across state branches
    grid.applyDoorSnapshot(state.dc ?? []);
}

// ─── Throw target enumeration ────────────────────────────────────────────────
// Returns ['throw_to_<r>_<c>', ...] for valid throw targets from current player pos.
// Validity (LOS, Manhattan ≤3, ≥1 distractible guard within 2) is the shared
// isValidThrowTarget contract from line-of-sight.js — the same one throwable.js
// enforces at the engine level, so the solver can't certify a throw the live
// game would reject (or vice versa).
export function enumerateThrowTargets(player, grid, guards, stonesLeft) {
    if (stonesLeft <= 0) return [];

    const targets = [];
    const pr = player.row;
    const pc = player.col;

    for (let r = 0; r < grid.rows; r++) {
        for (let c = 0; c < grid.cols; c++) {
            if (r === pr && c === pc) continue; // skip player's own cell
            if (isValidThrowTarget(grid, guards, pr, pc, r, c)) {
                targets.push(`throw_to_${r}_${c}`);
            }
        }
    }

    return targets;
}

// ─── Turn simulation ─────────────────────────────────────────────────────────
// Matches TurnManager.nextTurn pipeline:
//   1. Goal check (early-out)
//   2. throwSystem?.resolve(guards)
//   3. clearAllLight — cells lit last turn become warm (afterglow)
//   4. guards.forEach onTurnChange
//   5. Detection check — lit OR warm cell, princess, or a same-turn guard/player swap
//   6. tickWarmTimers — warm cells created this turn expire next turn
// Returns { detected, levelComplete }

// Exported (alongside enumerateThrowTargets) so tests can pin its parity with
// TurnManager.nextTurn directly, rather than only indirectly through solveLevel.
export function simulateTurn(grid, player, guards, princess, goalRow, goalCol, throwSystem) {
    if (grid.isGoal(player.row, player.col)) {
        return { detected: false, levelComplete: true };
    }

    // Snapshot mobile guard cells BEFORE they move this turn — same
    // swap/co-location rule as TurnManager.nextTurn (see guards.js).
    const mobileGuardCellsBefore = guards
        .filter(g => MOBILE_GUARD_TYPES.has(g.type))
        .map(g => `${g.row},${g.col}`);

    if (throwSystem) throwSystem.resolve(guards);

    grid.clearAllLight();
    guards.forEach(g => g.onTurnChange(guards, player));

    let detected = mobileGuardCellsBefore.includes(`${player.row},${player.col}`);

    if (!detected && princess) {
        const r = princess.update(grid, player, goalRow, goalCol);
        if (r.detected) detected = true;
    }
    if (!detected && (grid.isLight(player.row, player.col) || grid.isWarm(player.row, player.col))) {
        detected = true;
    }

    // Tick AFTER detection so a cell that just went dark this turn is still
    // checked while warm (see turn-manager.js nextTurn for the full rationale).
    grid.tickWarmTimers();

    return { detected, levelComplete: false };
}

// ─── Main solver ─────────────────────────────────────────────────────────────

export function solveLevel(levelId, options = {}) {
    const maxStates = options.maxStates ?? DEFAULT_MAX_STATES;
    const init = loadLevel(levelId);
    if (!init) return { solvable: false, reason: 'invalid_level', states_explored: 0 };

    const { grid, player, guards, throwSystem, isFinalLevel, goalRow, goalCol, parMoves } = init;
    // The final level (isFinalLevel, id 12) is INTENTIONALLY unsolvable — an
    // owner-confirmed easter egg, not a bug. The live game additionally
    // resolves the princess check before the goal-complete check on that one
    // level, which this solver deliberately does NOT reproduce (see
    // simulateTurn's goal early-out above); do not "fix" this solver to match
    // that ordering, and do not treat a future L12 solvability regression here
    // as something to repair — confirm with the level-design owner first.
    const princess = isFinalLevel ? new PrincessMechanic() : null;

    // parMoves pruning: prune paths longer than ceil(parMoves * 1.5)
    const parCap = (parMoves && parMoves < 99)
        ? Math.ceil(parMoves * 1.5)
        : null;

    if (player.row === goalRow && player.col === goalCol) {
        return { solvable: true, path: [], states_explored: 0 };
    }

    const startState = captureState(player, guards, princess, throwSystem, grid);
    const visited = new Set([stateKey(startState)]);
    const queue = [{ state: startState, path: [] }];
    let explored = 0;

    while (queue.length > 0) {
        if (explored >= maxStates) {
            return { solvable: false, reason: 'budget_exhausted', states_explored: explored };
        }

        const { state, path } = queue.shift();
        explored++;

        // Path-length pruning based on par
        if (parCap !== null && path.length >= parCap) continue;

        // Restore parent state before enumerating throws so eligibility is computed
        // against the actual parent guards/grid, not stale state from a prior inner loop.
        // Use clearLight() (no decay side effect) — the parent's warm state was
        // already restored verbatim by applyState via the warm snapshot, so
        // re-deriving it from clearAllLight()'s decay logic here would fabricate
        // warm cells that were never part of the parent state.
        applyState(state, player, guards, princess, throwSystem, grid);
        grid.clearLight();
        guards.forEach(g => g.updateLight(guards));

        // Build action list: base actions + throw targets
        const throwActions = enumerateThrowTargets(
            { row: state.p.r, col: state.p.c },
            grid,
            guards,
            state.s ?? 0
        );
        const actions = BASE_ACTIONS.concat(throwActions);

        for (const action of actions) {
            // Restore parent state into shared mutable engine objects (for each action attempt).
            // clearLight() only — see the identical rationale above this loop.
            applyState(state, player, guards, princess, throwSystem, grid);
            grid.clearLight();
            guards.forEach(g => g.updateLight(guards));

            // Apply player action
            if (action.startsWith('throw_to_')) {
                // Parse throw target coordinates from action name
                const parts = action.split('_');
                // format: throw_to_<r>_<c>  → parts = ['throw','to','<r>','<c>']
                const targetRow = parseInt(parts[2], 10);
                const targetCol = parseInt(parts[3], 10);
                // throwSystem.throw validates and sets pendingTarget
                const ok = throwSystem.throw(targetRow, targetCol, player, grid);
                if (!ok) continue; // shouldn't happen given enumerator guarantees, but guard anyway
            } else if (action !== 'wait') {
                // Use player.moveTo with direction so door/oneWay enforcement applies.
                // moveDir encoding: 0=up,1=right,2=down,3=left (matches Player.move convention)
                let nr = player.row, nc = player.col;
                let moveDir = -1;
                if (action === 'up')    { nr--; moveDir = 0; }
                else if (action === 'right') { nc++; moveDir = 1; }
                else if (action === 'down')  { nr++; moveDir = 2; }
                else if (action === 'left')  { nc--; moveDir = 3; }

                const moved = player.moveTo(nr, nc, moveDir);
                if (!moved) continue;
            }

            // Run turn (matches TurnManager.nextTurn pipeline)
            const result = simulateTurn(grid, player, guards, princess, goalRow, goalCol, throwSystem);
            const newPath = path.concat(action);

            if (result.levelComplete) {
                return { solvable: true, path: newPath, states_explored: explored };
            }
            if (result.detected) continue;

            // Goal reachability check after guard update (belt-and-suspenders)
            if (grid.isGoal(player.row, player.col) && !grid.isLight(player.row, player.col)) {
                return { solvable: true, path: newPath, states_explored: explored };
            }

            const newState = captureState(player, guards, princess, throwSystem, grid);
            const key = stateKey(newState);
            if (visited.has(key)) continue;
            visited.add(key);
            queue.push({ state: newState, path: newPath });
        }
    }

    return { solvable: false, reason: 'no_path', states_explored: explored };
}
