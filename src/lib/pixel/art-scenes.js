// 80×N pixel-art backdrops for each act (Levels 1-2, 3-4, 5-6, 7-8, 9-11, 12).
import { NNTV } from './palette.js';

// Normalize helper — ensure every row is exactly 80 chars.
const norm = (rows) => rows.map(r => (r.length >= 80 ? r.slice(0, 80) : r.padEnd(80, r.at(-1) || '.')));

// ── ACT 1: GARDEN ──────────────────────────────────────────────────────
export const BG_GARDEN = norm([
    'mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm',
    'mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm',
    'mmmmmmmmmmmmmmmmmmm........smmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm',
    'mmmmmmmmmmmmmmmmm....OOOOO....smmmmmmmmmmmmmmmmmmmmmm..s..s...mmmmmmmmmmmmmmmmmm',
    'mmmmmmmmmmmmmmmm...OO..........OOmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm',
    'mmmmmmmmmmmmmmmm..OO............OOmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm',
    'mmmmmmmmmmmmmmmm..O..............Omm.s.mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm',
    'mmmmmmmmmmmmmmmm..O..............Ommmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm',
    'mmmmmmmmmmmmmmmmm..OO..........OOmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm',
    'mmmmmmmmmmmmmmmmmm..OOOOOOOOOOOOmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm',
    'mmmmmmmmmmmmmmmmmmmm........smmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm',
    'mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm',
    'mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm',
    'mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm',
    '..LL......LL......LL......LL......LL......LL......LL......LL......LL......LL...',
    '.LLLL....LLLL....LLLL....LLLL....LLLL....LLLL....LLLL....LLLL....LLLL....LLLL...',
    '.LDDL....LDDL....LDDL....LDDL....LDDL....LDDL....LDDL....LDDL....LDDL....LDDL...',
    'gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg',
    'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
    'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
    'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
    '...CC..........CC..........CC..........CC..........CC..........CC..........CC..',
    '..CCCC........CCCC........CCCC........CCCC........CCCC........CCCC........CCCC.',
    '..CCCC........CCCC........CCCC........CCCC........CCCC........CCCC........CCCC.',
    '..CCCC........CCCC........CCCC........CCCC........CCCC........CCCC........CCCC.',
    '..OOOO........OOOO........OOOO........OOOO........OOOO........OOOO........OOOO.',
    '..OOOO........OOOO........OOOO........OOOO........OOOO........OOOO........OOOO.',
    '..ooooo......ooooo........oooo........ooooo.......oooo.......ooooo........ooo..',
    'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
    'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
    'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
]);
export const BG_GARDEN_PAL = {
    m: NNTV.midnight, s: NNTV.moonlight, O: NNTV.cream, o: NNTV.moonGlow,
    L: NNTV.leafDark, D: NNTV.mossGreen, g: NNTV.grass, G: NNTV.grassDark,
    d: NNTV.dirt, C: NNTV.leafGreen, f: NNTV.dirtDark,
};

// ── ACT 2: GARDEN WALLS ────────────────────────────────────────────────
export const BG_WALLS = norm([
    'ppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppp',
    'ppppppppppppppppp..sppppppppppppppppppppppppps.ppppppppppppppppppp..spppppppppp',
    'pppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppp',
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'bBBBBbbbBBBBbbbBBBBbbbBBBBbbbBBBBbbbBBBBbbbBBBBbbbBBBBbbbBBBBbbbBBBBbbbBBBBbbbBB',
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'bbbBBBBbbbBBBBbbbBBBBbbbBBBBbbbBBBBbbbBBBBbbbBBBBbbbBBBBbbbBBBBbbbBBBBbbbBBBBbbb',
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'bBBBBbbbBBBBbbbBBBBbbbBBBBbbbBBBBbbbBBBBbbbBBBBbbbBBBBbbbBBBBbbbBBBBbbbBBBBbbbBB',
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'bbbBBBBbbbBBBBbbbBBBBbbbBBBBbbbBBBBbbbBBBBbbbBBBBbbbBBBBbbbBBBBbbbBBBBbbbBBBBbbb',
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'bBBBBbbbBBBBbbbBBBBbbbBBBBbbbBBBBbbbBBBBbbbBBBBbbbBBBBbbbBBBBbbbBBBBbbbBBBBbbbBB',
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'bbbBBBBbbbBBBBbbbBBBBbbbBBBBbbbBBBBbbbBBBBbbbBBBBbbbBBBBbbbBBBBbbbBBBBbbbBBBBbbb',
    '..vvbbb.bbbvvbbbb..vvbb.bbbvv..bbbvvb..bbbbvvb..vvbbbb..vvbbbbb..vvbbbb..vvbbbbb',
    'vvllvvvvbbbllvvvbbllvvbbbbllv..bllvvbbvvllvvbvvvllvbvvvvllvbvvvllvvbbvvllvvvbbbb',
    'lllllvvvvvlllllvvvlllvvvvllll.lllllvllllllvllllllvllllllvllllllvlllllllvllllllv',
    'gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg',
    'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
    'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
    'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
]);
export const BG_WALLS_PAL = {
    p: NNTV.midnight, s: NNTV.cream, b: NNTV.brick, B: NNTV.brickDark,
    v: NNTV.leafDark, l: NNTV.leafGreen, g: NNTV.grass, G: NNTV.grassDark,
    d: NNTV.dirt, f: NNTV.dirtDark,
};

