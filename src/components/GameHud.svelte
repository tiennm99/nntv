<script>
    import { getText } from '../lib/localization.js';
    import { isMuted, setMuted, playClick } from '../lib/audio.js';
    import { setMasterMuted } from '../lib/bgm.js';
    import Button from './Button.svelte';
    import StonesCounter from './StonesCounter.svelte';
    import KeyInventory from './KeyInventory.svelte';
    import Pixel from '../lib/pixel/Pixel.svelte';
    import { ICON_UNDO, ICON_EYE, ICON_PAUSE, ICON_PAL } from '../lib/pixel/art-ui.js';

    let { level = 1, turns = 0, showPreview = false, canUndo = false,
          allowUndo = true, allowPreview = true,
          stonesLeft = 0, showStones = false,
          keysHeld = 0, showKeys = false,
          ontogglepreview, onpause, onmenu, onundo, onshowcontrols } = $props();
    let muted = $state(isMuted());

    function toggleMute() {
        // Master mute: silences both SFX and BGM in one click. Most natural
        // behavior for an in-game "I want quiet" button.
        muted = !muted;
        setMuted(muted);
        setMasterMuted(muted);
        if (!muted) playClick();
    }
</script>

<div class="hud">
    <div class="hud-left">
        <span class="turns">Turns: {turns}</span>
        {#if showStones}
            <StonesCounter {stonesLeft} />
        {/if}
        {#if showKeys}
            <KeyInventory {keysHeld} />
        {/if}
    </div>
    <div class="hud-right">
        <span class="level-label">{getText('level')}{level}</span>
        {#if allowUndo}
            <button class="icon-btn" onclick={onundo} disabled={!canUndo} aria-label="Undo">
                <Pixel art={ICON_UNDO} palette={ICON_PAL} width={20} height={20} />
            </button>
        {/if}
        <Button text={muted ? getText('muted') : getText('sound')} onclick={toggleMute} small />
        {#if allowPreview}
            <button class="icon-btn" class:active={showPreview} onclick={ontogglepreview} aria-label="Toggle preview">
                <Pixel art={ICON_EYE} palette={ICON_PAL} width={20} height={20} />
            </button>
        {/if}
        <Button text="?" onclick={onshowcontrols} small />
        <button class="icon-btn" onclick={onpause} aria-label={getText('pause')}>
            <Pixel art={ICON_PAUSE} palette={ICON_PAL} width={20} height={20} />
        </button>
        <Button text={getText('menu')} onclick={onmenu} small />
    </div>
</div>

<style>
    .hud {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 16px;
        font: var(--font-ui);
        color: var(--text-primary);
    }
    .hud-left, .hud-right {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    .turns { color: var(--text-secondary); font: var(--font-small); }
    .level-label { font: var(--font-ui); color: var(--text-primary); }
    .icon-btn {
        background: var(--btn-default);
        border: 2px solid var(--btn-border);
        border-radius: 4px;
        padding: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.15s;
    }
    .icon-btn:hover:not(:disabled) { background: var(--btn-hover); }
    .icon-btn:disabled { opacity: 0.4; cursor: default; }
    .icon-btn.active { background: var(--btn-hover); border-color: var(--text-accent); }
</style>
