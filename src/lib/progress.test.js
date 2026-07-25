import { describe, it, expect, beforeEach } from 'vitest';
import {
    getProgress, completeLevel, calculateStars,
    recordDetection, getAttempts, getUnlockedHintTiers,
    isMercyEligible, mercySkipLevel, HINT_THRESHOLDS, MERCY_THRESHOLD,
} from './progress.js';

// Minimal in-memory localStorage stand-in — vitest's default (node) environment
// has no localStorage global, and progress.js talks to it directly.
function makeMemoryStorage() {
    const store = new Map();
    return {
        getItem: (k) => (store.has(k) ? store.get(k) : null),
        setItem: (k, v) => store.set(k, String(v)),
        removeItem: (k) => store.delete(k),
        clear: () => store.clear(),
    };
}

describe('progress.js — attempt tracking and mercy unlock', () => {
    beforeEach(() => {
        globalThis.localStorage = makeMemoryStorage();
    });

    it('starts a level with zero attempts', () => {
        expect(getAttempts(4)).toBe(0);
        expect(getUnlockedHintTiers(4)).toBe(0);
        expect(isMercyEligible(4)).toBe(false);
    });

    it('increments and persists attempts across recordDetection calls', () => {
        expect(recordDetection(4)).toBe(1);
        expect(recordDetection(4)).toBe(2);
        expect(getAttempts(4)).toBe(2);
        // A different level tracks independently
        expect(getAttempts(5)).toBe(0);
    });

    it('unlocks hint tiers at the configured thresholds, escalating', () => {
        expect(HINT_THRESHOLDS).toEqual([3, 5, 7]);
        for (let i = 0; i < HINT_THRESHOLDS[0]; i++) recordDetection(4);
        expect(getUnlockedHintTiers(4)).toBe(1);
        for (let i = 0; i < HINT_THRESHOLDS[1] - HINT_THRESHOLDS[0]; i++) recordDetection(4);
        expect(getUnlockedHintTiers(4)).toBe(2);
        for (let i = 0; i < HINT_THRESHOLDS[2] - HINT_THRESHOLDS[1]; i++) recordDetection(4);
        expect(getUnlockedHintTiers(4)).toBe(3);
    });

    it('becomes mercy-eligible only at the mercy threshold', () => {
        for (let i = 0; i < MERCY_THRESHOLD - 1; i++) recordDetection(7);
        expect(isMercyEligible(7)).toBe(false);
        recordDetection(7);
        expect(isMercyEligible(7)).toBe(true);
    });

    it('mercySkipLevel unlocks the next level and marks the current one skipped', () => {
        for (let i = 0; i < MERCY_THRESHOLD; i++) recordDetection(7);
        const progress = mercySkipLevel(7, 11);
        expect(progress.skippedLevels).toContain(7);
        expect(progress.maxLevel).toBeGreaterThanOrEqual(8);
    });

    it('mercySkipLevel never unlocks past the total level count', () => {
        const progress = mercySkipLevel(11, 11);
        expect(progress.maxLevel).toBe(11);
    });

    it('mercySkipLevel is a no-op for an already-completed level', () => {
        completeLevel(3, 11, 20, 20);
        const before = getProgress();
        const after = mercySkipLevel(3, 11);
        expect(after.skippedLevels).not.toContain(3);
        expect(after.maxLevel).toBe(before.maxLevel);
    });

    it('completing a level resets its attempt streak and clears a skip mark', () => {
        for (let i = 0; i < MERCY_THRESHOLD; i++) recordDetection(4);
        mercySkipLevel(4, 11);
        expect(getProgress().skippedLevels).toContain(4);

        completeLevel(4, 11, 15, 20);
        const progress = getProgress();
        expect(getAttempts(4)).toBe(0);
        expect(progress.skippedLevels).not.toContain(4);
        expect(progress.completedLevels).toContain(4);
    });

    it('calculateStars still ranks 3/2/1 stars correctly (unchanged behavior)', () => {
        expect(calculateStars(20, 20)).toBe(3);
        expect(calculateStars(22, 20)).toBe(2);
        expect(calculateStars(30, 20)).toBe(1);
    });

    it('survives a localStorage that throws on every call (private-mode guard)', () => {
        globalThis.localStorage = {
            getItem() { throw new Error('blocked'); },
            setItem() { throw new Error('blocked'); },
        };
        // Persistence is impossible, so each call resolves against a fresh
        // in-memory default rather than crashing or silently no-op'ing.
        expect(recordDetection(2)).toBe(1);
        expect(() => mercySkipLevel(2, 11)).not.toThrow();
        // Without persistence, state cannot survive between separate calls —
        // this asserts the *fallback* is fresh defaults, not a shared/leaking
        // object across levels or calls (a bug this guards against).
        expect(getAttempts(3)).toBe(0);
    });
});
