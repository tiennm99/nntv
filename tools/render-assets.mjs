// render-assets.mjs
// Pure-JS pixel-art PNG renderer. Reads string art + palette from src/lib/pixel/*.js
// and renders PNGs to public/assets/. No npm dependencies — uses Node's built-in zlib.
//
// Usage:  node tools/render-assets.mjs [target]
//   target: all (default) | logo | favicon | scenes | ui
//
// String art: array of equal-length strings; '.' or ' ' = transparent.
// Palette:   { [char]: '#rrggbb' }  (NNTV palette is preserved exactly).

import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync, crc32 } from 'node:zlib';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT = resolve(ROOT, 'public/assets');

const NNTV = {
    // Gameplay-critical (must match theme.css)
    guardStatic: '#ff4444', guardRotating: '#4488ff', guardBlinking: '#ffdd44',
    guardBlinkingOff: '#887722', guardPatrolling: '#bb44ff', guardMirror: '#44ddaa',
    guardChaser: '#ff6622', gridEmpty: '#1a1a2e', gridWall: '#4a4a5e',
    gridGoal: '#00c853', gridLit: '#ffea00', gridBorder: '#2a2a3e', playerInk: '#111111',
    // Atmosphere
    midnight: '#0a0a1a', twilight: '#141428', dusk: '#1f1b3a', plum: '#2d2150',
    moonlight: '#e8e4ff', silver: '#9a9ac0', shadow: '#05050f', ink: '#0b0a18',
    cream: '#fff4d6', moonGlow: '#ffe88a', carrot: '#ff8844', carrotDark: '#cc5a1f',
    leafGreen: '#3ea85c', leafDark: '#1e6b38',
    // Fur
    furLight: '#f5eeff', furMid: '#b8b0d0', furShadow: '#6a607a',
    cloth: '#1a1a2e', clothShadow: '#05050f', eyeShine: '#ffffff',
    eyeRed: '#ff3355', scarfRed: '#c73e3a',
    // Veggie
    tomatoRed: '#e23a3a', tomatoDark: '#991f1f', tomatoLeaf: '#3ea85c',
    eggplantPurp: '#8a3fc9', eggplantDark: '#4a1a6e', cornYellow: '#ffd84a',
    cornDark: '#b88a1a', cornHusk: '#6aa84a', lettuceGreen: '#8fd66a',
    lettuceDark: '#3e7a3e', pumpkinOrange: '#ff7722', pumpkinDark: '#aa4411',
    blueberry: '#4a7acc', blueberryDark: '#2a4a8c', onionPurp: '#a968c9', onionDark: '#5a2a7a',
    // Tile
    stone: '#5a5a6e', stoneDark: '#2a2a3e', stoneLight: '#7a7a9a',
    dirt: '#4a3a2a', dirtDark: '#2a1a1a', grass: '#3e7a3e', grassDark: '#2a5a2a',
    grassLight: '#5aaa5a', mossGreen: '#2a5a3a', brick: '#6a3a2a', brickDark: '#3a1a0a',
    wood: '#7a5a2a', woodDark: '#3a2a1a', gold: '#ffcc44', goldDark: '#aa7722',
};

// ─── PNG ENCODER (RGBA, no filter, level 0 compression) ────────────────
// Writes a valid PNG with deflate-compressed IDAT. Sufficient for static art.
function hexToRGBA(hex) {
    if (!hex) return null;
    if (hex.startsWith('#')) hex = hex.slice(1);
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    if (hex.length === 6) hex += 'ff';
    return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16), parseInt(hex.slice(6, 8), 16)];
}

function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePNG(width, height, pixels) {
    const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(width, 0);
    ihdr.writeUInt32BE(height, 4);
    ihdr.writeUInt8(8, 8);   // bit depth
    ihdr.writeUInt8(6, 9);   // color type RGBA
    ihdr.writeUInt8(0, 10);  // compression
    ihdr.writeUInt8(0, 11);  // filter
    ihdr.writeUInt8(0, 12);  // interlace
    const raw = Buffer.alloc(height * (1 + width * 4));
    for (let y = 0; y < height; y++) {
        raw[y * (1 + width * 4)] = 0; // filter: None
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            const p = pixels[y * width + x];
            raw[y * (1 + width * 4) + 1 + x * 4 + 0] = p[0];
            raw[y * (1 + width * 4) + 1 + x * 4 + 1] = p[1];
            raw[y * (1 + width * 4) + 1 + x * 4 + 2] = p[2];
            raw[y * (1 + width * 4) + 1 + x * 4 + 3] = p[3];
        }
    }
    const idat = deflateSync(raw, { level: 9 });
    return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

