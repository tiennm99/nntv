<script>
    import { getText } from '../lib/localization.js';
    import Button from '../components/Button.svelte';
    let { navigate } = $props();
</script>

<div class="guide">
    <div class="scene-backdrop">
        <img src="assets/scene-guide.png" alt="" draggable="false" />
    </div>
    <h1>{getText('guideTitle')}</h1>

    <div class="content">
        <h2>{getText('levelObjectives')}</h2>
        <p>{getText('levelObjectivesContent')}</p>

        <h2>{getText('movementControls')}</h2>
        <p>{getText('movementControlsContent')}</p>

        <h2>{getText('enemyTypes')}</h2>
        <p>{getText('enemyTypesContent')}</p>

        <h2>{getText('advancedEnemyTypes')}</h2>
        <p>{getText('advancedEnemyTypesContent')}</p>

        <h2>{getText('gameTips')}</h2>
        <p>{getText('gameTipsContent')}</p>
    </div>

    <Button text={getText('back')} onclick={() => navigate('MainMenu')} />
</div>

<style>
    .guide {
        width: 100%; height: 100%;
        display: flex; flex-direction: column;
        align-items: center;
        background: var(--bg-dark);
        padding: 24px;
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
    h1, .content, .guide :global(button) { position: relative; z-index: 1; }
    h1 {
        font: var(--font-title);
        color: var(--text-title);
        margin-bottom: 16px;
    }
    .content {
        flex: 1;
        overflow-y: auto;
        width: 80%;
        padding-right: 8px;
    }
    h2 {
        font: var(--font-heading);
        color: var(--text-accent);
        margin: 16px 0 8px;
    }
    p {
        font: var(--font-small);
        color: var(--text-secondary);
        white-space: pre-line;
        line-height: 1.6;
    }
</style>
