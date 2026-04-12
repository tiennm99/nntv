<script>
    import { fade } from 'svelte/transition';
    import { getText } from '../lib/localization.js';
    import Button from './Button.svelte';
    let { onplayagain } = $props();
</script>

<div class="overlay" transition:fade={{ duration: 200 }}>
    <div class="popup">
        <h2>{getText('detected')}</h2>
        <Button text={getText('playAgain')} onclick={onplayagain} />
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
</style>