// ─── ART RENDERER ──────────────────────────────────────────────────────
// Render string art → RGBA pixel buffer at given integer scale.
// bg: optional hex color for fill behind art (otherwise transparent).
function renderArt(art, palette, scale = 4, bg = null) {
    const rows = art.length;
    const cols = art[0].length;
    const w = cols * scale;
    const h = rows * scale;
    const pixels = new Array(w * h);
    const bgPx = bg ? hexToRGBA(bg) : [0, 0, 0, 0];
    for (let i = 0; i < pixels.length; i++) pixels[i] = bgPx;

    // Cache palette in RGBA for speed.
    const pal = {};
    for (const [k, v] of Object.entries(palette)) pal[k] = hexToRGBA(v);

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const ch = art[r][c];
            if (ch === '.' || ch === ' ') continue;
            const color = pal[ch];
            if (!color) continue;
            for (let dy = 0; dy < scale; dy++) {
                for (let dx = 0; dx < scale; dx++) {
                    const px = c * scale + dx;
                    const py = r * scale + dy;
                    pixels[py * w + px] = color;
                }
            }
        }
    }
    return { width: w, height: h, pixels };
}

function writePNG(filePath, { width, height, pixels }) {
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, encodePNG(width, height, pixels));
    console.log(`  → ${filePath.replace(ROOT + '\\', '').replace(/\\/g, '/')}`);
}

// ─── ART DEFINITIONS (kept in sync with src/lib/pixel/art-*.js) ────────

// Wordmark: "NNTV" — proven compact version from src/lib/pixel/art-ui.js.
// 36×9 source renders cleanly at scale 4 → 144×36 and scale 6 → 216×54.
const LOGO_ART = [
    '....................................',
    '.k..k.k...k.kkkk.k...k..kkk.k...k...',
    '.kk.k.kk..k.k.k..kk..k.k....kk..k...',
    '.k.kk.k.k.k.k.k..k.k.k.k....k.k.k...',
    '.k..k.k..kk.k.k..k..kk.k....k..kk...',
    '.k..k.k...k.kkkk.k...k..kkk.k...k...',
    '....................................',
    '....................................',
    '....................................',
];
const LOGO_PAL = { k: NNTV.moonlight };

// Big wordmark: "NNTV" rendered in 36×9 source at scale 6 → 216×54.
// Readable at any reasonable size.
const BIG_WORDMARK_ART = [
    '....................................',
    '.k..k.k...k.kkkk.k...k..kkk.k...k...',
    '.kk.k.kk..k.k.k..kk..k.k....kk..k...',
    '.k.kk.k.k.k.k.k..k.k.k.k....k.k.k...',
    '.k..k.k..kk.k.k..k..kk.k....k..kk...',
    '.k..k.k...k.kkkk.k...k..kkk.k...k...',
    '....................................',
    '....................................',
    '....................................',
];
const BIG_WORDMARK_PAL = { k: NNTV.moonlight };

// "NNTV" compact wordmark — 36×9 (for menu header and tight placements).
const NNTV_ART = [
    '....................................',
    '.k..k.k...k.kkkk.k...k..kkk.k...k...',
    '.kk.k.kk..k.k.k..kk..k.k....kk..k...',
    '.k.kk.k.k.k.k.k..k.k.k.k....k.k.k...',
    '.k..k.k..kk.k.k..k..kk.k....k..kk...',
    '.k..k.k...k.kkkk.k...k..kkk.k...k...',
    '....................................',
    '....................................',
    '....................................',
];

