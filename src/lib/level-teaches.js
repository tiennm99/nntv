// Maps a level number to the mechanic id(s) it introduces for the first time,
// so LevelIntro can render a short "New this level" strip. Mirrors the
// "Mechanic intro" authoring comments already in levels.js, but lives here
// (not in levels.js, owned by another workstream this session) so it can ship
// independently. Display text for each mechanic id lives in the locale files
// as `teaches.{id}` — this module only says which id(s) apply per level.
//
// L1 teaches bare movement only (no guard/mechanic) and L10 is a pure combo
// level with nothing new, so neither appears here.
const LEVEL_TEACHES = {
    2: ['static'],
    3: ['oneWay'],
    4: ['suspicion'],
    5: ['keysDoors'],
    6: ['warm'],
    7: ['mirror'],
    8: ['sniper'],
    9: ['stones'],
    11: ['chaser'],
};

/** Mechanic ids newly introduced by a level, or []. */
export function teachesForLevel(levelNum) {
    return LEVEL_TEACHES[levelNum] ?? [];
}
