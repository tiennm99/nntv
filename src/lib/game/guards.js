// Guard logic — pure JS, no framework dependency
// Each guard exposes { row, col, type, direction, isOn } for rendering

class Guard {
    constructor(grid, row, col, type) {
        this.grid = grid;
        this.row = row;
        this.col = col;
        this.type = type;
        this.direction = 0;
        this.isOn = true;
    }

    updateLight() {}
    onTurnChange() {}

    // Dynamic state snapshot — override in subclasses to add per-type fields.
    // Used by GameHistory (undo/redo), TurnManager.previewNextTurn, and the BFS solver.
    // `type` is included so solver's canonicalGuardKey can route without a back-reference.
    capture() {
        return { type: this.type, row: this.row, col: this.col, direction: this.direction, isOn: this.isOn };
    }

    apply(s) {
        this.row = s.row;
        this.col = s.col;
        this.direction = s.direction;
        this.isOn = s.isOn;
    }
}

// Wilting tomato — emits a Manhattan aura that shrinks by 1 each turn.
// initialRadius 2 lights 13 cells at turn 0, 5 cells at turn 1, 1 cell at
// turn 2, harmless thereafter. Pairs naturally with the `wait` action:
// patient players can outlast an aura; impatient players must detour.
export class StaticGuard extends Guard {
    constructor(grid, row, col, initialRadius) {
        super(grid, row, col, 'static');
        this.initialRadius = initialRadius ?? 2;
        this.currentRadius = this.initialRadius;
    }

    updateLight() {
        if (this.currentRadius < 0) return;
        const r0 = this.row, c0 = this.col;
        const rad = this.currentRadius;
        for (let r = r0 - rad; r <= r0 + rad; r++) {
            for (let c = c0 - rad; c <= c0 + rad; c++) {
                const dist = Math.abs(r - r0) + Math.abs(c - c0);
                if (dist > rad) continue;
                if (this.grid.isValidPosition(r, c)) {
                    this.grid.setLight(r, c, true);
                }
            }
        }
    }

    onTurnChange() {
        // Clamp at -1 (fully wilted, harmless). Prevents unbounded state growth
        // for BFS solver — beyond -1, behavior is identical so keys stay finite.
        if (this.currentRadius >= 0) this.currentRadius--;
        this.updateLight();
    }

    capture() {
        return { ...super.capture(), currentRadius: this.currentRadius };
    }

    apply(s) {
        super.apply(s);
        this.currentRadius = s.currentRadius;
    }
}

export class RotatingGuard extends Guard {
    constructor(grid, row, col, startDirection) {
        super(grid, row, col, 'rotating');
        this.direction = startDirection || 0;
        this.lightRange = 2;
        this.directions = [
            { row: -1, col: 0 }, // up
            { row: 0, col: 1 },  // right
            { row: 1, col: 0 },  // down
            { row: 0, col: -1 }, // left
        ];
        // Set by ThrowableSystem.resolve() to override normal rotation for N turns
        this.forcedFacingTurns = 0;
        this.forcedFacingTarget = null;
    }

    updateLight(allGuards) {
        if (this.grid.isValidPosition(this.row, this.col)) {
            this.grid.setLight(this.row, this.col, true);
        }
        const dir = this.directions[this.direction];
        this.castBeam(dir, this.row, this.col, this.lightRange, allGuards, 0);
    }

    // Cast light beam in a direction, bouncing off mirror guards
    castBeam(dir, fromRow, fromCol, range, allGuards, depth) {
        if (depth > 3) return; // prevent infinite bounces
        for (let i = 1; i <= range; i++) {
            const r = fromRow + dir.row * i;
            const c = fromCol + dir.col * i;
            if (!this.grid.isValidPosition(r, c) || this.grid.isWall(r, c)) break;
            this.grid.setLight(r, c, true);

            // Check if beam hits a mirror guard
            if (allGuards) {
                const mirror = allGuards.find(g =>
                    g.type === 'mirror' && g.row === r && g.col === c
                );
                if (mirror) {
                    const reflected = this.reflectDir(dir, mirror.reflectDirection);
                    this.castBeam(reflected, r, c, range, allGuards, depth + 1);
                    break;
                }
            }
        }
    }

