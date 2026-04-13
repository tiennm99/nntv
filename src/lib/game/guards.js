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
}

export class StaticGuard extends Guard {
    constructor(grid, row, col, litCells) {
        super(grid, row, col, 'static');
        this.litCells = litCells || [];
    }

    updateLight() {
        if (this.grid.isValidPosition(this.row, this.col)) {
            this.grid.setLight(this.row, this.col, true);
        }
        this.litCells.forEach(cell => {
            if (this.grid.isValidPosition(cell.row, cell.col)) {
                this.grid.setLight(cell.row, cell.col, true);
            }
        });
    }

    onTurnChange() {
        this.updateLight();
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
        this.direction = (this.direction + 1) % 4;
        this.updateLight(allGuards);
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
        this.targetRow = row;
        this.targetCol = col;
    }

    updateLight() {
        if (this.grid.isValidPosition(this.row, this.col)) {
            this.grid.setLight(this.row, this.col, true);
        }
        // Light cell in facing direction
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

    onTurnChange(allGuards, player) {
        if (!player) { this.updateLight(); return; }

        const dist = Math.abs(this.row - player.row) + Math.abs(this.col - player.col);

        if (dist <= this.detectionRadius) {
            this.isChasing = true;
            this.targetRow = player.row;
            this.targetCol = player.col;
        }

        if (this.isChasing) {
            // Move one step toward target
            const dr = this.targetRow - this.row;
            const dc = this.targetCol - this.col;
            let newRow = this.row;
            let newCol = this.col;

            // Prefer row movement, then col
            if (dr !== 0) {
                const step = dr > 0 ? 1 : -1;
                if (this.grid.isValidPosition(this.row + step, this.col) &&
                    !this.grid.isWall(this.row + step, this.col)) {
                    newRow = this.row + step;
                } else if (dc !== 0) {
                    const cstep = dc > 0 ? 1 : -1;
                    if (this.grid.isValidPosition(this.row, this.col + cstep) &&
                        !this.grid.isWall(this.row, this.col + cstep)) {
                        newCol = this.col + cstep;
                    }
                }
            } else if (dc !== 0) {
                const step = dc > 0 ? 1 : -1;
                if (this.grid.isValidPosition(this.row, this.col + step) &&
                    !this.grid.isWall(this.row, this.col + step)) {
                    newCol = this.col + step;
                }
            }

            // Update facing direction
            if (newRow < this.row) this.direction = 0;
            else if (newCol > this.col) this.direction = 1;
            else if (newRow > this.row) this.direction = 2;
            else if (newCol < this.col) this.direction = 3;

            this.row = newRow;
            this.col = newCol;

            // Reached target and player not nearby — return to start
            if (this.row === this.targetRow && this.col === this.targetCol &&
                dist > this.detectionRadius) {
                this.targetRow = this.startRow;
                this.targetCol = this.startCol;
                if (this.row === this.startRow && this.col === this.startCol) {
                    this.isChasing = false;
                }
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

    onTurnChange() {
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
