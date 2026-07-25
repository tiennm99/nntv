// Pixel art renderer — converts string art into inline SVG <rect>s.
// Each character maps to a palette index; '.' or ' ' = transparent.
//
// Usage:
//   <Pixel art={ART} palette={PAL} scale={6} />
//   Pixel(art, palette, scale)  →  SVG element
//
// Palette keys are 1-char strings. Keep sprites small (≤64px) for readability.

const NNTV = {
  // Game semantic colors (from theme.css) — preserved exactly for gameplay readability
  guardStatic:     '#ff4444',
  guardRotating:   '#4488ff',
  guardBlinking:   '#ffdd44',
  guardBlinkingOff:'#887722',
  guardPatrolling: '#bb44ff',
  guardMirror:     '#44ddaa',
  guardChaser:     '#ff6622',
  gridEmpty:       '#1a1a2e',
  gridWall:        '#4a4a5e',
  gridGoal:        '#00c853',
  gridLit:         '#ffea00',
  gridBorder:      '#2a2a3e',
  playerInk:       '#111111',

  // Expanded palette for richer pixel work — evolution of current indigo theme
  midnight:  '#0a0a1a',     // deepest bg
  twilight:  '#141428',     // bg panel deep
  dusk:      '#1f1b3a',     // panel mid
  plum:      '#2d2150',     // panel warm
  moonlight: '#e8e4ff',     // light text / highlight
  silver:    '#9a9ac0',     // mid text
  shadow:    '#05050f',     // near-black
  ink:       '#0b0a18',     // outline ink
  cream:     '#fff4d6',     // moon / whites
  moonGlow:  '#ffe88a',     // warm light halo
  carrot:    '#ff8844',     // princess warm
  carrotDark:'#cc5a1f',     // princess shadow
  leafGreen: '#3ea85c',     // princess leaf
  leafDark:  '#1e6b38',

  // Rabbit fur/cloth tones
  furLight:  '#f5eeff',
  furMid:    '#b8b0d0',
  furShadow: '#6a607a',
  cloth:     '#1a1a2e',
  clothShadow:'#05050f',
  eyeShine:  '#ffffff',
  eyeRed:    '#ff3355',   // determined glint
  scarfRed:  '#c73e3a',

  // Veggie tones
  tomatoRed:    '#e23a3a',
  tomatoDark:   '#991f1f',
  tomatoLeaf:   '#3ea85c',
  eggplantPurp: '#8a3fc9',
  eggplantDark: '#4a1a6e',
  cornYellow:   '#ffd84a',
  cornDark:     '#b88a1a',
  cornHusk:     '#6aa84a',
  lettuceGreen: '#8fd66a',
  lettuceDark:  '#3e7a3e',
  pumpkinOrange:'#ff7722',
  pumpkinDark:  '#aa4411',
  blueberry:    '#4a7acc',
  blueberryDark:'#2a4a8c',
  onionPurp:    '#a968c9',
  onionDark:    '#5a2a7a',

  // Tile tones
  stone:        '#5a5a6e',
  stoneDark:    '#2a2a3e',
  stoneLight:   '#7a7a9a',
  dirt:         '#4a3a2a',
  dirtDark:     '#2a1a1a',
  grass:        '#3e7a3e',
  grassDark:    '#2a5a2a',
  grassLight:   '#5aaa5a',
  mossGreen:    '#2a5a3a',
  brick:        '#6a3a2a',
  brickDark:    '#3a1a0a',
  wood:         '#7a5a2a',
  woodDark:     '#3a2a1a',
  gold:         '#ffcc44',
  goldDark:     '#aa7722',
};

// ---- Pixel renderer ------------------------------------------------------
function Pixel({ art, palette, scale = 6, bg = null, style = {}, pixelated = true }) {
  // art: array of strings, all same length. palette: { [char]: color }
  const rows = art.length;
  const cols = art[0]?.length ?? 0;
  const rects = [];
  for (let r = 0; r < rows; r++) {
    let c = 0;
    while (c < cols) {
      const ch = art[r][c];
      if (ch === '.' || ch === ' ') { c++; continue; }
      // run-length merge same color horizontally
      let run = 1;
      while (c + run < cols && art[r][c + run] === ch) run++;
      const color = palette[ch];
      if (color) {
        rects.push(<rect key={r+','+c} x={c} y={r} width={run} height={1} fill={color} shapeRendering="crispEdges" />);
      }
      c += run;
    }
  }
  return (
    <svg
      width={cols * scale} height={rows * scale}
      viewBox={`0 0 ${cols} ${rows}`}
      style={{ display: 'block', imageRendering: pixelated ? 'pixelated' : 'auto', ...style }}
      shapeRendering="crispEdges"
    >
      {bg && <rect x={0} y={0} width={cols} height={rows} fill={bg} />}
      {rects}
    </svg>
  );
}

Object.assign(window, { NNTV, Pixel });
