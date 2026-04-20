<script>
    import { fade } from 'svelte/transition';
    import { getText } from '../lib/localization.js';
    import Button from './Button.svelte';
    import Pixel from '../lib/pixel/Pixel.svelte';
    import { ICON_UNDO, ICON_REDO, ICON_EYE, ICON_ARROW, ICON_PAL } from '../lib/pixel/art-ui.js';
    let { onclose } = $props();
</script>

<div class="overlay" transition:fade={{ duration: 200 }}>
    <div class="popup">
        <h2>{getText('controlsTitle')}</h2>
        <div class="controls-list">
            <div class="control-row">
                <span class="icon"><Pixel art={ICON_ARROW} palette={ICON_PAL} width={20} height={20} /></span>
                <kbd>Arrow Keys</kbd><span>/ WASD — {getText('controlMove')}</span>
            </div>
            <div class="control-row">
                <kbd>Space</kbd><span>— {getText('controlWait')}</span>
            </div>
            <div class="control-row">
                <span class="icon"><Pixel art={ICON_EYE} palette={ICON_PAL} width={20} height={20} /></span>
                <kbd>V</kbd><span>— {getText('controlPreview')}</span>
            </div>
            <div class="control-row">
                <span class="icon"><Pixel art={ICON_UNDO} palette={ICON_PAL} width={20} height={20} /></span>
                <kbd>Z</kbd><span>— {getText('controlUndo')}</span>
            </div>
            <div class="control-row">
                <span class="icon"><Pixel art={ICON_REDO} palette={ICON_PAL} width={20} height={20} /></span>
                <kbd>Y</kbd><span>— {getText('controlRedo')}</span>
            </div>
            <div class="control-row"><kbd>Click</kbd><span>/ Tap — {getText('controlTap')}</span></div>
            <div class="control-row"><kbd>Swipe</kbd><span>— {getText('controlSwipe')}</span></div>
        </div>
        <Button text={getText('back')} onclick={onclose} />
    </div>
</div>

<style>
    .overlay {
        position: absolute;
        inset: 0;
        background: var(--bg-overlay);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 100;
    }
    .popup {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        border: 2px solid var(--btn-border);
        background: var(--bg-panel);
        padding: 24px 32px;
        border-radius: 8px;
        max-width: 400px;
    }
    h2 {
        font: var(--font-heading);
        color: var(--text-title);
        margin-bottom: 4px;
    }
    .controls-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 100%;
    }
    .control-row {
        display: flex;
        align-items: center;
        gap: 8px;
        font: var(--font-small);
        color: var(--text-secondary);
    }
    .icon {
        display: inline-flex;
        width: 24px;
        justify-content: center;
    }
    kbd {
        background: var(--btn-default);
        border: 1px solid var(--btn-border);
        border-radius: 3px;
        padding: 2px 6px;
        font-family: monospace;
        font-size: 12px;
        color: var(--text-primary);
        min-width: 50px;
        text-align: center;
    }
</style>