// ── ACT 3: FORTRESS ────────────────────────────────────────────────────
export const BG_FORTRESS = norm([
    'mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm',
    'mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm',
    'mmmmmmsmmmmmmmmmmmsmmmmmmmmmmmmmmmmmmmmmsmmmmmmmmmmmmmmsmmmmmmmmmmmmmmmmmmmmmmmm',
    'sssssssssssssssssssssssssssssssssssssssss.....ssssssssssssssssssssssssssssssssss',
    's.....ss.....ss.....ss.....ss.....ss...ss.....ss...ss.....ss.....ss.....ss....ss',
    's.....ss.....ss.....ss.....ss.....ss...ss.....ss...ss.....ss.....ss.....ss....ss',
    'SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS',
    'sSSsSSssSsSSssSSsSSssSsSSsSSssSSsSSssSsSSssSSsSSssSsSSssSSsSSssSsSSssSSsSSssSsSSS',
    'SssSSsSSssSsSSssSSsSSssSsSSssSsSSssSSsSSssSSsSSssSsSSssSSsSSssSSsSSssSsSSssSSsSSS',
    'sSSssSsSSssSSsSSssSsSSssSSsSSssSsSSssSSsSSssSsSSssSSsSSssSSsSSssSsSSssSSsSSssSsSS',
    'SssSSsSSssSsSSssSSsSSssSsSSssSSsSSssSsSSssSSsSSssSsSSssSSsSSssSSsSSssSsSSssSSsSSS',
    'sSSssSsSSssSSsSSssSsSSssSSsSSssSsSSssSSsSSssSsSSssSSsSSssSSsSSssSsSSssSSsSSssSsSS',
    'ssSSsSSssSsSSssSSsSSssSsSSssSSsSSssSsSSssSSsSSssSsSSssSSsSSssSSsSSssSsSSssSSsSSss',
    'sSSssSsSSssSSsSSssSsSSssSSsSSssSsSSssSSsSSssSsSSssSSsSSssSSsSSssSsSSssSSsSSssSsSS',
    'ssSSsSSssSsSSssSSsSSssSsSSssSSsSSssSsSSssSSsSSssSsSSssSSsSSssSSsSSssSsSSssSSsSSss',
    'sSSssSsSSssSSsSSssSsSSssSSsSSssSsSSssSSsSSssSsSSssSSsSSssSSsSSssSsSSssSSsSSssSsSS',
    '..........ff..................................ff...........................ff..',
    '.........fFFf................................fFFf.........................fFFf.',
    '........fFFFFf..............................fFFFFf........................fFFFFf',
    '.........ffff................................ffff..........................ffff',
    '..........kk..................................kk...........................kk..',
    'ssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss',
    'SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS',
    'ddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd.',
]);
export const BG_FORTRESS_PAL = {
    m: NNTV.midnight, s: NNTV.stone, S: NNTV.stoneDark,
    f: NNTV.guardBlinking, F: NNTV.pumpkinOrange, k: NNTV.ink, d: NNTV.dirtDark,
};

// ── ACT 4: UNDERGROUND ─────────────────────────────────────────────────
export const BG_UNDERGROUND = norm([
    'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
    'dDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDddd',
    'dddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDd',
    'dDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDddd',
    'ssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss',
    'sSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSs',
    'sSmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmSSs',
    'sSmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmSSs',
    'sSmmmmmmfmmmmmmmmmmmmmmmmmmmmmmmfmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmSSs',
    'sSmmmmmFFmmmmmmmmmmmmmmmmmmmmmmFFmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmSSs',
    'sSmmmmmffmmmmmmmmmmmmmmmmmmmmmmffmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmSSs',
    'sSmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmSSs',
    'sSmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmSSs',
    'sSmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmSSs',
    'sSmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmSSs',
    'sSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSs',
    'ssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss',
    'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
    'dDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDddd',
    'dddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDd',
]);
export const BG_UNDERGROUND_PAL = {
    d: NNTV.dirt, D: NNTV.dirtDark, s: NNTV.stoneDark, S: NNTV.stoneDark,
    m: NNTV.midnight, f: NNTV.guardBlinking, F: NNTV.pumpkinOrange,
};

