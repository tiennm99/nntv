// make-poster.mjs
// Compose a single "key art" PNG poster by re-rendering all assets
// onto one canvas. No PNG decoding — reuses the same renderArt() pipeline
// from the design source files.

import { writeFileSync, readFileSync } from 'node:fs';
import { deflateSync, crc32 } from 'node:zlib';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ─── NNTV palette (kept in sync with src/lib/pixel/palette.js) ──────────
const NNTV = {
    guardStatic: '#ff4444', guardRotating: '#4488ff', guardBlinking: '#ffdd44',
    guardBlinkingOff: '#887722', guardPatrolling: '#bb44ff', guardMirror: '#44ddaa',
    guardChaser: '#ff6622', gridEmpty: '#1a1a2e', gridWall: '#4a4a5e',
    gridGoal: '#00c853', gridLit: '#ffea00', gridBorder: '#2a2a3e',
    midnight: '#0a0a1a', twilight: '#141428', dusk: '#1f1b3a', plum: '#2d2150',
    moonlight: '#e8e4ff', silver: '#9a9ac0', shadow: '#05050f', ink: '#0b0a18',
    cream: '#fff4d6', moonGlow: '#ffe88a', carrot: '#ff8844', carrotDark: '#cc5a1f',
    leafGreen: '#3ea85c', leafDark: '#1e6b38',
    furLight: '#f5eeff', furMid: '#b8b0d0', furShadow: '#6a607a',
    cloth: '#1a1a2e', clothShadow: '#05050f', eyeShine: '#ffffff',
    eyeRed: '#ff3355', scarfRed: '#c73e3a',
    tomatoRed: '#e23a3a', tomatoDark: '#991f1f', tomatoLeaf: '#3ea85c',
    eggplantPurp: '#8a3fc9', eggplantDark: '#4a1a6e', cornYellow: '#ffd84a',
    cornDark: '#b88a1a', cornHusk: '#6aa84a', lettuceGreen: '#8fd66a',
    lettuceDark: '#3e7a3e', pumpkinOrange: '#ff7722', pumpkinDark: '#aa4411',
    blueberry: '#4a7acc', blueberryDark: '#2a4a8c', onionPurp: '#a968c9', onionDark: '#5a2a7a',
    stone: '#5a5a6e', stoneDark: '#2a2a3e', stoneLight: '#7a7a9a',
    dirt: '#4a3a2a', dirtDark: '#2a1a1a', grass: '#3e7a3e', grassDark: '#2a5a2a',
    grassLight: '#5aaa5a', mossGreen: '#2a5a3a', brick: '#6a3a2a', brickDark: '#3a1a0a',
    wood: '#7a5a2a', woodDark: '#3a2a1a', gold: '#ffcc44', goldDark: '#aa7722',
};

// ─── Art (sourced from public/assets/src/characters.jsx & tiles-ui.jsx) ──
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
const RABBIT_PAL = { K: NNTV.ink, F: NNTV.furLight, C: NNTV.furMid, S: NNTV.cloth, W: NNTV.eyeShine, E: NNTV.ink, R: NNTV.scarfRed, M: NNTV.furMid };

const TOMATO_ART = [
    '................................',
    '................................',
    '................................',
    '..............GGG...............',
    '.............GLLLG..............',
    '............GLDDLG..............',
    '...........GLDLLDLG.............',
    '..........GGLLLLLLGG............',
    '.........KKKKKKKKKKKK...........',
    '.......KKRRRRRRRRRRRRKK.........',
    '......KRRHHHHRRRRHHHHRRK........',
    '.....KRHHHHHHRRRRHHHHHRRK.......',
    '....KRRHWWHHRRRRRRHWWHRRRK......',
    '....KRRHWWHHRRRRRRHWWHRRRK......',
    '...KRRRHHHHRRRRRRRRHHHHRRRK.....',
    '...KRRRRRRRRRRRDDRRRRRRRRRRK....',
    '...KRRRRRRRRRRDDDDRRRRRRRRRK....',
    '...KRRRRRRRRRRRRRRRRRRRRRRRK....',
    '...KRRRHHHRRRRRRRRRRRHHHRRK.....',
    '....KRRRHHHRRRRRRRRRRHHHRRK.....',
    '....KRRRRHHHHRRRRRRHHHHRRRK.....',
    '.....KRRRRHHHHHHHHHHRRRRRK.....',
    '......KRRRRRRRRRRRRRRRRRRK......',
    '.......KKRRRRRRRRRRRRRRKK.......',
    '.........KKRRRRRRRRRRKK.........',
    '...........KKKKKKKKKK...........',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
];
const TOMATO_PAL = { K: NNTV.ink, R: NNTV.tomatoRed, H: NNTV.tomatoDark, W: NNTV.eyeShine, D: NNTV.cream, G: NNTV.leafGreen, L: NNTV.leafDark };

