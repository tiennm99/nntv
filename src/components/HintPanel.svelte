<script>
    // HintPanel — modal listing progressive hints for the current level.
    // Hints unlock in escalating tiers (nudge → mechanic reminder → concrete
    // next step) as the player racks up failed attempts; already-unlocked
    // tiers show their text, locked ones show a generic "keep trying" line
    // so the player knows more help is coming without spoiling it early.
    import { fade } from 'svelte/transition';
    import { getText } from '../lib/localization.js';
    import { trapFocus } from '../lib/focus-trap.js';
    import Button from './Button.svelte';

    let { hintKeys = [], unlockedTiers = 0, onclose } = $props();
</script>

<div class="overlay" transition:fade={{ duration: 200 }} use:trapFocus role="dialog" aria-modal="true" aria-labelledby="hint-title">
    <div class="popup">
        <h2 id="hint-title">{getText('hint.title')}</h2>
        <ol class="hint-list">
            {#each hintKeys as key, i (key)}
                <li class:locked={i >= unlockedTiers}>
                    {i < unlockedTiers ? getText(key) : getText('hint.locked')}
                </li>
            {/each}
        </ol>
        <Button text={getText('back')} onclick={onclose} autofocus />
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
        max-width: 420px;
    }
    h2 {
        font: var(--font-heading);
        color: #ffdd44;
        margin-bottom: 4px;
    }
    .hint-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
        width: 100%;
        padding-left: 1.25em;
    }
    .hint-list li {
        font: var(--font-small);
        color: var(--text-primary);
        line-height: 1.5;
    }
    .hint-list li.locked {
        color: var(--text-secondary);
        font-style: italic;
    }
</style>
