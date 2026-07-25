<script>
    import { getText } from '../lib/localization.js';
    import { getProgress } from '../lib/progress.js';
    import { getTotalLevels } from '../lib/game/level-manager.js';
    import Button from '../components/Button.svelte';
    let { navigate } = $props();

    const totalLevels = getTotalLevels();
    let progress = $state(getProgress());

    function selectLevel(num) {
        if (num <= progress.maxLevel) {
            navigate('LevelIntro', { level: num });
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
            {@const skipped = !completed && progress.skippedLevels.includes(num)}
            {@const stars = progress.levelStars[String(num)] || 0}
            {@const bestMoves = progress.levelBestMoves[String(num)]}
            <button
                class="level-btn"
                class:unlocked
                class:completed
                class:skipped
                class:locked={!unlocked}
                onclick={() => selectLevel(num)}
                disabled={!unlocked}
            >
                <span class="level-num">{num}</span>
                {#if completed}
                    <span class="star-row">
                        {#each [1, 2, 3] as i}
                            <span class="star-sm" class:filled={i <= stars}>&#9733;</span>
                        {/each}
                    </span>
                {:else if skipped}
                    <span class="skipped-badge" title={getText('mercy.available')}>{getText('mercy.badge')}</span>
                {/if}
                {#if bestMoves != null}
                    <span class="best-moves">{bestMoves}m</span>
                {/if}
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
        width: 70px; height: 80px;
        font: var(--font-button);
        border-radius: 4px;
        border: 2px solid var(--btn-border);
        cursor: pointer;
        position: relative;
        transition: background 0.15s;
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        gap: 2px; padding: 4px 0;
    }
    .level-btn.unlocked {
        background: var(--btn-default);
        color: var(--text-primary);
    }
    .level-btn.unlocked:hover { background: var(--btn-hover); }
    .level-btn.completed { border-color: var(--grid-goal); }
    .level-btn.skipped { border-color: #776633; }
    .skipped-badge {
        font-size: 8px;
        letter-spacing: 0.5px;
        color: #bbaa77;
        border: 1px solid #776633;
        border-radius: 2px;
        padding: 1px 4px;
    }
    .level-btn.locked {
        background: #111122;
        color: #555566;
        border-color: #333344;
        cursor: default;
    }
    .level-num { font-size: 18px; font-weight: bold; }
    .star-row { display: flex; gap: 1px; }
    .star-sm { font-size: 10px; color: #333; }
    .star-sm.filled { color: #ffdd44; }
    .best-moves { font-size: 9px; color: var(--text-secondary); }
</style>
