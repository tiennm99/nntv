<script>
    import Pixel from '../lib/pixel/Pixel.svelte';
    import { GUARD_SPRITES } from '../lib/pixel/art-characters.js';

    let { guard, cellSize = 50 } = $props();
    let top = $derived(guard.row * cellSize + cellSize / 2);
    let left = $derived(guard.col * cellSize + cellSize / 2);
    let size = $derived(Math.floor(cellSize * 0.95));
    let rotation = $derived(guard.direction * 90);
    let hasDirection = $derived(
        guard.type === 'rotating' || guard.type === 'patrolling' || guard.type === 'chaser'
    );
    let sprite = $derived(GUARD_SPRITES[guard.type]);
    let activePal = $derived(
        guard.type === 'blinking' && !guard.isOn ? sprite.palOff : sprite.pal
    );
</script>

<div
    class="guard {guard.type}"
    class:off={guard.type === 'blinking' && !guard.isOn}
    class:alert={guard.type === 'chaser' && guard.isChasing}
    style="top: {top}px; left: {left}px; width: {size}px; height: {size}px;"
>
    {#if sprite}
        <Pixel art={sprite.art} palette={activePal} width={size} height={size} />
    {/if}
    {#if hasDirection}
        <div class="direction-indicator" style="transform: rotate({rotation}deg);"></div>
    {/if}
</div>

<style>
    .guard {
        position: absolute;
        transform: translate(-50%, -50%);
        transition: top 100ms linear, left 100ms linear;
        z-index: 5;
        pointer-events: none;
    }
    .guard.alert {
        filter: drop-shadow(0 0 6px #ff2200);
    }
    .guard.off {
        opacity: 0.85;
    }

    .direction-indicator {
        position: absolute;
        top: 6%;
        left: 50%;
        width: 3px;
        height: 40%;
        background: var(--cream, #fff4d6);
        box-shadow: 0 0 3px rgba(0, 0, 0, 0.8);
        transform-origin: bottom center;
        translate: -50% 0;
    }
</style>
