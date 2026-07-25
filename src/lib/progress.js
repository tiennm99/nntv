// Level progress persistence via localStorage

const STORAGE_KEY = 'nntv-progress';
const MIGRATION_KEY = 'nntv-migration-v2';

// Attempt counts required to unlock each progressive hint tier (nudge → mechanic
// reminder → concrete next step), and to offer the mercy unlock. An "attempt" is
// one detection (death) on the currently-loaded level.
export const HINT_THRESHOLDS = [3, 5, 7];
export const MERCY_THRESHOLD = 8;

// Factory, not a shared object literal — every caller that falls back to
// "no saved data" must get its own fresh nested objects/arrays. A plain
// `{ ...DEFAULT_PROGRESS }` spread only shallow-copies the top level, so
// `attempts`/`completedLevels`/etc would alias the same nested object across
// every call (and mutations from one level would leak into another whenever
// localStorage is unavailable, e.g. private browsing).
function freshProgress() {
    return {
        maxLevel: 1,
        completedLevels: [],
        levelStars: {},
        levelBestMoves: {},
        attempts: {},
        skippedLevels: [],
    };
}

/**
 * Returns { progress, needsMigrationModal }.
 * If saved data has legacy `lives` field (v1 shape), discards it and sets
 * needsMigrationModal = true so App.svelte can show the one-time modal.
 */
export function loadProgress() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            const parsed = JSON.parse(data);
            // Detect v1 save shape (has `lives` field)
            if (parsed.lives !== undefined) {
                // Wipe legacy data, save clean v2 shape
                const fresh = freshProgress();
                try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
                } catch (_) {
                    // Storage full — proceed with in-memory defaults
                }
                return { progress: fresh, needsMigrationModal: true };
            }
            return {
                progress: {
                    maxLevel: parsed.maxLevel || 1,
                    completedLevels: parsed.completedLevels || [],
                    levelStars: parsed.levelStars || {},
                    levelBestMoves: parsed.levelBestMoves || {},
                    attempts: parsed.attempts || {},
                    skippedLevels: parsed.skippedLevels || [],
                },
                needsMigrationModal: false,
            };
        }
    } catch (_) {
        // Corrupted data, reset
    }
    return { progress: freshProgress(), needsMigrationModal: false };
}

/** Legacy compat shim — returns progress only. Use loadProgress() for migration detection. */
export function getProgress() {
    return loadProgress().progress;
}

/** Whether the v2 migration modal has been acknowledged. */
export function isMigrationAcknowledged() {
    try {
        return localStorage.getItem(MIGRATION_KEY) === 'done';
    } catch (_) {
        return true;
    }
}

export function acknowledgeMigration() {
    try {
        localStorage.setItem(MIGRATION_KEY, 'done');
    } catch (_) {
        // ignore
    }
}

// Calculate star rating: 3★ = ≤par, 2★ = par+1 to par+3, 1★ = completed
export function calculateStars(moves, parMoves) {
    if (moves <= parMoves) return 3;
    if (moves <= parMoves + 3) return 2;
    return 1;
}

export function completeLevel(levelNum, totalLevels, moves, parMoves) {
    const progress = getProgress();
    if (!progress.completedLevels.includes(levelNum)) {
        progress.completedLevels.push(levelNum);
    }
    // Unlock next level
    const nextLevel = Math.min(levelNum + 1, totalLevels);
    if (nextLevel > progress.maxLevel) {
        progress.maxLevel = nextLevel;
    }
    // Star rating (only update if better)
    let stars = 1;
    if (moves != null && parMoves != null) {
        stars = calculateStars(moves, parMoves);
        const key = String(levelNum);
        const prevStars = progress.levelStars[key] || 0;
        if (stars > prevStars) progress.levelStars[key] = stars;
        const prevBest = progress.levelBestMoves[key];
        if (prevBest == null || moves < prevBest) progress.levelBestMoves[key] = moves;
    }
    // A real clear resets the fail streak and clears any "mercy skipped" mark —
    // the player earned this level properly now.
    const levelKey = String(levelNum);
    if (progress.attempts[levelKey]) delete progress.attempts[levelKey];
    progress.skippedLevels = progress.skippedLevels.filter((n) => n !== levelNum);
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
        // Storage full or unavailable
    }
    return { ...progress, stars };
}

/**
 * Record one failed attempt (detection) on a level. Returns the updated
 * attempt count for that level. Safe under localStorage failures (private
 * browsing, quota exceeded) — falls back to an in-memory count of 1.
 */
export function recordDetection(levelNum) {
    const progress = getProgress();
    const key = String(levelNum);
    progress.attempts[key] = (progress.attempts[key] || 0) + 1;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
        // Storage full or unavailable — count still returned for this session
    }
    return progress.attempts[key];
}

/** Current attempt (detection) count for a level. */
export function getAttempts(levelNum) {
    const progress = getProgress();
    return progress.attempts[String(levelNum)] || 0;
}

/**
 * How many progressive hint tiers are unlocked for a level, given its current
 * attempt count (0 = none unlocked yet). Tiers escalate: nudge → mechanic
 * reminder → concrete next step.
 */
export function getUnlockedHintTiers(levelNum) {
    const attempts = getAttempts(levelNum);
    let tiers = 0;
    for (const threshold of HINT_THRESHOLDS) {
        if (attempts >= threshold) tiers++;
    }
    return tiers;
}

/** Whether the player has failed enough to be offered a mercy skip. */
export function isMercyEligible(levelNum) {
    return getAttempts(levelNum) >= MERCY_THRESHOLD;
}

/**
 * Grant a mercy unlock: unlocks levelNum + 1 without requiring a real clear,
 * and marks levelNum as "skipped" (distinct from completed) so 100% completion
 * still requires coming back to actually solve it. No-op if already completed.
 */
export function mercySkipLevel(levelNum, totalLevels) {
    const progress = getProgress();
    if (progress.completedLevels.includes(levelNum)) return progress;
    if (!progress.skippedLevels.includes(levelNum)) {
        progress.skippedLevels.push(levelNum);
    }
    const nextLevel = Math.min(levelNum + 1, totalLevels);
    if (nextLevel > progress.maxLevel) {
        progress.maxLevel = nextLevel;
    }
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
        // Storage full or unavailable
    }
    return progress;
}