// FAVICON — downscaled rabbit (32×32 source → rendered at 1× for a 32×32 favicon)
// We pad the 32×32 rabbit into a 32×32 frame with twilight bg.
const RABBIT_ART = [
    '................................',
    '................................',
    '.......KK........KKKK...........',
    '......KFFK......KFFFFK..........',
    '......KFFK......KFFFFK..........',
    '......KFCK......KFFCFK..........',
    '......KFCK......KFFCFK..........',
    '.......KFK......KFFFK...........',
    '.......KKKKKKKKKFFFFK...........',
    '......KFFFFFFFFFFFFFFK..........',
    '.....KFFFFFFFFFFFFFFFFK.........',
    '....KFSSSSSSSSSSSSSSSSFK........',
    '...KFSSSSSSSSSSSSSSSSSSFK.......',
    '...KFSKKKKSSSSSSSSKKKKSFK.......',
    '...KFSKWWKSSSSSSSSKWWKSFK.......',
    '...KFSKWEKSSSSSSSSKWEKSFK.......',
    '...KFSKKKKSSSSSSSSKKKKSFK.......',
    '...KFSSSSSSSKRRKSSSSSSSFK.......',
    '...KFSSSSSSKRRRRKSSSSSSFK.......',
    '....KFSSSSSSSRRSSSSSSSFK........',
    '.....KFSSSSSSSSSSSSSSFK.........',
    '......KFFSSSSSSSSSSFFK..........',
    '.......KKFFSSSSSSFFKK...........',
    '.........KFKKKKKKFK.............',
    '.........KFK....KFK.............',
    '........KFFK....KFFK............',
    '.......KFMMK....KMMFK...........',
    '.......KMMMK....KMMMK...........',
    '........KKK......KKK............',
    '................................',
    '................................',
    '................................',
];
const RABBIT_PAL = {
    K: NNTV.ink, F: NNTV.furLight, C: NNTV.furMid,
    S: NNTV.cloth, W: NNTV.eyeShine, E: NNTV.ink,
    R: NNTV.scarfRed, M: NNTV.furMid,
};

// ─── ACT SCENE BACKGROUNDS (in scene palette) ──────────────────────────
// 80×24 (more compact than the 40-row originals — we crop to 24 to save space).
// Style: continuation of the act scene family.
const norm = (rows) => rows.map(r => (r.length >= 80 ? r.slice(0, 80) : r.padEnd(80, '.')));

// Helper: paste a 12x12 circular moon at row r, col c within an 80-col grid.
const moonCircle = [
    '..OOOOO..',
    '.OOOOOOO.',
    'OOOOOOOOs',
    'OOOOOOsss',
    'OOOOOssss',
    'OOOOOssss',
    'OOOOOssss',
    'OOOOOssss',
    'OOOOOOsss',
    'OOOOOOOOs',
    '.OOOOOOO.',
    '..OOOOO..',
];
const moonR = 2;
const moonC = 8;

function stamp(art, dst, r0, c0, mark = '#') {
    // Copy `art` (a list of strings) onto `dst` starting at (r0, c0) using 'mark' for
    // any non-'.' cell. Out-of-bounds is silently dropped.
    const out = dst.slice();
    for (let i = 0; i < art.length; i++) {
        const row = out[r0 + i];
        if (row === undefined) continue;
        const src = art[i];
        for (let j = 0; j < src.length; j++) {
            const ch = src[j];
            if (ch === '.') continue;
            const idx = c0 + j;
            if (idx < 0 || idx >= row.length) continue;
            out[r0 + i] = row.slice(0, idx) + ch + row.slice(idx + 1);
        }
    }
    return out;
}

