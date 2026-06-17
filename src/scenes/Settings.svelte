<script>
    import { getText, setLanguage, getLanguage } from '../lib/localization.js';
    import Button from '../components/Button.svelte';
    import {
        getSettings, setBgmVolume, setBgmMuted, setSfxMuted,
        isBgmMuted, isSfxMuted,
    } from '../lib/bgm.js';
    let { navigate } = $props();
    let lang = $state(getLanguage());
    let tick = $state(0); // re-render on language change

    // Reactive local copies of audio settings — re-derive whenever the global changes.
    let sfxOff = $derived((tick, isSfxMuted()));
    let bgmOff = $derived((tick, isBgmMuted()));
    let bgmVol = $derived((tick, getSettings().bgmVolume));

    function changeLang(l) {
        if (lang !== l) {
            setLanguage(l);
            lang = l;
            tick++;
        }
    }

    function toggleSfx() {
        setSfxMuted(!sfxOff);
        tick++;
    }

    function toggleBgm() {
        setBgmMuted(!bgmOff);
        tick++;
    }

    function onVolume(e) {
        const v = Number(e.target.value);
        setBgmVolume(v);
        tick++;
    }
</script>

{#key tick}
<div class="settings">
    <div class="scene-backdrop">
        <img src="assets/scene-settings.png" alt="" draggable="false" />
    </div>
    <h1>{getText('settings')}</h1>

    <p class="label">{getText('languageSettings')}</p>
    <div class="lang-buttons">
        <button class="lang-btn" class:active={lang === 'en'} onclick={() => changeLang('en')}>
            {getText('english')}
        </button>
        <button class="lang-btn" class:active={lang === 'vi'} onclick={() => changeLang('vi')}>
            {getText('vietnamese')}
        </button>
    </div>

    <p class="label">{getText('audioSettings')}</p>
    <div class="audio-row">
        <span class="audio-label">{getText('sfxLabel')}</span>
        <button class="lang-btn" class:active={!sfxOff} onclick={toggleSfx}>
            {sfxOff ? getText('off') : getText('on')}
        </button>
    </div>
    <div class="audio-row">
        <span class="audio-label">{getText('bgmLabel')}</span>
        <button class="lang-btn" class:active={!bgmOff} onclick={toggleBgm}>
            {bgmOff ? getText('off') : getText('on')}
        </button>
    </div>
    <div class="audio-row volume-row" class:disabled={bgmOff}>
        <span class="audio-label">{getText('volumeLabel')}</span>
        <input
            class="volume-slider"
            type="range"
            min="0"
            max="100"
            value={Math.round(bgmVol * 100)}
            oninput={onVolume}
            disabled={bgmOff}
            aria-label={getText('volumeLabel')}
        />
        <span class="volume-num">{Math.round(bgmVol * 100)}</span>
    </div>

    <Button text={getText('back')} onclick={() => navigate('MainMenu')} />
</div>
{/key}

<style>
    .settings {
        width: 100%; height: 100%;
        display: flex; flex-direction: column;
        justify-content: center; align-items: center;
        gap: 16px;
        background: var(--bg-dark);
        padding: 24px;
        position: relative;
        overflow: hidden;
    }
    .scene-backdrop {
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 192px;
        opacity: 0.5;
        pointer-events: none;
        z-index: 0;
        overflow: hidden;
    }
    .scene-backdrop img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        image-rendering: pixelated;
    }
    h1, .label, .lang-buttons, .audio-row, .settings :global(button) { position: relative; z-index: 1; }
    h1 { font: var(--font-title); color: var(--text-title); }
    .label { font: var(--font-body); color: var(--text-secondary); margin-top: 8px; }
    .lang-buttons { display: flex; gap: 16px; }
    .audio-row {
        display: flex; align-items: center; gap: 12px;
        font: var(--font-ui); color: var(--text-primary);
        min-width: 320px; justify-content: space-between;
    }
    .audio-row.disabled { opacity: 0.5; }
    .audio-label { flex: 0 0 120px; text-align: left; }
    .lang-btn {
        font: var(--font-button-small);
        color: var(--text-primary);
        background: var(--btn-default);
        border: 2px solid var(--btn-border);
        border-radius: 4px;
        padding: 6px 18px;
        cursor: pointer;
        transition: background 0.15s;
    }
    .lang-btn:hover { background: var(--btn-hover); }
    .lang-btn.active { background: var(--btn-hover); border-color: var(--text-accent); }
    .volume-row { padding-top: 4px; }
    .volume-slider {
        flex: 1;
        accent-color: var(--text-accent);
        cursor: pointer;
    }
    .volume-slider:disabled { cursor: not-allowed; }
    .volume-num {
        flex: 0 0 32px;
        text-align: right;
        color: var(--text-secondary);
        font: var(--font-small);
    }
</style>
