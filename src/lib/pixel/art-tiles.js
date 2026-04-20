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
