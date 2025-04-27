export const LEVELS = [
    {
        id: 1,
        name: "First Steps",
        grid: {
            rows: 6,
            cols: 6
        },
        player: { row: 0, col: 0 },
        goal: { row: 5, col: 5 },
        walls: [
            { row: 1, col: 1 },
            { row: 1, col: 2 },
            { row: 2, col: 4 }
        ],
        guards: [] // No guards in first level
    },
    {
        id: 2,
        name: "Lights!",
        grid: {
            rows: 6,
            cols: 6
        },
        player: { row: 0, col: 0 },
        goal: { row: 5, col: 5 },
        walls: [
            { row: 2, col: 2 },
            { row: 3, col: 3 }
        ],
        guards: [
            {
                type: "static", // Changed from litCells to static guard for level 2
                position: { row: 2, col: 3 },
                litCells: [
                    { row: 2, col: 4 },
                    { row: 3, col: 2 }
                ]
            }
        ]
    },
    {
        id: 3,
        name: "Red Alert",
        grid: {
            rows: 7,
            cols: 7
        },
        player: { row: 0, col: 0 },
        goal: { row: 6, col: 6 },
        walls: [
            { row: 1, col: 1 },
            { row: 2, col: 1 },
            { row: 3, col: 1 },
            { row: 3, col: 3 },
            { row: 3, col: 5 }
        ],
        guards: [
            {
                type: "static",
                position: { row: 3, col: 3 },
                litCells: [
                    { row: 2, col: 3 },
                    { row: 3, col: 2 },
                    { row: 4, col: 3 }
                    // Removed { row: 3, col: 4 } to make path possible
                ]
            }
        ]
    },
    {
        id: 4,
        name: "Red Maze",
        grid: {
            rows: 7,
            cols: 7
        },
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
            { row: 5, col: 6 }
        ],
        guards: [
            {
                type: "static",
                position: { row: 2, col: 3 },
                litCells: [
                    { row: 1, col: 3 },
                    { row: 2, col: 2 },
                    { row: 2, col: 4 }
                    // Removed { row: 3, col: 3 } to make path possible
                ]
            },
            {
                type: "static",
                position: { row: 4, col: 3 },
                litCells: [
                    { row: 3, col: 3 },
                    { row: 4, col: 2 },
                    { row: 4, col: 4 }
                    // Removed { row: 5, col: 3 } to make path possible
                ]
            }
        ]
    },
    {
        id: 5,
        name: "Red Fortress",
        grid: {
            rows: 8,
            cols: 8
        },
        player: { row: 0, col: 0 },
        goal: { row: 7, col: 7 },
        walls: [
            { row: 2, col: 2 },
            { row: 2, col: 3 },
            { row: 2, col: 4 },
            { row: 2, col: 5 },
            { row: 3, col: 2 },
            { row: 3, col: 5 },
            { row: 4, col: 2 },
            { row: 4, col: 5 },
            { row: 5, col: 2 },
            { row: 5, col: 3 },
            { row: 5, col: 4 },
            { row: 5, col: 5 }
        ],
        guards: [
            {
                type: "static",
                position: { row: 3, col: 3 },
                litCells: [
                    { row: 3, col: 4 },
                    { row: 4, col: 3 }
                ]
            },
            {
                type: "static",
                position: { row: 1, col: 6 },
                litCells: [
                    // Removed ALL lit cells to make level 5 completable
                    // { row: 1, col: 5 },
                    // { row: 1, col: 7 }
                ]
            },
            {
                type: "static",
                position: { row: 6, col: 1 },
                litCells: [
                    { row: 5, col: 1 },
                    { row: 6, col: 0 },
                    { row: 6, col: 2 }
                ]
            }
        ]
    },
    {
        id: 6,
        name: "Blue Rotation",
        grid: {
            rows: 7,
            cols: 7
        },
        player: { row: 0, col: 0 },
        goal: { row: 6, col: 6 },
        walls: [
            { row: 2, col: 2 },
            { row: 2, col: 3 },
            { row: 2, col: 4 },
            { row: 3, col: 2 },
            { row: 3, col: 4 },
            { row: 4, col: 2 },
            { row: 4, col: 3 },
            { row: 4, col: 4 }
        ],
        guards: [
            {
                type: "rotating",
                position: { row: 3, col: 3 },
                startDirection: 0
            }
        ]
    },
    {
        id: 7,
        name: "Red and Blue",
        grid: {
            rows: 8,
            cols: 8
        },
        player: { row: 0, col: 0 },
        goal: { row: 7, col: 7 },
        walls: [
            { row: 2, col: 0 },
            { row: 2, col: 1 },
            { row: 2, col: 2 },
            { row: 2, col: 3 },
            { row: 2, col: 4 },
            { row: 2, col: 5 },
            { row: 2, col: 6 },
            { row: 4, col: 1 },
            { row: 4, col: 2 },
            { row: 4, col: 3 },
            { row: 4, col: 4 },
            { row: 4, col: 5 },
            { row: 4, col: 6 },
            { row: 4, col: 7 },
            { row: 6, col: 0 },
            { row: 6, col: 1 },
            { row: 6, col: 2 },
            { row: 6, col: 3 },
            { row: 6, col: 4 },
            { row: 6, col: 5 },
            { row: 6, col: 6 }
        ],
        guards: [
            {
                type: "static",
                position: { row: 1, col: 5 },
                litCells: [
                    // Removed ALL lit cells to make level 7 completable
                    // { row: 1, col: 4 },
                    // { row: 1, col: 6 }
                ]
            },
            {
                type: "rotating",
                position: { row: 3, col: 3 },
                startDirection: 0
            },
            {
                type: "static",
                position: { row: 5, col: 2 },
                litCells: [
                    // Removed ALL lit cells to make level 7 completable
                    // { row: 5, col: 1 },
                    // { row: 5, col: 3 }
                ]
            }
        ]
    },
    {
        id: 8,
        name: "Double Rotation",
        grid: {
            rows: 8,
            cols: 8
        },
        player: { row: 0, col: 0 },
        goal: { row: 7, col: 7 },
        walls: [
            { row: 3, col: 3 },
            { row: 3, col: 4 },
            { row: 4, col: 3 },
            { row: 4, col: 4 }
        ],
        guards: [
            {
                type: "rotating",
                position: { row: 2, col: 2 },
                startDirection: 0
            },
            {
                type: "rotating",
                position: { row: 2, col: 5 },
                startDirection: 1
            },
            {
                type: "rotating",
                position: { row: 5, col: 2 },
                startDirection: 2
            },
            {
                type: "rotating",
                position: { row: 5, col: 5 },
                startDirection: 3
            }
        ]
    },
    {
        id: 9,
        name: "Yellow Blink",
        grid: {
            rows: 7,
            cols: 7
        },
        player: { row: 0, col: 0 },
        goal: { row: 6, col: 6 },
        walls: [
            { row: 2, col: 2 },
            { row: 2, col: 4 },
            { row: 4, col: 2 },
            { row: 4, col: 4 }
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
                    { row: 4, col: 3 }
                ]
            }
        ]
    },
    {
        id: 10,
        name: "Purple Patrol",
        grid: {
            rows: 8,
            cols: 8
        },
        player: { row: 0, col: 0 },
        goal: { row: 7, col: 7 },
        walls: [
            { row: 1, col: 2 },
            { row: 1, col: 3 },
            { row: 1, col: 4 },
            { row: 1, col: 5 },
            { row: 2, col: 2 },
            { row: 2, col: 5 },
            { row: 3, col: 2 },
            { row: 3, col: 5 },
            { row: 4, col: 2 },
            { row: 4, col: 5 },
            { row: 5, col: 2 },
            { row: 5, col: 5 },
            { row: 6, col: 2 },
            { row: 6, col: 3 },
            { row: 6, col: 4 },
            { row: 6, col: 5 }
        ],
        guards: [
            {
                type: "patrolling",
                startPosition: { row: 3, col: 3 },
                path: [
                    { row: 3, col: 3 },
                    { row: 3, col: 4 },
                    { row: 4, col: 4 },
                    { row: 4, col: 3 }
                ]
            }
        ]
    },
    {
        id: 11,
        name: "All Together",
        grid: {
            rows: 9,
            cols: 9
        },
        player: { row: 0, col: 0 },
        goal: { row: 8, col: 8 },
        walls: [
            { row: 2, col: 0 },
            { row: 2, col: 1 },
            { row: 2, col: 2 },
            { row: 2, col: 3 },
            { row: 2, col: 4 },
            { row: 2, col: 5 },
            { row: 2, col: 6 },
            { row: 4, col: 2 },
            { row: 4, col: 3 },
            { row: 4, col: 4 },
            { row: 4, col: 5 },
            { row: 4, col: 6 },
            { row: 4, col: 7 },
            { row: 4, col: 8 },
            { row: 6, col: 0 },
            { row: 6, col: 1 },
            { row: 6, col: 2 },
            { row: 6, col: 3 },
            { row: 6, col: 4 },
            { row: 6, col: 5 },
            { row: 6, col: 6 }
        ],
        guards: [
            {
                type: "static",
                position: { row: 1, col: 7 },
                litCells: [
                    // Removed { row: 0, col: 7 } to make path possible
                    { row: 1, col: 6 },
                    { row: 1, col: 8 }
                ]
            },
            {
                type: "rotating",
                position: { row: 3, col: 3 },
                startDirection: 0
            },
            {
                type: "blinking",
                position: { row: 5, col: 7 },
                startState: true,
                litCells: [
                    { row: 5, col: 6 },
                    { row: 5, col: 8 }
                ]
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
                    { row: 7, col: 2 }
                ]
            }
        ]
    },
    {
        id: 12,
        name: "Final Rescue",
        grid: {
            rows: 10,
            cols: 10
        },
        player: { row: 0, col: 0 },
        goal: { row: 9, col: 9 },
        walls: [
            { row: 2, col: 0 },
            { row: 2, col: 1 },
            { row: 2, col: 2 },
            { row: 2, col: 3 },
            { row: 2, col: 4 },
            { row: 2, col: 5 },
            { row: 2, col: 6 },
            { row: 2, col: 7 },
            { row: 4, col: 2 },
            { row: 4, col: 3 },
            { row: 4, col: 4 },
            { row: 4, col: 5 },
            { row: 4, col: 6 },
            { row: 4, col: 7 },
            { row: 4, col: 8 },
            { row: 4, col: 9 },
            { row: 6, col: 0 },
            { row: 6, col: 1 },
            { row: 6, col: 2 },
            { row: 6, col: 3 },
            { row: 6, col: 4 },
            { row: 6, col: 5 },
            { row: 6, col: 6 },
            { row: 6, col: 7 }
        ],
        guards: [
            {
                type: "static",
                position: { row: 1, col: 8 },
                litCells: [
                    { row: 0, col: 8 },
                    { row: 1, col: 7 },
                    { row: 1, col: 9 }
                    // Kept { row: 0, col: 8 } to make final level impossible
                ]
            },
            {
                type: "rotating",
                position: { row: 3, col: 3 },
                startDirection: 0
            },
            {
                type: "blinking",
                position: { row: 5, col: 8 },
                startState: true,
                litCells: [
                    { row: 5, col: 7 },
                    { row: 5, col: 9 }
                ]
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
                    { row: 7, col: 2 }
                ]
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
                    { row: 8, col: 7 }
                ]
            }
        ],
        // Special property for final level
        isFinalLevel: true
    }
];