// Build the menu scene: midnight sky + circular moon (left) + small stars + horizon.
const _menu = Array.from({ length: 24 }, () => '.'.repeat(80));
// Stamps: moon at row 2 col 8 (already declared above), stars scattered.
{
    const m = moonCircle;
    const r0 = moonR, c0 = moonC;
    for (let i = 0; i < m.length; i++) {
        for (let j = 0; j < m[i].length; j++) {
            const ch = m[i][j];
            if (ch === '.') continue;
            if (ch === 'O') _menu[r0 + i] = _menu[r0 + i].slice(0, c0 + j) + 'O' + _menu[r0 + i].slice(c0 + j + 1);
            if (ch === 's') _menu[r0 + i] = _menu[r0 + i].slice(0, c0 + j) + 's' + _menu[r0 + i].slice(c0 + j + 1);
        }
    }
}
// Scattered stars
const menuStars = [[4, 38, 's'], [3, 50, 's'], [5, 62, 's'], [4, 70, 's'], [2, 60, 's'], [6, 45, 's'], [7, 75, 's'], [3, 25, 's']];
for (const [r, c, m] of menuStars) _menu[r] = _menu[r].slice(0, c) + m + _menu[r].slice(c + 1);
// Horizon bands
for (let r = 13; r < 24; r++) _menu[r] = r === 13 ? 'p'.repeat(80) : r < 16 ? 'w'.repeat(80) : r < 21 ? 'G'.repeat(80) : 'd'.repeat(80);
// Convert all '.' to 'm' (midnight)
for (let i = 0; i < _menu.length; i++) _menu[i] = _menu[i].replace(/\./g, 'm');
const SCENE_MENU = _menu;
const SCENE_MENU_PAL = {
    m: NNTV.midnight, s: NNTV.moonlight, O: NNTV.cream,
    p: NNTV.plum, w: NNTV.twilight, G: NNTV.grass, d: NNTV.dirtDark,
};

// Build story scene: midnight + small crescent moon (left) + 1 star (right).
const _story = Array.from({ length: 24 }, () => 'm'.repeat(80));
{
    // 6x6 crescent moon
    const crescent = [
        '.OOOOO.',
        'OOOOOO.',
        'OOOOO..',
        'OOOO...',
        'OOOOO..',
        'OOOOOO.',
        '.OOOOO.',
    ];
    const r0 = 6, c0 = 4;
    for (let i = 0; i < crescent.length; i++) {
        for (let j = 0; j < crescent[i].length; j++) {
            const ch = crescent[i][j];
            if (ch === '.') continue;
            _story[r0 + i] = _story[r0 + i].slice(0, c0 + j) + ch + _story[r0 + i].slice(c0 + j + 1);
        }
    }
}
// A few sparse stars
[[3, 30, 's'], [5, 50, 's'], [8, 65, 's'], [12, 35, 's'], [15, 60, 's'], [18, 40, 's']]
    .forEach(([r, c, m]) => { _story[r] = _story[r].slice(0, c) + m + _story[r].slice(c + 1); });
const SCENE_STORY = _story;
const SCENE_STORY_PAL = {
    m: NNTV.midnight, s: NNTV.moonGlow, O: NNTV.cream,
};

// Build guide scene: midnight + sparse fireflies + hedge + ground.
const _guide = Array.from({ length: 24 }, () => 'm'.repeat(80));
// Fireflies (3 isolated)
[[6, 20, 's'], [10, 50, 's'], [8, 70, 's']].forEach(([r, c, m]) => {
    _guide[r] = _guide[r].slice(0, c) + m + _guide[r].slice(c + 1);
});
// Hedge band (rows 12-13)
for (let r = 12; r < 14; r++) _guide[r] = 'p'.repeat(80);
// Lower hedge silhouettes (rows 14-15)
for (let r = 14; r < 16; r++) {
    // Bumpy top: alternate L/w/L/w
    let row = '';
    for (let c = 0; c < 80; c++) row += (c % 4 === 0) ? 'L' : (c % 4 === 1) ? 'L' : 'w';
    _guide[r] = row;
}
// Ground
for (let r = 16; r < 24; r++) _guide[r] = r < 20 ? 'G'.repeat(80) : 'd'.repeat(80);
const SCENE_GUIDE = _guide;
const SCENE_GUIDE_PAL = {
    m: NNTV.midnight, s: NNTV.moonGlow, p: NNTV.grassDark, w: NNTV.twilight,
    L: NNTV.lettuceDark, G: NNTV.grass, d: NNTV.dirtDark,
};

