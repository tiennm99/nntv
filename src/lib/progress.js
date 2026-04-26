// Level progress persistence via localStorage

const STORAGE_KEY = 'nntv-progress';
const MIGRATION_KEY = 'nntv-migration-v2';

const DEFAULT_PROGRESS = {
    maxLevel: 1,
    completedLevels: [],
    levelStars: {},
    levelBestMoves: {},
};

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
                const fresh = { ...DEFAULT_PROGRESS };
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
                },
                needsMigrationModal: false,
            };
        }
    } catch (_) {
        // Corrupted data, reset
    }
    return { progress: { ...DEFAULT_PROGRESS }, needsMigrationModal: false };
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
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
        // Storage full or unavailable
    }
    return { ...progress, stars };
}
