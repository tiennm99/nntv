export const LEVELS = [
    // === ACT 1: THE OUTSKIRTS (movement + static guards) ===
    {
        id: 1,
        name: "Garden Path",
        storyKey: "level1Story",
        grid: { rows: 6, cols: 6 },
        player: { row: 0, col: 0 },
        goal: { row: 5, col: 5 },
        walls: [
            { row: 1, col: 1 }, { row: 1, col: 2 },
            { row: 3, col: 3 }, { row: 3, col: 4 },
        ],
        guards: [],
    },
    {
        id: 2,
        name: "The Watchtower",
        storyKey: "level2Story",
        grid: { rows: 6, cols: 6 },
        player: { row: 0, col: 0 },
        goal: { row: 5, col: 5 },
        walls: [
            { row: 2, col: 2 }, { row: 3, col: 3 },
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
        ],
    },

    // === ACT 2: THE VEGETABLE GARDEN (walls as shields + rotating guards) ===
    {
        id: 3,
        name: "Vegetable Patrol",
        storyKey: "level3Story",
        grid: { rows: 7, cols: 7 },
        player: { row: 0, col: 0 },
        goal: { row: 6, col: 6 },
        walls: [
            { row: 1, col: 1 }, { row: 2, col: 1 },
            { row: 3, col: 3 }, { row: 3, col: 5 }, { row: 5, col: 4 },
        ],
        guards: [
            {
                type: "static",
                position: { row: 2, col: 3 },
                litCells: [
                    { row: 1, col: 3 }, { row: 2, col: 2 }, { row: 2, col: 4 },
                ],
            },
            {
                type: "static",
                position: { row: 5, col: 5 },
                litCells: [
                    { row: 4, col: 5 }, { row: 5, col: 6 },
                ],
            },
        ],
    },
    {
        // First rotating guard — enclosed in walls so player can observe the pattern
        id: 4,
        name: "The Searchlight",
        storyKey: "level4Story",
        grid: { rows: 7, cols: 7 },
        player: { row: 0, col: 0 },
        goal: { row: 6, col: 6 },
        walls: [
            { row: 2, col: 2 }, { row: 2, col: 3 }, { row: 2, col: 4 },
            { row: 3, col: 2 }, { row: 3, col: 4 },
            { row: 4, col: 2 }, { row: 4, col: 3 }, { row: 4, col: 4 },
        ],
        guards: [
            {
                type: "rotating",
                position: { row: 3, col: 3 },
                startDirection: 0,
            },
        ],
    },

    // === ACT 3: THE FORTRESS (blinking guards + timing puzzles) ===
    {
        id: 5,
        name: "Fortress Gate",
        storyKey: "level5Story",
        grid: { rows: 7, cols: 7 },
        player: { row: 0, col: 0 },
        goal: { row: 6, col: 6 },
        walls: [
            { row: 2, col: 2 }, { row: 2, col: 4 },
            { row: 4, col: 2 }, { row: 4, col: 4 },
        ],
        guards: [
            {
                type: "blinking",
                position: { row: 3, col: 3 },
                startState: true,
                litCells: [
                    { row: 2, col: 3 }, { row: 3, col: 2 },
                    { row: 3, col: 4 }, { row: 4, col: 3 },
                ],
            },
        ],
    },
    {
        // Blinking guard + static guard — must time passage through blinking zone
        id: 6,
        name: "The Flickering Corridor",
        storyKey: "level6Story",
        grid: { rows: 8, cols: 8 },
        player: { row: 0, col: 0 },
        goal: { row: 7, col: 7 },
        walls: [
            { row: 2, col: 2 }, { row: 2, col: 3 }, { row: 2, col: 4 }, { row: 2, col: 5 },
            { row: 3, col: 2 }, { row: 3, col: 5 },
            { row: 4, col: 2 }, { row: 4, col: 5 },
            { row: 5, col: 2 }, { row: 5, col: 3 }, { row: 5, col: 4 }, { row: 5, col: 5 },
        ],
        guards: [
            {
                type: "blinking",
                position: { row: 3, col: 3 },
                startState: true,
                litCells: [
                    { row: 3, col: 4 }, { row: 4, col: 3 },
                ],
            },
            {
                type: "static",
                position: { row: 1, col: 6 },
                litCells: [
                    { row: 0, col: 6 }, { row: 1, col: 7 },
                ],
            },
            {
                type: "static",
                position: { row: 6, col: 1 },
                litCells: [
                    { row: 5, col: 1 }, { row: 6, col: 0 }, { row: 6, col: 2 },
                ],
            },
        ],
    },

    // === ACT 4: THE UNDERGROUND (patrolling guards + path prediction) ===
    {
        id: 7,
        name: "The Underground Passage",
        storyKey: "level7Story",
        grid: { rows: 8, cols: 8 },
        player: { row: 0, col: 0 },
        goal: { row: 7, col: 7 },
        walls: [
            { row: 1, col: 2 }, { row: 1, col: 3 }, { row: 1, col: 4 }, { row: 1, col: 5 },
            { row: 2, col: 2 }, { row: 2, col: 5 },
            { row: 3, col: 2 }, { row: 3, col: 5 },
            { row: 4, col: 2 }, { row: 4, col: 5 },
            { row: 5, col: 2 }, { row: 5, col: 5 },
            { row: 6, col: 2 }, { row: 6, col: 3 }, { row: 6, col: 4 }, { row: 6, col: 5 },
        ],
        guards: [
            {
                type: "patrolling",
                startPosition: { row: 3, col: 3 },
                path: [
                    { row: 3, col: 3 }, { row: 3, col: 4 },
                    { row: 4, col: 4 }, { row: 4, col: 3 },
                ],
            },
        ],
    },
    {
        // Two patrols with interlocking paths — player must weave between them
        id: 8,
        name: "The Gauntlet",
        storyKey: "level8Story",
        grid: { rows: 8, cols: 8 },
        player: { row: 0, col: 0 },
        goal: { row: 7, col: 7 },
        walls: [
            { row: 3, col: 3 }, { row: 3, col: 4 },
            { row: 4, col: 3 }, { row: 4, col: 4 },
        ],
        guards: [
            {
                type: "patrolling",
                startPosition: { row: 2, col: 1 },
                path: [
                    { row: 2, col: 1 }, { row: 2, col: 2 },
                    { row: 2, col: 5 }, { row: 2, col: 6 },
                    { row: 2, col: 5 }, { row: 2, col: 2 },
                ],
            },
            {
                type: "patrolling",
                startPosition: { row: 5, col: 6 },
                path: [
                    { row: 5, col: 6 }, { row: 5, col: 5 },
                    { row: 5, col: 2 }, { row: 5, col: 1 },
                    { row: 5, col: 2 }, { row: 5, col: 5 },
                ],
            },
        ],
    },

    // === ACT 5: THE ROYAL PALACE (combinations + "The Decoy") ===
    {
        // The Decoy — two routes: obvious short one syncs to danger at turn 6,
        // longer route is actually safe if you count turns
        id: 9,
        name: "The Decoy Path",
        storyKey: "level9Story",
        grid: { rows: 8, cols: 8 },
        player: { row: 0, col: 0 },
        goal: { row: 7, col: 7 },
        walls: [
            // Central wall creates two corridors
            { row: 1, col: 3 }, { row: 2, col: 3 }, { row: 3, col: 3 },
            { row: 4, col: 4 }, { row: 5, col: 4 }, { row: 6, col: 4 },
        ],
        guards: [
            {
                type: "rotating",
                position: { row: 4, col: 2 },
                startDirection: 1,
            },
            {
                type: "blinking",
                position: { row: 3, col: 6 },
                startState: false,
                litCells: [
                    { row: 2, col: 6 }, { row: 3, col: 5 },
                    { row: 3, col: 7 }, { row: 4, col: 6 },
                ],
            },
            {
                type: "static",
                position: { row: 6, col: 6 },
                litCells: [
                    { row: 5, col: 6 }, { row: 6, col: 5 },
                    { row: 6, col: 7 },
                ],
            },
        ],
    },
    {
        // Hall of Mirrors — rotating guard + mirror guards redirect beams
        id: 10,
        name: "Hall of Mirrors",
        storyKey: "level10Story",
        grid: { rows: 8, cols: 8 },
        player: { row: 0, col: 0 },
        goal: { row: 7, col: 7 },
        walls: [
            { row: 3, col: 3 }, { row: 3, col: 4 },
            { row: 4, col: 3 }, { row: 4, col: 4 },
        ],
        guards: [
            {
                type: "rotating",
                position: { row: 2, col: 2 },
                startDirection: 0,
            },
            {
                type: "mirror",
                position: { row: 0, col: 2 },
                reflectDirection: "cw",
            },
            {
                type: "mirror",
                position: { row: 2, col: 5 },
                reflectDirection: "ccw",
            },
            {
                type: "rotating",
                position: { row: 5, col: 5 },
                startDirection: 2,
            },
        ],
    },
    {
        // The Throne Room — all guard types combined
        id: 11,
        name: "The Throne Room",
        storyKey: "level11Story",
        grid: { rows: 9, cols: 9 },
        player: { row: 0, col: 0 },
        goal: { row: 8, col: 8 },
        walls: [
            { row: 2, col: 0 }, { row: 2, col: 1 }, { row: 2, col: 2 },
            { row: 2, col: 3 }, { row: 2, col: 4 }, { row: 2, col: 5 }, { row: 2, col: 6 },
            { row: 4, col: 2 }, { row: 4, col: 3 }, { row: 4, col: 4 },
            { row: 4, col: 5 }, { row: 4, col: 6 }, { row: 4, col: 7 }, { row: 4, col: 8 },
            { row: 6, col: 0 }, { row: 6, col: 1 }, { row: 6, col: 2 },
            { row: 6, col: 3 }, { row: 6, col: 4 }, { row: 6, col: 5 }, { row: 6, col: 6 },
        ],
        guards: [
            {
                type: "static",
                position: { row: 1, col: 7 },
                litCells: [
                    { row: 1, col: 6 }, { row: 1, col: 8 },
                ],
            },
            {
                type: "rotating",
                position: { row: 3, col: 3 },
                startDirection: 0,
            },
            {
                type: "blinking",
                position: { row: 5, col: 7 },
                startState: true,
                litCells: [
                    { row: 5, col: 6 }, { row: 5, col: 8 },
                ],
            },
            {
                type: "patrolling",
                startPosition: { row: 7, col: 1 },
                path: [
                    { row: 7, col: 1 }, { row: 7, col: 2 },
                    { row: 7, col: 3 }, { row: 7, col: 4 },
                    { row: 7, col: 3 }, { row: 7, col: 2 },
                ],
            },
        ],
    },
    {
        // THE PRINCESS CHAMBER — escalating detection: light radiates from goal
        // when player reaches distance 4, one ring per turn lights up, creating
        // an expanding wave. The princess senses you approaching.
        id: 12,
        name: "The Princess Chamber",
        storyKey: "level12Story",
        grid: { rows: 10, cols: 10 },
        player: { row: 0, col: 0 },
        goal: { row: 9, col: 9 },
        walls: [
            { row: 2, col: 0 }, { row: 2, col: 1 }, { row: 2, col: 2 },
            { row: 2, col: 3 }, { row: 2, col: 4 }, { row: 2, col: 5 },
            { row: 2, col: 6 }, { row: 2, col: 7 },
            { row: 4, col: 2 }, { row: 4, col: 3 }, { row: 4, col: 4 },
            { row: 4, col: 5 }, { row: 4, col: 6 }, { row: 4, col: 7 },
            { row: 4, col: 8 }, { row: 4, col: 9 },
            { row: 6, col: 0 }, { row: 6, col: 1 }, { row: 6, col: 2 },
            { row: 6, col: 3 }, { row: 6, col: 4 }, { row: 6, col: 5 },
            { row: 6, col: 6 }, { row: 6, col: 7 },
        ],
        guards: [
            {
                type: "static",
                position: { row: 1, col: 8 },
                litCells: [
                    { row: 0, col: 8 }, { row: 1, col: 7 }, { row: 1, col: 9 },
                ],
            },
            {
                type: "rotating",
                position: { row: 3, col: 3 },
                startDirection: 0,
            },
            {
                type: "blinking",
                position: { row: 5, col: 8 },
                startState: true,
                litCells: [
                    { row: 5, col: 7 }, { row: 5, col: 9 },
                ],
            },
            {
                type: "patrolling",
                startPosition: { row: 7, col: 1 },
                path: [
                    { row: 7, col: 1 }, { row: 7, col: 2 },
                    { row: 7, col: 3 }, { row: 7, col: 4 },
                    { row: 7, col: 5 }, { row: 7, col: 4 },
                    { row: 7, col: 3 }, { row: 7, col: 2 },
                ],
            },
            {
                type: "patrolling",
                startPosition: { row: 8, col: 8 },
                path: [
                    { row: 8, col: 8 }, { row: 8, col: 7 },
                    { row: 8, col: 6 }, { row: 8, col: 5 },
                    { row: 8, col: 6 }, { row: 8, col: 7 },
                ],
            },
        ],
        isFinalLevel: true,
    },
];
