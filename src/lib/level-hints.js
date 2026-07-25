// Progressive hint content lookup. Hint TEXT lives in the locale files (per the
// UX rule that player-facing strings never get hardcoded) as flat keys
// `hint.level{N}.{tier}` — this module only knows which levels have hints and
// how many escalating tiers exist. Keeps levels.js (owned by another
// workstream this session) untouched.
//
// L1 has no guards (nothing can detect the player), and L12 is intentionally
// unsolvable — hints for either would be either unreachable or dishonest, so
// both are excluded.
export const HINT_TIERS = 3;
const FIRST_HINTABLE_LEVEL = 2;
const LAST_HINTABLE_LEVEL = 11;

/** Whether a level has any authored hints at all. */
export function levelHasHints(levelNum) {
    return levelNum >= FIRST_HINTABLE_LEVEL && levelNum <= LAST_HINTABLE_LEVEL;
}

/**
 * Locale keys for every hint tier of a level, in escalating order
 * (nudge → mechanic reminder → concrete next step). Empty array if the level
 * has no hints.
 */
export function hintKeysForLevel(levelNum) {
    if (!levelHasHints(levelNum)) return [];
    const keys = [];
    for (let tier = 1; tier <= HINT_TIERS; tier++) {
        keys.push(`hint.level${levelNum}.${tier}`);
    }
    return keys;
}
