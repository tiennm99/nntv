<script>
    import { getText } from '../lib/localization.js';
    import { LEVELS } from '../lib/levels/levels.js';
    import Button from '../components/Button.svelte';
    let { navigate, level = 1, lives = 3 } = $props();

    let levelData = $derived(LEVELS[level - 1]);
    let levelName = $derived(levelData?.name || `Level ${level}`);
    let storyText = $derived(levelData?.storyKey ? getText(levelData.storyKey) : '');
</script>

<div class="intro">
    <span class="level-num">{getText('level')}{level}</span>
    <h1>{levelName}</h1>
    {#if storyText}
        <p class="story">{storyText}</p>
    {/if}
    <Button text={getText('continue')} onclick={() => navigate('Game', { level, lives })} />
</div>

<style>
    .intro {
        width: 100%; height: 100%;
        display: flex; flex-direction: column;
        justify-content: center; align-items: center;
        gap: 20px;
        background: var(--bg-dark);
    }
    .level-num {
        font: var(--font-small);
        color: var(--text-secondary);
    }
    h1 {
        font: var(--font-title);
        color: var(--text-title);
    }
    .story {
        font: var(--font-body);
        color: var(--text-primary);
        text-align: center;
        max-width: 70%;
        line-height: 1.6;
        white-space: pre-line;
    }
</style>
