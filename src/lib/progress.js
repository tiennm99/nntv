// Level progress persistence via localStorage

const STORAGE_KEY = 'nntv-progress';

const DEFAULT_PROGRESS = {
    maxLevel: 1,
    completedLevels: [],
};

export function getProgress() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            const parsed = JSON.parse(data);
            return {
                maxLevel: parsed.maxLevel || 1,
                completedLevels: parsed.completedLevels || [],
            };
        }
    } catch (e) {
        // Corrupted data, reset
    }
    return { ...DEFAULT_PROGRESS };
}

export function completeLevel(levelNum, totalLevels) {
    const progress = getProgress();
    if (!progress.completedLevels.includes(levelNum)) {
        progress.completedLevels.push(levelNum);
    }
    // Unlock next level
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
