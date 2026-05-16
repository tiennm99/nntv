<script>
    import { getText } from '../lib/localization.js';
    import { LEVELS } from '../lib/levels/levels.js';
    import Button from '../components/Button.svelte';
    import AffordanceBanner from '../components/AffordanceBanner.svelte';
    import { generatedSceneForLevel } from '../lib/generated-assets.js';
    let { navigate, level = 1 } = $props();

    let levelData = $derived(LEVELS[level - 1]);
    let levelName = $derived(levelData?.name || `Level ${level}`);
    let storyText = $derived(levelData?.storyKey ? getText(levelData.storyKey) : '');
    let scene = $derived(generatedSceneForLevel(level));

    // Affordance gates — default both enabled until phase 04 populates levels.js
    let affordances = $derived(levelData?.affordances ?? { undo: true, preview: true });
</script>

<div class="intro">
    <div class="backdrop">
        <img src={scene} alt="" draggable="false" />
    </div>
    <div class="foreground">
        <span class="level-num">{getText('level')}{level}</span>
        <h1>{levelName}</h1>
        {#if storyText}
            <p class="story">{storyText}</p>
        {/if}
        <AffordanceBanner undo={affordances.undo} preview={affordances.preview} />
        <Button text={getText('continue')} onclick={() => navigate('Game', { level })} />
    </div>
</div>

<style>
    .intro {
        width: 100%; height: 100%;
        position: relative;
        background: var(--bg-dark);
        overflow: hidden;
    }
    .backdrop {
        position: absolute;
        inset: 0;
        opacity: 0.55;
        pointer-events: none;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .backdrop img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        image-rendering: pixelated;
    }
    .foreground {
        position: relative;
        width: 100%; height: 100%;
        display: flex; flex-direction: column;
        justify-content: center; align-items: center;
        gap: 20px;
        background: linear-gradient(180deg,
            rgba(10,10,26,0.65) 0%,
            rgba(10,10,26,0.3) 40%,
            rgba(10,10,26,0.3) 60%,
            rgba(10,10,26,0.75) 100%);
    }
    .level-num {
        font: var(--font-small);
        color: var(--text-secondary);
    }
    h1 {
        font: var(--font-title);
        color: var(--text-title);
        text-shadow: 0 0 12px rgba(0, 0, 0, 0.8);
    }
    .story {
        font: var(--font-body);
        color: var(--text-primary);
        text-align: center;
        max-width: 70%;
        line-height: 1.6;
        white-space: pre-line;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
    }
</style>
