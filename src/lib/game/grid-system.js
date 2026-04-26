// Grid data model — pure JS, no framework dependency

export class GridSystem {
    constructor(rows, cols, cellSize) {
        this.rows = rows;
        this.cols = cols;
        this.cellSize = cellSize;
        this.grid = this.createEmptyGrid(rows, cols);
    }

    createEmptyGrid(rows, cols) {
        return Array.from({ length: rows }, () =>
            Array.from({ length: cols }, () => ({
                isWall: false,
                isGoal: false,
                isLight: false,
                // Door/key mechanics
                isDoor: false,
                doorKeyId: null,
                isKey: false,
                keyId: null,
                // One-way tile: dir is 0=up,1=right,2=down,3=left (allowed entry direction)
                isOneWay: false,
                oneWayDir: null,
                // Warm tile: set for 1 turn after a lit cell goes dark (if decay-eligible)
                isWarm: false,
                warmTurnsLeft: 0,
                // Decay-eligible: only these cells can become warm when light leaves them.
                // Prevents state explosion — by default no cell is decay-eligible.
                isDecayEligible: false,
            }))
        );
    }

    resize(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.grid = this.createEmptyGrid(rows, cols);
    }

    isValidPosition(row, col) {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
    }

    // --- Wall ---
    setWall(row, col, value) {
        if (this.isValidPosition(row, col)) this.grid[row][col].isWall = value;
    }

    isWall(row, col) {
        return this.isValidPosition(row, col) && this.grid[row][col].isWall;
    }

    // --- Goal ---
    setGoal(row, col, value) {
        if (this.isValidPosition(row, col)) this.grid[row][col].isGoal = value;
    }

    isGoal(row, col) {
        return this.isValidPosition(row, col) && this.grid[row][col].isGoal;
    }

    // --- Light ---
    setLight(row, col, value) {
        if (this.isValidPosition(row, col)) this.grid[row][col].isLight = value;
    }

    isLight(row, col) {
        return this.isValidPosition(row, col) && this.grid[row][col].isLight;
    }

    // --- Decay eligibility ---
    // Only cells marked decay-eligible transition to isWarm when their light leaves.
    // Use setDecayEligibleAll() for "all" or setDecayEligible(r,c,true) for selective.
    setDecayEligible(row, col, value) {
        if (this.isValidPosition(row, col)) this.grid[row][col].isDecayEligible = value;
    }

    isDecayEligible(row, col) {
        return this.isValidPosition(row, col) && this.grid[row][col].isDecayEligible;
    }

