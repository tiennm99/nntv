export const LEVELS = [
    // === ACT 1: THE OUTSKIRTS ===
    {
        id: 1,
        name: "Garden Path",
        storyKey: "level1Story",
        grid: { rows: 6, cols: 6 },
        player: { row: 0, col: 0 },
        goal: { row: 5, col: 5 },
        walls: [
            { row: 1, col: 1 },
            { row: 1, col: 2 },
            { row: 3, col: 3 },
            { row: 3, col: 4 },
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
            { row: 2, col: 2 },
            { row: 3, col: 3 },
        ],
        guards: [
            {
                type: "static",
                position: { row: 2, col: 4 },
                litCells: [
                    { row: 1, col: 4 },
                    { row: 2, col: 3 },
                    { row: 2, col: 5 },
                    { row: 3, col: 4 },
                ],
            },
        ],
    },

    // === ACT 2: THE VEGETABLE GARDEN ===
    {
        id: 3,
        name: "Vegetable Patrol",
        storyKey: "level3Story",
        grid: { rows: 7, cols: 7 },
        player: { row: 0, col: 0 },
        goal: { row: 6, col: 6 },
        walls: [
            { row: 1, col: 1 },
            { row: 2, col: 1 },
            { row: 3, col: 3 },
            { row: 3, col: 5 },
            { row: 5, col: 4 },
        ],
        guards: [
            {
                type: "static",
                position: { row: 2, col: 3 },
                litCells: [
                    { row: 1, col: 3 },
                    { row: 2, col: 2 },
                    { row: 2, col: 4 },
                ],
            },
            {
                type: "static",
                position: { row: 5, col: 5 },
                litCells: [
                    { row: 4, col: 5 },
                    { row: 5, col: 6 },
                ],
            },
        ],
    },
    {
        id: 4,
        name: "The Hedge Maze",
        storyKey: "level4Story",
        grid: { rows: 7, cols: 7 },
        player: { row: 0, col: 0 },
        goal: { row: 6, col: 6 },
        walls: [
            { row: 1, col: 0 },
            { row: 1, col: 2 },
            { row: 1, col: 4 },
            { row: 1, col: 6 },
            { row: 3, col: 0 },
            { row: 3, col: 2 },
            { row: 3, col: 4 },
            { row: 3, col: 6 },
            { row: 5, col: 0 },
            { row: 5, col: 2 },
            { row: 5, col: 4 },
            { row: 5, col: 6 },
        ],
        guards: [
            {
                type: "static",
                position: { row: 2, col: 3 },
                litCells: [
                    { row: 1, col: 3 },
                    { row: 2, col: 2 },
                    { row: 2, col: 4 },
                ],
            },
            {
                type: "static",
                position: { row: 4, col: 3 },
                litCells: [
                    { row: 3, col: 3 },
                    { row: 4, col: 2 },
                    { row: 4, col: 4 },
                ],
            },
        ],
    },

    // === ACT 3: THE FORTRESS WALLS ===
    {
        id: 5,
        name: "Fortress Gate",
        storyKey: "level5Story",
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
                type: "static",
                position: { row: 3, col: 3 },
                litCells: [
                    { row: 3, col: 4 },
                    { row: 4, col: 3 },
                ],
            },
            {
                type: "static",
                position: { row: 1, col: 6 },
                litCells: [
                    { row: 0, col: 6 },
                    { row: 1, col: 7 },
                ],
            },
            {
                type: "static",
                position: { row: 6, col: 1 },
                litCells: [
                    { row: 5, col: 1 },
                    { row: 6, col: 0 },
                    { row: 6, col: 2 },
                ],
            },
        ],
    },

    // === ACT 4: THE PALACE ===
    {
        id: 6,
        name: "Rotating Searchlights",
        storyKey: "level6Story",
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
    {
        id: 7,
        name: "The Inner Court",
        storyKey: "level7Story",
        grid: { rows: 8, cols: 8 },
        player: { row: 0, col: 0 },
        goal: { row: 7, col: 7 },
        walls: [
            { row: 2, col: 0 }, { row: 2, col: 1 }, { row: 2, col: 2 },
            { row: 2, col: 3 }, { row: 2, col: 4 }, { row: 2, col: 5 }, { row: 2, col: 6 },
            { row: 4, col: 1 }, { row: 4, col: 2 }, { row: 4, col: 3 },
            { row: 4, col: 4 }, { row: 4, col: 5 }, { row: 4, col: 6 }, { row: 4, col: 7 },
            { row: 6, col: 0 }, { row: 6, col: 1 }, { row: 6, col: 2 },
            { row: 6, col: 3 }, { row: 6, col: 4 }, { row: 6, col: 5 }, { row: 6, col: 6 },
        ],
        guards: [
            {
                type: "static",
                position: { row: 1, col: 5 },
                litCells: [
                    { row: 1, col: 6 },
                    { row: 0, col: 5 },
                ],
            },
            {
                type: "rotating",
                position: { row: 3, col: 3 },
                startDirection: 0,
            },
            {
                type: "static",
                position: { row: 5, col: 2 },
                litCells: [
                    { row: 5, col: 1 },
                    { row: 5, col: 3 },
                ],
            },
        ],
    },
    {
        id: 8,
        name: "Hall of Mirrors",
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
                type: "rotating",
                position: { row: 2, col: 2 },
                startDirection: 0,
            },
            {
                type: "rotating",
                position: { row: 2, col: 5 },
                startDirection: 1,
            },
            {
                type: "rotating",
                position: { row: 5, col: 2 },
                startDirection: 2,
            },
            {
                type: "rotating",
                position: { row: 5, col: 5 },
                startDirection: 3,
            },
        ],
    },

    // === ACT 5: THE UNDERGROUND ===
    {
        id: 9,
        name: "The Flickering Dungeon",
        storyKey: "level9Story",
        grid: { rows: 7, cols: 7 },
        player: { row: 0, col: 0 },
        goal: { row: 6, col: 6 },
        walls: [
            { row: 2, col: 2 },
            { row: 2, col: 4 },
            { row: 4, col: 2 },
            { row: 4, col: 4 },
        ],
        guards: [
            {
                type: "blinking",
                position: { row: 3, col: 3 },
                startState: true,
                litCells: [
                    { row: 2, col: 3 },
                    { row: 3, col: 2 },
                    { row: 3, col: 4 },
                    { row: 4, col: 3 },
                ],
            },
        ],
    },
    {
        id: 10,
        name: "The Underground Passage",
        storyKey: "level10Story",
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
                    { row: 3, col: 3 },
                    { row: 3, col: 4 },
                    { row: 4, col: 4 },
                    { row: 4, col: 3 },
                ],
            },
        ],
    },

    // === ACT 6: THE ROYAL CHAMBERS ===
    {
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
                    { row: 1, col: 6 },
                    { row: 1, col: 8 },
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
                    { row: 5, col: 6 },
                    { row: 5, col: 8 },
                ],
            },
            {
                type: "patrolling",
                startPosition: { row: 7, col: 1 },
                path: [
                    { row: 7, col: 1 },
                    { row: 7, col: 2 },
                    { row: 7, col: 3 },
                    { row: 7, col: 4 },
                    { row: 7, col: 3 },
                    { row: 7, col: 2 },
                ],
            },
        ],
    },
    {
        // LEVEL 12 - THE PRINCESS CHAMBER
        // Design note: This level is SECRETLY unbeatable.
        // The level layout looks normal and solvable. Multiple paths exist toward the goal.
        // The hidden trap: when player reaches Manhattan distance <= 2 from goal (9,9),
        // checkFinalLevelCondition() in Game.js triggers lightUpEntireMap().
        // The princess herself is the final guard - she detects you when you get close.
        // Players will try many strategies before realizing it cannot be won.
        // This is the intended narrative twist ending.
        id: 12,
        name: "The Princess Chamber",
        storyKey: "level12Story",
        grid: { rows: 10, cols: 10 },
        player: { row: 0, col: 0 },
        goal: { row: 9, col: 9 },
        walls: [
            // Row 2 wall (gap at col 8-9 for passage)
            { row: 2, col: 0 }, { row: 2, col: 1 }, { row: 2, col: 2 },
            { row: 2, col: 3 }, { row: 2, col: 4 }, { row: 2, col: 5 },
            { row: 2, col: 6 }, { row: 2, col: 7 },
            // Row 4 wall (gap at col 0-1 for passage)
            { row: 4, col: 2 }, { row: 4, col: 3 }, { row: 4, col: 4 },
            { row: 4, col: 5 }, { row: 4, col: 6 }, { row: 4, col: 7 },
            { row: 4, col: 8 }, { row: 4, col: 9 },
            // Row 6 wall (gap at col 8-9 for passage)
            { row: 6, col: 0 }, { row: 6, col: 1 }, { row: 6, col: 2 },
            { row: 6, col: 3 }, { row: 6, col: 4 }, { row: 6, col: 5 },
            { row: 6, col: 6 }, { row: 6, col: 7 },
        ],
        guards: [
            {
                type: "static",
                position: { row: 1, col: 8 },
                litCells: [
                    { row: 0, col: 8 },
                    { row: 1, col: 7 },
                    { row: 1, col: 9 },
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
                    { row: 5, col: 7 },
                    { row: 5, col: 9 },
                ],
            },
            {
                type: "patrolling",
                startPosition: { row: 7, col: 1 },
                path: [
                    { row: 7, col: 1 },
                    { row: 7, col: 2 },
                    { row: 7, col: 3 },
                    { row: 7, col: 4 },
                    { row: 7, col: 5 },
                    { row: 7, col: 4 },
                    { row: 7, col: 3 },
                    { row: 7, col: 2 },
                ],
            },
            {
                type: "patrolling",
                startPosition: { row: 8, col: 8 },
                path: [
                    { row: 8, col: 8 },
                    { row: 8, col: 7 },
                    { row: 8, col: 6 },
                    { row: 8, col: 5 },
                    { row: 8, col: 6 },
                    { row: 8, col: 7 },
                ],
            },
        ],
        isFinalLevel: true,
    },
];