    reflectDir(dir, reflectType) {
        // cw: rotate beam 90° clockwise, ccw: counter-clockwise
        if (reflectType === 'cw') {
            return { row: dir.col, col: -dir.row };
        }
        return { row: -dir.col, col: dir.row };
    }

    onTurnChange(allGuards) {
        if (this.forcedFacingTurns > 0 && this.forcedFacingTarget) {
            // Override normal rotation: face toward throw target
            this.direction = computeFacingToward(
                this.row, this.col,
                this.forcedFacingTarget.row, this.forcedFacingTarget.col
            );
            this.forcedFacingTurns--;
        } else {
            this.direction = (this.direction + 1) % 4;
        }
        this.updateLight(allGuards);
    }

    capture() {
        return {
            ...super.capture(),
            forcedFacingTurns: this.forcedFacingTurns,
            forcedFacingTarget: this.forcedFacingTarget
                ? { ...this.forcedFacingTarget }
                : null,
        };
    }

    apply(s) {
        super.apply(s);
        this.forcedFacingTurns = s.forcedFacingTurns ?? 0;
        this.forcedFacingTarget = s.forcedFacingTarget
            ? { ...s.forcedFacingTarget }
            : null;
    }
}

export class BlinkingGuard extends Guard {
    constructor(grid, row, col, litCells, startState) {
        super(grid, row, col, 'blinking');
        this.litCells = litCells || [];
        this.isOn = startState !== undefined ? startState : true;
    }

    updateLight() {
        if (this.isOn) {
            this.litCells.forEach(cell => {
                if (this.grid.isValidPosition(cell.row, cell.col)) {
                    this.grid.setLight(cell.row, cell.col, true);
                }
            });
        }
    }

    onTurnChange() {
        this.isOn = !this.isOn;
        this.updateLight();
    }
}

export class MirrorGuard extends Guard {
    constructor(grid, row, col, reflectDirection) {
        super(grid, row, col, 'mirror');
        // reflectDirection: 'cw' (clockwise 90°) or 'ccw' (counter-clockwise 90°)
        this.reflectDirection = reflectDirection || 'cw';
        this.lightRange = 2;
    }

    // Mirror guards don't emit their own light — they redirect light
    // that hits them from rotating guards. The redirection is handled
    // during the rotating guard's updateLight pass via grid markers.
    updateLight() {
        // Light own cell so player can see the mirror position
        if (this.grid.isValidPosition(this.row, this.col)) {
            this.grid.setLight(this.row, this.col, true);
        }
    }

    onTurnChange() {
        this.updateLight();
    }
}

export class ChaserGuard extends Guard {
    constructor(grid, row, col, detectionRadius) {
        super(grid, row, col, 'chaser');
        this.startRow = row;
        this.startCol = col;
        this.detectionRadius = detectionRadius || 3;
        this.isChasing = false;
        this.isReturning = false;
        this.targetRow = row;
        this.targetCol = col;
        // Set by ThrowableSystem.resolve() to override normal movement for N turns
        this.forcedFacingTurns = 0;
        this.forcedFacingTarget = null;
    }

    updateLight() {
        if (this.grid.isValidPosition(this.row, this.col)) {
            this.grid.setLight(this.row, this.col, true);
        }
        const dir = this.getDirectionOffset(this.direction);
        const fr = this.row + dir.row;
        const fc = this.col + dir.col;
        if (this.grid.isValidPosition(fr, fc)) {
            this.grid.setLight(fr, fc, true);
        }
    }

    getDirectionOffset(dir) {
        const directions = [
            { row: -1, col: 0 }, { row: 0, col: 1 },
            { row: 1, col: 0 }, { row: 0, col: -1 },
        ];
        return directions[dir];
    }

