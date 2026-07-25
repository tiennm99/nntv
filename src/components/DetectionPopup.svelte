<script>
    import { fade } from 'svelte/transition';
    import { getText } from '../lib/localization.js';
    import { trapFocus } from '../lib/focus-trap.js';
    import Button from './Button.svelte';
    // mercyEligible: shown after repeated failures on this level (see
    // progress.js MERCY_THRESHOLD). Deliberately a separate, clearly-labelled
    // button — never auto-triggered — so skipping never feels sprung on the
    // player.
    let { onplayagain, mercyEligible = false, onmercyskip } = $props();
</script>

<div class="overlay" transition:fade={{ duration: 200 }} use:trapFocus role="dialog" aria-modal="true" aria-labelledby="detected-title">
    <div class="popup">
        <h2 id="detected-title">{getText('detected')}</h2>
        <Button text={getText('playAgain')} onclick={onplayagain} autofocus />
        {#if mercyEligible}
            <div class="mercy-block">
                <p class="mercy-note">{getText('mercy.available')}</p>
                <Button text={getText('mercy.button')} onclick={onmercyskip} small />
            </div>
        {/if}
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
        gap: 24px;
    }
    h2 {
        font: var(--font-heading);
        color: var(--text-danger);
    }
    .mercy-block {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        margin-top: 4px;
        padding-top: 16px;
        border-top: 1px solid rgba(180, 130, 80, 0.4);
    }
    .mercy-note {
        font: var(--font-small);
        color: #ffaa44;
        text-align: center;
        max-width: 260px;
    }
</style>
