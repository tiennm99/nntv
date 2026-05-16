<script>
    import { onDestroy } from 'svelte';
    import { GENERATED_CHARACTERS } from '../lib/generated-assets.js';
    let { row = 0, col = 0, cellSize = 50, shake = false } = $props();
    let top = $derived(row * cellSize + cellSize / 2);
    let left = $derived(col * cellSize + cellSize / 2);
    let size = $derived(Math.floor(cellSize * 0.9));

    let moving = $state(false);
    let facing = $state('right');
    let lastRow = $state(null);
    let lastCol = $state(null);
    let moveTimer;

    $effect(() => {
        if (lastRow === null || lastCol === null) {
            lastRow = row;
            lastCol = col;
            return;
        }
        if (row === lastRow && col === lastCol) return;
        if (col < lastCol) facing = 'left';
        else if (col > lastCol) facing = 'right';
        moving = true;
        clearTimeout(moveTimer);
        moveTimer = setTimeout(() => moving = false, 180);
        lastRow = row;
        lastCol = col;
    });

    onDestroy(() => clearTimeout(moveTimer));
</script>

<div
    class="player"
    class:shake
    class:moving
    class:face-left={facing === 'left'}
    style="top: {top}px; left: {left}px; width: {size}px; height: {size}px;"
>
    <div class="sprite-motion">
        <img class="sprite-image" src={GENERATED_CHARACTERS.player} alt="" draggable="false" />
    </div>
</div>

<style>
    .player {
        position: absolute;
        transform: translate(-50%, -50%);
        transition: top 100ms linear, left 100ms linear;
        z-index: 10;
        pointer-events: none;
    }
    .sprite-motion {
        width: 100%;
        height: 100%;
        transform-origin: 50% 82%;
        animation: player-idle 1.5s steps(2, end) infinite;
    }
    .sprite-image {
        width: 100%;
        height: 100%;
        object-fit: contain;
        image-rendering: pixelated;
        filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.8));
    }
    .player.face-left .sprite-image {
        transform: scaleX(-1);
    }
    .player.moving .sprite-motion {
        animation: player-hop 180ms steps(3, end);
    }
    .player.shake {
        animation: player-shake 0.3s ease-out;
    }
    @keyframes player-idle {
        0%, 100% { transform: translateY(0) scaleY(1); }
        50% { transform: translateY(-1px) scaleY(1.03); }
    }
    @keyframes player-hop {
        0%, 100% { transform: translateY(0) scaleY(1); }
        40% { transform: translateY(-7px) scaleY(1.04); }
        70% { transform: translateY(1px) scaleY(0.96); }
    }
    @keyframes player-shake {
        0%, 100% { translate: 0 0; }
        20% { translate: -4px 0; }
        40% { translate: 4px 0; }
        60% { translate: -3px 0; }
        80% { translate: 2px 0; }
    }
    @media (prefers-reduced-motion: reduce) {
        .player,
        .sprite-motion {
            transition: none;
            animation: none !important;
        }
    }
</style>
