// Procedural audio system using Web Audio API
// Lazy AudioContext creation to comply with browser autoplay policy

let audioCtx = null;
let masterGain = null;
let muted = false;

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

export function setMuted(value) {
    muted = value;
}

export function isMuted() {
    return muted;
}
