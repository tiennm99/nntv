export const LEVELS = [
    // === ACT 1: THE OUTSKIRTS (movement tutorial) ===
    {
        // L1 — Garden Path
        // Mechanic intro: movement only
        // Intended path sketch: navigate zigzag corridor from top-left to bottom-right.
        //   Three wall bands force alternating left/right detours across the 8x8 grid.
        // Key insight: teaches arrow movement and grid traversal; no threat present
        id: 1,
        name: "Garden Path",
        storyKey: "level1Story",
        grid: { rows: 8, cols: 8 },
        player: { row: 0, col: 0 },
        goal: { row: 7, col: 7 },
        walls: [
            // Band 1: blocks cols 4-7 in row 1 — must go down-left first
            { row: 1, col: 4 }, { row: 1, col: 5 }, { row: 1, col: 6 }, { row: 1, col: 7 },
            // Band 2: blocks cols 0-3 in row 3 — must swing right
            { row: 3, col: 0 }, { row: 3, col: 1 }, { row: 3, col: 2 }, { row: 3, col: 3 },
            // Band 3: blocks cols 4-7 in row 5 — must go left before exit
            { row: 5, col: 4 }, { row: 5, col: 5 }, { row: 5, col: 6 }, { row: 5, col: 7 },
        ],
        guards: [],
        affordances: { undo: true, preview: true },
        parMoves: 18,
    },
    {
        // L2 — Watchtower
        // Mechanic intro: static wilting guards, now on a real pulse cycle (radius shrinks
        //   1/turn then regrows: 1,0,-1,1,0,-1,... for initialRadius=1 — a 3-turn cycle).
        // Intended path sketch: three single-cell gaps in the wall bands, each with a static
        //   diagonally adjacent to the cell just past the gap. The pre-gap cell is always
        //   >1 cell from the guard (safe every phase); the cell just past the gap sits exactly
        //   1 cell away (lit whenever radius >= 1 — 1 turn in every 3). Geometry is chosen so
        //   the earliest possible arrival at each guarded cell lands on that lit turn, forcing
        //   a real wait (not just a lucky detour) before advancing.
        // Key insight: the wilting cycle has a fixed period — wait one beat at the safe cell
        //   just before a gap, let the aura pass its peak, then step through.
        id: 2,
        name: "The Watchtower",
        storyKey: "level2Story",
        grid: { rows: 8, cols: 8 },
        player: { row: 0, col: 0 },
        goal: { row: 7, col: 7 },
        walls: [
            // Gap 1 at (1,4)
            { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 }, { row: 1, col: 3 },
            { row: 1, col: 5 }, { row: 1, col: 6 }, { row: 1, col: 7 },
            // Gap 2 at (3,2)
            { row: 3, col: 0 }, { row: 3, col: 1 },
            { row: 3, col: 3 }, { row: 3, col: 4 }, { row: 3, col: 5 }, { row: 3, col: 6 }, { row: 3, col: 7 },
            // Gap 3 at (5,6)
            { row: 5, col: 0 }, { row: 5, col: 1 }, { row: 5, col: 2 }, { row: 5, col: 3 }, { row: 5, col: 4 },
            { row: 5, col: 5 }, { row: 5, col: 7 },
        ],
        guards: [
            // Guards a 1-cell diagonal from the cell just past each gap; pre-gap approach cells
            // sit 2+ cells away (always safe) so waiting never traps the player.
            { type: "static", position: { row: 2, col: 5 }, initialRadius: 1 },
            { type: "static", position: { row: 4, col: 1 }, initialRadius: 1 },
            { type: "static", position: { row: 6, col: 5 }, initialRadius: 1 },
        ],
        affordances: { undo: true, preview: true },
        parMoves: 20,
    },

    // === ACT 2: THE VEGETABLE GARDEN (one-way intro) ===
    {
        // L3 — Vegetable Patrol
        // Mechanic intro: one-way tile (arrow tile; entered only from designated direction)
        // Intended path sketch:
        //   Grid is divided into a top-left start zone and a bottom-right goal zone by wall bands.
        //   The only connections between zones pass through two one-way tiles:
        //     (2,4) dir=2 (down): player MUST enter by moving down — connecting top to mid zone.
        //     (5,4) dir=1 (right): player MUST enter by moving right — connecting mid to right zone.
        //   Trying to re-enter (2,4) from below (up) → rejected. Trying (5,4) from right (left) → rejected.
        //   One static guard at (0,5) forces a detour in the top zone.
        //   One static guard at (7,3) forces a detour in the bottom zone.
        //   Intended path: right×4→down×2→through(2,4)↓→down×2→right×1→through(5,4)→→right×3→down×3→goal
        //   par=20. Two guards wilt turn 2 so timing is real but not brutal.
        // Key insight: one-ways create commitment ratchets — plan the full route before crossing.
        id: 3,
        name: "Vegetable Patrol",
        storyKey: "level3Story",
        grid: { rows: 9, cols: 9 },
        player: { row: 0, col: 0 },
        goal: { row: 8, col: 8 },
        walls: [
            // Top-zone right side wall — blocks right bypass around (2,4) one-way
            { row: 0, col: 5 }, { row: 0, col: 6 }, { row: 0, col: 7 }, { row: 0, col: 8 },
            { row: 1, col: 5 }, { row: 1, col: 6 }, { row: 1, col: 7 }, { row: 1, col: 8 },
            // Horizontal wall separating top zone from mid zone; only gap is col 4
            { row: 3, col: 0 }, { row: 3, col: 1 }, { row: 3, col: 2 }, { row: 3, col: 3 },
            { row: 3, col: 5 }, { row: 3, col: 6 }, { row: 3, col: 7 }, { row: 3, col: 8 },
            // Vertical wall separating mid zone from right zone; only gap is row 5
            { row: 4, col: 5 }, { row: 4, col: 6 }, { row: 4, col: 7 }, { row: 4, col: 8 },
            { row: 5, col: 5 }, { row: 5, col: 6 }, { row: 5, col: 7 }, { row: 5, col: 8 },
            // Wait — need gap at (5,4) for the one-way, so wall must be col>=5 on rows 4-5
            // Bottom-left wall forcing through bottom zone
            { row: 6, col: 0 }, { row: 6, col: 1 }, { row: 6, col: 2 }, { row: 6, col: 3 },
        ],
        guards: [
            // Static diagonally adjacent to the (2,4) one-way's landing cell — the approach
            // cell (1,4) sits 2 away (always safe), so waiting there never traps the player,
            // but the earliest possible arrival at (2,4) lands on the guard's lit turn, forcing
            // one real wait before committing to the one-way.
            { type: "static", position: { row: 2, col: 5 }, initialRadius: 1 },
            // Static diagonally adjacent to the (5,3) approach cell for the second one-way.
            { type: "static", position: { row: 5, col: 2 }, initialRadius: 1 },
        ],
        // (2,4) dir=2=down: only reachable by moving down from (1,4) — connects top→mid zone
        // (5,4) dir=1=right: only reachable by moving right from (5,3) — connects mid→right zone
        // Attempting to go back UP through (2,4) from (3,4) → rejected (moveDir=0≠2)
        // Attempting to go LEFT through (5,4) from (5,5) → rejected (moveDir=3≠1)
        oneWays: [
            { row: 2, col: 4, dir: 2 },  // enter only when moving down
            { row: 5, col: 4, dir: 1 },  // enter only when moving right
        ],
        affordances: { undo: true, preview: true },
        parMoves: 20,
    },

    // === ACT 3: THE SEARCHLIGHT (suspicion guard intro) ===
    {
        // L4 — Searchlight
        // Mechanic intro: suspicion guard (3-tier meter; fires at tier 2, lighting every cell
        //   within Manhattan range of the guard, not just its own square)
        // Intended path sketch: walls at (3,0)/(4,0) close off the free left-edge column, so the
        //   route must pass within range 3 of the suspicion guard at (4,7) for at least two
        //   consecutive turns — enough for its tier meter to climb 0→1→2 and fire. The optimal
        //   route eats that cost as a 2-turn stall (verified: removing only the suspicion guard
        //   drops the solve from 18 to 16; rotating+static alone contribute nothing).
        // Key insight: suspicion needs two consecutive turns in range to fire — cross its zone in
        //   a single turn if you can, or plan the stall before you're two turns deep in range.
        id: 4,
        name: "The Searchlight",
        storyKey: "level4Story",
        grid: { rows: 9, cols: 9 },
        player: { row: 0, col: 0 },
        goal: { row: 8, col: 8 },
        walls: [
            { row: 1, col: 5 }, { row: 1, col: 6 },
            { row: 2, col: 2 },
            { row: 3, col: 0 }, { row: 3, col: 4 }, { row: 3, col: 7 },
            { row: 4, col: 0 }, { row: 4, col: 2 }, { row: 4, col: 6 },
            { row: 5, col: 4 },
            { row: 6, col: 1 }, { row: 6, col: 6 },
            { row: 7, col: 3 }, { row: 7, col: 7 },
        ],
        guards: [
            // Rotating guard sweeps the central area
            { type: "rotating", position: { row: 3, col: 3 }, startDirection: 0 },
            // Suspicion guard on right flank — range 3
            { type: "suspicion", position: { row: 4, col: 7 }, range: 3 },
            // Static guard blocks left corridor detour
            { type: "static", position: { row: 6, col: 3 }, initialRadius: 2 },
        ],
        affordances: { undo: true, preview: true },
        parMoves: 20,
    },

    // === ACT 4: THE FORTRESS (doors+keys intro) ===
    {
        // L5 — Fortress Gate
        // Mechanic intro: doors + keys (locked door = impassable wall until matching key collected)
        // Intended path sketch:
        //   10×10 grid. Player (0,0), Goal (9,9). The vertical barrier at col 5 is only open at
        //   rows 0-2 (free, one-directional use), door1 (4,5, keyId 1), and door2 (8,5, keyId 2) —
        //   rows 3,5,6,7,9 are solid wall.
        //   1. Cross col 5 for free along row 0 and grab key1 at (0,8).
        //   2. Walls (5,7)/(5,9)/(7,6)/(7,8)/(8,7)/(8,9) seal the lower-right corner into a pocket
        //      reachable only from above — go down col 8 to key2 at (6,8), a one-way trip in:
        //      the only exit is back up the way you came.
        //   3. Climb back to row 4 and go left through door1 (needs key1) — this is the ONLY
        //      way out of the pocket, which is what makes the key1→door1 dependency load-bearing
        //      even though the row-0 crossing itself needed no key.
        //   4. Descend the left side and go right through door2 (needs key2) to reach the
        //      bottom-right and the goal.
        //   Rotating guard at (2,4) faces up every 4th turn, sweeping (1,4)/(0,4) — exactly the
        //   turn the fastest route reaches (0,4) on the way to key1, forcing a real wait.
        //   Suspicion guard at (6,6) range 2 flanks the door2 return leg.
        // Key insight: the lower-right key2 pocket is one-way — the only exit is back through
        //   door1, so key1 must already be in hand before you go get key2, not after.
        id: 5,
        name: "Fortress Gate",
        storyKey: "level5Story",
        grid: { rows: 10, cols: 10 },
        player: { row: 0, col: 0 },
        goal: { row: 9, col: 9 },
        walls: [
            // Vertical barrier col 5, rows 3-9 (except doors at rows 4 and 8)
            { row: 3, col: 5 },
            // (4,5) = door keyId=1
            { row: 5, col: 5 }, { row: 6, col: 5 }, { row: 7, col: 5 },
            // (8,5) = door keyId=2
            { row: 9, col: 5 },
            // Left zone walls — shape the approach to door1
            { row: 1, col: 2 }, { row: 1, col: 7 },
            { row: 3, col: 1 }, { row: 3, col: 3 }, { row: 3, col: 4 },
            // Right zone walls — shape key2 area and door2 approach
            { row: 5, col: 7 }, { row: 5, col: 9 },
            { row: 7, col: 6 }, { row: 7, col: 8 },
            { row: 8, col: 7 }, { row: 8, col: 9 },
        ],
        guards: [
            // Rotating guard — beam sweeps up into row 0 (the key1 fetch corridor) exactly
            // every 4th turn, lining up with the earliest possible arrival at (0,4).
            { type: "rotating", position: { row: 2, col: 4 }, startDirection: 0 },
            // Suspicion guard to the right of door1 — guards the return trip through door2
            { type: "suspicion", position: { row: 6, col: 6 }, range: 2 },
        ],
        // Key1 in top-right: freely reachable right along row 0
        // Key2 in right zone: only reachable after door1 opened
        keys: [
            { row: 0, col: 8, keyId: 1 },
            { row: 6, col: 8, keyId: 2 },
        ],
        doors: [
            { row: 4, col: 5, keyId: 1 },
            { row: 8, col: 5, keyId: 2 },
        ],
        affordances: { undo: true, preview: true },
        parMoves: 33,
    },

    // === ACT 5: THE CORRIDOR (decay intro) ===
    {
        // L6 — Flickering Corridor
        // Mechanic intro: light decay. A blinking guard alternates on/off every turn; with
        //   decayTiles="all", a cell that just went dark stays warm (lethal) for one more turn.
        //   That afterglow exactly fills the gap the blink would otherwise open — a cell a
        //   period-2 blinker lights is lit-or-warm on EVERY turn, i.e. permanently sealed for
        //   as long as decay is active. (Verified: a bare blinker's own litCell alternates
        //   lit/warm/lit/warm forever once decayTiles is on — never both false.)
        // Intended path sketch: three wall bands, single-file gaps. Band 1's only gap is (2,7);
        //   band 2 has two gaps, (5,2) and (5,7); band 3's only gap is (8,2). The blinker seals
        //   (5,7) — the gap directly below band 1's own gap — so the player who took the
        //   "obvious" band-1 gap at col 7 must then walk all the way back to col 2 to cross
        //   band 2, then continue down to band 3's col-2 gap. Removing decay reopens (5,7) on
        //   its dark half-turns, deleting the backtrack entirely (verified ablation below).
        // Key insight: the blinker's own gap looks like the fast route but decay keeps it shut
        //   the whole level — cross where the blinker ISN'T, not where it looks open.
        id: 6,
        name: "The Flickering Corridor",
        storyKey: "level6Story",
        grid: { rows: 10, cols: 10 },
        player: { row: 0, col: 0 },
        goal: { row: 9, col: 9 },
        walls: [
            // Band 1 — single gap at (2,7)
            { row: 2, col: 0 }, { row: 2, col: 1 }, { row: 2, col: 2 }, { row: 2, col: 3 },
            { row: 2, col: 4 }, { row: 2, col: 5 }, { row: 2, col: 6 },
            { row: 2, col: 8 }, { row: 2, col: 9 },
            // Band 2 — gaps at (5,2) and (5,7); (5,7) is the sealed one
            { row: 5, col: 0 }, { row: 5, col: 1 }, { row: 5, col: 3 }, { row: 5, col: 4 },
            { row: 5, col: 5 }, { row: 5, col: 6 }, { row: 5, col: 8 }, { row: 5, col: 9 },
            // Band 3 — single gap at (8,2)
            { row: 8, col: 0 }, { row: 8, col: 1 }, { row: 8, col: 3 }, { row: 8, col: 4 },
            { row: 8, col: 5 }, { row: 8, col: 6 }, { row: 8, col: 7 }, { row: 8, col: 9 },
        ],
        guards: [
            // Blinking guard seals (5,7) — the gap under band 1's own opening.
            {
                type: "blinking",
                position: { row: 5, col: 7 },
                startState: true,
                litCells: [{ row: 5, col: 7 }],
            },
            // Static guard on the forced col-2 corridor between band 2 and band 3 — a second,
            // independent timing cost on top of the decay-forced backtrack.
            { type: "static", position: { row: 6, col: 3 }, initialRadius: 1 },
        ],
        decayTiles: "all",
        affordances: { undo: true, preview: true },
        parMoves: 32,
    },

    // === ACT 6: THE UNDERGROUND (mirror + door intro) ===
    {
        // L7 — Underground Passage
        // Mechanic intro: mirror guard (reflects rotating beam 90°) PLUS door+key gate
        // Intended path sketch:
        //   Rotating guard at (2,2) faces right on the turn its beam reaches (2,7): a cw mirror
        //   there deflects it DOWN col 7 to (4,7), where a second (ccw) mirror deflects it RIGHT
        //   along row 4 — straight onto the key cell (4,9). The two-bounce chain means the key
        //   pickup itself is periodically covered, not just the approach to it.
        //   Door at (8,5) keyId=1 blocks the lower-center passage to the goal; key1 (the one the
        //   mirror chain guards) is required to open it.
        //   Wall band: row 5 cols 4-8 (except (5,5) open) forces the return trip through one
        //   corridor cell.
        // Key insight: trace the beam through BOTH mirrors before committing to the key —
        //   the second bounce lands exactly on the tile you need to stand on.
        id: 7,
        name: "The Underground Passage",
        storyKey: "level7Story",
        grid: { rows: 11, cols: 11 },
        player: { row: 0, col: 0 },
        goal: { row: 10, col: 10 },
        walls: [
            // Left approach: channel player down col 0-2 then across
            { row: 1, col: 3 }, { row: 1, col: 4 },
            { row: 3, col: 1 }, { row: 3, col: 5 },
            // Center barrier: wall at row 5 cols 4-8 except gap at (5,5)
            { row: 5, col: 4 }, { row: 5, col: 6 }, { row: 5, col: 7 }, { row: 5, col: 8 },
            // Right zone walls: channel to key at (4,9). (4,7) is left open for the second
            // mirror to occupy; (4,8) is left open so its reflected beam can reach the key.
            { row: 2, col: 8 },
            // Right-side barrier col 9-10, rows 7-10: blocks right-column bypass to goal
            // Player cannot sneak down col 9/10 to reach (10,10) without going through door
            { row: 7, col: 9 }, { row: 7, col: 10 },
            { row: 8, col: 9 }, { row: 8, col: 10 },
            { row: 9, col: 9 }, { row: 9, col: 10 },
            // Lower zone: wall at row 8 except door at (8,5)
            { row: 8, col: 0 }, { row: 8, col: 1 }, { row: 8, col: 2 }, { row: 8, col: 3 }, { row: 8, col: 4 },
            // (8,5) = door keyId=1
            { row: 8, col: 6 }, { row: 8, col: 7 }, { row: 8, col: 8 },
            // Goal area
            { row: 9, col: 3 }, { row: 9, col: 7 },
        ],
        guards: [
            // Rotating guard feeds mirror chain — phased so its "facing right" turn (the one
            // turn in 4 that fires the mirror chain) lands on the earliest possible arrival
            // at the key cell, forcing a real timing decision rather than a free pickup.
            { type: "rotating", position: { row: 2, col: 2 }, startDirection: 0 },
            // cw mirror at (2,7): right→down deflection
            { type: "mirror", position: { row: 2, col: 7 }, reflectDirection: "cw" },
            // ccw mirror at (4,7): down→right deflection — lands the beam on the key cell
            { type: "mirror", position: { row: 4, col: 7 }, reflectDirection: "ccw" },
        ],
        // Key at (4,9): right zone, accessible during beam-safe window in col 9
        keys: [
            { row: 4, col: 9, keyId: 1 },
        ],
        // Door at (8,5): lower barrier gap; needs key1 collected from right zone
        doors: [
            { row: 8, col: 5, keyId: 1 },
        ],
        affordances: { undo: true, preview: true },
        parMoves: 30,
    },

    // === ACT 7: THE OUTER WALL (sniper intro) ===
    {
        // L8 — The Gauntlet
        // Mechanic intro: sniper guard (unbounded LoS beam, rotates 90° CW every 2 turns)
        // Intended path sketch: row 5 is a solid band with a single gap at col 8. The sniper
        //   sits at (0,8), directly above the gap, starting faced up — its facing cycles
        //   up→up→right→right→down→down→left→left (2 turns each). facing(k)=(0+floor(k/2))%4,
        //   so it faces DOWN (sweeping the whole gap column) on turns 11-12 — bracketing turn 13,
        //   the earliest possible arrival at the gap from (0,0). The player must either wait a
        //   beat for the beam to rotate past, or arrive a turn later than the direct route.
        //   Patrolling guard + static guard add secondary timing costs in the upper approach and
        //   the lower approach to the goal.
        // Key insight: the sniper's cadence is fixed and its beam is unbounded — count turns from
        //   the start, don't just watch the current facing, since the gap is the only crossing.
        id: 8,
        name: "The Gauntlet",
        storyKey: "level8Story",
        grid: { rows: 11, cols: 11 },
        player: { row: 0, col: 0 },
        goal: { row: 10, col: 10 },
        walls: [
            // Row 5 band — single gap at col 8, directly under the sniper
            { row: 5, col: 0 }, { row: 5, col: 1 }, { row: 5, col: 2 }, { row: 5, col: 3 },
            { row: 5, col: 4 }, { row: 5, col: 5 }, { row: 5, col: 6 }, { row: 5, col: 7 },
            { row: 5, col: 9 }, { row: 5, col: 10 },
            // Bottom-edge block — kill the free row-10 perimeter walk near the goal
            { row: 10, col: 4 }, { row: 10, col: 5 },
            // Upper-zone texture — shapes the approach to the gap
            { row: 1, col: 3 }, { row: 1, col: 7 },
            { row: 2, col: 5 },
            { row: 3, col: 2 }, { row: 3, col: 6 },
            { row: 4, col: 4 }, { row: 4, col: 9 },
            // Lower-zone texture — shapes the approach to the goal
            { row: 6, col: 3 },
            { row: 7, col: 9 },
            { row: 8, col: 2 }, { row: 8, col: 7 },
            { row: 9, col: 4 }, { row: 9, col: 6 },
        ],
        guards: [
            // Sniper directly above the row-5 gap, starting faced up
            { type: "sniper", position: { row: 0, col: 8 }, startFacing: 0, rotateCadence: 2 },
            // Patrolling guard in upper zone (path kept off wall cells)
            {
                type: "patrolling",
                startPosition: { row: 7, col: 2 },
                path: [
                    { row: 7, col: 2 }, { row: 7, col: 3 },
                    { row: 7, col: 4 }, { row: 7, col: 3 },
                ],
            },
            // Static guard blocks the leftward detour in the upper approach
            { type: "static", position: { row: 4, col: 3 }, initialRadius: 2 },
        ],
        affordances: { undo: true, preview: true },
        parMoves: 24,
    },

    // === ACT 8: THE ROYAL PALACE (throwable stones intro) ===
    {
        // L9 — Decoy Path
        // Mechanic intro: throwable stones (no undo)
        // Intended path sketch: rows 4 and 6 are solid bands with a single shared gap at col 6 —
        //   the only crossing between the upper and lower halves. Patrolling guard B bounces
        //   cols 6-9 and seals that gap (own-cell + front-cell) for 2 of every 6 turns.
        //   Patrolling guard A adds a second timing cost in the lower approach corridor.
        //   Sniper + suspicion guard the lower-right approach to the goal.
        //   NOTE: at the current BFS optimum the player times around both patrols with a wait
        //   and a short detour rather than needing a throw — stones shorten a sloppier, more
        //   naive route but are not yet strictly load-bearing at the optimum (see report).
        // Key insight: patrol B's bounce at the gap is a short, fixed, countable period —
        //   time your crossing to its gap turns rather than reacting on the fly.
        id: 9,
        name: "The Decoy Path",
        storyKey: "level9Story",
        grid: { rows: 11, cols: 11 },
        player: { row: 0, col: 0 },
        goal: { row: 10, col: 10 },
        walls: [
            { row: 1, col: 3 }, { row: 1, col: 7 },
            { row: 2, col: 1 }, { row: 2, col: 5 }, { row: 2, col: 9 },
            { row: 3, col: 3 }, { row: 3, col: 7 },
            // Row 4 band — single gap at col 6
            { row: 4, col: 0 }, { row: 4, col: 1 }, { row: 4, col: 2 }, { row: 4, col: 3 },
            { row: 4, col: 4 }, { row: 4, col: 5 }, { row: 4, col: 7 }, { row: 4, col: 8 },
            { row: 4, col: 9 }, { row: 4, col: 10 },
            { row: 5, col: 0 }, { row: 5, col: 10 },
            // Row 6 band — single gap at col 6
            { row: 6, col: 0 }, { row: 6, col: 1 }, { row: 6, col: 2 }, { row: 6, col: 3 },
            { row: 6, col: 4 }, { row: 6, col: 5 }, { row: 6, col: 7 }, { row: 6, col: 8 },
            { row: 6, col: 9 }, { row: 6, col: 10 },
            { row: 7, col: 2 }, { row: 7, col: 8 },
            { row: 8, col: 4 }, { row: 8, col: 6 },
            { row: 9, col: 1 }, { row: 9, col: 9 },
        ],
        guards: [
            // Patrolling guard A — secondary timing cost in the lower approach corridor
            {
                type: "patrolling",
                startPosition: { row: 8, col: 3 },
                path: [
                    { row: 8, col: 3 }, { row: 8, col: 2 },
                    { row: 8, col: 1 }, { row: 8, col: 0 },
                ],
            },
            // Patrolling guard B — seals the row 4/6 gap at (5,6). Its bounce visits (5,6)
            // as an endpoint every 6 turns (own-cell) and approaches it from (5,7) the turn
            // before (front-cell) — 2 consecutive dangerous turns per cycle. A stone thrown
            // at it while it is still approaching forces its facing away from the gap for
            // that one turn, clearing the front-light a turn early.
            {
                type: "patrolling",
                startPosition: { row: 5, col: 6 },
                path: [
                    { row: 5, col: 6 }, { row: 5, col: 7 },
                    { row: 5, col: 8 }, { row: 5, col: 9 },
                ],
            },
            // Sniper covers the lower exit corridor (faces left, rotates every 2 turns)
            { type: "sniper", position: { row: 8, col: 9 }, startFacing: 3, rotateCadence: 2 },
            // Suspicion guard blocks right flank bypass
            { type: "suspicion", position: { row: 3, col: 9 }, range: 3 },
        ],
        stones: 2,
        affordances: { undo: false, preview: true },
        parMoves: 25,
    },

    // === ACT 9: HALL OF MIRRORS (combo level) ===
    {
        // L10 — Hall of Mirrors
        // Mechanic intro: (none — pure combo) mirrors + sniper + decay + stones
        // Intended path sketch: two rotating guards feed two mirrors; the perimeter walk is
        //   walled off so the route must cross rotator 1's beam column near (4,7). Its facing
        //   cycle is phased to intercept the earliest possible arrival there, and the warm
        //   afterglow (decayTiles="all") keeps that cell dangerous one turn longer than the lit
        //   sweep alone would — removing decay measurably shortens the solve (verified below).
        //   Sniper + patrol guard the lower-right approach to the goal as a second layer.
        // NOTE: at the current optimum neither mirror's REFLECTED beam nor the stone is what
        //   the route dodges — it's rotator 1's direct beam plus decay. Mirrors and stones are
        //   present and functional but not yet proven load-bearing at the BFS optimum (see report).
        // Key insight: decay makes the beam's afterglow outlast the sweep — count from when the
        //   light left, not when it's dark, before you step in.
        id: 10,
        name: "Hall of Mirrors",
        storyKey: "level10Story",
        grid: { rows: 12, cols: 12 },
        player: { row: 0, col: 0 },
        goal: { row: 11, col: 11 },
        walls: [
            // Left-edge / bottom-edge blocks — kill the free perimeter walk
            { row: 4, col: 0 }, { row: 5, col: 0 },
            { row: 11, col: 5 }, { row: 11, col: 6 },
            { row: 1, col: 3 }, { row: 1, col: 7 },
            { row: 2, col: 9 },
            { row: 3, col: 1 }, { row: 3, col: 8 },
            { row: 4, col: 4 }, { row: 4, col: 10 },
            { row: 5, col: 2 },
            { row: 6, col: 4 }, { row: 6, col: 9 },
            { row: 7, col: 1 },
            { row: 8, col: 5 }, { row: 8, col: 10 },
            { row: 9, col: 3 }, { row: 9, col: 8 },
            { row: 10, col: 6 }, { row: 10, col: 9 },
        ],
        guards: [
            // Rotating guard feeds first mirror — phased so its beam-active turn lands on
            // the earliest possible arrival at (4,7), on the reflected beam's column
            { type: "rotating", position: { row: 2, col: 2 }, startDirection: 2 },
            // cw mirror: right→down
            { type: "mirror", position: { row: 2, col: 7 }, reflectDirection: "cw" },
            // Second rotating guard feeds second mirror
            { type: "rotating", position: { row: 7, col: 9 }, startDirection: 3 },
            // ccw mirror: left→down deflection (complements first chain)
            { type: "mirror", position: { row: 7, col: 4 }, reflectDirection: "ccw" },
            // Sniper at lower left — its right-facing beam sweeps 4 open cells (cols 2-5)
            // before the row-10 wall at col 6
            { type: "sniper", position: { row: 10, col: 1 }, startFacing: 0, rotateCadence: 2 },
            // Patrolling guard in mid zone — distractible with stone
            {
                type: "patrolling",
                startPosition: { row: 6, col: 6 },
                path: [
                    { row: 6, col: 6 }, { row: 6, col: 7 },
                    { row: 6, col: 8 }, { row: 6, col: 7 },
                ],
            },
        ],
        decayTiles: "all",
        stones: 1,
        affordances: { undo: false, preview: true },
        parMoves: 26,
    },

    // === ACT 10: THE THRONE ROOM (endgame — full palette) ===
    {
        // L11 — Throne Room
        // Mechanic intro: chaser (full palette: all 6 guard types + stones; undo disabled,
        //   preview enabled — see owner ruling below)
        // Intended path sketch: perimeter walls kill the old free left-edge/bottom-edge walk
        //   that used to beat this level in 20 moves without ever coming near a guard. The
        //   chaser sits centrally at (6,6), detectionRadius 2, guarding the mid-map crossing;
        //   it is the entire measured guard tax (verified: removing only the chaser drops the
        //   solve back to the guard-free 20). Static, rotating+mirror, sniper, suspicion and
        //   patrol are all present, functional, and correctly positioned (no wall/guard
        //   overlaps) but do not yet independently add tax at the current BFS optimum — every
        //   attempt to force a second, independent chokepoint on this board (a static-on-gap
        //   timing trap, a sniper-guarded band near the goal) made the level provably
        //   unsolvable instead, because the chaser's own aggro state removes exactly the
        //   retreat-and-retry room those tricks depend on. See report for detail.
        // OWNER RULING: preview re-enabled, undo stays off. Seven live guards with neither
        //   affordance is unfair, not hard — preview is a planning tool, undo is the tension.
        // Key insight: the chaser's detection radius is fixed and Manhattan-based — plan the
        //   mid-map crossing to stay outside radius 2 of (6,6), not just off its exact tile.
        id: 11,
        name: "The Throne Room",
        storyKey: "level11Story",
        grid: { rows: 11, cols: 11 },
        player: { row: 0, col: 0 },
        goal: { row: 10, col: 10 },
        walls: [
            // Perimeter blocks — kill the free left-edge / bottom-edge walk that used to
            // beat this level in 20 moves without coming near a single guard
            { row: 3, col: 0 }, { row: 4, col: 0 }, { row: 7, col: 0 }, { row: 8, col: 0 },
            { row: 10, col: 2 }, { row: 10, col: 3 }, { row: 10, col: 7 }, { row: 10, col: 8 },
            { row: 1, col: 4 }, { row: 1, col: 7 },
            { row: 2, col: 2 }, { row: 2, col: 6 },
            { row: 3, col: 4 },
            { row: 4, col: 1 }, { row: 4, col: 6 },
            { row: 5, col: 3 }, { row: 5, col: 8 },
            { row: 6, col: 7 },
            { row: 7, col: 2 }, { row: 7, col: 6 },
            { row: 8, col: 4 },
            { row: 9, col: 1 }, { row: 9, col: 6 },
        ],
        guards: [
            // Static guard — upper left, wilting
            { type: "static", position: { row: 2, col: 3 }, initialRadius: 2 },
            // Rotating guard feeds mirror
            { type: "rotating", position: { row: 3, col: 5 }, startDirection: 3 },
            // cw mirror — reflects rotating beam (moved off the (3,8) wall cell — same cell,
            // wall removed so the authoring invariant holds)
            { type: "mirror", position: { row: 3, col: 8 }, reflectDirection: "cw" },
            // Sniper — covers right corridor (startFacing=3=left)
            { type: "sniper", position: { row: 6, col: 9 }, startFacing: 3, rotateCadence: 2 },
            // Suspicion guard — flanks upper-right approach
            { type: "suspicion", position: { row: 4, col: 8 }, range: 3 },
            // Patrolling guard — lower-left passage (path moved off the (8,4) wall cell)
            {
                type: "patrolling",
                startPosition: { row: 8, col: 1 },
                path: [
                    { row: 8, col: 1 }, { row: 8, col: 2 },
                    { row: 8, col: 3 }, { row: 8, col: 2 },
                ],
            },
            // Chaser — moved off the (6,5) wall cell to the adjacent open (6,6). Kept at
            // detectionRadius 2 (radius 3+ pushes the solver well past a 60s budget on an
            // 11x11 board with 6 other guards); centrally positioned so its aggro radius still
            // covers the mid-map crossing instead of only catching a player who walks over it.
            { type: "chaser", position: { row: 6, col: 6 }, detectionRadius: 2 },
        ],
        stones: 2,
        affordances: { undo: false, preview: true },
        parMoves: 25,
    },
    {
        // L12 THE PRINCESS CHAMBER — 13x13, 10 guards + expanding light wave.
        // INVARIANT: must be unsolvable by normal play. Only the console
        // easter egg (window.__nntvDev.teleport) wins this level.
        // See memory: project_level12_unsolvable.md.
        id: 12,
        name: "The Princess Chamber",
        storyKey: "level12Story",
        grid: { rows: 13, cols: 13 },
        player: { row: 0, col: 0 },
        goal: { row: 12, col: 12 },
        walls: [
            // Barrier walls forming concentric barriers around the princess
            { row: 2, col: 0 }, { row: 2, col: 1 }, { row: 2, col: 2 },
            { row: 2, col: 3 }, { row: 2, col: 4 }, { row: 2, col: 5 },
            { row: 2, col: 6 }, { row: 2, col: 7 }, { row: 2, col: 8 }, { row: 2, col: 9 },
            { row: 4, col: 3 }, { row: 4, col: 4 }, { row: 4, col: 5 },
            { row: 4, col: 6 }, { row: 4, col: 7 }, { row: 4, col: 8 },
            { row: 4, col: 9 }, { row: 4, col: 10 }, { row: 4, col: 11 }, { row: 4, col: 12 },
            { row: 6, col: 0 }, { row: 6, col: 1 }, { row: 6, col: 2 },
            { row: 6, col: 3 }, { row: 6, col: 4 }, { row: 6, col: 5 },
            { row: 6, col: 6 }, { row: 6, col: 7 }, { row: 6, col: 8 },
            { row: 8, col: 3 }, { row: 8, col: 4 }, { row: 8, col: 5 },
            { row: 8, col: 6 }, { row: 8, col: 7 }, { row: 8, col: 8 },
            { row: 8, col: 9 }, { row: 8, col: 10 }, { row: 8, col: 11 },
            { row: 10, col: 1 }, { row: 10, col: 2 }, { row: 10, col: 3 },
            { row: 10, col: 4 }, { row: 10, col: 5 }, { row: 10, col: 6 },
            { row: 10, col: 7 }, { row: 10, col: 8 }, { row: 10, col: 9 },
        ],
        guards: [
            {
                type: "static",
                position: { row: 1, col: 10 },
                initialRadius: 2,
            },
            {
                type: "rotating",
                position: { row: 3, col: 3 },
                startDirection: 0,
            },
            {
                type: "blinking",
                position: { row: 5, col: 1 },
                startState: true,
                litCells: [
                    { row: 5, col: 0 }, { row: 5, col: 2 },
                ],
            },
            {
                type: "mirror",
                position: { row: 3, col: 11 },
                reflectDirection: "cw",
            },
            {
                type: "patrolling",
                startPosition: { row: 7, col: 1 },
                path: [
                    { row: 7, col: 1 }, { row: 7, col: 2 },
                    { row: 7, col: 3 }, { row: 7, col: 4 },
                    { row: 7, col: 5 }, { row: 7, col: 6 },
                    { row: 7, col: 5 }, { row: 7, col: 4 },
                    { row: 7, col: 3 }, { row: 7, col: 2 },
                ],
            },
            {
                type: "patrolling",
                startPosition: { row: 9, col: 10 },
                path: [
                    { row: 9, col: 10 }, { row: 9, col: 9 },
                    { row: 9, col: 8 }, { row: 9, col: 7 },
                    { row: 9, col: 8 }, { row: 9, col: 9 },
                ],
            },
            {
                type: "static",
                position: { row: 11, col: 11 },
                initialRadius: 2,
            },
            {
                type: "static",
                position: { row: 12, col: 10 },
                initialRadius: 2,
            },
            {
                type: "chaser",
                position: { row: 11, col: 2 },
                detectionRadius: 4,
            },
            {
                type: "chaser",
                position: { row: 9, col: 11 },
                detectionRadius: 4,
            },
        ],
        isFinalLevel: true,
        parMoves: 99,
    },
];