    // BFS pathfinding — finds shortest path around walls to target
    bfsNextStep(targetRow, targetCol) {
        if (this.row === targetRow && this.col === targetCol) return null;
        const rows = this.grid.rows;
        const cols = this.grid.cols;
        const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
        // Store parent direction for path reconstruction
        const parent = Array.from({ length: rows }, () => Array(cols).fill(null));
        const queue = [{ row: this.row, col: this.col }];
        visited[this.row][this.col] = true;
        const dirs = [
            { row: -1, col: 0 }, { row: 0, col: 1 },
            { row: 1, col: 0 }, { row: 0, col: -1 },
        ];

        while (queue.length > 0) {
            const curr = queue.shift();
            for (const d of dirs) {
                const nr = curr.row + d.row;
                const nc = curr.col + d.col;
                if (!this.grid.isValidPosition(nr, nc)) continue;
                if (visited[nr][nc] || this.grid.isWall(nr, nc)) continue;
                visited[nr][nc] = true;
                parent[nr][nc] = { row: curr.row, col: curr.col };
                if (nr === targetRow && nc === targetCol) {
                    // Trace back to find the first step from current position
                    let step = { row: nr, col: nc };
                    while (parent[step.row][step.col].row !== this.row ||
                           parent[step.row][step.col].col !== this.col) {
                        step = parent[step.row][step.col];
                    }
                    return step;
                }
                queue.push({ row: nr, col: nc });
            }
        }
        return null; // no path found
    }

    capture() {
        return {
            ...super.capture(),
            isChasing: this.isChasing,
            isReturning: this.isReturning,
            targetRow: this.targetRow,
            targetCol: this.targetCol,
            forcedFacingTurns: this.forcedFacingTurns,
            forcedFacingTarget: this.forcedFacingTarget
                ? { ...this.forcedFacingTarget }
                : null,
        };
    }

    apply(s) {
        super.apply(s);
        this.isChasing = s.isChasing;
        this.isReturning = s.isReturning;
        this.targetRow = s.targetRow;
        this.targetCol = s.targetCol;
        this.forcedFacingTurns = s.forcedFacingTurns ?? 0;
        this.forcedFacingTarget = s.forcedFacingTarget
            ? { ...s.forcedFacingTarget }
            : null;
    }

    // Chaser has two states: hunting player or returning home
    onTurnChange(allGuards, player) {
        if (!player) { this.updateLight(); return; }

        if (this.forcedFacingTurns > 0 && this.forcedFacingTarget) {
            // Distracted: face the throw target, don't move
            this.direction = computeFacingToward(
                this.row, this.col,
                this.forcedFacingTarget.row, this.forcedFacingTarget.col
            );
            this.forcedFacingTurns--;
            this.updateLight();
            return;
        }

        const dist = Math.abs(this.row - player.row) + Math.abs(this.col - player.col);

        if (dist <= this.detectionRadius) {
            // Player within detection range — chase them
            this.isChasing = true;
            this.targetRow = player.row;
            this.targetCol = player.col;
            this.isReturning = false;
        } else if (this.isChasing && !this.isReturning) {
            // Player escaped detection range — switch to returning home
            this.isReturning = true;
            this.targetRow = this.startRow;
            this.targetCol = this.startCol;
        }

        if (this.isChasing) {
            const nextStep = this.bfsNextStep(this.targetRow, this.targetCol);
            if (nextStep) {
                if (nextStep.row < this.row) this.direction = 0;
                else if (nextStep.col > this.col) this.direction = 1;
                else if (nextStep.row > this.row) this.direction = 2;
                else if (nextStep.col < this.col) this.direction = 3;

                this.row = nextStep.row;
                this.col = nextStep.col;
            }

            // If returning and reached home, stop chasing entirely
            if (this.isReturning &&
                this.row === this.startRow && this.col === this.startCol) {
                this.isChasing = false;
                this.isReturning = false;
            }
        }

        this.updateLight();
    }
}

export class PatrollingGuard extends Guard {
    constructor(grid, startRow, startCol, path) {
        super(grid, startRow, startCol, 'patrolling');
        this.path = path || [];
        this.currentPathIndex = 0;
        this.isCircularPath = this.checkIfCircularPath();
        this.isReversing = false;
        this.updateInitialDirection();
        // Set by ThrowableSystem.resolve() to override normal movement for N turns
        this.forcedFacingTurns = 0;
        this.forcedFacingTarget = null;
    }

    checkIfCircularPath() {
        if (this.path.length <= 1) return false;
        const first = this.path[0];
        const last = this.path[this.path.length - 1];
        return first.row === last.row && first.col === last.col;
    }

    updateInitialDirection() {
        if (this.path.length <= 1) return;
        const curr = this.path[this.currentPathIndex];
        const next = this.path[(this.currentPathIndex + 1) % this.path.length];
        if (next.row < curr.row) this.direction = 0;
        else if (next.col > curr.col) this.direction = 1;
        else if (next.row > curr.row) this.direction = 2;
        else if (next.col < curr.col) this.direction = 3;
    }

