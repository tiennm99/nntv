// 16×16 pixel-art tiles for the game board.
import { NNTV } from './palette.js';

export const TILE_EMPTY = [
    'aaaaaaaaaaaaaaaa',
    'abbbbbbbbbbbbbba',
    'abccccccccccccba',
    'abcccccccccccccb',
    'abcccdddccccdccb',
    'abccdcccccccccbb',
    'abcccccccccccccb',
    'abcccccccccddcbb',
    'abccdddcccccccbb',
    'abccccccccccccbb',
    'abccccdcccccccbb',
    'abcccccccccccccb',
    'abccccccccdccccb',
    'abbbbbbbbbbbbbbb',
    'aaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaa',
];
export const TILE_EMPTY_PAL = { a: NNTV.gridBorder, b: NNTV.twilight, c: NNTV.gridEmpty, d: NNTV.dusk };

export const TILE_WALL = [
    'kkkkkkkkkkkkkkkk',
    'kssssssstsssssrk',
    'ksllllllstlllsrk',
    'kslmmmmlstlmmsrk',
    'ksllllllstlllsrk',
    'ksssssssstssssrk',
    'ktttttttttttttrk',
    'kssssstsssssssrk',
    'kslmmstlmmmlssrk',
    'kslllstllllllsrk',
    'kssssstsssssssrk',
    'ksssssstssssssrk',
    'kslmmlstmmlssrkk',
    'ksllllstlllssrkk',
    'kssssstsssssrrkk',
    'kkkkkkkkkkkkkkkk',
];
export const TILE_WALL_PAL = {
    k: NNTV.ink, s: NNTV.stone, l: NNTV.stoneLight,
    m: NNTV.stoneDark, r: NNTV.stoneDark, t: NNTV.ink,
};

export const TILE_GOAL = [
    'kkkkkkkkkkkkkkkk',
    'kggggggggggggggk',
    'kghhghhhghhhgggk',
    'kgghghhhghhhhggk',
    'kgggghhghhhhhggk',
    'kgghghhhghhhhggk',
    'kggghhhhhhhhhggk',
    'kggghhwhwhhhhggk',
    'kggghhhhhwhhhggk',
    'kggghwhhhhhhhggk',
    'kgghghhhwhhhhggk',
    'kggghhhhhhhhhggk',
    'kgghghhhhhhhhggk',
    'kggghwhhhhwhhggk',
    'kggggggggggggggk',
    'kkkkkkkkkkkkkkkk',
];
export const TILE_GOAL_PAL = { k: NNTV.ink, g: NNTV.gridGoal, h: '#00e763', w: '#7affb0' };

export const TILE_LIT = [
    'yyyyyyyyyyyyyyyy',
    'ywwwwwwwwwwwwwwy',
    'ywyyyyyyyyyyyywy',
    'ywyyfffffffffywy',
    'ywyfyyyyyyyyfywy',
    'ywyfyffffffyfywy',
    'ywyfyfyyyyyfyfwy',
    'ywyfyfyffyyfyfwy',
    'ywyfyfyffyyfyfwy',
    'ywyfyfyyyyyfyfwy',
    'ywyfyffffffyfywy',
    'ywyfyyyyyyyyfywy',
    'ywyyfffffffffywy',
    'ywyyyyyyyyyyyywy',
    'ywwwwwwwwwwwwwwy',
    'yyyyyyyyyyyyyyyy',
];
export const TILE_LIT_PAL = { y: NNTV.gridLit, w: '#fff88a', f: NNTV.gridLit };

export const TILE_MIRROR = [
    '........kk......',
    '.......kmmk.....',
    '......kmllmk....',
    '.....kmllllmk...',
    '....kmllwwllmk..',
    '...kmllwllwllmk.',
    '..kmllwlllwllmk.',
    '.kmllwlllllwllmk',
    'kmlwlllllllwllmk',
    '.kmllwlllllwllmk',
    '..kmllwlllwllmk.',
    '...kmllwwwllmk..',
    '....kmllllmk....',
    '.....kmllmk.....',
    '......kmmk......',
    '.......kk.......',
];
export const TILE_MIRROR_PAL = { k: NNTV.ink, l: NNTV.guardMirror, m: NNTV.lettuceDark, w: NNTV.cream };

export const TILE_PREVIEW = [
    'yyyy........yyyy',
    'y..y........y..y',
    'y..y........y..y',
    'yyyy........yyyy',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    'yyyy........yyyy',
    'y..y........y..y',
    'y..y........y..y',
    'yyyy........yyyy',
];
export const TILE_PREVIEW_PAL = { y: NNTV.gridLit };

