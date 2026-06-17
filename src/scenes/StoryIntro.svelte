<script>
    import { onMount } from 'svelte';
    import { getText } from '../lib/localization.js';
    import Button from '../components/Button.svelte';
    let { navigate } = $props();
    let scrollDone = $state(false);

    onMount(() => {
        const el = document.querySelector('.story-scroll');
        if (el) {
            el.addEventListener('animationend', () => {
                if (!scrollDone) { scrollDone = true; navigate('LevelIntro', { level: 1 }); }
            });
        }
    });

    function skip() {
        if (!scrollDone) { scrollDone = true; navigate('LevelIntro', { level: 1 }); }
    }
</script>

<div class="intro">
    <div class="scene-backdrop">
        <img src="assets/scene-story.png" alt="" draggable="false" />
    </div>
    <h2>{getText('storyTitle')}</h2>
    <div class="scroll-area">
        <p class="story-scroll">{getText('storyText')}</p>
    </div>
    <div class="skip-btn">
        <Button text={getText('skip')} onclick={skip} small />
    </div>
</div>

<style>
    .intro {
        width: 100%; height: 100%;
        display: flex; flex-direction: column;
        align-items: center;
        background: var(--bg-dark);
        position: relative;
        overflow: hidden;
    }
    .scene-backdrop {
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 192px;
        opacity: 0.5;
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
    h2, .scroll-area, .skip-btn { position: relative; z-index: 1; }
    h2 {
        font: var(--font-title);
        color: var(--text-accent);
        margin-top: 60px;
        z-index: 1;
    }
    .scroll-area {
        flex: 1;
        width: 80%;
        overflow: hidden;
        position: relative;
        margin-top: 20px;
    }
    .story-scroll {
        font: var(--font-body);
        color: var(--text-primary);
        text-align: center;
        white-space: pre-line;
        line-height: 1.6;
        position: absolute;
        top: 100%;
        animation: scroll-up 30s linear forwards;
    }
    @keyframes scroll-up {
        from { top: 100%; }
        to { top: -200%; }
    }
    .skip-btn {
        position: absolute;
        bottom: 24px; right: 24px;
        z-index: 2;
    }
</style>
