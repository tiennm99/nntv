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

export function generatedSceneForLevel(level) {
    const idx = Math.max(0, Math.min(GENERATED_SCENES.length - 1, level - 1));
    return GENERATED_SCENES[idx];
}
