// Tile set, UI elements, icons, HUD, popups — all pixel art.
// 16×16 tiles for board cells, larger for UI pieces.

// ── TILES 16×16 ────────────────────────────────────────────────────────
const TILE_EMPTY = [
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
const TILE_EMPTY_PAL = { a: NNTV.gridBorder, b: NNTV.twilight, c: NNTV.gridEmpty, d: NNTV.dusk };

const TILE_WALL = [
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
  'kslmmlstmmlssrk.',
  'ksllllstlllssrk.',
  'ksssssstssssrrk.',
  'kkkkkkkkkkkkkkkk',
];
const TILE_WALL_PAL = {
  k: NNTV.ink,
  s: NNTV.stone,
  l: NNTV.stoneLight,
  m: NNTV.stoneDark,
  r: NNTV.stoneDark,
  t: NNTV.ink,
};

const TILE_GOAL = [
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
const TILE_GOAL_PAL = { k: NNTV.ink, g: NNTV.gridGoal, h: '#00e763', w: '#7affb0' };

const TILE_LIT = [
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
const TILE_LIT_PAL = { y: NNTV.gridLit, w: '#fff88a', f: NNTV.gridLit };

const TILE_MIRROR = [
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
const TILE_MIRROR_PAL = { k: NNTV.ink, l: NNTV.guardMirror, m: NNTV.lettuceDark, w: NNTV.cream };

const TILE_PREVIEW = [
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
const TILE_PREVIEW_PAL = { y: NNTV.gridLit };

// ── HEART (lives) 16×16 ────────────────────────────────────────────────
const HEART_ART = [
  '................',
  '..kkkk....kkkk..',
  '.krrrhk..krrrhk.',
  'krrwrrrkkrrrrhk.',
  'krwrrrrrrrrrrhk.',
  'krrrrrrrrrrrrhk.',
  'krrrrrrrrrrrhhk.',
  'krrrrrrrrrrrhhk.',
  '.krrrrrrrrrrhk..',
  '.khrrrrrrrrhhk..',
  '..khrrrrrrhhk...',
  '...khrrrrhhk....',
  '....khrrhhk.....',
  '.....khhhk......',
  '......khk.......',
  '.......k........',
];
const HEART_ART_EMPTY = HEART_ART.map(r => r.replace(/[rwh]/g, 'e'));
const HEART_PAL = { k: NNTV.ink, r: NNTV.scarfRed, h: '#8a1a22', w: NNTV.cream, e: NNTV.dusk };

// ── LOGO / wordmark — NNTV stylized 80×24 ─────────────────────────────
const LOGO_ART = [
  '................................................................................',
  '...kk.............kk..................kkkkkkk.........kk................kk......',
  '..kccck..........kccck..............kkcccccccckk......kccck............kcccck...',
  '..kcc.ck.........kcc.ck.............kcc.......kcck....kccccck..........kcc.cck..',
  '..kcc.cck........kcc.cck............kcc.........ck....kcc..cck........kcc...ck..',
  '..kcc..cck.......kcc..cck...........kcc.........ck....kcc...ck........kcc...ck..',
  '..kcc..cck.......kcc..cck...........kcc.........ck....kcc...ck........kcc...ck..',
  '..kcc...cck......kcc...cck..........kcc.........ck....kcc...ck........kcc..cck..',
  '..kcc...ccck.....kcc...ccck.........kcc.........ck....kcc..cck........kcccccck..',
  '..kcc....cck.....kcc....cck.........kcc.........ck....kccccck.........kcc..cck..',
  '..kcc....ccck....kcc....ccck........kcc.........ck....kcccck..........kcc..cck..',
  '..kcc.....cck....kcc.....cck........kcc.........ck....kcc.ck..........kcc...ck..',
  '..kcc.....ccck...kcc.....ccck.......kcc.........ck....kcc.cck.........kcc...ck..',
  '..kcc......cck...kcc......cck.......kcc.........ck....kcc..ck.........kcc...ck..',
  '..kcc......ccck..kcc......ccck......kcc.........ck....kcc..cck........kcc..cck..',
  '..kcc.......cck..kcc.......cck......kcc.......kcck....kcc...ck........kcc.cck...',
  '..kcc.......cccckcc.......cccck.....kkcccccccckkk.....kcc...cck........kcccck...',
  '..kcc........ccckcc........ccck......kkkkkkkkk........kcc....ck.........kcck....',
  '..kcc.........ckkcc.........ckk......................kcc....ck..........kck.....',
  '..kcc..........kcc..........k........................kcc....cck..........k......',
  '..kkk...........kkk.................................kkkk....kkk..................',
  '................................................................................',
  '................................................................................',
  '................................................................................',
];
const LOGO_PAL = { k: NNTV.ink, c: NNTV.moonlight };

// ── MOON 20×20 ─────────────────────────────────────────────────────────
const MOON_ART = [
  '........kkkkk.......',
  '......kkggghhk......',
  '.....kgggghhhhk.....',
  '....kggghhhhhhhk....',
  '...kggghhhhhhhhhk...',
  '...kgghhhhhhhhhhk...',
  '..kggghhhhhhhhhhhk..',
  '..kgghhhhhhhhhhhhk..',
  '..kgghhhhhhhhhhhhk..',
  '..kgghhhhhhhhhhhhk..',
  '..kgghhhhhhhhhhhhk..',
  '..kgghhhhhhhhhhhhk..',
  '..kggghhhhhhhhhhhk..',
  '...kgghhhhhhhhhhk...',
  '...kggghhhhhhhhhk...',
  '....kggghhhhhhhk....',
  '.....kgggghhhhk.....',
  '......kkggghhk......',
  '........kkkkk.......',
  '....................',
];
const MOON_PAL = { k: NNTV.ink, g: NNTV.cream, h: NNTV.moonGlow };

// ── ICONS 16×16 ────────────────────────────────────────────────────────
const mkIcon = (s) => s.split('\n').filter(Boolean).map(r => r.padEnd(16, '.').slice(0,16));
const ICON_PAL = { k: NNTV.ink, w: NNTV.moonlight, a: NNTV.scarfRed };

const ICON_UNDO = mkIcon(`
................
................
.....wwww.......
....w....w......
...w......w.....
..w...wwww.w....
..w..w.....w....
..w..w..........
.wwww.w.........
.wwwww..........
..www...........
...w............
................
................
................
................`);
const ICON_REDO = mkIcon(`
................
................
.......wwww.....
......w....w....
.....w......w...
....w.wwww...w..
....w.....w..w..
..........w..w..
.........w.wwww.
..........wwwww.
...........www..
............w...
................
................
................
................`);
const ICON_EYE = mkIcon(`
................
................
...wwwwwwwww....
..w.........w...
.w...wwwww...w..
w...w.....w...w.
w...w.www.w...w.
w...w.www.w...w.
w...w.....w...w.
.w...wwwww...w..
..w.........w...
...wwwwwwwww....
................
................
................
................`);
const ICON_PAUSE = mkIcon(`
................
...ww.....ww....
...ww.....ww....
...ww.....ww....
...ww.....ww....
...ww.....ww....
...ww.....ww....
...ww.....ww....
...ww.....ww....
...ww.....ww....
...ww.....ww....
...ww.....ww....
................
................
................
................`);
const ICON_SETTINGS = mkIcon(`
................
.....wwww.......
....w....w......
...w..ww..w.....
..w..wwww..w....
..w..wwww..w....
.w....ww....w...
.w..........w...
.w..........w...
.w....ww....w...
..w..wwww..w....
..w..wwww..w....
...w..ww..w.....
....w....w......
.....wwww.......
................`);
const ICON_LANG = mkIcon(`
................
.....wwww.......
....wwwwww......
...ww....ww.....
..ww..ww..ww....
.ww..w..w..ww...
.w..ww..ww..w...
.w..ww..ww..w...
.w..ww..ww..w...
.ww..w..w..ww...
..ww..ww..ww....
...ww....ww.....
....wwwwww......
.....wwww.......
................
................`);
const ICON_ARROW = mkIcon(`
................
................
.......w........
......ww........
.....www........
....wwww........
...wwwww........
..wwwwwwwwww....
...wwwww........
....wwww........
.....www........
......ww........
.......w........
................
................
................`);

Object.assign(window, {
  TILE_EMPTY, TILE_EMPTY_PAL, TILE_WALL, TILE_WALL_PAL, TILE_GOAL, TILE_GOAL_PAL,
  TILE_LIT, TILE_LIT_PAL, TILE_MIRROR, TILE_MIRROR_PAL, TILE_PREVIEW, TILE_PREVIEW_PAL,
  HEART_ART, HEART_ART_EMPTY, HEART_PAL,
  LOGO_ART, LOGO_PAL, MOON_ART, MOON_PAL,
  ICON_UNDO, ICON_REDO, ICON_EYE, ICON_PAUSE, ICON_SETTINGS, ICON_LANG, ICON_ARROW, ICON_PAL,
});
