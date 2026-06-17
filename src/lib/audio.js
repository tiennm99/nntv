// Procedural audio system using Web Audio API
// Lazy AudioContext creation to comply with browser autoplay policy

import { setSfxMuted as persistSfxMuted, isSfxMuted } from './bgm.js';

let audioCtx = null;
let masterGain = null;
// muted mirrors bgm.js's sfxMuted at boot. Source of truth lives in bgm.js
// so that BGM and SFX mute settings are kept in sync across the app.
let muted = false;
try { muted = isSfxMuted(); } catch (_) { /* bgm.js requires localStorage; ignore during SSR */ }

function getContext() {
    if (!audioCtx) {
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            masterGain = audioCtx.createGain();
            masterGain.gain.value = 0.3;
            masterGain.connect(audioCtx.destination);
        } catch (e) { return null; }
    }
    if (audioCtx.state === 'suspended') {
        // Resume returns a Promise — swallow rejections so we don't emit
        // unhandled-rejection warnings on browsers that block autoplay.
        audioCtx.resume().catch(() => {});
    }
    return audioCtx;
}

function playTone(freq, duration, type = 'sine', volume = 1) {
    if (muted) return;
    const ctx = getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = volume * 0.3;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
}

// Short soft tone for player movement
export function playMove() {
    playTone(220, 0.06, 'sine', 0.4);
}

// Quieter tick for wait action
export function playWait() {
    playTone(160, 0.04, 'sine', 0.2);
}

// Harsh alarm for detection
export function playDetection() {
    if (muted) return;
    const ctx = getContext();
    if (!ctx) return;
    [400, 600].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.value = freq;
        gain.gain.value = 0.15;
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(ctx.currentTime + i * 0.05);
        osc.stop(ctx.currentTime + 0.3);
    });
}

// Ascending three-note jingle for level completion
export function playLevelComplete() {
    if (muted) return;
    const notes = [330, 440, 660];
    notes.forEach((freq, i) => {
        setTimeout(() => playTone(freq, 0.15, 'sine', 0.5), i * 120);
    });
}

// Short click for UI interactions
export function playClick() {
    playTone(800, 0.02, 'square', 0.15);
}

// Undo sound — descending short tone
export function playUndo() {
    playTone(300, 0.05, 'triangle', 0.3);
}

// Stone throw — short whoosh: sine sweep 800→200 Hz, 100ms
export function playStoneThrow() {
    if (muted) return;
    const ctx = getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
}

// Stone impact — short thud: noise burst through lowpass filter, 50ms
export function playStoneImpact() {
    if (muted) return;
    const ctx = getContext();
    if (!ctx) return;
    // White-noise buffer (0.05 s)
    const bufLen = Math.ceil(ctx.sampleRate * 0.05);
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 280;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    src.start(ctx.currentTime);
    src.stop(ctx.currentTime + 0.05);
}

// Key pickup — bright triangle pluck at 1200 Hz, 150ms
export function playKeyPickup() {
    if (muted) return;
    const ctx = getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = 1200;
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
}

// Door unlock — square click (400 Hz) + minor third (480 Hz), 250ms
export function playDoorUnlock() {
    if (muted) return;
    const ctx = getContext();
    if (!ctx) return;
    [400, 480].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(ctx.currentTime + i * 0.04);
        osc.stop(ctx.currentTime + 0.25);
    });
}

// Suspicion tier 0→1 alert — sawtooth 600 Hz, 200ms
export function playSuspicionAlert() {
    if (muted) return;
    const ctx = getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = 600;
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
}

// Suspicion tier 2 firing — sine wobble 800→1200 Hz, 400ms
export function playSuspicionFire() {
    if (muted) return;
    const ctx = getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.2);
    osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
}

export function setMuted(value) {
    muted = value;
    try { persistSfxMuted(value); } catch (_) { /* ignore */ }
}

export function isMuted() {
    // Always re-read from bgm.js so that changes elsewhere (Settings, etc.) propagate.
    try { return isSfxMuted(); } catch (_) { return muted; }
}