    getDirectionOffset(dir) {
        const directions = [
            { row: -1, col: 0 },
            { row: 0, col: 1 },
            { row: 1, col: 0 },
            { row: 0, col: -1 },
        ];
        return directions[dir];
    }

    updateLight() {
        const frontDir = this.getDirectionOffset(this.direction);
        const frontRow = this.row + frontDir.row;
        const frontCol = this.col + frontDir.col;
        const rightDir = this.getDirectionOffset((this.direction + 1) % 4);
        const rightRow = this.row + rightDir.row;
        const rightCol = this.col + rightDir.col;

        if (this.grid.isValidPosition(frontRow, frontCol)) {
            this.grid.setLight(frontRow, frontCol, true);
        }
        if (this.grid.isValidPosition(rightRow, rightCol)) {
            this.grid.setLight(rightRow, rightCol, true);
        }
    }

    updateDirection(oldRow, oldCol, newRow, newCol) {
        if (newRow < oldRow) this.direction = 0;
        else if (newCol > oldCol) this.direction = 1;
        else if (newRow > oldRow) this.direction = 2;
        else if (newCol < oldCol) this.direction = 3;
    }

    capture() {
        return {
            ...super.capture(),
            currentPathIndex: this.currentPathIndex,
            isReversing: this.isReversing,
            forcedFacingTurns: this.forcedFacingTurns,
            forcedFacingTarget: this.forcedFacingTarget
                ? { ...this.forcedFacingTarget }
                : null,
        };
    }

    apply(s) {
        super.apply(s);
        this.currentPathIndex = s.currentPathIndex;
        this.isReversing = s.isReversing;
        this.forcedFacingTurns = s.forcedFacingTurns ?? 0;
        this.forcedFacingTarget = s.forcedFacingTarget
            ? { ...s.forcedFacingTarget }
            : null;
    }

    onTurnChange() {
        if (this.forcedFacingTurns > 0 && this.forcedFacingTarget) {
            // Distracted: face the throw target, don't advance path
            this.direction = computeFacingToward(
                this.row, this.col,
                this.forcedFacingTarget.row, this.forcedFacingTarget.col
            );
            this.forcedFacingTurns--;
            this.updateLight();
            return;
        }

        if (this.path.length <= 1) return;

        let nextIndex;
        if (this.isCircularPath) {
            nextIndex = (this.currentPathIndex + 1) % this.path.length;
        } else if (this.isReversing) {
            nextIndex = this.currentPathIndex - 1;
            if (nextIndex < 0) {
                this.isReversing = false;
                nextIndex = 1;
                this.direction = (this.direction + 3) % 4;
            }
        } else {
            nextIndex = this.currentPathIndex + 1;
            if (nextIndex >= this.path.length) {
                this.isReversing = true;
                nextIndex = this.path.length - 2;
                this.direction = (this.direction + 3) % 4;
            }
        }

        this.currentPathIndex = nextIndex;
        const nextPos = this.path[this.currentPathIndex];
        this.updateDirection(this.row, this.col, nextPos.row, nextPos.col);
        this.row = nextPos.row;
        this.col = nextPos.col;
        this.updateLight();
    }
}

// --- SniperGuard ---
// Casts a line-of-sight beam from its position in `facing` direction.
// Beam stops at first wall, mirror, or grid edge. Bounces off mirrors
// up to 3 times (reuses RotatingGuard.castBeam logic).
// Rotates 90° CW every `rotateCadence` turns (default 2).
export class SniperGuard extends Guard {
    constructor(grid, row, col, facing, rotateCadence = 2) {
        super(grid, row, col, 'sniper');
        // facing: 0=up, 1=right, 2=down, 3=left
        this.facing = facing ?? 0;
        this.direction = this.facing; // keep `direction` in sync for rendering
        this.rotateCadence = rotateCadence;
        this.turnsSinceRotate = 0;
        this.lightRange = Math.max(grid.rows, grid.cols); // effectively unbounded
        this.facingDirs = [
            { row: -1, col: 0 }, // up
            { row: 0, col: 1 },  // right
            { row: 1, col: 0 },  // down
            { row: 0, col: -1 }, // left
        ];
    }

