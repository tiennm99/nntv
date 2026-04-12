<script>
    import { getText } from '../lib/localization.js';
    import Button from '../components/Button.svelte';
    let { navigate, level = 1, isLastLevel = false } = $props();

    let title = $derived(isLastLevel ? getText('theEnd') : getText('gameOver'));
    let desc = $derived(isLastLevel ? getText('ninjaFailed') : getText('caughtInLight'));
</script>

<div class="gameover">
    <h1 class:accent={isLastLevel} class:danger={!isLastLevel}>{title}</h1>
    <p>{desc}</p>
    <div class="buttons">
        <Button text={getText('tryAgain')} onclick={() => {
            if (isLastLevel) navigate('MainMenu');
            else navigate('Game', { level, lives: 3 });
        }} />
        <Button text={getText('mainMenu')} onclick={() => navigate('MainMenu')} />
    </div>
</div>

<style>
    .gameover {
        width: 100%; height: 100%;
        display: flex; flex-direction: column;
        justify-content: center; align-items: center;
        gap: 24px;
        background: var(--bg-dark);
    }
    h1 { font: bold 48px Arial, sans-serif; }
    h1.accent { color: var(--text-accent); }
    h1.danger { color: var(--text-danger); }
    p {
        font: var(--font-body);
        color: var(--text-secondary);
        text-align: center;
        max-width: 70%;
        white-space: pre-line;
    }
    .buttons { display: flex; flex-direction: column; gap: 12px; }
</style>