    // Mark every non-wall cell as decay-eligible (for decayTiles: "all")
    setDecayEligibleAll() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (!this.grid[row][col].isWall) {
                    this.grid[row][col].isDecayEligible = true;
                }
            }
        }
    }

    // Clear all light from the grid.
    // For decay-eligible cells that are currently lit, schedule them to become warm
    // (they were about to go dark — the decay window lets player cross safely).
    clearAllLight() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = this.grid[row][col];
                if (cell.isLight && cell.isDecayEligible && !cell.isWarm) {
                    // Cell was lit and is decay-eligible — mark warm for 1 turn
                    cell.isWarm = true;
                    cell.warmTurnsLeft = 1;
                }
                cell.isLight = false;
            }
        }
    }

    // --- Door ---
    setDoor(row, col, keyId) {
        if (!this.isValidPosition(row, col)) return;
        this.grid[row][col].isDoor = true;
        this.grid[row][col].doorKeyId = keyId ?? null;
    }

    isDoor(row, col) {
        return this.isValidPosition(row, col) && this.grid[row][col].isDoor;
    }

    getDoorKeyId(row, col) {
        return this.isValidPosition(row, col) ? this.grid[row][col].doorKeyId : null;
    }

    clearDoor(row, col) {
        if (!this.isValidPosition(row, col)) return;
        this.grid[row][col].isDoor = false;
        this.grid[row][col].doorKeyId = null;
    }

    // --- Key ---
    setKey(row, col, keyId) {
        if (!this.isValidPosition(row, col)) return;
        this.grid[row][col].isKey = true;
        this.grid[row][col].keyId = keyId ?? null;
    }

    isKey(row, col) {
        return this.isValidPosition(row, col) && this.grid[row][col].isKey;
    }

    getKeyId(row, col) {
        return this.isValidPosition(row, col) ? this.grid[row][col].keyId : null;
    }

    clearKey(row, col) {
        if (!this.isValidPosition(row, col)) return;
        this.grid[row][col].isKey = false;
        this.grid[row][col].keyId = null;
    }

    // --- One-way tile ---
    // dir: 0=up,1=right,2=down,3=left — the allowed movement direction when entering
    setOneWay(row, col, dir) {
        if (!this.isValidPosition(row, col)) return;
        this.grid[row][col].isOneWay = true;
        this.grid[row][col].oneWayDir = dir;
    }

    isOneWay(row, col) {
        return this.isValidPosition(row, col) && this.grid[row][col].isOneWay;
    }

    getOneWayDir(row, col) {
        return this.isValidPosition(row, col) ? this.grid[row][col].oneWayDir : null;
    }

    // Returns true if the player can enter this cell moving in `moveDir`
    // moveDir uses same encoding: 0=up,1=right,2=down,3=left
    canEnterOneWay(row, col, moveDir) {
        if (!this.isOneWay(row, col)) return true;
        return this.grid[row][col].oneWayDir === moveDir;
    }

    clearOneWay(row, col) {
        if (!this.isValidPosition(row, col)) return;
        this.grid[row][col].isOneWay = false;
        this.grid[row][col].oneWayDir = null;
    }

    // --- Warm tile ---
    // Called externally (e.g. when a lit cell goes dark) to mark it warm for 1 turn
    setWarm(row, col, turns = 1) {
        if (!this.isValidPosition(row, col)) return;
        this.grid[row][col].isWarm = true;
        this.grid[row][col].warmTurnsLeft = turns;
    }

    isWarm(row, col) {
        return this.isValidPosition(row, col) && this.grid[row][col].isWarm;
    }

    getWarmTurnsLeft(row, col) {
        return this.isValidPosition(row, col) ? this.grid[row][col].warmTurnsLeft : 0;
    }

    // Decrement all warm timers; clear isWarm when timer reaches 0.
    // Called by turn-manager AFTER detection check each turn.
    tickWarmTimers() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = this.grid[row][col];
                if (cell.isWarm) {
                    cell.warmTurnsLeft--;
                    if (cell.warmTurnsLeft <= 0) {
                        cell.isWarm = false;
                        cell.warmTurnsLeft = 0;
                    }
                }
            }
        }
    }

    // Restores warm-tile state from a snapshot returned by getWarmSnapshot().
    // Clears all existing warm state first, then reapplies [[r, c, t], ...].
    // Used by the BFS solver to restore grid warm timers when re-applying state.
    applyWarmSnapshot(arr) {
        // Clear all existing warm state
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = this.grid[row][col];
                if (cell.isWarm) {
                    cell.isWarm = false;
                    cell.warmTurnsLeft = 0;
                }
            }
        }
        // Reapply from snapshot
        for (const [r, c, t] of arr) {
            if (this.isValidPosition(r, c)) {
                this.grid[r][c].isWarm = true;
                this.grid[r][c].warmTurnsLeft = t;
            }
        }
    }

    // Returns sorted sparse array [[r, c, t], ...] of all warm cells.
    // Used by solver for state hashing.
    getWarmSnapshot() {
        const result = [];
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = this.grid[row][col];
                if (cell.isWarm) {
                    result.push([row, col, cell.warmTurnsLeft]);
                }
            }
        }
        // Already in row-major order (sorted by [r, c])
        return result;
    }

    // Returns sorted sparse array [[r, c, keyId], ...] of all currently-closed doors.
    // Used by solver for state hashing — doors can be opened (cleared) when player passes through.
    getDoorSnapshot() {
        const result = [];
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = this.grid[row][col];
                if (cell.isDoor) {
                    result.push([row, col, cell.doorKeyId]);
                }
            }
        }
        return result;
    }

    // Restores door-cell state from a snapshot returned by getDoorSnapshot().
    // Clears all existing door cells first, then reapplies [[r, c, keyId], ...].
    applyDoorSnapshot(arr) {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = this.grid[row][col];
                if (cell.isDoor) {
                    cell.isDoor = false;
                    cell.doorKeyId = null;
                }
            }
        }
        for (const [r, c, keyId] of arr) {
            if (this.isValidPosition(r, c)) {
                this.grid[r][c].isDoor = true;
                this.grid[r][c].doorKeyId = keyId;
            }
        }
    }

    // Returns sorted sparse array [[r, c, keyId], ...] of all cells that still have a key.
    // Used by solver for state hashing — mirrors getWarmSnapshot pattern.
    getKeySnapshot() {
        const result = [];
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = this.grid[row][col];
                if (cell.isKey) {
                    result.push([row, col, cell.keyId]);
                }
            }
        }
        // Already in row-major order (sorted by [r, c])
        return result;
    }

    // Restores key-cell state from a snapshot returned by getKeySnapshot().
    // Clears all existing key cells first, then reapplies [[r, c, keyId], ...].
    // Used by the BFS solver to restore grid key cells when re-applying state.
    applyKeySnapshot(arr) {
        // Clear all existing key cells
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = this.grid[row][col];
                if (cell.isKey) {
                    cell.isKey = false;
                    cell.keyId = null;
                }
            }
        }
        // Reapply from snapshot
        for (const [r, c, keyId] of arr) {
            if (this.isValidPosition(r, c)) {
                this.grid[r][c].isKey = true;
                this.grid[r][c].keyId = keyId;
            }
        }
    }

    // Get flat array of all cells with positions (for rendering)
    getAllCells() {
        const cells = [];
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = this.grid[row][col];
                cells.push({ row, col, ...cell });
            }
        }
        return cells;
    }
}