    updateLight(allGuards) {
        if (this.grid.isValidPosition(this.row, this.col)) {
            this.grid.setLight(this.row, this.col, true);
        }
        const dir = this.facingDirs[this.facing];
        this._castBeam(dir, this.row, this.col, allGuards, 0);
    }

    // Beam travels until wall/edge; reflects off mirrors (up to 3 bounces).
    // Uses same unlimited-step approach but respects grid bounds.
    _castBeam(dir, fromRow, fromCol, allGuards, depth) {
        if (depth > 3) return;
        for (let i = 1; i <= this.lightRange; i++) {
            const r = fromRow + dir.row * i;
            const c = fromCol + dir.col * i;
            if (!this.grid.isValidPosition(r, c) || this.grid.isWall(r, c)) break;
            this.grid.setLight(r, c, true);

            if (allGuards) {
                const mirror = allGuards.find(g =>
                    g.type === 'mirror' && g.row === r && g.col === c
                );
                if (mirror) {
                    const reflected = this._reflectDir(dir, mirror.reflectDirection);
                    this._castBeam(reflected, r, c, allGuards, depth + 1);
                    break;
                }
            }
        }
    }

    _reflectDir(dir, reflectType) {
        if (reflectType === 'cw') {
            return { row: dir.col, col: -dir.row };
        }
        return { row: -dir.col, col: dir.row };
    }

    onTurnChange(allGuards) {
        this.turnsSinceRotate++;
        if (this.turnsSinceRotate >= this.rotateCadence) {
            this.facing = (this.facing + 1) % 4;
            this.direction = this.facing; // keep direction in sync for rendering
            this.turnsSinceRotate = 0;
        }
        this.updateLight(allGuards);
    }

    capture() {
        return {
            ...super.capture(),
            facing: this.facing,
            turnsSinceRotate: this.turnsSinceRotate,
        };
    }

    apply(s) {
        super.apply(s);
        this.facing = s.facing;
        this.direction = s.facing; // keep in sync
        this.turnsSinceRotate = s.turnsSinceRotate;
    }
}

// --- SuspicionGuard ---
// 3-tier suspicion meter (0=idle, 1=alerted, 2=firing).
// Increments tier when player is within Manhattan `range`; decrements when out.
// At tier 2, lights all 8 surrounding cells (Manhattan ≤1 + diagonals).
// After a firing turn (tier starts at 2), always decays to 0 that same call.
export class SuspicionGuard extends Guard {
    constructor(grid, row, col, range) {
        super(grid, row, col, 'suspicion');
        this.range = range ?? 3;
        this.tier = 0;
    }

    updateLight() {
        if (this.tier < 2) return;
        // Tier 2: light own cell + all 8 neighbours
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                const r = this.row + dr;
                const c = this.col + dc;
                if (this.grid.isValidPosition(r, c)) {
                    this.grid.setLight(r, c, true);
                }
            }
        }
    }

    onTurnChange(allGuards, player) {
        const startedAtFiring = this.tier === 2;

        if (startedAtFiring) {
            // After a firing turn: always drop to 0 regardless of player distance
            this.tier = 0;
            this.updateLight();
            return;
        }

        if (player) {
            const dist = Math.abs(this.row - player.row) + Math.abs(this.col - player.col);
            if (dist <= this.range) {
                this.tier = Math.min(2, this.tier + 1);
            } else {
                this.tier = Math.max(0, this.tier - 1);
            }
        } else {
            this.tier = Math.max(0, this.tier - 1);
        }

        this.updateLight();
    }

    capture() {
        return {
            ...super.capture(),
            tier: this.tier,
            range: this.range,
        };
    }

    apply(s) {
        super.apply(s);
        this.tier = s.tier;
        this.range = s.range;
    }
}

// --- Shared utility ---
// Returns cardinal direction index (0=up,1=right,2=down,3=left) from
// (fromRow,fromCol) toward (toRow,toCol). Falls back to 0 if same cell.
function computeFacingToward(fromRow, fromCol, toRow, toCol) {
    const dr = toRow - fromRow;
    const dc = toCol - fromCol;
    if (Math.abs(dr) >= Math.abs(dc)) {
        return dr >= 0 ? 2 : 0; // down or up
    }
    return dc >= 0 ? 1 : 3; // right or left
}
