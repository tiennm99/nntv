<script>
    import { getText } from '../lib/localization.js';
    import Button from '../components/Button.svelte';
    import { GENERATED_CHARACTERS, GENERATED_SCENES } from '../lib/generated-assets.js';

    // flow: 'runComplete' (L11 cleared) | 'bittersweet' (L12 reached goal)
    let { navigate, level = 1, flow = 'runComplete' } = $props();

    let isRunComplete = $derived(flow === 'runComplete');

    let title = $derived(isRunComplete ? getText('gameOver.runComplete') : getText('theEnd'));
    let desc = $derived(isRunComplete ? getText('gameOver.runCompleteBody') : getText('ninjaFailed'));
</script>

<div class="gameover">
    <img class="gameover-bg" src={isRunComplete ? GENERATED_SCENES[10] : GENERATED_SCENES[11]} alt="" draggable="false" />
    {#if !isRunComplete}
        <img class="princess" src={GENERATED_CHARACTERS.princess} alt="" draggable="false" />
    {/if}
    <h1 class:accent={isRunComplete} class:bittersweet={!isRunComplete}>{title}</h1>
    <p>{desc}</p>
    <div class="buttons">
        <Button text={getText('mainMenu')} onclick={() => navigate('MainMenu')} />
        {#if isRunComplete}
            <Button text={getText('levelSelect')} onclick={() => navigate('LevelSelect')} />
        {/if}
    </div>
</div>

<style>
    .gameover {
        width: 100%; height: 100%;
        display: flex; flex-direction: column;
        justify-content: center; align-items: center;
        gap: 24px;
        background: var(--bg-dark);
        position: relative;
        overflow: hidden;
    }
    .gameover-bg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        opacity: 0.28;
        image-rendering: pixelated;
    }
    .princess {
        width: 108px;
        height: 108px;
        object-fit: contain;
        image-rendering: pixelated;
        filter: drop-shadow(0 0 18px rgba(255, 234, 0, 0.55));
        z-index: 1;
    }
    h1 { font: bold 48px Arial, sans-serif; }
    h1.accent { color: var(--text-accent); }
    h1.bittersweet { color: var(--text-danger); }
    p {
        font: var(--font-body);
        color: var(--text-secondary);
        text-align: center;
        max-width: 70%;
        white-space: pre-line;
        z-index: 1;
    }
    h1 { z-index: 1; }
    .buttons { display: flex; flex-direction: column; gap: 12px; z-index: 1; }
</style>
