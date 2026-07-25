const BASE = 'assets/generated/';

export const GENERATED_TILES = {
    empty: `${BASE}tile-empty.png`,
    wall: `${BASE}tile-wall.png`,
    goal: `${BASE}tile-goal.png`,
    lit: `${BASE}tile-lit.png`,
    warm: `${BASE}tile-warm.png`,
    mirror: `${BASE}tile-mirror.png`,
    oneway: `${BASE}tile-oneway.png`,
    doors: {
        1: `${BASE}tile-door-gold.png`,
        2: `${BASE}tile-door-silver.png`,
        3: `${BASE}tile-door-copper.png`,
    },
    keys: {
        1: `${BASE}icon-key-gold.png`,
        2: `${BASE}icon-key-silver.png`,
        3: `${BASE}icon-key-copper.png`,
    },
    stone: `${BASE}icon-stone.png`,
};

export const GENERATED_CHARACTERS = {
    player: `${BASE}player-rabbit.png`,
    princess: `${BASE}princess-carrot.png`,
    guards: {
        static: `${BASE}guard-tomato.png`,
        rotating: `${BASE}guard-blueberry.png`,
        blinking: `${BASE}guard-corn.png`,
        patrolling: `${BASE}guard-eggplant.png`,
        mirror: `${BASE}guard-lettuce.png`,
        chaser: `${BASE}guard-pumpkin.png`,
        sniper: `${BASE}guard-sniper.png`,
        suspicion: {
            calm: `${BASE}guard-suspicion-calm.png`,
            alert: `${BASE}guard-suspicion-alert.png`,
            fire: `${BASE}guard-suspicion-fire.png`,
        },
    },
};

export const GENERATED_SCENES = [
    `${BASE}scene-garden.png`,
    `${BASE}scene-garden.png`,
    `${BASE}scene-walls.png`,
    `${BASE}scene-walls.png`,
    `${BASE}scene-fortress.png`,
    `${BASE}scene-fortress.png`,
    `${BASE}scene-underground.png`,
    `${BASE}scene-underground.png`,
    `${BASE}scene-palace.png`,
    `${BASE}scene-palace.png`,
    `${BASE}scene-palace.png`,
    `${BASE}scene-chamber.png`,
];

// Hand-authored 1280x720 key art, stored as webp (the source pngs were ~3x the
// size at no visible gain on a backdrop rendered under a gradient).
const KEYART_BASE = 'assets/images/';

export const KEYART = {
    garden: `${KEYART_BASE}keyart-garden.webp`,
    gameover: `${KEYART_BASE}keyart-gameover.webp`,
    underground: `${KEYART_BASE}keyart-underground.webp`,
    palace: `${KEYART_BASE}keyart-palace.webp`,
    throne: `${KEYART_BASE}keyart-throne.webp`,
};

// Level-intro backdrops. Acts 4-6 use the detailed key art; earlier acts use the
// generated scene tiles, which suit the simpler outdoor levels.
const KEYART_BY_LEVEL = {
    7: KEYART.underground,
    8: KEYART.underground,
    9: KEYART.palace,
    10: KEYART.palace,
    11: KEYART.palace,
    12: KEYART.throne,
};

export function generatedSceneForLevel(level) {
    if (KEYART_BY_LEVEL[level]) return KEYART_BY_LEVEL[level];
    const idx = Math.max(0, Math.min(GENERATED_SCENES.length - 1, level - 1));
    return GENERATED_SCENES[idx];
}
