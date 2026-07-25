// Act backgrounds & level intro illustrations — wider pixel art scenes.
// Each act: 80×40 pixel strip evoking the environment.

// ── ACT 1: GARDEN (Levels 1-2) — cabbages, carrots in rows, moon ──────
const BG_GARDEN = [
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
  'ddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
  '...CC..........CC..........CC..........CC..........CC..........CC..........CC..',
  '..CCCC........CCCC........CCCC........CCCC........CCCC........CCCC........CCCC.',
  '..CCCC........CCCC........CCCC........CCCC........CCCC........CCCC........CCCC.',
  '..CCCC........CCCC........CCCC........CCCC........CCCC........CCCC........CCCC.',
  '..OOOO........OOOO........OOOO........OOOO........OOOO........OOOO........OOOO.',
  '..OOOO........OOOO........OOOO........OOOO........OOOO........OOOO........OOOO.',
  '..ooooo......ooooo........oooo........ooooo.......oooo.......ooooo........ooo..',
  'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
  'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd'.slice(0,80),
  'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd'.slice(0,80),
  'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
  'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
  'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
  'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
  'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
  'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
  'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
  'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
  'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
];
const BG_GARDEN_PAL = {
  m: NNTV.midnight,      // sky
  s: NNTV.moonlight,     // stars
  O: NNTV.cream,         // moon edge
  o: NNTV.moonGlow,      // moon inner
  L: NNTV.leafDark,      // hedge
  D: NNTV.mossGreen,     // hedge shadow
  g: NNTV.grass,
  G: NNTV.grassDark,
  d: NNTV.dirt,
  C: NNTV.leafGreen,     // cabbage leaves
  f: NNTV.dirtDark,      // deep soil
};

// ── ACT 2: VEGETABLE GARDEN WALLS (3-4) — brick wall + ivy ─────────────
const BG_WALLS = [
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
  'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'.slice(0,80),
  'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'.slice(0,80),
  'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'.slice(0,80),
];
const BG_WALLS_PAL = {
  p: NNTV.midnight,
  s: NNTV.cream,
  b: NNTV.brick,
  B: NNTV.brickDark,
  v: NNTV.leafDark,
  l: NNTV.leafGreen,
  g: NNTV.grass,
  G: NNTV.grassDark,
  d: NNTV.dirt,
  f: NNTV.dirtDark,
};

// ── ACT 3: FORTRESS (5-6) — stone battlements + torch ─────────────────
const BG_FORTRESS = [
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
];
const BG_FORTRESS_PAL = {
  m: NNTV.midnight,
  s: NNTV.stone,
  S: NNTV.stoneDark,
  f: NNTV.guardBlinking,   // torch flame
  F: NNTV.pumpkinOrange,
  k: NNTV.ink,
  d: NNTV.dirtDark,
};

// ── ACT 4: UNDERGROUND (7-8) — tunnel ──────────────────────────────────
const BG_UNDERGROUND = [
  'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
  'dDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDddd',
  'dddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDd',
  'dDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDddd',
  'sssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss'.slice(0,80),
  'sSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSs',
  'sSmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmSSs'.slice(0,80),
  'sSmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmSSs'.slice(0,80),
  'sSmmmmmmfmmmmmmmmmmmmmmmmmmmmmmmfmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmSSs'.slice(0,80),
  'sSmmmmmFFmmmmmmmmmmmmmmmmmmmmmmFFmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmSSs'.slice(0,80),
  'sSmmmmmffmmmmmmmmmmmmmmmmmmmmmmffmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmSSs'.slice(0,80),
  'sSmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmSSs'.slice(0,80),
  'sSmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmSSs'.slice(0,80),
  'sSmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmSSs'.slice(0,80),
  'sSmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmSSs'.slice(0,80),
  'sSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSs',
  'sssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss'.slice(0,80),
  'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
  'dDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDddd',
  'dddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDdddDDd',
];
const BG_UNDERGROUND_PAL = {
  d: NNTV.dirt,
  D: NNTV.dirtDark,
  s: NNTV.stoneDark,
  S: NNTV.stoneDark,
  m: NNTV.midnight,
  f: NNTV.guardBlinking,
  F: NNTV.pumpkinOrange,
};

// ── ACT 5: ROYAL PALACE (9-11) — pillars + banner ──────────────────────
const BG_PALACE = [
  'mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm',
  'mmmmmmmmmmmmmmmsmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm',
  'mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm',
  'mmmGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGmmm',
  'mmGCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCGmm',
  'mGC..........pp.......................pp.......................pp............CGm'.slice(0,80),
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
  '................................................................................',
  '................................................................................',
];
const BG_PALACE_PAL = {
  m: NNTV.midnight,
  s: NNTV.cream,
  G: NNTV.gold,
  C: NNTV.goldDark,
  p: NNTV.moonlight,
  P: NNTV.silver,
};

// ── ACT 6: PRINCESS CHAMBER (12) — ominous light halo ─────────────────
const BG_CHAMBER = [
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
];
const BG_CHAMBER_PAL = {
  m: NNTV.shadow,
  y: NNTV.guardBlinkingOff,
  Y: NNTV.gridLit,
  C: NNTV.carrot,
};

const SCENES = {
  garden:      { art: BG_GARDEN, pal: BG_GARDEN_PAL, label: 'Act 1 · The Outskirts', desc: 'Levels 1–2 · moonlit garden hedge' },
  walls:       { art: BG_WALLS, pal: BG_WALLS_PAL, label: 'Act 2 · The Vegetable Garden', desc: 'Levels 3–4 · brick walls with ivy' },
  fortress:    { art: BG_FORTRESS, pal: BG_FORTRESS_PAL, label: 'Act 3 · The Fortress', desc: 'Levels 5–6 · battlements, flickering torches' },
  underground: { art: BG_UNDERGROUND, pal: BG_UNDERGROUND_PAL, label: 'Act 4 · The Underground', desc: 'Levels 7–8 · tunnel, distant lamp' },
  palace:      { art: BG_PALACE, pal: BG_PALACE_PAL, label: 'Act 5 · The Royal Palace', desc: 'Levels 9–11 · gilded hall, silver pillars' },
  chamber:     { art: BG_CHAMBER, pal: BG_CHAMBER_PAL, label: 'Act 6 · The Princess Chamber', desc: 'Level 12 · expanding halo — unwinnable' },
};

Object.assign(window, { SCENES });