const BLUEBERRY_ART = [
    '................................',
    '................................',
    '................................',
    '..............GGG...............',
    '.............GGSG...............',
    '..............GGG...............',
    '.........KKKKKKKKKKKK...........',
    '.......KKBBBBBBBBBBBBKK.........',
    '......KBBBLLLBBBBLLLBBBK........',
    '.....KBBLLLLBBBBBBLLLLBBK.......',
    '....KBBBLLLLBBBBBBBLLLLBBBK.....',
    '....KBBBBBBBBBBBBBBBBBBBBBK.....',
    '....KBBBBBBBBBBBBBBBBBBBBBK.....',
    '...KBBBBHHHBBBBBBBBBHHHBBBBK....',
    '...KBBBHWWHBBBBBBBBHWWHBBBBK....',
    '...KBBBHWWHBBBBBBBBHWWHBBBBK....',
    '...KBBBBHHHBBBBBBBBBHHHBBBBK....',
    '...KBBBBBBBBBBBBBBBBBBBBBBBK....',
    '...KBBBBBBBBBBBBBBBBBBBBBBBK....',
    '...KBBBBBBBBBBNNNBBBBBBBBBBK....',
    '....KBBBBBBBBBNNNBBBBBBBBBK.....',
    '....KBBBBBBBBBBNBBBBBBBBBBK.....',
    '....KBBBBBBBBBBBBBBBBBBBBBK.....',
    '.....KBBBBBBBBBBBBBBBBBBBK......',
    '......KBBBBBBBBBBBBBBBBBK.......',
    '.......KKBBBBBBBBBBBBBKK........',
    '.........KKBBBBBBBBBKK..........',
    '...........KKKKKKKKK............',
    '................................',
    '................................',
    '................................',
    '................................',
];
const BLUEBERRY_PAL = { K: NNTV.ink, B: NNTV.guardRotating, L: NNTV.cream, H: NNTV.blueberryDark, W: NNTV.eyeShine, N: NNTV.cream, G: NNTV.leafGreen, S: NNTV.leafDark };

const CORN_ART = [
    '................................',
    '................................',
    '...........GGG....GGG...........',
    '..........GHHHG..GHHHG..........',
    '..........GHHHGGGHHHG...........',
    '...........GHHHGHHHG............',
    '............KGGKGGK.............',
    '..........KKCCCCCCCCKK..........',
    '........KKCCYCCYCCYCCKK.........',
    '........KCYYCCYCCYYCCYCK........',
    '.......KCCYYCCYCCYYCCYCCK.......',
    '.......KCYYYYCCYCCYYYYYCK.......',
    '.......KCCHHCCYYCCCHHCCCCK......',
    '.......KCHWWHCCYCCHWWHCCCK......',
    '.......KCHWWHCCYCCHWWHCCCK......',
    '.......KCCHHCCYCCCHHCCCCCK......',
    '.......KCYYYYCCYCCYYYYCCCK......',
    '.......KCCYYCCYCCCCYCCYCCK......',
    '.......KCYYYCYYCYCYYCCYYCK......',
    '.......KCCYCCYCCCYCCYYYCCK......',
    '........KCYYYNNNNCYYYCCCK.......',
    '........KCCYCNNNNCCYCCYCK.......',
    '........KCYYCCNNCCCYCYYCK.......',
    '........KCCYYCCCCYYYCCCCK.......',
    '.........KCCYYYYYCYYYCCK........',
    '.........KKCCCCCCCCCCCKK........',
    '...........KKCCCCCCCKK..........',
    '.............KKKKKKKK...........',
    '................................',
    '................................',
    '................................',
    '................................',
];
const CORN_PAL = { K: NNTV.ink, C: NNTV.guardBlinking, Y: NNTV.cornDark, H: NNTV.cornDark, W: NNTV.eyeShine, N: NNTV.ink, G: NNTV.cornHusk };

