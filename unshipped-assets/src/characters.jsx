// Character sprites for NNTV — 32×32 pixel art.
// Design rules:
//   • ink outline in rabbit/ink tones
//   • each guard's primary color matches its mechanic (strict readability)
//   • guards: tomato=static(red), blueberry=rotating(blue), corn=blinking(yellow),
//             eggplant=patrolling(purple), lettuce=mirror(green), pumpkin=chaser(orange)
//   • readable silhouette even at 32px

// ── NINJA RABBIT (32×32) ──────────────────────────────────────────────
// Scrappy apprentice. Dark ninja wrap, wide eyes, one ear flicked.
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
  K: NNTV.ink,
  F: NNTV.furLight,
  C: NNTV.furMid,       // inner ear
  S: NNTV.cloth,        // ninja wrap
  W: NNTV.eyeShine,     // eye white
  E: NNTV.ink,          // pupil
  R: NNTV.scarfRed,     // scarf knot
  M: NNTV.furMid,       // paw shadow
};

// ── TOMATO — Static Guard (RED, circle shape) 32×32 ───────────────────
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
  '...KRRRRHHRRRRRRRRRRRRHHRRRK....',
  '....KRRRHHHRRRRRRRRRRHHHRRK.....',
  '....KRRRRHHHHRRRRRRHHHHRRRK.....',
  '.....KRRRRRHHHHHHHHHHRRRRRK.....',
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
const TOMATO_PAL = {
  K: NNTV.ink,
  R: NNTV.tomatoRed,     // primary = red (static guard color)
  H: NNTV.tomatoDark,    // shadow
  W: NNTV.eyeShine,
  D: NNTV.cream,         // highlight
  G: NNTV.leafGreen,     // leaf
  L: NNTV.leafDark,      // leaf shadow
};

// ── BLUEBERRY — Rotating Guard (BLUE, circle + direction) 32×32 ────────
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
const BLUEBERRY_PAL = {
  K: NNTV.ink,
  B: NNTV.guardRotating,   // strict guard blue
  L: NNTV.cream,           // dusting highlight
  H: NNTV.blueberryDark,
  W: NNTV.eyeShine,
  N: NNTV.cream,           // mouth/whisker
  G: NNTV.leafGreen,
  S: NNTV.leafDark,
};

// ── CORN — Blinking Guard (YELLOW, dims when off) 32×32 ───────────────
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
const CORN_PAL = {
  K: NNTV.ink,
  C: NNTV.guardBlinking,   // kernel yellow
  Y: NNTV.cornDark,        // kernel shadow
  H: NNTV.cornDark,
  W: NNTV.eyeShine,
  N: NNTV.ink,             // mouth
  G: NNTV.cornHusk,        // husk
};
// OFF variant: swap C→dim
const CORN_OFF_PAL = { ...CORN_PAL, C: NNTV.guardBlinkingOff, Y: '#5a4410' };

// ── EGGPLANT — Patrolling Guard (PURPLE, circle + direction) 32×32 ─────
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
const EGGPLANT_PAL = {
  K: NNTV.ink,
  P: NNTV.guardPatrolling,   // strict purple
  H: NNTV.eggplantDark,
  W: NNTV.eyeShine,
  N: NNTV.cream,
  G: NNTV.leafGreen,
  L: NNTV.leafDark,
};

// ── LETTUCE — Mirror Guard (GREEN, diamond-ish) 32×32 ──────────────────
const LETTUCE_ART = [
  '................................',
  '................................',
  '................................',
  '..............KKK...............',
  '............KKMMMKK.............',
  '..........KKMMMMMMMKK...........',
  '.........KMMMMLLLMMMMK..........',
  '........KMMLLLLLLLLMMMK.........',
  '.......KMMLLLLLLLLLLLMMK........',
  '......KMMLLLMMMMMMMLLLMMK.......',
  '.....KMMLLMMLLLLLLLMMLLMMK......',
  '....KMMLLMLLLLLLLLLLLMLLMMK.....',
  '....KMMLMLLLHHLLLLHHLLMLMMK.....',
  '...KMMLLMLHWWHLLHWWHLMLLMMK.....',
  '...KMLLMMLHWWHLLHWWHLMMLLMK.....',
  '...KMLLMMLLHHLLLLHHLLMMLLMK.....',
  '....KMMLMLLLLLLLLLLLLMLMMK......',
  '....KMMLLMLLLNNNNNLLLMLLMMK.....',
  '.....KMMLLMLLNNNNNLLMLLMMK......',
  '......KMMLLMMLLLLLMMLLMMK.......',
  '.......KMMLLLMMMMMMMLLMMK.......',
  '........KMMLLLLLLLLLLMMK........',
  '.........KMMLLLLLLLLMMK.........',
  '..........KKMMMMMMMMKK..........',
  '............KKMMMMKK............',
  '..............KKKK..............',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
];
const LETTUCE_PAL = {
  K: NNTV.ink,
  L: NNTV.guardMirror,      // strict green
  M: NNTV.lettuceDark,      // leaf vein
  H: NNTV.lettuceDark,
  W: NNTV.eyeShine,
  N: NNTV.cream,
};

