<script>
    // StonesCounter — HUD pill showing remaining throwable stones.
    // Only mounted when level.stones > 0.
    import { getText } from '../lib/localization.js';
    import { GENERATED_TILES } from '../lib/generated-assets.js';

    let { stonesLeft = 0 } = $props();

    let label = $derived(`${getText('mechanics.stones.label')}: ${stonesLeft}`);
</script>

<div class="stones-counter" aria-label={label}>
    <span class="stone-icon" aria-hidden="true">
        <img src={GENERATED_TILES.stone} alt="" draggable="false" />
    </span>
    <span class="stone-times" aria-hidden="true">×</span>
    <span class="stone-count">{stonesLeft}</span>
</div>

<style>
    .stones-counter {
        display: flex;
        align-items: center;
        gap: 4px;
        background: rgba(0, 0, 0, 0.4);
        border: 1px solid rgba(180, 130, 80, 0.5);
        border-radius: 12px;
        padding: 3px 10px;
        font: var(--font-ui);
        color: var(--text-primary);
        user-select: none;
    }
    .stone-icon {
        display: flex;
        align-items: center;
        line-height: 0;
    }
    .stone-icon img {
        width: 22px;
        height: 22px;
        object-fit: contain;
        image-rendering: pixelated;
    }
    .stone-times { color: var(--text-secondary); font-size: 0.75em; }
    .stone-count { font-weight: bold; min-width: 1ch; text-align: center; }
</style>