// ── DOOR LOCKED — 16×16, color keyed by keyId ────────────────────────────────
// Base art shape; palette swapped per keyId (gold=1, silver=2, copper=3)
export const TILE_DOOR_LOCKED = [
    'kkkkkkkkkkkkkkkk',
    'kcccccccccccccck',
    'kcddddddddddddck',
    'kcddkkkkkkkkddck',
    'kcddkbbbbbbkddck',
    'kcddkbwwwwbkddck',
    'kcddkbwhhwbkddck',
    'kcddkbbbbbbkddck',
    'kcddkbbXXbbkddck',
    'kcddkbbXXbbkddck',
    'kcddkbbbbbbkddck',
    'kcddkbbbbbbkddck',
    'kcddkkkkkkkkddck',
    'kcddddddddddddck',
    'kcccccccccccccck',
    'kkkkkkkkkkkkkkkk',
];
// Gold door (key 1)
export const TILE_DOOR_GOLD_PAL = {
    k: NNTV.ink, c: NNTV.stoneDark, d: NNTV.stone,
    b: NNTV.gold, h: NNTV.goldDark, w: NNTV.cream,
    X: NNTV.ink,
};
// Silver door (key 2)
export const TILE_DOOR_SILVER_PAL = {
    k: NNTV.ink, c: NNTV.stoneDark, d: NNTV.stone,
    b: '#c0c0c0', h: '#707070', w: NNTV.cream,
    X: NNTV.ink,
};
// Copper door (key 3)
export const TILE_DOOR_COPPER_PAL = {
    k: NNTV.ink, c: NNTV.stoneDark, d: NNTV.stone,
    b: '#b87333', h: '#7a4a1a', w: NNTV.cream,
    X: NNTV.ink,
};

// ── DOOR OPEN — same silhouette, brighter frame, open gap ────────────────────
export const TILE_DOOR_OPEN = [
    'kkkkkkkkkkkkkkkk',
    'kddddddddddddddk',
    'kd............dk',
    'kd.kkkkkkkk...dk',
    'kd.k......k...dk',
    'kd.k......k...dk',
    'kd.k......k...dk',
    'kd.k......k...dk',
    'kd.k......k...dk',
    'kd.k......k...dk',
    'kd.k......k...dk',
    'kd.k......k...dk',
    'kd.kkkkkkkk...dk',
    'kd............dk',
    'kddddddddddddddk',
    'kkkkkkkkkkkkkkkk',
];
export const TILE_DOOR_OPEN_PAL = { k: NNTV.ink, d: NNTV.stoneLight };

// ── KEY ITEM — 16×16, color-coded per keyId ───────────────────────────────────
export const TILE_KEY = [
    '................',
    '................',
    '.....kkkkk......',
    '....kbbbbbk.....',
    '...kbbhhhbbk....',
    '...kbhwwwhbk....',
    '...kbbhhhbbk....',
    '....kbbbbbk.....',
    '.....kkbkk......',
    '......kbk.......',
    '......kbk.......',
    '.....kbbkk......',
    '.....kbbbk......',
    '......kkkk......',
    '................',
    '................',
];
export const TILE_KEY_GOLD_PAL   = { k: NNTV.ink, b: NNTV.gold, h: NNTV.goldDark, w: NNTV.cream };
export const TILE_KEY_SILVER_PAL = { k: NNTV.ink, b: '#c0c0c0', h: '#707070', w: NNTV.cream };
export const TILE_KEY_COPPER_PAL = { k: NNTV.ink, b: '#b87333', h: '#7a4a1a', w: NNTV.cream };

// ── ONE-WAY ARROW — 16×16, 4 rotations ────────────────────────────────────────
// Direction: 0=up, 1=right, 2=down, 3=left (matches level data encoding)
export const TILE_ONEWAY_RIGHT = [
    'aaaaaaaaaaaaaaaa',
    'abbbbbbbbbbbbbba',
    'abccccccccccccba',
    'abccccccccxcccba',
    'abccccccccxxccba',
    'abccxxxxxxxxxcba',
    'abcxxxxxxxxxxcba',
    'abxxxxxxxxxxxxba',
    'abxxxxxxxxxxxxba',
    'abcxxxxxxxxxxcba',
    'abccxxxxxxxxxcba',
    'abccccccccxxccba',
    'abccccccccxcccba',
    'abccccccccccccba',
    'abbbbbbbbbbbbbba',
    'aaaaaaaaaaaaaaaa',
];
export const TILE_ONEWAY_PAL = {
    a: NNTV.gridBorder,
    b: NNTV.twilight,
    c: NNTV.gridEmpty,
    x: '#74b7ff',
};

// ── WARM CELL OVERLAY — 16×16, dim orange glow, distinct from bright TILE_LIT ─
export const TILE_WARM = [
    'oooooooooooooooo',
    'owwwwwwwwwwwwwwo',
    'owoooooooooooowo',
    'owooofffoooooowo',
    'owooofffoooooowo',
    'owoooofooooooowo',
    'owo..........owo',
    'owo..........owo',
    'owo..........owo',
    'owo..........owo',
    'owoooooooooooowo',
    'owooofffoooooowo',
    'owooofffoooooowo',
    'owoooooooooooowo',
    'owwwwwwwwwwwwwwo',
    'oooooooooooooooo',
];
export const TILE_WARM_PAL = {
    o: '#2a1a0a',   // very dark orange border
    w: '#5a3010',   // dim amber rim
    f: '#884422',   // warm ember glow
};

// ── STONE HUD ICON — 16×16 small grey rock ────────────────────────────────────
export const ICON_STONE = [
    '................',
    '................',
    '......kkk.......',
    '.....kmmmk......',
    '....kmsslmk.....',
    '....kmsllmk.....',
    '...kmslllmmk....',
    '...kmllllmmk....',
    '...kmmllmmmk....',
    '....kmmmmmk.....',
    '.....kkkkk......',
    '................',
    '................',
    '................',
    '................',
    '................',
];
export const ICON_STONE_PAL = {
    k: NNTV.ink,
    m: NNTV.stone,
    l: NNTV.stoneLight,
    s: '#9a9ab0',
};