const EGGPLANT_ART = [
    '................................',
    '................................',
    '..............GG................',
    '.............GLLG...............',
    '............GLLLG...............',
    '...........GLLLLG...............',
    '...........KLLLLK...............',
    '..........KKKLLKKK..............',
    '.........KKPPPPPPKK.............',
    '........KPPHHPPPPPPK............',
    '.......KPPPHPPPPPHPPK...........',
    '......KPPPPPPPPPPPPPPK..........',
    '......KPPPPPPPPPPPPPPK..........',
    '.....KPPHHPPPPPPPPHHPPK.........',
    '.....KPHWWHPPPPPPHWWHPK.........',
    '.....KPHWWHPPPPPPHWWHPK.........',
    '.....KPPHHPPPPPPPPHHPPK.........',
    '.....KPPPPPPPPPPPPPPPPK.........',
    '.....KPPPPPPPPPPPPPPPPK.........',
    '......KPPPPPPNNNNPPPPK..........',
    '......KPPPPPPNNNNPPPPK..........',
    '......KPPPPPPPPPPPPPPK..........',
    '.......KPPPPPPPPPPPPK...........',
    '.......KPPPPPPPPPPPPK...........',
    '........KPPPPPPPPPPK............',
    '........KKPPPPPPPPKK............',
    '.........KKPPPPPPKK.............',
    '..........KKPPPPKK..............',
    '...........KKKKKK...............',
    '................................',
    '................................',
    '................................',
];
const EGGPLANT_PAL = { K: NNTV.ink, P: NNTV.guardPatrolling, H: NNTV.eggplantDark, W: NNTV.eyeShine, N: NNTV.cream, G: NNTV.leafGreen, L: NNTV.leafDark };

const PRINCESS_ART = [
    '................................',
    '................................',
    '............SSSSS...............',
    '...........SLLLLLS..............',
    '..........SLLHLLLLS.............',
    '..........SLLLHLLLS.............',
    '.........SSLLLLHLLSS............',
    '........KKKGGGGGGGKK............',
    '.......KYYYYCCCCCYYYK...........',
    '......KYYCCCDCCDCCCYYK..........',
    '......KYCCCCCDCDCCCCYK..........',
    '......KYCCCCCCCCCCCCYK..........',
    '......KYCCHHCCCCCHHCYK..........',
    '......KYCHWWHCCCHWWHCK..........',
    '......KYCHWEHCCCHWEHCK..........',
    '......KYCCHHCCCCCHHCCK..........',
    '......KYCCCCCCKKCCCCCK..........',
    '......KYCCCCCKPPKCCCCK..........',
    '......KYCCCCCKKKKCCCCK..........',
    '......KYCCCCCCCCCCCCCK..........',
    '.......KYCCCCCCCCCCCK...........',
    '........KYCCCCCCCCCK............',
    '.........KYCCCCCCCK.............',
    '..........KYCCCCCK..............',
    '...........KYCCCK...............',
    '............KYCK................',
    '.............KK.................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
];
const PRINCESS_PAL = { K: NNTV.ink, C: NNTV.carrot, D: NNTV.cream, H: NNTV.carrotDark, W: NNTV.eyeShine, E: NNTV.ink, P: NNTV.scarfRed, Y: NNTV.carrotDark, L: NNTV.leafGreen, S: NNTV.leafDark, G: NNTV.gold };

// ─── PNG encoder (RGBA, filter 0) ──────────────────────────────────────
function hexToRGBA(hex) {
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
    ihdr.writeUInt8(8, 8); ihdr.writeUInt8(6, 9);
    ihdr.writeUInt8(0, 10); ihdr.writeUInt8(0, 11); ihdr.writeUInt8(0, 12);
    const raw = Buffer.alloc(height * (1 + width * 4));
    for (let y = 0; y < height; y++) {
        raw[y * (1 + width * 4)] = 0;
        for (let x = 0; x < width; x++) {
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

// ─── Renderer ──────────────────────────────────────────────────────────
function renderArt(art, palette, scale = 1, bg = null) {
    const rows = art.length;
    const cols = art[0].length;
    const w = cols * scale;
    const h = rows * scale;
    const out = new Array(w * h);
    const bgPx = bg ? hexToRGBA(bg) : [0, 0, 0, 0];
    for (let i = 0; i < out.length; i++) out[i] = bgPx;
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
                    out[(r * scale + dy) * w + (c * scale + dx)] = color;
                }
            }
        }
    }
    return { w, h, pixels: out };
}

