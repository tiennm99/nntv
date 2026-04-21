export const LEVELS = [
    // === ACT 1: THE OUTSKIRTS (movement + static guards) ===
    {
        // L1 Garden Path — 8x8, 0 guards. Teaches movement with a winding corridor
        // that has no true "wrong" branches — every open cell leads somewhere useful.
        id: 1,
        name: "Garden Path",
        storyKey: "level1Story",
        grid: { rows: 8, cols: 8 },
        player: { row: 0, col: 0 },
        goal: { row: 7, col: 7 },
        walls: [
            { row: 1, col: 1 }, { row: 1, col: 2 }, { row: 1, col: 3 }, { row: 1, col: 4 },
            { row: 2, col: 4 }, { row: 2, col: 6 },
            { row: 3, col: 0 }, { row: 3, col: 1 }, { row: 3, col: 4 }, { row: 3, col: 6 },
            { row: 4, col: 4 }, { row: 4, col: 6 },
            { row: 5, col: 1 }, { row: 5, col: 2 }, { row: 5, col: 3 }, { row: 5, col: 4 }, { row: 5, col: 6 },
            { row: 6, col: 1 },
        ],
        guards: [],
        parMoves: 16,
    },
    {
        // L2 Watchtower — 8x8, 3 static guards with TWO disjoint paths around them.
        // Fixes the original L2 connectivity bug (right-side region unreachable).
        id: 2,
        name: "The Watchtower",
        storyKey: "level2Story",
        grid: { rows: 8, cols: 8 },
        player: { row: 0, col: 0 },
        goal: { row: 7, col: 7 },
        walls: [
            { row: 1, col: 2 }, { row: 2, col: 1 }, { row: 2, col: 6 },
            { row: 3, col: 2 }, { row: 3, col: 5 },
            { row: 6, col: 3 }, { row: 6, col: 5 },
        ],
        guards: [
            {
                type: "static",
                position: { row: 2, col: 4 },
                litCells: [
                    { row: 1, col: 4 }, { row: 2, col: 3 },
                    { row: 2, col: 5 }, { row: 3, col: 4 },
                ],
            },
            {
                type: "static",
                position: { row: 5, col: 2 },
                litCells: [
                    { row: 4, col: 2 }, { row: 5, col: 1 },
                    { row: 5, col: 3 }, { row: 6, col: 2 },
                ],
            },
            {
                type: "static",
                position: { row: 5, col: 6 },
                litCells: [
                    { row: 4, col: 6 }, { row: 5, col: 5 },
                    { row: 5, col: 7 }, { row: 6, col: 6 },
                ],
            },
        ],
        parMoves: 18,
    },

    // === ACT 2: THE VEGETABLE GARDEN (rotating + blinking intro) ===
    {
        // L3 Vegetable Patrol — 9x9, 4 guards (3 static + 1 rotating).
        // Rotating guard introduced in the middle; static guards flank the edges.
        id: 3,
        name: "Vegetable Patrol",
        storyKey: "level3Story",
        grid: { rows: 9, cols: 9 },
        player: { row: 0, col: 0 },
        goal: { row: 8, col: 8 },
        walls: [
            { row: 1, col: 4 }, { row: 1, col: 5 },
            { row: 2, col: 1 }, { row: 2, col: 7 },
            { row: 3, col: 3 }, { row: 3, col: 5 },
            { row: 5, col: 3 }, { row: 5, col: 6 },
            { row: 6, col: 0 }, { row: 6, col: 7 },
            { row: 7, col: 3 }, { row: 7, col: 4 },
        ],
        guards: [
            {
                type: "static",
                position: { row: 2, col: 3 },
                litCells: [
                    { row: 1, col: 3 }, { row: 2, col: 2 },
                    { row: 2, col: 4 }, { row: 3, col: 2 },
                ],
            },
            {
                type: "rotating",
                position: { row: 4, col: 4 },
                startDirection: 0,
            },
            {
                type: "static",
                position: { row: 6, col: 5 },
                litCells: [
                    { row: 5, col: 5 }, { row: 6, col: 4 },
                    { row: 6, col: 6 }, { row: 7, col: 5 },
                ],
            },
            {
                type: "static",
                position: { row: 5, col: 1 },
                litCells: [
                    { row: 4, col: 1 }, { row: 5, col: 0 },
                    { row: 5, col: 2 }, { row: 6, col: 1 },
                ],
            },
        ],
        parMoves: 18,
    },
    {
        // L4 Searchlight — 9x9, 5 guards: rotating + blinking intro + 3 static.
        // Blinking guard creates a timing window — player must wait for lights off.
        id: 4,
        name: "The Searchlight",
        storyKey: "level4Story",
        grid: { rows: 9, cols: 9 },
        player: { row: 0, col: 0 },
        goal: { row: 8, col: 8 },
        walls: [
            { row: 1, col: 5 }, { row: 1, col: 6 },
            { row: 2, col: 3 }, { row: 3, col: 1 }, { row: 3, col: 6 },
            { row: 4, col: 3 }, { row: 4, col: 5 },
            { row: 5, col: 1 }, { row: 5, col: 7 },
            { row: 6, col: 3 }, { row: 6, col: 5 },
            { row: 7, col: 7 },
        ],
        guards: [
            {
                type: "rotating",
                position: { row: 2, col: 5 },
                startDirection: 0,
            },
            {
                type: "blinking",
                position: { row: 5, col: 4 },
                startState: true,
                litCells: [
                    { row: 4, col: 4 }, { row: 5, col: 3 },
                    { row: 5, col: 5 }, { row: 6, col: 4 },
                ],
            },
            {
                type: "static",
                position: { row: 3, col: 3 },
                litCells: [
                    { row: 2, col: 3 }, { row: 3, col: 2 },
                    { row: 3, col: 4 }, { row: 4, col: 3 },
                ],
            },
            {
                type: "static",
                position: { row: 7, col: 2 },
                litCells: [
                    { row: 6, col: 2 }, { row: 7, col: 1 },
                    { row: 7, col: 3 }, { row: 8, col: 2 },
                ],
            },
            {
                type: "static",
                position: { row: 6, col: 7 },
                litCells: [
                    { row: 5, col: 7 }, { row: 6, col: 6 },
                    { row: 6, col: 8 }, { row: 7, col: 7 },
                ],
            },
        ],
        parMoves: 19,
    },

    // === ACT 3: THE FORTRESS (patrolling intro) ===
    {
        // L5 Fortress Gate — 10x10, 6 guards: static+rotating+blinking+1 patrolling intro.
        id: 5,
        name: "Fortress Gate",
        storyKey: "level5Story",
        grid: { rows: 10, cols: 10 },
        player: { row: 0, col: 0 },
        goal: { row: 9, col: 9 },
        walls: [
            { row: 1, col: 2 }, { row: 1, col: 6 },
            { row: 2, col: 4 }, { row: 2, col: 8 },
            { row: 3, col: 0 }, { row: 3, col: 6 },
            { row: 4, col: 4 }, { row: 4, col: 8 },
            { row: 6, col: 0 }, { row: 6, col: 4 },
            { row: 7, col: 6 }, { row: 7, col: 8 },
            { row: 8, col: 2 }, { row: 8, col: 5 },
        ],
        guards: [
            {
                type: "static",
                position: { row: 2, col: 2 },
                litCells: [
                    { row: 1, col: 1 }, { row: 2, col: 1 },
                    { row: 2, col: 3 }, { row: 3, col: 2 },
                ],
            },
            {
                type: "rotating",
                position: { row: 4, col: 6 },
                startDirection: 0,
            },
            {
                type: "blinking",
                position: { row: 5, col: 2 },
                startState: true,
                litCells: [
                    { row: 4, col: 2 }, { row: 5, col: 1 },
                    { row: 5, col: 3 }, { row: 6, col: 2 },
                ],
            },
            {
                type: "static",
                position: { row: 7, col: 7 },
                litCells: [
                    { row: 6, col: 7 }, { row: 7, col: 6 },
                    { row: 8, col: 7 },
                ],
            },
            {
                type: "static",
                position: { row: 3, col: 8 },
                litCells: [
                    { row: 2, col: 8 }, { row: 3, col: 7 },
                    { row: 3, col: 9 }, { row: 4, col: 8 },
                ],
            },
            {
                type: "patrolling",
                startPosition: { row: 6, col: 5 },
                path: [
                    { row: 6, col: 5 }, { row: 6, col: 6 },
                    { row: 7, col: 5 }, { row: 7, col: 4 },
                ],
            },
        ],
        parMoves: 21,
    },
    {
        // L6 Flickering Corridor — 10x10, 7 guards with 2 patrollers + blinkers.
        id: 6,
        name: "The Flickering Corridor",
        storyKey: "level6Story",
        grid: { rows: 10, cols: 10 },
        player: { row: 0, col: 0 },
        goal: { row: 9, col: 9 },
        walls: [
            { row: 1, col: 3 }, { row: 1, col: 7 },
            { row: 2, col: 1 }, { row: 2, col: 5 },
            { row: 3, col: 3 }, { row: 3, col: 8 },
            { row: 4, col: 0 }, { row: 4, col: 6 },
            { row: 5, col: 2 }, { row: 5, col: 8 },
            { row: 6, col: 4 }, { row: 6, col: 5 },
            { row: 7, col: 1 }, { row: 7, col: 7 },
            { row: 8, col: 3 }, { row: 8, col: 6 },
        ],
        guards: [
            {
                type: "blinking",
                position: { row: 2, col: 3 },
                startState: true,
                litCells: [
                    { row: 1, col: 4 }, { row: 2, col: 2 },
                    { row: 2, col: 4 }, { row: 3, col: 4 },
                ],
            },
            {
                type: "blinking",
                position: { row: 6, col: 7 },
                startState: false,
                litCells: [
                    { row: 5, col: 7 }, { row: 6, col: 6 },
                    { row: 6, col: 8 }, { row: 7, col: 6 },
                ],
            },
            {
                type: "static",
                position: { row: 4, col: 4 },
                litCells: [
                    { row: 3, col: 4 }, { row: 4, col: 3 },
                    { row: 4, col: 5 },
                ],
            },
            {
                type: "static",
                position: { row: 8, col: 1 },
                litCells: [
                    { row: 7, col: 2 }, { row: 8, col: 0 },
                    { row: 8, col: 2 }, { row: 9, col: 1 },
                ],
            },
            {
                type: "rotating",
                position: { row: 3, col: 6 },
                startDirection: 0,
            },
            {
                type: "patrolling",
                startPosition: { row: 6, col: 2 },
                path: [
                    { row: 6, col: 2 }, { row: 6, col: 3 },
                    { row: 7, col: 3 }, { row: 7, col: 2 },
                ],
            },
            {
                type: "patrolling",
                startPosition: { row: 5, col: 5 },
                path: [
                    { row: 5, col: 5 }, { row: 5, col: 6 },
                    { row: 4, col: 6 }, { row: 4, col: 5 },
                ],
            },
        ],
        parMoves: 20,
    },

    // === ACT 4: THE UNDERGROUND (mirror intro) ===
    {
        // L7 Underground Passage — 11x11, 7 guards with a single mirror intro.
        id: 7,
        name: "The Underground Passage",
        storyKey: "level7Story",
        grid: { rows: 11, cols: 11 },
        player: { row: 0, col: 0 },
        goal: { row: 10, col: 10 },
        walls: [
            { row: 1, col: 3 }, { row: 2, col: 6 },
            { row: 3, col: 1 }, { row: 3, col: 4 },
            { row: 4, col: 7 }, { row: 5, col: 2 },
            { row: 5, col: 9 }, { row: 6, col: 5 },
            { row: 7, col: 3 }, { row: 7, col: 8 },
            { row: 8, col: 1 }, { row: 9, col: 5 },
        ],
        guards: [
            {
                type: "rotating",
                position: { row: 2, col: 3 },
                startDirection: 0,
            },
            {
                type: "mirror",
                position: { row: 2, col: 7 },
                reflectDirection: "cw",
            },
            {
                type: "static",
                position: { row: 4, col: 4 },
                litCells: [
                    { row: 3, col: 5 }, { row: 4, col: 3 },
                    { row: 4, col: 5 }, { row: 5, col: 4 },
                ],
            },
            {
                type: "patrolling",
                startPosition: { row: 6, col: 7 },
                path: [
                    { row: 6, col: 7 }, { row: 6, col: 8 },
                    { row: 6, col: 9 }, { row: 6, col: 8 },
                ],
            },
            {
                type: "blinking",
                position: { row: 8, col: 4 },
                startState: false,
                litCells: [
                    { row: 7, col: 4 }, { row: 8, col: 3 },
                    { row: 8, col: 5 }, { row: 9, col: 4 },
                ],
            },
            {
                type: "static",
                position: { row: 9, col: 9 },
                litCells: [
                    { row: 8, col: 9 }, { row: 9, col: 8 },
                    { row: 9, col: 10 },
                ],
            },
            {
                type: "static",
                position: { row: 5, col: 6 },
                litCells: [
                    { row: 4, col: 6 }, { row: 5, col: 5 },
                    { row: 5, col: 7 }, { row: 6, col: 6 },
                ],
            },
        ],
        parMoves: 22,
    },
    {
        // L8 Gauntlet — 11x11, 8 guards with 2 mirrors + 2 patrollers + rotating.
        id: 8,
        name: "The Gauntlet",
        storyKey: "level8Story",
        grid: { rows: 11, cols: 11 },
        player: { row: 0, col: 0 },
        goal: { row: 10, col: 10 },
        walls: [
            { row: 1, col: 2 }, { row: 1, col: 8 },
            { row: 2, col: 5 }, { row: 3, col: 2 },
            { row: 3, col: 7 }, { row: 4, col: 4 },
            { row: 4, col: 9 }, { row: 5, col: 1 },
            { row: 5, col: 6 }, { row: 6, col: 3 },
            { row: 6, col: 8 }, { row: 7, col: 5 },
            { row: 8, col: 2 }, { row: 8, col: 7 },
            { row: 9, col: 4 }, { row: 9, col: 9 },
        ],
        guards: [
            {
                type: "rotating",
                position: { row: 3, col: 3 },
                startDirection: 0,
            },
            {
                type: "mirror",
                position: { row: 3, col: 5 },
                reflectDirection: "ccw",
            },
            {
                type: "mirror",
                position: { row: 7, col: 3 },
                reflectDirection: "cw",
            },
            {
                type: "rotating",
                position: { row: 7, col: 7 },
                startDirection: 2,
            },
            {
                type: "patrolling",
                startPosition: { row: 2, col: 7 },
                path: [
                    { row: 2, col: 7 }, { row: 2, col: 8 },
                    { row: 2, col: 9 }, { row: 2, col: 8 },
                ],
            },
            {
                type: "patrolling",
                startPosition: { row: 8, col: 4 },
                path: [
                    { row: 8, col: 4 }, { row: 8, col: 5 },
                    { row: 8, col: 6 }, { row: 8, col: 5 },
                ],
            },
            {
                type: "blinking",
                position: { row: 5, col: 9 },
                startState: true,
                litCells: [
                    { row: 4, col: 9 }, { row: 5, col: 8 },
                    { row: 5, col: 10 }, { row: 6, col: 9 },
                ],
            },
            {
                type: "static",
                position: { row: 9, col: 6 },
                litCells: [
                    { row: 8, col: 6 }, { row: 9, col: 5 },
                    { row: 9, col: 7 }, { row: 10, col: 6 },
                ],
            },
        ],
        parMoves: 22,
    },

    // === ACT 5: THE ROYAL PALACE (chaser intro) ===
    {
        // L9 Decoy Path — 12x12, 8 guards including the chaser intro.
        // Two possible routes: fast central (chaser ambush) vs long perimeter.
        id: 9,
        name: "The Decoy Path",
        storyKey: "level9Story",
        grid: { rows: 12, cols: 12 },
        player: { row: 0, col: 0 },
        goal: { row: 11, col: 11 },
        walls: [
            { row: 1, col: 4 }, { row: 1, col: 8 },
            { row: 2, col: 2 }, { row: 2, col: 9 },
            { row: 3, col: 5 }, { row: 3, col: 7 },
            { row: 4, col: 1 }, { row: 4, col: 10 },
            { row: 5, col: 3 }, { row: 5, col: 8 },
            { row: 6, col: 5 }, { row: 6, col: 6 },
            { row: 7, col: 2 }, { row: 7, col: 9 },
            { row: 8, col: 4 }, { row: 8, col: 7 },
            { row: 9, col: 1 }, { row: 9, col: 10 },
            { row: 10, col: 5 }, { row: 10, col: 8 },
        ],
        guards: [
            {
                type: "static",
                position: { row: 2, col: 5 },
                litCells: [
                    { row: 1, col: 5 }, { row: 2, col: 4 },
                    { row: 2, col: 6 }, { row: 3, col: 6 },
                ],
            },
            {
                type: "rotating",
                position: { row: 4, col: 5 },
                startDirection: 1,
            },
            {
                type: "blinking",
                position: { row: 3, col: 9 },
                startState: false,
                litCells: [
                    { row: 2, col: 10 }, { row: 3, col: 8 },
                    { row: 3, col: 10 }, { row: 4, col: 9 },
                ],
            },
            {
                type: "patrolling",
                startPosition: { row: 6, col: 2 },
                path: [
                    { row: 6, col: 2 }, { row: 6, col: 3 },
                    { row: 7, col: 3 }, { row: 7, col: 2 },
                ],
            },
            {
                type: "static",
                position: { row: 9, col: 5 },
                litCells: [
                    { row: 8, col: 5 }, { row: 9, col: 4 },
                    { row: 9, col: 6 },
                ],
            },
            {
                type: "blinking",
                position: { row: 8, col: 9 },
                startState: true,
                litCells: [
                    { row: 7, col: 10 }, { row: 8, col: 8 },
                    { row: 8, col: 10 },
                ],
            },
            {
                type: "static",
                position: { row: 10, col: 10 },
                litCells: [
                    { row: 9, col: 11 }, { row: 10, col: 9 },
                    { row: 10, col: 11 },
                ],
            },
            {
                // Chaser ambushes central path — forces player to take perimeter
                type: "chaser",
                position: { row: 6, col: 8 },
                detectionRadius: 3,
            },
        ],
        parMoves: 24,
    },
    {
        // L10 Hall of Mirrors — 12x12, 9 guards: 2 rotating + 3 mirrors + chaser + more.
        id: 10,
        name: "Hall of Mirrors",
        storyKey: "level10Story",
        grid: { rows: 12, cols: 12 },
        player: { row: 0, col: 0 },
        goal: { row: 11, col: 11 },
        walls: [
            { row: 1, col: 3 }, { row: 1, col: 8 },
            { row: 2, col: 6 }, { row: 3, col: 1 },
            { row: 3, col: 9 }, { row: 4, col: 4 },
            { row: 4, col: 7 }, { row: 5, col: 2 },
            { row: 5, col: 10 }, { row: 6, col: 5 },
            { row: 7, col: 3 }, { row: 7, col: 8 },
            { row: 8, col: 1 }, { row: 8, col: 6 },
            { row: 9, col: 4 }, { row: 9, col: 9 },
            { row: 10, col: 2 }, { row: 10, col: 7 },
        ],
        guards: [
            {
                type: "rotating",
                position: { row: 2, col: 2 },
                startDirection: 0,
            },
            {
                type: "mirror",
                position: { row: 2, col: 8 },
                reflectDirection: "cw",
            },
            {
                type: "mirror",
                position: { row: 5, col: 5 },
                reflectDirection: "ccw",
            },
            {
                type: "mirror",
                position: { row: 8, col: 8 },
                reflectDirection: "cw",
            },
            {
                type: "rotating",
                position: { row: 8, col: 3 },
                startDirection: 2,
            },
            {
                type: "static",
                position: { row: 4, col: 10 },
                litCells: [
                    { row: 3, col: 10 }, { row: 4, col: 9 },
                    { row: 4, col: 11 }, { row: 5, col: 11 },
                ],
            },
            {
                type: "blinking",
                position: { row: 6, col: 9 },
                startState: true,
                litCells: [
                    { row: 5, col: 9 }, { row: 6, col: 8 },
                    { row: 7, col: 9 },
                ],
            },
            {
                type: "patrolling",
                startPosition: { row: 10, col: 4 },
                path: [
                    { row: 10, col: 4 }, { row: 10, col: 5 },
                    { row: 10, col: 6 }, { row: 10, col: 5 },
                ],
            },
            {
                type: "chaser",
                position: { row: 9, col: 7 },
                detectionRadius: 3,
            },
        ],
        parMoves: 24,
    },
    {
        // L11 Throne Room — 12x12, 9 guards covering ALL SIX TYPES
        // (static, rotating, blinking, patrolling, mirror, chaser).
        // The climactic test before the impossible Princess Chamber.
        id: 11,
        name: "The Throne Room",
        storyKey: "level11Story",
        grid: { rows: 12, cols: 12 },
        player: { row: 0, col: 0 },
        goal: { row: 11, col: 11 },
        walls: [
            { row: 1, col: 4 }, { row: 1, col: 8 },
            { row: 2, col: 2 }, { row: 2, col: 6 },
            { row: 3, col: 4 }, { row: 3, col: 9 },
            { row: 4, col: 1 }, { row: 4, col: 6 },
            { row: 5, col: 3 }, { row: 5, col: 10 },
            { row: 6, col: 5 }, { row: 6, col: 8 },
            { row: 7, col: 2 }, { row: 7, col: 6 },
            { row: 8, col: 4 }, { row: 8, col: 9 },
            { row: 9, col: 1 }, { row: 9, col: 6 },
            { row: 10, col: 3 }, { row: 10, col: 8 },
        ],
        guards: [
            {
                type: "static",
                position: { row: 1, col: 2 },
                litCells: [
                    { row: 0, col: 2 }, { row: 1, col: 1 },
                    { row: 1, col: 3 }, { row: 2, col: 1 },
                ],
            },
            {
                type: "rotating",
                position: { row: 3, col: 5 },
                startDirection: 0,
            },
            {
                type: "mirror",
                position: { row: 5, col: 5 },
                reflectDirection: "cw",
            },
            {
                type: "blinking",
                position: { row: 4, col: 9 },
                startState: true,
                litCells: [
                    { row: 3, col: 10 }, { row: 4, col: 8 },
                    { row: 4, col: 10 }, { row: 5, col: 9 },
                ],
            },
            {
                type: "patrolling",
                startPosition: { row: 6, col: 2 },
                path: [
                    { row: 6, col: 2 }, { row: 6, col: 3 },
                    { row: 7, col: 3 }, { row: 7, col: 2 },
                ],
            },
            {
                type: "static",
                position: { row: 8, col: 2 },
                litCells: [
                    { row: 7, col: 2 }, { row: 8, col: 1 },
                    { row: 8, col: 3 }, { row: 9, col: 2 },
                ],
            },
            {
                type: "rotating",
                position: { row: 9, col: 8 },
                startDirection: 2,
            },
            {
                type: "blinking",
                position: { row: 10, col: 10 },
                startState: false,
                litCells: [
                    { row: 9, col: 10 }, { row: 10, col: 9 },
                    { row: 10, col: 11 },
                ],
            },
            {
                type: "chaser",
                position: { row: 8, col: 7 },
                detectionRadius: 3,
            },
        ],
        parMoves: 24,
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
                litCells: [
                    { row: 0, col: 10 }, { row: 1, col: 9 }, { row: 1, col: 11 },
                ],
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
                litCells: [
                    { row: 10, col: 11 }, { row: 11, col: 10 },
                    { row: 11, col: 12 }, { row: 12, col: 11 },
                ],
            },
            {
                type: "static",
                position: { row: 12, col: 10 },
                litCells: [
                    { row: 12, col: 9 }, { row: 12, col: 11 },
                ],
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
