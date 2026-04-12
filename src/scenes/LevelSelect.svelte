<script>
    import { getText } from '../lib/localization.js';
    import { getProgress } from '../lib/progress.js';
    import Button from '../components/Button.svelte';
    let { navigate } = $props();

    const totalLevels = 12;
    let progress = $state(getProgress());

    function selectLevel(num) {
        if (num <= progress.maxLevel) {
            navigate('LevelIntro', { level: num, lives: 3 });
        }
    }
</script>

<div class="select">
    <h1>{getText('levelSelectTitle')}</h1>

    <div class="grid">
        {#each Array(totalLevels) as _, i}
            {@const num = i + 1}
            {@const unlocked = num <= progress.maxLevel}
            {@const completed = progress.completedLevels.includes(num)}
            <button
                class="level-btn"
                class:unlocked
                class:completed
                class:locked={!unlocked}
                onclick={() => selectLevel(num)}
                disabled={!unlocked}
            >
                {num}
                {#if completed}<span class="check">✓</span>{/if}
            </button>
        {/each}
    </div>

    <Button text={getText('back')} onclick={() => navigate('MainMenu')} />
</div>

<style>
    .select {
        width: 100%; height: 100%;
        display: flex; flex-direction: column;
        justify-content: center; align-items: center;
        gap: 24px;
        background: var(--bg-dark);
    }
    h1 { font: var(--font-title); color: var(--text-title); }
    .grid {
        display: grid;
        grid-template-columns: repeat(4, 70px);
        gap: 20px;
    }
    .level-btn {
        width: 70px; height: 70px;
        font: var(--font-button);
        border-radius: 4px;
        border: 2px solid var(--btn-border);
        cursor: pointer;
        position: relative;
        transition: background 0.15s;
    }
    .level-btn.unlocked {
        background: var(--btn-default);
        color: var(--text-primary);
    }
    .level-btn.unlocked:hover { background: var(--btn-hover); }
    .level-btn.completed { border-color: var(--grid-goal); }
    .level-btn.locked {
        background: #111122;
        color: #555566;
        border-color: #333344;
        cursor: default;
    }
    .check {
        position: absolute;
        top: 2px; right: 4px;
        font-size: 12px;
        color: var(--grid-goal);
    }
</style>
