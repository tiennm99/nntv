// BGM (background music) manager.
// Uses an HTMLAudioElement per active track, with a crossfade between tracks.
// All state persists to localStorage so the user's volume / mute choice survives reloads.
//
// Why HTMLAudioElement (not Web Audio API): the BGM files are pre-rendered MP3s, so we
// just need simple looped playback with gain. Web Audio is reserved for procedural SFX
// (see audio.js). The two systems share a single mute toggle via setMutedAll().

const STORAGE_KEY = 'nntv-audio-settings';
const DEFAULT = { sfxMuted: false, bgmMuted: false, bgmVolume: 0.6 };

let settings = loadSettings();

// When autoplay is blocked (browsers require a user gesture), we remember the
// intended track and replay it as soon as the user clicks / presses a key.
let pendingPlay = null;

function loadSettings() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            return {
                sfxMuted: !!parsed.sfxMuted,
                bgmMuted: !!parsed.bgmMuted,
                bgmVolume: typeof parsed.bgmVolume === 'number'
                    ? Math.max(0, Math.min(1, parsed.bgmVolume))
                    : DEFAULT.bgmVolume,
            };
        }
    } catch (_) {
        // localStorage may be unavailable (SSR, private mode) — fall through to defaults
    }
    return { ...DEFAULT };
}

function persist() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (_) {
        // ignore
    }
}

// Active BGM audio elements. We keep two slots so we can crossfade between them.
let current = null; // { audio, url, gainNode? } — currently audible
let fading = null;  // { audio, url, gainNode, raf } — being faded out
let activeTrack = null; // url of the track the scene router asked for

// Track → file URL map. Update this when adding new BGM.
const BGM_TRACKS = {
    menu:     'assets/audio/bgm-menu.mp3',
    story:    'assets/audio/bgm-story.mp3',
    levels:   'assets/audio/bgm-levels.mp3',
    chamber:  'assets/audio/bgm-chamber.mp3',
    gameover: 'assets/audio/bgm-gameover.mp3',
};

export function getBgmTrackUrl(name) {
    return BGM_TRACKS[name] || null;
}

export function listBgmTracks() {
    return Object.keys(BGM_TRACKS);
}

function effectiveVolume() {
    return settings.bgmMuted ? 0 : settings.bgmVolume;
}

function makeAudio(url) {
    const a = new Audio(url);
    a.loop = true;
    a.preload = 'auto';
    a.volume = 0; // start silent, fade in
    return a;
}

function cancelFade(entry) {
    if (!entry) return;
    if (entry.raf) cancelAnimationFrame(entry.raf);
    if (entry.audio) {
        try { entry.audio.pause(); } catch (_) {}
        entry.audio.src = '';
    }
}

function fadeIn(audio, targetVolume, durationMs = 600) {
    if (settings.bgmMuted) targetVolume = 0;
    const start = performance.now();
    function step(now) {
        const t = Math.min(1, (now - start) / durationMs);
        audio.volume = targetVolume * t;
        if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

function fadeOut(audio, durationMs = 600) {
    const startVolume = audio.volume;
    const start = performance.now();
    let raf;
    function step(now) {
        const t = Math.min(1, (now - start) / durationMs);
        audio.volume = startVolume * (1 - t);
        if (t < 1) {
            raf = requestAnimationFrame(step);
        } else {
            try { audio.pause(); } catch (_) {}
            audio.src = '';
        }
    }
    raf = requestAnimationFrame(step);
}

/**
 * Switch the active BGM to a named track, with a crossfade.
 * Calling with the same track name as currently active is a no-op.
 * Pass `null` to fade out and stop.
 */
export async function playBgm(trackName, { fadeMs = 600 } = {}) {
    const url = trackName ? BGM_TRACKS[trackName] : null;
    if (url === activeTrack) return; // already playing

    if (fading) {
        cancelFade(fading);
        fading = null;
    }

    if (!url) {
        activeTrack = null;
        // Fade out current, then drop
        if (current) {
            const c = current;
            current = null;
            fadeOut(c.audio, fadeMs);
            fading = c;
        }
        return;
    }

    const next = makeAudio(url);
    try {
        await next.play();
    } catch (e) {
        // Autoplay blocked — wait for first user interaction. Do NOT mark
        // this track as active: if we did, the gesture-triggered retry below
        // would hit the early-return above and silently never call play().
        pendingPlay = trackName;
        return;
    }
    activeTrack = url;
    fadeIn(next, effectiveVolume(), fadeMs);

    if (current) {
        const prev = current;
        current = { audio: next, url };
        fadeOut(prev.audio, fadeMs);
        fading = prev;
    } else {
        current = { audio: next, url };
    }
}

// Retry playBgm after first user interaction if autoplay was blocked.
function installUserGestureRetry() {
    if (typeof window === 'undefined') return;
    const handler = () => {
        if (pendingPlay) {
            const p = pendingPlay;
            pendingPlay = null;
            playBgm(p);
        }
        window.removeEventListener('pointerdown', handler);
        window.removeEventListener('keydown', handler);
    };
    window.addEventListener('pointerdown', handler, { once: true });
    window.addEventListener('keydown', handler, { once: true });
}
installUserGestureRetry();

export function stopBgm(opts = {}) {
    return playBgm(null, opts);
}

export function getSettings() {
    return { ...settings };
}

export function setBgmVolume(vol) {
    settings.bgmVolume = Math.max(0, Math.min(1, vol));
    persist();
    if (current && !settings.bgmMuted) {
        current.audio.volume = settings.bgmVolume;
    }
}

export function setBgmMuted(muted) {
    settings.bgmMuted = !!muted;
    persist();
    if (current) {
        if (settings.bgmMuted) {
            current.audio.volume = 0;
        } else {
            current.audio.volume = settings.bgmVolume;
        }
    }
}

export function setSfxMuted(muted) {
    settings.sfxMuted = !!muted;
    persist();
}

// Convenience: when the user toggles SFX, we want to also expose the BGM dim separately.
// This function applies both states — used by the GameHud SND/MUTE button.
export function setMasterMuted(muted) {
    setSfxMuted(muted);
    setBgmMuted(muted);
}

export function isBgmMuted() { return settings.bgmMuted; }
export function isSfxMuted() { return settings.sfxMuted; }
