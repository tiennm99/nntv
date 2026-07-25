// Player data model — pure JS, no framework dependency
//
// keysHeld: bitmask of collected keys. Bit (keyId - 1) set = key held.
// e.g. keyId=1 → bit 0 set, keyId=2 → bit 1 set.
//
// One-way convention: oneWayDir = numeric direction the player must be MOVING
// to enter the tile. Encoding: 0=up, 1=right, 2=down, 3=left.
// e.g. if player moves right (moveDir=1) and cell has oneWayDir=1 → allowed.

export class Player {
    constructor(grid, row, col) {
        this.grid = grid;
        this.row = row;
        this.col = col;
        // Keys bitmask: bit (keyId-1) set = holding that key
        this.keysHeld = 0;
    }

    // ─── Key inventory ──────────────────────────────────────────────────────────

    hasKey(keyId) {
        return (this.keysHeld & (1 << (keyId - 1))) !== 0;
    }

    addKey(keyId) {
        this.keysHeld |= (1 << (keyId - 1));
    }

    getKeysHeld() {
        return this.keysHeld;
    }

    setKeysHeld(mask) {
        this.keysHeld = mask;
    }

    // ─── State capture / apply ──────────────────────────────────────────────────

    capture() {
        return { row: this.row, col: this.col, keysHeld: this.keysHeld };
    }

    apply(s) {
        this.row = s.row;
        this.col = s.col;
        this.keysHeld = s.keysHeld ?? 0;
    }

    // ─── Movement ──────────────────────────────────────────────────────────────

    /**
     * Read-only precondition check for entering (row, col) — bounds, walls,
     * doors (require matching key), one-ways (require matching movement
     * direction). Performs no mutation, so callers (moveTo, and anything that
     * needs to test a hypothetical destination, e.g. the turn preview) can
     * check legality without side effects.
     *
     * @param {number} row   Target row
     * @param {number} col   Target col
     * @param {number} moveDir  Direction player is moving: 0=up,1=right,2=down,3=left.
     *                          Pass -1 when direction doesn't apply (direct placement).
     * @returns {boolean} true if the cell can be entered
     */
    canEnter(row, col, moveDir = -1) {
        const g = this.grid;

        if (!g.isValidPosition(row, col)) return false;
        if (g.isWall(row, col)) return false;

        // Door: blocked unless player holds the matching key
        if (g.isDoor(row, col)) {
            const keyId = g.getDoorKeyId(row, col);
            // keyId=null means unconditional door (no key needed — unusual but handle gracefully)
            if (keyId !== null && !this.hasKey(keyId)) return false;
        }

        // One-way: blocked unless player is moving in the tile's allowed direction
        if (g.isOneWay(row, col)) {
            // moveDir=-1 means no direction context (e.g. teleport); skip check
            if (moveDir !== -1 && g.getOneWayDir(row, col) !== moveDir) return false;
        }

        return true;
    }

    /**
     * Attempt to move player to (row, col).
     * Validates every precondition via canEnter() BEFORE mutating anything —
     * a rejected move must leave grid and player state untouched (e.g. it must
     * not pop open a door whose one-way check then fails).
     *
     * @param {number} row   Target row
     * @param {number} col   Target col
     * @param {number} moveDir  Direction player is moving: 0=up,1=right,2=down,3=left.
     *                          Pass -1 when direction doesn't apply (direct placement).
     * @returns {boolean} true if move succeeded
     */
    moveTo(row, col, moveDir = -1) {
        if (!this.canEnter(row, col, moveDir)) return false;

        const g = this.grid;

        // Door opens (cleared) on entry — door is single-use once key used.
        // Safe to mutate now: canEnter already confirmed the key requirement.
        if (g.isDoor(row, col)) {
            g.clearDoor(row, col);
        }

        this.row = row;
        this.col = col;

        // Key auto-collection: pick up key on landing
        if (g.isKey(row, col)) {
            const keyId = g.getKeyId(row, col);
            if (keyId !== null) this.addKey(keyId);
            // Clear key so it's collected once per level reset
            g.clearKey(row, col);
        }

        return true;
    }

    move(direction) {
        let newRow = this.row;
        let newCol = this.col;
        // Numeric encoding: 0=up,1=right,2=down,3=left
        let moveDir = -1;

        switch (direction) {
            case 'up':    newRow--; moveDir = 0; break;
            case 'down':  newRow++; moveDir = 2; break;
            case 'left':  newCol--; moveDir = 3; break;
            case 'right': newCol++; moveDir = 1; break;
        }

        return this.moveTo(newRow, newCol, moveDir);
    }

    isInLitCell() {
        return this.grid.isLight(this.row, this.col);
    }

    isAtGoal() {
        return this.grid.isGoal(this.row, this.col);
    }
}