function blit(dst, dstW, dstH, src, dx, dy) {
    for (let y = 0; y < src.h; y++) {
        for (let x = 0; x < src.w; x++) {
            const px = dx + x, py = dy + y;
            if (px < 0 || px >= dstW || py < 0 || py >= dstH) continue;
            const s = y * src.w + x;
            const a = src.pixels[s][3];
            const di = py * dstW + px;
            if (a === 255) {
                dst[di] = src.pixels[s];
            } else if (a > 0) {
                const sa = a / 255;
                const da = 1 - sa;
                dst[di] = [
                    Math.round(src.pixels[s][0] * sa + dst[di][0] * da),
                    Math.round(src.pixels[s][1] * sa + dst[di][1] * da),
                    Math.round(src.pixels[s][2] * sa + dst[di][2] * da),
                    255,
                ];
            }
        }
    }
}

// ─── Build the poster ─────────────────────────────────────────────────
const W = 800, H = 600;
const pixels = new Array(W * H);
const bg = hexToRGBA('#0a0a1a');
for (let i = 0; i < pixels.length; i++) pixels[i] = bg;

// Top: NNTV wordmark, centered, big
const logo = renderArt(LOGO_ART, LOGO_PAL, 8);  // 36*8 × 9*8 = 288 × 72
blit(pixels, W, H, logo, (W - 288) / 2 | 0, 40);

// Subtitle line: a thin band of stars
for (let x = 80; x < W - 80; x += 12) {
    if ((x * 7) % 3 === 0) {
        const c = hexToRGBA('#e8e4ff');
        for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) pixels[(120 + dy) * W + (x + dx)] = c;
    }
}

// Middle: a "menu" feel — moon, hedge, ground
// Moon (10x10 circle)
const moonArt = [
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
const moonPal = { O: NNTV.cream, s: NNTV.moonGlow };
const moon = renderArt(moonArt, moonPal, 6);  // 12*6 × 10*6 = 72×60 — wait, 12*6=72
blit(pixels, W, H, moon, 80, 180);

// Horizon bands
for (let y = 290; y < 310; y++) for (let x = 0; x < W; x++) pixels[y * W + x] = hexToRGBA('#2d2150');
for (let y = 310; y < 380; y++) for (let x = 0; x < W; x++) {
    // Wavy hedge: alternate L/w
    const pal = (x / 8 | 0) % 3 === 0 ? hexToRGBA('#3e7a3e') : (x / 8 | 0) % 3 === 1 ? hexToRGBA('#3e7a3e') : hexToRGBA('#141428');
    pixels[y * W + x] = pal;
}
for (let y = 380; y < 460; y++) for (let x = 0; x < W; x++) pixels[y * W + x] = hexToRGBA('#3e7a3e');
for (let y = 460; y < H; y++) for (let x = 0; x < W; x++) pixels[y * W + x] = hexToRGBA('#2a1a1a');

// Bottom: 8 character sprites
const chars = [
    { art: RABBIT_ART, pal: RABBIT_PAL, name: 'rabbit' },
    { art: PRINCESS_ART, pal: PRINCESS_PAL, name: 'princess' },
    { art: TOMATO_ART, pal: TOMATO_PAL, name: 'tomato' },
    { art: BLUEBERRY_ART, pal: BLUEBERRY_PAL, name: 'blueberry' },
    { art: CORN_ART, pal: CORN_PAL, name: 'corn' },
    { art: EGGPLANT_ART, pal: EGGPLANT_PAL, name: 'eggplant' },
];
let xPos = 50;
for (const c of chars) {
    const r = renderArt(c.art, c.pal, 2);  // 32*2 × 32*2 = 64×64
    blit(pixels, W, H, r, xPos, 480);
    xPos += 130;
}

// Write
const buf = encodePNG(W, H, pixels);
const out = resolve(ROOT, 'public/assets/poster.png');
writeFileSync(out, buf);
console.log(`Poster written: ${out.replace(ROOT + '\\\\', '')}  (${W}×${H}, ${buf.length} bytes)`);