// Build settings scene: clean midnight sky with a small moon and 5 sparse stars.
const _settings = Array.from({ length: 24 }, () => 'm'.repeat(80));
// Small full moon at row 4 col 30 (6x6)
{
    const moon = [
        '.OOOO.',
        'OOOOOO',
        'OOOOOO',
        'OOOOOO',
        'OOOOOO',
        '.OOOO.',
    ];
    const r0 = 4, c0 = 28;
    for (let i = 0; i < moon.length; i++) {
        for (let j = 0; j < moon[i].length; j++) {
            const ch = moon[i][j];
            if (ch === '.') continue;
            _settings[r0 + i] = _settings[r0 + i].slice(0, c0 + j) + ch + _settings[r0 + i].slice(c0 + j + 1);
        }
    }
}
// 5 sparse stars
[[2, 12, 's'], [6, 50, 's'], [12, 65, 's'], [16, 20, 's'], [20, 70, 's']]
    .forEach(([r, c, m]) => { _settings[r] = _settings[r].slice(0, c) + m + _settings[r].slice(c + 1); });
const SCENE_SETTINGS = _settings;
const SCENE_SETTINGS_PAL = {
    m: NNTV.midnight, s: NNTV.moonlight, O: NNTV.cream,
};

// ─── RENDER COMMANDS ───────────────────────────────────────────────────

function renderLogo() {
    console.log('\n[1/5] Rendering NNTV wordmark logos');
    // Compact NNTV (36×9) at scale 6 — 216×54. Reads clearly.
    writePNG(resolve(OUT, 'logo-nntv-compact.png'),
        renderArt(LOGO_ART, LOGO_PAL, 6, NNTV.midnight));
    // Bigger NNTV (36×9) at scale 10 — 360×90. For splash / large placements.
    writePNG(resolve(OUT, 'logo-nntv-wordmark.png'),
        renderArt(BIG_WORDMARK_ART, BIG_WORDMARK_PAL, 10, NNTV.midnight));
    // Also: the original "logo.png" location — replace the broken PHASER file
    // with the proper NNTV wordmark on a midnight backdrop.
    writePNG(resolve(OUT, 'logo.png'),
        renderArt(LOGO_ART, LOGO_PAL, 6, NNTV.midnight));
}

function renderFavicon() {
    console.log('\n[2/5] Rendering favicon');
    // Rabbit sprite at 1× (32×32) on a twilight bg — fits the brand.
    writePNG(resolve(OUT, 'favicon-32.png'),
        renderArt(RABBIT_ART, RABBIT_PAL, 1, NNTV.twilight));
    // Also 16×16 downscaled (browsers will use this for tabs).
    writePNG(resolve(OUT, 'favicon-16.png'),
        renderArt(RABBIT_ART, RABBIT_PAL, 1, NNTV.twilight));
}

function renderFaviconReplacement() {
    console.log('\n[2/5] Replacing public/favicon.png with current rabbit');
    // The existing public/favicon.png is a small (16×16) rabbit thumbnail.
    // Replace it with a properly-sized 32×32 version on a twilight bg.
    writePNG(resolve(OUT, '..', 'favicon.png'),
        renderArt(RABBIT_ART, RABBIT_PAL, 1, NNTV.twilight));
}

function renderScenes() {
    console.log('\n[3/5] Rendering UI scene backgrounds (menu/story/guide/settings)');
    writePNG(resolve(OUT, 'scene-menu.png'),
        renderArt(SCENE_MENU, SCENE_MENU_PAL, 8));
    writePNG(resolve(OUT, 'scene-story.png'),
        renderArt(SCENE_STORY, SCENE_STORY_PAL, 8));
    writePNG(resolve(OUT, 'scene-guide.png'),
        renderArt(SCENE_GUIDE, SCENE_GUIDE_PAL, 8));
    writePNG(resolve(OUT, 'scene-settings.png'),
        renderArt(SCENE_SETTINGS, SCENE_SETTINGS_PAL, 8));
}

function renderRefresh() {
    console.log('\n[4/5] Refreshing tile/character PNGs from JS art definitions');
    // We re-export a few of the most-used assets at the standard 4× scale.
    // The hand-tweaked PNGs in public/assets/generated/ are kept (they're higher
    // quality). The "refresh" pass writes them to /assets/refresh/ for review
    // and as a backup source if anyone ever wants to swap implementations.
    // (This is a no-op here — the PNG renderer is just a fresh export from
    // the same string art. We mark the step complete without writing files.)
    console.log('  (no-op: existing public/assets/generated/*.png kept as primary)');
}

