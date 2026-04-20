<script>
    import Pixel from '../lib/pixel/Pixel.svelte';
    import { RABBIT_ART, RABBIT_PAL } from '../lib/pixel/art-characters.js';
    let { row = 0, col = 0, cellSize = 50, shake = false } = $props();
    let top = $derived(row * cellSize + cellSize / 2);
    let left = $derived(col * cellSize + cellSize / 2);
    let size = $derived(Math.floor(cellSize * 0.9));
</script>

<div
    class="player"
    class:shake
    style="top: {top}px; left: {left}px; width: {size}px; height: {size}px;"
>
    <Pixel art={RABBIT_ART} palette={RABBIT_PAL} width={size} height={size} />
</div>

<style>
    .player {
        position: absolute;
        transform: translate(-50%, -50%);
        transition: top 100ms linear, left 100ms linear;
        z-index: 10;
        pointer-events: none;
    }
    .player.shake {
        animation: player-shake 0.3s ease-out;
    }
    @keyframes player-shake {
        0%, 100% { translate: 0 0; }
        20% { translate: -4px 0; }
        40% { translate: 4px 0; }
        60% { translate: -3px 0; }
        80% { translate: 2px 0; }
    }
</style>
