<script>
    let { guard, cellSize = 50 } = $props();
    let top = $derived(guard.row * cellSize + cellSize / 2);
    let left = $derived(guard.col * cellSize + cellSize / 2);
    let size = $derived(Math.floor(cellSize / 2));
    let rotation = $derived(guard.direction * 90);
    let hasDirection = $derived(guard.type === 'rotating' || guard.type === 'patrolling');
</script>

<div
    class="guard {guard.type}"
    class:off={guard.type === 'blinking' && !guard.isOn}
    style="top: {top}px; left: {left}px; width: {size}px; height: {size}px;"
>
    {#if hasDirection}
        <div class="direction-indicator" style="transform: rotate({rotation}deg);"></div>
    {/if}
</div>

<style>
    .guard {
        position: absolute;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        transition: top 100ms linear, left 100ms linear;
        z-index: 5;
        pointer-events: none;
    }
    .guard.static { background: var(--guard-static); }
    .guard.rotating { background: var(--guard-rotating); }
    .guard.blinking { background: var(--guard-blinking); }
    .guard.blinking.off { background: var(--guard-blinking-off); }
    .guard.patrolling { background: var(--guard-patrolling); }
    .guard.mirror { background: var(--guard-mirror); border-radius: 4px; transform: translate(-50%, -50%) rotate(45deg); }

    .direction-indicator {
        position: absolute;
        top: 0;
        left: 50%;
        width: 2px;
        height: 50%;
        background: white;
        transform-origin: bottom center;
        translate: -50% 0;
    }
</style>
