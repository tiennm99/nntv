<script>
    import { fade } from 'svelte/transition';
    import { initLanguage } from './lib/localization.js';
    import MainMenu from './scenes/MainMenu.svelte';
    import StoryIntro from './scenes/StoryIntro.svelte';
    import LevelIntro from './scenes/LevelIntro.svelte';
    import LevelSelect from './scenes/LevelSelect.svelte';
    import Game from './scenes/Game.svelte';
    import GameOver from './scenes/GameOver.svelte';
    import Settings from './scenes/Settings.svelte';
    import Guide from './scenes/Guide.svelte';

    // Initialize language from localStorage
    initLanguage();

    let currentScene = $state('MainMenu');
    let sceneData = $state({});

    function navigate(scene, data = {}) {
        sceneData = data;
        currentScene = scene;
    }
</script>

<div class="game-container">
    {#key currentScene}
        <div class="scene" transition:fade={{ duration: 250 }}>
            {#if currentScene === 'MainMenu'}
                <MainMenu {navigate} />
            {:else if currentScene === 'StoryIntro'}
                <StoryIntro {navigate} />
            {:else if currentScene === 'LevelIntro'}
                <LevelIntro {navigate} level={sceneData.level} lives={sceneData.lives} />
            {:else if currentScene === 'LevelSelect'}
                <LevelSelect {navigate} />
            {:else if currentScene === 'Game'}
                <Game {navigate} level={sceneData.level} lives={sceneData.lives} />
            {:else if currentScene === 'GameOver'}
                <GameOver {navigate} level={sceneData.level} isLastLevel={sceneData.isLastLevel} />
            {:else if currentScene === 'Settings'}
                <Settings {navigate} />
            {:else if currentScene === 'Guide'}
                <Guide {navigate} />
            {/if}
        </div>
    {/key}
</div>

<style>
    .game-container {
        width: 100%;
        height: 100%;
        position: relative;
        overflow: hidden;
        background: var(--bg-dark);
    }
    .scene {
        position: absolute;
        inset: 0;
    }
</style>