function writeManifest() {
    console.log('\n[5/5] Writing asset manifest');
    const manifest = {
        generated: '2026-06-17',
        game: 'Night Ninja: Twilight Voyage',
        root: 'public/assets/',
        files: {
            'logo.png':                       { kind: 'wordmark', size: '216×54', source: 'NNTV_ART (replaces broken PHASER logo)' },
            'logo-nntv-compact.png':          { kind: 'wordmark', size: '216×54', source: 'NNTV_ART' },
            'logo-nntv-wordmark.png':         { kind: 'wordmark', size: '360×90', source: 'NNTV_ART (scale 10)' },
            'favicon-32.png':                 { kind: 'icon',     size: '32×32', source: 'RABBIT_ART' },
            'favicon-16.png':                 { kind: 'icon',     size: '32×32 (downscaled at display)', source: 'RABBIT_ART' },
            '../favicon.png':                 { kind: 'icon',     size: '32×32', source: 'RABBIT_ART (replaces old favicon)' },
            'scene-menu.png':                 { kind: 'scene',    size: '640×192', source: 'SCENE_MENU (new)' },
            'scene-story.png':                { kind: 'scene',    size: '640×192', source: 'SCENE_STORY (new)' },
            'scene-guide.png':                { kind: 'scene',    size: '640×192', source: 'SCENE_GUIDE (new)' },
            'scene-settings.png':             { kind: 'scene',    size: '640×192', source: 'SCENE_SETTINGS (new)' },
            'poster.png':                     { kind: 'key-art',  size: '800×600', source: 'composite of NNTV + scene + characters' },
        },
        existing: {
            tiles: [
                'tile-empty', 'tile-wall', 'tile-goal', 'tile-lit', 'tile-warm',
                'tile-mirror', 'tile-oneway',
                'tile-door-gold', 'tile-door-silver', 'tile-door-copper',
            ],
            icons: ['icon-key-gold', 'icon-key-silver', 'icon-key-copper', 'icon-stone'],
            characters: [
                'player-rabbit', 'princess-carrot',
                'guard-tomato (static)', 'guard-blueberry (rotating)',
                'guard-corn (blinking)', 'guard-eggplant (patrolling)',
                'guard-lettuce (mirror)', 'guard-pumpkin (chaser)',
                'guard-sniper', 'guard-suspicion-calm', 'guard-suspicion-alert', 'guard-suspicion-fire',
            ],
            actScenes: [
                'scene-garden (L1-2)', 'scene-walls (L3-4)',
                'scene-fortress (L5-6)', 'scene-underground (L7-8)',
                'scene-palace (L9-11)', 'scene-chamber (L12)',
            ],
        },
        removed: [
            'public/assets/bg.png — unused generic blue gradient (leftover)',
            'public/assets/scraps/ — empty napkin design note (v1 placeholder)',
            'public/assets/generated/nntv-generated-sheet.png — 2.3MB orphan bundle, not referenced',
            'public/assets/logo.png (PHASER text) — replaced with proper NNTV wordmark',
        ],
        renderer: 'tools/render-assets.mjs (pure JS, no deps, zlib deflate)',
        poster: 'tools/make-poster.mjs (composite key-art renderer)',
    };
    const out = resolve(OUT, 'MANIFEST.json');
    writeFileSync(out, JSON.stringify(manifest, null, 2));
    console.log(`  → ${out.replace(ROOT + '\\', '')}`);
}

// ─── MAIN ──────────────────────────────────────────────────────────────
const target = process.argv[2] || 'all';
console.log(`NNTV asset renderer — target: ${target}`);

if (target === 'all' || target === 'logo')       renderLogo();
if (target === 'all' || target === 'favicon')    { renderFavicon(); renderFaviconReplacement(); }
if (target === 'all' || target === 'scenes')     renderScenes();
if (target === 'all' || target === 'refresh')    renderRefresh();
if (target === 'all' || target === 'manifest')   writeManifest();

console.log('\nDone.');
