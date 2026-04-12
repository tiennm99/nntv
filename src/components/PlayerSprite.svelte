<script>
    let { row = 0, col = 0, cellSize = 50 } = $props();
    let top = $derived(row * cellSize + cellSize / 2);
    let left = $derived(col * cellSize + cellSize / 2);
    let size = $derived(Math.floor(cellSize / 1.5));
</script>

<div
    class="player"
    style="top: {top}px; left: {left}px; width: {size}px; height: {size}px;"
></div>

<style>
    .player {
        position: absolute;
        background: var(--player-color);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        transition: top 100ms linear, left 100ms linear;
        z-index: 10;
        pointer-events: none;
    }
</style>