// ── PUMPKIN — Chaser Guard (ORANGE, angry) 32×32 ──────────────────────
const PUMPKIN_ART = [
  '................................',
  '................................',
  '................................',
  '..............SS................',
  '.............SSSS...............',
  '.............SSSS...............',
  '...........GGGSSGGG.............',
  '...........KGGSSGGK.............',
  '.........KKPPKKKKPPKK...........',
  '........KPPOOPPPPOOPPK..........',
  '.......KPPOOOPPPPOOOPPK.........',
  '......KPPOOOPPPPPPOOOPPK........',
  '.....KPOOOPPPPPPPPPPOOOPK.......',
  '.....KPOOPPPPPPPPPPPPOOPK.......',
  '....KPPOOPHHPPPPPPHHPPOOPPK.....',
  '....KPOOPPHWHPPPPPHWHPPOOOPK....',
  '....KPOOPPHWHPPPPPHWHPPOOOPK....',
  '....KPOOPPPHHPPPPPPHHPPPOOPK....',
  '....KPOOPPPPPPPPPPPPPPPPOOPK....',
  '....KPOOPPPPKKPPPPKKPPPPOOPK....',
  '....KPPOOPPKNNKPPKNNKPPPOOPK....',
  '.....KPOOPKNNNNKKNNNNKPPOOPK....',
  '.....KPPOOPKNNNNNNNNKPPOOPPK....',
  '......KPOOOPKKNNNNKKPOOOPK......',
  '.......KPOOOOPPPPPPOOOOPK.......',
  '........KPPOOOOOOOOOOPPK........',
  '.........KKPPOOOOOOPPKK.........',
  '...........KKPPPPPPKK...........',
  '.............KKKKKK.............',
  '................................',
  '................................',
  '................................',
];
const PUMPKIN_PAL = {
  K: NNTV.ink,
  P: NNTV.guardChaser,       // strict orange
  O: NNTV.pumpkinDark,
  H: NNTV.eyeRed,            // glowing angry eye
  W: NNTV.cream,
  N: NNTV.ink,               // jagged mouth
  G: NNTV.leafGreen,         // stem leaf
  S: NNTV.leafDark,          // stem
};

// ── CARROT PRINCESS — 32×32 ────────────────────────────────────────────
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
const PRINCESS_PAL = {
  K: NNTV.ink,
  C: NNTV.carrot,       // carrot body
  D: NNTV.cream,        // highlight streaks
  H: NNTV.carrotDark,
  W: NNTV.eyeShine,
  E: NNTV.ink,
  P: NNTV.scarfRed,     // lips
  Y: NNTV.carrotDark,   // outline carrot
  L: NNTV.leafGreen,    // leafy crown
  S: NNTV.leafDark,
  G: NNTV.gold,         // tiara band
};

// Export all
const SPRITES = {
  rabbit: { art: RABBIT_ART, pal: RABBIT_PAL, label: 'Ninja Rabbit', desc: 'Player. Scrappy apprentice, dark wrap, red scarf.' },
  tomato: { art: TOMATO_ART, pal: TOMATO_PAL, label: 'Tomato — Static', desc: 'Red · fixed light pattern', color: NNTV.guardStatic },
  blueberry: { art: BLUEBERRY_ART, pal: BLUEBERRY_PAL, label: 'Blueberry — Rotating', desc: 'Blue · rotates beam 90° / turn', color: NNTV.guardRotating },
  corn: { art: CORN_ART, pal: CORN_PAL, label: 'Corn — Blinking (on)', desc: 'Yellow · toggles lights on/off', color: NNTV.guardBlinking },
  cornOff: { art: CORN_ART, pal: CORN_OFF_PAL, label: 'Corn — Blinking (off)', desc: 'Dimmed variant', color: NNTV.guardBlinkingOff },
  eggplant: { art: EGGPLANT_ART, pal: EGGPLANT_PAL, label: 'Eggplant — Patrolling', desc: 'Purple · walks a path', color: NNTV.guardPatrolling },
  lettuce: { art: LETTUCE_ART, pal: LETTUCE_PAL, label: 'Lettuce — Mirror', desc: 'Green · reflects beams 90°', color: NNTV.guardMirror },
  pumpkin: { art: PUMPKIN_ART, pal: PUMPKIN_PAL, label: 'Pumpkin — Chaser', desc: 'Orange · hunts via pathfinding', color: NNTV.guardChaser },
  princess: { art: PRINCESS_ART, pal: PRINCESS_PAL, label: 'Carrot Princess', desc: 'Objective. Royal. Unreachable.' },
};

Object.assign(window, { SPRITES });
