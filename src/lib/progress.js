// Level progress persistence via localStorage

const STORAGE_KEY = 'nntv-progress';

const DEFAULT_PROGRESS = {
    maxLevel: 1,
    completedLevels: [],
    levelStars: {},
    levelBestMoves: {},
};

export function getProgress() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            const parsed = JSON.parse(data);
            return {
                maxLevel: parsed.maxLevel || 1,
                completedLevels: parsed.completedLevels || [],
                levelStars: parsed.levelStars || {},
                levelBestMoves: parsed.levelBestMoves || {},
            };
        }
    } catch (e) {
        // Corrupted data, reset
    }
    return { ...DEFAULT_PROGRESS };
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
