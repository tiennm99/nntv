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
        parMoves: 22,
    },
    {
        // L2 — Watchtower
        // Mechanic intro: static wilting guards
        // Intended path sketch: same zigzag wall layout as L1 with three static guards on the
        //   fast path. Player must wait 2-3 turns per guard for auras to shrink or take longer routes.
        // Key insight: teaches the wilting mechanic — Space=wait; patience vs detour tradeoff
        id: 2,
        name: "The Watchtower",
        storyKey: "level2Story",
        grid: { rows: 8, cols: 8 },
        player: { row: 0, col: 0 },
        goal: { row: 7, col: 7 },
        walls: [
            { row: 1, col: 4 }, { row: 1, col: 5 }, { row: 1, col: 6 }, { row: 1, col: 7 },
            { row: 3, col: 0 }, { row: 3, col: 1 }, { row: 3, col: 2 }, { row: 3, col: 3 },
            { row: 5, col: 4 }, { row: 5, col: 5 }, { row: 5, col: 6 }, { row: 5, col: 7 },
        ],
        guards: [
            { type: "static", position: { row: 2, col: 5 }, initialRadius: 2 },
            { type: "static", position: { row: 4, col: 3 }, initialRadius: 2 },
            { type: "static", position: { row: 6, col: 6 }, initialRadius: 2 },
        ],
        affordances: { undo: true, preview: true },
        parMoves: 24,
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
            // Static guard upper area — forces player right then down
            { type: "static", position: { row: 0, col: 3 }, initialRadius: 1 },
            // Static guard lower area — forces player to go around before reaching goal
            { type: "static", position: { row: 7, col: 6 }, initialRadius: 1 },
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
        parMoves: 22,
    },

    // === ACT 3: THE SEARCHLIGHT (suspicion guard intro) ===
    {
        // L4 — Searchlight
        // Mechanic intro: suspicion guard (3-tier meter; fires at tier 2 lighting nearby cells)
        // Intended path sketch: rotating guard sweeps upper area. Suspicion guard on right flank
        //   requires player to stay ≥4 cells away (Manhattan) while navigating past it.
        //   Player must time the rotating beam gap AND maintain distance from suspicion guard.
        // Key insight: suspicion is spatial — distance buffer must be maintained every turn
        id: 4,
        name: "The Searchlight",
        storyKey: "level4Story",
        grid: { rows: 9, cols: 9 },
        player: { row: 0, col: 0 },
        goal: { row: 8, col: 8 },
        walls: [
            { row: 1, col: 5 }, { row: 1, col: 6 },
            { row: 2, col: 2 },
            { row: 3, col: 4 }, { row: 3, col: 7 },
            { row: 4, col: 2 }, { row: 4, col: 6 },
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
        //   10×10 grid. Player (0,0), Goal (9,9).
        //   Two keys and two doors in a chained dependency: key1→door1→key2→door2→goal.
        //   Key1 at (0,8): top-right; reachable freely across row 0.
        //   Door1 at (4,5) keyId=1: vertical barrier gap; player needs key1 to pass.
        //   Key2 at (6,8): bottom-right zone; only reachable after passing door1.
        //   Door2 at (8,5) keyId=2: lower vertical barrier gap; player needs key2 to pass.
        //   Goal at (9,9): reachable from (8,6) only after door2 opened.
        //   Vertical barrier (col 5, rows 3-9) is the spine. Gaps at (4,5) door1 and (8,5) door2.
        //   Left side: player starts here, goes right to key1 (row 0), comes back left,
        //     navigates down through rotating guard zone to reach (4,5) door1.
        //   Right side: after door1, grab key2 at (6,8), return to (8,5) door2, then goal.
        //   Rotating guard at (2,3) covers left-center; suspicion at (5,3) range=2 guards
        //   the approach to door1 — must wait or detour to avoid tier-up.
        // Key insight: chained key→door dependency; collect in order.
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
            // Rotating guard in left zone — player must time approach to door1
            { type: "rotating", position: { row: 2, col: 3 }, startDirection: 0 },
            // Suspicion guard to the right of door1 — guards right zone approach to key2
            // Player must approach key2 from outside range (Manhattan > 2 from (6,6))
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
        parMoves: 30,
    },

    // === ACT 5: THE CORRIDOR (decay intro) ===
    {
        // L6 — Flickering Corridor
        // Mechanic intro: light decay (cells stay "warm" for 1 turn after going dark)
        // Intended path sketch: two alternating blinking guards cover the corridor.
        //   With decayTiles="all", cells that just went dark are warm for 1 turn —
        //   player can sprint through during the decay window rather than waiting a full cycle.
        // Key insight: decay window = brief safe window after lights go out; sprint timing
        id: 6,
        name: "The Flickering Corridor",
        storyKey: "level6Story",
        grid: { rows: 10, cols: 10 },
        player: { row: 0, col: 0 },
        goal: { row: 9, col: 9 },
        walls: [
            { row: 1, col: 4 }, { row: 1, col: 5 },
            { row: 2, col: 2 }, { row: 2, col: 7 },
            { row: 3, col: 5 }, { row: 3, col: 8 },
            // NOTE: row 4 left side clear — litCell at (4,3) needs clear path
            { row: 4, col: 1 },
            { row: 5, col: 6 }, { row: 5, col: 8 },
            { row: 6, col: 2 }, { row: 6, col: 4 },
            { row: 7, col: 1 }, { row: 7, col: 7 },
            { row: 8, col: 4 }, { row: 8, col: 6 },
        ],
        guards: [
            // Blinking guard — starts ON, upper corridor
            // All litCells verified non-wall: (2,3) clear, (3,2) clear, (3,4) clear, (4,3) clear
            {
                type: "blinking",
                position: { row: 3, col: 3 },
                startState: true,
                litCells: [
                    { row: 2, col: 3 }, { row: 3, col: 2 },
                    { row: 3, col: 4 }, { row: 4, col: 3 },
                ],
            },
            // Blinking guard — starts OFF (offset timing), lower corridor
            // litCells: (6,6), (7,5), (7,6), (8,5) — all verified non-wall
            {
                type: "blinking",
                position: { row: 7, col: 6 },
                startState: false,
                litCells: [
                    { row: 6, col: 6 }, { row: 7, col: 5 },
                    { row: 7, col: 6 }, { row: 8, col: 5 },
                ],
            },
            // Static guard blocks full detour
            { type: "static", position: { row: 5, col: 4 }, initialRadius: 2 },
        ],
        decayTiles: "all",
        affordances: { undo: true, preview: true },
        parMoves: 22,
    },

    // === ACT 6: THE UNDERGROUND (mirror + door intro) ===
    {
        // L7 — Underground Passage
        // Mechanic intro: mirror guard (reflects rotating beam 90°) PLUS door+key gate
        // Intended path sketch:
        //   Rotating guard at (2,2) starts facing right (dir=1). Beam hits cw mirror at (2,7)
        //   → deflects DOWN through col 7. Second cw mirror at (6,7) → beam deflects LEFT
        //   along row 6 covering (6,6)-(6,0). Player must dodge reflected beam zones.
        //   Key at (4,9): in the right zone past the mirror chain; player reaches it
        //   by going along row 0 right, then down col 9 during safe beam window.
        //   Door at (8,5) keyId=1: blocks the lower-center passage to the goal.
        //   Player must: navigate mirror-chain beam → collect key at (4,9) →
        //   cross to left zone → unlock door at (8,5) → reach goal (10,10).
        //   Wall band: row 5 cols 4-8 (except (5,5) open) forces player through specific corridors.
        // Key insight: chain mirror → beam trace per turn; door adds collectible side-objective.
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
            // Right zone walls: channel to key at (4,9)
            { row: 2, col: 8 },
            { row: 4, col: 7 }, { row: 4, col: 8 },
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
            // Rotating guard feeds mirror chain
            { type: "rotating", position: { row: 2, col: 2 }, startDirection: 1 },
            // cw mirror at (2,7): right→down deflection
            { type: "mirror", position: { row: 2, col: 7 }, reflectDirection: "cw" },
            // cw mirror at (6,7): down→left deflection — creates horizontal beam sweep
            { type: "mirror", position: { row: 6, col: 7 }, reflectDirection: "cw" },
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
        // Mechanic intro: sniper guard (LoS beam to grid edge, rotates 90° CW every 2 turns)
        // Intended path sketch: sniper at (3,8) starts facing left, sweeping upper corridor.
        //   Every 2 turns it rotates CW — player must time moves inside the 2-turn safe window.
        //   Patrolling guard in lower zone creates a second constraint.
        // Key insight: sniper cadence is fixed — count turns; safe window repeats every 4 turns
        id: 8,
        name: "The Gauntlet",
        storyKey: "level8Story",
        grid: { rows: 11, cols: 11 },
        player: { row: 0, col: 0 },
        goal: { row: 10, col: 10 },
        walls: [
            { row: 1, col: 3 }, { row: 1, col: 7 },
            { row: 2, col: 5 },
            { row: 3, col: 2 }, { row: 3, col: 6 },
            { row: 4, col: 4 }, { row: 4, col: 9 },
            { row: 5, col: 1 }, { row: 5, col: 7 },
            { row: 6, col: 3 }, { row: 6, col: 8 },
            { row: 7, col: 5 }, { row: 7, col: 9 },
            { row: 8, col: 2 }, { row: 8, col: 7 },
            { row: 9, col: 4 }, { row: 9, col: 6 },
        ],
        guards: [
            // Sniper starts facing left (3=left), rotates CW every 2 turns
            { type: "sniper", position: { row: 3, col: 8 }, startFacing: 3, rotateCadence: 2 },
            // Patrolling guard in lower zone
            {
                type: "patrolling",
                startPosition: { row: 7, col: 4 },
                path: [
                    { row: 7, col: 4 }, { row: 7, col: 5 },
                    { row: 7, col: 6 }, { row: 7, col: 5 },
                ],
            },
            // Static guard blocks leftward detour
            { type: "static", position: { row: 5, col: 3 }, initialRadius: 2 },
        ],
        affordances: { undo: true, preview: true },
        parMoves: 28,
    },

    // === ACT 8: THE ROYAL PALACE (throwable stones intro) ===
    {
        // L9 — Decoy Path
        // Mechanic intro: throwable stones (no undo)
        // Intended path sketch: patrolling guard A + patrolling guard B cover the crossing row
        //   at row 5 with phase-offset patrols (A covers cols 3-5, B covers cols 5-7, overlapping).
        //   Sniper below covers the only alternative lower route.
        //   With stones=2: throw at patrol position → distract guard for 1 turn → sprint through
        //   gap → throw second stone at sniper to clear lower exit.
        //   Note (phase 04): with current engine, stones=0 still solvable via long wait loops;
        //   stones provide ~10-move shortcut making the level tractable within parMoves.
        // Key insight: stones reduce required waiting turns significantly — plan throws carefully
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
            { row: 4, col: 0 }, { row: 4, col: 1 }, { row: 4, col: 9 }, { row: 4, col: 10 },
            { row: 5, col: 0 }, { row: 5, col: 10 },
            { row: 6, col: 0 }, { row: 6, col: 4 }, { row: 6, col: 6 }, { row: 6, col: 10 },
            { row: 7, col: 2 }, { row: 7, col: 8 },
            { row: 8, col: 4 }, { row: 8, col: 6 },
            { row: 9, col: 1 }, { row: 9, col: 9 },
        ],
        guards: [
            // Patrolling guard A covers left half of row 5 corridor
            {
                type: "patrolling",
                startPosition: { row: 5, col: 2 },
                path: [
                    { row: 5, col: 2 }, { row: 5, col: 3 },
                    { row: 5, col: 4 }, { row: 5, col: 5 },
                    { row: 5, col: 4 }, { row: 5, col: 3 },
                ],
            },
            // Patrolling guard B covers right half of row 5 corridor (phase offset)
            {
                type: "patrolling",
                startPosition: { row: 5, col: 8 },
                path: [
                    { row: 5, col: 8 }, { row: 5, col: 7 },
                    { row: 5, col: 6 }, { row: 5, col: 5 },
                    { row: 5, col: 6 }, { row: 5, col: 7 },
                ],
            },
            // Sniper covers the lower exit corridor (faces left, rotates every 2 turns)
            { type: "sniper", position: { row: 8, col: 9 }, startFacing: 3, rotateCadence: 2 },
            // Suspicion guard blocks right flank bypass
            { type: "suspicion", position: { row: 3, col: 9 }, range: 3 },
        ],
        stones: 2,
        affordances: { undo: false, preview: true },
        parMoves: 28,
    },

    // === ACT 9: HALL OF MIRRORS (combo level) ===
    {
        // L10 — Hall of Mirrors
        // Mechanic intro: (none — pure combo) mirrors + sniper + decay + stones
        // Intended path sketch: two rotating guards feed two mirrors creating cross-coverage zones.
        //   decayTiles="all" provides brief warm windows after beams sweep past.
        //   Sniper covers goal approach — time entry between rotations.
        //   One stone distracts patrolling guard to open crossing window.
        // Key insight: overlay all four mechanic systems; decay windows are the safe slots
        id: 10,
        name: "Hall of Mirrors",
        storyKey: "level10Story",
        grid: { rows: 12, cols: 12 },
        player: { row: 0, col: 0 },
        goal: { row: 11, col: 11 },
        walls: [
            { row: 1, col: 3 }, { row: 1, col: 7 },
            { row: 2, col: 5 }, { row: 2, col: 9 },
            { row: 3, col: 1 }, { row: 3, col: 8 },
            { row: 4, col: 4 }, { row: 4, col: 10 },
            { row: 5, col: 2 }, { row: 5, col: 6 },
            { row: 6, col: 4 }, { row: 6, col: 9 },
            { row: 7, col: 1 }, { row: 7, col: 7 },
            { row: 8, col: 5 }, { row: 8, col: 10 },
            { row: 9, col: 3 }, { row: 9, col: 8 },
            { row: 10, col: 6 }, { row: 10, col: 9 },
        ],
        guards: [
            // Rotating guard feeds first mirror
            { type: "rotating", position: { row: 2, col: 2 }, startDirection: 1 },
            // cw mirror: right→down
            { type: "mirror", position: { row: 2, col: 7 }, reflectDirection: "cw" },
            // Second rotating guard feeds second mirror
            { type: "rotating", position: { row: 7, col: 9 }, startDirection: 3 },
            // ccw mirror: left→down deflection (complements first chain)
            { type: "mirror", position: { row: 7, col: 4 }, reflectDirection: "ccw" },
            // Sniper at lower right — covers goal approach
            { type: "sniper", position: { row: 10, col: 8 }, startFacing: 0, rotateCadence: 2 },
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
        parMoves: 34,
    },

    // === ACT 10: THE THRONE ROOM (endgame — full palette) ===
    {
        // L11 — Throne Room
        // Mechanic intro: chaser (full palette: all 6 guard types + stones, no undo/preview)
        // Intended path sketch: chaser ambushes the central path (stay outside detectionRadius=2).
        //   Sniper sweeps right corridor. Suspicion guard flanks upper-right.
        //   Stones=2: distract patrolling guard + sniper in sequence.
        //   No undo, no preview — full memorization and planning required.
        // Key insight: endgame synthesis; every mechanic contributes to blocking all easy routes
        id: 11,
        name: "The Throne Room",
        storyKey: "level11Story",
        grid: { rows: 11, cols: 11 },
        player: { row: 0, col: 0 },
        goal: { row: 10, col: 10 },
        walls: [
            { row: 1, col: 4 }, { row: 1, col: 7 },
            { row: 2, col: 2 }, { row: 2, col: 6 },
            { row: 3, col: 4 }, { row: 3, col: 8 },
            { row: 4, col: 1 }, { row: 4, col: 6 },
            { row: 5, col: 3 }, { row: 5, col: 8 },
            { row: 6, col: 5 }, { row: 6, col: 7 },
            { row: 7, col: 2 }, { row: 7, col: 6 },
            { row: 8, col: 4 }, { row: 8, col: 8 },
            { row: 9, col: 1 }, { row: 9, col: 6 },
        ],
        guards: [
            // Static guard — upper left, wilting
            { type: "static", position: { row: 2, col: 3 }, initialRadius: 2 },
            // Rotating guard feeds mirror
            { type: "rotating", position: { row: 3, col: 5 }, startDirection: 0 },
            // cw mirror — reflects rotating beam
            { type: "mirror", position: { row: 3, col: 8 }, reflectDirection: "cw" },
            // Sniper — covers right corridor (startFacing=3=left)
            { type: "sniper", position: { row: 6, col: 9 }, startFacing: 3, rotateCadence: 2 },
            // Suspicion guard — flanks upper-right approach
            { type: "suspicion", position: { row: 4, col: 8 }, range: 3 },
            // Patrolling guard — lower passage
            {
                type: "patrolling",
                startPosition: { row: 8, col: 3 },
                path: [
                    { row: 8, col: 3 }, { row: 8, col: 4 },
                    { row: 8, col: 5 }, { row: 8, col: 4 },
                ],
            },
            // Chaser — small detectionRadius to limit BFS state explosion
            { type: "chaser", position: { row: 6, col: 5 }, detectionRadius: 2 },
        ],
        stones: 2,
        affordances: { undo: false, preview: false },
        parMoves: 36,
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
