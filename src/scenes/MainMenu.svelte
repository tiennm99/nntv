<script>
    import { getText } from '../lib/localization.js';
    import Button from '../components/Button.svelte';
    let { navigate } = $props();

    // Generate starfield dots
    const stars = Array.from({ length: 40 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        opacity: 0.1 + Math.random() * 0.4,
        size: 1 + Math.floor(Math.random() * 2),
    }));
</script>

<div class="menu">
    {#each stars as star}
        <div
            class="star"
            style="left: {star.x}%; top: {star.y}%; opacity: {star.opacity}; width: {star.size}px; height: {star.size}px;"
        ></div>
    {/each}

    <h1>{getText('gameTitle')}</h1>
    <div class="ninja-icon"></div>

    <div class="buttons">
        <Button text={getText('startGame')} onclick={() => navigate('StoryIntro')} />
        <Button text={getText('levelSelect')} onclick={() => navigate('LevelSelect')} />
        <Button text={getText('guide')} onclick={() => navigate('Guide')} />
        <Button text={getText('settings')} onclick={() => navigate('Settings')} />
    </div>
</div>

<style>
    .menu {
        width: 100%; height: 100%;
        display: flex; flex-direction: column;
        justify-content: center; align-items: center;
        position: relative;
        background: var(--bg-dark);
    }
    .star {
        position: absolute;
        background: white;
        border-radius: 50%;
        pointer-events: none;
    }
    h1 {
        font: var(--font-title);
        color: var(--text-title);
        margin-bottom: 16px;
        z-index: 1;
    }
    .ninja-icon {
        width: 36px; height: 36px;
        background: var(--player-color);
        border-radius: 50%;
        margin-bottom: 32px;
        box-shadow: 0 0 20px rgba(83, 52, 131, 0.3);
        z-index: 1;
    }
    .buttons {
        display: flex; flex-direction: column;
        gap: 12px; z-index: 1;
    }
</style>
