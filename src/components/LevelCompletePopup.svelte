<script>
    import { getText } from '../lib/localization.js';
    let { stars = 0, moves = 0, parMoves = 0, onnext } = $props();
</script>

<div class="level-complete-overlay">
    <div class="level-complete-card">
        <h2>{getText('levelComplete') || 'Level Complete!'}</h2>
        <div class="stars-row">
            {#each [1, 2, 3] as i}
                <span class="star" class:filled={i <= stars}
                      style="animation-delay: {i * 0.15}s">&#9733;</span>
            {/each}
        </div>
        <p class="move-count">{getText('moves')}: {moves} / Par: {parMoves}</p>
        <button class="next-btn" onclick={onnext}>
            {getText('continue') || 'Continue'}
        </button>
    </div>
</div>

<style>
    .level-complete-overlay {
        position: absolute; inset: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex; justify-content: center; align-items: center;
        z-index: 100;
    }
    .level-complete-card {
        background: var(--bg-panel, #1a1a2e);
        border: 2px solid var(--grid-goal);
        border-radius: 8px;
        padding: 24px 32px;
        text-align: center;
        animation: pop-in 0.3s ease-out;
    }
    @keyframes pop-in {
        0% { transform: scale(0.8); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
    }
    .level-complete-card h2 {
        font: var(--font-title);
        color: var(--grid-goal);
        margin: 0 0 12px;
    }
    .stars-row {
        display: flex; justify-content: center; gap: 8px;
        margin-bottom: 12px;
    }
    .star {
        font-size: 32px;
        color: #333;
        animation: star-pop 0.3s ease-out both;
    }
    .star.filled { color: #ffdd44; }
    @keyframes star-pop {
        0% { transform: scale(0); opacity: 0; }
        60% { transform: scale(1.3); }
        100% { transform: scale(1); opacity: 1; }
    }
    .move-count {
        font: var(--font-body);
        color: var(--text-secondary);
        margin-bottom: 16px;
    }
    .next-btn {
        font: var(--font-button);
        background: var(--btn-default);
        color: var(--text-primary);
        border: 2px solid var(--btn-border);
        border-radius: 4px;
        padding: 8px 24px;
        cursor: pointer;
    }
    .next-btn:hover { background: var(--btn-hover); }
</style>
