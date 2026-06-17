<script>
    import { getText } from '../lib/localization.js';
    import Button from '../components/Button.svelte';
    import Pixel from '../lib/pixel/Pixel.svelte';
    import { MOON_ART, MOON_PAL } from '../lib/pixel/art-ui.js';
    import { GENERATED_CHARACTERS } from '../lib/generated-assets.js';
    let { navigate } = $props();

    const stars = Array.from({ length: 40 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        opacity: 0.1 + Math.random() * 0.5,
        size: 1 + Math.floor(Math.random() * 2),
    }));
</script>

<div class="menu">
    <div class="scene-backdrop">
        <img src="assets/scene-menu.png" alt="" draggable="false" />
    </div>

    {#each stars as star}
        <div
            class="star"
            style="left: {star.x}%; top: {star.y}%; opacity: {star.opacity}; width: {star.size}px; height: {star.size}px;"
        ></div>
    {/each}

    <div class="moon">
        <Pixel art={MOON_ART} palette={MOON_PAL} width={100} height={100} />
    </div>

    <h1>{getText('gameTitle')}</h1>
    <div class="hero">
        <img src={GENERATED_CHARACTERS.player} alt="" draggable="false" />
    </div>

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
    .scene-backdrop {
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 192px;
        opacity: 0.55;
        pointer-events: none;
        z-index: 0;
        overflow: hidden;
    }
    .scene-backdrop img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        image-rendering: pixelated;
    }
    .star {
        position: absolute;
        background: white;
        border-radius: 50%;
        pointer-events: none;
    }
    .moon {
        position: absolute;
        top: 40px;
        right: 60px;
        filter: drop-shadow(0 0 24px rgba(255, 232, 138, 0.3));
    }
    h1 {
        font: var(--font-title);
        color: var(--text-title);
        margin-bottom: 16px;
        z-index: 1;
        text-shadow: 0 0 12px rgba(187, 134, 252, 0.4);
    }
    .hero {
        margin-bottom: 24px;
        z-index: 1;
        filter: drop-shadow(0 4px 12px rgba(83, 52, 131, 0.6));
    }
    .hero img {
        width: 108px;
        height: 108px;
        object-fit: contain;
        image-rendering: pixelated;
    }
    .buttons {
        display: flex; flex-direction: column;
        gap: 12px; z-index: 1;
    }
</style>