// ── ACT 5: PALACE ──────────────────────────────────────────────────────
export const BG_PALACE = norm([
    'mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm',
    'mmmmmmmmmmmmmmmsmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm',
    'mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm',
    'mmmGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGmmm',
    'mmGCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCGmm',
    'mGC..........pp.......................pp.......................pp............CGm',
    'mGC.........pPPp.....................pPPp.....................pPPp...........CGm',
    'mGC........pPPPPp...................pPPPPp...................pPPPPp..........CGm',
    'mGC........pPPPPp...................pPPPPp...................pPPPPp..........CGm',
    'mGC........pPPPPp...................pPPPPp...................pPPPPp..........CGm',
    'mGC........pPPPPp...................pPPPPp...................pPPPPp..........CGm',
    'mGC........pPPPPp...................pPPPPp...................pPPPPp..........CGm',
    'mGC........pPPPPp...................pPPPPp...................pPPPPp..........CGm',
    'mGC........pPPPPp...................pPPPPp...................pPPPPp..........CGm',
    'mGC........pPPPPp...................pPPPPp...................pPPPPp..........CGm',
    'mGC........pPPPPp...................pPPPPp...................pPPPPp..........CGm',
    'mGC........pPPPPp...................pPPPPp...................pPPPPp..........CGm',
    'mGC........pPPPPp...................pPPPPp...................pPPPPp..........CGm',
    'mGC........pPPPPp...................pPPPPp...................pPPPPp..........CGm',
    'mGCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCGm',
    'mmGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGmm.',
    'mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm',
]);
export const BG_PALACE_PAL = {
    m: NNTV.midnight, s: NNTV.cream, G: NNTV.gold, C: NNTV.goldDark,
    p: NNTV.moonlight, P: NNTV.silver,
};

// ── ACT 6: CHAMBER ─────────────────────────────────────────────────────
export const BG_CHAMBER = norm([
    'mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm',
    'mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm',
    'mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm',
    'mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmyyyyymmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm',
    'mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmyyyYYYyymmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm',
    'mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmyyyYYYYYYymmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm',
    'mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmyyyyYYYCCYYYymmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm',
    'mmmmmmmmmmmmmmmmmmmmmmmmmmmmmyyyyYYYYCCCCYYYyymmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm',
    'mmmmmmmmmmmmmmmmmmmmmmmmmmmyyyyYYYYYYCCCCCYYYyymmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm',
    'mmmmmmmmmmmmmmmmmmmmmmmmmyyyyYYYYYYYYCCCCCYYYYyymmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm',
    'mmmmmmmmmmmmmmmmmmmmmmmyyyyYYYYYYYYYYCCCCYYYYYyymmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm',
    'mmmmmmmmmmmmmmmmmmmmmyyyyYYYYYYYYYYYYCCCCYYYYYYyymmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm',
    'mmmmmmmmmmmmmmmmmmmyyyyyYYYYYYYYYYYYYCCYYYYYYYYyyymmmmmmmmmmmmmmmmmmmmmmmmmmmmmm',
    'mmmmmmmmmmmmmmmmmyyyyYYYYYYYYYYYYYYYYCCYYYYYYYYYYyymmmmmmmmmmmmmmmmmmmmmmmmmmmmm',
    'mmmmmmmmmmmmmmmyyyyyYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYyymmmmmmmmmmmmmmmmmmmmmmmmmmmm',
    'mmmmmmmmmmmmmyyyyyYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYyyymmmmmmmmmmmmmmmmmmmmmmmmmmm',
    'mmmmmmmmmmmmyyyyYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYyymmmmmmmmmmmmmmmmmmmmmmmmmm',
    'mmmmmmmmmmyyyyYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYyymmmmmmmmmmmmmmmmmmmmmmmmm',
    'mmmmmmmmmyyyyYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYymmmmmmmmmmmmmmmmmmmmmmmmm',
    'mmmmmmmyyyyyYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYyymmmmmmmmmmmmmmmmmmmmmmmm',
    'mmmmmmyyyyYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYyymmmmmmmmmmmmmmmmmmmmmmm',
    'mmmmmyyyyYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYymmmmmmmmmmmmmmmmmmmmmmm',
    'mmmmyyyyYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYymmmmmmmmmmmmmmmmmmmmmm',
    'mmmyyyYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYymmmmmmmmmmmmmmmmmmmmmm',
]);
export const BG_CHAMBER_PAL = {
    m: NNTV.shadow, y: NNTV.guardBlinkingOff, Y: NNTV.gridLit, C: NNTV.carrot,
};

// Map level (1-indexed) → act scene data. Keeps UI code simple.
export const SCENE_BY_LEVEL = [
    // 1-2 garden, 3-4 walls, 5-6 fortress, 7-8 underground, 9-11 palace, 12 chamber
    BG_GARDEN, BG_GARDEN, BG_WALLS, BG_WALLS, BG_FORTRESS, BG_FORTRESS,
    BG_UNDERGROUND, BG_UNDERGROUND, BG_PALACE, BG_PALACE, BG_PALACE, BG_CHAMBER,
];
export const SCENE_PAL_BY_LEVEL = [
    BG_GARDEN_PAL, BG_GARDEN_PAL, BG_WALLS_PAL, BG_WALLS_PAL,
    BG_FORTRESS_PAL, BG_FORTRESS_PAL, BG_UNDERGROUND_PAL, BG_UNDERGROUND_PAL,
    BG_PALACE_PAL, BG_PALACE_PAL, BG_PALACE_PAL, BG_CHAMBER_PAL,
];

export function sceneForLevel(level) {
    const idx = Math.max(0, Math.min(SCENE_BY_LEVEL.length - 1, level - 1));
    return { art: SCENE_BY_LEVEL[idx], pal: SCENE_PAL_BY_LEVEL[idx] };
}
