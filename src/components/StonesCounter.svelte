<script>
    // StonesCounter — HUD pill showing remaining throwable stones.
    // Only mounted when level.stones > 0.
    // Uses SVG pixel-art stone icon instead of emoji for consistent rendering.
    import { getText } from '../lib/localization.js';
    import Pixel from '../lib/pixel/Pixel.svelte';
    import { ICON_STONE, ICON_STONE_PAL } from '../lib/pixel/art-tiles.js';

    let { stonesLeft = 0 } = $props();

    let label = $derived(`${getText('mechanics.stones.label')}: ${stonesLeft}`);
</script>

<div class="stones-counter" aria-label={label}>
    <span class="stone-icon" aria-hidden="true">
        <Pixel art={ICON_STONE} palette={ICON_STONE_PAL} scale={1.5} />
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
    .stone-times { color: var(--text-secondary); font-size: 0.75em; }
    .stone-count { font-weight: bold; min-width: 1ch; text-align: center; }
</style>
