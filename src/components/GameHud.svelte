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
          stonesLeft = 0, showStones = false, canThrow = false,
          keysHeld = 0, showKeys = false,
          hintTiersAvailable = 0, hintsShown = false,
          ontogglepreview, onpause, onmenu, onundo, onshowcontrols,
          onenterthrow, onshowhint } = $props();
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
        <span class="turns">{getText('turnsLabel')}: {turns}</span>
        {#if !allowUndo}
            <span class="affordance-chip" title={getText('banner.noUndo')}>{getText('chip.noUndo')}</span>
        {/if}
        {#if !allowPreview}
            <span class="affordance-chip" title={getText('banner.noPreview')}>{getText('chip.noPreview')}</span>
        {/if}
        {#if showStones}
            {#if canThrow}
                <!-- On-screen entry point for throw-targeting — the only way a
                     touch-only player can reach it (E key has no on-screen
                     equivalent otherwise). -->
                <button class="stones-btn" onclick={onenterthrow} aria-label={getText('throw.enter')}>
                    <StonesCounter {stonesLeft} />
                </button>
            {:else}
                <StonesCounter {stonesLeft} />
            {/if}
        {/if}
        {#if showKeys}
            <KeyInventory {keysHeld} />
        {/if}
    </div>
    <div class="hud-right">
        <span class="level-label">{getText('level')}{level}</span>
        {#if hintTiersAvailable > 0}
            <button class="icon-btn hint-btn" class:active={hintsShown} onclick={onshowhint} aria-label={getText('hint.button')}>
                {getText('hint.button')}
            </button>
        {/if}
        {#if allowUndo}
            <button class="icon-btn" onclick={onundo} disabled={!canUndo} aria-label={getText('controlUndo')}>
                <Pixel art={ICON_UNDO} palette={ICON_PAL} width={20} height={20} />
            </button>
        {/if}
        <Button text={muted ? getText('muted') : getText('sound')} onclick={toggleMute} small />
        {#if allowPreview}
            <button class="icon-btn" class:active={showPreview} onclick={ontogglepreview} aria-label={getText('controlPreview')}>
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
        /* Minimum comfortable touch target (WCAG 2.5.5 / Apple HIG) */
        min-width: 44px;
        min-height: 44px;
    }
    .icon-btn:hover:not(:disabled) { background: var(--btn-hover); }
    .icon-btn:disabled { opacity: 0.4; cursor: default; }
    .icon-btn.active { background: var(--btn-hover); border-color: var(--text-accent); }
    .hint-btn {
        font: var(--font-small);
        color: #ffdd44;
        border-color: #ffdd44;
        padding: 4px 10px;
        width: auto;
    }
    .stones-btn {
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        display: flex;
        align-items: center;
        min-height: 44px;
    }
    .affordance-chip {
        font: var(--font-small);
        color: #ffaa44;
        background: rgba(200, 120, 0, 0.2);
        border: 1px solid rgba(200, 120, 0, 0.5);
        border-radius: 3px;
        padding: 2px 6px;
        white-space: nowrap;
    }
</style>
