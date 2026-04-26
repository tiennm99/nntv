<script>
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';
    import { getText } from './lib/localization.js';
    import { initLanguage } from './lib/localization.js';
    import { loadProgress, acknowledgeMigration, isMigrationAcknowledged } from './lib/progress.js';
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

    // Migration modal — shown once on first v2 boot if legacy save was detected
    let showMigrationModal = $state(false);

    function navigate(scene, data = {}) {
        sceneData = data;
        currentScene = scene;
    }

    onMount(() => {
        const { needsMigrationModal } = loadProgress();
        if (needsMigrationModal && !isMigrationAcknowledged()) {
            showMigrationModal = true;
        }
    });

    function dismissMigration() {
        showMigrationModal = false;
        acknowledgeMigration();
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
                <LevelIntro {navigate} level={sceneData.level} />
            {:else if currentScene === 'LevelSelect'}
                <LevelSelect {navigate} />
            {:else if currentScene === 'Game'}
                <Game {navigate} level={sceneData.level} />
            {:else if currentScene === 'GameOver'}
                <GameOver {navigate} level={sceneData.level} flow={sceneData.flow} />
            {:else if currentScene === 'Settings'}
                <Settings {navigate} />
            {:else if currentScene === 'Guide'}
                <Guide {navigate} />
            {/if}
        </div>
    {/key}

    {#if showMigrationModal}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <div class="modal-backdrop" role="presentation" onclick={dismissMigration}>
            <div class="modal" role="dialog" aria-modal="true" aria-labelledby="migration-title">
                <h2 id="migration-title">{getText('migration.title')}</h2>
                <p>{getText('migration.body')}</p>
                <button class="modal-btn" onclick={dismissMigration}>{getText('migration.dismiss')}</button>
            </div>
        </div>
    {/if}
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
    .modal-backdrop {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.72);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100;
    }
    .modal {
        background: var(--bg-dark, #0a0a1a);
        border: 2px solid var(--btn-border, #334);
        border-radius: 8px;
        padding: 32px 40px;
        max-width: 420px;
        width: 90%;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        text-align: center;
    }
    .modal h2 {
        font: var(--font-title, bold 28px Arial, sans-serif);
        color: var(--text-accent, #44ffaa);
    }
    .modal p {
        font: var(--font-body, 16px Arial, sans-serif);
        color: var(--text-primary, #ccccdd);
        line-height: 1.5;
    }
    .modal-btn {
        margin-top: 8px;
        padding: 10px 32px;
        font: var(--font-button, bold 14px Arial, sans-serif);
        background: var(--btn-default, #1a1a2e);
        color: var(--text-primary, #ccccdd);
        border: 2px solid var(--btn-border, #334);
        border-radius: 4px;
        cursor: pointer;
        transition: background 0.15s;
    }
    .modal-btn:hover { background: var(--btn-hover, #252540); }
</style>
