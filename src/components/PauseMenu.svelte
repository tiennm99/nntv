<script>
    import { fade } from 'svelte/transition';
    import { getText } from '../lib/localization.js';
    import { trapFocus } from '../lib/focus-trap.js';
    import Button from './Button.svelte';
    let { onresume, onrestart, onmainmenu, onguide } = $props();
</script>

<div class="overlay" transition:fade={{ duration: 200 }} use:trapFocus role="dialog" aria-modal="true" aria-labelledby="pause-title">
    <div class="popup">
        <h2 id="pause-title">{getText('paused')}</h2>
        <Button text={getText('resume')} onclick={onresume} autofocus />
        <Button text={getText('restartLevel')} onclick={onrestart} />
        {#if onguide}
            <Button text={getText('guide')} onclick={onguide} />
        {/if}
        <Button text={getText('mainMenu')} onclick={onmainmenu} />
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
        padding: 32px 40px;
        border-radius: 8px;
    }
    h2 {
        font: var(--font-heading);
        color: var(--text-title);
        margin-bottom: 8px;
    }
</style>
